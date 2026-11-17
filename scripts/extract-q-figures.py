#!/usr/bin/env python3
"""Extract per-question stems, options, passages, tables, and tight figure crops.

Reads the memory-based PDFs (not the glued JSON text) so each question keeps only
its own (a)–(e) options, Directions passages stay free of neighbouring questions,
and a PNG is written only for a real chart/diagram bbox.

Writes:
  frontend/public/q-figures/<paper-slug>/dir-<from>-<to>.png
  frontend/src/data/qFigureMap.json
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[2]
ATT = Path.home() / (
    ".cursor/projects/Users-yashchauhan-My-mac-yash-persnol-rrb-preper/"
    "attachments/d8ea67b5-73fd-4a57-a7db-611e160c6cf4"
)
BANK = ATT / "ibps_rrb_2025_question_bank.json"
OUT_IMG = ROOT / "frontend/public/q-figures"
OUT_MAP = ROOT / "frontend/src/data/qFigureMap.json"

PDF_ALIASES = {
    "IBPS-RRB-PO-Pre-22 Nov 2025(1).pdf": "IBPS-RRB-PO-Pre-2025-Memory-Based-Paper-Based-on-22nd-November-1st-Shift-1.pdf",
    "IBPS-RRB-PO-Pre - 22 Nov 2025 ( 2)(1).pdf": "IBPS-RRB-PO-Pre-2025-Memory-Based-Paper-Based-on-22nd-November-2nd-Shift.pdf",
}

DIR_RE = re.compile(
    r"^Directions?\s*\(\s*(?:Q\.?\s*)?(\d+)\s*[-–]\s*(\d+)\s*\)\s*:?\s*(.*)$",
    re.I,
)
Q_RE = re.compile(r"^Q\s*\.?\s*(\d+)\s*[\.:]\s*(.*)$", re.I)
OPT_RE = re.compile(r"^\(([a-e])\)\s*(.*)$", re.I)
STOP_RE = re.compile(r"^(?:\d+\s+)?(?:SOLUTIONS?\b|S\d+\.\s*Ans)", re.I)
SENT_RE = re.compile(
    r"\b(the|following|given|answer|questions|study|read|carefully|shows|table|graph|chart|information)\b",
    re.I,
)
LABEL_BAN = re.compile(
    r"^(?:Q\d+\.|Directions?\b|\([a-e]\))|\b(questions|carefully|answer the|study the|read the)\b",
    re.I,
)


def paper_key(paper: dict) -> str:
    exam = paper["exam"].replace("IBPS RRB ", "").replace(" ", "")
    return f"{exam}_{paper['date']}_{paper['shift'].replace(' ', '')}"


def slugify(pk: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", pk.lower()).strip("-")


def resolve_pdf(source_file: str) -> Path | None:
    name = PDF_ALIASES.get(source_file, source_file)
    p = ATT / name
    if p.exists():
        return p
    want = re.sub(r"[\s_\-]+", "", name.lower())
    for f in ATT.glob("*.pdf"):
        if re.sub(r"[\s_\-]+", "", f.name.lower()) == want:
            return f
    return None


def noise_xrefs(doc) -> set[int]:
    """Logos, footers, watermarks, and the repeating Test Prime ad."""
    counts: dict[int, int] = defaultdict(int)
    digests: dict[str, int] = defaultdict(int)
    digest_of: dict[int, str] = {}
    for page in doc:
        seen = set()
        for im in page.get_image_info(xrefs=True):
            xref = im.get("xref") or 0
            if not xref or xref in seen:
                continue
            seen.add(xref)
            counts[xref] += 1
            digest = im.get("digest") or ""
            if digest:
                digest_of[xref] = digest
                digests[digest] += 1
    skip = {x for x, n in counts.items() if n >= 3}
    for xref, digest in digest_of.items():
        if digests.get(digest, 0) >= 3:
            skip.add(xref)
    return skip


def is_ad_image(im, page_width: float) -> bool:
    bb = im["bbox"]
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    if w < 140 or h < 140 or w > 230 or h > 230:
        return False
    if abs(w - h) > 40:
        return False
    return bb[0] > page_width * 0.52


class Line:
    def __init__(self, page, col, x0, y0, x1, y1, text, words):
        self.page = page
        self.col = col
        self.x0 = x0
        self.y0 = y0
        self.x1 = x1
        self.y1 = y1
        self.text = text
        self.words = words

    def key(self):
        return (self.page, self.col, self.y0, self.x0)


def is_two_column(words) -> bool:
    """Two-column pages keep each line on one side of a gutter.

    A single-column line runs from the left margin across the page. Chart
    labels and legends must not be mistaken for a second column.
    """
    ordered = sorted(words, key=lambda w: (w[1], w[0]))
    rows: list[list] = []
    for w in ordered:
        if rows and abs(w[1] - rows[-1][0][1]) <= 2.8:
            rows[-1].append(w)
        else:
            rows.append([w])
    left = right = crossing = 0
    for row in rows:
        row.sort(key=lambda w: w[0])
        x0, x1 = row[0][0], row[-1][2]
        gutter = False
        for a, b in zip(row, row[1:]):
            if a[2] < 310 and b[0] > 280 and b[0] - a[2] > 14:
                gutter = True
                break
        has_left = x0 < 170
        has_right = any(w[0] > 290 for w in row)
        if gutter and has_left and has_right:
            left += 1
            right += 1
        elif x0 < 120 and x1 > 430 and not gutter:
            crossing += 1
        elif x1 < 305 and x0 < 170:
            left += 1
        elif x0 > 290:
            right += 1
    return left >= 6 and right >= 6 and left + right > crossing * 3


def page_lines(page, page_index: int) -> list[Line]:
    words = [
        w
        for w in page.get_text("words")
        if 88 <= w[1] <= page.rect.height - 52 and w[4].strip()
    ]
    if not words:
        return []
    two = is_two_column(words)
    split = 300.0

    def col_of(x):
        return 1 if two and x >= split else 0

    words.sort(key=lambda w: (col_of(w[0]), w[1], w[0]))
    rows: list[list] = []
    for w in words:
        c = col_of(w[0])
        if rows:
            r = rows[-1]
            if r[0][0] == c and abs(w[1] - r[0][1][1]) <= 2.8:
                r.append((c, w))
                continue
        rows.append([(c, w)])

    lines = []
    for row in rows:
        ws = [t[1] for t in row]
        c = row[0][0]
        text = " ".join(w[4] for w in ws)
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            continue
        lines.append(
            Line(
                page_index,
                c,
                min(w[0] for w in ws),
                min(w[1] for w in ws),
                max(w[2] for w in ws),
                max(w[3] for w in ws),
                text,
                ws,
            )
        )
    lines.sort(key=lambda ln: ln.key())
    return lines


def collect_lines(doc) -> list[Line]:
    out: list[Line] = []
    for i, page in enumerate(doc):
        lines = page_lines(page, i)
        if any(STOP_RE.match(ln.text) for ln in lines[:8]) or any(
            STOP_RE.match(ln.text) for ln in lines
        ):
            # Keep questions that appear above the solutions banner on this page.
            kept = []
            for ln in lines:
                if STOP_RE.match(ln.text):
                    break
                kept.append(ln)
            out.extend(kept)
            break
        out.extend(lines)
    return out


def is_sentence(text: str) -> bool:
    words = text.split()
    if len(text) > 78 or len(words) >= 10:
        return True
    return len(words) >= 6 and bool(SENT_RE.search(text))


def is_label_text(text: str) -> bool:
    text = text.strip()
    if not text or len(text) > 48:
        return False
    if is_sentence(text) or LABEL_BAN.search(text):
        return False
    return True


def join_prose(parts: list[str]) -> str:
    buf = ""
    blocks: list[str] = []

    def flush():
        nonlocal buf
        if buf.strip():
            blocks.append(buf.strip())
        buf = ""

    for raw in parts:
        t = raw.strip()
        if not t:
            continue
        if not buf:
            buf = t
            continue
        new_sentence = bool(re.match(r"^[“\"']|^In a |^The |^Study |^Read |^Find |^If ", t))
        if new_sentence or buf.endswith("."):
            flush()
            buf = t
        else:
            buf += " " + t
    flush()
    text = "\n".join(blocks)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_options(lines: list[Line]) -> tuple[list[dict], list[Line]]:
    """Pull a single a–e block off the front of lines. Remainder is unused body."""
    opts: list[dict] = []
    seen = set()
    i = 0
    # skip leading non-options
    start = None
    for j, ln in enumerate(lines):
        if OPT_RE.match(ln.text):
            start = j
            break
        if Q_RE.match(ln.text) or DIR_RE.match(ln.text):
            return [], lines
    if start is None:
        return [], lines
    current = None
    i = start
    rest_from = len(lines)
    while i < len(lines):
        ln = lines[i]
        if Q_RE.match(ln.text) or DIR_RE.match(ln.text):
            rest_from = i
            break
        m = OPT_RE.match(ln.text)
        if m:
            label = m.group(1).lower()
            if label in seen:
                rest_from = i
                break
            seen.add(label)
            current = {"label": label, "text": m.group(2).strip()}
            opts.append(current)
            i += 1
            continue
        if current is not None and not is_sentence(ln.text) and len(ln.text) < 80:
            extra = ln.text.strip()
            current["text"] = (current["text"] + " " + extra).strip()
            i += 1
            continue
        rest_from = i
        break
    if len(opts) < 2:
        return [], lines
    for o in opts:
        o["text"] = re.sub(r"\s+", " ", o["text"]).strip()
    return opts, lines[:start] + lines[rest_from:]


def cells_of(ln: Line, gap: float = 9) -> list[str]:
    words = sorted(ln.words, key=lambda w: w[0])
    groups: list[list] = []
    for w in words:
        if groups and w[0] - groups[-1][-1][2] <= gap:
            groups[-1].append(w)
        else:
            groups.append([w])
    return [" ".join(w[4] for w in g).strip() for g in groups if g]


def table_from_lines(lines: list[Line]) -> tuple[dict | None, list[Line]]:
    """Return a structured table and the lines that are not part of it."""
    rows = []
    for ln in lines:
        if OPT_RE.match(ln.text) or Q_RE.match(ln.text) or DIR_RE.match(ln.text):
            continue
        cells = cells_of(ln)
        rows.append((ln, cells))
    best = None
    i = 0
    while i < len(rows):
        ln, cells = rows[i]
        if len(cells) < 2:
            i += 1
            continue
        j = i
        block = []
        while j < len(rows):
            ln2, cells2 = rows[j]
            if len(cells2) < 2:
                # header wrap: one short word under the previous row
                if (
                    block
                    and len(cells2) == 1
                    and not re.search(r"\d", cells2[0])
                    and len(cells2[0]) < 24
                    and ln2.page == block[-1][0].page
                    and ln2.col == block[-1][0].col
                    and ln2.y0 - block[-1][0].y1 < 22
                ):
                    block.append((ln2, cells2))
                    j += 1
                    continue
                break
            if block and (ln2.page != block[-1][0].page or ln2.col != block[-1][0].col):
                break
            if block and ln2.y0 - block[-1][0].y1 > 36:
                break
            block.append((ln2, cells2))
            j += 1
        dataish = sum(1 for _, c in block if any(re.search(r"\d", x) for x in c))
        if len(block) >= 3 and dataish >= 2 and (best is None or len(block) > len(best)):
            best = block
        i = j if j > i else i + 1
    if not best:
        return None, lines
    used = {id(ln) for ln, _ in best}
    # merge a one-cell wrap into the header
    header_cells = list(best[0][1])
    data_start = 1
    if len(best) > 1 and len(best[1][1]) == 1 and not re.search(r"\d", best[1][1][0]):
        # attach to the last header cell that sits above it
        header_cells[-1] = (header_cells[-1] + " " + best[1][1][0]).strip()
        data_start = 2
    width = max(len(header_cells), max(len(c) for _, c in best[data_start:]))
    while len(header_cells) < width:
        header_cells.append(f"Col {len(header_cells) + 1}")
    body = []
    for _, cells in best[data_start:]:
        if len(cells) == 1 and not re.search(r"\d", cells[0]):
            continue
        row = cells + [""] * (width - len(cells))
        body.append(row[:width])
    if len(body) < 2:
        return None, lines
    table = {"columns": header_cells[:width], "rows": body}
    return table, [ln for ln in lines if id(ln) not in used]


def stem_from(lines: list[Line]) -> str:
    parts = []
    for ln in lines:
        if OPT_RE.match(ln.text) or DIR_RE.match(ln.text) or Q_RE.match(ln.text):
            break
        parts.append(ln.text)
    text = " ".join(parts)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\s+(Statements:|Conclusions:)", r"\n\1", text)
    text = re.sub(r"\s+((?:I{1,3}|IV|V|VI)\.)", r"\n\1", text)
    return text.strip()


def parse_stream(lines: list[Line]):
    """Questions and directions blocks in reading order."""
    questions: dict[int, dict] = {}
    directions: list[dict] = []
    shared: list[dict] | None = None
    shared_until = None
    i = 0
    n = len(lines)
    while i < n:
        ln = lines[i]
        dm = DIR_RE.match(ln.text)
        if dm:
            a, b = int(dm.group(1)), int(dm.group(2))
            if b < a or b - a > 20:
                i += 1
                continue
            rest = dm.group(3).strip()
            body: list[Line] = []
            if rest:
                body.append(Line(ln.page, ln.col, ln.x0, ln.y0, ln.x1, ln.y1, rest, ln.words))
            i += 1
            while i < n:
                nxt = lines[i]
                if DIR_RE.match(nxt.text):
                    break
                qm = Q_RE.match(nxt.text)
                if qm and int(qm.group(1)) >= a:
                    break
                body.append(nxt)
                i += 1
            opts, after_opts = parse_options(body)
            prose_lines = after_opts if opts else body
            # options only count as shared when they are a full set living in the directions
            if opts and len({o["label"] for o in opts}) >= 4:
                shared = opts
                shared_until = b
                prose_lines = [p for p in prose_lines if not OPT_RE.match(p.text)]
            else:
                prose_lines = body
                opts = []
            directions.append(
                {
                    "from": a,
                    "to": b,
                    "header": ln,
                    "body": prose_lines,
                    "shared_options": opts,
                }
            )
            continue
        qm = Q_RE.match(ln.text)
        if qm:
            qn = int(qm.group(1))
            first = qm.group(2).strip()
            chunk = []
            if first:
                chunk.append(Line(ln.page, ln.col, ln.x0, ln.y0, ln.x1, ln.y1, first, ln.words))
            i += 1
            while i < n and not Q_RE.match(lines[i].text) and not DIR_RE.match(lines[i].text):
                chunk.append(lines[i])
                i += 1
            opts, _ = parse_options(chunk)
            stem_lines = []
            for c in chunk:
                if OPT_RE.match(c.text):
                    break
                stem_lines.append(c)
            stem = stem_from(stem_lines)
            if not opts and shared and shared_until and qn <= shared_until:
                opts = shared
            if stem or opts:
                questions[qn] = {"stem": stem, "options": opts, "anchor": ln}
            continue
        i += 1
    return questions, directions


def image_boxes(page, skip: set[int]) -> list[fitz.Rect]:
    boxes = []
    for im in page.get_image_info(xrefs=True):
        xref = im.get("xref") or 0
        if xref in skip or is_ad_image(im, page.rect.width):
            continue
        bb = im["bbox"]
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        if w < 18 or h < 18:
            continue
        if bb[1] < 88 or bb[3] > page.rect.height - 48:
            continue
        boxes.append(fitz.Rect(bb))
    return boxes


def cluster_rects(rects: list[fitz.Rect], gap: float = 28) -> list[fitz.Rect]:
    if not rects:
        return []
    parent = list(range(len(rects)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    def near(a, b):
        return not (a.x1 + gap < b.x0 or b.x1 + gap < a.x0 or a.y1 + gap < b.y0 or b.y1 + gap < a.y0)

    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            if near(rects[i], rects[j]):
                parent[find(i)] = find(j)
    groups: dict[int, list[fitz.Rect]] = defaultdict(list)
    for i, r in enumerate(rects):
        groups[find(i)].append(r)
    out = []
    for rs in groups.values():
        area = sum(r.get_area() for r in rs)
        big = max(r.get_area() for r in rs)
        if len(rs) >= 4 and area > 5000:
            out.append(fitz.Rect(rs[0]) if False else _union(rs))
        elif big > 14000 and max(r.width for r in rs) > 120 and max(r.height for r in rs) > 70:
            out.append(_union(rs))
    return out


def _union(rs: list[fitz.Rect]) -> fitz.Rect:
    u = fitz.Rect(rs[0])
    for r in rs[1:]:
        u.include_rect(r)
    return u


def vector_frames(page) -> list[fitz.Rect]:
    frames = []
    drawings = page.get_drawings()
    for d in drawings:
        r = d["rect"]
        if r.width < 120 or r.height < 80:
            continue
        if r.width > page.rect.width * 0.9 and r.height > page.rect.height * 0.5:
            continue
        if r.y0 < 88 or r.y1 > page.rect.height - 48:
            continue
        items = d["items"]
        if len(items) == 1 and items[0][0] == "re" and d.get("color") and not d.get("fill"):
            frames.append(fitz.Rect(r))
    # also a frame that merely contains a long polyline (line charts)
    chosen = []
    seen = set()
    for f in frames:
        key = (round(f.x0), round(f.y0), round(f.x1), round(f.y1))
        if key in seen:
            continue
        bars = 0
        lines = 0
        for d in drawings:
            for it in d["items"]:
                if it[0] == "re" and d.get("fill"):
                    rr = it[1]
                    if not hasattr(rr, "x0"):
                        continue
                    cx, cy = (rr.x0 + rr.x1) / 2, (rr.y0 + rr.y1) / 2
                    if f.x0 - 4 <= cx <= f.x1 + 4 and f.y0 <= cy <= f.y1 and 3 <= rr.width <= 36 and rr.height > 8:
                        bars += 1
                elif it[0] == "l":
                    p1 = it[1]
                    if hasattr(p1, "x") and f.x0 <= p1.x <= f.x1 and f.y0 <= p1.y <= f.y1:
                        lines += 1
        if bars >= 3 or lines >= 8:
            seen.add(key)
            chosen.append(f)
    return chosen


def between(rect: fitz.Rect, page_index: int, header: Line, question: Line | None) -> bool:
    cx = (rect.x0 + rect.x1) / 2
    col = 1 if cx >= 300 else 0
    # single-column pages use col 0 for every line; a wide chart stays col 0
    if header.col == 0 and (question is None or question.col == 0) and rect.width > 280:
        col = 0
    y = rect.y0
    after = (page_index, col, y) > (header.page, header.col, header.y1 - 2)
    if not after:
        return False
    if question is None:
        return page_index == header.page
    return (page_index, col, rect.y0) < (question.page, question.col, question.y0 - 1)


def expand_clip(page, rect: fitz.Rect, limit_top: float, limit_bot: float) -> fitz.Rect:
    clip = fitz.Rect(rect)
    changed = True
    guard = 0
    while changed and guard < 6:
        guard += 1
        changed = False
        d = page.get_text("dict")
        for b in d["blocks"]:
            if b.get("type") != 0:
                continue
            for ln in b["lines"]:
                t = "".join(s["text"] for s in ln["spans"]).strip()
                if not is_label_text(t):
                    continue
                bb = fitz.Rect(ln["bbox"])
                if bb.y0 < limit_top - 1 or bb.y1 > limit_bot + 1:
                    continue
                gap_x = 0 if not (clip.x1 < bb.x0 or bb.x1 < clip.x0) else min(abs(clip.x0 - bb.x1), abs(bb.x0 - clip.x1))
                gap_y = 0 if not (clip.y1 < bb.y0 or bb.y1 < clip.y0) else min(abs(clip.y0 - bb.y1), abs(bb.y0 - clip.y1))
                if gap_x <= 26 and gap_y <= 28 and (gap_x > 0 or gap_y > 0 or clip.intersects(bb)):
                    grown = fitz.Rect(clip)
                    grown.include_rect(bb)
                    if grown.get_area() > clip.get_area() + 4:
                        clip = grown
                        changed = True
    clip.x0 -= 4
    clip.y0 -= 4
    clip.x1 += 6
    clip.y1 += 4
    clip.intersect(page.rect)
    return clip


def shrink_away_from_questions(page, clip: fitz.Rect) -> fitz.Rect | None:
    d = page.get_text("dict")
    for b in d["blocks"]:
        if b.get("type") != 0:
            continue
        for ln in b["lines"]:
            t = "".join(s["text"] for s in ln["spans"]).strip()
            if not (
                re.match(r"^(?:Q\s*\.?\s*\d+\s*[\.:]|Directions?\b|\([a-e]\))", t, re.I)
                or is_sentence(t)
            ):
                continue
            bb = fitz.Rect(ln["bbox"])
            if not clip.intersects(bb):
                continue
            mid = (bb.y0 + bb.y1) / 2
            if mid < clip.y0 + clip.height * 0.35:
                clip.y0 = bb.y1 + 2
            elif mid > clip.y1 - clip.height * 0.35:
                clip.y1 = bb.y0 - 2
            else:
                return None
    if clip.height < 50 or clip.width < 70:
        return None
    return clip


def hide_noise(page, skip: set[int]):
    for im in page.get_image_info(xrefs=True):
        xref = im.get("xref") or 0
        if xref in skip or is_ad_image(im, page.rect.width):
            try:
                page.delete_image(xref)
            except Exception:
                pass


def trim_clip(page, clip: fitz.Rect) -> fitz.Rect:
    """Drop near-white margins so the crop is the ink of the chart."""
    pix = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), clip=clip, alpha=False)
    w, h, n = pix.width, pix.height, pix.n
    data = pix.samples
    if w < 8 or h < 8:
        return clip

    def ink(x, y):
        j = (y * w + x) * n
        return data[j] < 242 or data[j + 1] < 242 or data[j + 2] < 242

    top = 0
    while top < h - 1 and not any(ink(x, top) for x in range(0, w, 3)):
        top += 1
    bot = h - 1
    while bot > top and not any(ink(x, bot) for x in range(0, w, 3)):
        bot -= 1
    left = 0
    while left < w - 1 and not any(ink(left, y) for y in range(0, h, 3)):
        left += 1
    right = w - 1
    while right > left and not any(ink(right, y) for y in range(0, h, 3)):
        right -= 1
    if right - left < 20 or bot - top < 20:
        return clip
    sx = clip.width / w
    sy = clip.height / h
    pad = 3
    return fitz.Rect(
        clip.x0 + max(0, left - pad) * sx,
        clip.y0 + max(0, top - pad) * sy,
        clip.x0 + min(w, right + 1 + pad) * sx,
        clip.y0 + min(h, bot + 1 + pad) * sy,
    )


def mostly_blank(pix) -> bool:
    data = pix.samples
    dark = 0
    step = max(1, len(data) // 4000) * pix.n
    for i in range(0, len(data) - 2, step):
        if data[i] < 248 or data[i + 1] < 248 or data[i + 2] < 248:
            dark += 1
    return dark < 12


def _hex(rgb) -> str:
    return "#{:02x}{:02x}{:02x}".format(*(max(0, min(255, int(round(c * 255)))) for c in rgb[:3]))


def _axis_reader(page, frame: fitz.Rect, plot_left: float, plot_bottom: float):
    """Map a y coordinate to a snapped axis value using gridlines, not text centres."""
    labels = []
    for w in page.get_text("words"):
        if not re.fullmatch(r"\d{1,5}(?:\.\d+)?", w[4]):
            continue
        yc = (w[1] + w[3]) / 2
        if w[2] < plot_left + 36 and frame.y0 - 24 <= yc <= plot_bottom + 28:
            labels.append((yc, float(w[4])))
    labels.sort()
    if len(labels) < 3:
        return None
    grids = []
    for d in page.get_drawings():
        for it in d["items"]:
            if it[0] != "l":
                continue
            p1, p2 = it[1], it[2]
            if abs(p1.y - p2.y) > 0.9 or abs(p2.x - p1.x) < frame.width * 0.35:
                continue
            y = (p1.y + p2.y) / 2
            if frame.y0 - 20 <= y <= plot_bottom + 36:
                grids.append(round(y, 2))
    grids = sorted(set(grids))
    # Keep the major grid: the arithmetic progression that matches the label spacing.
    # Minor ticks sit a pixel or two away and pull values off the printed scale.
    ldy = sorted(labels[i + 1][0] - labels[i][0] for i in range(len(labels) - 1))
    dy = ldy[len(ldy) // 2] if ldy else 12
    majors = grids
    if grids and dy >= 4:
        anchor_y = labels[len(labels) // 2][0]
        anchor = min(grids, key=lambda g: abs(g - anchor_y))
        kept = [g for g in grids if abs((g - anchor) / dy - round((g - anchor) / dy)) < 0.22]
        if len(kept) >= 3:
            majors = sorted(kept)
    pairs = []
    used = set()
    for yc, val in labels:
        if majors:
            g = min(majors, key=lambda gy: abs(gy - yc))
            if abs(g - yc) <= max(6, dy * 0.45) and g not in used:
                pairs.append((g, val))
                used.add(g)
                continue
        pairs.append((yc, val))
    ys = [p[0] for p in pairs]
    vs = [p[1] for p in pairs]
    n = len(ys)
    mean_y = sum(ys) / n
    mean_v = sum(vs) / n
    var = sum((y - mean_y) ** 2 for y in ys) or 1.0
    slope = sum((ys[i] - mean_y) * (vs[i] - mean_v) for i in range(n)) / var
    intercept = mean_v - slope * mean_y
    diffs = sorted(abs(vs[i + 1] - vs[i]) for i in range(n - 1) if abs(vs[i + 1] - vs[i]) > 0.4)
    step = diffs[len(diffs) // 2] if diffs else 10
    # Snap onto the printed scale. step/4 keeps 1225 on a 100-grid and 84 on a 24-grid.
    quantum = step / 4 if step >= 16 else 1
    lo, hi = min(vs) - step * 0.2, max(vs) + step * 0.45

    def value_at(y: float):
        raw = intercept + slope * y
        if abs(slope) < 1e-9:
            return None
        snapped = round(raw / quantum) * quantum
        yerr = abs((snapped - intercept) / slope - y)
        if yerr > 1.8:
            return None
        if not lo <= snapped <= hi:
            return None
        return int(round(snapped))

    return value_at, step, min(vs), max(vs)


def extract_bars(page, frame: fitz.Rect) -> dict | None:
    bars = []
    for d in page.get_drawings():
        fill = d.get("fill")
        if not fill:
            continue
        if max(fill[:3]) - min(fill[:3]) < 0.1:
            continue
        for it in d["items"]:
            if it[0] != "re":
                continue
            r = it[1]
            if not hasattr(r, "x0"):
                continue
            cx, cy = (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2
            if not (frame.x0 - 2 <= cx <= frame.x1 + 2 and frame.y0 <= cy <= frame.y1 - 6):
                continue
            # Tall filled rectangles are bars. Line-chart markers are short and square.
            if not (3 <= r.width <= 28 and r.height >= 22 and r.height > r.width * 1.4):
                continue
            bars.append((fitz.Rect(r), tuple(round(c, 3) for c in fill[:3])))
    if len(bars) < 3:
        return None
    baseline = sorted(r.y1 for r, _ in bars)[len(bars) // 2]
    bars = [b for b in bars if abs(b[0].y1 - baseline) <= 4 and b[0].y0 < baseline - 6]
    if len(bars) < 3:
        return None
    bars.sort(key=lambda b: b[0].x0)
    groups: list[list] = []
    for r, c in bars:
        if not groups or r.x0 - groups[-1][-1][0].x1 > 16:
            groups.append([(r, c)])
        else:
            groups[-1].append((r, c))
    if len(groups) < 2:
        return None
    colors = []
    for _, c in bars:
        if c not in colors:
            colors.append(c)
    colors.sort(key=lambda c: min(r.x0 for r, cc in bars if cc == c))
    plot_left = min(r.x0 for r, _ in bars)
    axis = _axis_reader(page, frame, plot_left, baseline)
    if not axis:
        return None
    value_at, step, lo, hi = axis
    series_vals = []
    for color in colors:
        vals = []
        for g in groups:
            hit = [r for r, c in g if c == color]
            if len(hit) != 1:
                return None
            v = value_at(hit[0].y0)
            if v is None:
                return None
            vals.append(v)
        series_vals.append(vals)

    words = page.get_text("words")
    cat_words = []
    legend_words = []
    for w in words:
        if re.match(r"^(?:Q\d+\.|Directions?|\([a-e]\))", w[4], re.I):
            continue
        yc = (w[1] + w[3]) / 2
        xc = (w[0] + w[2]) / 2
        if not (frame.x0 - 4 <= xc <= frame.x1 + 4):
            continue
        if baseline - 2 <= yc <= frame.y1 + 2 and not re.fullmatch(r"\d+", w[4]):
            if yc < baseline + 22:
                cat_words.append(w)
            else:
                legend_words.append(w)
    cat_words.sort(key=lambda w: w[0])
    categories = [w[4] for w in cat_words]
    if len(categories) != len(groups):
        # one text line may have been split already; give up on names rather than mis-assign
        if len(categories) == 1 and len(categories[0].split()) == len(groups):
            categories = categories[0].split()
        else:
            return None
    legend_words.sort(key=lambda w: w[0])
    names = [w[4] for w in legend_words]
    if len(names) != len(colors):
        names = [f"Series {i + 1}" for i in range(len(colors))]
    return {
        "type": "bar",
        "categories": categories,
        "series": [
            {"name": names[i], "values": series_vals[i], "color": _hex(colors[i])}
            for i in range(len(colors))
        ],
    }


def extract_lines(page, frame: fitz.Rect) -> dict | None:
    """Rebuild a line chart whose points sit on a labelled axis."""
    series = []
    for d in page.get_drawings():
        col = d.get("color")
        if not col or max(col[:3]) - min(col[:3]) < 0.12:
            continue
        pts = []
        for it in d["items"]:
            if it[0] != "l":
                continue
            p1, p2 = it[1], it[2]
            if abs(p1.y - p2.y) < 0.8 and abs(p2.x - p1.x) > frame.width * 0.45:
                continue
            mx, my = (p1.x + p2.x) / 2, (p1.y + p2.y) / 2
            if not (frame.x0 - 6 <= mx <= frame.x1 + 6 and frame.y0 - 4 <= my <= frame.y1 + 4):
                continue
            if not pts:
                pts.append((p1.x, p1.y))
            pts.append((p2.x, p2.y))
        clean = []
        for x, y in pts:
            if not clean or abs(clean[-1][0] - x) > 6:
                clean.append((x, y))
        if len(clean) >= 3:
            series.append((tuple(round(c, 3) for c in col[:3]), clean))
    if not series or len(series) > 3:
        return None
    plot_left = min(p[0] for _, pts in series for p in pts)
    plot_bottom = max(p[1] for _, pts in series for p in pts)
    axis = _axis_reader(page, frame, plot_left - 30, plot_bottom + 8)
    if not axis:
        return None
    value_at, _step, _lo, _hi = axis
    words = page.get_text("words")
    built = []
    categories = None
    for color, pts in series:
        vals = []
        cats = []
        for x, y in pts:
            v = value_at(y)
            if v is None:
                return None
            vals.append(v)
            nearest = None
            best = 1e9
            for w in words:
                if re.fullmatch(r"\d+", w[4]) or len(w[4]) > 16:
                    continue
                yc = (w[1] + w[3]) / 2
                xc = (w[0] + w[2]) / 2
                if not (plot_bottom - 6 <= yc <= plot_bottom + 70):
                    continue
                dist = abs(xc - x)
                if dist < best:
                    best = dist
                    nearest = w[4]
            if nearest is None or best > 46:
                return None
            cats.append(nearest)
        if categories is None:
            categories = cats
        elif cats != categories:
            return None
        built.append((color, vals, pts[0][0]))
    built.sort(key=lambda s: s[2])
    legend = []
    for w in words:
        yc = (w[1] + w[3]) / 2
        if plot_bottom + 18 <= yc <= plot_bottom + 96 and frame.x0 - 10 <= w[0] <= frame.x1 + 8:
            if w[4] not in categories and not re.fullmatch(r"\d+", w[4]):
                legend.append(w)
    legend.sort(key=lambda w: ((w[1] + w[3]) / 2, w[0]))
    phrases: list[list] = []
    for w in legend:
        if phrases and w[0] - phrases[-1][-1][2] < 16 and abs(w[1] - phrases[-1][-1][1]) < 4:
            phrases[-1].append(w)
        else:
            phrases.append([w])
    names = [" ".join(w[4] for w in group) for group in phrases]
    if len(built) > 1 and len(names) < len(built):
        return None
    return {
        "type": "line",
        "categories": categories,
        "series": [
            {
                "name": names[i] if i < len(names) else "",
                "values": built[i][1],
                "color": _hex(built[i][0]),
            }
            for i in range(len(built))
        ],
    }


def plan_figure(doc, block, questions, skip) -> tuple[int | None, fitz.Rect | None, dict | None]:
    """Pick a tight chart rect. Does not mutate the page."""
    header: Line = block["header"]
    q = questions.get(block["from"])
    q_anchor = q["anchor"] if q else None
    last_page = q_anchor.page if q_anchor else header.page
    by_page: dict[int, list[fitz.Rect]] = defaultdict(list)
    for pi in range(header.page, min(last_page, header.page + 2) + 1):
        page = doc[pi]
        cands = cluster_rects(image_boxes(page, skip)) + vector_frames(page)
        for rect in cands:
            if between(rect, pi, header, q_anchor):
                by_page[pi].append(fitz.Rect(rect))
    if not by_page:
        return None, None, None
    figure_page, figure_rect = max(
        ((pi, _union(rs)) for pi, rs in by_page.items()),
        key=lambda item: item[1].get_area(),
    )
    page = doc[figure_page]
    limit_top = header.y1 if figure_page == header.page else 90
    limit_bot = q_anchor.y0 if q_anchor and figure_page == q_anchor.page else page.rect.height - 48
    chart = None
    for frame in vector_frames(page):
        if frame.intersects(figure_rect):
            chart = extract_bars(page, frame) or extract_lines(page, frame)
            if chart:
                figure_rect = fitz.Rect(frame)
            break
    clip = expand_clip(page, figure_rect, limit_top, limit_bot)
    clip = shrink_away_from_questions(page, clip)
    return figure_page, clip, chart


def render_clip(page, clip: fitz.Rect, out: Path) -> bool:
    clip = trim_clip(page, clip)
    pix = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), clip=clip, alpha=False)
    if pix.width < 80 or pix.height < 60 or mostly_blank(pix):
        return False
    out.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(out))
    return True


def looks_like_series(text: str) -> bool:
    if re.search(r"[&@#$*^!]|%\s+\S", text):
        return True
    tokens = text.split()
    shorts = sum(1 for t in tokens if len(t) <= 2)
    return len(tokens) >= 8 and shorts >= 6


def keep_prose(text: str) -> bool:
    if is_sentence(text) or looks_like_series(text) or len(text) >= 40:
        return True
    return bool(re.search(r"\b(coded|language|graph|chart|table|below|given|month|shops|students)\b", text, re.I))


def build_passage(block, table_lines_left: list[Line], clip: fitz.Rect | None = None, clip_page: int | None = None) -> str:
    prose = []
    for ln in table_lines_left:
        if OPT_RE.match(ln.text) or Q_RE.match(ln.text) or DIR_RE.match(ln.text):
            continue
        if clip is not None and ln.page == clip_page and clip.intersects(fitz.Rect(ln.x0 - 2, ln.y0 - 2, ln.x1 + 2, ln.y1 + 2)):
            continue
        # axis ticks and legend percents, not a series token inside a sentence
        if re.fullmatch(r"[\d.]+%?", ln.text):
            continue
        prose.append(ln.text)
    # drop tiny leftovers that are clearly axis ticks if a chart ate the figure
    text = join_prose(prose)
    text = re.sub(r"\bQ\d+\.\s*", "", text)
    text = re.sub(r"(?:\s*\([a-e]\)[^\n]*)+$", "", text, flags=re.I)
    text = re.sub(r"(?:\s+\d+(?:\.\d+)?%){2,}[\s\S]*$", "", text).strip()
    return text.strip()


def main() -> int:
    if not BANK.exists():
        print("Bank not found:", BANK, file=sys.stderr)
        return 1
    raw = json.loads(BANK.read_text())
    # drop previous crops (keep debug probe folders)
    if OUT_IMG.exists():
        for folder in OUT_IMG.iterdir():
            if folder.is_dir() and not folder.name.startswith("_"):
                for png in folder.glob("*.png"):
                    png.unlink()

    mapping: dict[str, dict] = {}
    stats = {"papers": 0, "questions": 0, "with_options": 0, "passages": 0, "figures": 0, "tables": 0, "charts": 0}

    for paper in raw["papers"]:
        pdf_path = resolve_pdf(paper.get("source_file") or "")
        if not pdf_path:
            print("SKIP missing pdf", paper.get("source_file"))
            continue
        stats["papers"] += 1
        pk = paper_key(paper)
        slug = slugify(pk)
        print(f"\n== {pk} ← {pdf_path.name}")
        doc = fitz.open(pdf_path)
        skip = noise_xrefs(doc)
        lines = collect_lines(doc)
        questions, directions = parse_stream(lines)
        print(f"   questions {len(questions)} directions {len(directions)} noise-images {len(skip)}")

        plans = []
        for block in directions:
            pi, clip, chart = plan_figure(doc, block, questions, skip)
            plans.append((block, pi, clip, chart))
        # Strip watermarks and ads once, then render every planned crop.
        for page in doc:
            hide_noise(page, skip)

        dir_by_q: dict[int, dict] = {}
        for block, pi, clip, chart in plans:
            table, prose_lines = table_from_lines(block["body"])
            # don't treat a chart's axis labels as a table: handled after figure search
            passage = build_passage(block, prose_lines if table else block["body"], clip, pi)
            if table:
                # if the "table" is really just a couple of header words, drop it
                if len(table["columns"]) < 2 or len(table["rows"]) < 2:
                    table = None
                    passage = build_passage(block, block["body"], clip, pi)
            figure = None
            if clip is not None and pi is not None and chart is None:
                out = OUT_IMG / slug / f"dir-{block['from']}-{block['to']}.png"
                if render_clip(doc[pi], clip, out):
                    figure = f"/q-figures/{slug}/{out.name}"
            if chart and table and not any(len(c) > 14 for c in table["columns"]):
                table = None
                passage = build_passage(block, block["body"], clip, pi)
            if figure:
                stats["figures"] += 1
                print(f"   figure Q{block['from']}-{block['to']}")
            if table:
                stats["tables"] += 1
                print(f"   table  Q{block['from']}-{block['to']} {len(table['rows'])}x{len(table['columns'])}")
            if chart:
                stats["charts"] += 1
                print(f"   chart  Q{block['from']}-{block['to']} {chart['categories']} {chart['series'][0]['name']}={chart['series'][0]['values']}")
            if passage:
                stats["passages"] += 1
            payload = {
                "passage": passage,
                "figure": figure,
                "table": table,
                "chart": chart,
                "range": [block["from"], block["to"]],
            }
            for qn in range(block["from"], block["to"] + 1):
                dir_by_q[qn] = payload

        for qn, q in questions.items():
            stats["questions"] += 1
            base = dir_by_q.get(qn, {"passage": "", "figure": None, "table": None, "chart": None, "range": None})
            opts = q["options"] or []
            if len(opts) >= 2:
                stats["with_options"] += 1
            mapping[f"{pk}|{qn}"] = {
                "passage": base["passage"],
                "figure": base["figure"],
                "table": base["table"],
                "chart": base["chart"],
                "range": base["range"],
                "paper": pk,
                "stem": q["stem"],
                "options": opts,
            }
        doc.close()

    OUT_MAP.parent.mkdir(parents=True, exist_ok=True)
    OUT_MAP.write_text(json.dumps(mapping, ensure_ascii=False, indent=2))
    print("\nWrote", OUT_MAP, "entries", len(mapping))
    print("stats", stats)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
