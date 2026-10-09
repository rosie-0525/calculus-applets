import { useEffect, useState } from 'react';
import photoUrl from '../assets/hoover.jpg';

/**
 * The photo of the motivation (Hoover Tower and the arcade of the Main Quad,
 * src/data/make-photo.py): a PW × PH grid of pixels.
 *
 * For "Remove the background": its colour f(x, y) = (R, G, B), x the column and y the row counted
 * from the bottom, so that north is up; the lengths of the changes going east one pixel,
 * ‖f(x + 1, y) − f(x, y)‖ (`eastC`), and going north, ‖f(x, y + 1) − f(x, y)‖ (`northC`), each as
 * an image (white is 0, dark where the colour changes fast, scaled by GAIN); and the flood that
 * removes the sky (`floodLayers`, `paintRemoved`, `removedUrl`). For the tiny Photoshop: the same
 * flood from the pixel clicked, its pixels deleted (`paintDeleted`, `maskUrl`).
 *
 * For "Photoshop filters" (commented out in App.jsx): its brightness
 * f(x, y) = 0.299 R + 0.587 G + 0.114 B (the weights of ITU-R BT.601, used by JPEG), x the column
 * and y the row counted from the bottom, so that north is up. From it, the change going east one
 * pixel, f(x + 1, y) − f(x, y), the change going north, f(x, y + 1) − f(x, y), and the size of the
 * change, √(east² + north²), each as an image: the two signed ones are Photoshop's Emboss (mid-gray
 * is 0; lighter: getting brighter in that direction; darker: getting darker), the size is its Find
 * Edges (white is 0, the edges dark, a line drawing), and all three are scaled by GAIN so that the
 * changes show.
 */
export const PW = 480;
export const PH = 600;
export const LUMA = [0.299, 0.587, 0.114];
export const GAIN = 3;

let cache = null;

