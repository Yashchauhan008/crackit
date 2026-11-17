# Direction & Distance

### 28.1 Direction map

- North: up.
- South: down.
- East: right.
- West: left.
- Right turn from North → East; from East → South; from South → West; from West → North.
- Left turn is the reverse sequence.

### 28.2 Coordinate method

Take:
- East = `+x`, West = `−x`.
- North = `+y`, South = `−y`.

Add all horizontal movements to get net `x`, and all vertical movements to get net `y`.

Shortest distance from start to end:

`√(x²+y²)`

### 28.3 Pythagorean triples to memorise

- 3–4–5
- 5–12–13
- 8–15–17
- 7–24–25
- 9–40–41

Multiples of these triples also work.

### 28.4 Turns

A right turn is 90° clockwise; a left turn is 90° anticlockwise. A 180° turn reverses direction. Track the person's facing direction after every turn.

### 28.5 Relative direction

Compare the final coordinates:
- `(+,+)` = North-East.
- `(−,+)` = North-West.
- `(+,-)` = South-East.
- `(−,-)` = South-West.
- If one coordinate is zero, the final direction is purely horizontal or vertical.

### 28.6 Shortcut

Draw a rough coordinate path. Do not try to visualise a long route mentally. The shortest distance is not necessarily the total distance walked.

---

# Illustrations

## Direction compass & coordinate path

```text
            N (+y)
            ↑
            │
   W (−x) ←─┼─→ E (+x)
            │
            ↓
            S (−y)

Right turn (clockwise):  N → E → S → W → N
Left turn (anticlockwise): N → W → S → E → N
```

```text
Example path:
Start ●──3km E──●──4km N──● End

Net x = +3, net y = +4
Shortest distance = √(3² + 4²) = 5  (3–4–5 triple)
Final direction from start = North-East
```
