import { useCallback, useState } from 'react';
import { QUIZZES } from './quizzes';
import { load, save } from './storage';

export type Config = {
  ranges: Record<string, [number, number]>;
  mode: 'input' | 'options';
  count: number;
  tMode: 'input' | 'options' | 'mixed';
  tCount: number;
  tPicked: string[];
};

const defaults = (): Config => ({
  ranges: Object.fromEntries(Object.entries(QUIZZES).map(([id, q]) => [id, [q.min, q.max]])),
  mode: 'input',
  count: 10,
  tMode: 'options',
  tCount: 20,
  tPicked: [],
});

/** Settings persisted in localStorage. */
export function useConfig() {
  const [cfg, setState] = useState<Config>(() => {
    const d = defaults();
    const saved = load<Partial<Config>>('rrb.cfg', {});
    return { ...d, ...saved, ranges: { ...d.ranges, ...saved.ranges } };
  });
  const update = useCallback((patch: Partial<Config>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      save('rrb.cfg', next);
      return next;
    });
  }, []);
  return [cfg, update] as const;
}
