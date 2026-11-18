import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { ProjFrame, ProjContent } from '../components/BFrame.jsx';
import { sceneProps, turnedProps, at, B_VS } from '../components/cobFrames.js';
import { useMarkers, Stills } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { AMBER, PURPLE, col } from '../components/eig.js';

// The two pictures, one and its rotation: cobFrames.js
export const FADE = { ms: 350, delay: 0 };
export const MOVE = { ms: 1900, delay: 1000 };
// the last key press: B's picture moving onto D's
export const OVER = { ms: 2400, delay: 300 };
// the labels, [TeX, dx, dy, size] from the arrow's tip: x, and what the matrix makes of it once it
// has landed; B's eigenvectors, only u, v, w (B_VS: Last time's u = (2, −1, 0) and so on, the user's request); e₁, e₂, e₃ (no line of text says which they are)
export const E = [1, 2, 3].map((i) => String.raw`\vv e_${i}`);
export const BX = { vs: B_VS, x: [r`\vv x`, -12, -8, 20], bx: [r`B\vv x`, -26, 2, 19] };
export const DX = { vs: [[E[0], 16, 8, 19], [E[1], 8, -16, 19], [E[2], 17, -2, 19]], x: [r`\vv x`, -12, -8, 20], bx: [r`D\vv x`, -22, 14, 19] };
// the planes' names (the user's requests), each on a free part of its plane: P on its right part,
// clear of the x-axis and of (3, 0, −1); "xy-plane" on its front left part, under Dx
export const PLANE = {
  B: { at: at('B', [-0.2, 1.7, 0]), name: <Tex tex="P" /> },
  D: {
    at: at('D', [2.0, -0.37, 0]),
    name: (
      <>
        <Tex tex="xy" />
        -plane
      </>
    ),
  },
};
export const planeName = (side, opacity) => [{ ...PLANE[side], color: AMBER, opacity }];
// the two bases under the pictures (the user's request), each vector in its arrow's colour
export const basis = (vs) => `\\{${vs.map((v, i) => col(i < 2 ? AMBER : PURPLE, v)).join(',')}\\}`;
export const BASES = { B: basis(['u', 'v', 'w'].map((c) => r`\vv ${c}`)), D: basis(E) };
export const names = (all, landed) => ({ ...all, bx: landed ? all.bx : null });
export const clamp01 = (k) => Math.max(0, Math.min(1, k));
// B's picture at the end of its key presses (x dropped, (1, 2, 3) sent to 0)
export const DONE = { ab: 1, n: 1, xo: 1, d: 1 };
export const EMPTY = { ab: 0, n: 0, xo: 0, d: 0 };

/**
 * The two pictures, on the slide's key presses (each a ProjFrame, BFrame.jsx's, in the same real axes
 * and from the same view; the right one is exactly the left one turned about the hinge, the line
 * span{(2, −1, 0)} where P meets the xy-plane: the same rectangle and the same x, the user's
 * request; its vectors are e₁, e₂, e₃, the user's request). Left, B: on arrival (it glides in from Last time, the user's request: data-id
 * l25-b-applet), the plane P with u = (2, −1, 0) and v = (3, 0, −1) in it, and w = (1, 2, 3) off it (w carries
 * over from Last time, the user's request; it once came on key press 2), labelled u, v, w (Last
 * time's labels without their column vectors, the user's request); 3: a vector x, then Bx dropping onto P, with the dotted
 * perpendicular and its right angle, while (1, 2, 3) shrinks into 0 (a dashed copy stays). Right, D,
 * the projection onto the xy-plane, its plane amber as P (the user's request; it was teal for a
 * while) and named "xy-plane" in the picture (the user's request): 4: the xy-plane with e₁ and e₂ in
 * it, and e₃ (labelled: no line of text says which they are); 5: x, then Dx dropping onto the
 * xy-plane, while e₃ shrinks into 0. 6 (the user's request): everything in B's picture moves onto
 * D's, turning about the hinge on the way, its two vectors in P moving onto e₁ and e₂ (and the dashed
 * (1, 2, 3) onto the dashed e₃), and lands on it, P on the xy-plane (its labels fade as it leaves; it
 * is drawn in D's svg, which lets it overflow, from where B's picture is, `shift` px to the left).
 * Print: a still per key press, the end of each.
 */
export function Picture({ side, on, shift = 0 }) {
  const left = side === 'B';
  const [tex, title] = left
    ? [BX, 'What B does: x drops onto the plane P, and (1, 2, 3) shrinks into 0']
    : [DX, 'The projection onto the xy-plane, the same picture turned: x drops onto the xy-plane, and e₃ shrinks into 0'];
  const abD = useTween(on[3], FADE);
  // e₃, with D (B's w is there on arrival: it carries over from Last time, the user's request)
  const nIn = useTween(on[3], FADE);
  const xo = useTween(on[left ? 2 : 4], FADE);
  const d = useTween(on[left ? 2 : 4], MOVE);
  const m = useTween(on[5], OVER);
  // B's picture on its way onto D's, at m (0: where B's is; 1: on D's)
  const moving = (k) => (sp) =>
    k > 0 && (
      <g transform={`translate(${(shift * (1 - k)).toFixed(2)} 0)`}>
        <ProjContent sp={sp} {...turnedProps(k)} {...DONE} names={names(BX, true)} labels={clamp01(1 - k / 0.15)} spaces={planeName('B', clamp01(1 - k / 0.15))} />
      </g>
    );
  const scene = (p, over = null) => (
    <ProjFrame
      {...sceneProps(side)}
      title={title}
      className={left ? '' : 'l25-cob-over'}
      over={over}
      {...p}
      names={names(tex, p.d >= 1)}
      spaces={planeName(side, p.ab)}
    />
  );
  // B's picture: there on arrival, in the box that glides in from Last time
  const glided = (node) => (
    <div className="l25-cob-bpic" data-id="l25-b-applet">
      {node}
    </div>
  );
  if (PRINT) {
    const steps = left
      ? [
          [null, { ab: 1, n: 1 }],
          [3, { xo: 1, d: 1 }],
          [6, EMPTY],
        ]
      : [
          [4, { ab: 1, n: 1 }],
          [5, { xo: 1, d: 1 }],
          [6, {}, moving(1)],
        ];
    const stills = [];
    steps.reduce(
      (shown, [at, more, over]) => {
        const now = { ...shown, ...more };
        stills.push({ at, node: scene(now, over) });
        return now;
      },
      EMPTY,
    );
    return left ? glided(<Stills stills={stills} />) : <Stills stills={stills} />;
  }
  // once B's picture moves, what is left of it is its axes
  if (left) return glided(scene(m > 0 ? EMPTY : { ab: 1, n: 1, xo, d }));
  return <Fragment index={4}>{scene({ ab: abD, n: nIn, xo, d }, moving(m))}</Fragment>;
}

