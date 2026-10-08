import { useEffect, useState } from 'react';
import binUrl from '../data/shasta.bin?url';

/**
 * The height h(x, y) of Mount Shasta (the 3-D printing slide): a 314 × 314 grid of 57.3 m pixels,
 * row by row from the north, in metres above sea level (NAVD88), centred on the summit. See
 * src/data/make-shasta.py for the source.
 */
export const SW = 314;
export const SPIXEL_M = 57.33;
export const S_SUMMIT = [157, 156]; // (column, row) of the highest pixel, 4301 m

/** The print: it sits on the bed at BASE, and layer k (k = 1, 2, …) has its top at BASE + k STEP. */
export const BASE = 2400;
export const STEP = 100;
export const LEVELS = Array.from({ length: 19 }, (_, k) => BASE + (k + 1) * STEP); // 2500, …, 4300 m

let cache = null;

/** Fetches the grid (once); resolves to it. */
export function loadShasta() {
  if (!cache) {
    cache = {
      promise: fetch(binUrl)
        .then((r) => r.arrayBuffer())
        .then((buf) => {
          cache.E = Float32Array.from(new Uint16Array(buf), (v) => v / 10);
          return cache.E;
        }),
    };
  }
  return cache.promise;
}

/** The grid; null until it has arrived. */
export function useShasta() {
  const [E, setE] = useState(cache?.E ?? null);
  useEffect(() => {
    if (E) return undefined;
    let live = true;
    loadShasta().then((e) => live && setE(e));
    return () => {
      live = false;
    };
  }, [E]);
  return E;
}

/**
 * Slices the mountain into the layers of the print, as a slicer does. Each cell of the grid is cut
 * into two triangles, on which h is linear, so on each triangle the level set h = c is a segment
 * (marching triangles). For each level c of LEVELS (layer k):
 * - `top`: the triangles of the layer's top that show from above, where c ≤ h < the next level
 *   (all of h ≥ c for the last layer), as [i, j] positions, 3 per triangle, counterclockwise
 *   seen from above;
 * - `wall`: the segments of h = c, each [p, q] with the inside (h ≥ c) on the left of p → q, seen
 *   from above (east to the right, north up);
 * - `loops`: the same segments joined into closed curves (the level set h = c), longest first.
 * Positions are in pixels (i east, j south).
 */
