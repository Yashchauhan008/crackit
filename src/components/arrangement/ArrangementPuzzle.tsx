import { useCallback, useRef, useState } from 'react';
import { getArrangement, layoutLabel } from '../../lib/arrangements/puzzles';
import type { ArrangementQuestion } from '../../lib/arrangements/types';
import { loadStats, saveStats } from '../../lib/storage';
import { saveAttempt, uuid, type AnswerLog } from '../../lib/api';
import SolvePlayer from './SolvePlayer';
import SeatDiagram from './SeatDiagram';
import { seatsFinal } from '../../lib/arrangements/state';

type Props = { puzzleId: string; onBack: () => void };

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export default function ArrangementPuzzle({ puzzleId, onBack }: Props) {
  const puzzle = getArrangement(puzzleId);
  const [solving, setSolving] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const started = useRef(Date.now());
  const clientId = useRef(uuid());
  const log = useRef<AnswerLog[]>([]);

  const flushAttempt = useCallback(() => {
    if (!puzzle || !log.current.length) return;
    saveAttempt({
      clientId: clientId.current,
      kind: 'practice',
      mode: 'options',
      startedAt: new Date(started.current).toISOString(),
      durationMs: Math.min(Date.now() - started.current, 86_400_000),
      answers: [...log.current],
    }).catch(() => {});
  }, [puzzle]);

  const record = useCallback(
    (q: ArrangementQuestion, given: number) => {
      if (!puzzle || checked[q.id]) return;
      const ok = given === q.answerIndex;
      const key = `arrangements:${puzzle.id}:${q.id}`;
      const stats = loadStats();
      const s = (stats[key] ??= { r: 0, w: 0 });
      ok ? s.r++ : s.w++;
      s.last = ok;
      saveStats(stats);
      setAnswers(a => ({ ...a, [q.id]: given }));
      setChecked(c => {
        const next = { ...c, [q.id]: true };
        if (Object.keys(next).length === puzzle.questions.length) flushAttempt();
        return next;
      });
      log.current.push({
        quizId: 'arrangements',
        itemKey: `${puzzle.id}:${q.id}`,
        prompt: q.text.slice(0, 120),
        correctAnswer: q.answerIndex,
        givenAnswer: given,
        timeMs: Math.min(Date.now() - started.current, 3_600_000),
        answeredAt: new Date().toISOString(),
      });
    },
    [puzzle, checked, flushAttempt],
  );

  if (!puzzle) {
    return (
      <>
        <p className="empty">Puzzle not found.</p>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </>
    );
  }

  const doneCount = Object.keys(checked).length;

  return (
    <>
      <div className="cardhead" style={{ marginBottom: 8 }}>
        <div>
          <h2>{puzzle.title}</h2>
          <p className="sub">
            {layoutLabel(puzzle)} · {puzzle.people.join(', ')}
          </p>
        </div>
        <button className="btn ghost" onClick={onBack}>
          All puzzles
        </button>
      </div>

      {puzzle.source && <p className="arr-source" style={{ marginTop: 0 }}>{puzzle.source}</p>}

      <div className="card">
        <h2>Directions</h2>
        <p className="arr-passage">{puzzle.passage}</p>
        <div className="arr-controls" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => setSolving(true)}>
            Solve
          </button>
          <button
            className="btn ghost"
            onClick={() => setShowFinal(v => !v)}
          >
            {showFinal ? 'Hide final' : 'Show final'}
          </button>
        </div>
        {showFinal && (
          <div style={{ marginTop: 16 }}>
            <SeatDiagram
              layout={puzzle.layout}
              seats={seatsFinal(puzzle)}
              dualFacing={puzzle.dualFacing}
            />
          </div>
        )}
      </div>

      {solving && <SolvePlayer puzzle={puzzle} onClose={() => setSolving(false)} />}

      <div className="card">
        <div className="cardhead">
          <h2>Questions</h2>
          <span className="legend" style={{ margin: 0 }}>
            {doneCount} / {puzzle.questions.length} answered
          </span>
        </div>
        {puzzle.questions.map((q, qi) => {
          const given = answers[q.id];
          const locked = !!checked[q.id];
          return (
            <div className="arr-q" key={q.id}>
              <div className="arr-qtext">
                <b>Q{qi + 1}.</b> {q.text}
              </div>
              <div className="arr-opts">
                {q.options.map((opt, oi) => {
                  let cls = 'opt arr-opt';
                  if (locked) {
                    if (oi === q.answerIndex) cls += ' right';
                    else if (oi === given) cls += ' wrong';
                  }
                  return (
                    <button
                      key={oi}
                      className={cls}
                      disabled={locked}
                      onClick={() => record(q, oi)}
                    >
                      <kbd>{LETTERS[oi]}</kbd>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {doneCount === puzzle.questions.length && doneCount > 0 && (
          <p className="legend">Attempt saved. Use Solve above to review the placement animation.</p>
        )}
      </div>
    </>
  );
}
