import Space, { PlanePatch, Dot3, Seg3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import { sample, levelSegments, segmentsPath, lineColor } from '../components/levels.js';
import { grad, hess, quadratic } from '../components/hessian.js';

// Two smooth hills along the diagonal u = (x + y)/√2, with a pass between them and a flat skirt around
// the edges so neither corner blocks the pass or the floor's contour plot:
// a high hill (1.92) on the right, a lower hill (1.28) on the left, and a saddle pass (~0.52) between them.
export const f = (x, y) => {
  const u = (x + y) * Math.SQRT1_2;
  const v = (x - y) * Math.SQRT1_2;
  const du1 = u - 1.08;
  const du2 = u + 1.14;
  const v2 = v * v;
  return (
    1.92 * Math.exp(-(0.62 * du1 * du1 + 0.72 * v2 + 0.54 * du1 ** 4 + 0.34 * du1 * du1 * v2 + 0.76 * v2 * v2)) +
    1.28 * Math.exp(-(0.8 * du2 * du2 + 0.78 * v2 + 0.4 * du2 ** 4 + 0.34 * du2 * du2 * v2 + 0.76 * v2 * v2))
  );
};

export const atUV = (u, v = 0) => [(u + v) * Math.SQRT1_2, (u - v) * Math.SQRT1_2];

export const findCritU = (u0) => {
  let u = u0;
  for (let k = 0; k < 25; k += 1) {
    const pt = atUV(u);
    const g = grad(f, pt);
    const H = hess(f, pt);
    u -= ((g[0] + g[1]) * Math.SQRT1_2) / (0.5 * (H[0][0] + 2 * H[0][1] + H[1][1]));
  }
  return u;
};

export const R = [-2.15, 2.15];
export const FLOOR = -1.92;
export const Z = 1.12;
export const Z_TOP = Z * 2.0;
export const RED = '#8c1515';
export const QFILL = '#c8553d';

export const U_TOP = findCritU(1.08);
export const U_PASS = findCritU(-0.15);
export const BIG_TOP = atUV(U_TOP);
export const PASS = atUV(U_PASS);
export const PASS_LEVEL = f(...PASS);
export const LEVELS = [0.3, PASS_LEVEL, 0.92, 1.22, 1.52, 1.8];
export const FLOOR_SEGS = (() => {
  const g = sample(f, R, R, 80, 80);
  return LEVELS.map((c) => ({ c, segs: levelSegments(g, c) }));
})();

export const TOP_Q = quadratic(f, BIG_TOP);
export const PASS_Q = quadratic(f, PASS);

export const LIGHT = (() => {
  const l = [0.45, -0.35, 0.82];
  const n = Math.hypot(...l);
  return l.map((x) => x / n);
})();

export const shade = (hex, k) => {
  const c = [1, 3, 5].map((m) => parseInt(hex.slice(m, m + 2), 16));
  return `rgb(${c.map((v) => Math.round(Math.min(255, v * k))).join(',')})`;
};

/**
 * A 3-D Lambert-shaded patch z = fn(x, y) parameterized along the ridge/pass principal axes (u, v),
 * clipped smoothly along the silhouette horizon where its far edge wraps behind the mountain.
 */
export function DiagPatch({ s, fn, u0, du, dv, cells = 8, sub = 3, color = QFILL, opacity = 0.86 }) {
  const M = cells * sub;
  const V = [s.depth([1, 0, 0]), s.depth([0, 1, 0]), s.depth([0, 0, 1])];
  const dt = 0.05 / (Math.hypot(V[0], V[1]) || 1);

  const P3 = (a, b) => {
    const u = u0 - du + (2 * du * a) / M;
    const v = -dv + (2 * dv * b) / M;
    const [x, y] = atUV(u, v);
    return [x, y, Z * fn(x, y)];
  };

  // Signed horizon height: > 0 where the mountain rises across the ray toward the viewer
  const occ = ([px, py, pz]) => {
    const exit = (p, d, lo, hi) => (d > 0 ? (hi - p) / d : d < 0 ? (lo - p) / d : Infinity);
    const end = Math.min(exit(px, V[0], R[0], R[1]), exit(py, V[1], R[0], R[1]), V[2] > 0 ? (Z_TOP - pz) / V[2] : Infinity);
    if (!Number.isFinite(end) || end <= dt) return -1;
    let hi = -Infinity;
    for (let t = dt; t < end; t += dt) {
      const ux = px + t * V[0];
      const uy = py + t * V[1];
      if (ux < R[0] || ux > R[1] || uy < R[0] || uy > R[1]) break;
      hi = Math.max(hi, Z * f(ux, uy) - (pz + t * V[2]));
    }
    return hi - 2e-3;
  };

  const pts = [];
  const h = [];
  for (let b = 0; b <= M; b += 1) {
    const prow = [];
    const hrow = [];
    for (let a = 0; a <= M; a += 1) {
      const p = P3(a, b);
      prow.push(p);
      hrow.push(occ(p));
    }
    pts.push(prow);
    h.push(hrow);
  }

  const lerp3 = (A, B, ha, hb) => {
    const t = ha / (ha - hb);
    return [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1]), A[2] + t * (B[2] - A[2])];
  };
  const xy = (q) => s.P(q).map((v) => v.toFixed(1)).join(',');

  const quads = [];
  for (let b = 0; b < M; b += 1) {
    for (let a = 0; a < M; a += 1) {
      const cell = [
        [pts[b][a], h[b][a]],
        [pts[b][a + 1], h[b][a + 1]],
        [pts[b + 1][a + 1], h[b + 1][a + 1]],
        [pts[b + 1][a], h[b + 1][a]],
      ];
      const vis = [];
      for (let k = 0; k < 4; k += 1) {
        const [pa, ha] = cell[k];
        const [pb, hb] = cell[(k + 1) % 4];
        if (ha <= 0) vis.push(pa);
        if (ha <= 0 !== hb <= 0) vis.push(lerp3(pa, pb, ha, hb));
      }
      if (vis.length < 3) continue;
      const [p0, p1, p2, p3] = cell.map(([p]) => p);
      const u = p2.map((v, k) => v - p0[k]);
      const w = p3.map((v, k) => v - p1[k]);
      const nrm = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const len = Math.hypot(...nrm) || 1;
      const lambert = Math.max(0, Math.abs(nrm[0] * LIGHT[0] + nrm[1] * LIGHT[1] + nrm[2] * LIGHT[2]) / len);
      const fill = shade(color, 0.62 + 0.38 * lambert);
      const mid = vis.reduce((m, q) => m.map((v, k) => v + v * 0 + q[k] / vis.length), [0, 0, 0]);
      quads.push({
        depth: s.depth(mid),
        el: (
          <polygon
            key={`${a},${b}`}
            points={vis.map(xy).join(' ')}
            fill={fill}
            fillOpacity={opacity}
            stroke={fill}
            strokeOpacity={opacity}
            strokeWidth="0.45"
            strokeLinejoin="round"
          />
        ),
      });
    }
  }
  quads.sort((A, B) => A.depth - B.depth);

  const clipSeg = (pa, ha, pb, hb) => {
    if (ha > 0 && hb > 0) return '';
    const q0 = ha > 0 ? lerp3(pa, pb, ha, hb) : pa;
    const q1 = hb > 0 ? lerp3(pa, pb, ha, hb) : pb;
    return `M${xy(q0)}L${xy(q1)}`;
  };

  let grid = '';
  for (let L = sub; L < M; L += sub) {
    for (let q = 0; q < M; q += 1) {
      grid += clipSeg(pts[q][L], h[q][L], pts[q + 1][L], h[q + 1][L]);
      grid += clipSeg(pts[L][q], h[L][q], pts[L][q + 1], h[L][q + 1]);
    }
  }

  let rim = '';
  for (let q = 0; q < M; q += 1) {
    rim += clipSeg(pts[0][q], h[0][q], pts[0][q + 1], h[0][q + 1]);
    rim += clipSeg(pts[M][q], h[M][q], pts[M][q + 1], h[M][q + 1]);
    rim += clipSeg(pts[q][0], h[q][0], pts[q + 1][0], h[q + 1][0]);
    rim += clipSeg(pts[q][M], h[q][M], pts[q + 1][M], h[q + 1][M]);
  }

  return (
    <g>
      {quads.map((q) => q.el)}
      <path d={grid} fill="none" stroke="rgba(95, 18, 10, 0.28)" strokeWidth="0.7" strokeLinecap="round" />
      <path d={rim} fill="none" stroke="rgba(140, 28, 18, 0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * The graph of two hills, its contour plot on the floor (nested ovals around the hills and a
 * figure-eight curve through the pass), and the 3-D shaded quadratic approximations at two critical
 * points, in red: a dome at the top of the big hill (a local maximum) and a saddle at the pass.
 */
