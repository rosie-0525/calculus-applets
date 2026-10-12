import { useEffect, useState } from 'react';
import meta from '../data/terrain.json';
import sierraUrl from '../data/sierra.bin?url';
import passUrl from '../data/pass.bin?url';
import frissellUrl from '../data/frissell.bin?url';

/**
 * The elevation grids of the deck (see src/data/make-terrain.py for the source): each is W × H
 * pixels, row by row from the north, in metres above sea level (NAVD88). A pixel (i, j) is i to the
 * east and j to the south of the north-west corner; `m` is its size in metres.
 *
 * - sierra: the Sierra Nevada around Donner Pass, 29.6 m pixels (Crossing the Sierra);
 * - pass: Donner Pass close up, 14.8 m pixels (Donner Pass);
 * - frissell: Mount Frissell, where Connecticut, Massachusetts and New York meet, 14.2 m pixels
 *   (Highest point in Connecticut).
 */
const URLS = { sierra: sierraUrl, pass: passUrl, frissell: frissellUrl };

const cache = {};

/** Fetches the grid `name` (once); resolves to { name, W, H, m, E } with E[j W + i] in metres. */
export function loadTerrain(name) {
  if (!cache[name]) {
    const { W, H, pixel_m: m } = meta[name];
    cache[name] = {
      promise: fetch(URLS[name])
        .then((r) => r.arrayBuffer())
        .then((buf) => {
          const E = Float32Array.from(new Uint16Array(buf), (v) => v / 10);
          cache[name].grid = { name, W, H, m, E };
          return cache[name].grid;
        }),
    };
  }
  return cache[name].promise;
}

/** All the grids (main.jsx waits for them before the first render in print mode). */
export const loadAllTerrain = () => Promise.all(Object.keys(URLS).map(loadTerrain));

/** The grid `name`; null until it has arrived. */
export function useTerrain(name) {
  const [t, setT] = useState(cache[name]?.grid ?? null);
  useEffect(() => {
    if (t) return undefined;
    let live = true;
    loadTerrain(name).then((g) => live && setT(g));
    return () => {
      live = false;
    };
  }, [t, name]);
  return t;
}

/** The elevation at (x, y), in pixels (bilinear between the pixel centres, kept inside the grid). */
export function heightAt({ W, H, E }, x, y) {
  const cx = Math.max(0, Math.min(W - 1.001, x));
  const cy = Math.max(0, Math.min(H - 1.001, y));
  const i = Math.floor(cx);
  const j = Math.floor(cy);
  const u = cx - i;
  const v = cy - j;
  const a = E[j * W + i];
  const b = E[j * W + i + 1];
  const c = E[(j + 1) * W + i];
  const d = E[(j + 1) * W + i + 1];
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/** The grid in the format of levels.js (x = i, y = j), for its level curves. */
const levelCache = new WeakMap();
export function levelGrid(t) {
  if (!levelCache.has(t)) {
    const { W, H, E } = t;
    const v = Array.from({ length: H }, (_, j) => E.subarray(j * W, (j + 1) * W));
    levelCache.set(t, { nx: W - 1, ny: H - 1, x0: 0, x1: W - 1, y0: 0, y1: H - 1, v });
  }
  return levelCache.get(t);
}

const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
export const WATER = '#a9cdea';

/**
 * The map's background as a PNG data URL, one pixel per grid pixel: the colour of the height
 * (`tints`, from `lo` to `hi`) darkened by the shading of a light from the north-west (heights
 * × `relief`), and the lakes (pixels where the height does not change at all over 5 × 5 pixels:
 * the USGS data are flattened on water) in WATER. `below`: { c, color } tints the points lower
 * than c.
 */
const urlCache = new Map();
export function reliefUrl(t, { lo, hi, tints = ['#cfe0c3', '#e6dfc8', '#f6f3ec'], relief = 1.5, below } = {}) {
  const key = `${t.name}|${lo}|${hi}|${tints}|${relief}|${below?.c}|${below?.color}`;
  if (urlCache.has(key)) return urlCache.get(key);
  const { W, H, E, m } = t;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const stops = tints.map(hex);
  const tint = (s) => {
    const u = Math.max(0, Math.min(1, s)) * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(u));
    return stops[k].map((x, n) => x + (u - k) * (stops[k + 1][n] - x));
  };
  const L = [-1, -1, 1.4].map((x, _, a) => x / Math.hypot(...a)); // from the north-west, 45° up
  const water = hex(WATER);
  const low = below ? hex(below.color) : null;
  const at = (i, j) => E[Math.max(0, Math.min(H - 1, j)) * W + Math.max(0, Math.min(W - 1, i))];
  for (let j = 0; j < H; j += 1) {
    for (let i = 0; i < W; i += 1) {
      const e = at(i, j);
      let flat = true;
      for (let b = -2; b <= 2 && flat; b += 1) for (let a = -2; a <= 2 && flat; a += 1) if (at(i + a, j + b) !== e) flat = false;
      let c;
      if (flat) c = water;
      else {
        const gx = ((at(i + 1, j) - at(i - 1, j)) / (2 * m)) * relief; // rise to the east
        const gy = ((at(i, j + 1) - at(i, j - 1)) / (2 * m)) * relief; // rise to the south
        const n = [-gx, gy, 1];
        const shade = Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / Math.hypot(...n));
        c = tint((e - lo) / (hi - lo)).map((x) => x * (0.62 + 0.45 * shade));
        if (low && e < below.c) c = c.map((x, k) => 0.35 * x + 0.65 * low[k] * (0.75 + 0.3 * shade));
      }
      const o = 4 * (j * W + i);
      img.data[o] = Math.min(255, c[0]);
      img.data[o + 1] = Math.min(255, c[1]);
      img.data[o + 2] = Math.min(255, c[2]);
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL('image/png');
  urlCache.set(key, url);
  return url;
}

/**
 * The profile of the elevation along a polyline of pixels: points every `step` pixels, as
 * { d (km from the start), e (m), x, y }.
 */
export function profile(t, pts, step = 1) {
  const out = [];
  let d = 0;
  for (let k = 0; k < pts.length - 1; k += 1) {
    const [x0, y0] = pts[k];
    const [x1, y1] = pts[k + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(len / step));
    for (let s = k === 0 ? 0 : 1; s <= n; s += 1) {
      const x = x0 + ((x1 - x0) * s) / n;
      const y = y0 + ((y1 - y0) * s) / n;
      out.push({ d: ((d + (len * s) / n) * t.m) / 1000, e: heightAt(t, x, y), x, y });
    }
    d += len;
  }
  if (pts.length === 1) out.push({ d: 0, e: heightAt(t, ...pts[0]), x: pts[0][0], y: pts[0][1] });
  return out;
}

/**
 * A PNG data URL, one pixel per grid pixel, transparent but where `inside(e, i, j)` holds, which
 * are in `color` at opacity `alpha` (e.g. the points lower than a pass).
 */
const maskCache = new Map();
export function maskUrl(t, key, inside, color, alpha = 0.6) {
  const id = `${t.name}|${key}|${color}|${alpha}`;
  if (maskCache.has(id)) return maskCache.get(id);
  const { W, H, E } = t;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  const c = hex(color);
  for (let j = 0; j < H; j += 1) {
    for (let i = 0; i < W; i += 1) {
      if (!inside(E[j * W + i], i, j)) continue;
      const o = 4 * (j * W + i);
      [img.data[o], img.data[o + 1], img.data[o + 2]] = c;
      img.data[o + 3] = Math.round(255 * alpha);
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL('image/png');
  maskCache.set(id, url);
  return url;
}
