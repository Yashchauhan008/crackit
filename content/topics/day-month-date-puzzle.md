# Day / Month / Date Puzzle

### 25.1 Odd days

An odd day is the remainder after dividing a number of days by 7.

- 1 ordinary year = 365 days = 1 odd day.
- 1 leap year = 366 days = 2 odd days.
- 7 days = 0 odd days.
- 100 years in the Gregorian calendar contain 5 odd days.
- 200 years contain 3 odd days.
- 300 years contain 1 odd day.
- 400 years contain 0 odd days.

### 25.2 Leap-year rule

A year is a leap year if:
- It is divisible by 400; or
- It is divisible by 4 but not by 100.

Thus 2000 was a leap year; 1900 was not.

### 25.3 Month lengths

- 31 days: January, March, May, July, August, October, December.
- 30 days: April, June, September, November.
- February: 28 days in an ordinary year, 29 in a leap year.

### 25.4 Day shift

- After `n` days, weekday shifts by `n mod 7`.
- For a date `n` days later, add the remainder modulo 7.
- For dates in the same year, count the days between them and take modulo 7.

### 25.5 Gregorian calendar calculation (Zeller's congruence)

For a date `q` in month `m`:
- Treat March as 3, …, December as 12.
- Treat January as month 13 and February as month 14 of the **previous** year.
- Let `K` = year within the century; `J` = zero-based century (`year // 100`).
- Compute:

`h = [q + floor(13(m+1)/5) + K + floor(K/4) + floor(J/4) + 5J] mod 7`

Mapping:
- 0 = Saturday
- 1 = Sunday
- 2 = Monday
- 3 = Tuesday
- 4 = Wednesday
- 5 = Thursday
- 6 = Friday

### 25.6 Calendar puzzle technique

- Mark the year as leap or ordinary.
- Record each month’s number of days.
- Convert day gaps into odd days.
- For a sequence of events, track weekday shifts modulo 7.
- Check whether the question uses inclusive or exclusive counting.

---

# Illustrations

## 23. Day / Month / Date — weekday cycle

```text
SUN → MON → TUE → WED → THU → FRI → SAT
 ↑                                      │
 └──────────────────────────────────────┘

After n days, weekday shift = n mod 7.
```

Gregorian leap year: divisible by 400, or divisible by 4 but not by 100.
