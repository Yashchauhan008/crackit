import { load, save } from './storage';
import { TOPIC_BANK } from './topicBank';
import { QUIZZES } from './quizzes';

const KEY = 'crackit.prep';

export type PrepItem = {
  id: string;
  label: string;
  section: string;
  kind: 'topic' | 'arrangement' | 'drill';
  meta: string;
  href: string;
};

export type PrepState = Record<string, boolean>;

export function prepCatalog(): PrepItem[] {
  const topics: PrepItem[] = TOPIC_BANK.sets.map(t => ({
    id: `topic:${t.id}`,
    label: t.topic,
    section: t.section,
    kind: 'topic',
    meta: `${t.questions.length} questions`,
    href: `#topics/${t.id}`,
  }));

  const arrangement: PrepItem = {
    id: 'arrangement:seating',
    label: 'Arrangements',
    section: 'Reasoning Ability',
    kind: 'arrangement',
    meta: 'Linear & circular seating',
    href: '#arrangements',
  };

  const drills: PrepItem[] = Object.entries(QUIZZES).map(([id, Q]) => ({
    id: `drill:${id}`,
    label: Q.name,
    section: 'Speed drills',
    kind: 'drill',
    meta: Q.tag,
    href: `#practice`,
  }));

  return [...topics, arrangement, ...drills];
}

export function loadPrep(): PrepState {
  return load<PrepState>(KEY, {});
}

export function savePrep(state: PrepState) {
  save(KEY, state);
}

export function togglePrep(id: string): PrepState {
  const state = loadPrep();
  state[id] = !state[id];
  if (!state[id]) delete state[id];
  savePrep(state);
  return { ...state };
}

export function prepStats(state: PrepState = loadPrep()) {
  const items = prepCatalog();
  const bySection = new Map<string, { total: number; done: number }>();
  let done = 0;
  for (const item of items) {
    const row = bySection.get(item.section) ?? { total: 0, done: 0 };
    row.total++;
    if (state[item.id]) {
      row.done++;
      done++;
    }
    bySection.set(item.section, row);
  }
  const total = items.length;
  const remaining = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return {
    items,
    total,
    done,
    remaining,
    pct,
    sections: [...bySection.entries()].map(([name, v]) => ({
      name,
      total: v.total,
      done: v.done,
      remaining: v.total - v.done,
      pct: v.total ? Math.round((v.done / v.total) * 100) : 0,
    })),
  };
}
