import { useEffect, useState } from 'react';
import binUrl from '../data/bay-elevation.bin?url';
import { levelSegments, ramp } from './levels.js';

/**
 * The elevation E(x, y) around Stanford and the South Bay (slides 2 and 7): a 524 × 440 grid
 * of 30 m pixels, row by row from the north, in metres above mean sea level. See
 * src/data/make-bay-elevation.py for the source.
 */
export const W = 524;
export const H = 440;
export const PIXEL_M = 30.34; // metres a pixel
export const KM_W = (W * PIXEL_M) / 1000; // 15.9 km
export const KM_H = (H * PIXEL_M) / 1000; // 13.4 km

/** The deepest point of the Bay in the window, where the water comes from. */
const SEED = [317, 29];

/** Places on the map: grid position (column, row) from make-bay-elevation.py's coordinates. */
export const PLACES = [
  { name: 'Stanford', at: [144.7, 286.1], anchor: 'end', dx: -9, dy: 5 },
  { name: 'the Dish', at: [120.5, 353.6], anchor: 'start', dx: 9, dy: 5 },
  { name: 'Palo Alto', at: [170.3, 221.5], anchor: 'start', dx: 9, dy: 5 },
  { name: 'East Palo Alto', at: [229.8, 132.7], anchor: 'start', dx: 9, dy: 5 },
  { name: 'Meta', at: [210.5, 74.4], anchor: 'end', dx: -9, dy: 5 },
  { name: 'Google', at: [395.8, 304.4], anchor: 'start', dx: 9, dy: 5 },
];

let cache = null;

/** Fetches the grid (once); resolves to it. */
export function loadElevation() {
  if (!cache) {
    cache = {
      promise: fetch(binUrl)
        .then((r) => r.arrayBuffer())
        .then((buf) => {
          const raw = new Int16Array(buf);
          cache.E = Float32Array.from(raw, (v) => v / 10);
          return cache.E;
        }),
    };
  }
  return cache.promise;
}

/** The grid; null until it has arrived. */
export function useElevation() {
  const [E, setE] = useState(cache?.E ?? null);
  useEffect(() => {
    if (E) return undefined;
    let live = true;
    loadElevation().then((e) => live && setE(e));
    return () => {
      live = false;
    };
  }, [E]);
  return E;
}

/**
 * The water when the sea is at level c (m): the pixels below c that the Bay reaches (moving
 * between neighbouring pixels), as a 0/1 mask.
 */
export function flood(E, c) {
  const wet = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0;
  let tail = 0;
  const s = SEED[1] * W + SEED[0];
  wet[s] = 1;
  queue[tail++] = s;
  while (head < tail) {
    const k = queue[head++];
    const i = k % W;
    const nb = [i > 0 ? k - 1 : -1, i < W - 1 ? k + 1 : -1, k - W, k + W];
    for (const m of nb) {
      if (m >= 0 && m < W * H && !wet[m] && E[m] < c) {
        wet[m] = 1;
        queue[tail++] = m;
      }
    }
  }
  return wet;
}

// land: one hue light → dark with height; water: one hue light → dark with depth
export const LAND = ramp(['#f3eedf', '#e6dbbd', '#d3c09a', '#b79d77', '#927858']);
const WATER = ramp(['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95']);

let shadeCache = null;

