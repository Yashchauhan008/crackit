import { ARRANGEMENTS } from './arrangements/puzzles';
import { TOPIC_BANK } from './topicBank';
import { load, save } from './storage';

const KEY = 'rrb.favorites';

export type Favorites = Record<string, true>;

export type FavoriteEntry =
  | {
      kind: 'topic';
      key: string;
      topicId: string;
      questionId: string;
      topic: string;
      section: string;
      stem: string;
      source: string;
      href: string;
    }
  | {
      kind: 'arrangement';
      key: string;
      puzzleId: string;
      questionId: string;
      title: string;
      stem: string;
      source: string;
      href: string;
    };

export const loadFavorites = () => load<Favorites>(KEY, {});

export function isFavorite(questionKey: string): boolean {
  return Boolean(loadFavorites()[questionKey]);
}

/** Toggle favourite for a question key. Returns the new favourited state. */
export function toggleFavorite(questionKey: string): boolean {
  if (!questionKey) return false;
  const all = loadFavorites();
  const next = !all[questionKey];
  if (next) all[questionKey] = true;
  else delete all[questionKey];
  save(KEY, all);
  return next;
}

export function topicQuestionKey(topicId: string, qid: string) {
  return `topics:${topicId}:${qid}`;
}

export function arrangementQuestionKey(puzzleId: string, qid: string) {
  return `arrangements:${puzzleId}:${qid}`;
}

/** Resolve every favourited key into display rows (drops orphans). */
export function listFavoriteEntries(): FavoriteEntry[] {
  const keys = Object.keys(loadFavorites());
  const out: FavoriteEntry[] = [];

  for (const key of keys) {
    const topicMatch = /^topics:([^:]+):(.+)$/.exec(key);
    if (topicMatch) {
      const topicId = topicMatch[1]!;
      const questionId = topicMatch[2]!;
      const set = TOPIC_BANK.sets.find(t => t.id === topicId);
      const q = set?.questions.find(x => x.id === questionId);
      if (!set || !q) continue;
      out.push({
        kind: 'topic',
        key,
        topicId,
        questionId,
        topic: set.topic,
        section: set.section,
        stem: q.stem,
        source: q.source,
        href: `#topics/${topicId}`,
      });
      continue;
    }

    const arrMatch = /^arrangements:([^:]+):(.+)$/.exec(key);
    if (arrMatch) {
      const puzzleId = arrMatch[1]!;
      const questionId = arrMatch[2]!;
      const puzzle = ARRANGEMENTS.find(p => p.id === puzzleId);
      const q = puzzle?.questions.find(x => x.id === questionId);
      if (!puzzle || !q) continue;
      out.push({
        kind: 'arrangement',
        key,
        puzzleId,
        questionId,
        title: puzzle.title,
        stem: q.text,
        source: puzzle.source ?? 'Arrangements',
        href: `#arrangements/${puzzleId}`,
      });
    }
  }

  out.sort((a, b) => {
    const la = a.kind === 'topic' ? a.topic : a.title;
    const lb = b.kind === 'topic' ? b.topic : b.title;
    return la.localeCompare(lb) || a.stem.localeCompare(b.stem);
  });
  return out;
}
