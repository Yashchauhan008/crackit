import type { TopicQuestion } from './topicBank';

/** Stem hints that the question depends on a shared series / figure / table. */
const NEEDS_CONTEXT =
  /\b(the series|in the series|given below|given above|following (?:figure|graph|table|chart|diagram|information|arrangement)|study the|as shown|in the figure|in the diagram|in the graph|in the table|bar graph|pie chart|line graph|based on the)\b/i;

/**
 * True when the question likely needs a figure/series/table that is missing
 * from the PDF text extract (empty passage).
 */
export function needsMissingFigure(q: TopicQuestion): boolean {
  if (q.figure || q.chart || q.table) return false;
  const passage = (q.passage || '').trim();
  if (passage.length >= 20) return false;
  return NEEDS_CONTEXT.test(q.stem || '');
}

export function usableQuestions(questions: TopicQuestion[]): TopicQuestion[] {
  return questions.filter(q => !needsMissingFigure(q));
}
