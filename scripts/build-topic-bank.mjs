import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = path.join(
  process.env.HOME,
  '.cursor/projects/Users-yashchauhan-My-mac-yash-persnol-rrb-preper/attachments/d8ea67b5-73fd-4a57-a7db-611e160c6cf4/ibps_rrb_2025_question_bank.json',
);
const out = path.join(root, 'frontend/src/data/topicBank.json');

const raw = JSON.parse(fs.readFileSync(src, 'utf8'));

const clean = s =>
  (s || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\s*\d+\s*$/g, '')
    .trim();

function splitDir(text) {
  const m = (text || '').match(/([\s\S]*?)\b(Directions\s*\([\s\S]*)$/i);
  if (!m) return { main: clean(text), dir: null };
  let dir = m[2].split(/\n\s*(?:Sol\.|S\d+\.\s*Ans)/i)[0];
  dir = clean(dir);
  const main = clean(m[1]);
  if (dir.length < 30) return { main: clean(text), dir: null };
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

for (const paper of raw.papers) {
  const blocks = [];
  const cleaned = paper.questions.map(q => {
    const qSplit = splitDir(q.question_text);
    const options = (q.options || []).map(o => {
      const s = splitDir(o.text);
      if (s.dir) {
        const range = rangeOf(s.dir);
        if (range && q.question_number < range.from && range.from - q.question_number <= 8) {
          blocks.push({ ...range, text: s.dir });
        }
      }
      return { label: (o.label || '').toLowerCase(), text: s.main || clean(o.text) };
    });
    if (qSplit.dir) {
      const range = rangeOf(qSplit.dir);
      if (range && q.question_number < range.from && range.from - q.question_number <= 8) {
        blocks.push({ ...range, text: qSplit.dir });
      }
    }
    const solution = clean(q.explanation || q.solution || '');
    return {
      section: q.section,
      topic: q.topic,
      stem: (qSplit.main || clean(q.question_text)).replace(/^Q\d+\.\s*/i, ''),
      options: options.filter(o => o.text),
      answer: (q.answer?.option || '').toLowerCase(),
      solution: solution && solution !== 'Logic here is:' ? solution : '',
      source: `${paper.exam.replace('IBPS RRB ', '')} · ${paper.date} · ${paper.shift}`,
      qnum: q.question_number,
      passage: '',
    };
  });

  for (const q of cleaned) {
    const hit = blocks
      .filter(b => q.qnum >= b.from && q.qnum <= b.to)
      .sort((a, b) => b.text.length - a.text.length)[0];
    if (hit) q.passage = hit.text.replace(/^Directions\s*\([^)]*\)\s*:?\s*/i, '').trim();
    items.push(q);
  }
}

const seen = new Map();
let dropped = 0;
for (const q of items) {
  const key = `${q.topic}::${norm(q.stem)}`;
  if (!q.stem || q.options.length < 2 || !q.answer) {
    dropped++;
    continue;
  }
  const prev = seen.get(key);
  if (!prev) {
    seen.set(key, q);
    continue;
  }
  dropped++;
  const better =
    (q.solution && !prev.solution) ||
    (q.passage && !prev.passage) ||
    (q.solution.length > prev.solution.length && !!q.passage === !!prev.passage);
  if (better) seen.set(key, q);
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
      questions: questions.map((q, i) => ({
        id: String(i + 1),
        stem: q.stem,
        passage: q.passage,
        options: q.options,
        answer: q.answer,
        solution: q.solution,
        source: `${q.source} · Q${q.qnum}`,
      })),
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
console.log({
  papers: bank.papers,
  topics: bank.topics,
  questions: bank.questions,
  withSolution: bank.withSolution,
  withPassage: topics.reduce((n, t) => n + t.questions.filter(q => q.passage).length, 0),
  dropped,
});
for (const t of topics) console.log(`${t.questions.length}\t${t.section}\t${t.topic}`);