export function CoverFigure() {
  return (
    <Space
      width={500}
      height={420}
      unit={67}
      center={[0.5, 0.41]}
      axes={false}
      az={33}
      el={25}
      swing={8}
      title="The graph of a function with two hills and its contour plot on the floor; at the top of the big hill and at the pass, its quadratic approximations, a dome and a saddle"
    >
      {(s) => {
        const onFloor = ([a, b]) => s.P([a, b, FLOOR]);
        return (
          <g>
            <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
            <g fill="none" strokeLinecap="round">
              {FLOOR_SEGS.map(({ c, segs }) => (
                <path
                  key={c}
                  d={segmentsPath(segs, onFloor)}
                  stroke={lineColor(c / 1.92)}
                  strokeWidth={c === PASS_LEVEL ? 1.55 : 1.3}
                />
              ))}
            </g>
            <Surface
              s={s}
              f={f}
              x={R}
              y={R}
              n={38}
              zScale={Z}
              mesh="rgba(15, 40, 50, 0.16)"
              under={
                <g>
                  <Seg3 s={s} from={[...BIG_TOP, FLOOR]} to={[...BIG_TOP, Z * f(...BIG_TOP)]} color="#6b7280" width={1.2} dashed />
                  <Seg3 s={s} from={[...PASS, FLOOR]} to={[...PASS, Z * f(...PASS)]} color="#6b7280" width={1.2} dashed />
                  <Dot3 s={s} at={[...BIG_TOP, FLOOR]} color={RED} r={4} stroke="#fff" strokeWidth="1.2" />
                  <Dot3 s={s} at={[...PASS, FLOOR]} color={RED} r={4} stroke="#fff" strokeWidth="1.2" />
                </g>
              }
            />
            <DiagPatch s={s} fn={PASS_Q} u0={U_PASS} du={0.4} dv={0.54} />
            <DiagPatch s={s} fn={TOP_Q} u0={U_TOP} du={0.54} dv={0.54} />
            <Dot3 s={s} at={[...PASS, Z * f(...PASS)]} color={RED} r={5.5} stroke="#fff" strokeWidth="1.5" />
            <Dot3 s={s} at={[...BIG_TOP, Z * f(...BIG_TOP)]} color={RED} r={5.5} stroke="#fff" strokeWidth="1.5" />
          </g>
        );
      }}
    </Space>
  );
}

export default function Slide01Title() {
  return (
    <section className="title-slide">
      <div className="title-fig">
        <CoverFigure />
      </div>
      <div>
        <p className="eyebrow">Math 51 · 20 November 2026</p>
        <h1>The Hessian, quadratic approximation, and the second&nbsp;derivative&nbsp;test</h1>
        <p className="reference">Textbook Chapters 25–26 – The Hessian and quadratic approximation; application of the Hessian to local extrema</p>
      </div>
    </section>
  );
}
