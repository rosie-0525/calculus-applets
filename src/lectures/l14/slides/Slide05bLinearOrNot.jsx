import { useEffect, useRef, useState } from 'react';
import Fragment from '../components/Fragment.jsx';
import { PRINT } from '../components/print.js';

export const INK = '#14213d';
export const RED = '#8c1515';
export const TEAL = '#0e7490';

/**
 * Seconds since the slide was built, ticking (every frame) only while it is on screen; frozen at
 * `still` in print mode (as on Let's look at examples of linear transformations).
 */
export function useClock(ref, still) {
  const [t, setT] = useState(still);
  useEffect(() => {
    if (PRINT) return undefined;
    const t0 = performance.now();
    let frame;
    const step = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present')) setT((now - t0) / 1000);
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ref]);
  return t;
}

export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

// the loop, in seconds: wait, glide to f, hold, glide back
export const LOOP = [0.8, 1.4, 1.4, 1.4];
export function phase(t) {
  let u = t % LOOP.reduce((a, b) => a + b);
  if (u < LOOP[0]) return 0;
  u -= LOOP[0];
  if (u < LOOP[1]) return ease(u / LOOP[1]);
  u -= LOOP[1];
  if (u < LOOP[2]) return 1;
  return 1 - ease((u - LOOP[2]) / LOOP[3]);
}

