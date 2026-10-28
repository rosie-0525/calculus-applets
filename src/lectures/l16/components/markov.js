import { useEffect, useRef, useState } from 'react';
import { INK, RED, BLUE, AMBER, GRAY } from './la.js';

export { INK, RED, BLUE, AMBER, GRAY };
export const GREEN = '#2f7d4f';

// Example 1's cities, in the order of n_k = (A_k, B_k, C_k): each city's colour is used for it
// everywhere (its disk, the arrows out of it, its line on the chart, its piece of a bar)
export const CITIES = [
  { name: 'Mountain View', short: 'MV', letter: 'A', color: BLUE },
  { name: 'Palo Alto', short: 'PA', letter: 'B', color: RED },
  { name: 'Menlo Park', short: 'MP', letter: 'C', color: GREEN },
];

// Mark's raccoon matrix: column j says where city j's raccoons go each year
export const M_RACCOON = [
  [1 / 2, 1 / 4, 0],
  [1 / 2, 1 / 2, 2 / 3],
  [0, 1 / 4, 1 / 3],
];
// its equilibrium vector, Mu = u
export const U_RACCOON = [4 / 15, 8 / 15, 1 / 5];

// Example 1, the textbook's bird migration (Section 16.1): three islands, in the order of
// n_k = (A_k, B_k, C_k), each in its colour everywhere (its birds, the flights out of it, its piece of a bar)
export const ISLES = [
  { name: 'A', color: BLUE },
  { name: 'B', color: AMBER },
  { name: 'C', color: GREEN },
];
// column j says where island j's birds go each year: A, half to B, half to C; B, half to A, half
// to C; C, a third stay, a third to A, a third to B
export const M_BIRDS = [
  [0, 1 / 2, 1 / 3],
  [1 / 2, 0, 1 / 3],
  [1 / 2, 1 / 2, 1 / 3],
];
// its equilibrium vector, Mu = u
export const U_BIRDS = [2 / 7, 2 / 7, 3 / 7];
// the obvious migration before it: the same, but no bird ever leaves C
export const M_STAY = [
  [0, 1 / 2, 0],
  [1 / 2, 0, 0],
  [1 / 2, 1 / 2, 1],
];

export const matmul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
export const matvec = (A, v) => A.map((row) => row.reduce((s, a, k) => s + a * v[k], 0));
export const identity = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
export const matpow = (A, k) => {
  let P = identity(A.length);
  for (let i = 0; i < k; i += 1) P = matmul(A, P);
  return P;
};
export const column = (A, j) => A.map((row) => row[j]);

export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
export const clamp = (k, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, k));

/** A seeded random number generator (mulberry32): the same draws on every run and in print. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A number that runs from 0 to 1 at an even pace over `ms` milliseconds, `delay` ms after `on`
 * turns true, and drops back to 0 at once when `on` turns false (going back a key press). `key`
 * restarts it (e.g. a click that starts the run again).
 */
export function useRun(on, { ms = 8000, delay = 400, key = 0 } = {}) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) {
      setT(0);
      return undefined;
    }
    setT(0);
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      setT(k);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on, ms, delay, key]);
  return t;
}

/**
 * Seconds since the slide was built, ticking (every frame) only while it is on screen (its
 * section is `present`), as on Lecture 15's Let's look at more examples of matrices.
 */
export function useClock(ref, { still = 0, print = false } = {}) {
  const [t, setT] = useState(still);
  useEffect(() => {
    if (print) return undefined;
    const t0 = performance.now();
    let frame;
    const step = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present')) setT((now - t0) / 1000);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ref, print]);
  return t;
}

/** True while the slide holding `ref` is the one on screen. */
export function useOnScreen(ref) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const section = ref.current?.closest('section');
    if (!section) return undefined;
    const update = () => setOn(section.classList.contains('present'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [ref]);
  return on;
}

/** The latest value of `v`, for timers that must not restart when it changes. */
export function useLatest(v) {
  const ref = useRef(v);
  ref.current = v;
  return ref;
}

/** A number with a thousands separator, rounded to a whole number. */
export const whole = (x) => Math.round(x).toLocaleString('en-US');

/**
 * An arrowhead (SVG polygon points) at `end`, the end of a line, pointing away from `back` (a point on
 * the curve just before it). Drawn as a polygon rather than an SVG marker: reveal's print mode
 * copies each slide once per key press, and a marker's id then names the copy on an earlier page,
 * hidden there when it sits in a fragment, so the arrowheads vanished.
 */
export function head(back, end, len = 15, width = 13) {
  const dx = end[0] - back[0];
  const dy = end[1] - back[1];
  const n = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / n, dy / n];
  // the tip a little past the end of the line, so that the line's end hides under the head
  const tip = [end[0] + 2.5 * ux, end[1] + 2.5 * uy];
  const [bx, by] = [tip[0] - ux * len, tip[1] - uy * len];
  const [px, py] = [(-uy * width) / 2, (ux * width) / 2];
  return `${tip[0].toFixed(1)},${tip[1].toFixed(1)} ${(bx + px).toFixed(1)},${(by + py).toFixed(1)} ${(bx - px).toFixed(1)},${(by - py).toFixed(1)}`;
}
