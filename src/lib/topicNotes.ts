/** Vite raw imports of topic study notes (formulas / short tricks). */
const files = import.meta.glob('../../content/topics/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const byId: Record<string, string> = {};
for (const [path, md] of Object.entries(files)) {
  const id = path.split('/').pop()?.replace(/\.md$/, '') ?? '';
  if (id) byId[id] = md;
}

export function getTopicNotes(topicId: string): string | null {
  return byId[topicId] ?? null;
}
