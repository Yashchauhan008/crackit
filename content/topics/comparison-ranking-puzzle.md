# Comparison / Ranking Puzzle

### 22.1 Rank from top and bottom

If total number of people is `N`:
- Rank from bottom = `N − rank from top + 1`.
- Rank from top = `N − rank from bottom + 1`.
- Total people = `rank from top + rank from bottom − 1`.

### 22.2 People between two ranks

- If A and B have ranks `r1` and `r2` from the same end, number between = `|r1−r2|−1`.
- If ranks are from opposite ends, convert both to the same end first.

### 22.3 Interchanging positions

If A and B exchange positions:
- The new rank of A is B's old rank.
- The new rank of B is A's old rank.
- Use the given rank change to form an equation.

### 22.4 Comparison symbols

Translate every statement into a consistent chain:
- A taller than B: `A>B`.
- A not shorter than B: `A≥B`.
- A is between B and C: determine whether the order is `B>A>C` or `C>A>B` from the wording.

### 22.5 Puzzle table method

Make one row per person and columns for attributes (rank, height, score, age, etc.). Fill direct clues first, then derive constraints. Mark uncertain candidates separately rather than guessing.

### 22.6 Common traps

- “Third from the top” is not the same as “three people above”.
- When counting people, include the person whose rank is given.
- “A is ahead of B” does not establish how many positions separate them.

---

# Illustrations

## 20. Ranking — top and bottom

```text
TOP
 1  ── Person A
 2
 3
 4
 5
 6  ── Person B
BOTTOM

Total people = rank from top + rank from bottom - 1
```

## 31. General puzzle-solving workflow

**Flow**

- Read all clues → Draw slots, table, or diagram
- Draw slots, table, or diagram → Enter fixed facts
- Enter fixed facts → Apply exclusions
- Apply exclusions → Multiple cases remain?
- Multiple cases remain? —(Yes)→ Create separate cases
- Multiple cases remain? —(No)→ Complete positions
- Create separate cases → Use remaining clues to eliminate cases
- Use remaining clues to eliminate cases → Complete positions
- Complete positions → Verify every clue
- Verify every clue → Answer the exact question

