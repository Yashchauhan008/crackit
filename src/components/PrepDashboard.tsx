import { useMemo, useState } from 'react';
import { loadPrep, prepStats, savePrep, togglePrep, type PrepState } from '../lib/prep';

type Filter = 'all' | 'remaining' | 'prepared';

export default function PrepDashboard() {
  const [prep, setPrep] = useState<PrepState>(() => loadPrep());
  const [filter, setFilter] = useState<Filter>('all');
  const stats = useMemo(() => prepStats(prep), [prep]);

  const visible = stats.items.filter(item => {
    const on = Boolean(prep[item.id]);
    if (filter === 'prepared') return on;
    if (filter === 'remaining') return !on;
    return true;
  });

  const sections = [...new Set(visible.map(i => i.section))];

  const markAll = (section: string, value: boolean) => {
    const next = { ...prep };
    for (const item of stats.items.filter(i => i.section === section)) {
      if (value) next[item.id] = true;
      else delete next[item.id];
    }
    savePrep(next);
    setPrep(next);
  };

  return (
    <div className="prep">
      <div className="prep-hero card">
        <div className="prep-hero-top">
          <div>
            <h2>Preparation dashboard</h2>
            <p className="sub" style={{ margin: 0 }}>
              Tick topics you have prepared. Track what is left before the exam.
            </p>
          </div>
          <div className="prep-score">
            <b>{stats.pct}%</b>
            <span>ready</span>
          </div>
        </div>

        <div className="bartrack prep-bar">
          <i style={{ width: `${stats.pct}%` }} />
        </div>

        <div className="prep-kpis">
          <div>
            <span>Prepared</span>
            <b className="up">{stats.done}</b>
          </div>
          <div>
            <span>Remaining</span>
            <b className={stats.remaining ? 'down' : 'up'}>{stats.remaining}</b>
          </div>
          <div>
            <span>Total topics</span>
            <b>{stats.total}</b>
          </div>
        </div>

        <div className="prep-sections">
          {stats.sections.map(s => (
            <div className="prep-section-chip" key={s.name}>
              <div className="prep-section-chip-top">
                <strong>{s.name}</strong>
                <span>
                  {s.done}/{s.total}
                </span>
              </div>
              <div className="bartrack">
                <i style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prep-toolbar">
        <div className="seg">
          {(
            [
              ['all', `All (${stats.total})`],
              ['remaining', `Remaining (${stats.remaining})`],
              ['prepared', `Prepared (${stats.done})`],
            ] as const
          ).map(([id, label]) => (
            <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {sections.map(section => {
        const rows = visible.filter(i => i.section === section);
        const sectionStats = stats.sections.find(s => s.name === section)!;
        return (
          <section className="prep-block" key={section}>
            <div className="prep-block-head">
              <div>
                <h3>{section}</h3>
                <span>
                  {sectionStats.done} prepared · {sectionStats.remaining} left
                </span>
              </div>
              <div className="prep-block-actions">
                <button className="link" onClick={() => markAll(section, true)}>
                  Mark all
                </button>
                <button className="link" onClick={() => markAll(section, false)}>
                  Clear
                </button>
              </div>
            </div>
            <div className="prep-grid">
              {rows.map(item => {
                const on = Boolean(prep[item.id]);
                return (
                  <div key={item.id} className={`prep-box ${on ? 'on' : ''}`}>
                    <button
                      type="button"
                      className="prep-box-main"
                      onClick={() => setPrep(togglePrep(item.id))}
                      aria-pressed={on}
                    >
                      <span className={`prep-check ${on ? 'on' : ''}`} aria-hidden>
                        {on ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        ) : null}
                      </span>
                      <strong>{item.label}</strong>
                      <small>{item.meta}</small>
                      <span className={`pill ${on ? 'good' : 'muted'}`}>{on ? 'Prepared' : 'Remaining'}</span>
                    </button>
                    <a className="prep-box-open" href={item.href}>
                      Open
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {!visible.length && <p className="empty">Nothing in this filter.</p>}
    </div>
  );
}
