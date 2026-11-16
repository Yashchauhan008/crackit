export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be blocked; app still works */
  }
}

/** "squares:17" -> counts, plus whether the most recent answer was correct */
export type Stats = Record<string, { r: number; w: number; last?: boolean }>;
export const loadStats = () => load<Stats>('rrb.stats', {});
export const saveStats = (s: Stats) => save('rrb.stats', s);
