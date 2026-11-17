import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = path.join(
  process.env.HOME,
  '.cursor/projects/Users-yashchauhan-My-mac-yash-persnol-rrb-preper/attachments/d8ea67b5-73fd-4a57-a7db-611e160c6cf4/ibps_rrb_2025_question_bank.json',
);
const out = path.join(root, 'frontend/src/data/topicBank.json');
const figureMapPath = path.join(root, 'frontend/src/data/qFigureMap.json');

const raw = JSON.parse(fs.readFileSync(src, 'utf8'));
const figureMap = fs.existsSync(figureMapPath)
  ? JSON.parse(fs.readFileSync(figureMapPath, 'utf8'))
  : {};

function paperKey(paper) {
  const exam = String(paper.exam || '')
    .replace(/^IBPS RRB /i, '')
    .replace(/\s+/g, '');
  const shift = String(paper.shift || '').replace(/\s+/g, '');
  return `${exam}_${paper.date}_${shift}`;
}

function optionsClean(opts) {
  if (!Array.isArray(opts) || opts.length < 4 || opts.length > 5) return false;
  const labels = opts.map(o => String(o.label || '').toLowerCase());
  if (new Set(labels).size !== opts.length) return false;
  return opts.every(o => {
    const t = String(o.text || '').trim();
    if (!t || t.length > 120) return false;
    if (/Directions?\s*\(/i.test(t)) return false;
    if (/\bQ\d+\./i.test(t)) return false;
    if (/\n\s*\([a-e]\)/i.test(t)) return false;
    return true;
  });
}

function normalizeOptions(opts) {
  return (opts || [])
    .map(o => ({
      label: String(o.label || '').toLowerCase(),
      text: stripBleed(String(o.text || '')).replace(/\s+/g, ' ').trim(),
    }))
    .filter(o => o.label && o.text && o.text.length <= 160);
}

/** Prefer PDF-parsed stem/options/passage/figure from extract-q-figures.py */
function enrichFromPdf(paper, q) {
  const hit = figureMap[`${paperKey(paper)}|${q.qnum}`];
  if (!hit) return q;

  const pdfPassage = (hit.passage || '').trim();
  if (pdfPassage && pdfPassage.length >= 12) q.passage = pdfPassage;

  if (hit.figure) q.figure = hit.figure;
  if (hit.chart) q.chart = hit.chart;
  if (hit.table) q.table = hit.table;

  const pdfStem = clean(hit.stem || '').replace(/^Q\d+\.\s*/i, '');
  // Accept short stems when a stem/figure image carries the expression
  if (
    pdfStem &&
    !/\(a\)\s*.*\(b\)/i.test(pdfStem) &&
    (pdfStem.length >= 8 || (hit.figure && pdfStem.length >= 4))
  ) {
    q.stem = pdfStem;
    q.fromPdfStem = true;
  } else if ((!q.stem || /^Q?\d+\.?$/i.test(q.stem.trim())) && hit.figure) {
    q.stem = 'Solve the following.';
    q.fromPdfStem = true;
  }

  const pdfOpts = normalizeOptions(hit.options);
  if (optionsClean(pdfOpts)) {
    q.options = pdfOpts;
    q.fromPdfOpts = true;
  }

  return q;
}

/** Fix common source-bank mistags (DI under Ratio, seating under Blood Relation, etc.). */
function retagTopic(q) {
  const blob = `${q.passage || ''}\n${q.stem || ''}`;
  const section = (q.section || '').toLowerCase();
  const topic = q.topic || '';

  // —— Reasoning seating misfiled as Blood Relation / Reasoning Other ——
  if (
    /sit around a circular table|circular table|facing (?:the )?centre|facing inside/i.test(blob) &&
    /sit|sits|left|right|neighbour|neighbor/i.test(q.stem || '')
  ) {
    q.topic = 'Seating Arrangement – Circular';
    q.section = 'Reasoning Ability';
    q.retagged = true;
    return q;
  }
  if (
    /sit in a (?:straight )?row|linear row|row facing|straight line/i.test(blob) &&
    /sit|sits|left|right|end/i.test(q.stem || '')
  ) {
    q.topic = 'Seating Arrangement – Linear';
    q.section = 'Reasoning Ability';
    q.retagged = true;
    return q;
  }
  if (/square table|around a square|four corners of/i.test(blob)) {
    q.topic = 'Seating Arrangement – Square';
    q.section = 'Reasoning Ability';
    q.retagged = true;
    return q;
  }

  // —— DI misfiled as Ratio / Percentage / Arithmetic ——
  // Only count Directions chart figures (dir-*), not per-question stem crops (stems/qN.png)
  const diFigure = Boolean(q.figure && /\/dir-\d+-\d+\.png$/i.test(q.figure));
  const looksDi =
    Boolean(diFigure || q.chart || q.table) ||
    /\b(bar graph|line graph|pie chart|table given below|following table|read the (?:following )?(?:table|data|line graph|bar graph|pie))\b/i.test(
      blob,
    ) ||
    /\b(shows the (?:data|number|marks|profit|items|bags|males|students))\b/i.test(q.passage || '');

  if (!looksDi) return q;
  if (section.includes('reasoning')) return q;
  if (/syllogism|inequality|puzzle|seating|blood|coding|direction|alphanumeric|floor|box/i.test(topic)) {
    return q;
  }

  q.topic = 'Data Interpretation';
  if (!section.includes('quant')) q.section = 'Quantitative Aptitude';
  q.retaggedDi = true;
  return q;
}

const clean = s =>
  (s || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\s*\d+\s*$/g, '')
    .trim();

/** PDF extracts often glue Directions / Solutions dumps onto the last option. */
function stripBleed(text) {
  let t = text || '';
  const cuts = [
    /\n\s*\d*\s*\n?\s*Solutions?\b/i,
    /\n\s*SOLUTIONS\b/i,
    /\n\s*Directions\s*\(/i,
    /\n\s*Direction\s*:/i,
    // glued without newline: "493Directions (66-75):" / "PDirections (9-13):"
    /(?<=\S)Directions\s*\(/i,
    /(?<=\S)Solutions?\b/i,
  ];
  for (const re of cuts) {
    const i = t.search(re);
    if (i > 0) t = t.slice(0, i);
  }
  // "79.65\n\n 17\n Solutions..." already handled; also "None\n\n 1\nDirections"
  const ansThenDir = t.match(/^([\s\S]{1,80}?)\n\s*\d+\s*\n\s*Directions\s*\(/i);
  if (ansThenDir) t = ansThenDir[1];

  // Trailing answer-key dump after a short value: "184\n\n Solutions\nS1..."
  const shortThenS = t.match(/^([\s\S]{1,120}?)\n\s*S\d+\.\s*Ans/i);
  if (shortThenS && shortThenS[1].trim().length <= 80) t = shortThenS[1];

  return clean(t);
}

function splitDir(text) {
  const m = (text || '').match(/([\s\S]*?)\b(Directions\s*\([\s\S]*)$/i);
  if (!m) return { main: stripBleed(text), dir: null };
  let dir = m[2].split(/\n\s*(?:Sol\.|S\d+\.\s*Ans|Solutions?\b)/i)[0];
  dir = clean(dir);
  const main = stripBleed(m[1]);
  if (dir.length < 30) return { main: stripBleed(text), dir: null };
  return { main, dir };
}

function rangeOf(dir) {
  const m = dir.match(/Directions\s*\((?:Q\.?\s*)?(\d+)\s*[-–]\s*(\d+)/i);
  if (!m) return null;
  const from = Number(m[1]);
  const to = Number(m[2]);
  if (!from || !to || to < from || to - from > 20) return null;
  return { from, to };
}

function finalizeSolution(t) {
  t = clean(t);
  t = t.replace(/\n\s*Directions\s*\([\s\S]*$/i, '');
  t = t.replace(/\n\s*Solutions?\s*\([\s\S]*$/i, '');
  t = t.replace(/\n\s*Solutions?\s*:?\s*\n[\s\S]*$/i, '');
  t = t.replace(/\s*S\d+\.\s*Ans[\s\S]*$/i, '');
  t = clean(t);
  if (!t || t.length < 12) return '';
  if (/^Sol\.?\s*$/i.test(t) || /^Logic here is:?$/i.test(t)) return '';
  if (/S\d+\.\s*Ans|Solutions?\s*\(/i.test(t)) return '';
  if (/^Solutions?\b/i.test(t)) return '';
  if (t.length > 2500) return '';
  return t;
}

/** Keep only this question's solution; drop paper-wide answer keys. */
function cleanSolution(text, qnum) {
  let t = clean(text);
  if (!t || t === 'Logic here is:') return '';

  const keys = (t.match(/S\d+\.\s*Ans/gi) || []).length;
  const isDump = keys >= 2 || /Solutions?\s*\(/i.test(t) || /Solutions?\s*\n\s*S\d+/i.test(t);

  if (isDump || keys >= 1) {
    const re = new RegExp(
      `S${qnum}\\.\\s*Ans\\.?\\s*(?:\\(([a-e])\\))?\\s*(?:Sol\\.?)?\\s*([\\s\\S]*?)(?=\\n\\s*S\\d+\\.\\s*Ans|\\n\\s*Directions\\s*\\(|\\n\\s*Solutions?\\s*\\(|$)`,
      'i',
    );
    const hit = t.match(re);
    if (hit) {
      const body = finalizeSolution(hit[2] || '');
      if (body) return body;
    }
    // Keep usable text before the first answer-key / solutions dump
    t = t.split(/\s*S\d+\.\s*Ans/i)[0];
    t = t.split(/\n\s*Solutions?\s*\(/i)[0];
    t = t.split(/\n\s*Solutions?\s*:?\s*\n/i)[0];
  }

  return finalizeSolution(t);
}

function isDumpSolution(s) {
  if (!s) return true;
  const keys = (s.match(/S\d+\.\s*Ans/gi) || []).length;
  return keys >= 2 || /Solutions?\s*\(/i.test(s) || s.length > 2500;
}

const norm = s =>
  clean(s)
    .replace(/^Q\d+\.\s*/i, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const slug = s =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const items = [];
let strippedOpts = 0;

for (const paper of raw.papers) {
  const blocks = [];
  const cleaned = paper.questions.map(q => {
    const qSplit = splitDir(q.question_text);
    const options = (q.options || []).map(o => {
      const before = o.text || '';
      const s = splitDir(before);
      const text = stripBleed(s.main || before);
      if (before.length - text.length > 40) strippedOpts++;
      if (s.dir) {
        const range = rangeOf(s.dir);
        if (range && q.question_number < range.from && range.from - q.question_number <= 8) {
          blocks.push({ ...range, text: s.dir });
        }
      }
      return { label: (o.label || '').toLowerCase(), text };
    });
    if (qSplit.dir) {
      const range = rangeOf(qSplit.dir);
      if (range && q.question_number < range.from && range.from - q.question_number <= 8) {
        blocks.push({ ...range, text: qSplit.dir });
      }
    }
    return {
      section: q.section,
      topic: q.topic,
      stem: (qSplit.main || stripBleed(q.question_text)).replace(/^Q\d+\.\s*/i, ''),
      options: options.filter(o => o.text && o.text.length <= 200),
      answer: (q.answer?.option || '').toLowerCase(),
      solution: cleanSolution(q.explanation || q.solution || '', q.question_number),
      source: `${paper.exam.replace('IBPS RRB ', '')} · ${paper.date} · ${paper.shift}`,
      qnum: q.question_number,
      passage: '',
    };
  });

  for (const q of cleaned) {
    const hit = blocks
      .filter(b => q.qnum >= b.from && q.qnum <= b.to)
      .sort((a, b) => b.text.length - a.text.length)[0];
    if (hit && !q.passage) {
      q.passage = hit.text.replace(/^Directions?\s*\([^)]*\)\s*:?\s*/i, '').trim();
    }
    // Always re-clean options from JSON bank as fallback
    q.options = normalizeOptions(q.options);
    items.push(retagTopic(enrichFromPdf(paper, q)));
  }
}

const seen = new Map();
let dropped = 0;
let pdfOptWins = 0;
let diRetags = 0;
for (const q of items) {
  if (q.retaggedDi || q.retagged) diRetags++;
  if (q.fromPdfOpts) pdfOptWins++;

  // Prefer paper+qnum identity so we don't merge distinct questions with similar stems
  const key = `${q.source}::Q${q.qnum}`;
  if (!q.stem || q.options.length < 4 || !q.answer) {
    dropped++;
    continue;
  }
  if (!q.options.some(o => o.label === q.answer)) {
    dropped++;
    continue;
  }
  // Drop bleeding / duplicate-label option sets (unless PDF extract is already clean)
  if (!optionsClean(q.options)) {
    dropped++;
    continue;
  }

  const prev = seen.get(key);
  if (!prev) {
    seen.set(key, q);
    continue;
  }
  dropped++;
  const score = x =>
    (x.fromPdfOpts ? 8 : 0) +
    (x.fromPdfStem ? 4 : 0) +
    (optionsClean(x.options) ? 5 : 0) +
    (x.passage ? 3 : 0) +
    (x.figure || x.chart || x.table ? 3 : 0) +
    (x.solution && !isDumpSolution(x.solution) ? 2 : 0) +
    (x.options.length === 5 ? 1 : 0);
  if (score(q) > score(prev)) seen.set(key, q);
}

const byTopic = new Map();
for (const q of seen.values()) {
  const list = byTopic.get(q.topic) || [];
  list.push(q);
  byTopic.set(q.topic, list);
}

const topics = [...byTopic.entries()]
  .map(([topic, questions]) => {
    const section = questions[0].section;
    return {
      id: slug(topic),
      topic,
      section,
      questions: questions.map((q, i) => {
        const row = {
          id: String(i + 1),
          stem: q.stem,
          passage: q.passage || '',
          options: q.options,
          answer: q.answer,
          solution: q.solution || '',
          source: `${q.source} · Q${q.qnum}`,
        };
        if (q.figure) row.figure = q.figure;
        if (q.chart) row.chart = q.chart;
        if (q.table) row.table = q.table;
        return row;
      }),
    };
  })
  .sort((a, b) => a.section.localeCompare(b.section) || b.questions.length - a.questions.length);

const bank = {
  papers: raw.papers.length,
  topics: topics.length,
  questions: topics.reduce((n, t) => n + t.questions.length, 0),
  withSolution: topics.reduce((n, t) => n + t.questions.filter(q => q.solution).length, 0),
  sets: topics,
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(bank));

let bleedLeft = 0;
for (const t of topics) {
  for (const q of t.questions) {
    if (!optionsClean(q.options)) bleedLeft++;
  }
}

console.log({
  papers: bank.papers,
  topics: bank.topics,
  questions: bank.questions,
  withSolution: bank.withSolution,
  withPassage: topics.reduce((n, t) => n + t.questions.filter(q => q.passage).length, 0),
  withFigure: topics.reduce((n, t) => n + t.questions.filter(q => q.figure).length, 0),
  withChart: topics.reduce((n, t) => n + t.questions.filter(q => q.chart).length, 0),
  withTable: topics.reduce((n, t) => n + t.questions.filter(q => q.table).length, 0),
  pdfOptWins,
  diRetags,
  bleedLeft,
  dropped,
  strippedOpts,
});
for (const t of topics) console.log(`${t.questions.length}\t${t.section}\t${t.topic}`);
