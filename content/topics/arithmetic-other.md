# Arithmetic – Other

This is a broad category. First identify whether the question is about numbers, fractions, HCF/LCM, divisibility, remainders, or another arithmetic concept.

### 1.1 Fractions and basic identities

- `a/b + c/d = (ad + bc)/bd`
- `a/b − c/d = (ad − bc)/bd`
- `a/b × c/d = ac/bd`
- `(a/b) ÷ (c/d) = ad/bc`
- `x% of y = y% of x`.
- A fraction `a/b` as a percentage is `(a/b) × 100%`.
- To compare fractions with positive denominators, cross-multiply: compare `ad` and `bc` for `a/b` and `c/d`.
- If numerator and denominator are both multiplied or divided by the same non-zero number, the fraction's value does not change.

### 1.2 HCF and LCM

- For two positive integers: `HCF × LCM = product of the two integers`.
- Prime-factorisation method:
  - HCF: take each common prime with its **smallest** exponent.
  - LCM: take every prime with its **largest** exponent.
- For fractions in lowest terms:
  - HCF = HCF of numerators / LCM of denominators.
  - LCM = LCM of numerators / HCF of denominators.
- Greatest number that divides several numbers leaving the same remainder: find the HCF of their pairwise differences.
- Least number exactly divisible by several numbers: find their LCM.
- If two events repeat every `a` and `b` units, they coincide again after `LCM(a,b)` units, assuming they start together.

### 1.3 Divisibility tests

| Divisor | Quick test |
|---|---|
| 2 | Last digit is 0, 2, 4, 6, or 8 |
| 3 | Sum of digits is divisible by 3 |
| 4 | Number formed by the last two digits is divisible by 4 |
| 5 | Last digit is 0 or 5 |
| 6 | Divisible by both 2 and 3 |
| 8 | Number formed by the last three digits is divisible by 8 |
| 9 | Sum of digits is divisible by 9 |
| 10 | Last digit is 0 |
| 11 | Difference between the sums of alternate-position digits is 0 or a multiple of 11 |
| 12 | Divisible by both 3 and 4 |
| 25 | Last two digits are 00, 25, 50, or 75 |

### 1.4 Remainders

- Division identity: `N = dq + r`, where `0 ≤ r < d`.
- Addition: `(a+b) mod m = [(a mod m)+(b mod m)] mod m`.
- Subtraction and multiplication can similarly be reduced modulo `m`.
- For a large power, reduce the base modulo the divisor and identify the repeating remainder cycle.
- Unit-digit cycles:
  - 0, 1, 5, 6: cycle length 1.
  - 4, 9: cycle length 2.
  - 2, 3, 7, 8: cycle length 4.
- For powers of 2, 3, 7, or 8, divide the exponent by 4 and use the remainder to select the cycle position. If the remainder is 0, use the fourth position.
- For powers ending in 4 or 9, use odd/even exponent.
- For a number of the form `a^n − b^n`, factorisation may help; for example, `a²−b²=(a−b)(a+b)`.

### 1.5 Number properties and sums

- Sum of first `n` natural numbers: `n(n+1)/2`.
- Sum of first `n` even numbers: `n(n+1)`.
- Sum of first `n` odd numbers: `n²`.
- Sum of squares: `n(n+1)(2n+1)/6`.
- Sum of cubes: `[n(n+1)/2]²`.
- Sum of an arithmetic progression: `n(first term + last term)/2`.
- `1+3+5+...+(2n−1)=n²`.
- Number of factors of `N = p^a q^b r^c`: `(a+1)(b+1)(c+1)`, where `p,q,r` are distinct primes.
- A perfect square has even exponents in its prime factorisation.
- A perfect cube has exponents that are multiples of 3.
- For two numbers, product = HCF × LCM.

### 1.6 Common algebraic identities

- `(a+b)² = a² + 2ab + b²`
- `(a−b)² = a² − 2ab + b²`
- `a²−b² = (a−b)(a+b)`
- `(a+b)³ = a³+3a²b+3ab²+b³`
- `(a−b)³ = a³−3a²b+3ab²−b³`
- `a³+b³ = (a+b)(a²−ab+b²)`
- `a³−b³ = (a−b)(a²+ab+b²)`
- `(a+b+c)² = a²+b²+c²+2ab+2bc+2ca`

**Shortcut:** Before multiplying large numbers, look for common factors, difference of squares, or values close to 10, 100, or 1000.

---

# Illustrations

## HCF × LCM identity

```text
For two positive integers a and b:

        a × b  =  HCF(a,b) × LCM(a,b)

Example: a=12, b=18
HCF=6, LCM=36
12×18=216  and  6×36=216 ✓
```

## Unit-digit cycle (powers)

```text
Digit 2 cycle length 4:  2 → 4 → 8 → 6 → 2 …
Digit 3 cycle length 4:  3 → 9 → 7 → 1 → 3 …
Digit 4 cycle length 2:  4 → 6 → 4 …
Digit 5 cycle length 1:  5 → 5 → 5 …
```
