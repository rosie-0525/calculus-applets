import basins from '../data/divide-basins.json';
import { heightAt } from './terrain.js';

/**
 * Where a raindrop goes on the map of Triple Divide Peak (the grid `divide` of terrain.js).
 *
 * The drop moves straight downhill, along −∇E, E the elevation (bilinear between the pixels), in
 * steps of STEP pixels. In a valley floor the data have small pits, where water would pool and
 * spill over: when the drop stops going down, it follows the flow of the pixels to their lowest
 * outlet instead (`drainage`: a priority flood from the edge of the map and the lakes), until it
 * reaches a lake or the edge of the map.
 */

const STEP = 0.4;

/** The ocean of each watershed of the map (the first two digits of its USGS code: its region). */
export const OCEANS = {
  17: { name: 'Pacific Ocean', color: '#2f64ad', route: ['Nyack Creek', 'Flathead River', 'Columbia River', 'Pacific Ocean'] },
  10: {
    name: 'Gulf of Mexico',
    color: '#b8561f',
    route: ['Cut Bank Creek', 'Missouri River', 'Mississippi River', 'Gulf of Mexico'],
  },
  '09': {
    name: 'Hudson Bay',
    color: '#2c7d4f',
    route: ['Red Eagle Creek', 'Saint Mary River', 'Saskatchewan River', 'Nelson River', 'Hudson Bay'],
  },
};

/** The watershed of each pixel: an index into basins.units (1-based; 0 none), row by row. */
const UNIT = (() => {
  const out = new Uint8Array(basins.rle.reduce((n, [, len]) => n + len, 0));
  let o = 0;
  for (const [k, len] of basins.rle) {
    out.fill(k, o, o + len);
    o += len;
  }
  return out;
})();

/** The ocean (an entry of OCEANS) the pixel nearest to (x, y) drains to, by the USGS watersheds. */
export function oceanAt({ W, H }, x, y) {
  const i = Math.max(0, Math.min(W - 1, Math.round(x)));
  const j = Math.max(0, Math.min(H - 1, Math.round(y)));
  const k = UNIT[j * W + i];
  return k ? OCEANS[basins.units[k - 1].huc12.slice(0, 2)] : null;
}

/** The ocean index (1, 2, 3 for Pacific, Gulf, Hudson Bay) of every pixel, for the tints. */
export function oceanIndex(t) {
  const order = ['17', '10', '09'];
  const out = new Uint8Array(t.W * t.H);
  for (let p = 0; p < out.length; p += 1) {
    const k = UNIT[p];
    out[p] = k ? 1 + order.indexOf(basins.units[k - 1].huc12.slice(0, 2)) : 0;
  }
  return out;
}

const lakeCache = new WeakMap();
/** The lakes: pixels where the height does not change over 5 × 5 pixels (as in reliefUrl). */
export function lakes(t) {
  if (lakeCache.has(t)) return lakeCache.get(t);
  const { W, H, E } = t;
  const at = (i, j) => E[Math.max(0, Math.min(H - 1, j)) * W + Math.max(0, Math.min(W - 1, i))];
  const out = new Uint8Array(W * H);
  for (let j = 0; j < H; j += 1) {
    for (let i = 0; i < W; i += 1) {
      const e = at(i, j);
      let flat = true;
      for (let b = -2; b <= 2 && flat; b += 1) for (let a = -2; a <= 2 && flat; a += 1) if (at(i + a, j + b) !== e) flat = false;
      out[j * W + i] = flat ? 1 : 0;
    }
  }
  lakeCache.set(t, out);
  return out;
}

const drainCache = new WeakMap();
/**
 * The pixel each pixel drains to (−1 for the edge of the map and the lakes, where the water
 * leaves): a priority flood from them, the lowest first, so that a pit drains over its lowest rim.
 */
