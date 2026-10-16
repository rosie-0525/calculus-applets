/**
 * A strategy-game map and the crowd on it (How do 300 units find their way?): the units follow a
 * flow field, as in Supreme Commander 2 (E. Emerson, "Crowd Pathfinding and Steering Using Flow
 * Field Tiles", Game AI Pro, 2013, ch. 23). D(x, y), the walking distance to the goal, is spread out
 * from the goal like a wave (the fast marching method for the Eikonal equation ‖∇D‖ = 1, on a grid
 * of C × C cells), and each unit moves in the direction of −∇D.
 *
 * Map units are SVG pixels at full size: a map is W × H, x to the east and y to the south. There are
 * two maps (makeWorld): WIDE, on How do 300 units find their way?, and SQUARE, on Gradients are
 * everywhere.
 */

export const N_UNITS = 300;
const SPEED = 150; // map pixels per second
const SPACING = 10; // how close two units come
const COLS = 15;
const RIVER_HW = 30; // the river's half width
const BRIDGE_HW = 28; // a bridge's

/** A rock: a closed polygon around (cx, cy), its radius wobbling (deterministic in `seed`). */
function rock(cx, cy, r, n, seed) {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const pts = [];
  for (let k = 0; k < n; k += 1) {
    const a = (2 * Math.PI * (k + 0.3 * rnd())) / n;
    const rr = r * (0.78 + 0.4 * rnd());
    pts.push([cx + rr * Math.cos(a), cy + 0.85 * rr * Math.sin(a)]);
  }
  return pts;
}

function inPolygon(pts, x, y) {
  let inside = false;
  for (let a = 0, b = pts.length - 1; a < pts.length; b = a, a += 1) {
    const [xa, ya] = pts[a];
    const [xb, yb] = pts[b];
    if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) inside = !inside;
  }
  return inside;
}

/** A binary heap of cells keyed by their distance. */
function heap() {
  const keys = [];
  const vals = [];
  return {
    get size() {
      return keys.length;
    },
    push(k, v) {
      keys.push(k);
      vals.push(v);
      let n = keys.length - 1;
      while (n > 0) {
        const p = (n - 1) >> 1;
        if (keys[p] <= keys[n]) break;
        [keys[p], keys[n]] = [keys[n], keys[p]];
        [vals[p], vals[n]] = [vals[n], vals[p]];
        n = p;
      }
    },
    pop() {
      const v = vals[0];
      const k = keys.pop();
      const last = vals.pop();
      if (keys.length) {
        keys[0] = k;
        vals[0] = last;
        let n = 0;
        for (;;) {
          const a = 2 * n + 1;
          const b = a + 1;
          let m = n;
          if (a < keys.length && keys[a] < keys[m]) m = a;
          if (b < keys.length && keys[b] < keys[m]) m = b;
          if (m === n) break;
          [keys[m], keys[n]] = [keys[n], keys[m]];
          [vals[m], vals[n]] = [vals[n], vals[m]];
          n = m;
        }
      }
      return v;
    },
  };
}

/**
 * A map and its crowd: `W` × `H` map pixels (multiples of `C`); the river, its middle x = river.x +
 * river.amp · sin(2πy / river.period + river.phase); `bridges`, the middle (y) of each bridge;
 * `rocks`, [cx, cy, r, n, seed] each; `trees`, [x, y, r] each; `start`, the top left of the army;
 * `goal`, the goal of the PDF (and of CrowdMap's `preset`).
 */
