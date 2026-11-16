import type { ArrangementPuzzle, Facing, Placement } from './types';
import { EXAM_SETS } from './examSets';

const ans = (letter: string) => letter.toLowerCase().charCodeAt(0) - 97;

const row = (people: string[], facing?: Facing | Record<string, Facing>): Placement[] =>
  people.map((person, index) => ({
    index,
    person,
    facing: typeof facing === 'string' ? facing : facing?.[person],
  }));

const circle = (people: string[], facing?: Facing | Record<string, Facing>): Placement[] => row(people, facing);

/** All seating puzzles: PDF memory-based + teaching sets + prelims-level sets. */
export const ARRANGEMENTS: ArrangementPuzzle[] = [
  // —— Original teaching sets ——
  {
    id: 'teach_linear_5',
    title: '5 in a row (North)',
    layout: 'linear',
    seatCount: 5,
    people: ['A', 'B', 'C', 'D', 'E'],
    dualFacing: false,
    source: 'Original',
    passage:
      'Five persons A, B, C, D and E sit in a row facing north.\n' +
      'B sits at one of the extreme ends. C sits second to the right of B. A sits immediate left of C. D sits second to the left of E.',
    steps: [
      {
        condition: 'B sits at one of the extreme ends. Try left end first.',
        placements: [{ index: 0, person: 'B', facing: 'north' }],
        highlight: [0],
      },
      {
        condition: 'C sits second to the right of B → seats: B _ C _ _',
        placements: [
          { index: 0, person: 'B', facing: 'north' },
          { index: 2, person: 'C', facing: 'north' },
        ],
        highlight: [0, 2],
      },
      {
        condition: 'A sits immediate left of C → B A C _ _',
        placements: [
          { index: 0, person: 'B', facing: 'north' },
          { index: 1, person: 'A', facing: 'north' },
          { index: 2, person: 'C', facing: 'north' },
        ],
        highlight: [1, 2],
      },
      {
        condition: 'D sits second to the left of E → only fit is D then E on the right.',
        placements: [
          { index: 0, person: 'B', facing: 'north' },
          { index: 1, person: 'A', facing: 'north' },
          { index: 2, person: 'C', facing: 'north' },
          { index: 3, person: 'D', facing: 'north' },
          { index: 4, person: 'E', facing: 'north' },
        ],
        highlight: [3, 4],
      },
    ],
    final: row(['B', 'A', 'C', 'D', 'E'], 'north'),
    questions: [
      {
        id: '1',
        text: 'Who sits in the middle of the row?',
        options: ['A', 'B', 'C', 'D', 'E'],
        answerIndex: ans('c'),
      },
      {
        id: '2',
        text: 'What is the position of A with respect to B?',
        options: ['Immediate left', 'Immediate right', 'Second to the right', 'Second to the left', 'Third to the right'],
        answerIndex: ans('b'),
      },
      {
        id: '3',
        text: 'How many persons sit between B and D?',
        options: ['None', 'One', 'Two', 'Three', 'Four'],
        answerIndex: ans('c'),
      },
    ],
  },
  {
    id: 'teach_circular_6',
    title: '6 around a table (inside)',
    layout: 'circular',
    seatCount: 6,
    people: ['P', 'Q', 'R', 'S', 'T', 'U'],
    dualFacing: false,
    source: 'Original',
    passage:
      'Six persons P, Q, R, S, T and U sit around a circular table facing the centre.\n' +
      'P sits second to the right of Q. R sits immediate left of P. S sits opposite Q. T sits immediate right of S. U sits immediate left of Q.',
    steps: [
      {
        // Facing centre: person's right = anti-clockwise on the top-view diagram; left = clockwise.
        condition:
          'Facing the centre: right = anti-clockwise, left = clockwise. Fix Q at the top. P is second to Q’s right → two seats anti-clockwise. U is immediate left of Q → one seat clockwise.',
        placements: [
          { index: 0, person: 'Q', facing: 'in' },
          { index: 4, person: 'P', facing: 'in' },
          { index: 1, person: 'U', facing: 'in' },
        ],
        highlight: [0, 4, 1],
      },
      {
        condition: 'R sits immediate left of P (clockwise from P). S sits opposite Q.',
        placements: [
          { index: 0, person: 'Q', facing: 'in' },
          { index: 1, person: 'U', facing: 'in' },
          { index: 3, person: 'S', facing: 'in' },
          { index: 4, person: 'P', facing: 'in' },
          { index: 5, person: 'R', facing: 'in' },
        ],
        highlight: [4, 5, 3],
      },
      {
        condition: 'T sits immediate right of S (anti-clockwise from S) → last open seat.',
        placements: [
          { index: 0, person: 'Q', facing: 'in' },
          { index: 1, person: 'U', facing: 'in' },
          { index: 2, person: 'T', facing: 'in' },
          { index: 3, person: 'S', facing: 'in' },
          { index: 4, person: 'P', facing: 'in' },
          { index: 5, person: 'R', facing: 'in' },
        ],
        highlight: [3, 2],
      },
    ],
    // Clockwise from top: Q, U, T, S, P, R
    final: circle(['Q', 'U', 'T', 'S', 'P', 'R'], 'in'),
    questions: [
      {
        id: '1',
        text: 'Who sits opposite Q?',
        options: ['P', 'R', 'S', 'T', 'U'],
        answerIndex: ans('c'),
      },
      {
        id: '2',
        text: 'Who sits immediate right of P?',
        options: ['Q', 'R', 'S', 'T', 'U'],
        answerIndex: ans('c'),
      },
      {
        id: '3',
        text: 'How many persons sit between R and S when counted clockwise from R?',
        options: ['None', 'One', 'Two', 'Three', 'Four'],
        answerIndex: ans('d'),
      },
    ],
  },
  {
    id: 'teach_linear_7_dual',
    title: '7 in a row (N/S)',
    layout: 'linear',
    seatCount: 7,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    dualFacing: true,
    source: 'Original',
    passage:
      'Seven persons A, B, C, D, E, F and G sit in a row. Some face north and some face south.\n' +
      'G sits at the extreme left end and faces north. A sits at the extreme right end and faces north. ' +
      'D sits immediate right of G and faces north. E sits immediate right of D and faces north. ' +
      'F sits immediate right of E and faces south. C sits immediate right of F and faces south. ' +
      'B sits immediate right of C and faces south.',
    steps: [
      {
        condition: 'Ends first: G at extreme left (north), A at extreme right (north).',
        placements: [
          { index: 0, person: 'G', facing: 'north' },
          { index: 6, person: 'A', facing: 'north' },
        ],
        highlight: [0, 6],
      },
      {
        condition: 'D immediate right of G (north). E immediate right of D (north).',
        placements: [
          { index: 0, person: 'G', facing: 'north' },
          { index: 1, person: 'D', facing: 'north' },
          { index: 2, person: 'E', facing: 'north' },
          { index: 6, person: 'A', facing: 'north' },
        ],
        highlight: [1, 2],
      },
      {
        condition: 'F immediate right of E (south). C immediate right of F (south).',
        placements: [
          { index: 0, person: 'G', facing: 'north' },
          { index: 1, person: 'D', facing: 'north' },
          { index: 2, person: 'E', facing: 'north' },
          { index: 3, person: 'F', facing: 'south' },
          { index: 4, person: 'C', facing: 'south' },
          { index: 6, person: 'A', facing: 'north' },
        ],
        highlight: [3, 4],
      },
      {
        condition: 'B immediate right of C (south) → fills the last seat.',
        placements: [
          { index: 0, person: 'G', facing: 'north' },
          { index: 1, person: 'D', facing: 'north' },
          { index: 2, person: 'E', facing: 'north' },
          { index: 3, person: 'F', facing: 'south' },
          { index: 4, person: 'C', facing: 'south' },
          { index: 5, person: 'B', facing: 'south' },
          { index: 6, person: 'A', facing: 'north' },
        ],
        highlight: [4, 5],
      },
    ],
    final: row(['G', 'D', 'E', 'F', 'C', 'B', 'A'], {
      G: 'north',
      D: 'north',
      E: 'north',
      F: 'south',
      C: 'south',
      B: 'south',
      A: 'north',
    }),
    questions: [
      {
        id: '1',
        text: 'Who sits at the extreme right end?',
        options: ['G', 'F', 'A', 'B', 'C'],
        answerIndex: ans('c'),
      },
      {
        id: '2',
        text: 'Who among the following faces south?',
        options: ['G', 'D', 'E', 'F', 'A'],
        answerIndex: ans('d'),
      },
      {
        id: '3',
        text: 'What is the position of C with respect to A?',
        options: ['Immediate left', 'Second to the left', 'Third to the left', 'Immediate right', 'Second to the right'],
        answerIndex: ans('b'),
      },
    ],
  },

  // —— PDF: 1st shift linear 9 ——
  {
    id: '1st_shift_linear_9',
    title: '9 in a row (North) — RRB PO 1st shift',
    layout: 'linear',
    seatCount: 9,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    dualFacing: false,
    source: 'IBPS RRB PO Pre 22 Nov 2025 · 1st shift',
    passage:
      'Nine persons A, B, C, D, E, F, G, H and I sit in a row facing north but not in the same order as given.\n' +
      'Three persons sit between B and G. C sits second to the right of G. H sits third to the left of C. E and H sit adjacent to each other. ' +
      'One person sits between E and A. F sits second to the left of D.',
    steps: [
      {
        condition: 'Three between B and G; C second right of G → try G left of B: G _ _ _ B with C two right of G.',
        placements: [
          { index: 4, person: 'G', facing: 'north' },
          { index: 6, person: 'C', facing: 'north' },
          { index: 8, person: 'B', facing: 'north' },
        ],
        highlight: [4, 6, 8],
      },
      {
        condition: 'H third left of C → H at seat before G. E adjacent to H.',
        placements: [
          { index: 3, person: 'H', facing: 'north' },
          { index: 4, person: 'G', facing: 'north' },
          { index: 6, person: 'C', facing: 'north' },
          { index: 8, person: 'B', facing: 'north' },
        ],
        highlight: [3, 6],
      },
      {
        condition: 'E adjacent to H; one between E and A → E left of H, A further left with I between.',
        placements: [
          { index: 0, person: 'A', facing: 'north' },
          { index: 1, person: 'I', facing: 'north' },
          { index: 2, person: 'E', facing: 'north' },
          { index: 3, person: 'H', facing: 'north' },
          { index: 4, person: 'G', facing: 'north' },
          { index: 6, person: 'C', facing: 'north' },
          { index: 8, person: 'B', facing: 'north' },
        ],
        highlight: [0, 2, 3],
      },
      {
        condition: 'F second left of D → F and D fill the two open seats between G–C–B.',
        placements: [
          { index: 0, person: 'A', facing: 'north' },
          { index: 1, person: 'I', facing: 'north' },
          { index: 2, person: 'E', facing: 'north' },
          { index: 3, person: 'H', facing: 'north' },
          { index: 4, person: 'G', facing: 'north' },
          { index: 5, person: 'F', facing: 'north' },
          { index: 6, person: 'C', facing: 'north' },
          { index: 7, person: 'D', facing: 'north' },
          { index: 8, person: 'B', facing: 'north' },
        ],
        highlight: [5, 7],
      },
    ],
    final: row(['A', 'I', 'E', 'H', 'G', 'F', 'C', 'D', 'B'], 'north'),
    questions: [
      {
        id: '1',
        text: 'What is the position of I with respect to G?',
        options: ['Immediate right', 'Fifth to the left', 'Second to the right', 'Third to the left', 'Third to the right'],
        answerIndex: ans('d'),
      },
      {
        id: '2',
        text: 'How many persons sit to the left of F?',
        options: ['One', 'Four', 'Five', 'Two', 'Three'],
        answerIndex: ans('c'),
      },
      {
        id: '3',
        text: 'Number of persons sit between D and H is same as ______.',
        options: ['Between G and C', 'To the left of B', 'Between E and B', 'Between I and A', 'To the right of F'],
        answerIndex: ans('e'),
      },
      {
        id: '4',
        text: 'Who among the following sits fourth to the left of C?',
        options: ['E', 'A', 'I', 'B', 'F'],
        answerIndex: ans('a'),
      },
      {
        id: '5',
        text: 'Which of the following statement is correct?\nI. A sits at one of the extreme ends\nII. G sits exactly middle of the row\nIII. C and F are not immediate neighbors to each other',
        options: ['Only I and III', 'Only II', 'Only I and II', 'Only II and III', 'Only I'],
        answerIndex: ans('c'),
      },
    ],
  },

  // —— PDF: 1st shift circular 8 in/out ——
  {
    id: '1st_shift_circular_8_inout',
    title: '8 circular (in/out) — RRB PO 1st shift',
    layout: 'circular',
    seatCount: 8,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    dualFacing: true,
    source: 'IBPS RRB PO Pre 22 Nov 2025 · 1st shift',
    passage:
      'Eight persons A, B, C, D, E, F, G and H sit around a circular table but not in the same order as given. Some of them face inside and some face outside.\n' +
      'One person sits between B and C. H sits second to the right of C. Two persons sit between H and A. D sits immediate left of A. ' +
      'Both the immediate neighbors of A face opposite direction of A. Three persons sit between G and E. G and B face same direction but they do not sit adjacent to each other. ' +
      'Less than three persons face outside.',
    steps: [
      {
        condition: 'Place C, then H second to the right of C. One between B and C → B near C.',
        placements: [
          { index: 0, person: 'C', facing: 'out' },
          { index: 2, person: 'H', facing: 'in' },
        ],
        highlight: [0, 2],
      },
      {
        condition: 'Two between H and A; D immediate left of A → build the A–D side of the circle.',
        placements: [
          { index: 0, person: 'C', facing: 'out' },
          { index: 2, person: 'H', facing: 'in' },
          { index: 5, person: 'A', facing: 'out' },
          { index: 4, person: 'D', facing: 'in' },
        ],
        highlight: [2, 4, 5],
      },
      {
        condition: 'Neighbours of A face opposite to A. Place B and fill remaining with facing rules (only A,C outside).',
        placements: [
          { index: 0, person: 'C', facing: 'out' },
          { index: 1, person: 'F', facing: 'in' },
          { index: 2, person: 'H', facing: 'in' },
          { index: 3, person: 'G', facing: 'in' },
          { index: 4, person: 'D', facing: 'in' },
          { index: 5, person: 'A', facing: 'out' },
          { index: 6, person: 'B', facing: 'in' },
          { index: 7, person: 'E', facing: 'in' },
        ],
        highlight: [5, 6, 7],
      },
    ],
    final: circle(['C', 'F', 'H', 'G', 'D', 'A', 'B', 'E'], {
      C: 'out',
      F: 'in',
      H: 'in',
      G: 'in',
      D: 'in',
      A: 'out',
      B: 'in',
      E: 'in',
    }),
    questions: [
      {
        id: '35',
        text: 'What is the position of B with respect to F?',
        options: ['2nd to the right', '3rd to the right', '2nd to the left', '4th to the right', '3rd to the left'],
        answerIndex: ans('b'),
      },
      {
        id: '36',
        text: 'Four of the following five are similar in a certain manner and related to a group. Who among the following is not related to the group?',
        options: ['C', 'H', 'G', 'D', 'B'],
        answerIndex: ans('a'),
      },
      {
        id: '37',
        text: 'How many persons sit between E and D when counted from the left of D?',
        options: ['Four', 'Three', 'One', 'Two', 'Five'],
        answerIndex: ans('d'),
      },
      {
        id: '38',
        text: 'Who among the following sits immediate left of H?',
        options: ['D', 'B', 'E', 'F', 'G'],
        answerIndex: ans('e'),
      },
      {
        id: '39',
        text: 'Which of the following statement is/are correct?',
        options: [
          'H and C face the same direction',
          'D face inside',
          'All options are correct',
          'F sits opposite to B',
          'E sits immediate right of C',
        ],
        answerIndex: ans('b'),
      },
    ],
  },

  // —— PDF: 2nd shift circular 9 ——
  {
    id: '2nd_shift_circular_9_inside',
    title: '9 circular (inside) — RRB PO 2nd shift',
    layout: 'circular',
    seatCount: 9,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    dualFacing: false,
    source: 'IBPS RRB PO Pre 22 Nov 2025 · 2nd shift',
    passage:
      'Nine persons A, B, C, D, E, F, G, H and I sit around a circular table facing inside but not in the same order as given.\n' +
      'G sits fourth to the right of B. Two persons sit between G and E. H sits fifth to the left of E. One person sits between H and A. ' +
      'D sits immediate right of F who sits third to the right of C.',
    steps: [
      {
        condition: 'Place B, then G fourth to the right of B.',
        placements: [
          { index: 7, person: 'B', facing: 'in' },
          { index: 3, person: 'G', facing: 'in' },
        ],
        highlight: [7, 3],
      },
      {
        condition: 'Two between G and E; H fifth left of E.',
        placements: [
          { index: 7, person: 'B', facing: 'in' },
          { index: 3, person: 'G', facing: 'in' },
          { index: 6, person: 'E', facing: 'in' },
          { index: 2, person: 'H', facing: 'in' },
        ],
        highlight: [3, 6, 2],
      },
      {
        condition: 'One between H and A; C–F–D chain: F third right of C, D immediate right of F.',
        placements: [
          { index: 0, person: 'A', facing: 'in' },
          { index: 1, person: 'I', facing: 'in' },
          { index: 2, person: 'H', facing: 'in' },
          { index: 3, person: 'G', facing: 'in' },
          { index: 4, person: 'D', facing: 'in' },
          { index: 5, person: 'F', facing: 'in' },
          { index: 6, person: 'E', facing: 'in' },
          { index: 7, person: 'B', facing: 'in' },
          { index: 8, person: 'C', facing: 'in' },
        ],
        highlight: [0, 5, 8],
      },
    ],
    final: circle(['A', 'I', 'H', 'G', 'D', 'F', 'E', 'B', 'C'], 'in'),
    questions: [
      {
        id: '6',
        text: 'What is the position of F with respect to H?',
        options: ['Second to the left', 'Third to the left', 'Immediate right', 'Fourth to the right', 'Immediate left'],
        answerIndex: ans('b'),
      },
      {
        id: '7',
        text: 'Four of the following five are similar in a certain way and related to a group. Which of the following is not related to the group?',
        options: ['B - F', 'D - H', 'I - C', 'G - I', 'A - E'],
        answerIndex: ans('e'),
      },
      {
        id: '8',
        text: 'Who among the following sits second to the left of the one who sits fifth to the right of D?',
        options: ['G', 'H', 'I', 'A', 'E'],
        answerIndex: ans('c'),
      },
      {
        id: '9',
        text: 'How many persons sit between F and A when counted from the left of F?',
        options: ['Five', 'Two', 'Four', 'Three', 'One'],
        answerIndex: ans('d'),
      },
      {
        id: '10',
        text: 'Who among the following sits immediate left of E?',
        options: ['A', 'I', 'F', 'C', 'B'],
        answerIndex: ans('e'),
      },
    ],
  },

  // —— PDF: 2nd shift linear dual ——
  {
    id: '2nd_shift_linear_8_dual_facing',
    title: '8 in a row (N/S) — RRB PO 2nd shift',
    layout: 'linear',
    seatCount: 8,
    people: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    dualFacing: true,
    source: 'IBPS RRB PO Pre 22 Nov 2025 · 2nd shift',
    passage:
      'Eight persons A, B, C, D, E, F, G and H sit in a row but not in the same order as given. Some persons face north and some face south direction.\n' +
      'A sits second to the right of F and both face the same direction. B and F sit immediate left to each other. ' +
      'Number of persons sit between A and B is same as the number of persons sit to the right of A. ' +
      'Three persons sit between D and H and both face opposite direction to each other. G sits immediate right of D. ' +
      'Both the immediate neighbors of C face north which is opposite to C. Number of persons face north is more than the number of persons face south.',
    steps: [
      {
        condition: 'A second right of F (same direction); B immediate left of F → … B F _ A …',
        placements: [
          { index: 2, person: 'B', facing: 'south' },
          { index: 3, person: 'F', facing: 'north' },
          { index: 5, person: 'A', facing: 'north' },
        ],
        highlight: [2, 3, 5],
      },
      {
        condition: 'Between A and B equals persons right of A → two between B…A and two right of A. Place C and E on the right.',
        placements: [
          { index: 2, person: 'B', facing: 'south' },
          { index: 3, person: 'F', facing: 'north' },
          { index: 5, person: 'A', facing: 'north' },
          { index: 6, person: 'C', facing: 'south' },
          { index: 7, person: 'E', facing: 'north' },
        ],
        highlight: [5, 6, 7],
      },
      {
        condition: 'Three between D and H; G immediate right of D; neighbours of C face north.',
        placements: [
          { index: 0, person: 'D', facing: 'north' },
          { index: 1, person: 'G', facing: 'north' },
          { index: 2, person: 'B', facing: 'south' },
          { index: 3, person: 'F', facing: 'north' },
          { index: 4, person: 'H', facing: 'south' },
          { index: 5, person: 'A', facing: 'north' },
          { index: 6, person: 'C', facing: 'south' },
          { index: 7, person: 'E', facing: 'north' },
        ],
        highlight: [0, 1, 4],
      },
    ],
    final: row(['D', 'G', 'B', 'F', 'H', 'A', 'C', 'E'], {
      D: 'north',
      G: 'north',
      B: 'south',
      F: 'north',
      H: 'south',
      A: 'north',
      C: 'south',
      E: 'north',
    }),
    questions: [
      {
        id: '29',
        text: 'What is the position of B with respect to C?',
        options: ['Second to the right', 'Immediate left', 'Fourth to the right', 'Third to the left', 'Fifth to the right'],
        answerIndex: ans('c'),
      },
      {
        id: '30',
        text: 'Four of the following five are similar in a certain way and related to a group. Who among the following is not related to the group?',
        options: ['A', 'H', 'E', 'G', 'D'],
        answerIndex: ans('b'),
      },
      {
        id: '31',
        text: 'How many persons sit to the left of E?',
        options: ['None', 'One', 'Two', 'More than three', 'Three'],
        answerIndex: ans('d'),
      },
      {
        id: '32',
        text: 'Which of the following statement is correct?\nI. G faces south\nII. C is not the immediate neighbor of A and E\nIII. F and H sit immediate right to each other',
        options: ['Only I', 'Only II', 'Only III', 'Only I and II', 'Only II and III'],
        answerIndex: ans('c'),
      },
      {
        id: '33',
        text: 'Who among the following sits immediate left of E?',
        options: ['D', 'B', 'H', 'A', 'C'],
        answerIndex: ans('e'),
      },
    ],
  },
  ...EXAM_SETS,
];

export const getArrangement = (id: string) => ARRANGEMENTS.find(p => p.id === id);

export const layoutLabel = (p: ArrangementPuzzle) => {
  if (p.layout === 'circular') return p.dualFacing ? 'Circular · in/out' : 'Circular · inside';
  return p.dualFacing ? 'Linear · N/S' : 'Linear · North';
};
