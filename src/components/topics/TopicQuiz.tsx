import { useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { marked } from 'marked';
import { getTopic, type TopicQuestion, type TopicSet } from '../../lib/topicBank';
import { needsMissingFigure, usableQuestions } from '../../lib/questionContext';
import { getTopicNotes } from '../../lib/topicNotes';
import { loadStats, saveStats } from '../../lib/storage';
import QuestionMedia from './QuestionMedia';

type Props = { topicId: string; onBack: () => void };
type Mode = 'learn' | 'quiz' | 'results';

const letter = (label: string) => label.toUpperCase();

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function quizCounts(total: number) {
  const opts = [5, 10, 15, 20, 30, 50].filter(n => n < total);
  return [...opts, total];
}

/** short → one row; medium → 2×2; long → stacked rows */
function optsLayout(options: { text: string }[]) {
  const max = Math.max(0, ...options.map(o => o.text.trim().length));
  if (max <= 14) return 'row';
  if (max <= 42) return 'grid2';
  return 'stack';
}

function recordAttempt(topicId: string, qid: string, correct: boolean) {
  const stats = loadStats();
  const key = `topics:${topicId}:${qid}`;
  const s = (stats[key] ??= { r: 0, w: 0 });
  if (correct) s.r++;
  else s.w++;
  s.last = correct;
  saveStats(stats);
}

export default function TopicQuiz({ topicId, onBack }: Props) {
  const topic = getTopic(topicId);
  const [mode, setMode] = useState<Mode>('learn');
  const [quizSize, setQuizSize] = useState(10);
  const [openSol, setOpenSol] = useState<Record<string, boolean>>({});
  const [pickedLearn, setPickedLearn] = useState<Record<string, string>>({});

  // quiz state
  const [deck, setDeck] = useState<TopicQuestion[]>([]);
  const [qi, setQi] = useState(0);
  const [pickedQuiz, setPickedQuiz] = useState<Record<string, string>>({});
  const right = useRef(0);
  const answered = useRef(0);

  const practicePool = useMemo(
    () => (topic ? usableQuestions(topic.questions) : []),
    [topic],
  );
  const incompleteCount = topic ? topic.questions.length - practicePool.length : 0;

  useEffect(() => {
    setMode('learn');
    setOpenSol({});
    setPickedLearn({});
    setDeck([]);
    setQi(0);
    setPickedQuiz({});
    right.current = 0;
    answered.current = 0;
    if (topic) {
      const pool = usableQuestions(topic.questions);
      const counts = quizCounts(Math.max(pool.length, 1));
      setQuizSize(counts.includes(10) ? 10 : counts[0]!);
    }
  }, [topicId, topic]);

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

  const startQuiz = () => {
    if (!practicePool.length) return;
    const n = Math.min(quizSize, practicePool.length);
    setDeck(shuffle(practicePool).slice(0, n));
    setQi(0);
    setPickedQuiz({});
    right.current = 0;
    answered.current = 0;
    setMode('quiz');
  };

  if (mode === 'quiz' || mode === 'results') {
    return (
      <QuizMode
        topic={topic}
        deck={deck}
        qi={qi}
        setQi={setQi}
        picked={pickedQuiz}
        setPicked={setPickedQuiz}
        right={right}
        answered={answered}
        done={mode === 'results'}
        setDone={() => setMode('results')}
        onExitLearn={() => setMode('learn')}
        onBack={onBack}
        onRetry={startQuiz}
      />
    );
  }

  return (
    <LearnMode
      topic={topic}
      practicePool={practicePool}
      incompleteCount={incompleteCount}
      quizSize={quizSize}
      setQuizSize={setQuizSize}
      openSol={openSol}
      setOpenSol={setOpenSol}
      picked={pickedLearn}
      setPicked={setPickedLearn}
      onStartQuiz={startQuiz}
      onBack={onBack}
    />
  );
}

function LearnMode({
  topic,
  practicePool,
  incompleteCount,
  quizSize,
  setQuizSize,
  openSol,
  setOpenSol,
  picked,
  setPicked,
  onStartQuiz,
  onBack,
}: {
  topic: TopicSet;
  practicePool: TopicQuestion[];
  incompleteCount: number;
  quizSize: number;
  setQuizSize: (n: number) => void;
  openSol: Record<string, boolean>;
  setOpenSol: Dispatch<SetStateAction<Record<string, boolean>>>;
  picked: Record<string, string>;
  setPicked: Dispatch<SetStateAction<Record<string, string>>>;
  onStartQuiz: () => void;
  onBack: () => void;
}) {
  const [showIncomplete, setShowIncomplete] = useState(false);
  const list = showIncomplete ? topic.questions : practicePool;
  const counts = useMemo(() => quizCounts(Math.max(practicePool.length, 1)), [practicePool.length]);
  const [expanded, setExpanded] = useState<string | null>(list[0]?.id ?? null);
  const notesHtml = useMemo(() => {
    const md = getTopicNotes(topic.id);
    if (!md) return '';
    return marked.parse(md, { async: false }) as string;
  }, [topic.id]);

  useEffect(() => {
    setExpanded(list[0]?.id ?? null);
  }, [topic.id, showIncomplete]);

  const choose = (q: TopicQuestion, label: string) => {
    if (picked[q.id] || needsMissingFigure(q)) return;
    const correct = label === q.answer;
    setPicked(p => ({ ...p, [q.id]: label }));
    setOpenSol(s => ({ ...s, [q.id]: true }));
    recordAttempt(topic.id, q.id, correct);
  };

  const reveal = (qid: string) => setOpenSol(s => ({ ...s, [qid]: true }));

  return (
    <div className="topic-learn">
      <div className="topic-learn-bar card">
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
        <div className="topic-learn-bar-copy">
          <strong>{topic.topic}</strong>
          <span>
            {practicePool.length} practice
            {incompleteCount ? ` · ${incompleteCount} need figure/series` : ''}
            {' · '}quiz from the top bar
          </span>
        </div>
        <div className="topic-learn-quiz">
          {incompleteCount > 0 && (
            <label className="topic-incomplete-toggle">
              <input
                type="checkbox"
                checked={showIncomplete}
                onChange={e => setShowIncomplete(e.target.checked)}
              />
              Show incomplete
            </label>
          )}
          <label className="field">
            Quiz size
            <select
              value={Math.min(quizSize, practicePool.length || 1)}
              onChange={e => setQuizSize(Number(e.target.value))}
              disabled={!practicePool.length}
            >
              {counts.map(n => (
                <option key={n} value={n}>
                  {n === practicePool.length ? `All (${n})` : n}
                </option>
              ))}
            </select>
          </label>
          <button className="btn" onClick={onStartQuiz} disabled={!practicePool.length}>
            Start quiz
          </button>
        </div>
      </div>

      <div className="topic-learn-split">
      <div className="topic-q-list">
        {!list.length && (
          <div className="card topic-missing-banner">
            <strong>No complete questions in this topic yet.</strong>
            <p>
              Several items only had a figure/series in the PDF image, so the text extract has nothing
              to practice. Use <em>Show incomplete</em> to browse them, or pick another topic.
            </p>
          </div>
        )}
        {list.map((q, i) => {
          const given = picked[q.id];
          const locked = given !== undefined;
          const shown = Boolean(openSol[q.id]);
          const isOpen = expanded === q.id;
          const missing = needsMissingFigure(q);
          const status = missing
            ? 'missing'
            : locked
              ? given === q.answer
                ? 'right'
                : 'wrong'
              : shown
                ? 'seen'
                : '';
          return (
            <article className={`topic-q-item ${isOpen ? 'open' : ''} ${status}`} key={q.id}>
              <button
                type="button"
                className="topic-q-summary"
                onClick={() => setExpanded(isOpen ? null : q.id)}
                aria-expanded={isOpen}
              >
                <span className="topic-q-num">{i + 1}</span>
                <span className="topic-q-preview">
                  <strong>{q.stem}</strong>
                  <small>
                    {missing ? 'Figure/series missing · ' : ''}
                    {q.source}
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
                  <QuestionMedia q={q} />
                  {missing && (
                    <div className="topic-missing-banner">
                      <strong>Figure / series missing</strong>
                      <p>
                        The PDF only had this as an image, so the series or diagram was not extracted
                        as text. Skip this one — quizzes never include incomplete questions.
                      </p>
                    </div>
                  )}
                  <div className={`lesson-opts ${optsLayout(q.options)}`}>
                    {q.options.map(o => {
                      let cls = 'opt lesson-opt';
                      if (shown || locked) {
                        if (o.label === q.answer) cls += ' right';
                        else if (o.label === given) cls += ' wrong';
                      }
                      return (
                        <button
                          key={o.label}
                          className={cls}
                          disabled={locked || shown || missing}
                          onClick={() => choose(q, o.label)}
                        >
                          <span className="lesson-letter">{letter(o.label)}</span>
                          <span>{o.text}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!missing && !shown && !locked && (
                    <button className="btn ghost topic-reveal" onClick={() => reveal(q.id)}>
                      Show answer & solution
                    </button>
                  )}
                  {shown && !missing && (
                    <div className={`lesson-fb ${!given || given === q.answer ? 'ok' : 'no'}`}>
                      <strong>
                        {given
                          ? given === q.answer
                            ? 'Correct'
                            : `Wrong · Answer ${letter(q.answer)}`
                          : `Answer ${letter(q.answer)}`}
                      </strong>
                      <p>
                        {q.solution
                          ? q.solution
                          : 'The paper gave the answer only, with no worked solution.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <aside className="topic-notes card">
        <p className="topic-notes-kicker">Formulas & short tricks</p>
        {notesHtml ? (
          <div className="md" dangerouslySetInnerHTML={{ __html: notesHtml }} />
        ) : (
          <p className="empty">Notes for this topic will appear here.</p>
        )}
      </aside>
      </div>
    </div>
  );
}

function QuizMode({
  topic,
  deck,
  qi,
  setQi,
  picked,
  setPicked,
  right,
  answered,
  done,
  setDone,
  onExitLearn,
  onBack,
  onRetry,
}: {
  topic: TopicSet;
  deck: TopicQuestion[];
  qi: number;
  setQi: Dispatch<SetStateAction<number>>;
  picked: Record<string, string>;
  setPicked: Dispatch<SetStateAction<Record<string, string>>>;
  right: MutableRefObject<number>;
  answered: MutableRefObject<number>;
  done: boolean;
  setDone: () => void;
  onExitLearn: () => void;
  onBack: () => void;
  onRetry: () => void;
}) {
  const total = deck.length;
  const q = deck[Math.min(qi, Math.max(total - 1, 0))];
  const given = q ? picked[q.id] : undefined;
  const locked = given !== undefined;
  const ok = locked && given === q!.answer;

  const choose = (label: string) => {
    if (!q || picked[q.id]) return;
    const correct = label === q.answer;
    setPicked(p => ({ ...p, [q.id]: label }));
    answered.current += 1;
    if (correct) right.current += 1;
    recordAttempt(topic.id, q.id, correct);
  };

  const next = () => {
    if (qi + 1 >= total) setDone();
    else setQi(n => n + 1);
  };

  if (done || !q) {
    const pct = answered.current ? Math.round((right.current / answered.current) * 100) : 0;
    return (
      <div className="lesson">
        <div className="card lesson-results">
          <p className="lesson-kicker">Quiz complete</p>
          <div className="score">
            {right.current} / {answered.current}
          </div>
          <div className="stats">
            <div>
              <b>{pct}%</b>accuracy
            </div>
            <div>
              <b>{total}</b>in quiz
            </div>
            <div>
              <b>{total - answered.current}</b>skipped
            </div>
          </div>
          <div className="actions">
            <button className="btn" onClick={onRetry}>
              Try again
            </button>
            <button className="btn ghost" onClick={onExitLearn}>
              Back to learn
            </button>
            <button className="btn ghost" onClick={onBack}>
              Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson">
      <div className="qtop">
        <button className="link" onClick={onExitLearn}>
          Exit quiz
        </button>
        <span>
          {qi + 1} / {total}
        </span>
      </div>
      <div className="bartrack">
        <i style={{ width: `${((qi + (locked ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <div className="card lesson-card">
        <QuestionMedia q={q} />
        <p className="lesson-source">{q.source}</p>
        <h2 className="lesson-stem">{q.stem}</h2>

        <div className={`lesson-opts ${optsLayout(q.options)}`}>
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