export function makeWorld({ W, H, C = 8, river, bridges, rocks, trees, start, goal }) {
  const GW = W / C;
  const GH = H / C;
  const riverX = (y) => river.x + river.amp * Math.sin((2 * Math.PI * y) / river.period + river.phase);
  const ROCKS = rocks.map(([cx, cy, r, n, seed]) => rock(cx, cy, r, n, seed));
  const TREES = trees;
  const onBridge = (y) => bridges.some((b) => Math.abs(y - b) < BRIDGE_HW);

  /** True where a unit cannot walk: a rock, a tree, or the river away from the bridges. */
  function blockedAt(x, y) {
    if (x < 0 || y < 0 || x >= W || y >= H) return true;
    if (Math.abs(x - riverX(y)) < RIVER_HW && !onBridge(y)) return true;
    if (TREES.some(([tx, ty, r]) => (x - tx) ** 2 + (y - ty) ** 2 < r * r)) return true;
    return ROCKS.some((p) => inPolygon(p, x, y));
  }

  /**
   * The grid: `wall` (cells whose centre is blocked) and `speed`, 1 in the open and 0.55 in the cells
   * next to a wall, so that the paths keep a cell away from the walls (Emerson's "cost gradient near
   * walls").
   */
  const GRID = (() => {
    const wall = new Uint8Array(GW * GH);
    for (let j = 0; j < GH; j += 1) for (let i = 0; i < GW; i += 1) wall[j * GW + i] = blockedAt((i + 0.5) * C, (j + 0.5) * C) ? 1 : 0;
    const speed = new Float32Array(GW * GH).fill(1);
    for (let j = 0; j < GH; j += 1) {
      for (let i = 0; i < GW; i += 1) {
        let near = false;
        for (let b = -1; b <= 1; b += 1) for (let a = -1; a <= 1; a += 1) if (wall[Math.min(GH - 1, Math.max(0, j + b)) * GW + Math.min(GW - 1, Math.max(0, i + a))]) near = true;
        if (near) speed[j * GW + i] = 0.55;
      }
    }
    return { wall, speed };
  })();

  const cellOf = (x, y) => [Math.min(GW - 1, Math.max(0, Math.floor(x / C))), Math.min(GH - 1, Math.max(0, Math.floor(y / C)))];
  const wallAt = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return true;
    const [i, j] = cellOf(x, y);
    return GRID.wall[j * GW + i] === 1;
  };

  /**
   * The distance field of a goal: D at each cell centre (Infinity in the walls), by the fast marching
   * method, and dir, the unit vector of −∇D at each cell (central differences, one-sided next to a
   * wall).
   */
  function distanceField([gx, gy]) {
    const { wall, speed } = GRID;
    const D = new Float64Array(GW * GH).fill(Infinity);
    const known = new Uint8Array(GW * GH);
    const q = heap();
    const [i0, j0] = cellOf(gx, gy);
    for (let b = -1; b <= 1; b += 1) {
      for (let a = -1; a <= 1; a += 1) {
        const i = i0 + a;
        const j = j0 + b;
        if (i < 0 || j < 0 || i >= GW || j >= GH || wall[j * GW + i]) continue;
        D[j * GW + i] = Math.hypot((i + 0.5) * C - gx, (j + 0.5) * C - gy);
        q.push(D[j * GW + i], j * GW + i);
      }
    }
    const val = (i, j) => (i < 0 || j < 0 || i >= GW || j >= GH || !known[j * GW + i] ? Infinity : D[j * GW + i]);
    while (q.size) {
      const c = q.pop();
      if (known[c]) continue;
      known[c] = 1;
      const ci = c % GW;
      const cj = (c - ci) / GW;
      for (const [i, j] of [
        [ci - 1, cj],
        [ci + 1, cj],
        [ci, cj - 1],
        [ci, cj + 1],
      ]) {
        if (i < 0 || j < 0 || i >= GW || j >= GH) continue;
        const n = j * GW + i;
        if (known[n] || wall[n]) continue;
        const a = Math.min(val(i - 1, j), val(i + 1, j));
        const b = Math.min(val(i, j - 1), val(i, j + 1));
        const h = C / speed[n];
        const d = Math.abs(a - b) >= h ? Math.min(a, b) + h : (a + b + Math.sqrt(2 * h * h - (a - b) ** 2)) / 2;
        if (d < D[n]) {
          D[n] = d;
          q.push(d, n);
        }
      }
    }

    const dir = new Float32Array(2 * GW * GH);
    const at = (i, j) => (i < 0 || j < 0 || i >= GW || j >= GH ? Infinity : D[j * GW + i]);
    const diff = (m, l, r) => {
      if (Number.isFinite(l) && Number.isFinite(r)) return (r - l) / 2;
      if (Number.isFinite(r)) return r - m;
      if (Number.isFinite(l)) return m - l;
      return 0;
    };
    for (let j = 0; j < GH; j += 1) {
      for (let i = 0; i < GW; i += 1) {
        const m = at(i, j);
        if (!Number.isFinite(m)) continue;
        const dx = diff(m, at(i - 1, j), at(i + 1, j));
        const dy = diff(m, at(i, j - 1), at(i, j + 1));
        const len = Math.hypot(dx, dy) || 1;
        dir[2 * (j * GW + i)] = -dx / len;
        dir[2 * (j * GW + i) + 1] = -dy / len;
      }
    }
    return { goal: [gx, gy], D, dir };
  }

  function interp(x, y, get, zeroWalls = false) {
    const u = x / C - 0.5;
    const v = y / C - 0.5;
    const i = Math.floor(u);
    const j = Math.floor(v);
    const fu = u - i;
    const fv = v - j;
    let s = 0;
    let w = 0;
    for (const [a, b, wt] of [
      [i, j, (1 - fu) * (1 - fv)],
      [i + 1, j, fu * (1 - fv)],
      [i, j + 1, (1 - fu) * fv],
      [i + 1, j + 1, fu * fv],
    ]) {
      if (a < 0 || b < 0 || a >= GW || b >= GH || GRID.wall[b * GW + a]) continue;
      const val = get(b * GW + a);
      if (!Number.isFinite(val)) continue;
      s += wt * val;
      w += wt;
    }
    if (w === 0) return zeroWalls ? 0 : Infinity;
    return s / w;
  }

  /** D at (x, y), interpolated bilinearly between the cell centres (over the cells off the walls). */
  const dAt = ({ D }, x, y) => interp(x, y, (n) => D[n]);

  /** The unit vector of −∇D at (x, y), interpolated the same way. */
  function dirAt({ dir }, x, y) {
    const vx = interp(x, y, (n) => dir[2 * n], true);
    const vy = interp(x, y, (n) => dir[2 * n + 1], true);
    const len = Math.hypot(vx, vy);
    return len > 1e-6 ? [vx / len, vy / len] : [0, 0];
  }

  /** The grid of D for levels.js (cell centres; Infinity in the walls), for the level curves. */
  function levelGridOf({ D }) {
    const v = Array.from({ length: GH }, (_, j) => D.subarray(j * GW, (j + 1) * GW));
    return { nx: GW - 1, ny: GH - 1, x0: C / 2, x1: W - C / 2, y0: C / 2, y1: H - C / 2, v };
  }

  /** The army at the start: 20 rows of 15 units on the west side, facing east. */
  function makeUnits() {
    const x = new Float32Array(N_UNITS);
    const y = new Float32Array(N_UNITS);
    const h = new Float32Array(N_UNITS); // heading (radians)
    const v = new Float32Array(N_UNITS); // its own speed, ±8%
    const arrived = new Uint8Array(N_UNITS);
    let s = 7;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let k = 0; k < N_UNITS; k += 1) {
      const col = k % COLS;
      const row = Math.floor(k / COLS);
      x[k] = start[0] + col * 11 + (rnd() - 0.5) * 2;
      y[k] = start[1] + row * 11 + (col % 2) * 5.5 + (rnd() - 0.5) * 2;
      v[k] = 0.92 + 0.16 * rnd();
    }
    return { x, y, h, v, arrived, px: new Float32Array(N_UNITS), py: new Float32Array(N_UNITS) };
  }

  /**
   * One step of dt seconds: each unit not yet at the goal moves in the direction of −∇D; then the
   * units push apart (an arrived unit is pushed less, so the crowd packs around the goal); then a
   * unit that ended in a wall goes back, along x or y. A unit arrives when it is within the disk the
   * arrived units would fill. Returns how far the units moved, at most.
   */
  function step(units, field, dt) {
    const { x, y, h, v, arrived, px, py } = units;
    let count = 0;
    for (let k = 0; k < N_UNITS; k += 1) count += arrived[k];
    px.set(x);
    py.set(y);
    for (let k = 0; k < N_UNITS; k += 1) {
      if (arrived[k]) continue;
      const d = dAt(field, x[k], y[k]);
      if (d < 4 + 5.4 * Math.sqrt(count + 1)) {
        arrived[k] = 1;
        count += 1;
        continue;
      }
      const [ux, uy] = dirAt(field, x[k], y[k]);
      x[k] += ux * SPEED * v[k] * dt;
      y[k] += uy * SPEED * v[k] * dt;
      if (ux || uy) {
        let da = Math.atan2(uy, ux) - h[k];
        da = Math.atan2(Math.sin(da), Math.cos(da));
        h[k] += da * Math.min(1, 10 * dt);
      }
    }

    // push apart: a hash of cells SPACING wide
    for (let pass = 0; pass < 2; pass += 1) {
      const cells = new Map();
      for (let k = 0; k < N_UNITS; k += 1) {
        const key = Math.floor(x[k] / SPACING) * 1000 + Math.floor(y[k] / SPACING);
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(k);
      }
      for (let k = 0; k < N_UNITS; k += 1) {
        const ci = Math.floor(x[k] / SPACING);
        const cj = Math.floor(y[k] / SPACING);
        for (let a = -1; a <= 1; a += 1) {
          for (let b = -1; b <= 1; b += 1) {
            const list = cells.get((ci + a) * 1000 + cj + b);
            if (!list) continue;
            for (const m of list) {
              if (m <= k) continue;
              const dx = x[m] - x[k];
              const dy = y[m] - y[k];
              const dd = Math.hypot(dx, dy);
              if (dd >= SPACING) continue;
              const ex = dd > 1e-6 ? dx / dd : 1;
              const ey = dd > 1e-6 ? dy / dd : 0;
              const push = (SPACING - dd) * 0.5;
              const wk = arrived[k] ? 0.25 : 1;
              const wm = arrived[m] ? 0.25 : 1;
              const tot = wk + wm;
              x[k] -= ex * push * (wk / tot);
              y[k] -= ey * push * (wk / tot);
              x[m] += ex * push * (wm / tot);
              y[m] += ey * push * (wm / tot);
            }
          }
        }
      }
    }

    let most = 0;
    for (let k = 0; k < N_UNITS; k += 1) {
      x[k] = Math.min(W - 4, Math.max(4, x[k]));
      y[k] = Math.min(H - 4, Math.max(4, y[k]));
      if (wallAt(x[k], y[k])) {
        if (!wallAt(x[k], py[k])) y[k] = py[k];
        else if (!wallAt(px[k], y[k])) x[k] = px[k];
        else {
          x[k] = px[k];
          y[k] = py[k];
        }
      }
      most = Math.max(most, Math.abs(x[k] - px[k]) + Math.abs(y[k] - py[k]));
    }
    return most;
  }

  /** The units T seconds after they set off from the start toward the field's goal (for print mode). */
  function simulate(field, T, dt = 1 / 60) {
    const units = makeUnits();
    for (let t = 0; t < T; t += dt) step(units, field, dt);
    return units;
  }

  return {
    MAP: { W, H, C },
    riverX,
    RIVER_HW,
    BRIDGES: bridges,
    BRIDGE_HW,
    ROCKS,
    TREES,
    GOAL: goal,
    blockedAt,
    distanceField,
    dAt,
    dirAt,
    levelGridOf,
    makeUnits,
    step,
    simulate,
  };
}

