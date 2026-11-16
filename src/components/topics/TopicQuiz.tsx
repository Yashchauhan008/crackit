import { useEffect, useRef, useState } from 'react';
import { getTopic } from '../../lib/topicBank';
import { loadStats, saveStats } from '../../lib/storage';

type Props = { topicId: string; onBack: () => void };

const letter = (label: string) => label.toUpperCase();

export default function TopicQuiz({ topicId, onBack }: Props) {
  const topic = getTopic(topicId);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const right = useRef(0);
  const answered = useRef(0);

  useEffect(() => {
    setI(0);
    setPicked({});
    setDone(false);
    right.current = 0;
    answered.current = 0;
  }, [topicId]);

  if (!topic) {
    return (
      <div className="card">
        <p className="empty">Topic not found.</p>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  const total = topic.questions.length;
  const q = topic.questions[Math.min(i, total - 1)]!;
  const given = picked[q.id];
  const locked = given !== undefined;
  const ok = locked && given === q.answer;

  const choose = (label: string) => {
    if (picked[q.id]) return;
    const correct = label === q.answer;
    setPicked(p => ({ ...p, [q.id]: label }));
    answered.current += 1;
    if (correct) right.current += 1;
    const stats = loadStats();
    const key = `topics:${topic.id}:${q.id}`;
    const s = (stats[key] ??= { r: 0, w: 0 });
    if (correct) s.r++;
    else s.w++;
    s.last = correct;
    saveStats(stats);
  };

  const next = () => {
    if (i + 1 >= total) setDone(true);
    else setI(n => n + 1);
  };

  if (done) {
    const pct = answered.current ? Math.round((right.current / answered.current) * 100) : 0;
    return (
      <div className="lesson">
        <div className="card lesson-results">
          <p className="lesson-kicker">Lesson complete</p>
          <div className="score">
            {right.current} / {answered.current}
          </div>
          <div className="stats">
            <div>
              <b>{pct}%</b>accuracy
            </div>
            <div>
              <b>{total}</b>in set
            </div>
            <div>
              <b>{total - answered.current}</b>skipped
            </div>
          </div>
          <div className="actions">
            <button
              className="btn"
              onClick={() => {
                setI(0);
                setPicked({});
                setDone(false);
                right.current = 0;
                answered.current = 0;
              }}
            >
              Try again
            </button>
            <button className="btn ghost" onClick={onBack}>
              Back to practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson">
      <div className="qtop">
        <button className="link" onClick={onBack}>
          Exit
        </button>
        <span>
          {i + 1} / {total}
        </span>
      </div>
      <div className="bartrack">
        <i style={{ width: `${((i + (locked ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <div className="card lesson-card">
        {q.passage ? <div className="topic-pass">{q.passage}</div> : null}
        <p className="lesson-source">{q.source}</p>
        <h2 className="lesson-stem">{q.stem}</h2>

        <div className="lesson-opts">
          {q.options.map(o => {
            let cls = 'opt lesson-opt';
            if (locked) {
              if (o.label === q.answer) cls += ' right';
              else if (o.label === given) cls += ' wrong';
            }
            return (
              <button key={o.label} className={cls} disabled={locked} onClick={() => choose(o.label)}>
                <span className="lesson-letter">{letter(o.label)}</span>
                <span>{o.text}</span>
              </button>
            );
          })}
        </div>

        {locked && (
          <div className={`lesson-fb ${ok ? 'ok' : 'no'}`}>
            <strong>{ok ? 'Correct' : `Correct answer: ${letter(q.answer)}`}</strong>
            <p>
              {q.solution
                ? q.solution
                : 'The paper gave the answer only, with no worked solution.'}
            </p>
            <button className="btn lesson-continue" autoFocus onClick={next}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
