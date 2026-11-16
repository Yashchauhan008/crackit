/** Quiz registry: add a new mini quiz by adding one entry here. */
export type Quiz = {
  name: string;
  min: number;
  max: number;
  fn: (n: number) => number;
  label: (n: number) => string;
  tag: string;
};

export const QUIZZES: Record<string, Quiz> = {
  squares: { name: 'Squares', min: 1, max: 30, fn: n => n * n, label: n => `${n}²`, tag: 'Square of' },
  cubes: { name: 'Cubes', min: 1, max: 20, fn: n => n ** 3, label: n => `${n}³`, tag: 'Cube of' },
};

export const quizName = (id: string) => QUIZZES[id]?.name ?? id;
