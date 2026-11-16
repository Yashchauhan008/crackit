import bank from '../data/topicBank.json';

export type TopicOption = { label: string; text: string };
export type TopicQuestion = {
  id: string;
  stem: string;
  passage: string;
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
