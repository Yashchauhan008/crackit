import { useState } from 'react';
import { getTopic } from '../../lib/topicBank';
import { loadStats, saveStats } from '../../lib/storage';

type Props = { topicId: string; onBack: () => void };

const letter = (label: string) => label.toUpperCase();

export default function TopicQuiz({ topicId, onBack }: Props) {
  const topic = getTopic(topicId);
  const [picked, setPicked] = useState<Record<string, string>>({});

  if (!topic) {
    return (
      <>
        <p className="empty">Topic not found.</p>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </>
    );
  }

  const choose = (qid: string, label: string, answer: string) => {
    if (picked[qid]) return;
    setPicked(p => ({ ...p, [qid]: label }));
    const stats = loadStats();
    const key = `topics:${topic.id}:${qid}`;
    const s = (stats[key] ??= { r: 0, w: 0 });
    if (label === answer) s.r++;
    else s.w++;
    s.last = label === answer;
    saveStats(stats);
  };

  const done = Object.keys(picked).length;
  const right = topic.questions.filter(q => picked[q.id] === q.answer).length;

  return (
    <>
      <div className="cardhead" style={{ marginBottom: 14 }}>
        <p className="sub" style={{ margin: 0 }}>
          {done} / {topic.questions.length} answered
          {done ? ` · ${right} correct` : ''}
        </p>
        <button className="btn ghost" onClick={onBack}>
          Practice
        </button>
      </div>
      {topic.questions.map((q, i) => {
        const given = picked[q.id];
        const locked = given !== undefined;
        const showPassage = q.passage && q.passage !== topic.questions[i - 1]?.passage;
        return (
          <article className="card" key={q.id}>
            {showPassage && <div className="topic-pass">{q.passage}</div>}
            <div className="topic-stem">
              {i + 1}. {q.stem}
            </div>
            <div className="arr-source">{q.source}</div>
            <div className="arr-opts" style={{ marginTop: 10 }}>
              {q.options.map(o => {
                let cls = 'opt arr-opt';
                if (locked) {
                  if (o.label === q.answer) cls += ' right';
                  else if (o.label === given) cls += ' wrong';
                }
                return (
                  <button key={o.label} className={cls} disabled={locked} onClick={() => choose(q.id, o.label, q.answer)}>
                    <kbd>{letter(o.label)}</kbd>
                    {o.text}
                  </button>
                );
              })}
            </div>
            {locked && (
              <div className={`topic-sol ${given === q.answer ? 'up' : 'down'}`}>
                {given === q.answer ? 'Correct' : `Answer: ${letter(q.answer)}`}
                {q.solution ? `\n${q.solution}` : '\nThe paper gave the answer only, with no worked solution.'}
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}
