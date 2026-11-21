import Plane, { Dot } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import Space, { Dot3, PlanePatch } from './Space.jsx';
import Surface from './Surface.jsx';
import { I, MAIN } from './svgmath.jsx';
import { linear, quadratic } from './hessian.js';

// Lecture 11's colours: the graph blue, the linear approximation gold; the quadratic one red
const INK = '#14213d';
export const CURVE = '#0e7490';
export const LINE = '#d99a1e';
export const PLANE = '#f2c14e';
export const QUAD = '#b23a2a';
const QFILL = '#c8553d';
const GRAY = '#6b7280';

// one variable: g(x) = 1.5 + sin(x − 1) at a = 1.8 (the slides write its formula)
const g = (x) => 1.5 + Math.sin(x - 1);
const g1 = (x) => Math.cos(x - 1);
const g2 = (x) => -Math.sin(x - 1);
const GA = 1.8;
const LR = GA + 1.05; // the tangent line's right end, and its label
const gLin = (x) => g(GA) + g1(GA) * (x - GA);
const gQuad = (x) => gLin(x) + 0.5 * g2(GA) * (x - GA) ** 2;
const GX = [-0.3, 6.3];
const GY = [-0.3, 3.1];

const path = (p, fn, [x0, x1], n = 90) =>
  Array.from({ length: n + 1 }, (_, k) => x0 + ((x1 - x0) * k) / n)
    .map((x, k) => `${k ? 'L' : 'M'}${p.px(x).toFixed(1)},${p.py(fn(x)).toFixed(1)}`)
    .join(' ');

/**
 * The graph of a function of one variable, its tangent line at (a, f(a)) (gold, Lecture 11's
 * Linear approximation) and, with `quad`, its quadratic approximation there, a parabola (red).
 * With `steps` ({ a, line, quad }, key presses), the graph alone, then a and (a, f(a)) on key press
 * steps.a, the tangent line on steps.line and the parabola on steps.quad, the line faint from then on.
 */
export function QuadLineFigure({ quad = false, steps = null, unit = 58 }) {
  const lineLayer = (el) =>
    steps ? (
      <Fragment as="g" index={steps.line}>
        <Fragment as="g" index={steps.quad} effect="semi-fade-out">
          {el}
        </Fragment>
      </Fragment>
    ) : (
      el
    );
  const quadLayer = (el) => (steps ? <Fragment as="g" index={steps.quad}>{el}</Fragment> : quad && el);
  const aLayer = (el) => (steps?.a != null ? <Fragment as="g" index={steps.a}>{el}</Fragment> : el);
  return (
    <Plane
      xRange={GX}
      yRange={GY}
      unit={unit}
      pad={18}
      xTicks={[]}
      yTicks={[]}
      grid={false}
      axisLabels={['x', 'y']}
      title={steps ? 'The graph of f; its tangent line at (a, f(a)); its quadratic approximation there, a parabola that hugs the graph' : quad ? 'The graph of f, its tangent line at (a, f(a)) and its quadratic approximation there, a parabola that hugs the graph' : 'The graph of f and its tangent line at (a, f(a))'}
    >
      {(p) => (
        <g>
          <path d={path(p, g, [GX[0] + 0.1, GX[1] - 0.1])} fill="none" stroke={CURVE} strokeWidth="3.5" strokeLinecap="round" />
          {lineLayer(<path d={path(p, gLin, [GA - 1.6, LR], 2)} fill="none" stroke={LINE} strokeWidth="3.2" strokeLinecap="round" opacity={quad ? 0.65 : 1} />)}
          {quadLayer(<path d={path(p, gQuad, [GA - 1.45, GA + 1.6])} fill="none" stroke={QUAD} strokeWidth="3.2" strokeLinecap="round" />)}
          {aLayer(
            <g>
              <line x1={p.px(GA)} y1={p.py(0)} x2={p.px(GA)} y2={p.py(g(GA))} stroke={GRAY} strokeWidth="1.8" strokeDasharray="0.1 6" strokeLinecap="round" />
              <Dot p={p} at={[GA, 0]} color={INK} r={4.5} />
              <text x={p.px(GA)} y={p.py(0) + 24} textAnchor="middle" fontSize="19" fontFamily={MAIN} fill={INK}>
                <I>a</I>
              </text>
              <Dot p={p} at={[GA, g(GA)]} color={INK} r={6} stroke="#fff" strokeWidth="1.5" />
            </g>,
          )}
          <text x={p.px(6.2)} y={p.py(1)} textAnchor="end" fontSize="19" fontFamily={MAIN} fill={CURVE}>
            <I>y</I> = <I>f</I>(<I>x</I>)
          </text>
          {lineLayer(
            <text x={p.px(LR)} y={p.py(gLin(LR)) + 4} textAnchor="start" fontSize="18" fontFamily={MAIN} fill={LINE} opacity={quad ? 0.85 : 1} dx="12">
              linear
            </text>,
          )}
          {quadLayer(
            <text x={p.px(GA - 0.68)} y={p.py(0.28)} textAnchor="middle" fontSize="18" fontFamily={MAIN} fill={QUAD}>
              quadratic
            </text>,
          )}
        </g>
      )}
    </Plane>
  );
}

