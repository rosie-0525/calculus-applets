import { useId, useState } from 'react';
import { lineColor, sample, levelSegments, segmentsPath } from './levels.js';
import { Arrow } from './Plane.jsx';
import { B, I, MAIN } from './svgmath.jsx';
import { NamedPoint, RED, PURPLE, INK } from './Example1.jsx';
import { CONTOURS, CURVE, LABELS } from './hour27.js';
import { PRINT } from './print.js';

const SIZE = 440;
const PAD = 26;
const W = SIZE - 2 * PAD;
const px = (u) => PAD + ((u + 1) / 2) * W;
const py = (v) => PAD + ((1 - v) / 2) * W;
const pts = (list) => list.map(([u, v]) => `${px(u).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
const TEAL = lineColor(0.6);
/** The point of the plane at (X, Y) in the picture's viewBox. */
export const toPlane = (X, Y) => [((X - PAD) / W) * 2 - 1, 1 - ((Y - PAD) / W) * 2];

// f and g of Example 1, recovered from the picture, in its coordinates: the cubic that fits the
// traced level curves (to within 0.02 of a level; its max and min on C are 11.93 and 6.03), and
// the conic g(x, y) = 63.70x² − 60.09xy + 28.36y² − 3.63x − 5.59y = 1 that fits C (to within 1%)
export const f27 = (x, y) => 8 * x ** 3 + (4 / 3) * x * x + 8 * x * y + 12 * y * y - 6 * x + 7;
export const gradF27 = (x, y) => [24 * x * x + (8 / 3) * x + 8 * y - 6, 8 * x + 24 * y];
export const gradG27 = (x, y) => [127.41 * x - 60.09 * y - 3.63, -60.09 * x + 56.72 * y - 5.59];
const LABEL = lineColor(0.85);

/**
 * The contour map of f and the curve C of Q2 of the worksheet "Hour 27 - Lagrange Multipliers" (its
 * right picture; hour27.js), in the square [−1, 1]²; `children(p)` draws more on top, with p.px,
 * p.py. Its ids are its own, so that it can be on two slides.
 */
export function CurvePicture({ children }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="figure-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label="The contour map of a function f(x, y), the levels 6, 9, 12, 15 and 18 labelled, and a closed curve C">
      <defs>
        <clipPath id={`${id}-box`}>
          <rect x={px(-1)} y={py(1)} width={W} height={W} />
        </clipPath>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,1 L10,5 L0,9 Z" fill={INK} />
        </marker>
      </defs>
      <g stroke="#4b5563" strokeWidth="1.2">
        <line x1={px(-1)} y1={py(0)} x2={px(1.06)} y2={py(0)} markerEnd={`url(#${id}-arrow)`} />
        <line x1={px(0)} y1={py(-1)} x2={px(0)} y2={py(1.06)} markerEnd={`url(#${id}-arrow)`} />
      </g>
      <text x={px(1.06) + 4} y={py(0) + 6} fontSize="18" fontFamily={MAIN} fontStyle="italic" fill={INK}>
        x
      </text>
      <text x={px(0) - 6} y={py(1.06) + 2} textAnchor="end" fontSize="18" fontFamily={MAIN} fontStyle="italic" fill={INK}>
        y
      </text>
      <g clipPath={`url(#${id}-box)`} fill="none" stroke={TEAL} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {CONTOURS.map((c, k) => (
          <polyline key={k} points={pts(c)} />
        ))}
      </g>
      {LABELS.map(([t, u, v], k) => (
        <text key={k} x={px(u)} y={py(v) + 5} textAnchor="middle" fontSize="15" fontWeight="600" fill={LABEL} className="map-label">
          {t}
        </text>
      ))}
      <polyline points={pts(CURVE)} fill="none" stroke={PURPLE} strokeWidth="2.6" strokeLinejoin="round" />
      <text x={px(-0.13)} y={py(0.4)} textAnchor="middle" fontSize="22" fontFamily={MAIN} fontStyle="italic" fill={PURPLE} className="map-label">
        C
      </text>
      {children?.({ px, py })}
    </svg>
  );
}


