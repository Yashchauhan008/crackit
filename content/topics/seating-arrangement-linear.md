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