/**
 * Basis of eigenvectors (the user's title; it was Change of basis, then Basis of eigenvectors reveals the geometry. The user's request, before B = WDW⁻¹: the animation for B, and the animation for
 * the projection onto the xy-plane; the user says that the two transformations look the same, just
 * rotated, so the slide does not write it). Lecture 24's Example 2's B, its eigenvectors and its
 * picture, which the user moved here from Last time, on the left; the projection onto the xy-plane,
 * D, on the right. Each matrix over its words, centred over its picture (the user's request: B's and
 * D's text in one style), the two pictures side by side, as large as the slide allows. On arrival:
 * B = (1/14)[13 −2 −3; −2 10 −6; −3 −6 5].
 * B and its picture glide in from Last time (auto-animate, the user's request; data-ids l25-b-matrix
 * and l25-b-applet), the picture with (2, −1, 0) and (3, 0, −1) in the plane P and (1, 2, 3) off it
 * (carried over from Last time, the user's request), labelled u, v, w (on Last time, u = (2, −1, 0)
 * and so on: the user's request), and P named in it. Key press 1: under B, projection onto P (the user's request, as D's words:
 * once "= projection to P = span{(2, −1, 0), (3, 0, −1)}" beside it, and span{u, v} before that);
 * 2: Basis: {u, v, w} under the picture (it came with (1, 2, 3), once on this key press); 3: in
 * the picture, x and Bx dropping onto P (the two lines beside B, (2, −1, 0) and (3, 0, −1) are
 * eigenvectors with eigenvalue 1, (1, 2, 3) is an eigenvector with eigenvalue 0, removed by the user). 4: D = [1 0 0; 0 1 0; 0 0 0], projection
 * onto the xy-plane, and its picture, exactly B's turned; 5: in it, x and Dx dropping onto the
 * xy-plane; 6: B's picture moves onto D's (see Picture). Under the pictures (the user's request),
 * each basis, its vectors in their arrows' colours: Basis: {u, v, w} on 2; Basis: {e₁, e₂, e₃}
 * on 4, with D; and on 6, as B's picture moves, an arrow between them, change of basis (teal, as the
 * words under the matrices).
 */
export default function Slide02aChangeOfBasis() {
  const [markers, on] = useMarkers([1, 2, 3, 4, 5, 6]);
  // how far left of D's picture B's is (layout px, unscaled), for the last key press
  const bBox = useRef(null);
  const dBox = useRef(null);
  const [shift, setShift] = useState(0);
  useEffect(() => {
    if (on[5] && bBox.current && dBox.current) setShift(bBox.current.offsetLeft - dBox.current.offsetLeft);
  }, [on[5]]);
  return (
    <section data-auto-animate="">
      <h2>Basis of eigenvectors</h2>
      {markers}

      {/* each matrix over its words, over its picture */}
      <div className="l25-cob-pics">
        <div className="l25-cob-m">
          <span className="l25-b-mat" data-id="l25-b-matrix">
            <Tex tex={r`B=\dfrac{1}{14}\begin{bmatrix}13&-2&-3\\-2&10&-6\\-3&-6&5\end{bmatrix}`} />
          </span>
          <Fragment index={1} as="small">
            projection onto <Tex tex="P" />
          </Fragment>
        </div>
        <Fragment index={4} className="l25-cob-m">
          <Tex tex={r`D=\begin{bmatrix}1&0&0\\0&1&0\\0&0&0\end{bmatrix}`} />
          <small>
            projection onto the <Tex tex="xy" />
            -plane
          </small>
        </Fragment>
        <div ref={bBox}>
          <Picture side="B" on={on} />
        </div>
        <div ref={dBox}>
          <Picture side="D" on={on} shift={shift} />
        </div>
        {/* the two bases under their pictures, and between them, as B's picture moves onto D's, the
            arrow (the user's request) */}
        <Fragment index={2} as="p" className="l25-cob-basis l25-cob-basis-b">
          Basis: <Tex tex={BASES.B} />
        </Fragment>
        <Fragment index={4} as="p" className="l25-cob-basis l25-cob-basis-d">
          Basis: <Tex tex={BASES.D} />
        </Fragment>
        <Fragment index={6} className="l25-cob-arrow">
          <small>change of basis</small>
          <svg viewBox="0 0 240 16" width="240" height="16" aria-hidden="true">
            <line x1="2" y1="8" x2="226" y2="8" stroke="currentColor" strokeWidth="2.5" />
            <polygon points="238,8 222,1.5 222,14.5" fill="currentColor" />
          </svg>
        </Fragment>
      </div>
    </section>
  );
}
