import { useEffect, useState } from 'react';
import { flush, getMistakes, getOverview, getProgress, pending, type MistakeItem, type Overview, type Progress as ProgressData } from '../lib/api';
import { QUIZZES, quizName } from '../lib/quizzes';
import { draw, makeQ, shuffle, type Q } from '../lib/engine';
import type { Config } from '../lib/config';
import { Seg, pct, secs, signed } from './ui';

type Data = { ov: Overview; pr: ProgressData; ms: MistakeItem[] };
type Props = { cfg: Config; start: (qs: Q[], title: string, tourney: boolean, rebuild?: () => Q[]) => void };

const cls = (v: number | null, goodWhenPositive = true) => (v == null || v === 0 ? '' : (v > 0) === goodWhenPositive ? 'up' : 'down');

export default function Progress({ cfg, start }: Props) {
  const [days, setDays] = useState<'7' | '30' | '90'>('30');
  const [quiz, setQuiz] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setError(false);
    (async () => {
      try {
        await flush();
        const d = Number(days);
        const [ov, pr, ms] = await Promise.all([getOverview(d), getProgress(Math.max(d, 7), quiz || undefined), getMistakes(quiz || undefined)]);
        if (live) setData({ ov, pr, ms: ms.items });
      } catch {
        if (live) setError(true);
      }
    })();
    return () => {
      live = false;
    };
  }, [days, quiz, tick]);

  if (error)
    return (
      <>
        <h1>Progress</h1>
        <div className="card">
          <b>Can't reach the server.</b>
          <p className="sub">
            Practice still works; finished quizzes are saved here and synced later ({pending()} waiting). To see analytics, start the backend:{' '}
            <code>cd backend && npm run dev</code>
          </p>
          <button className="btn" onClick={() => setTick(t => t + 1)}>
            Retry
          </button>
        </div>
      </>
    );
  if (!data)
    return (
      <>
        <h1>Progress</h1>
        <p className="sub">Loading…</p>
      </>
    );

  const { ov, pr, ms } = data;
  const t = ov.totals;
  const tr = pr.trend;
  const max = Math.max(1, ...pr.daily.map(d => d.answered));

  const drill = () => {
    const items = ms.filter(i => QUIZZES[i.quizId] && Number.isFinite(Number(i.itemKey)));
    if (!items.length) return;
    const n = Math.max(10, Math.min(20, items.length * 2));
    // questions you miss most are repeated more often
    const weighted = items.flatMap(i => Array<MistakeItem>(Math.min(i.wrong, 4)).fill(i));
    const build = () => shuffle(draw(weighted, n).map(i => makeQ(i.quizId, Number(i.itemKey), cfg.mode)));
    start(build(), 'Focus drill', false, build);
  };

  return (
    <>
      <p className="sub">Finished quizzes are saved in this browser and synced when the server is up.</p>
      <div className="row" style={{ marginTop: 0 }}>
        <div className="field">
          Period
          <Seg value={days} options={[['7', '7 days'], ['30', '30 days'], ['90', '90 days']]} onChange={setDays} />
        </div>
        <label className="field">
          Quiz
          <select value={quiz} onChange={e => setQuiz(e.target.value)}>
            <option value="">All quizzes</option>
            {Object.entries(QUIZZES).map(([id, Q]) => (
              <option key={id} value={id}>
                {Q.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card">
        <div className="stats big">
          <div><b>{t.answered}</b>questions answered</div>
          <div><b>{pct(t.accuracy)}</b>accuracy</div>
          <div><b>{secs(t.avgTimeMs)}</b>avg time</div>
          <div><b>{t.streakDays}</b>day streak</div>
          <div><b>{t.activeDays}</b>days practised</div>
        </div>
      </div>

      <div className="card">
        <h2>This week vs last week</h2>
        {tr.current.answered + tr.previous.answered === 0 ? (
          <p className="empty">Not enough data yet — finish a few quizzes.</p>
        ) : (
          <table>
            <thead>
              <tr><th></th><th>Last 7 days</th><th>Previous 7 days</th><th>Change</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Accuracy</td><td>{pct(tr.current.accuracy)}</td><td>{pct(tr.previous.accuracy)}</td>
                <td className={cls(tr.accuracyDelta)}>{signed(tr.accuracyDelta, ' pts')}</td>
              </tr>
              <tr>
                <td>Avg time / question</td><td>{secs(tr.current.avgTimeMs)}</td><td>{secs(tr.previous.avgTimeMs)}</td>
                <td className={cls(tr.speedChangePct, false)}>
                  {signed(tr.speedChangePct, '%')} {tr.speedChangePct != null && (tr.speedChangePct < 0 ? '(faster)' : '(slower)')}
                </td>
              </tr>
              <tr>
                <td>Questions answered</td><td>{tr.current.answered}</td><td>{tr.previous.answered}</td>
                <td className={cls(tr.volumeDelta)}>{signed(tr.volumeDelta)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="cardhead">
          <h2>Daily practice</h2>
          <span className="legend" style={{ margin: 0 }}>bar = questions · label = accuracy</span>
        </div>
        {pr.daily.length ? (
          <div className="bars">
            {pr.daily.map(d => (
              <div className="bar1" key={d.day} title={`${d.day}: ${d.answered} questions, ${pct(d.accuracy)}, ${secs(d.avgTimeMs)}/q`}>
                <span className="v">{Math.round(d.accuracy ?? 0)}%</span>
                <i style={{ height: `${Math.max(4, (d.answered / max) * 100)}%` }} />
                <span className="d">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">No practice in this period.</p>
        )}
      </div>

      <div className="card">
        <h2>By quiz</h2>
        {ov.quizzes.length ? (
          <table>
            <thead>
              <tr><th>Quiz</th><th>Answered</th><th>Accuracy</th><th>Avg time</th><th>Questions seen</th><th>Need focus</th><th>Recovered</th></tr>
            </thead>
            <tbody>
              {ov.quizzes.map(q => (
                <tr key={q.quizId}>
                  <td>{quizName(q.quizId)}</td><td>{q.answered}</td><td>{pct(q.accuracy)}</td><td>{secs(q.avgTimeMs)}</td>
                  <td>{q.mastery.items}</td><td>{q.mastery.weak}</td><td>{q.mastery.recovered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">Nothing yet.</p>
        )}
      </div>

      <div className="card">
        <div className="cardhead">
          <h2>Questions to focus on</h2>
          {ms.length > 0 && <button className="btn" onClick={drill}>Practise these</button>}
        </div>
        <p className="sub" style={{ margin: '4px 0 8px' }}>
          Ranked by how often you got them wrong. “Usually said” is the wrong answer you gave most.
        </p>
        {ms.length ? (
          <table>
            <thead>
              <tr><th>Question</th><th>Wrong</th><th>Usually said</th><th>Right answer</th><th>Status</th></tr>
            </thead>
            <tbody>
              {ms.map(i => (
                <tr key={`${i.quizId}:${i.itemKey}`}>
                  <td><b>{i.prompt}</b> <span className="muted">{quizName(i.quizId)}</span></td>
                  <td>{i.wrong} of {i.attempts}</td>
                  <td>{i.commonWrongAnswers.map(w => `${w.answer}${w.times > 1 ? ` ×${w.times}` : ''}`).join(', ') || '–'}</td>
                  <td>{i.correctAnswer}</td>
                  <td>
                    <span className={`badge ${i.status}`}>{i.status === 'weak' ? 'Needs work' : i.status === 'recovered' ? 'Improving' : 'Mixed'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">No mistakes recorded. Keep practising.</p>
        )}
      </div>
    </>
  );
}
