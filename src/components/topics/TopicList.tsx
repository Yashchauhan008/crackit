import { TOPIC_BANK } from '../../lib/topicBank';

type Props = { onOpen: (id: string) => void; onBack: () => void };

export default function TopicList({ onOpen, onBack }: Props) {
  const sections = [...new Set(TOPIC_BANK.sets.map(t => t.section))];
  return (
    <div className="practice">
      <div className="cardhead">
        <p className="sub" style={{ margin: 0 }}>
          {TOPIC_BANK.topics} lessons · {TOPIC_BANK.questions} questions from {TOPIC_BANK.papers} papers
        </p>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>
      {sections.map(section => {
        const sets = TOPIC_BANK.sets.filter(t => t.section === section);
        return (
          <section className="lesson-section" key={section}>
            <div className="lesson-section-head">
              <h2>{section}</h2>
              <span>{sets.length} lessons</span>
            </div>
            <div className="lesson-list">
              {sets.map(t => (
                <button className="lesson-row" key={t.id} onClick={() => onOpen(t.id)}>
                  <div className="lesson-row-main">
                    <strong>{t.topic}</strong>
                    <span>
                      {t.questions.length} questions · {t.questions.filter(q => q.solution).length} with solution
                    </span>
                  </div>
                  <span className="lesson-row-cta">Start</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
