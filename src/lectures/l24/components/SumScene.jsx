import Plane, { Arrow } from './Plane.jsx';
import { TipLabel } from './SumPicture.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { r } from './Tex.jsx';
import { INK, BLUE, AMBER, PURPLE, GRAY, apply, pts, times } from './eig.js';

// Sums of eigenvectors (once on Eigenspace; now the Poll after Eigenspace,
// Slide10cPollSums): two eigenvectors v, w and v + w under a T that multiplies v by kv and w by kw

const V = [1.2, 0.3];
const W = [0.3, 1.0];
const plus = (a, b) => [a[0] + b[0], a[1] + b[1]];
const XR = [-0.3, 3.45];
const YR = [-0.4, 3.05];
const UNIT = 124;
// a label's TeX for k times a vector named n: n, 2n
const k = (c, n) => (c === 1 ? n : `${c}${n}`);
// T on its way, from I (t = 0) to the T that multiplies v by kv and w by kw (t = 1): v times
// 1 + t(kv − 1), w times 1 + t(kw − 1). In the basis v, w: M = a v r₁ + b w r₂, with r₁, r₂ the rows
// of [v w]⁻¹ (Example 1's way)
const DET = V[0] * W[1] - W[0] * V[1];
const R = [
  [W[1] / DET, -W[0] / DET],
  [-V[1] / DET, V[0] / DET],
];
const along = (kv, kw, t) => {
  const a = 1 + t * (kv - 1);
  const b = 1 + t * (kw - 1);
  return [0, 1].map((i) => [0, 1].map((j) => a * V[i] * R[0][j] + b * W[i] * R[1][j]));
};

/**
 * T on its way (`t`), T multiplying v by `kv` and w by `kw` (2 and 2: T = 2I; 1 and 2: w's line
 * stretches, v's stays put): the grid, the unit square and F moved by T (gray: where they start),
 * Example 1's look (the user's request: first, how T acts on the F card). `arrows`: also v (amber),
 * w (purple) and v + w (ink), moved by T, the parallelogram's other two sides thin and gray, and the
 * line of v + w (gray, dotted), as few colours and lines as can be (the user), the square and F faded
 * back; the labels read the products (2v, 2w, 2(v + w); v, 2w, v + 2w) once the move is over.
 * `sum` false: v and w only, no v + w, its line or the parallelogram's other sides; a number between
 * 0 and 1: their opacity, as they fade in. `unit`: px per unit.
 */
export function Scene({ kv, kw, t, arrows, sum = true, unit = UNIT }) {
  const so = sum === true ? 1 : Number(sum) || 0;
  const M = along(kv, kw, t);
  const a = apply(M, V);
  const b = apply(M, W);
  const s = plus(a, b);
  const line = times(9, plus(V, W));
  const done = t > 0.999;
  const ends = done ? [k(kv, r`\vv v`), k(kw, r`\vv w`), kv === kw ? `${kv === 1 ? '' : kv}(\\vv v+\\vv w)` : `${k(kv, r`\vv v`)}+${k(kw, r`\vv w`)}`] : [r`\vv v`, r`\vv w`, r`\vv v+\vv w`];
  const what = `the map that multiplies v by ${kv} and w by ${kw}`;
  return (
    <Plane xRange={XR} yRange={YR} unit={unit} pad={8} grid={false} axes={false} title={arrows ? (so > 0 ? `The grid, the unit square, F, v, w and v + w under ${what}, and the line of v + w` : `The grid, the unit square, F, v and w under ${what}`) : `The grid, the unit square and F under ${what}`}>
      {(p) => (
        <g>
          <g opacity={arrows ? 0.5 : 1}>
            <GridImage p={p} M={M} />
            <FImage p={p} home />
            <FImage p={p} M={M} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />
          </g>
          {arrows && (
            <g>
              {so > 0 && (
                <g opacity={so}>
                  <polyline points={pts(p, [times(-1, line), line])} stroke="#6b7280" strokeWidth="2" strokeDasharray="0.1 7" strokeLinecap="round" fill="none" />
                  <polyline points={pts(p, [a, s, b])} stroke={GRAY} strokeWidth="1.4" fill="none" />
                </g>
              )}
              <Arrow p={p} to={a} color={AMBER} width={3.4} head={13} />
              <Arrow p={p} to={b} color={PURPLE} width={3.4} head={13} />
              {so > 0 && (
                <g opacity={so}>
                  <Arrow p={p} to={s} color={INK} width={3.4} head={13} />
                </g>
              )}
            </g>
          )}
          <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
          {arrows && (
            <g className="l15-sum-labels">
              <TipLabel p={p} v={a} tex={ends[0]} color={AMBER} size={22} gap={20} dy={6} />
              <TipLabel p={p} v={b} tex={ends[1]} color={PURPLE} size={22} gap={18} dx={-6} />
              {so > 0 && (
                <g opacity={so}>
                  <TipLabel p={p} v={s} tex={ends[2]} color={INK} size={22} gap={0} dx={-14} dy={-24} />
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </Plane>
  );
}
