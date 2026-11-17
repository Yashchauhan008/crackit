# Arrangements

Seating puzzles (linear, circular, square). Read the passage, answer MCQs, then use **Solve** to watch each clue place people.

# Seating Arrangement — Linear

### 31.1 Fix the reference direction

For people facing North:
- Their left is the observer's left.
- Their right is the observer's right.

For people facing South:
- Their left and right are reversed from the observer's view.

Always draw the row and mark the facing direction before placing anyone.

### 31.2 Position notation

For `N` seats, number positions from left to right as `1` to `N`.

- Immediate left/right = one position away, from the person's perspective.
- Second to the left/right = two positions away.
- `k` people between A and B means their position difference is `k+1`.

### 31.3 Opposite-facing groups

When people face opposite directions, use each person's own perspective:
- If A faces North, A's left is west/left on the page.
- If B faces South, B's left is east/right on the page.

A small arrow beside every person helps avoid reversal errors.

### 31.4 Solving workflow

1. Draw the required number of seat slots.
2. Place fixed end positions and immediate-neighbour clues.
3. Apply negative clues.
4. Keep multiple cases when the arrangement is not uniquely determined.
5. Use remaining clues to eliminate cases.
6. Recheck all clues from each person's perspective.

### 31.5 Common traps

- “A is left of B” is not necessarily “immediately left”.
- “Two people sit between” means a position gap of three.
- Do not switch viewing direction midway through the puzzle.

---

## 32. Seating Arrangement — Circular

### 32.1 Fix one person

For a circular arrangement, fix one person at the top to remove rotational duplicates. This does not change relative seating.

### 32.2 Facing the centre

When all face the centre:
- A person's left is clockwise.
- A person's right is anticlockwise.

### 32.3 Facing outside

When all face outside:
- A person's left is anticlockwise.
- A person's right is clockwise.

### 32.4 Opposite positions

For an even number `N` of people, the person opposite a position is `N/2` seats away.

Example: with 8 people, opposite position is 4 seats away.

### 32.5 Solving workflow

1. Fix one reference person.
2. Place direct neighbour/opposite clues.
3. Apply left/right rules based on centre/outside orientation.
4. Keep cases for uncertain placements.
5. Verify each clue around the circle.

### 32.6 Common traps

- Clockwise/anticlockwise left-right rules reverse when people face outside.
- “Second to the left” means two seats away, with one person in between.
- Rotation does not create a new circular arrangement; reflection may create a different arrangement unless the question treats mirror images as equivalent.

---

## 33. Seating Arrangement — Square

### 33.1 Draw the four sides

Draw a square with the same number of seat slots on every side if the question says the seating is equally distributed. Label each side before placing people:
- Top side
- Right side
- Bottom side
- Left side

Do not assume equal numbers per side unless specified.

### 33.2 Facing directions

For people seated around the outside of a square:
- People on opposite sides may face different directions.
- Determine each person's left and right from their own facing direction, not from the page.

Write a small arrow for every person or side.

### 33.3 Corner and side positions

Separate:
- Corner seats.
- Middle seats on each side.

A corner person's immediate neighbours are on the two adjoining sides. A side-middle person's immediate neighbours are the adjacent positions on that same side.

### 33.4 Opposite positions

For a symmetrical square arrangement, identify the actual seat opposite across the centre. Do not assume that “opposite” always means the same side label when the number of seats per side is not stated.

### 33.5 Solving workflow

1. Draw the exact number of positions.
2. Mark corners and side-middle positions.
3. Fix a reference person or a fixed clue.
4. Translate every left/right clue using the person's facing direction.
5. Place immediate neighbours and opposite pairs.
6. Test remaining cases against all clues.

### 33.6 Common traps

- Confusing the observer's left/right with the seated person's left/right.
- Assuming a person at a corner has the same neighbour relationship as a person in the middle of a side.
- Drawing a generic four-seat square when the puzzle has more positions.

---

# Illustrations

## 28. Linear seating — everyone facing North

```text
Observer's view; everyone faces North (↑)

LEFT                                                  RIGHT
 1        2        3        4        5        6
┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
│ A ↑│  │ B ↑│  │ C ↑│  │ D ↑│  │ E ↑│  │ F ↑│
└────┘  └────┘  └────┘  └────┘  └────┘  └────┘

Facing North: person's left/right matches observer's left/right.
Facing South: person's left/right is reversed.
```

## 29. Circular seating — facing centre or outside

```text
                 A
            F         B
          E      ○      C
                 D

When facing CENTRE:
left = clockwise; right = anticlockwise.

When facing OUTSIDE:
left = anticlockwise; right = clockwise.
```

Fix one reference person to avoid duplicate rotations.

## 30. Square seating — corners and sides

```text
                         TOP SIDE
                 [1]      [2]      [3]
              ┌─────────────────────────┐
 LEFT SIDE    │                         │    RIGHT SIDE
    [12]      │                         │      [4]
    [11]      │                         │      [5]
    [10]      │                         │      [6]
              └─────────────────────────┘
                 [9]      [8]      [7]
                        BOTTOM SIDE

Illustrative 12-seat square. Use the actual number of seats in the question.
Mark facing directions before applying left/right clues.
```
