import { load, save } from './storage';

/** Last completed solve time (ms) keyed by question id. */
export type SolveTimes = Record<string, number>;

const KEY = 'rrb.solveTimes';

export const loadSolveTimes = () => load<SolveTimes>(KEY, {});

export function saveSolveTime(questionKey: string, ms: number) {
  if (!questionKey || !Number.isFinite(ms) || ms < 0) return;
  const all = loadSolveTimes();
  all[questionKey] = Math.min(Math.round(ms), 3_600_000);
  save(KEY, all);
}

export function readSolveTime(questionKey: string | null | undefined): number | null {
  if (!questionKey) return null;
  const ms = loadSolveTimes()[questionKey];
  return typeof ms === 'number' && ms >= 0 ? ms : null;
}

export function fmtSolve(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
