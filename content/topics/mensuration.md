# Mensuration

Use consistent units. Area is in square units; volume is in cubic units.

### 14.1 2D shapes

| Shape | Area | Perimeter / circumference |
|---|---|---|
| Square, side `a` | `a²` | `4a` |
| Rectangle, length `l`, breadth `b` | `lb` | `2(l+b)` |
| Triangle | `½ × base × height` | Sum of three sides |
| Equilateral triangle, side `a` | `√3a²/4` | `3a` |
| Parallelogram | `base × height` | `2(a+b)` |
| Rhombus, diagonals `d1,d2` | `½d1d2` | `4a` |
| Trapezium, parallel sides `a,b` | `½(a+b)h` | Sum of four sides |
| Circle, radius `r` | `πr²` | `2πr` |
| Semicircle | `½πr²` | `πr+2r` including diameter |

### 14.2 Triangle shortcuts

- Heron's formula: `Area = √[s(s−a)(s−b)(s−c)]`, where `s=(a+b+c)/2`.
- Right triangle: `a²+b²=c²`.
- Equilateral triangle height = `√3a/2`.
- Similar triangles: if side ratio is `k`, area ratio is `k²`.

### 14.3 Circle shortcuts

- Diameter = `2r`.
- Arc length = `(θ/360°) × 2πr`.
- Sector area = `(θ/360°) × πr²`.
- Ring area = `π(R²−r²)`.
- For similar circles, area ratio = square of radius ratio.

### 14.4 3D solids

| Solid | Volume | Curved / lateral surface area | Total surface area |
|---|---|---|---|
| Cube, side `a` | `a³` | — | `6a²` |
| Cuboid, `l,b,h` | `lbh` | — | `2(lb+bh+hl)` |
| Cylinder, radius `r`, height `h` | `πr²h` | `2πrh` | `2πr(h+r)` |
| Cone, radius `r`, height `h`, slant `l` | `⅓πr²h` | `πrl` | `πr(l+r)` |
| Sphere, radius `r` | `4/3πr³` | `4πr²` | `4πr²` |
| Hemisphere, radius `r` | `2/3πr³` | `2πr²` | `3πr²` |

For a right circular cone: `l = √(r²+h²)`.

### 14.5 Changes in dimensions

- If every length is multiplied by `k`, area is multiplied by `k²` and volume by `k³`.
- If radius doubles, circle area becomes 4 times and sphere volume becomes 8 times.
- If a cube's side doubles, surface area becomes 4 times and volume becomes 8 times.

### 14.6 Unit conversions

- `1 m = 100 cm`; `1 m² = 10,000 cm²`; `1 m³ = 1,000,000 cm³`.
- `1 litre = 1000 cm³`.
- `1 m³ = 1000 litres`.
- Use `π = 22/7` or `3.14` according to the question/options.

---

# Illustrations

## 12. Mensuration — common 2D shapes

```text
SQUARE                RECTANGLE               TRIANGLE
┌────────┐            ┌────────────┐               /\
│        │            │            │              /  \
│        │ a          │            │             /    \
└────────┘            └────────────┘            /______\
 side a                     l × b                 base b

CIRCLE
       .-''''-.
    .'    r    '.
   /      •------\
   \             /
    '.         .'
      '-.___.-'

Square area = a²       Rectangle area = l×b
Triangle area = 1/2 bh Circle area = πr²
```

## 13. Mensuration — common 3D solids

```text
CUBE                    CUBOID                    CYLINDER
     +------+              +----------+             ______
    /      /|             /          /|           /      \
   +------+ |            +----------+ |          |        |
   |      | +            |          | +          |        | h
   |      |/             |          |/            \______/
   +------+              +----------+                r

Cube volume = a³
Cuboid volume = lbh
Cylinder volume = πr²h
```