let sliceCache = null;
export function slicePrint(E) {
  if (sliceCache?.E === E) return sliceCache.layers;
  const n = LEVELS.length;
  const layers = LEVELS.map((c) => ({ c, top: [], wall: [], keys: [] }));
  const P = (a) => [a % SW, Math.floor(a / SW), E[a]]; // vertex a = j SW + i → [i, j, h]
  // where the edge between the vertices a and b crosses c (the same point from either side)
  const cross = (a, b, c) => {
    const [u, v] = a < b ? [a, b] : [b, a];
    const [ui, uj, uh] = P(u);
    const [vi, vj, vh] = P(v);
    const t = (c - uh) / (vh - uh);
    return [ui + t * (vi - ui), uj + t * (vj - uj), c];
  };
  // the part of the polygon (points [i, j, h]) where h ≥ c (sign 1) or h ≤ c (sign −1)
  const clip = (poly, c, sign) => {
    const out = [];
    for (let m = 0; m < poly.length; m += 1) {
      const A = poly[m];
      const B = poly[(m + 1) % poly.length];
      const ain = sign * (A[2] - c) >= 0;
      const bin = sign * (B[2] - c) >= 0;
      if (ain) out.push(A);
      if (ain !== bin) {
        const t = (c - A[2]) / (B[2] - A[2]);
        out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1]), c]);
      }
    }
    return out;
  };
  const pushPoly = (list, poly) => {
    for (let m = 1; m + 1 < poly.length; m += 1) list.push(poly[0], poly[m], poly[m + 1]);
  };

  for (let j = 0; j + 1 < SW; j += 1) {
    for (let i = 0; i + 1 < SW; i += 1) {
      const a = j * SW + i;
      // counterclockwise seen from above (j points south)
      for (const tri of [
        [a, a + SW + 1, a + 1],
        [a, a + SW, a + SW + 1],
      ]) {
        const hs = tri.map((v) => E[v]);
        const lo = Math.min(...hs);
        const hi = Math.max(...hs);
        if (hi < LEVELS[0]) continue;
        const pts = tri.map(P);
        // the tops: the layers whose band [c, next c) meets [lo, hi]
        const k0 = Math.max(0, Math.floor((lo - BASE) / STEP) - 1);
        const k1 = Math.min(n - 1, Math.floor((hi - BASE) / STEP) - 1);
        for (let k = k0; k <= k1; k += 1) {
          const c = LEVELS[k];
          const next = k + 1 < n ? LEVELS[k + 1] : Infinity;
          if (lo >= c && hi < next) {
            pushPoly(layers[k].top, pts);
          } else {
            let poly = clip(pts, c, 1);
            if (next < Infinity && poly.length) poly = clip(poly, next, -1);
            if (poly.length >= 3) pushPoly(layers[k].top, poly);
          }
        }
        // the walls: the levels strictly inside (lo, hi]
        for (let k = k0; k <= k1 + 1 && k < n; k += 1) {
          const c = LEVELS[k];
          if (!(lo < c && hi >= c)) continue;
          // going around the triangle counterclockwise, the level is crossed once going out
          // (inside → outside) and once coming in; walking from "out" to "in" keeps the inside
          // on the left
          let into;
          let outOf;
          let kIn;
          let kOut;
          for (let m = 0; m < 3; m += 1) {
            const u = tri[m];
            const v = tri[(m + 1) % 3];
            const uin = E[u] >= c;
            const vin = E[v] >= c;
            if (uin && !vin) {
              outOf = cross(u, v, c);
              kOut = Math.min(u, v) * SW * SW + Math.max(u, v);
            } else if (!uin && vin) {
              into = cross(u, v, c);
              kIn = Math.min(u, v) * SW * SW + Math.max(u, v);
            }
          }
          layers[k].wall.push([outOf, into]);
          layers[k].keys.push([kOut, kIn]);
        }
      }
    }
  }

  // join the segments of each level into closed curves: a segment ends on a grid edge where the
  // next one, in the neighbouring triangle, starts
  for (const layer of layers) {
    const from = new Map(layer.keys.map(([s], m) => [s, m]));
    const used = new Uint8Array(layer.wall.length);
    const loops = [];
    for (let m0 = 0; m0 < layer.wall.length; m0 += 1) {
      if (used[m0]) continue;
      const loop = [];
      let m = m0;
      while (m !== undefined && !used[m]) {
        used[m] = 1;
        loop.push(layer.wall[m][0]);
        m = from.get(layer.keys[m][1]);
      }
      loops.push(loop);
    }
    const len = (loop) => loop.reduce((s, p, m) => s + Math.hypot(...[0, 1].map((x) => loop[(m + 1) % loop.length][x] - p[x])), 0);
    layer.loops = loops.map((loop) => ({ loop, length: len(loop) })).sort((x, y) => y.length - x.length);
    delete layer.keys;
  }

  sliceCache = { E, layers };
  return layers;
}

/** The box [i0, j0, i1, j1] (pixels) around the print's footprint, the outline of layer 0. */
export function footprint(layers) {
  const pts = layers[0].loops.flatMap((l) => l.loop);
  const is = pts.map((p) => p[0]);
  const js = pts.map((p) => p[1]);
  return [Math.min(...is), Math.min(...js), Math.max(...is), Math.max(...js)];
}

/** The index of the top layer printed when the print has reached height c (−1: none yet). */
export const layerAt = (c) => Math.min(LEVELS.length - 1, Math.floor((c - BASE + 1e-6) / STEP) - 1);

/**
 * The point at the fraction s (0 to 1) of the way around the layer's outline, going around its
 * curves one after the other, as the nozzle does: [i, j].
 */
export function alongOutline(layer, s) {
  const total = layer.loops.reduce((t, l) => t + l.length, 0);
  let d = (((s % 1) + 1) % 1) * total;
  for (const { loop, length } of layer.loops) {
    if (d > length) {
      d -= length;
      continue;
    }
    for (let m = 0; m < loop.length; m += 1) {
      const p = loop[m];
      const q = loop[(m + 1) % loop.length];
      const e = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d <= e) {
        const t = e ? d / e : 0;
        return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
      }
      d -= e;
    }
  }
  return layer.loops[0]?.loop[0] ?? null;
}
