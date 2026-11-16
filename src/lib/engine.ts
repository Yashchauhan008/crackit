import { QUIZZES } from './quizzes';

export type Q = {
  id: string;
  n: number;
  ans: number;
  text: string;
  tag: string;
  options?: number[];
};
export type Mode = 'input' | 'options';

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

export function pool(range: [number, number]) {
  const out: number[] = [];
  for (let n = range[0]; n <= range[1]; n++) out.push(n);
  return out;
}

/** Pick `count` items without repeats, refilling the bag when it runs out. */
export function draw<T>(items: T[], count: number): T[] {
  const out: T[] = [];
  let bag: T[] = [];
  while (out.length < count && items.length) {
    if (!bag.length) bag = shuffle(items);
    out.push(bag.pop()!);
  }
  return out;
}

export function clampRange(lo: number, hi: number): [number, number] {
  const a = Math.max(1, Math.min(200, Math.floor(lo) || 1));
  const b = Math.max(1, Math.min(200, Math.floor(hi) || a));
  return a > b ? [b, a] : [a, b];
}

export function makeQ(id: string, n: number, mode: Mode): Q {
  const quiz = QUIZZES[id]!;
  const ans = quiz.fn(n);
  const q: Q = { id, n, ans, text: `${quiz.label(n)} = ?`, tag: `${quiz.tag} ${n}` };
  if (mode === 'options') {
    // realistic wrong answers: neighbouring values and off-by-10s
    const near = [quiz.fn(n - 1), quiz.fn(n + 1), quiz.fn(n - 2), quiz.fn(n + 2), ans + 10, ans - 10, ans + 20, ans - 20, ans + 100];
    let d = shuffle([...new Set(near)].filter(x => x > 0 && x !== ans)).slice(0, 3);
    while (d.length < 3) {
      const x = ans + Math.floor(Math.random() * 40) + 1;
      if (!d.includes(x)) d.push(x);
    }
    q.options = shuffle([ans, ...d]);
  }
  return q;
}
