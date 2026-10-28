import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { F, S } from '../components/FPanel.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, AMBER, apply, lerpM, I2, pts } from '../components/la.js';

// Example 1 (i): A = diag(2, 1); B drawn with columns b₁ = (a, c) = (1, 0.5), b₂ = (b, d) = (−0.4, 0.9)
export const A = [
  [2, 0],
  [0, 1],
];
export const B = [
  [1, -0.4],
  [0.5, 0.9],
];
export const mul = (M, N) => M.map((row) => [0, 1].map((j) => row[0] * N[0][j] + row[1] * N[1][j]));
export const XR = [-1.3, 2.7];
export const YR = [-0.7, 2.3];
export const GRID = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
export const col = (tex) => r`\begin{bmatrix}${tex}\end{bmatrix}`;

// T_A ∘ T_B (first B, then A) and T_B ∘ T_A (first A, then B): where e₁ and e₂ are at each rest
export const PARTS = [
  {
    key: 'AB',
    first: B,
    second: A,
    maps: ['T_B', 'T_A'],
    labels: [
      [r`\vv e_1`, r`\vv e_2`],
      [col(r`a\\ c`), col(r`b\\ d`)],
      [col(r`2a\\ c`), col(r`2b\\ d`)],
    ],
    product: [
      ['2a', '2b'],
      ['c', 'd'],
    ],
  },
  {
    key: 'BA',
    first: A,
    second: B,
    maps: ['T_A', 'T_B'],
    labels: [
      [r`\vv e_1`, r`\vv e_2`],
      [r`2\vv e_1`, r`\vv e_2`],
      [col(r`2a\\ 2c`), col(r`b\\ d`)],
    ],
    product: [
      ['2a', 'b'],
      ['2c', 'd'],
    ],
  },
];

/**
 * The unit square, F, e₁ (blue) and e₂ (amber) under lerp(I, second, t2) · lerp(I, first, t1), with
 * the grid moved along; the labels of e₁, e₂'s images while they rest (`rest`: 0, 1, 2 maps done).
 */
export function MapPanel({ id, M, labels, rest }) {
  const cols = [apply(M, [1, 0]), apply(M, [0, 1])];
  return (
    <Plane xRange={XR} yRange={YR} unit={86} pad={8} grid={false} axes={false} title="The unit square, the letter F, e1 and e2 under the two maps in turn">
      {(p) => (
        <g>
          <defs>
            <clipPath id={`l15-ex1-clip-${id}`}>
              <rect x={0} y={0} width={p.W} height={p.H} rx={10} />
            </clipPath>
          </defs>
          <rect x={0} y={0} width={p.W} height={p.H} rx={10} fill="#fff" stroke="#e5e7eb" strokeWidth="1.2" />
          <g clipPath={`url(#l15-ex1-clip-${id})`}>
            <g stroke="#e8ebf0" strokeWidth="1">
              {GRID.map((k) => (
                <g key={k}>
                  <line x1={p.px(apply(M, [k, -6])[0])} y1={p.py(apply(M, [k, -6])[1])} x2={p.px(apply(M, [k, 6])[0])} y2={p.py(apply(M, [k, 6])[1])} />
                  <line x1={p.px(apply(M, [-6, k])[0])} y1={p.py(apply(M, [-6, k])[1])} x2={p.px(apply(M, [6, k])[0])} y2={p.py(apply(M, [6, k])[1])} />
                </g>
              ))}
            </g>
            <g stroke="#c4c9d1" strokeWidth="1.3">
              <line x1={p.px(XR[0])} y1={p.py(0)} x2={p.px(XR[1])} y2={p.py(0)} />
              <line x1={p.px(0)} y1={p.py(YR[0])} x2={p.px(0)} y2={p.py(YR[1])} />
            </g>
          </g>
          <polygon points={pts(p, S.map((q) => apply(M, q)))} fill="rgba(242, 179, 122, 0.45)" stroke="#c2702a" strokeWidth="1.8" strokeLinejoin="round" />
          <polygon points={pts(p, F.map((q) => apply(M, q)))} fill={RED} stroke={RED} strokeWidth="1.2" strokeLinejoin="round" />
          {cols.map((v, k) => (
            <Arrow key={k} p={p} to={v} color={k === 0 ? BLUE : AMBER} width={3.2} head={13} />
          ))}
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
          {cols.map((v, k) => {
            // the label beyond the tip, along the arrow
            const [x, y] = [p.px(v[0]), p.py(v[1])];
            const len = Math.hypot(x - p.px(0), y - p.py(0)) || 1;
            const [ux, uy] = [(x - p.px(0)) / len, (y - p.py(0)) / len];
            return (
              <g key={k} className="l15-ex1-label" opacity={rest == null ? 0 : 1}>
                <TexSvg x={x + ux * 38} y={y + uy * 34} tex={labels[rest ?? 0][k]} size={23} color={k === 0 ? BLUE : AMBER} w={100} h={80} />
              </g>
            );
          })}
        </g>
      )}
    </Plane>
  );
}

