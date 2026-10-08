import { useEffect, useState } from 'react';
import photoUrl from '../assets/kitten.jpg';

/**
 * The photo of slide 17c: a gray kitten among daisies (src/data/make-photo.py), a
 * PW × PH grid of pixels (x = column, y = row, from the top left), each with its colour
 * f(x, y) = (R, G, B), and its brightness L = h ∘ f, h(R, G, B) = 0.299 R + 0.587 G + 0.114 B
 * (the weights of ITU-R BT.601, used by JPEG).
 */
export const PW = 480;
export const PH = 600;
export const LUMA = [0.299, 0.587, 0.114];

/** The landscape's grid: L averaged over BLOCK × BLOCK pixels. */
const BLOCK = 4;

let cache = null;

function build(img) {
  const canvas = document.createElement('canvas');
  canvas.width = PW;
  canvas.height = PH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, PW, PH);
  const rgba = ctx.getImageData(0, 0, PW, PH).data;

  const L = new Float32Array(PW * PH);
  for (let k = 0; k < PW * PH; k += 1) {
    L[k] = LUMA[0] * rgba[4 * k] + LUMA[1] * rgba[4 * k + 1] + LUMA[2] * rgba[4 * k + 2];
  }

  // an image of each component (R, 0, 0), (0, G, 0), (0, 0, B), and of the brightness (L, L, L)
  const url = (pixel) => {
    const out = ctx.createImageData(PW, PH);
    for (let k = 0; k < PW * PH; k += 1) {
      const [a, b, c] = pixel(k);
      out.data[4 * k] = a;
      out.data[4 * k + 1] = b;
      out.data[4 * k + 2] = c;
      out.data[4 * k + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    return canvas.toDataURL('image/png');
  };
  const urls = {
    color: photoUrl,
    r: url((k) => [rgba[4 * k], 0, 0]),
    g: url((k) => [0, rgba[4 * k + 1], 0]),
    b: url((k) => [0, 0, rgba[4 * k + 2]]),
    gray: url((k) => [L[k], L[k], L[k]].map(Math.round)),
  };

  // the landscape's grid (levels.js), in pixel coordinates: grid point (i, j) is the centre of
  // the block in block column i, block row j
  const nx = PW / BLOCK - 1;
  const ny = PH / BLOCK - 1;
  const v = [];
  for (let j = 0; j <= ny; j += 1) {
    const row = new Float64Array(nx + 1);
    for (let i = 0; i <= nx; i += 1) {
      let sum = 0;
      for (let dj = 0; dj < BLOCK; dj += 1) {
        for (let di = 0; di < BLOCK; di += 1) sum += L[(j * BLOCK + dj) * PW + i * BLOCK + di];
      }
      row[i] = sum / (BLOCK * BLOCK);
    }
    v.push(row);
  }
  const h = BLOCK / 2;
  const grid = { nx, ny, x0: h, x1: PW - h, y0: h, y1: PH - h, v };

  return { rgba, L, urls, grid };
}

/** Loads and decodes the photo (once); resolves to { rgba, L, urls, grid }. */
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
