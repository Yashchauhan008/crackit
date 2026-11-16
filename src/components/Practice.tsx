import { useState } from 'react';
import { QUIZZES } from '../lib/quizzes';
import { TOPIC_BANK } from '../lib/topicBank';
import { clampRange, draw, makeQ, pool, type Q } from '../lib/engine';
import { loadStats } from '../lib/storage';
import type { Config } from '../lib/config';
import { RangeInputs, Seg } from './ui';

type Props = {
  cfg: Config;
  update: (p: Partial<Config>) => void;
  start: (qs: Q[], title: string, tourney: boolean, rebuild?: () => Q[]) => void;
};

/** Local numbers for a quiz card: answered, accuracy, and how many questions are still red. */
function quizStats(id: string) {
  const stats = loadStats();
  let right = 0,
    wrong = 0,
    toFix = 0;
  for (const [k, s] of Object.entries(stats)) {
    if (!k.startsWith(`${id}:`)) continue;
    right += s.r;
    wrong += s.w;
    if (s.last === false) toFix++;
  }
  const answered = right + wrong;
  return { answered, accuracy: answered ? Math.round((right / answered) * 100) : null, toFix };
}

export default function Practice({ cfg, update, start }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const toggle = (k: string) =>
    setRevealed(s => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  const setRange = (id: string, r: [number, number]) => update({ ranges: { ...cfg.ranges, [id]: clampRange(...r) } });
  const stats = loadStats();

  return (
    <>
      <div className="row" style={{ marginTop: 0 }}>
        <div className="field">
          Answer style
          <Seg value={cfg.mode} options={[['input', 'Type answer'], ['options', 'Options']]} onChange={mode => update({ mode })} />
        </div>
        <label className="field">
          Questions
          <select value={cfg.count} onChange={e => update({ count: Number(e.target.value) })}>
            {[5, 10, 20, 30, 50].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="offer-grid">
        {TOPIC_BANK.sets.map(t => (
          <article className="offer" key={t.id}>
            <div className="offer-top">
              <div className="offer-id">
                <span className="mark">{t.questions.length}</span>
                <strong>{t.topic}</strong>
              </div>
              <span className={`pill ${t.section.startsWith('Reason') ? 'info' : 'good'}`}>
                {t.section.startsWith('Reason') ? 'Reasoning' : 'Quant'}
              </span>
            </div>
            <div className="meta">
              <div>
                <span>Questions</span>
                <b>{t.questions.length}</b>
              </div>
              <div>
                <span>Solutions</span>
                <b>{t.questions.filter(q => q.solution).length}</b>
              </div>
            </div>
            <div className="offer-actions">
              <a className="btn" href={`#topics/${t.id}`}>
                Learn
              </a>
            </div>
          </article>
        ))}

        <article className="offer">
          <div className="offer-top">
            <div className="offer-id">
              <span className="mark">○</span>
              <strong>Arrangements</strong>
            </div>
            <span className="pill info">Reasoning</span>
          </div>
          <div className="meta">
            <div>
              <span>Type</span>
              <b>Seating</b>
            </div>
            <div>
              <span>Solve</span>
              <b>Animated</b>
            </div>
          </div>
          <h3>Linear and circular puzzles</h3>
          <p className="blurb">RRB memory-paper sets plus short drills. Answer the questions, then watch each clue place people.</p>
          <div className="offer-actions">
            <a className="btn ghost" href="#learn/arrangements">
              Study
            </a>
            <a className="btn" href="#arrangements">
              Open
            </a>
          </div>
        </article>

        {Object.entries(QUIZZES).map(([id, Q]) => {
          const range = cfg.ranges[id] ?? [Q.min, Q.max];
          const st = quizStats(id);
          const total = range[1] - range[0] + 1;
          const tone = st.toFix ? 'bad' : st.accuracy == null ? 'muted' : 'good';
          return (
            <article className="offer" key={id}>
              <div className="offer-top">
                <div className="offer-id">
                  <span className="mark">{id === 'squares' ? 'n²' : id === 'cubes' ? 'n³' : 'n'}</span>
                  <strong>{Q.name}</strong>
                </div>
                <span className={`pill ${tone}`}>{st.accuracy == null ? 'New' : `${st.accuracy}%`}</span>
              </div>
              <div className="meta">
                <div>
                  <span>Answered</span>
                  <b>{st.answered}</b>
                </div>
                <div>
                  <span>To fix</span>
                  <b>{st.toFix}</b>
                </div>
              </div>
              <h3>
                {Q.tag} {range[0]} to {range[1]}
              </h3>
              <p className="blurb">{total} numbers in this range.</p>
              <div className="row qrange">
                <RangeInputs value={range} onChange={r => setRange(id, r)} />
                <button className="link" onClick={() => setRange(id, [Q.min, Q.max])}>
                  Reset
                </button>
              </div>
              <div className="offer-actions">
                <a className="btn ghost" href={`#learn/${id}`}>
                  Study
                </a>
                <button
                  className="btn"
                  onClick={() => {
                    const build = () => draw(pool(range), cfg.count).map(n => makeQ(id, n, cfg.mode));
                    start(build(), Q.name, false, build);
                  }}
                >
                  Start
                </button>
              </div>
              <button className="link" onClick={() => setOpen(open === id ? null : id)}>
                {open === id ? 'Hide numbers' : 'Show numbers'}
              </button>

              {open === id && (
                <>
                  <div className="grid">
                    {pool(range).map(n => {
                      const k = `${id}:${n}`;
                      const cls = stats[k]?.last === false ? 'weak' : '';
                      return (
                        <button key={k} className={`tile ${cls}`} onClick={() => toggle(k)} title={`Tap to show ${Q.label(n)}`}>
                          <b>{n}</b>
                          <small>{revealed.has(k) ? Q.fn(n) : ''}</small>
                        </button>
                      );
                    })}
                  </div>
                  <div className="legend">Tap a number to peek. Red = last answer wrong; a correct answer clears it.</div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
