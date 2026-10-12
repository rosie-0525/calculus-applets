import Plane, { Dot } from './Plane.jsx';
import Space, { PlanePatch, Dot3, Patch3 } from './Space.jsx';
import Surface from './Surface.jsx';
import { hills, HILLS_R } from './hills.js';

/**
 * The two examples of functions on a restricted domain, shared by Local extrema on a region
 * (Slide12bLocalRegion.jsx), Global extrema (Slide13Global.jsx) and Single variable function
 * (Slide13bRecall.jsx): a function on an interval [a, b], and the two hills on a rectangle D.
 */

const INK = '#14213d';
const GRAY = '#6b7280';
const SANS = 'Source Sans Pro, Helvetica, sans-serif';
const MATH = 'KaTeX_Math, Georgia, serif';

// ---------- on an interval ----------
// f′(x) = −3(x − 1)(x − 2.6): on [a, b] = [0.3, 3.7], local maxima at the endpoint a and at the
// critical point 2.6 (the global one), local minima at the critical point 1 and at the endpoint b
// (the global one)
export const fi = (x) => -(x ** 3) + 5.4 * x * x - 7.8 * x + 6;
export const IV = { a: 0.3, b: 3.7, min: 1, max: 2.6 };
const XR = [-0.2, 4.3];
const YR = [-0.7, 5.6];

const path = (p, [a, b], N = 160) =>
  Array.from({ length: N + 1 }, (_, k) => a + ((b - a) * k) / N)
    .map((t, k) => `${k ? 'L' : 'M'}${p.px(t).toFixed(1)},${p.py(fi(t)).toFixed(1)}`)
    .join(' ');

/** An endpoint of the interval: the point (e, f(e)), a dashed line down to the x-axis, and its name under it. */
function End({ p, e, name }) {
  return (
    <g>
      <line x1={p.px(e)} x2={p.px(e)} y1={p.py(fi(e))} y2={p.py(0)} stroke={GRAY} strokeWidth="1.5" strokeDasharray="4 4" />
      <text x={p.px(e)} y={p.py(0) + 24} textAnchor="middle" fill={INK} fontSize="22" fontStyle="italic" fontFamily={MATH}>
        {name}
      </text>
      <Dot p={p} at={[e, fi(e)]} color={INK} r={5} />
    </g>
  );
}

/** The graph of f on [a, b] (`unit` pixels per unit, [x, y]), with `children(p)` drawn over it. */
export function IntervalGraph({ unit = [100, 60], title, children }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={unit} xTicks={[]} yTicks={[]} grid={false} title={title}>
      {(p) => (
        <g>
          <End p={p} e={IV.a} name="a" />
          <End p={p} e={IV.b} name="b" />
          <path d={path(p, [IV.a, IV.b])} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <text x={p.px(0.45)} y={p.py(5.0)} fill={INK} fontSize="20" fontStyle="italic" fontFamily={MATH}>
            y = f(x)
          </text>
          {children && children(p)}
        </g>
      )}
    </Plane>
  );
}

/**
 * A point (c, f(c)) of the graph on [a, b], in `color`, with its horizontal tangent line if `flat`
 * (a critical point), and its label: above it, or below with `below`; `anchor` and `dx` move it
 * aside.
 */
export function IntervalMark({ p, c, color, label, flat = false, below = false, anchor = 'middle', dx = 0, dy }) {
  const x = p.px(c);
  const y = p.py(fi(c));
  return (
    <g>
      {flat && <line x1={p.px(c - 0.6)} x2={p.px(c + 0.6)} y1={y} y2={y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />}
      <Dot p={p} at={[c, fi(c)]} color={color} r={6.5} stroke="#fff" strokeWidth="1.5" />
      <text x={x + dx} y={y + (dy ?? (below ? 30 : -16))} textAnchor={anchor} fill={color} fontSize="19" fontWeight="700" fontFamily={SANS}>
        {label}
      </text>
    </g>
  );
}

// ---------- the two hills on a rectangle ----------
const FLOOR = -0.9;
const Z = 1.1;
export const HILL = {
  big: [0.8, 0.7],
  small: [-1.097, -1.197],
  // D = [−3, 0.5] × [−3, 0.4]: f increases along its two inner edges toward their corner (0.5, 0.4),
  // where f ≈ 1.61, above the small top (1.25)
  corner: [0.5, 0.4],
};
const DX = [-3, 0.5];
const DY = [-3, 0.4];
const VIEW = { width: 380, height: 260, unit: 40, center: [0.5, 0.6], axes: false, az: 120, el: 28, swing: 8 };

/** A point of the graph of the hills with a label above it. */
export function HillMark({ s, at, color, label, dy = -16 }) {
  const q = [at[0], at[1], Z * hills(...at)];
  const [x, y] = s.P(q);
  return (
    <g>
      <Dot3 s={s} at={q} color={color} r={6.5} stroke="#fff" strokeWidth="1.5" />
      <text x={x} y={y + dy} textAnchor="middle" fill={color} fontSize="17" fontWeight="700" fontFamily={SANS} className="map-label">
        {label}
      </text>
    </g>
  );
}

/** The graph of the two hills over all of ℝ² (the square shown), with `children(s)` drawn over it. */
export function HillsGraph({ title, children }) {
  return (
    <Space {...VIEW} title={title}>
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={HILLS_R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <Surface s={s} f={hills} x={HILLS_R} y={HILLS_R} n={30} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
          {children && children(s)}
        </g>
      )}
    </Space>
  );
}

/** The graph of the two hills over the rectangle D only (D shaded on the floor), with `children(s)` drawn over it. */
export function HillsOnD({ title, children }) {
  return (
    <Space {...VIEW} title={title}>
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={HILLS_R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <Patch3
            s={s}
            corners={[
              [DX[0], DY[0], FLOOR],
              [DX[1], DY[0], FLOOR],
              [DX[1], DY[1], FLOOR],
              [DX[0], DY[1], FLOOR],
            ]}
            fill="#0e7490"
            opacity={0.18}
          />
          <Surface s={s} f={hills} x={DX} y={DY} n={[20, 20]} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
          {children && children(s)}
          <text x={s.P([-2.2, -2.6, FLOOR])[0]} y={s.P([-2.2, -2.6, FLOOR])[1] + 4} fill="#0e7490" fontSize="20" fontStyle="italic" fontFamily={MATH}>
            D
          </text>
        </g>
      )}
    </Space>
  );
}
