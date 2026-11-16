import { TOPIC_BANK } from '../../lib/topicBank';

type Props = { onOpen: (id: string) => void; onBack: () => void };

export default function TopicList({ onOpen, onBack }: Props) {
  const sections = [...new Set(TOPIC_BANK.sets.map(t => t.section))];
  return (
    <>
      <div className="cardhead" style={{ marginBottom: 14 }}>
        <p className="sub" style={{ margin: 0 }}>
          {TOPIC_BANK.topics} quizzes · {TOPIC_BANK.questions} questions from {TOPIC_BANK.papers} papers. Duplicates removed.{' '}
          {TOPIC_BANK.withSolution} include a printed solution.
        </p>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>
      {sections.map(section => (
        <section key={section}>
          <h2 style={{ margin: '8px 0 12px' }}>{section}</h2>
          <div className="offer-grid">
            {TOPIC_BANK.sets
              .filter(t => t.section === section)
              .map(t => {
                const solved = t.questions.filter(q => q.solution).length;
                return (
                  <article className="offer" key={t.id}>
                    <div className="offer-top">
                      <div className="offer-id">
                        <span className="mark">{t.questions.length}</span>
                        <strong>{t.topic}</strong>
                      </div>
                    </div>
                    <div className="meta">
                      <div>
                        <span>Questions</span>
                        <b>{t.questions.length}</b>
                      </div>
                      <div>
                        <span>With solution</span>
                        <b>{solved}</b>
                      </div>
                    </div>
                    <p className="blurb">Collected from every 2025 paper in the bank. Repeated questions are kept once.</p>
                    <div className="offer-actions">
                      <button className="btn" onClick={() => onOpen(t.id)}>
                        Start
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}
