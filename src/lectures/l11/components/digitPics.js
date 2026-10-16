import { PIX, SIDE } from './digits.js';

/**
 * Pictures for the slides of the AI that reads digits (How does an AI learn?, Slide19cAIIdea.jsx,
 * and An AI learns to read digits, Slide19bDigits.jsx).
 */

const PAPER = [255, 255, 255];
const INK = [20, 33, 61]; // #14213d
const RED = [140, 21, 21]; // #8c1515: a weight > 0
const BLUE = [14, 116, 144]; // #0e7490: a weight < 0
const mix = (c, a) => PAPER.map((v, k) => Math.round(v + a * (c[k] - v)));

/** A weight's colour: red if > 0, blue if < 0, deeper with its size (fixed scale, so the pictures emerge from w = 0). */
export const weightColor = (v) => mix(v > 0 ? RED : BLUE, Math.min(1, (Math.abs(v) / 0.25) ** 0.6));

/** A pixel's colour, from 0 (paper) to 1 (ink). */
export const inkColor = (v) => mix(INK, v);

/** A 28 × 28 image (784 values) as a PNG data URL (an <img> survives reveal's print copies; a canvas does not). */
export function pngOf(values, color) {
  const c = document.createElement('canvas');
  c.width = SIDE;
  c.height = SIDE;
  const ctx = c.getContext('2d');
  const im = ctx.createImageData(SIDE, SIDE);
  for (let p = 0; p < PIX; p += 1) {
    const [R, G, B] = color(values[p]);
    im.data[4 * p] = R;
    im.data[4 * p + 1] = G;
    im.data[4 * p + 2] = B;
    im.data[4 * p + 3] = 255;
  }
  ctx.putImageData(im, 0, 0);
  return c.toDataURL();
}
