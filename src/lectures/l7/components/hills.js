import { lineColor } from './levels.js';

/** 0 on one side, then rising with slope 1: a smooth max(t, 0). */
const ramp = (t) => 0.2 * Math.log1p(Math.exp(t / 0.2));

/** How far the valley widens around the big hill, at s (along the valley). */
const bulge = (s) => 0.65 * Math.exp(-((s - 1.1) ** 2));

/**
 * The function with two hills of the title slide and of slides 9 and 10: a high hill (1.9) at
 * (0.8, 0.7) and a lower one (about 1.3) at (−1.1, −1.2), with a pass between them at about 0.48,
 * in a valley along the line y = x − 0.1 through the two tops. The ground rises on the two sides
 * of the valley (the valley widens around the big hill), toward the corners (−3, 3) and (3, −3)
 * (about 0.8 there), so that the level curves below that height are open curves on the two sides
 * of the closed ones around the hills.
 */
export const hills = (x, y) => {
  const d = (x - y - 0.1) / Math.SQRT2; // across the valley, from its floor (+ to the lower right)
  const s = (x + y) / Math.SQRT2; // along it
  return (
    1.9 * Math.exp(-((x - 0.8) ** 2 + (y - 0.7) ** 2) / 1.1) +
    1.25 * Math.exp(-((x + 1.1) ** 2 + (y + 1.2) ** 2) / 0.75) +
    0.35 * (ramp(d - 1.75 - bulge(s)) + ramp(-d - 1.85 - bulge(s)))
  );
};

/** The square [−3, 3] × [−3, 3] the pictures show. */
export const HILLS_R = [-3, 3];

/** Equally spaced levels, and their colours (darker is higher). */
export const HILLS_LEVELS = [0.3, 0.6, 0.9, 1.2, 1.5, 1.8];
export const hillsTone = (c) => lineColor(c / 1.9);

/** The tops of the two hills. */
export const BIG_TOP = [0.8, 0.7];
export const SMALL_TOP = [-1.1, -1.2];

/**
 * Where the level curve f = c meets the ray from `from` at `angle` degrees (y up): the first point
 * where f reaches c, e.g. going down a hill from its top (a place for the label of the level c).
 */
export function toLevel(from, angle, c) {
  const d = [Math.cos((angle * Math.PI) / 180), Math.sin((angle * Math.PI) / 180)];
  const at = (t) => [from[0] + t * d[0], from[1] + t * d[1]];
  const above = hills(...from) > c;
  let a = 0;
  for (let t = 0.01; t < 6; t += 0.01) {
    if (hills(...at(t)) > c !== above) {
      let b = t;
      for (let k = 0; k < 30; k += 1) {
        const m = (a + b) / 2;
        if (hills(...at(m)) > c === above) a = m;
        else b = m;
      }
      return at((a + b) / 2);
    }
    a = t;
  }
  return null;
}
