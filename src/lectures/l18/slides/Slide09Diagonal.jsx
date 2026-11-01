import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import { FImage, GridImage } from '../components/FShape.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, BLUE, AMBER } from '../components/inv.js';

export const XR = [-0.3, 2.3];
export const YR = [-0.3, 1.25];
// diag(2, 1/2) raised to the power t: F stretched along x and squeezed along y, smoothly
export const D = (t) => [
  [2 ** t, 0],
  [0, 2 ** -t],
];

/** F (gray), DF (blue, t from 0 to 1), then D⁻¹ back (amber, b from 0 to 1); the blue copy stays. */
export function Picture({ t, b }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={150} pad={8} grid={false} axes={false} title="F stretched by D, then back by the inverse of D">
      {(p) => (
        <g>
          <GridImage p={p} n={4} />
          <FImage p={p} home />
          {t > 0 && <FImage p={p} M={D(t)} color={BLUE} opacity={b > 0 ? 0.35 : 0.9} />}
          {b > 0 && <FImage p={p} M={D(1 - b)} color={AMBER} opacity={0.9} />}
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Plane>
  );
}

/**
 * Inverse of a diagonal matrix (the textbook's (18.1.1), Remark 18.1.9: the one easy case for
 * n > 2): the box, without a title. Key press 1: D = diag(2, 1/2) (blue) stretches F along x and
 * squeezes it along y; 2: D⁻¹ = diag(1/2, 2) (amber) takes it back. Print: a still per key press.
 */
export default function Slide09Diagonal() {
  const refs = [useRef(null), useRef(null)];
  const on = refs.map(useFragmentShown);
  const t = useTween(on[0], { ms: 1500, delay: 400 });
  const b = useTween(on[1], { ms: 1500, delay: 400 });
  return (
    <section>
      <h2>Inverse of a diagonal matrix</h2>
      {refs.map((ref, k) => (
        <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={k + 1} aria-hidden="true" />
      ))}

      <div className="block theorem">
        <p>
          If <Tex tex={r`A=\begin{bmatrix}a_1&&0\\&\ddots&\\0&&a_n\end{bmatrix}`} /> with all <Tex tex={r`a_i\neq 0`} />, then{' '}
          <Tex tex={r`A^{-1}=\begin{bmatrix}1/a_1&&0\\&\ddots&\\0&&1/a_n\end{bmatrix}`} />.
        </p>
        <p>
          If some <Tex tex="a_i=0" />, then <Tex tex="A" /> is not invertible.
        </p>
      </div>

      <div className="l18-diag">
        <Fragment index={1}>
          {PRINT ? (
            <div className="l15-stills">
              <Fragment index={2} effect="fade-out">
                <Picture t={1} b={0} />
              </Fragment>
              <Fragment index={2}>
                <Picture t={1} b={1} />
              </Fragment>
            </div>
          ) : (
            <Picture t={on[1] ? 1 : t} b={b} />
          )}
        </Fragment>
        <div className="l18-diag-mats">
          <Fragment index={1} as="p">
            <Tex tex={r`\textcolor{${BLUE}}{D=\begin{bmatrix}2&0\\0&1/2\end{bmatrix}}`} />
          </Fragment>
          <Fragment index={2} as="p">
            <Tex tex={r`\textcolor{${AMBER}}{D^{-1}=\begin{bmatrix}1/2&0\\0&2\end{bmatrix}}`} />
          </Fragment>
        </div>
      </div>
    </section>
  );
}
