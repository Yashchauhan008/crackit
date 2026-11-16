import { marked } from 'marked';
import { useMemo } from 'react';

/** Study notes live in frontend/content/*.md. File name (minus the "NN-" prefix) = quiz id, e.g. 01-squares.md -> squares. */
const files = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export type Topic = { id: string; title: string; md: string };

export const TOPICS: Topic[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, md]) => ({
    id: path.split('/').pop()!.replace(/\.md$/, '').replace(/^\d+-/, ''),
    title: /^#\s+(.+)$/m.exec(md)?.[1] ?? path,
    md,
  }));

export default function Learn({
  topicId,
  onPick,
  onQuiz,
}: {
  topicId?: string;
  onPick: (id: string) => void;
  onQuiz: (id: string) => void;
}) {
  const topic = TOPICS.find(t => t.id === topicId) ?? TOPICS[0];
  const html = useMemo(() => (topic ? (marked.parse(topic.md, { async: false }) as string) : ''), [topic]);

  if (!topic) return <p className="empty">No study notes yet. Add a .md file to frontend/content.</p>;

  return (
    <>
      <div className="row" style={{ marginTop: 0 }}>
        <div className="tabs">
          {TOPICS.map(t => (
            <button key={t.id} className={t.id === topic.id ? 'on' : ''} onClick={() => onPick(t.id)}>
              {t.id.charAt(0).toUpperCase() + t.id.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn" onClick={() => onQuiz(topic.id)}>
          Take the quiz
        </button>
      </div>
      <article className="card md" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
