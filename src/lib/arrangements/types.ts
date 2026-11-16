/** Seating arrangement puzzles (linear / circular) with step-by-step solve animation. */

export type Layout = 'linear' | 'circular';

/** Facing for a person: row uses north/south; circle uses in/out. */
export type Facing = 'north' | 'south' | 'in' | 'out';

export type Placement = {
  /** Seat index 0..seatCount-1 (left→right for linear, clockwise from top for circular). */
  index: number;
  person: string;
  facing?: Facing;
};

export type SolveStep = {
  /** Clue text shown while this step animates. */
  condition: string;
  /** Newly known seats after applying this clue. */
  placements: Placement[];
  /** Optional seats to pulse / connect for “X is left of Y”. */
  highlight?: number[];
};

export type ArrangementQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string, string];
  /** 0–4 for A–E */
  answerIndex: number;
};

export type ArrangementPuzzle = {
  id: string;
  title: string;
  layout: Layout;
  seatCount: number;
  people: string[];
  passage: string;
  /** true when seats may face opposite ways (N/S or in/out). */
  dualFacing: boolean;
  steps: SolveStep[];
  final: Placement[];
  questions: ArrangementQuestion[];
  source?: string;
};

export type SeatState = {
  person: string | null;
  facing: Facing | null;
  fresh: boolean;
};