export const lin = (M) => ([x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
export const rot = (a) => [
  [Math.cos(a), -Math.sin(a)],
  [Math.sin(a), Math.cos(a)],
];
// the projection onto the line through w = (1, 2) (as on Projections)
export const W2 = [1, 2];
export const PROJ = [
  [1 / 5, 2 / 5],
  [2 / 5, 4 / 5],
];

// each card's map f_s, from the identity (s = 0) to f (s = 1); the linear maps stay linear on the way
export const CARDS = [
  { name: 'Rotation', linear: true, f: (s) => lin(rot((s * Math.PI) / 2)) },
  { name: 'Swirl', linear: false, f: (s) => (v) => lin(rot(0.75 * s * Math.hypot(...v)))(v) },
  {
    name: 'Projection',
    linear: true,
    f: (s) =>
      lin([
        [1 - s + s * PROJ[0][0], s * PROJ[0][1]],
        [s * PROJ[1][0], 1 - s + s * PROJ[1][1]],
      ]),
    line: [W2, false],
  },
  { name: 'Shift', linear: false, f: (s) => ([x, y]) => [x + 0.8 * s, y + 0.5 * s] },
  { name: 'Wave', linear: false, f: (s) => ([x, y]) => [x, y + 0.4 * s * Math.sin(2 * x)] },
  {
    name: 'Shear',
    linear: true,
    f: (s) =>
      lin([
        [1, s],
        [0, 1],
      ]),
  },
  {
    name: 'Bulge',
    linear: false,
    f: (s) => ([x, y]) => {
      const g = 1 + 1.1 * s * Math.exp(-(x * x + y * y) / 0.8);
      return [g * x, g * y];
    },
  },
  {
    name: 'Reflection',
    linear: true,
    f: (s) =>
      lin([
        [Math.cos(Math.PI * s), 0],
        [0, 1],
      ]),
    line: [[0, 1], true],
  },
];

// the unit square S with the letter F in it (as on Linear transformations of ℝ²), and the picture
export const F = [
  [0.25, 0.12],
  [0.45, 0.12],
  [0.45, 0.42],
  [0.68, 0.42],
  [0.68, 0.58],
  [0.45, 0.58],
  [0.45, 0.7],
  [0.78, 0.7],
  [0.78, 0.88],
  [0.25, 0.88],
];
export const S = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
export const CW = 268;
export const CH = 196;
export const U = 56;
export const MID = [0.45, 0.35]; // the point of the plane at the picture's centre
export const px = (x) => CW / 2 + U * (x - MID[0]);
export const py = (y) => CH / 2 - U * (y - MID[1]);
export const pts = (qs) => qs.map(([x, y]) => `${px(x).toFixed(1)},${py(y).toFixed(1)}`).join(' ');

/** A closed polygon with each edge cut into n pieces, so that a nonlinear map can bend it. */
export const dense = (poly, n) =>
  poly.flatMap((p, m) => {
    const q = poly[(m + 1) % poly.length];
    return Array.from({ length: n }, (_, j) => [p[0] + ((q[0] - p[0]) * j) / n, p[1] + ((q[1] - p[1]) * j) / n]);
  });
export const SD = dense(S, 24);
export const FD = dense(F, 8);
// the grid lines x = k and y = k, each a list of points
export const L = 6;
export const TS = Array.from({ length: 121 }, (_, m) => -L + (2 * L * m) / 120);
export const LINES = Array.from({ length: 2 * L + 1 }, (_, m) => m - L).flatMap((k) => [TS.map((t) => [k, t]), TS.map((t) => [t, k])]);

export function Card({ card, s }) {
  const f = card.f(s);
  const ks = (lo, hi) => Array.from({ length: Math.floor(hi) - Math.ceil(lo) + 1 }, (_, m) => Math.ceil(lo) + m);
  const xr = [MID[0] - CW / 2 / U, MID[0] + CW / 2 / U];
  const yr = [MID[1] - CH / 2 / U, MID[1] + CH / 2 / U];
  const o = f([0, 0]);
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} width={CW} height={CH} aria-hidden="true">
      <g stroke="#eef0f3" strokeWidth="1">
        {ks(...xr).map((k) => (
          <line key={`v${k}`} x1={px(k)} y1={0} x2={px(k)} y2={CH} />
        ))}
        {ks(...yr).map((k) => (
          <line key={`h${k}`} x1={0} y1={py(k)} x2={CW} y2={py(k)} />
        ))}
      </g>
      <g stroke="#c4c9d1" strokeWidth="1.4">
        <line x1={0} y1={py(0)} x2={CW} y2={py(0)} />
        <line x1={px(0)} y1={0} x2={px(0)} y2={CH} />
      </g>
      {card.line && (
        <line
          x1={px(-4 * card.line[0][0])}
          y1={py(-4 * card.line[0][1])}
          x2={px(4 * card.line[0][0])}
          y2={py(4 * card.line[0][1])}
          stroke={TEAL}
          strokeWidth="2.2"
          strokeDasharray={card.line[1] ? '6 5' : undefined}
        />
      )}
      <g fill="none" stroke="#9fb0c7" strokeWidth="1.2">
        {LINES.map((line, m) => (
          <polyline key={m} points={pts(line.map(f))} />
        ))}
      </g>
      <polygon points={pts(S)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={pts(F)} fill="#d1d5db" />
      <polygon points={pts(SD.map(f))} fill="rgba(242, 179, 122, 0.55)" stroke="#c2702a" strokeWidth="2" strokeLinejoin="round" />
      <polygon points={pts(FD.map(f))} fill={RED} stroke={RED} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={px(o[0])} cy={py(o[1])} r="3.5" fill={INK} />
    </svg>
  );
}

/**
 * Linear or not? (the user's request, before Let's look at examples of linear transformations):
 * eight maps of ℝ², each a card where the grid, the unit square S and the F in it glide to their
 * images and back, on a loop, all in step; the students judge each one with the Linearity
 * Principle. Linear: rotation by 90°, the projection onto the line through (1, 2), a shear and the
 * reflection in the y-axis; not linear: a swirl (a turn that grows with the distance from 0), a shift
 * (f(0) ≠ 0, although the grid stays a grid), a wave and a bulge (lines through 0 stay straight, but
 * f(cv) ≠ c f(v)). Key press 2k − 1: card k; 2k: its verdict. Print mode shows the images.
 */
export default function Slide05bLinearOrNot() {
  const ref = useRef(null);
  const t = useClock(ref, 0);
  const s = PRINT ? 1 : phase(t);
  return (
    <section ref={ref}>
      <h2>Linear or not?</h2>

      <div className="l14-lin-grid">
        {CARDS.map((card, k) => (
          <Fragment key={card.name} index={2 * k + 1} as="figure" className="l14-lin-card">
            <div className="l14-lin-pic">
              <Card card={card} s={s} />
              <Fragment index={2 * k + 2} as="span" className={`l14-lin-verdict ${card.linear ? 'yes' : 'no'}`}>
                {card.linear ? '✓ linear' : '✗ not linear'}
              </Fragment>
            </div>
            <figcaption>{card.name}</figcaption>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
