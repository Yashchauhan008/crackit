# Alphanumeric Series

### 27.1 Alphabet position

Use `A=1` to `Z=26`. Reverse position is `27−normal position`.

### 27.2 Series scan

For a mixed series:
- Number the positions.
- Separate letters, digits, and symbols.
- Check the pattern within each group.
- Check whether the groups alternate.
- Check whether letters move forward/backward by a fixed or changing number.
- Check whether digits form arithmetic, geometric, square, or prime sequences.

### 27.3 Position-based questions

For a series of length `N`:
- Position from right = `N−position from left+1`.
- If asked for the element `k` places to the right/left, count positions carefully and respect the series endpoints.
- In “between” questions, count only elements strictly between the two specified positions.

### 27.4 Vowels and consonants

Vowels: A, E, I, O, U. All other alphabet letters are consonants.

When asked to rearrange letters alphabetically:
- Sort letters in ascending order.
- Preserve repeated letters unless instructed to remove duplicates.
- For reverse alphabetical order, sort descending.

### 27.5 Common traps

- Symbols may count as elements in position questions.
- A digit such as `10` may be one number or two characters, depending on the displayed series.
- Confirm whether the question refers to letters only or all characters.

---

# Illustrations

## 25. Alphanumeric Series — separate the streams

```text
Example: A  3  C  6  E  9  G  12

Letters: A → C → E → G   (move +2 positions)
Numbers: 3 → 6 → 9 → 12  (add 3)

Number each position, then inspect letters, digits, and symbols separately.
```
