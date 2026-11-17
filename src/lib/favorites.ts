import { load, save } from './storage';

const KEY = 'rrb.favorites';

export type Favorites = Record<string, true>;

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