/** One composite on key press `index`: the first map, a pause, the second, then the product's matrix. */
export function Part({ part, index }) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const tween1 = useTween(on, { ms: 1500, delay: 900 });
  const tween2 = useTween(on, { ms: 1500, delay: 3600 });
  const [t1, t2] = PRINT ? [1, 1] : [tween1, tween2];
  const M = mul(lerpM(I2, part.second, t2), lerpM(I2, part.first, t1));
  const rest = t2 >= 1 ? 2 : t2 > 0 ? null : t1 >= 1 ? 1 : t1 > 0 ? null : 0;
  // the map now moving (or last moved) in red: the first is on the right of ∘
  const stage = t2 > 0 ? 1 : t1 > 0 ? 0 : -1;
  const map = (k) => (stage === k ? r`\textcolor{${RED}}{${part.maps[k]}}` : part.maps[k]);
  const entries = part.product.map((row) => r`\textcolor{${BLUE}}{${row[0]}}&\textcolor{${AMBER}}{${row[1]}}`).join(r`\\ `);
  return (
    <Fragment index={index} className="l15-ex1-part">
      <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <Tex tex={`${map(1)}\\circ ${map(0)}`} className="l15-ex1-head" />
      <MapPanel id={part.key} M={M} labels={part.labels} rest={rest} />
      <div className="l15-ex1-label" style={{ opacity: rest === 2 ? 1 : 0 }}>
        <Tex tex={r`${part.key}=\begin{bmatrix}${entries}\end{bmatrix}`} />
      </div>
    </Fragment>
  );
}

/**
 * Example 2 (i) (first Example 1 (i), until Caution 1 had a board example; its (ii) before the user cut (i) and (iii)), both ways, as linear transformations
 * (after the board): A = diag(2, 1) and a B drawn with columns (a, c), (b, d). Key press 1: T_A ∘ T_B,
 * the unit square, F, e₁ and e₂ moved by T_B (to the columns of B), then by T_A (each x₁ × 2: the
 * first row of B), and AB with its columns in their colours; 2: T_B ∘ T_A likewise, by T_A (e₁ to
 * 2e₁, e₂ staying), then by T_B (to 2b₁ and b₂: the first column of B), and BA.
 */
export default function Slide13cExample1Maps() {
  return (
    <section className="dense">
      <h2>Example 2 (i)</h2>

      <p className="l15-ex1-given">
        <Tex tex={r`A=\begin{bmatrix}2&0\\ 0&1\end{bmatrix}`} />, <Tex tex={r`B=\begin{bmatrix}a&b\\ c&d\end{bmatrix}`} />
      </p>
      <div className="l15-ex1-parts">
        {PARTS.map((part, k) => (
          <Part key={part.key} part={part} index={k + 1} />
        ))}
      </div>
    </section>
  );
}