/** A new goal: every unit sets off again. */
export function sendUnits(units) {
  units.arrived.fill(0);
}

/** The map of How do 300 units find their way?: the river across the middle, two bridges. */
export const WIDE = makeWorld({
  W: 1160,
  H: 504,
  river: { x: 590, amp: 30, period: 420, phase: 0.5 },
  bridges: [110, 396],
  rocks: [
    [345, 248, 50, 11, 3],
    [245, 66, 30, 9, 5],
    [285, 448, 34, 9, 8],
    [830, 186, 44, 10, 11],
    [880, 384, 52, 11, 13],
    [1045, 84, 30, 9, 17],
  ],
  trees: [
    [1110, 452, 17],
    [1080, 476, 15],
    [1128, 488, 14],
    [1050, 458, 12],
    [62, 470, 16],
    [92, 488, 13],
    [36, 446, 12],
    [705, 30, 15],
    [735, 18, 12],
    [690, 470, 14],
  ],
  start: [40, 146],
  goal: [1060, 250],
});

/** The square map of Gradients are everywhere: the same scenery, closer together. */
export const SQUARE = makeWorld({
  W: 600,
  H: 600,
  river: { x: 345, amp: 24, period: 420, phase: 0.5 },
  bridges: [118, 470],
  rocks: [
    [240, 300, 34, 11, 3],
    [140, 62, 26, 9, 5],
    [150, 548, 28, 9, 8],
    [478, 210, 36, 10, 11],
    [505, 410, 40, 11, 13],
    [548, 70, 24, 9, 17],
  ],
  trees: [
    [560, 556, 16],
    [532, 578, 13],
    [580, 584, 12],
    [40, 560, 15],
    [70, 582, 12],
    [420, 30, 14],
    [446, 18, 11],
    [420, 572, 13],
  ],
  start: [26, 186],
  goal: [540, 300],
});