/**
 * The point of the polyline `poly` (closed if its ends meet) a fraction s of the way along it, by
 * arc length, and its unit tangent there, in the direction of the polyline.
 */
export function pointOn(poly, s) {
  const cum = [0];
  for (let k = 1; k < poly.length; k += 1) cum.push(cum[k - 1] + Math.hypot(poly[k][0] - poly[k - 1][0], poly[k][1] - poly[k - 1][1]));
  const total = cum[cum.length - 1];
  const closed = Math.hypot(poly[0][0] - poly[poly.length - 1][0], poly[0][1] - poly[poly.length - 1][1]) < 1e-6;
  const at = (d) => {
    const l = closed ? ((d % total) + total) % total : Math.min(total, Math.max(0, d));
    let k = 1;
    while (k < cum.length - 1 && cum[k] < l) k += 1;
    const t = (l - cum[k - 1]) / (cum[k] - cum[k - 1] || 1);
    return [poly[k - 1][0] + t * (poly[k][0] - poly[k - 1][0]), poly[k - 1][1] + t * (poly[k][1] - poly[k - 1][1])];
  };
  const d = s * total;
  const h = 0.04; // the tangent from two points this far either side (the polyline is traced, so not smooth)
  const [p0, p1] = [at(d - h), at(d + h)];
  const n = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  return { at: at(d), tangent: [(p1[0] - p0[0]) / n, (p1[1] - p0[1]) / n] };
}

// the fraction of the way round C at each of its vertices, to find the one nearest the mouse
const AT = (() => {
  const cum = [0];
  for (let k = 1; k < CURVE.length; k += 1) cum.push(cum[k - 1] + Math.hypot(CURVE[k][0] - CURVE[k - 1][0], CURVE[k][1] - CURVE[k - 1][1]));
  return cum.map((c) => c / cum[cum.length - 1]);
})();

/**
 * A point that the mouse drags round C, from the fraction s0 of the way round it: [s, move], with
 * `move` for onPointerDown and onPointerMove of a box around a CurvePicture (Finding constrained
 * max/min, Lagrange multipliers). In print mode it stays at s0.
 */
export function useDragOnC(s0) {
  const [s, setS] = useState(s0);
  const move = (e) => {
    if (PRINT || (!(e.buttons & 1) && e.type !== 'pointerdown')) return;
    const svg = e.currentTarget.querySelector('svg');
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const [x, y] = toPlane(((e.clientX - rect.left) / rect.width) * vb.width, ((e.clientY - rect.top) / rect.height) * vb.height);
    let best = 0;
    CURVE.forEach(([cx, cy], k) => {
      if (Math.hypot(cx - x, cy - y) < Math.hypot(CURVE[best][0] - x, CURVE[best][1] - y)) best = k;
    });
    setS(AT[best]);
  };
  return [s, move];
}

const K = 0.015; // ∇f(a) and ∇g(a) are drawn at 0.015 of their length, so that λ shows
const GRID = sample(f27, [-1, 1], [-1, 1], 200);
// the value f(a) is written on the red level curve, at its point nearest here (below and to the
// right of C, clear of the arrows and of the picture's own labels), so that it moves with the curve
const ANCHOR = [0.5, -0.62];

/**
 * A label at the tip of the arrow from a to a + v: `ahead` pixels beyond it, and `side` pixels to
 * its left (to its right, if negative).
 */
function TipLabel({ p, a, v, ahead = 0, side = 0, color, children }) {
  const n = Math.hypot(...v);
  const tip = [p.px(a[0] + v[0]), p.py(a[1] + v[1])];
  const d = [v[0] / n, -v[1] / n]; // in pixels, the y axis points down
  const x = tip[0] + ahead * d[0] + side * d[1];
  const y = tip[1] + ahead * d[1] - side * d[0];
  return (
    <text x={Math.max(p.px(-0.9), Math.min(p.px(0.9), x))} y={y + 6} textAnchor="middle" fontSize="18" fontFamily={MAIN} fill={color} className="map-label">
      {children}
    </text>
  );
}