function build(img) {
  const canvas = document.createElement('canvas');
  canvas.width = PW;
  canvas.height = PH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, PW, PH);
  const rgba = ctx.getImageData(0, 0, PW, PH).data;

  // the lengths of the changes of the colour going east (the next column) and north (the row
  // above), pixel k = row * PW + col (rows from the top, as the image is stored)
  const eastC = new Float32Array(PW * PH);
  const northC = new Float32Array(PW * PH);
  const dist = (j, k) =>
    Math.hypot(rgba[4 * j] - rgba[4 * k], rgba[4 * j + 1] - rgba[4 * k + 1], rgba[4 * j + 2] - rgba[4 * k + 2]);
  for (let row = 0; row < PH; row += 1) {
    for (let col = 0; col < PW; col += 1) {
      const k = row * PW + col;
      eastC[k] = col + 1 < PW ? dist(k + 1, k) : 0;
      northC[k] = row > 0 ? dist(k - PW, k) : 0;
    }
  }

  // the brightness
  const L = new Float32Array(PW * PH);
  for (let k = 0; k < PW * PH; k += 1) {
    L[k] = LUMA[0] * rgba[4 * k] + LUMA[1] * rgba[4 * k + 1] + LUMA[2] * rgba[4 * k + 2];
  }

  // the changes going east (the next column) and north (the row above), and their size
  const east = new Float32Array(PW * PH);
  const north = new Float32Array(PW * PH);
  const edge = new Float32Array(PW * PH);
  for (let row = 0; row < PH; row += 1) {
    for (let col = 0; col < PW; col += 1) {
      const k = row * PW + col;
      east[k] = col + 1 < PW ? L[k + 1] - L[k] : 0;
      north[k] = row > 0 ? L[k - PW] - L[k] : 0;
      edge[k] = Math.hypot(east[k], north[k]);
    }
  }

  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const url = (value) => {
    const out = ctx.createImageData(PW, PH);
    for (let k = 0; k < PW * PH; k += 1) {
      const v = clamp(value(k));
      out.data[4 * k] = v;
      out.data[4 * k + 1] = v;
      out.data[4 * k + 2] = v;
      out.data[4 * k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    return canvas.toDataURL('image/png');
  };
  const urls = {
    gray: url((k) => L[k]),
    east: url((k) => 128 + GAIN * east[k]),
    north: url((k) => 128 + GAIN * north[k]),
    edges: url((k) => 255 - GAIN * edge[k]),
    eastC: url((k) => 255 - GAIN * eastC[k]),
    northC: url((k) => 255 - GAIN * northC[k]),
  };

  return { rgba, eastC, northC, L, east, north, edge, urls };
}

/** The two top corners of the photo, where the flood starts. */
export const SEEDS = [0, PW - 1];

/**
 * Removes the background: floods the photo from the `seeds` (the two top corners, or the pixel
 * clicked), one pixel at a time (east,
 * west, north or south), taking a step only if the colour changes by less than T across it, i.e.
 * ‖f(x + 1, y) − f(x, y)‖ < T for a step east or west, ‖f(x, y + 1) − f(x, y)‖ < T for a step north
 * or south. Returns, for each pixel, the step at which the flood reaches it (−1 if never), and the
 * last step.
 */
export function floodLayers(photo, T, seeds = SEEDS) {
  const { eastC, northC } = photo;
  const n = PW * PH;
  const layer = new Int32Array(n).fill(-1);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (const s of seeds) {
    layer[s] = 0;
    queue[tail++] = s;
  }
  const visit = (j, next) => {
    layer[j] = next;
    queue[tail++] = j;
  };
  while (head < tail) {
    const k = queue[head++];
    const col = k % PW;
    const next = layer[k] + 1;
    if (col + 1 < PW && layer[k + 1] < 0 && eastC[k] < T) visit(k + 1, next);
    if (col > 0 && layer[k - 1] < 0 && eastC[k - 1] < T) visit(k - 1, next);
    if (k >= PW && layer[k - PW] < 0 && northC[k] < T) visit(k - PW, next);
    if (k + PW < n && layer[k + PW] < 0 && northC[k + PW] < T) visit(k + PW, next);
  }
  return { layer, max: layer[queue[tail - 1]], count: tail };
}

const pack = ([r, g, b]) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
const CHECK = 16; // the side of the checkerboard's squares, in pixels
const LIGHT = pack([255, 255, 255]);
const DARK = pack([214, 214, 214]);
const FRONT = pack([37, 99, 235]); // the flood's front, while it spreads
const BAND = 6; // the front's width, in steps
const checker = (k) => ((((k % PW) / CHECK) | 0) + (((k / PW) / CHECK) | 0)) % 2 ? DARK : LIGHT;

/**
 * Paints the photo into `out` (ImageData data, PW × PH) with the pixels the flood has reached by
 * step `upTo` replaced by a checkerboard (Photoshop's "transparent"), the last BAND steps in blue
 * while `front` is true.
 */
export function paintRemoved(photo, { layer }, upTo, out, front = false) {
  const src = new Uint32Array(photo.rgba.buffer, photo.rgba.byteOffset, PW * PH);
  const dst = new Uint32Array(out.buffer, out.byteOffset, PW * PH);
  for (let k = 0; k < PW * PH; k += 1) {
    const l = layer[k];
    if (l < 0 || l > upTo) dst[k] = src[k];
    else if (front && l > upTo - BAND) dst[k] = FRONT;
    else dst[k] = checker(k);
  }
}

/** Paints the photo into `out` with the pixels of `mask` (1: deleted) replaced by the checkerboard. */
export function paintDeleted(photo, mask, out) {
  const src = new Uint32Array(photo.rgba.buffer, photo.rgba.byteOffset, PW * PH);
  const dst = new Uint32Array(out.buffer, out.byteOffset, PW * PH);
  for (let k = 0; k < PW * PH; k += 1) dst[k] = mask[k] ? checker(k) : src[k];
}

/** The photo with the pixels of `mask` deleted, as a data URL (for the PDF). */
export function maskUrl(photo, mask) {
  const canvas = document.createElement('canvas');
  canvas.width = PW;
  canvas.height = PH;
  const ctx = canvas.getContext('2d');
  const out = ctx.createImageData(PW, PH);
  paintDeleted(photo, mask, out.data);
  ctx.putImageData(out, 0, 0);
  return canvas.toDataURL('image/png');
}

const stills = new Map();
/** The photo with its background removed at tolerance T, as a data URL (for the PDF). */
export function removedUrl(photo, T) {
  if (!stills.has(T)) {
    const canvas = document.createElement('canvas');
    canvas.width = PW;
    canvas.height = PH;
    const ctx = canvas.getContext('2d');
    const out = ctx.createImageData(PW, PH);
    paintRemoved(photo, floodLayers(photo, T), Infinity, out.data);
    ctx.putImageData(out, 0, 0);
    stills.set(T, canvas.toDataURL('image/png'));
  }
  return stills.get(T);
}

export { photoUrl };

/** Loads and decodes the photo (once); resolves to { rgba, eastC, northC, L, east, north, edge, urls }. */
export function loadPhoto() {
  if (!cache) {
    cache = {
      promise: new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = photoUrl;
      }).then((img) => {
        cache.photo = build(img);
        return cache.photo;
      }),
    };
  }
  return cache.promise;
}

/** The photo; null until it has been decoded. */
export function usePhoto() {
  const [p, setP] = useState(cache?.photo ?? null);
  useEffect(() => {
    if (p) return undefined;
    let live = true;
    loadPhoto().then((q) => live && setP(q));
    return () => {
      live = false;
    };
  }, [p]);
  return p;
}
