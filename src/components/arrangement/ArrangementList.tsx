import { ARRANGEMENTS, layoutLabel } from '../../lib/arrangements/puzzles';
import { loadStats } from '../../lib/storage';

type Props = { onOpen: (id: string) => void; onBack: () => void };

function puzzleStats(id: string) {
  const stats = loadStats();
  let right = 0,
    wrong = 0;
  for (const [k, s] of Object.entries(stats)) {
    if (!k.startsWith(`arrangements:${id}:`)) continue;
    right += s.r;
    wrong += s.w;
  }
  return { answered: right + wrong, right };
}

export default function ArrangementList({ onOpen, onBack }: Props) {
  return (
    <>
      <div className="cardhead" style={{ marginBottom: 14 }}>
        <p className="sub" style={{ margin: 0 }}>Open a set, answer it, then press Solve.</p>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="offer-grid">
        {ARRANGEMENTS.map(p => {
          const st = puzzleStats(p.id);
          return (
            <article className="offer" key={p.id}>
              <div className="offer-top">
                <div className="offer-id">
                  <span className="mark">{p.layout === 'circular' ? '○' : '—'}</span>
                  <strong>{p.title}</strong>
                </div>
                <span className={`pill ${st.answered ? 'good' : 'muted'}`}>
                  {st.answered ? `${Math.round((st.right / st.answered) * 100)}%` : 'New'}
                </span>
              </div>
              <div className="meta">
                <div><span>Seats</span><b>{p.seatCount}</b></div>
                <div><span>Questions</span><b>{p.questions.length}</b></div>
              </div>
              <h3>{layoutLabel(p)}</h3>
              {p.source && <p className="blurb">{p.source}</p>}
              <div className="offer-actions">
                <button className="btn" onClick={() => onOpen(p.id)}>
                  Open
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
