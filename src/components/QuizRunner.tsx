import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QUIZZES, quizName } from '../lib/quizzes';
import { makeQ, shuffle, type Q } from '../lib/engine';
import { loadStats, saveStats } from '../lib/storage';
import { saveAttempt, uuid, type AnswerLog } from '../lib/api';
import { fmtTime } from './ui';
import { useSolveTimerQuestion } from './SolveTimer';

export type Session = {
  key: number;
  qs: Q[];
  title: string;
  tourney: boolean;
  /** Fresh random set for "Try again". Falls back to reshuffling the same items. */
  rebuild?: () => Q[];
};

type Wrong = { q: Q; val: number };
type Result = { right: number; wrong: Wrong[]; done: number; ms: number; perQuiz: Record<string, { t: number; r: number }> };

export default function QuizRunner({ session, onExit, onRetry }: { session: Session; onExit: () => void; onRetry: (qs: Q[]) => void }) {
  const { qs, title, tourney } = session;
  const [i, setI] = useState(0);
  const [given, setGiven] = useState<number | null>(null); // set once answered
  const [text, setText] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const log = useRef<AnswerLog[]>([]);
  const wrong = useRef<Wrong[]>([]);
  const right = useRef(0);
  const t0 = useRef(Date.now());
  const qStart = useRef(Date.now());
  const clientId = useRef(uuid());
  const timer = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = qs[i]!;
  const locked = given !== null;
  const ok = locked && given === q.ans;
  useSolveTimerQuestion(result ? null : `practice:${q.id}`);

  useEffect(() => {
    qStart.current = Date.now();
    setGiven(null);
    setText('');
    inputRef.current?.focus();
  }, [i]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const finish = useCallback(() => {
    window.clearTimeout(timer.current);
    const done = log.current.length;
    const ms = Date.now() - t0.current;
    const perQuiz: Result['perQuiz'] = {};
    log.current.forEach(l => {
      const p = (perQuiz[l.quizId] ??= { t: 0, r: 0 });
      p.t++;
      if (l.givenAnswer === l.correctAnswer) p.r++;
    });
    if (done) {
      const modes = new Set(qs.slice(0, done).map(x => (x.options ? 'options' : 'input')));
      saveAttempt({
        clientId: clientId.current,
        kind: tourney ? 'tournament' : 'practice',
        mode: modes.size > 1 ? 'mixed' : (modes.values().next().value as 'input' | 'options'),
        startedAt: new Date(t0.current).toISOString(),
        durationMs: Math.min(ms, 86_400_000),
        answers: log.current,
      }).catch(() => {});
    }
    setResult({ right: right.current, wrong: wrong.current, done, ms, perQuiz });
  }, [qs, tourney]);

  const next = useCallback(() => {
    window.clearTimeout(timer.current);
    if (i + 1 >= qs.length) finish();
    else setI(n => n + 1);
  }, [i, qs.length, finish]);

  const answer = useCallback(
    (val: number) => {
      if (locked || !Number.isFinite(val)) return;
      const good = val === q.ans;
      const key = `${q.id}:${q.n}`;
      const stats = loadStats();
      const s = (stats[key] ??= { r: 0, w: 0 });
      good ? s.r++ : s.w++;
      s.last = good; // a correct answer clears the red mark on the practice grid
      saveStats(stats);
      if (good) right.current++;
      else wrong.current.push({ q, val });
      log.current.push({
        quizId: q.id,
        itemKey: String(q.n),
        prompt: QUIZZES[q.id]!.label(q.n),
        correctAnswer: q.ans,
        givenAnswer: val,
        timeMs: Math.min(Date.now() - qStart.current, 3_600_000),
        answeredAt: new Date().toISOString(),
      });
      setGiven(val);
      if (good) timer.current = window.setTimeout(next, 450);
    },
    [locked, q, next],
  );

  // keyboard: Enter submit/next, 1-4 pick an option
  useEffect(() => {
    if (result) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (locked) next();
        else if (text.trim() !== '') answer(Number(text.trim()));
      } else if (!locked && q.options && /^[1-4]$/.test(e.key)) {
        const o = q.options[Number(e.key) - 1];
        if (o !== undefined) answer(o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, locked, text, q, answer, next]);

  const retry = useMemo(
    () => () => {
      const next = session.rebuild?.() ?? shuffle(qs.map(x => makeQ(x.id, x.n, x.options ? 'options' : 'input')));
      onRetry(next);
    },
    [session.rebuild, qs, onRetry],
  );

  if (result) return <Results title={title} tourney={tourney} r={result} onRetry={retry} onExit={onExit} />;

  return (
    <>
      <div className="qtop">
        <span>{title}</span>
        <span>
          {i + 1} / {qs.length}
        </span>
      </div>
      <div className="bartrack">
        <i style={{ width: `${(i / qs.length) * 100}%` }} />
      </div>
      <div className="card qbox">
        <div className="qtag">{q.tag}</div>
        <div className="q">{q.text}</div>
        {q.options ? (
          <div className="opts">
            {q.options.map((o, k) => (
              <button
                key={o}
                className={`opt ${locked ? (o === q.ans ? 'right' : o === given ? 'wrong' : '') : ''}`}
                disabled={locked}
                onClick={() => answer(o)}
              >
                <kbd>{k + 1}</kbd>
                {o}
              </button>
            ))}
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              className="ans"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              disabled={locked}
              value={text}
              onChange={e => setText(e.target.value.replace(/[^\d-]/g, ''))}
            />
            {!locked && (
              <div className="actions">
                <button className="btn" onClick={() => text.trim() !== '' && answer(Number(text))}>
                  Check
                </button>
              </div>
            )}
          </>
        )}
        <div className={`fb ${locked ? (ok ? 'ok' : 'no') : ''}`}>{locked && (ok ? 'Correct' : `Wrong — ${q.text.replace('?', String(q.ans))}`)}</div>
        {locked && !ok && (
          <div className="actions">
            <button className="btn" autoFocus onClick={next}>
              Next (Enter)
            </button>
          </div>
        )}
        <div className="actions">
          <button className="btn ghost" onClick={finish}>
            End quiz
          </button>
        </div>
      </div>
    </>
  );
}

function Results({ title, tourney, r, onRetry, onExit }: { title: string; tourney: boolean; r: Result; onRetry: () => void; onExit: () => void }) {
  const pct = r.done ? Math.round((r.right / r.done) * 100) : 0;
  return (
    <>
      <h1>{title} — results</h1>
      <div className="card">
        <div className="score">
          {r.right} / {r.done}
        </div>
        <div className="stats">
          <div>
            <b>{pct}%</b>accuracy
          </div>
          <div>
            <b>{fmtTime(r.ms)}</b>total time
          </div>
          <div>
            <b>{r.done ? `${(r.ms / r.done / 1000).toFixed(1)}s` : '–'}</b>per question
          </div>
        </div>
        {tourney && (
          <table>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Correct</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(r.perQuiz).map(([id, p]) => (
                <tr key={id}>
                  <td>{quizName(id)}</td>
                  <td>
                    {p.r} / {p.t}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {r.wrong.length ? (
          <>
            <h2 style={{ marginTop: 16 }}>Review mistakes</h2>
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Your answer</th>
                  <th>Correct</th>
                </tr>
              </thead>
              <tbody>
                {r.wrong.map((w, k) => (
                  <tr key={k}>
                    <td>{w.q.text.replace(' = ?', '')}</td>
                    <td>{w.val}</td>
                    <td>{w.q.ans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="empty">No mistakes. Nice.</p>
        )}
        <div className="row">
          <button className="btn" onClick={onRetry}>
            Try again
          </button>
          <button className="btn ghost" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    </>
  );
}
