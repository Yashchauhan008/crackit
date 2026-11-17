# Pipes & Cisterns

### 16.1 Work-rate model

- Filling pipe: positive rate.
- Emptying/leak pipe: negative rate.
- If a pipe fills a tank in `x` hours, rate = `1/x` tank/hour.
- If a pipe empties it in `y` hours, rate = `−1/y` tank/hour.
- Net rate = sum of all rates.
- Time = `1/net rate`, provided net rate is positive.

### 16.2 Two filling pipes

If A fills in `x` hours and B in `y` hours:

`Together time = xy/(x+y)`

### 16.3 Filling pipe plus leak

If a tap fills in `x` hours and a leak empties in `y` hours:

`Net time = xy/(y−x)`, provided `y>x`.

If `y≤x`, the tank does not fill under those conditions.

### 16.4 LCM shortcut

Take tank capacity as the LCM of the times, convert each pipe into units/hour, add filling rates and subtract emptying rates.

### 16.5 Alternate opening/closing

Calculate the net amount filled during a complete operating cycle. Repeat full cycles, then calculate the final partial cycle carefully.

---

# Illustrations

## 15. Pipes & Cisterns — filling and emptying

```text
        Filling pipe (+)                   Emptying pipe (-)
               ↓                                  ↑
             ┌───┐                              ┌───┐
             │   │                              │   │
             └─┬─┘                              └─┬─┘
               │        ┌─────────────────┐       │
               └───────>│       TANK      │<──────┘
                        │      WATER      │
                        └─────────────────┘

Net rate = sum of filling rates - sum of emptying rates
Time = capacity / positive net rate
```