function drainage(t) {
  if (drainCache.has(t)) return drainCache.get(t);
  const { W, H, E } = t;
  const lake = lakes(t);
  const to = new Int32Array(W * H).fill(-2); // −2: not reached yet
  const level = new Float32Array(W * H);
  // a binary heap of pixels by level
  const heap = [];
  const push = (p) => {
    heap.push(p);
    let k = heap.length - 1;
    while (k > 0) {
      const up = (k - 1) >> 1;
      if (level[heap[up]] <= level[heap[k]]) break;
      [heap[up], heap[k]] = [heap[k], heap[up]];
      k = up;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let k = 0;
      for (;;) {
        const a = 2 * k + 1;
        const b = a + 1;
        let m = k;
        if (a < heap.length && level[heap[a]] < level[heap[m]]) m = a;
        if (b < heap.length && level[heap[b]] < level[heap[m]]) m = b;
        if (m === k) break;
        [heap[m], heap[k]] = [heap[k], heap[m]];
        k = m;
      }
    }
    return top;
  };
  for (let j = 0; j < H; j += 1) {
    for (let i = 0; i < W; i += 1) {
      const p = j * W + i;
      if (i === 0 || j === 0 || i === W - 1 || j === H - 1 || lake[p]) {
        to[p] = -1;
        level[p] = E[p];
        push(p);
      }
    }
  }
  while (heap.length) {
    const p = pop();
    const i = p % W;
    const j = (p - i) / W;
    for (let b = -1; b <= 1; b += 1) {
      for (let a = -1; a <= 1; a += 1) {
        const ni = i + a;
        const nj = j + b;
        if ((!a && !b) || ni < 0 || nj < 0 || ni >= W || nj >= H) continue;
        const q = nj * W + ni;
        if (to[q] !== -2) continue;
        to[q] = p;
        level[q] = Math.max(E[q], level[p] + 1e-3);
        push(q);
      }
    }
  }
  drainCache.set(t, to);
  return to;
}

/**
 * The path of a raindrop that falls at (x, y) (grid pixels): { pts, end: 'lake' | 'edge', down }
 * with `down` the number of points of the straight-downhill part (the rest follows `drainage`).
 */
export function dropPath(t, x0, y0) {
  const { W, H } = t;
  const lake = lakes(t);
  const isLake = (x, y) => lake[Math.round(y) * W + Math.round(x)] === 1;
  const pts = [[x0, y0]];
  let x = x0;
  let y = y0;
  let best = heightAt(t, x, y);
  let stall = 0;
  for (let n = 0; n < 8000; n += 1) {
    if (isLake(x, y)) return { pts, end: 'lake', down: pts.length };
    const gx = heightAt(t, x + 0.5, y) - heightAt(t, x - 0.5, y);
    const gy = heightAt(t, x, y + 0.5) - heightAt(t, x, y - 0.5);
    const g = Math.hypot(gx, gy);
    if (g < 1e-6) break;
    x -= (STEP * gx) / g;
    y -= (STEP * gy) / g;
    if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) {
      pts.push([Math.max(0, Math.min(W - 1, x)), Math.max(0, Math.min(H - 1, y))]);
      return { pts, end: 'edge', down: pts.length };
    }
    pts.push([x, y]);
    const e = heightAt(t, x, y);
    if (e < best - 0.05) {
      best = e;
      stall = 0;
    } else if (++stall > 30) {
      pts.length -= stall; // back to where it last went down
      break;
    }
  }
  // the rest: along the flow of the pixels, smoothed
  const down = pts.length;
  const to = drainage(t);
  let [px, py] = pts[pts.length - 1];
  let p = Math.round(py) * W + Math.round(px);
  const flow = [];
  while (p >= 0) {
    flow.push([p % W, Math.floor(p / W)]);
    p = to[p];
  }
  const end = lake[flow[flow.length - 1][1] * W + flow[flow.length - 1][0]] ? 'lake' : 'edge';
  for (let k = 0; k < flow.length; k += 1) {
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (let d = -2; d <= 2; d += 1) {
      const q = flow[Math.max(0, Math.min(flow.length - 1, k + d))];
      sx += q[0];
      sy += q[1];
      n += 1;
    }
    pts.push(k === flow.length - 1 ? flow[k] : [sx / n, sy / n]);
  }
  return { pts, end, down };
}
