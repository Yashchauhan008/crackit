# Word Formation / Arrangement

### 29.1 Word formation

Given a set of letters:
1. Count the frequency of each letter.
2. A target word is possible only if it does not require more copies of any letter than supplied.
3. Ignore letter order unless the question explicitly requires consecutive or fixed-order letters.
4. Use each letter only as many times as it appears.

### 29.2 Number of arrangements

If all `n` letters are distinct:

`Number of arrangements = n!`

If there are repeated letters with counts `p,q,r,...`:

`Arrangements = n!/(p!q!r!...)`

### 29.3 Arrangements with restrictions

- A and B together: treat AB as one block; multiply by 2 if AB and BA are both allowed.
- A and B not together = total arrangements − arrangements with A and B together.
- Fixed first/last positions: place those letters first, then arrange the remaining letters.
- Circular arrangements of `n` distinct objects: `(n−1)!`, when rotations are considered identical.

### 29.4 Alphabetical arrangement

Arrange letters by alphabet position. For repeated letters, preserve their multiplicity. To find a word from selected letters, compare letter counts rather than only checking whether each letter appears.

### 29.5 Word-position questions

If a word is formed by alphabetically arranging its letters:
- Find the required letter's sorted position.
- Account for repeated letters.
- Do not treat repeated copies as distinct unless the question asks for distinct arrangements.

---

# Illustrations

## 26. Word Formation — letter-count check

**Flow**

- Given letters → Count each letter
- Count each letter → Compare with required word
- Compare with required word → Enough copies of every letter?
- Enough copies of every letter? —(Yes)→ Word can be formed
- Enough copies of every letter? —(No)→ Word cannot be formed


For distinct arrangements with repeated letters: `n! / (p! q! r! ...)`.
