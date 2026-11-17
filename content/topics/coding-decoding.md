# Coding-Decoding

### 24.1 Alphabet positions

Memorise:

`A=1, B=2, C=3, …, Z=26`

Reverse positions:

`A=26, B=25, …, Z=1`

Useful pairs:
- A–Z, B–Y, C–X, D–W, …
- Position of reverse letter = `27 − original position`.

### 24.2 Common coding rules

- Forward shift: each letter moves `+k`.
- Backward shift: each letter moves `−k`.
- Alternating shifts: `+1, −1, +2, −2`, etc.
- Reverse the word.
- Reverse alphabet substitution.
- Rearrange letters by position.
- Replace letters with their alphabet numbers.
- Combine letter position with a fixed number or word length.

### 24.3 Caesar-shift method

For a shift of `k`:
- Encode: new position = `((old position−1+k) mod 26)+1`.
- Decode: use the same formula with `−k`.

This handles wrap-around from Z to A.

### 24.4 Word coding

Compare words that share letters:
1. Find repeated letters and repeated code symbols.
2. Match common letters with common code elements.
3. Check order: code may preserve or reverse the original order.
4. Test the rule on every example.

### 24.5 Number coding

Check:
- Sum of letter positions.
- Product of positions.
- Difference between positions.
- First/last letter positions.
- Word length, vowel count, consonant count.
- Position-based weights such as `1×first + 2×second`.

### 24.6 Quick tip

Write alphabet positions above the word. This avoids repeated mental counting and reduces off-by-one mistakes.

---

# Illustrations

## 22. Coding-Decoding — alphabet positions

```text
A  B  C  D  E  F  G  H  I  J  K  L  M
1  2  3  4  5  6  7  8  9 10 11 12 13

N  O  P  Q  R  S  T  U  V  W  X  Y  Z
14 15 16 17 18 19 20 21 22 23 24 25 26

Reverse pairs:
A ↔ Z    B ↔ Y    C ↔ X    D ↔ W

Reverse-letter position = 27 - original position.
```
