# Seating Arrangement — Circular

### 32.1 Fix one person

For a circular arrangement, fix one person at the top to remove rotational duplicates. This does not change relative seating.

### 32.2 Facing the centre

When all face the centre:
- A person's left is clockwise.
- A person's right is anticlockwise.

### 32.3 Facing outside

When all face outside:
- A person's left is anticlockwise.
- A person's right is clockwise.

### 32.4 Opposite positions

For an even number `N` of people, the person opposite a position is `N/2` seats away.

Example: with 8 people, opposite position is 4 seats away.

### 32.5 Solving workflow

1. Fix one reference person.
2. Place direct neighbour/opposite clues.
3. Apply left/right rules based on centre/outside orientation.
4. Keep cases for uncertain placements.
5. Verify each clue around the circle.

### 32.6 Common traps

- Clockwise/anticlockwise left-right rules reverse when people face outside.
- “Second to the left” means two seats away, with one person in between.
- Rotation does not create a new circular arrangement; reflection may create a different arrangement unless the question treats mirror images as equivalent.

---

# Illustrations

## 29. Circular seating — facing centre or outside

```text
                 A
            F         B
          E      ○      C
                 D

When facing CENTRE:
left = clockwise; right = anticlockwise.

When facing OUTSIDE:
left = anticlockwise; right = clockwise.
```

Fix one reference person to avoid duplicate rotations.
