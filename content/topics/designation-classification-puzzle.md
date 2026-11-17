# Designation / Classification Puzzle

These puzzles assign people to roles, departments, ranks, cities, subjects, or categories.

### 30.1 Grid method

Create a table:
- Rows = people.
- Columns = designations or categories.
- Mark `✓` for confirmed assignments.
- Mark `×` for impossible assignments.
- If each person has exactly one unique designation, each row and column should contain exactly one `✓`.

### 30.2 Apply constraints

- “A is senior to B”: create an order constraint.
- “A is not manager”: eliminate the manager column for A.
- “Neither A nor B is in sales”: eliminate sales for both.
- “The doctor is from Jaipur”: link designation and city.
- “A is either the analyst or the manager”: retain both possibilities until another clue resolves them.

### 30.3 Ranking hierarchy

If designations have a fixed hierarchy, write it once from highest to lowest. Translate “senior/junior”, “above/below”, and “immediately higher/lower” into position constraints.

### 30.4 Efficient solving sequence

1. Place direct positive clues.
2. Apply exclusions.
3. Handle “either/or” clues as separate cases if necessary.
4. Connect attributes across categories.
5. Check uniqueness and every clue at the end.

### 30.5 Important caution

Do not assume that every category is unique or that every person has exactly one category unless the question establishes that condition.

---

# Illustrations

## 27. Designation / Classification — deduction grid

Example layout only:

| Person | Manager | Analyst | Clerk |
|---|:---:|:---:|:---:|
| A | ✓ | × | × |
| B | × | ✓ | × |
| C | × | × | ✓ |

Mark a cell only when a clue proves it or rules it out. Do not assume all categories are unique unless the question says so.

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