/**
 * The point a the fraction s of the way round C: the level curve of f through a (red), with its
 * value f(a) on it (if `value`; at its point nearest `anchor`), the tangent line to C with the direction u (if `tangent`), and
 * ∇g(a) (purple) and ∇f(a) (red), at K of their length (Finding constrained max/min, Lagrange
 * multipliers). `level`, if given, is drawn and named instead of f(a) (an integer without decimals).
 */
export function AtPoint({ p, s, tangent = true, value = true, anchor = ANCHOR, level: given }) {
  const { at: a } = pointOn(CURVE, s);
  const dg = gradG27(...a).map((c) => K * c);
  const df = gradF27(...a).map((c) => K * c);
  const ng = Math.hypot(...dg);
  const out = [dg[0] / ng, dg[1] / ng]; // out of C
  const u = [out[1], -out[0]]; // along C, clockwise: to the right at the top, where a starts
  // nearly parallel arrows (within 30°) have their labels on either side, others beyond their tips
  const cos = (df[0] * dg[0] + df[1] * dg[1]) / (Math.hypot(...df) * ng);
  const beside = Math.abs(cos) > Math.cos(Math.PI / 6);
  const level = given ?? f27(...a);
  const segs = levelSegments(GRID, level);
  let mark = segs[0][0];
  for (const seg of segs) for (const q of seg) if (Math.hypot(q[0] - anchor[0], q[1] - anchor[1]) < Math.hypot(mark[0] - anchor[0], mark[1] - anchor[1])) mark = q;
  return (
    <g>
      <path d={segmentsPath(segs, ([x, y]) => [p.px(x), p.py(y)])} fill="none" stroke={RED} strokeWidth="2.4" strokeOpacity="0.75" />
      {value && (
        <text x={p.px(mark[0])} y={p.py(mark[1]) + 5} textAnchor="middle" fontSize="16" fontWeight="600" fill={RED} className="map-label">
          {Number.isInteger(level) ? level : level.toFixed(2)}
        </text>
      )}
      {tangent && (
        <g>
          <line
            x1={p.px(a[0] - 0.34 * u[0])}
            y1={p.py(a[1] - 0.34 * u[1])}
            x2={p.px(a[0] + 0.34 * u[0])}
            y2={p.py(a[1] + 0.34 * u[1])}
            stroke={INK}
            strokeWidth="1.6"
            strokeDasharray="5 4"
          />
          <Arrow p={p} from={a} to={[a[0] + 0.24 * u[0], a[1] + 0.24 * u[1]]} color={INK} width={2.4} head={10} />
          {/* u's name beside its arrow, inside C, clear of ∇f(a) */}
          <text x={p.px(a[0] + 0.17 * u[0]) - 15 * out[0]} y={p.py(a[1] + 0.17 * u[1]) + 15 * out[1] + 6} textAnchor="middle" fontSize="18" fontFamily={MAIN} fill={INK} className="map-label">
            <B>u</B>
          </text>
        </g>
      )}
      <Arrow p={p} from={a} to={[a[0] + df[0], a[1] + df[1]]} color={RED} width={3.2} head={12} />
      <Arrow p={p} from={a} to={[a[0] + dg[0], a[1] + dg[1]]} color={PURPLE} width={3.2} head={11} />
      <TipLabel p={p} a={a} v={df} ahead={beside ? 0 : 30} side={beside ? 24 : 0} color={RED}>
        ∇<I>f</I>(<B>a</B>)
      </TipLabel>
      <TipLabel p={p} a={a} v={dg} ahead={beside ? 0 : 30} side={beside ? -24 : 0} color={PURPLE}>
        ∇<I>g</I>(<B>a</B>)
      </TipLabel>
      <NamedPoint p={p} at={a} />
      <text x={p.px(a[0]) - 17 * out[0]} y={p.py(a[1]) + 17 * out[1] + 6} textAnchor="middle" fontSize="19" fontFamily={MAIN} fill={INK} className="map-label">
        <B>a</B>
      </text>
    </g>
  );
}
