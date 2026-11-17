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
  const answered = right + wrong;
  return { answered, right, accuracy: answered ? Math.round((right / answered) * 100) : null };
}

export default function ArrangementList({ onOpen, onBack }: Props) {
  return (
    <div className="topic-learn" style={{ maxWidth: 960 }}>
      <div className="topic-learn-bar card">
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
        <div className="topic-learn-bar-copy">
          <strong>Arrangements</strong>
          <span>{ARRANGEMENTS.length} puzzles · answer MCQs, then watch Solve</span>
        </div>
      </div>

      <div className="offer-grid">
        {ARRANGEMENTS.map(p => {
          const st = puzzleStats(p.id);
          const tone = st.accuracy == null ? 'muted' : st.accuracy >= 70 ? 'good' : 'bad';
          return (
            <article className="offer" key={p.id}>
              <div className="offer-top">
                <div className="offer-id">
                  <span className="mark">{p.layout === 'circular' ? '○' : '—'}</span>
                  <strong>{p.title}</strong>
                </div>
                <span className={`pill ${tone}`}>{st.accuracy == null ? 'New' : `${st.accuracy}%`}</span>
              </div>
              <div className="meta">
                <div>
                  <span>Seats</span>
                  <b>{p.seatCount}</b>
                </div>
                <div>
                  <span>Questions</span>
                  <b>{p.questions.length}</b>
                </div>
              </div>
              <h3>{layoutLabel(p)}</h3>
              {p.source && <p className="blurb">{p.source}</p>}
              <div className="offer-actions">
                <button className="btn" onClick={() => onOpen(p.id)}>
                  Learn
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
