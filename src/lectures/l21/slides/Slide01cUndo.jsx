import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import FlipMatrix from '../components/FlipMatrix.jsx';
import Strip from '../components/Strip.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import useSwing from '../components/useSwing.js';
import { PRINT } from '../components/print.js';
import { INK, BLUE, AMBER, rot } from '../components/tr.js';
import { I } from '../components/svgmath.jsx';

export const THETA = 60;
export const STEPS = [
  {
    index: 1,
    name: r`R_\theta`,
    matrix: r`\begin{bmatrix}\cos\theta&-\sin\theta\\ \sin\theta&\cos\theta\end{bmatrix}`,
    color: BLUE,
    path: (t) => rot(THETA * t),
    panel: r`R_\theta F`,
  },
  {
    index: 2,
    name: r`R_\theta^{-1}`,
    matrix: r`\begin{bmatrix}\cos\theta&\sin\theta\\ -\sin\theta&\cos\theta\end{bmatrix}`,
    color: AMBER,
    path: (t) => rot(-THETA * t),
    panel: r`R_\theta^{-1}R_\theta F=F`,
  },
];

export const th = <I>θ</I>;
export const ROT = [
  [<>cos {th}</>, <>−sin {th}</>],
  [<>sin {th}</>, <>cos {th}</>],
];
export const CELL = 76;

/** R_θ in an SVG box, flipped across its diagonal by `t` (0: R_θ, 1: R_θ⁻¹). */
export function Rot({ t, diag = false }) {
  const side = 2 * CELL + 40;
  return (
    <svg viewBox={`0 0 ${side} ${side}`} width={side} height={side} role="img" aria-label={t ? 'R theta flipped across its diagonal' : 'R theta'}>
      <FlipMatrix rows={ROT} t={t} x={20} y={20} cell={CELL} font={25} colors={[INK]} diag={diag} />
    </svg>
  );
}

/**
 * Inverse of a rotation (the deck's start, the user's choice; inverses are known from Lecture 18).
 * Key presses 1–2: a strip, F turned by R_θ (θ = 60°, blue), then back by R_θ⁻¹ (amber) to F, each
 * arrow's matrix under it (the panels unnamed, the user's request); 3: R_θ flipping across its diagonal
 * into R_θ⁻¹ and back, on a loop (entries in ink, the user's request), which leads to Matrix
 * transpose; 4: the owl asks the question of the slide after the transpose's properties, When is the
 * inverse of a matrix computed by its transpose? (the user's request), on two lines, right of the
 * flip (the user's layout). Print: R_θ⁻¹.
 */
export default function Slide01cUndo() {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const t = useSwing(on, { ms: 1700, hold: 1400, delay: 600, live: () => !!ref.current?.closest('section')?.classList.contains('present') });
  const k = PRINT ? 1 : t;
  return (
    <section>
      <h2>Inverse of a rotation</h2>

      <p className="l21-undo-lead">
        <Tex tex={r`R_\theta`} />: the rotation by <Tex tex={r`\theta`} /> counterclockwise. It is invertible.
      </p>

      <div className="l21-undo-strip">
        <Strip steps={STEPS} unit={84} named={false} />
      </div>

      <span ref={ref} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
      <div className="l21-undo-row">
        <Fragment index={3} className="l21-undo-flip">
          <span className="l21-stack">
            <span style={{ opacity: 1 - k }}>
              <Tex tex={r`R_\theta=`} />
            </span>
            <span style={{ opacity: k }}>
              <Tex tex={r`R_\theta^{-1}=`} />
            </span>
          </span>
          <Rot t={k} diag />
        </Fragment>

        <Fragment index={4} as="p" className="question l21-undo-q">
          When is the inverse of a matrix
          <br />
          computed by its transpose?
        </Fragment>
      </div>
    </section>
  );
}
