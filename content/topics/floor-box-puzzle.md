# Floor / Box Puzzle

### 23.1 Floor puzzle setup

Create a vertical list of floors, e.g. top to bottom:

`7, 6, 5, 4, 3, 2, 1`

Write one person per floor unless the question states otherwise.

### 23.2 Translation of clues

- “A lives above B”: A's floor number is greater if numbering increases upward.
- “A lives immediately above B”: floors differ by exactly 1.
- “Two floors between A and B”: floor difference is 3.
- “A is not on an odd floor”: restrict A to even floors.
- “A lives on an even-numbered floor”: remove all odd options.

Be consistent about whether floor 1 is the bottom or top.

### 23.3 Box stacking

Represent positions from top to bottom. Translate:
- Immediately above/below = adjacent positions.
- Two boxes between = position difference 3.
- At least one box between = not adjacent.
- Topmost/bottommost = fixed endpoint.

### 23.4 Efficient solving

1. List all positions.
2. Place fixed endpoints and immediate pairs.
3. Apply negative clues to eliminate positions.
4. Use linked attributes (person, colour, subject, box label) in separate columns.
5. Check every clue after completing the arrangement.

### 23.5 Avoiding errors

Do not assume “above” means immediately above. Do not assume a floor or box position is unique unless the puzzle says so. Keep candidate cases separate when a clue does not determine one arrangement.

---

# Illustrations

## 21. Floor / Box puzzle — positions

```text
TOP       Floor 7   ┌───────────────┐
                    │ Person / Box  │
          Floor 6   ├───────────────┤
                    │ Person / Box  │
          Floor 5   ├───────────────┤
                    │ Person / Box  │
          Floor 4   ├───────────────┤
                    │ Person / Box  │
          Floor 3   ├───────────────┤
                    │ Person / Box  │
          Floor 2   ├───────────────┤
                    │ Person / Box  │
BOTTOM    Floor 1   └───────────────┘
```

Redraw the exact number of positions in the question. “Immediately above” means adjacent; “above” alone does not.

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

