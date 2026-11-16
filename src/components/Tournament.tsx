import { QUIZZES } from '../lib/quizzes';
import { clampRange, makeQ, pool, shuffle, type Mode, type Q } from '../lib/engine';
import type { Config } from '../lib/config';
import { RangeInputs, Seg } from './ui';

type Props = {
  cfg: Config;
  update: (p: Partial<Config>) => void;
  start: (qs: Q[], title: string, tourney: boolean, rebuild?: () => Q[]) => void;
};

export default function Tournament({ cfg, update, start }: Props) {
  const picked = cfg.tPicked.filter(id => QUIZZES[id]);
  const toggle = (id: string) => update({ tPicked: picked.includes(id) ? picked.filter(x => x !== id) : [...picked, id] });

  const build = () => {
    // fair split: round-robin over selected quizzes, then shuffle
    const bags: Record<string, number[]> = {};
    const qs: Q[] = [];
    for (let i = 0; i < cfg.tCount; i++) {
      const id = picked[i % picked.length]!;
      if (!bags[id]?.length) bags[id] = shuffle(pool(cfg.ranges[id]!));
      const mode: Mode = cfg.tMode === 'mixed' ? (Math.random() < 0.5 ? 'input' : 'options') : cfg.tMode;
      qs.push(makeQ(id, bags[id]!.pop()!, mode));
    }
    return shuffle(qs);
  };

  const go = () => start(build(), 'Tournament', true, build);

  return (
    <>
      <p className="sub">Tick the quizzes to mix. Questions are shuffled together.</p>
      <div className="card">
        {Object.entries(QUIZZES).map(([id, Q]) => (
          <div className="pick" key={id}>
            <label className="name">
              <input type="checkbox" checked={picked.includes(id)} onChange={() => toggle(id)} /> {Q.name}
            </label>
            <RangeInputs value={cfg.ranges[id] ?? [Q.min, Q.max]} onChange={r => update({ ranges: { ...cfg.ranges, [id]: clampRange(...r) } })} />
          </div>
        ))}
        <div className="row">
          <div className="field">
            Answer style
            <Seg value={cfg.tMode} options={[['input', 'Type answer'], ['options', 'Options'], ['mixed', 'Mixed']]} onChange={tMode => update({ tMode })} />
          </div>
          <label className="field">
            Total questions
            <select value={cfg.tCount} onChange={e => update({ tCount: Number(e.target.value) })}>
              {[10, 20, 30, 50, 100].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn" disabled={!picked.length} onClick={go}>
          Start tournament
        </button>
        {!picked.length && <span className="empty" style={{ marginLeft: 12 }}>Select at least one quiz.</span>}
      </div>
    </>
  );
}
