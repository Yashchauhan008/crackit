import { useCallback, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { getArrangement, layoutLabel } from '../../lib/arrangements/puzzles';
import type { ArrangementQuestion } from '../../lib/arrangements/types';
import { loadStats, saveStats } from '../../lib/storage';
import { getTopicNotes } from '../../lib/topicNotes';
import { saveAttempt, uuid, type AnswerLog } from '../../lib/api';
import SolvePlayer from './SolvePlayer';
import SeatDiagram from './SeatDiagram';
import { seatsFinal } from '../../lib/arrangements/state';

type Props = { puzzleId: string; onBack: () => void };

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

function optsLayout(options: string[]) {
  const max = Math.max(0, ...options.map(o => o.trim().length));
  if (max <= 14) return 'row';
  if (max <= 42) return 'grid2';
  return 'stack';
}

export default function ArrangementPuzzle({ puzzleId, onBack }: Props) {
  const puzzle = getArrangement(puzzleId);
  const [solving, setSolving] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const started = useRef(Date.now());
  const clientId = useRef(uuid());
  const log = useRef<AnswerLog[]>([]);

  const notesHtml = useMemo(() => {
    const md = getTopicNotes('arrangements');
    if (!md) return '';
    return marked.parse(md, { async: false }) as string;
  }, []);

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
      <div className="card">
        <p className="empty">Puzzle not found.</p>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  const doneCount = Object.keys(checked).length;
  const openId = expanded ?? puzzle.questions[0]?.id ?? null;

  return (
    <div className="topic-learn">
      <div className="topic-learn-bar card">
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
        <div className="topic-learn-bar-copy">
          <strong>{puzzle.title}</strong>
          <span>
            {layoutLabel(puzzle)} · {doneCount}/{puzzle.questions.length} answered
            {puzzle.source ? ` · ${puzzle.source}` : ''}
          </span>
        </div>
        <div className="topic-learn-quiz">
          <button className="btn ghost" onClick={() => setShowFinal(v => !v)}>
            {showFinal ? 'Hide final' : 'Show final'}
          </button>
          <button className="btn" onClick={() => setSolving(true)}>
            Solve
          </button>
        </div>
      </div>

      <div className="topic-learn-split">
        <div className="arr-main">
          <div className="card arr-directions">
            <p className="topic-notes-kicker">Directions</p>
            <p className="arr-passage">{puzzle.passage}</p>
            <p className="arr-people">
              People: <b>{puzzle.people.join(', ')}</b>
            </p>
            {showFinal && (
              <div className="arr-final">
                <SeatDiagram layout={puzzle.layout} seats={seatsFinal(puzzle)} dualFacing={puzzle.dualFacing} />
              </div>
            )}
          </div>

          <div className="topic-q-list">
            {puzzle.questions.map((q, qi) => {
              const given = answers[q.id];
              const locked = !!checked[q.id];
              const isOpen = openId === q.id;
              const status = locked ? (given === q.answerIndex ? 'right' : 'wrong') : '';
              return (
                <article className={`topic-q-item ${isOpen ? 'open' : ''} ${status}`} key={q.id}>
                  <button
                    type="button"
                    className="topic-q-summary"
                    onClick={() => setExpanded(isOpen ? null : q.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="topic-q-num">{qi + 1}</span>
                    <span className="topic-q-preview">
                      <strong>{q.text}</strong>
                      <small>
                        {locked ? (given === q.answerIndex ? 'Correct' : 'Wrong') : 'Tap to answer'}
                      </small>
                    </span>
                    <span className={`topic-q-chevron ${isOpen ? 'open' : ''}`} aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="topic-q-body">
                      <div className={`lesson-opts ${optsLayout(q.options)}`}>
                        {q.options.map((opt, oi) => {
                          let cls = 'opt lesson-opt';
                          if (locked) {
                            if (oi === q.answerIndex) cls += ' right';
                            else if (oi === given) cls += ' wrong';
                          }
                          return (
                            <button key={oi} className={cls} disabled={locked} onClick={() => record(q, oi)}>
                              <span className="lesson-letter">{LETTERS[oi]}</span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      {locked && (
                        <div className={`lesson-fb ${given === q.answerIndex ? 'ok' : 'no'}`}>
                          <strong>
                            {given === q.answerIndex
                              ? 'Correct'
                              : `Wrong · Answer ${LETTERS[q.answerIndex]}`}
                          </strong>
                          <p>Use Solve in the top bar to watch each clue place people on the diagram.</p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {doneCount === puzzle.questions.length && doneCount > 0 && (
            <p className="legend">Attempt saved. Press Solve to review the placement animation.</p>
          )}
        </div>

        <aside className="topic-notes card">
          <p className="topic-notes-kicker">Formulas & short tricks</p>
          {notesHtml ? (
            <div className="md" dangerouslySetInnerHTML={{ __html: notesHtml }} />
          ) : (
            <p className="empty">Arrangement notes will appear here.</p>
          )}
        </aside>
      </div>

      {solving && <SolvePlayer puzzle={puzzle} onClose={() => setSolving(false)} />}
    </div>
  );
}
