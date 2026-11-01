import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import { FImage, GridImage } from '../components/FShape.jsx';
import { StripStep, COLUMNS, UNIT, XR, YR } from '../components/InverseStrip.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, AMBER, apply, lerpM, I2 } from '../components/inv.js';

// the projection onto the x-axis of Linear transformation: Invertible or not?, A = [1 0; 0 0]
export const A = [
  [1, 0],
  [0, 0],
];
// the zero matrix (the user's request)
export const ZERO = [
  [0, 0],
  [0, 0],
];
// two points, left of F, that land on the same point: (−0.8, 0) under A, the origin under 0
export const POINTS = [
  [-0.8, 1.15],
  [-0.8, 0.5],
];

/** A panel in the style of InverseStrip: the grid, F's home (gray; not if `!home`), and what `children(p)` draws. */
export function Panel({ title, home = true, children }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={UNIT} pad={6} grid={false} axes={false} title={title}>
      {(p) => (
        <g>
          <GridImage p={p} n={3} />
          {home && <FImage p={p} home />}
          {children && children(p)}
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Plane>
  );
}

/** The two points (blue, amber) at home, faint, joined by a dashed line. */
export function Points({ p, opacity }) {
  return (
    <g opacity={opacity}>
      <line x1={p.px(POINTS[0][0])} y1={p.py(POINTS[0][1])} x2={p.px(POINTS[1][0])} y2={p.py(POINTS[1][1])} stroke={INK} strokeWidth="1.4" strokeDasharray="5 5" />
      <Dot p={p} at={POINTS[0]} color={BLUE} r={5} />
      <Dot p={p} at={POINTS[1]} color={AMBER} r={5} />
    </g>
  );
}

/**
 * One example on a card, tagged with its name: key press `at`, the card, T_A taking F to AF (blue),
 * gliding, the two points (blue, amber) landing on the same point (ringed, red); at + 1: T_B, dashed,
 * "?", to a panel with a large "?" by the two points, faint, and no F: which of the two should it go
 * back to?; at + 2: the matrix A; at + 3: "no such B" (red) under T_B. Print: as it ends up.
 */
export function Example({ tag, A, matrix, at, className = '' }) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const tw = useTween(on, { ms: 1500, delay: 500 });
  const t = PRINT ? 1 : tw;
  const M = lerpM(I2, A, t);
  const [a, b] = POINTS.map((q) => apply(M, q));
  return (
    <>
      <span ref={ref} className="fragment fx-marker" data-fragment-index={at} aria-hidden="true" />
      <Fragment index={at} className={`l18-istrip l18-istrip-card l18-shear-card ${className}`}>
        <span className="l18-istrip-tag">{tag}</span>
        <div className="l18-istrip-row" style={{ gridTemplateColumns: COLUMNS.map((w) => `${w}px`).join(' ') }}>
          <Panel title="F">{(p) => <Points p={p} opacity={1} />}</Panel>
          <StripStep color={BLUE} name={<Tex tex="T_A" />} matrix={<Tex tex={matrix} />} matrixAt={at + 2} />
          <Panel title="AF">
            {(p) => (
              <g>
                <Points p={p} opacity={0.4 * t} />
                <FImage p={p} M={M} color={BLUE} opacity={0.9} />
                <Dot p={p} at={a} color={BLUE} r={6} />
                <Dot p={p} at={b} color={AMBER} r={t > 0.98 ? 4 : 6} />
                {t > 0.98 && <circle cx={p.px(a[0])} cy={p.py(a[1])} r={11} fill="none" stroke={RED} strokeWidth="2.4" />}
              </g>
            )}
          </Panel>
          <Fragment index={at + 1} className="l18-istep" style={{ color: AMBER }}>
            <span className="l18-istep-name">
              <Tex tex="T_B" /> ?
            </span>
            <svg width="130" height="22" viewBox="0 0 130 22" aria-hidden="true">
              <line x1="4" y1="11" x2="114" y2="11" stroke={AMBER} strokeWidth="3" strokeLinecap="round" strokeDasharray="8 7" />
              <polygon points="126,11 112,4 112,18" fill={AMBER} />
            </svg>
            <Fragment as="span" index={at + 3} className="l18-istep-matrix l18-notall-none">
              no such <Tex tex="B" />
            </Fragment>
          </Fragment>
          <Fragment index={at + 1}>
            <Panel title="F again?" home={false}>
              {(p) => (
                <g>
                  <Points p={p} opacity={0.45} />
                  <text x={p.px(0.45)} y={p.py(0.62)} textAnchor="middle" dominantBaseline="central" fontSize="66" fontWeight="700" fill={AMBER}>
                    ?
                  </text>
                </g>
              )}
            </Panel>
          </Fragment>
        </div>
      </Fragment>
    </>
  );
}

/**
 * Not all square matrices are invertible (the user's request, after Inverse of a matrix, before Example 2):
 * (its lead, every real number a ≠ 0 has an inverse but not every matrix A ≠ 0, removed by the user).
 * Two examples, each on a card in the style of Inverse of a matrix (InverseStrip), in four key presses
 * (Example): the zero matrix (the user's request), F shrinking to the origin (key presses 1–4); then
 * the projection onto the x-axis of Linear transformation: Invertible or not?, F flattened onto the
 * x-axis (5–8). (The box under the cards, A ≠ 0 is not invertible, there is no B with BA = I₂, removed
 * by the user.)
 */
export default function Slide04bNotAll() {
  return (
    <section>
      <h2>Not all square matrices are invertible</h2>

      <Example tag="Zero matrix" A={ZERO} matrix={r`A=\begin{bmatrix}0&0\\0&0\end{bmatrix}`} at={1} />
      <Example tag="Projection onto the x-axis" A={A} matrix={r`A=\begin{bmatrix}1&0\\0&0\end{bmatrix}`} at={5} className="l18-notall-next" />
    </section>
  );
}
