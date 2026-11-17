import bank from '../data/topicBank.json';

export type TopicOption = { label: string; text: string };
export type TopicChartSeries = { name: string; values: number[]; color?: string };
export type TopicChart = {
  type?: string;
  kind?: string;
  categories: string[];
  series: TopicChartSeries[];
  caption?: string;
};
export type TopicTable = {
  headers?: string[];
  columns?: string[];
  rows: string[][];
  caption?: string;
};

export type TopicQuestion = {
  id: string;
  stem: string;
  passage: string;
  /** Cropped diagram from the source PDF, e.g. `/q-figures/.../dir-46-50.png` */
  figure?: string;
  /** Structured bar/line chart reconstructed from the PDF */
  chart?: TopicChart;
  /** Structured table reconstructed from the PDF */
  table?: TopicTable;
  options: TopicOption[];
  answer: string;
  solution: string;
  source: string;
};
export type TopicSet = {
  id: string;
  topic: string;
  section: string;
  questions: TopicQuestion[];
};

export const TOPIC_BANK = bank as {
  papers: number;
  topics: number;
  questions: number;
  withSolution: number;
  sets: TopicSet[];
};

export const getTopic = (id: string) => TOPIC_BANK.sets.find(t => t.id === id);
