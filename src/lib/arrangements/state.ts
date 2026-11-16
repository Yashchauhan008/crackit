import type { ArrangementPuzzle, SeatState, SolveStep } from './types';

export function emptySeats(count: number): SeatState[] {
  return Array.from({ length: count }, () => ({ person: null, facing: null, fresh: false }));
}

/** Apply steps[0..stepIndex] inclusive. Marks only the latest step’s seats as fresh. */
export function seatsAtStep(puzzle: ArrangementPuzzle, stepIndex: number): SeatState[] {
  const seats = emptySeats(puzzle.seatCount);
  if (stepIndex < 0) return seats;

  const end = Math.min(stepIndex, puzzle.steps.length - 1);
  for (let s = 0; s <= end; s++) {
    applyStep(seats, puzzle.steps[s]!, s === end);
  }
  return seats;
}

export function seatsFinal(puzzle: ArrangementPuzzle): SeatState[] {
  const seats = emptySeats(puzzle.seatCount);
  for (const p of puzzle.final) {
    seats[p.index] = { person: p.person, facing: p.facing ?? null, fresh: false };
  }
  return seats;
}

function applyStep(seats: SeatState[], step: SolveStep, markFresh: boolean) {
  for (const s of seats) s.fresh = false;
  for (const p of step.placements) {
    const prev = seats[p.index];
    const facing = p.facing ?? prev?.facing ?? null;
    const changed = prev?.person !== p.person || (!!p.facing && prev?.facing !== p.facing);
    seats[p.index] = { person: p.person, facing, fresh: markFresh && changed };
  }
}

export function highlightAtStep(puzzle: ArrangementPuzzle, stepIndex: number): number[] {
  if (stepIndex < 0 || stepIndex >= puzzle.steps.length) return [];
  return puzzle.steps[stepIndex]?.highlight ?? [];
}
