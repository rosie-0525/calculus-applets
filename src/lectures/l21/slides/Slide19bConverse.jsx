import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import { FImage, GridImage } from '../components/FShape.jsx';
import useSwing from '../components/useSwing.js';
import { PRINT } from '../components/print.js';
import { INK, PURPLE, I2 } from '../components/tr.js';
import { lerpM } from '../components/la.js';

// a matrix that is not orthogonal: it stretches by 3/2 along (1, 1) and by 1/2 along (1, −1)
export const A = [
  [1, 0.5],
  [0.5, 1],
];
export const texA = r`A=\begin{bmatrix}1&1/2\\1/2&1\end{bmatrix}`;
export const XR = [-0.75, 1.9];
export const YR = [-0.75, 1.9];

/**
 * F in the unit square, as on Orthogonal or not? (the user's request: the animation on F, as in the
 * other animations, in place of x round the unit circle and Ax round an ellipse): the faint grid, F
 * and the square in gray, and their image under the matrix on its way from I to A (`t`), purple.
 */
export function Picture({ t }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={130} pad={8} grid={false} axes={false} title="F in the unit square stretched along the diagonal and shrunk across it by A">
      {(p) => (
        <g>
          <GridImage p={p} n={4} />
          <FImage p={p} home />
          <FImage p={p} M={lerpM(I2, A, t)} color={PURPLE} opacity={0.9} squareFill={`${PURPLE}1c`} />
          <Dot p={p} at={[0, 0]} color={INK} r={4} />
        </g>
      )}
    </Plane>
  );
}

/**
 * Stretching and shrinking (once The converse; the turn to symmetric matrices and quadratic forms, the user's storyline): when A is
 * not orthogonal, ‖Ax‖ can be larger or smaller than ‖x‖ (the user's words, in place of orthogonal ⟹
 * ‖Ax‖ = ‖x‖, the owl's converse and "‖Ax‖ depends on x"), beside a picture for A = [1 1/2; 1/2 1]: on a
 * loop, F in the unit square stretched along the diagonal and shrunk across it (the user's request:
 * on F, as in the other animations, in place of x round the unit circle, Ax round its ellipse and ‖Ax‖
 * live; no proof, the picture as the intuition: the user's request); key press 1: the owl asks how much A stretches or shrinks; 2: let's calculate ‖Ax‖.
 * Example 1 next finds ‖Ax‖² as a function of x.
 * Print: F stretched.
 */
export default function Slide19bConverse() {
  const stage = useRef(null);
  const live = () => !!stage.current?.closest('section')?.classList.contains('present');
  const t = useSwing(true, { ms: 1800, hold: 1400, delay: 500, live });
  return (
    <section>
      <h2>Stretching and shrinking</h2>

      <div className="stage" ref={stage}>
        <div className="stage-text">
          <p className="l21-conv-line">
            When <Tex tex="A" /> is not orthogonal, <Tex tex={r`\norm{A\vv x}`} /> can be larger or smaller than <Tex tex={r`\norm{\vv x}`} />.
          </p>
          <Fragment index={1} as="p" className="question l21-conv-q">
            How much does <Tex tex="A" /> stretch or shrink?
          </Fragment>
          <Fragment index={2} as="p" className="l21-conv-line">
            Let&rsquo;s calculate <Tex tex={r`\norm{A\vv x}`} />.
          </Fragment>
        </div>

        <div className="stage-fig l21-conv-fig">
          <Picture t={PRINT ? 1 : t} />
          <p className="l21-conv-read">
            <Tex tex={texA} />
          </p>
        </div>
      </div>
    </section>
  );
}