/** Hillshade (light from the northwest), from the slope of E; 1 on flat ground. */
function hillshade(E) {
  if (shadeCache?.E === E) return shadeCache.s;
  const s = new Float32Array(W * H);
  const ex = 3 / PIXEL_M; // vertical exaggeration 3, per pixel
  const L = [-1, -1, 1.4].map((v, _, a) => v / Math.hypot(...a));
  for (let j = 0; j < H; j += 1) {
    for (let i = 0; i < W; i += 1) {
      const e = (a, b) => E[Math.min(H - 1, Math.max(0, b)) * W + Math.min(W - 1, Math.max(0, a))];
      const gx = ((e(i + 1, j) - e(i - 1, j)) / 2) * ex; // east
      const gy = ((e(i, j + 1) - e(i, j - 1)) / 2) * ex; // south
      const n = [-gx, -gy, 1];
      const len = Math.hypot(...n);
      const lam = (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / len;
      s[j * W + i] = lam / L[2];
    }
  }
  shadeCache = { E, s };
  return s;
}

const rgb = (str) => str.slice(4, -1).split(',').map(Number);

/** Paints the map at sea level c into the RGBA array `px` (W × H): land, and the water `wet`. */
export function paint(E, wet, c, px) {
  const sh = hillshade(E);
  for (let k = 0; k < W * H; k += 1) {
    let col;
    if (wet[k]) {
      col = rgb(WATER(Math.sqrt(Math.min(1, (c - E[k]) / 40))));
    } else {
      const t = Math.sqrt(Math.max(0, E[k]) / 250);
      const base = rgb(LAND(t));
      const m = Math.max(0.72, Math.min(1.12, sh[k]));
      col = base.map((v) => v * m);
    }
    px[4 * k] = col[0];
    px[4 * k + 1] = col[1];
    px[4 * k + 2] = col[2];
    px[4 * k + 3] = 255;
  }
}

/** The map at sea level c as a PNG data URL (for the PDF, which cannot run a canvas). */
export function mapDataUrl(E, c) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(W, H);
  paint(E, flood(E, c), c, img.data);
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/** E as a grid for levels.js, in pixel coordinates (x = column, y = row). */
let gridCache = null;
export function pixelGrid(E) {
  if (gridCache?.E === E) return gridCache.g;
  const v = [];
  for (let j = 0; j < H; j += 1) v.push(E.subarray(j * W, (j + 1) * W));
  const g = { nx: W - 1, ny: H - 1, x0: 0, x1: W - 1, y0: 0, y1: H - 1, v };
  gridCache = { E, g };
  return g;
}

/** The shoreline at level c: the level curve E = c along the water the Bay reaches. */
export function shoreline(E, wet, c) {
  return levelSegments(pixelGrid(E), c, (i, j) => {
    const k = j * W + i;
    return wet[k] || wet[k + 1] || wet[k + W] || wet[k + W + 1];
  });
}

/** The whole level set E = c (in pixel coordinates). */
export function levelSet(E, c) {
  return levelSegments(pixelGrid(E), c);
}

/**
 * A coarse grid of E for the 3-D picture, every `step` pixels (block means), as a levels.js
 * grid in km: x runs south (toward the viewer of a Space), y east, centred on the window.
 * `cell(i, j)` gives the pixel at the corner of the grid cell (i, j).
 */
export function terrainGrid(E, step = 8) {
  const rows = Math.floor((H - 1) / step);
  const cols = Math.floor((W - 1) / step);
  const v = [];
  for (let e = 0; e <= cols; e += 1) {
    const row = new Float64Array(rows + 1);
    for (let s = 0; s <= rows; s += 1) {
      let sum = 0;
      let n = 0;
      for (let dj = -step / 2; dj < step / 2; dj += 1) {
        for (let di = -step / 2; di < step / 2; di += 1) {
          const j = s * step + dj;
          const i = e * step + di;
          if (j >= 0 && j < H && i >= 0 && i < W) {
            sum += E[j * W + i];
            n += 1;
          }
        }
      }
      row[s] = sum / n;
    }
    v.push(row);
  }
  const kx = (rows * step * PIXEL_M) / 1000;
  const ky = (cols * step * PIXEL_M) / 1000;
  return {
    grid: { nx: rows, ny: cols, x0: -kx / 2, x1: kx / 2, y0: -ky / 2, y1: ky / 2, v },
    pixel: (s, e) => [Math.min(W - 1, e * step), Math.min(H - 1, s * step)],
  };
}

/** True in print mode (?print-pdf), where pictures must be still. */
export const PRINT = typeof window !== 'undefined' && /print-pdf/.test(window.location.search);
