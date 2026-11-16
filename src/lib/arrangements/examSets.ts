import type { ArrangementPuzzle, Facing, Placement } from './types';

const ans = (letter: string) => letter.toLowerCase().charCodeAt(0) - 97;

const row = (people: string[], facing?: Facing | Record<string, Facing>): Placement[] =>
  people.map((person, index) => ({
    index,
    person,
    facing: typeof facing === 'string' ? facing : facing?.[person],
  }));

const LEVEL = 'IBPS RRB PO Prelims level';

/**
 * Same patterns as previous-year RRB / IBPS PO prelims seating sets
 * (linear north, linear N/S, circular inside, circular in/out).
 * Written as original solved sets — not copied from a publisher’s paper.
 */
export const EXAM_SETS: ArrangementPuzzle[] = [
  {
    id: 'level_linear_8_north',
    title: '8 in a row (North) — prelims',
    layout: 'linear',
    seatCount: 8,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    dualFacing: false,
    source: LEVEL,
    passage:
      'Eight persons A, B, C, D, E, F, G and H sit in a row facing north.\n' +
      'F sits at one of the extreme ends. Only two persons sit between A and F. A sits third to the right of C. ' +
      'E sits immediate right of C. D sits immediate left of A. H sits second to the right of A. ' +
      'B sits at the extreme left end. G sits immediate right of A.',
    steps: [
      {
        condition: 'F is at the right end (the left end cannot fit “A is third to the right of C”). Two seats between A and F → A sits three places left of F.',
        placements: [
          { index: 4, person: 'A', facing: 'north' },
          { index: 7, person: 'F', facing: 'north' },
        ],
        highlight: [4, 7],
      },
      {
        condition: 'A is third to the right of C, so C is three seats left of A. E sits immediate right of C.',
        placements: [
          { index: 1, person: 'C', facing: 'north' },
          { index: 2, person: 'E', facing: 'north' },
          { index: 4, person: 'A', facing: 'north' },
          { index: 7, person: 'F', facing: 'north' },
        ],
        highlight: [1, 2, 4],
      },
      {
        condition: 'D is immediate left of A. H is second to the right of A. G is immediate right of A. B takes the extreme left.',
        placements: [
          { index: 0, person: 'B', facing: 'north' },
          { index: 1, person: 'C', facing: 'north' },
          { index: 2, person: 'E', facing: 'north' },
          { index: 3, person: 'D', facing: 'north' },
          { index: 4, person: 'A', facing: 'north' },
          { index: 5, person: 'G', facing: 'north' },
          { index: 6, person: 'H', facing: 'north' },
          { index: 7, person: 'F', facing: 'north' },
        ],
        highlight: [0, 3, 5, 6],
      },
    ],
    final: row(['B', 'C', 'E', 'D', 'A', 'G', 'H', 'F'], 'north'),
    questions: [
      {
        id: '1',
        text: 'Who sits second to the left of G?',
        options: ['B', 'C', 'D', 'E', 'H'],
        answerIndex: ans('c'),
      },
      {
        id: '2',
        text: 'How many persons sit between C and A?',
        options: ['None', 'One', 'Two', 'Three', 'Four'],
        answerIndex: ans('c'),
      },
      {
        id: '3',
        text: 'Who sits at the extreme right end?',
        options: ['A', 'B', 'F', 'H', 'G'],
        answerIndex: ans('c'),
      },
      {
        id: '4',
        text: 'Who sits immediate left of H?',
        options: ['A', 'G', 'F', 'D', 'E'],
        answerIndex: ans('b'),
      },
      {
        id: '5',
        text: 'What is the position of E with respect to A?',
        options: ['Immediate left', 'Immediate right', 'Second to the left', 'Third to the left', 'Second to the right'],
        answerIndex: ans('c'),
      },
    ],
  },
  {
    id: 'level_linear_9_north',
    title: '9 in a row (North) — prelims',
    layout: 'linear',
    seatCount: 9,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    dualFacing: false,
    source: LEVEL,
    passage:
      'Nine persons A, B, C, D, E, F, G, H and I sit in a row facing north.\n' +
      'H sits at one of the extreme ends. D sits immediate left of H. F sits immediate left of D. I sits immediate left of F. ' +
      'B sits immediate left of I. Two persons sit between A and I. G sits immediate right of A. E sits immediate left of A. C sits at the extreme left end.',
    steps: [
      {
        condition: 'Someone must sit left of H, so H is the right end. D is immediate left of H, F is immediate left of D.',
        placements: [
          { index: 6, person: 'F', facing: 'north' },
          { index: 7, person: 'D', facing: 'north' },
          { index: 8, person: 'H', facing: 'north' },
        ],
        highlight: [6, 7, 8],
      },
      {
        condition: 'I is immediate left of F. B is immediate left of I.',
        placements: [
          { index: 4, person: 'B', facing: 'north' },
          { index: 5, person: 'I', facing: 'north' },
          { index: 6, person: 'F', facing: 'north' },
          { index: 7, person: 'D', facing: 'north' },
          { index: 8, person: 'H', facing: 'north' },
        ],
        highlight: [4, 5],
      },
      {
        condition: 'Two between A and I puts A three seats left of I. G is immediate right of A. E is immediate left of A. C is the extreme left.',
        placements: [
          { index: 0, person: 'C', facing: 'north' },
          { index: 1, person: 'E', facing: 'north' },
          { index: 2, person: 'A', facing: 'north' },
          { index: 3, person: 'G', facing: 'north' },
          { index: 4, person: 'B', facing: 'north' },
          { index: 5, person: 'I', facing: 'north' },
          { index: 6, person: 'F', facing: 'north' },
          { index: 7, person: 'D', facing: 'north' },
          { index: 8, person: 'H', facing: 'north' },
        ],
        highlight: [0, 1, 2, 3],
      },
    ],
    final: row(['C', 'E', 'A', 'G', 'B', 'I', 'F', 'D', 'H'], 'north'),
    questions: [
      {
        id: '1',
        text: 'Who sits exactly in the middle of the row?',
        options: ['G', 'B', 'I', 'A', 'F'],
        answerIndex: ans('b'),
      },
      {
        id: '2',
        text: 'Who sits second to the right of G?',
        options: ['B', 'I', 'F', 'A', 'D'],
        answerIndex: ans('b'),
      },
      {
        id: '3',
        text: 'How many persons sit to the left of D?',
        options: ['Five', 'Six', 'Seven', 'Four', 'Eight'],
        answerIndex: ans('c'),
      },
      {
        id: '4',
        text: 'Who sits fourth to the left of H?',
        options: ['I', 'B', 'G', 'F', 'A'],
        answerIndex: ans('b'),
      },
      {
        id: '5',
        text: 'How many persons sit between A and I?',
        options: ['None', 'One', 'Two', 'Three', 'Four'],
        answerIndex: ans('c'),
      },
    ],
  },
  {
    id: 'level_linear_8_ns',
    title: '8 in a row (N/S) — prelims',
    layout: 'linear',
    seatCount: 8,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    dualFacing: true,
    source: LEVEL,
    passage:
      'Eight persons A, B, C, D, E, F, G and H sit in a row. Some face north and some face south.\n' +
      'In this set, “left” and “right” mean the left and right ends of the row as drawn.\n' +
      'D sits at the extreme left end and faces north. H sits at the extreme right end and faces south. ' +
      'A sits immediate right of D and faces south. F sits second to the right of D and faces north. ' +
      'C sits immediate right of F and faces south. B sits immediate right of C and faces north. ' +
      'E sits second to the left of G. G sits immediate left of H and faces south. E faces north.',
    steps: [
      {
        condition: 'Ends first: D at the left end facing north, H at the right end facing south.',
        placements: [
          { index: 0, person: 'D', facing: 'north' },
          { index: 7, person: 'H', facing: 'south' },
        ],
        highlight: [0, 7],
      },
      {
        condition: 'A is immediate right of D and faces south. F is second to the right of D and faces north. C is immediate right of F and faces south.',
        placements: [
          { index: 0, person: 'D', facing: 'north' },
          { index: 1, person: 'A', facing: 'south' },
          { index: 2, person: 'F', facing: 'north' },
          { index: 3, person: 'C', facing: 'south' },
          { index: 7, person: 'H', facing: 'south' },
        ],
        highlight: [1, 2, 3],
      },
      {
        condition: 'B is immediate right of C and faces north. G is immediate left of H and faces south. E is the remaining seat and faces north.',
        placements: [
          { index: 0, person: 'D', facing: 'north' },
          { index: 1, person: 'A', facing: 'south' },
          { index: 2, person: 'F', facing: 'north' },
          { index: 3, person: 'C', facing: 'south' },
          { index: 4, person: 'B', facing: 'north' },
          { index: 5, person: 'E', facing: 'north' },
          { index: 6, person: 'G', facing: 'south' },
          { index: 7, person: 'H', facing: 'south' },
        ],
        highlight: [4, 5, 6],
      },
    ],
    final: row(['D', 'A', 'F', 'C', 'B', 'E', 'G', 'H'], {
      D: 'north',
      A: 'south',
      F: 'north',
      C: 'south',
      B: 'north',
      E: 'north',
      G: 'south',
      H: 'south',
    }),
    questions: [
      {
        id: '1',
        text: 'Who sits immediate left of H?',
        options: ['E', 'G', 'B', 'F', 'A'],
        answerIndex: ans('b'),
      },
      {
        id: '2',
        text: 'How many persons face south?',
        options: ['Two', 'Three', 'Four', 'Five', 'One'],
        answerIndex: ans('c'),
      },
      {
        id: '3',
        text: 'Who sits second to the right of A?',
        options: ['F', 'C', 'B', 'E', 'G'],
        answerIndex: ans('b'),
      },
      {
        id: '4',
        text: 'Which of the following pairs face north?',
        options: ['A and C', 'D and F', 'G and H', 'A and H', 'C and G'],
        answerIndex: ans('b'),
      },
      {
        id: '5',
        text: 'Who sits between B and G?',
        options: ['E', 'G', 'C', 'F', 'A'],
        answerIndex: ans('a'),
      },
    ],
  },
  {
    id: 'level_circular_8_in',
    title: '8 circular (inside) — prelims',
    layout: 'circular',
    seatCount: 8,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    dualFacing: false,
    source: LEVEL,
    passage:
      'Eight persons A, B, C, D, E, F, G and H sit around a circular table facing the centre.\n' +
      'Facing the centre: right is anti-clockwise, left is clockwise.\n' +
      'B sits second to the right of A. C sits immediate left of A. G sits second to the left of C. ' +
      'H sits opposite C. D sits immediate right of H. F sits immediate left of B. E sits between C and G.',
    steps: [
      {
        condition: 'Fix A at the top. B is second to A’s right (two seats anti-clockwise). C is immediate left of A (clockwise).',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 6, person: 'B', facing: 'in' },
        ],
        highlight: [0, 1, 6],
      },
      {
        condition: 'G is second to the left of C. H sits opposite C. D is immediate right of H.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 3, person: 'G', facing: 'in' },
          { index: 4, person: 'D', facing: 'in' },
          { index: 5, person: 'H', facing: 'in' },
          { index: 6, person: 'B', facing: 'in' },
        ],
        highlight: [3, 4, 5],
      },
      {
        condition: 'E sits between C and G. F is immediate left of B.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 2, person: 'E', facing: 'in' },
          { index: 3, person: 'G', facing: 'in' },
          { index: 4, person: 'D', facing: 'in' },
          { index: 5, person: 'H', facing: 'in' },
          { index: 6, person: 'B', facing: 'in' },
          { index: 7, person: 'F', facing: 'in' },
        ],
        highlight: [2, 7],
      },
    ],
    final: row(['A', 'C', 'E', 'G', 'D', 'H', 'B', 'F'], 'in'),
    questions: [
      {
        id: '1',
        text: 'Who sits opposite A?',
        options: ['B', 'C', 'D', 'E', 'H'],
        answerIndex: ans('c'),
      },
      {
        id: '2',
        text: 'Who sits immediate right of B?',
        options: ['F', 'H', 'G', 'D', 'A'],
        answerIndex: ans('b'),
      },
      {
        id: '3',
        text: 'Who sits immediate left of A?',
        options: ['B', 'C', 'F', 'H', 'E'],
        answerIndex: ans('b'),
      },
      {
        id: '4',
        text: 'Who sits second to the left of F?',
        options: ['A', 'C', 'B', 'H', 'D'],
        answerIndex: ans('b'),
      },
      {
        id: '5',
        text: 'How many persons sit between D and B when counted clockwise from D?',
        options: ['None', 'One', 'Two', 'Three', 'Four'],
        answerIndex: ans('b'),
      },
    ],
  },
  {
    id: 'level_circular_9_in',
    title: '9 circular (inside) — prelims',
    layout: 'circular',
    seatCount: 9,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    dualFacing: false,
    source: LEVEL,
    passage:
      'Nine persons A, B, C, D, E, F, G, H and I sit around a circular table facing the centre.\n' +
      'Facing the centre: right is anti-clockwise, left is clockwise.\n' +
      'C sits immediate left of A. D sits second to the left of C. I sits between C and D. ' +
      'E sits fourth to the right of A. F sits immediate right of E. G sits immediate left of E. ' +
      'H sits immediate right of A. B sits second to the right of A.',
    steps: [
      {
        condition: 'Fix A at the top. C is immediate left (clockwise). D is second left of C, so I sits in the seat between them.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 2, person: 'I', facing: 'in' },
          { index: 3, person: 'D', facing: 'in' },
        ],
        highlight: [0, 1, 2, 3],
      },
      {
        condition: 'E is fourth to the right of A (four seats anti-clockwise). F is immediate right of E. G is immediate left of E.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 2, person: 'I', facing: 'in' },
          { index: 3, person: 'D', facing: 'in' },
          { index: 4, person: 'F', facing: 'in' },
          { index: 5, person: 'E', facing: 'in' },
          { index: 6, person: 'G', facing: 'in' },
        ],
        highlight: [4, 5, 6],
      },
      {
        condition: 'H is immediate right of A. B is second to the right of A — the last two seats.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 2, person: 'I', facing: 'in' },
          { index: 3, person: 'D', facing: 'in' },
          { index: 4, person: 'F', facing: 'in' },
          { index: 5, person: 'E', facing: 'in' },
          { index: 6, person: 'G', facing: 'in' },
          { index: 7, person: 'B', facing: 'in' },
          { index: 8, person: 'H', facing: 'in' },
        ],
        highlight: [7, 8],
      },
    ],
    final: row(['A', 'C', 'I', 'D', 'F', 'E', 'G', 'B', 'H'], 'in'),
    questions: [
      {
        id: '1',
        text: 'Who sits immediate left of B?',
        options: ['G', 'H', 'E', 'A', 'F'],
        answerIndex: ans('b'),
      },
      {
        id: '2',
        text: 'Who sits second to the left of F?',
        options: ['E', 'G', 'D', 'I', 'B'],
        answerIndex: ans('b'),
      },
      {
        id: '3',
        text: 'Who sits immediate right of A?',
        options: ['B', 'C', 'H', 'G', 'I'],
        answerIndex: ans('c'),
      },
      {
        id: '4',
        text: 'How many persons sit between A and E when counted anti-clockwise from A?',
        options: ['One', 'Two', 'Three', 'Four', 'Five'],
        answerIndex: ans('c'),
      },
      {
        id: '5',
        text: 'Who sits between C and D?',
        options: ['A', 'I', 'F', 'G', 'B'],
        answerIndex: ans('b'),
      },
    ],
  },
  {
    id: 'level_circular_8_inout',
    title: '8 circular (in/out) — prelims',
    layout: 'circular',
    seatCount: 8,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    dualFacing: true,
    source: LEVEL,
    passage:
      'Eight persons A, B, C, D, E, F, G and H sit around a circular table. Some face the centre and some face outside.\n' +
      'Facing the centre: right is anti-clockwise and left is clockwise. Facing outside reverses that.\n' +
      'A faces the centre. C sits immediate left of A and faces the centre. E sits immediate left of C and faces outside. ' +
      'G sits immediate right of E and faces the centre. B sits immediate left of G and faces outside. ' +
      'D sits immediate right of B and faces the centre. F sits immediate left of D and faces outside. ' +
      'H sits immediate right of F and faces the centre.',
    steps: [
      {
        condition: 'A faces the centre at the top. C is immediate left of A (clockwise) and also faces the centre. E is immediate left of C and faces outside.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 2, person: 'E', facing: 'out' },
        ],
        highlight: [0, 1, 2],
      },
      {
        condition: 'E faces outside, so E’s right is clockwise. G sits there and faces the centre. B is immediate left of G.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 2, person: 'E', facing: 'out' },
          { index: 3, person: 'G', facing: 'in' },
          { index: 4, person: 'B', facing: 'out' },
        ],
        highlight: [2, 3, 4],
      },
      {
        condition: 'B faces outside, so B’s right is clockwise: D. D faces in, so D’s left is clockwise: F (outside). F’s right is clockwise: H, who faces the centre.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'C', facing: 'in' },
          { index: 2, person: 'E', facing: 'out' },
          { index: 3, person: 'G', facing: 'in' },
          { index: 4, person: 'B', facing: 'out' },
          { index: 5, person: 'D', facing: 'in' },
          { index: 6, person: 'F', facing: 'out' },
          { index: 7, person: 'H', facing: 'in' },
        ],
        highlight: [5, 6, 7],
      },
    ],
    final: row(['A', 'C', 'E', 'G', 'B', 'D', 'F', 'H'], {
      A: 'in',
      C: 'in',
      E: 'out',
      G: 'in',
      B: 'out',
      D: 'in',
      F: 'out',
      H: 'in',
    }),
    questions: [
      {
        id: '1',
        text: 'Who sits opposite A?',
        options: ['E', 'G', 'B', 'D', 'F'],
        answerIndex: ans('c'),
      },
      {
        id: '2',
        text: 'Who sits immediate right of A?',
        options: ['C', 'H', 'B', 'F', 'G'],
        answerIndex: ans('b'),
      },
      {
        id: '3',
        text: 'How many persons face outside?',
        options: ['One', 'Two', 'Three', 'Four', 'Five'],
        answerIndex: ans('c'),
      },
      {
        id: '4',
        text: 'Who sits immediate left of B?',
        options: ['G', 'D', 'E', 'H', 'A'],
        answerIndex: ans('a'),
      },
      {
        id: '5',
        text: 'Which of the following pairs face the centre?',
        options: ['E and B', 'A and C', 'F and E', 'B and F', 'E and F'],
        answerIndex: ans('b'),
      },
    ],
  },
];