// two variables: a smooth single hill z = f(x, y), with a = (a₁, a₂) on its upper-left slope, so its
// tangent plane (gold, linear) lifts flat above the crest while its quadratic approximation (red
// paraboloid, quadratic) curves over the dome to hug the hill — the 3-D counterpart of QuadLineFigure
const ramp = (t) => 0.32 * Math.log1p(Math.exp(t / 0.32));
const A = [0.42, -0.28];
const hill = (x, y) =>
  ramp(
    1.95 -
      0.52 * ((x + 0.16) ** 2 + 0.82 * (y - 0.26) ** 2) +
      0.12 * (x + 0.16) * (y - 0.26) -
      0.26 * ((x - A[0]) ** 2 + (y - A[1]) ** 2) ** 2 -
      0.08,
  );
const R = [-1.7, 1.7];
const Z = 0.96;
const FLOOR = -0.26;
const LIN = linear(hill, A);
const QUADF = quadratic(hill, A);
const PX = [A[0] - 0.72, A[0] + 0.52];
const PY = [A[1] - 0.54, A[1] + 0.74];
const Z_TOP = Z * 1.95;

const LIGHT = (() => {
  const l = [0.45, -0.35, 0.82];
  const n = Math.hypot(...l);
  return l.map((x) => x / n);
})();

const shade = (hex, k) => {
  const c = [1, 3, 5].map((m) => parseInt(hex.slice(m, m + 2), 16));
  return `rgb(${c.map((v) => Math.round(Math.min(255, v * k))).join(',')})`;
};

const HALO = {
  paintOrder: 'stroke',
  stroke: 'rgba(251, 251, 249, 0.9)',
  strokeWidth: 4,
  strokeLinejoin: 'round',
};

/**
 * A 3-D Lambert-shaded patch z = fn(x, y) over [x0, x1] × [y0, y1], sorted back-to-front cell by cell,
 * with ruling grid lines and a crisp outer border, fading to `ghost` where the hill occludes it.
 */
function ShadedPatch({ s, fn, x: [x0, x1], y: [y0, y1], cells = 14, step = 2, color, opacity = 0.82, ghost = 0.22, gridStroke, rimStroke, rimWidth = 1.5 }) {
  const V = [s.depth([1, 0, 0]), s.depth([0, 1, 0]), s.depth([0, 0, 1])];
  const dt = 0.06 / (Math.hypot(V[0], V[1]) || 1);
  const hidden = ([px, py, pz]) => {
    const exit = (p, d, a, b) => (d > 0 ? (b - p) / d : d < 0 ? (a - p) / d : Infinity);
    let end = Math.min(exit(px, V[0], R[0], R[1]), exit(py, V[1], R[0], R[1]), V[2] > 0 ? (Z_TOP - pz) / V[2] : Infinity);
    if (!Number.isFinite(end) || end <= 0) return false;
    const g0 = Z * hill(px, py);
    let hi = g0 - pz;
    let lo = g0 - pz;
    for (let t = dt; t < end + dt; t += dt) {
      const ux = px + t * V[0];
      const uy = py + t * V[1];
      if (ux < R[0] || ux > R[1] || uy < R[0] || uy > R[1]) break;
      const gz = Z * hill(ux, uy);
      hi = Math.max(hi, gz - (pz + t * V[2]));
      lo = Math.min(lo, gz - (pz + t * V[2]));
    }
    return Math.min(hi, -lo) > 2e-3;
  };

  const at3 = (i, j) => {
    const u = x0 + ((x1 - x0) * i) / cells;
    const v = y0 + ((y1 - y0) * j) / cells;
    return [u, v, Z * fn(u, v)];
  };
  const xy = (q) => s.P(q).map((v) => v.toFixed(1)).join(',');

  const quads = [];
  for (let j = 0; j < cells; j += 1) {
    for (let i = 0; i < cells; i += 1) {
      const c = [at3(i, j), at3(i + 1, j), at3(i + 1, j + 1), at3(i, j + 1)];
      const mid = c.reduce((m, q) => m.map((v, k) => v + q[k] / 4), [0, 0, 0]);
      const u = c[2].map((v, k) => v - c[0][k]);
      const w = c[3].map((v, k) => v - c[1][k]);
      const nrm = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const len = Math.hypot(...nrm) || 1;
      const lambert = Math.max(0, (nrm[0] * LIGHT[0] + nrm[1] * LIGHT[1] + nrm[2] * LIGHT[2]) / len);
      const fill = shade(color, 0.66 + 0.36 * lambert);
      const occ = hidden(mid);
      quads.push({
        depth: s.depth(mid),
        el: (
          <polygon
            key={`${i},${j}`}
            points={c.map(xy).join(' ')}
            fill={fill}
            fillOpacity={occ ? ghost : opacity}
            stroke={fill}
            strokeOpacity={occ ? ghost : opacity}
            strokeWidth="0.45"
            strokeLinejoin="round"
          />
        ),
      });
    }
  }
  quads.sort((a, b) => a.depth - b.depth);

  let grid = '';
  for (let L = step; L < cells; L += step) {
    for (let q = 0; q < cells; q += 1) {
      const a1 = at3(L, q);
      const b1 = at3(L, q + 1);
      if (!hidden(a1) || !hidden(b1)) grid += `M${xy(a1)}L${xy(b1)}`;
      const a2 = at3(q, L);
      const b2 = at3(q + 1, L);
      if (!hidden(a2) || !hidden(b2)) grid += `M${xy(a2)}L${xy(b2)}`;
    }
  }

  const borderPts = [
    ...Array.from({ length: cells }, (_, k) => at3(k, 0)),
    ...Array.from({ length: cells }, (_, k) => at3(cells, k)),
    ...Array.from({ length: cells }, (_, k) => at3(cells - k, cells)),
    ...Array.from({ length: cells + 1 }, (_, k) => at3(0, cells - k)),
  ];
  let rim = '';
  for (let k = 0; k + 1 < borderPts.length; k += 1) {
    if (!hidden(borderPts[k]) || !hidden(borderPts[k + 1])) rim += `M${xy(borderPts[k])}L${xy(borderPts[k + 1])}`;
  }

  return (
    <g>
      {quads.map((q) => q.el)}
      {gridStroke && <path d={grid} fill="none" stroke={gridStroke} strokeWidth="0.7" strokeLinecap="round" />}
      {rimStroke && <path d={rim} fill="none" stroke={rimStroke} strokeWidth={rimWidth} strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
}

/**
 * The graph of a smooth hill z = f(x, y) with, at a point on its slope, its tangent plane (gold,
 * linear) and, with `quad` or `steps.quad`, its quadratic approximation (red paraboloid, quadratic),
 * which curves over the dome to hug the graph while the flat tangent plane fades back above it.
 */
export function QuadSurfaceFigure({ quad = false, steps = null, width = 435, height = 325 }) {
  const qIdx = steps?.quad;
  return (
    <Space
      width={width}
      height={height}
      unit={70}
      center={[0.45, 0.67]}
      axes={false}
      az={-24}
      el={26}
      swing={8}
      title={
        qIdx != null || quad
          ? 'The graph of a smooth hill, its tangent plane at a point on its slope, and its quadratic approximation there, a curved paraboloid that hugs the hill'
          : 'The graph of a smooth hill and its tangent plane at a point on its slope'
      }
    >
      {(s) => {
        const [lx, ly] = s.P([PX[0], PY[1], Z * LIN(PX[0], PY[1])]); // highest lifted corner of the tangent plane
        const [qx, qy] = s.P([PX[1], PY[0], Z * QUADF(PX[1], PY[0])]); // lower-left corner of the paraboloid
        const [fx, fy] = s.P([-0.55, R[1], Z * hill(-0.55, R[1])]); // right edge of the hill's skirt

        const fullPlane = (
          <ShadedPatch
            s={s}
            fn={LIN}
            x={PX}
            y={PY}
            color={PLANE}
            opacity={0.8}
            ghost={0.22}
            gridStroke="rgba(140, 95, 12, 0.28)"
            rimStroke="rgba(180, 122, 16, 0.85)"
            rimWidth={1.5}
          />
        );
        const faintPlane = (
          <ShadedPatch
            s={s}
            fn={LIN}
            x={PX}
            y={PY}
            color={PLANE}
            opacity={0.18}
            ghost={0.08}
            gridStroke="rgba(160, 110, 15, 0.22)"
            rimStroke="rgba(195, 138, 22, 0.55)"
            rimWidth={1.2}
          />
        );
        const quadCap = (
          <ShadedPatch
            s={s}
            fn={QUADF}
            x={PX}
            y={PY}
            color={QFILL}
            opacity={0.86}
            ghost={0.28}
            gridStroke="rgba(95, 18, 10, 0.28)"
            rimStroke="rgba(145, 34, 22, 0.9)"
            rimWidth={1.6}
          />
        );
        const linLabel = (op = 1) => (
          <text x={lx + 8} y={ly + 5} textAnchor="start" fontSize="18" fontFamily={MAIN} fill={LINE} opacity={op} {...HALO}>
            linear
          </text>
        );
        const quadLabel = (
          <text x={qx - 10} y={qy + 2} textAnchor="end" fontSize="18" fontFamily={MAIN} fill={QUAD} {...HALO}>
            quadratic
          </text>
        );

        return (
          <g>
            <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
            <Surface s={s} f={hill} x={R} y={R} n={32} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
            {qIdx != null ? (
              <>
                <Fragment as="g" index={qIdx} effect="fade-out">
                  {fullPlane}
                  {linLabel(1)}
                </Fragment>
                <Fragment as="g" index={qIdx}>
                  {quadCap}
                  {faintPlane}
                  {linLabel(0.75)}
                  {quadLabel}
                </Fragment>
              </>
            ) : quad ? (
              <>
                {quadCap}
                {faintPlane}
                {linLabel(0.75)}
                {quadLabel}
              </>
            ) : (
              <>
                {fullPlane}
                {linLabel(1)}
              </>
            )}
            <Dot3 s={s} at={[...A, Z * hill(...A)]} color={INK} r={5.5} stroke="#fff" strokeWidth="1.5" />
            <text x={fx + 8} y={fy - 10} textAnchor="start" fontSize="18" fontFamily={MAIN} fill={CURVE} {...HALO}>
              <I>z</I> = <I>f</I>(<I>x</I>, <I>y</I>)
            </text>
          </g>
        );
      }}
    </Space>
  );
}
