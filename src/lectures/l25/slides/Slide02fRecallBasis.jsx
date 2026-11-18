import { useLayoutEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import { ProjFrame, ProjContent } from '../components/BFrame.jsx';
import { sceneProps, turnedProps, at, B_VS, CB_ON } from '../components/cobFrames.js';
import { useMarkers, Stills } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { AMBER, PURPLE, col } from '../components/eig.js';

// Basis of eigenvectors's two pictures (Slide02aChangeOfBasis.jsx), each as it is at the end of its key
// presses: x, and Bx (Dx) dropped onto P (the xy-plane), the third vector sent to 0 (a dashed copy stays)
export const E = [1, 2, 3].map((i) => String.raw`\vv e_${i}`);
export const NAMES = {
  B: { vs: B_VS, x: [r`\vv x`, -12, -8, 20], bx: [r`B\vv x`, -26, 2, 19] },
  D: { vs: [[E[0], 16, 8, 19], [E[1], 8, -16, 19], [E[2], 17, -2, 19]], x: [r`\vv x`, -12, -8, 20], bx: [r`D\vv x`, -22, 14, 19] },
};
export const PLANE = {
  // P's name off v's tip (u, v, w orthonormal, shorter: the user's request)
  B: { at: at('B', [2.4, 1.3, 0]), name: <Tex tex="P" /> },
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
export const TITLES = {
  B: 'What B does: x drops onto the plane P, and w shrinks into 0',
  D: 'What D does: x drops onto the xy-plane, and e₃ shrinks into 0',
};
export const basis = (vs) => `\\{${vs.map((v, i) => col(i < 2 ? AMBER : PURPLE, v)).join(',')}\\}`;
export const UVW = ['u', 'v', 'w'].map((c) => r`\vv ${c}`);
export const BASES = { B: basis(UVW), D: basis(E) };
// W: the eigenvectors u, v, w as its columns, in their colours
export const W_TEX = String.raw`W=\begin{bmatrix}|&|&|\\ ${UVW.map((v, i) => col(i < 2 ? AMBER : PURPLE, v)).join('&')}\\ |&|&|\end{bmatrix}`;

// B = WDW⁻¹, each factor (and B) highlighted on its replay (deck.css, the markers l25-rc-6 to l25-rc-9)
export const FORMULA = r`\htmlClass{l25-rc-hB}{B}=\htmlClass{l25-rc-hW}{W}\htmlClass{l25-rc-hD}{D}\htmlClass{l25-rc-hWi}{W^{-1}}`;

// key press 1, B's picture moving onto D's (as Basis of eigenvectors's last key press), and the replays
// (key presses 7–10): x dropping (as on Basis of eigenvectors), and the picture moving onto D's place
// and back
export const MOVE = { ms: 1900, delay: 300 };
export const OVER = { ms: 2400, delay: 300 };
export const FADE = { ms: 350, delay: 0 };
export const DONE = { ab: 1, n: 1, xo: 1, d: 1 };
export const EMPTY = { ab: 0, n: 0, xo: 0, d: 0 };
export const clamp01 = (k) => Math.max(0, Math.min(1, k));
// the names, Bx (Dx) once it has landed
export const named = (side, d) => ({ ...NAMES[side], bx: d >= 1 ? NAMES[side].bx : null });
export const planeName = (side, opacity) => [{ ...PLANE[side], color: AMBER, opacity }];
// the svg's units per layout px: the pictures (480 wide) are drawn 400px wide (deck.css)
export const UNITS = 480 / 400;

/** A picture in state `p` ({ ab, n, xo, d }: ProjContent's); D's lets `over` (the moving one) overflow it. */
export function Picture({ side, p = DONE, over = null }) {
  return <ProjFrame {...sceneProps(side, CB_ON)} title={TITLES[side]} className={side === 'D' ? 'l25-cob-over' : ''} {...p} names={named(side, p.d)} spaces={planeName(side, p.ab)} over={over} />;
}

/**
 * The picture on its way (drawn in D's svg, `shift` units left of it at k = 0): k from 0 (B's place,
 * P's frame, B's eigenvectors) to 1 (D's place, the xy-plane, e₁, e₂, e₃), turning about the hinge
 * (cobFrames.js's turnedProps), and x dropped by d; its labels only at rest, B's or D's (`land`
 * false: none on landing, where D's picture, under it, has them).
 */
export const moving = (k, d, shift, land = true) => (sp) => {
  const side = k < 0.5 ? 'B' : 'D';
  const lab = k < 0.5 ? clamp01(1 - k / 0.15) : land ? clamp01((k - 0.85) / 0.15) : 0;
  return (
    <g transform={`translate(${(shift * (1 - k)).toFixed(2)} 0)`}>
      <ProjContent sp={sp} {...turnedProps(k, CB_ON)} ab={1} n={1} xo={1} d={d} names={named(side, d)} labels={lab} spaces={planeName(side, lab)} />
    </g>
  );
};

export function Arrow({ left = false }) {
  return (
    <svg viewBox="0 0 240 16" width="240" height="16" aria-hidden="true" style={left ? { transform: 'scaleX(-1)' } : undefined}>
      <line x1="2" y1="8" x2="226" y2="8" stroke="currentColor" strokeWidth="2.5" />
      <polygon points="238,8 222,1.5 222,14.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Change of basis (the user's title; it was Recall: basis of eigenvectors. The user's request: before
 * B = WDW⁻¹, a slide that recalls the applets of Basis of eigenvectors, then writes the change of
 * basis as a matrix, which leads to B = WDW⁻¹). On arrival, Basis of eigenvectors before its last key
 * press (the lecture-slides skill: a recall reuses the slide): B, projection onto P, over its picture,
 * and D, projection onto the xy-plane, over its picture, each picture at the end of its key presses
 * (x, and Bx, Dx dropped onto the plane, the third vector sent to 0), u, v, w orthonormal (the user's
 * request, not said on the slide: cobFrames.js's CB_ON), and the bases, Orthonormal basis: {u, v, w}
 * (the user's words) and Basis: {e₁, e₂, e₃}, under them. Key press 1 (the user's request): Basis of
 * eigenvectors's last key press, B's picture moves onto D's, turning about the hinge, and lands on it,
 * leaving its axes, while the arrow, change of basis, comes between the bases; 2: B's picture is back,
 * and the arrow moves up, between the pictures (FxMarker l25-rcob-up, deck.css); 3: under it, the
 * arrow back, from D's picture to B's, e₁ → u, e₂ → v, e₃ → w under it (the user's words; it was
 * We₁ = u, …, under W, and under the arrow, {e₁, e₂, e₃} → {u, v, w}, which the user removed); 4:
 * under that, W = [u v w] (the eigenvectors as columns) (the user's order); 5: over the change of
 * basis arrow, W⁻¹ (it takes u, v, w to e₁, e₂, e₃); 6: between the bases, B = WDW⁻¹ (change of
 * basis, D, back) in a blue box (the user's request). Then the replays, each with its part of the
 * boxed formula highlighted (the user's request): 7, B's animation (x drops onto P again, w shrinks
 * into 0), B highlighted; 8, W⁻¹: B's picture (x not dropped) moves onto D's place, as on key press 1,
 * both pictures left with their axes; 9, D: there, x drops onto the xy-plane and e₃ shrinks into 0;
 * 10, W: the picture moves back onto B's place, where it lands as B's, with Bx. Example 3, next,
 * computes W, D and W⁻¹. Print: a still per key press, the end of each.
 */
export default function Slide02fRecallBasis() {
  const [markers, on] = useMarkers([1, 2, 7, 8, 9, 10]);
  const m1 = useTween(on[0], OVER);
  const back = useTween(on[1], FADE);
  const dB = useTween(on[2], MOVE);
  const k7 = useTween(on[3], OVER);
  const d8 = useTween(on[4], MOVE);
  const k9 = useTween(on[5], OVER);
  // how far left of D's picture B's is, in D's svg units, for the moving picture
  const bBox = useRef(null);
  const dBox = useRef(null);
  const [shift, setShift] = useState(0);
  // (before the first frame of a move, so that it never shows at shift 0)
  useLayoutEffect(() => {
    if ((on[0] || on[3]) && bBox.current && dBox.current) setShift((bBox.current.offsetLeft - dBox.current.offsetLeft) * UNITS);
  }, [on[0], on[3]]);
  // 1: B's picture moves onto D's, leaving its axes; 2: it is back; 7: it replays (x drops again);
  // 8–10: both pictures empty but for their axes, the moving one carrying what they showed: 8, onto
  // D's place (W⁻¹); 9, x drops (D); 10, back to B's place (W)
  let pics;
  if (PRINT) {
    pics = {
      B: (
        <Stills
          stills={[
            { node: <Picture side="B" /> },
            { at: 1, node: <Picture side="B" p={EMPTY} /> },
            { at: 2, node: <Picture side="B" /> },
            { at: 8, node: <Picture side="B" p={EMPTY} /> },
            { at: 10, node: <Picture side="B" /> },
          ]}
        />
      ),
      D: (
        <Stills
          stills={[
            { node: <Picture side="D" /> },
            { at: 8, node: <Picture side="D" p={EMPTY} over={moving(1, 0, 0)} /> },
            { at: 9, node: <Picture side="D" p={EMPTY} over={moving(1, 1, 0)} /> },
            { at: 10, node: <Picture side="D" p={EMPTY} /> },
          ]}
        />
      ),
    };
  } else if (!on[0]) {
    pics = { B: <Picture side="B" />, D: <Picture side="D" /> };
  } else if (!on[1]) {
    pics = { B: <Picture side="B" p={EMPTY} />, D: <Picture side="D" over={moving(m1, 1, shift, false)} /> };
  } else if (!on[3]) {
    pics = { B: <Picture side="B" p={on[2] ? { ...DONE, d: dB } : { ab: back, n: back, xo: back, d: 1 }} />, D: <Picture side="D" /> };
  } else {
    const k = on[5] ? 1 - k9 : on[4] ? 1 : k7;
    const d = on[5] ? 1 : on[4] ? d8 : 0;
    pics = { B: <Picture side="B" p={EMPTY} />, D: <Picture side="D" p={EMPTY} over={moving(k, d, shift)} /> };
  }
  return (
    <section>
      <h2>Change of basis</h2>
      {markers}

      {/* the markers of the highlights, next to one another (deck.css: each until the next one) */}
      <FxMarker index={2} id="l25-rcob-up" />
      <FxMarker index={7} id="l25-rc-7" />
      <FxMarker index={8} id="l25-rc-8" />
      <FxMarker index={9} id="l25-rc-9" />
      <FxMarker index={10} id="l25-rc-10" />
      <div className="l25-rcob fx-host">
        <div className="l25-cob-m l25-rcob-b">
          <Tex tex={r`B=\dfrac{1}{14}\begin{bmatrix}13&-2&-3\\-2&10&-6\\-3&-6&5\end{bmatrix}`} />
          <small>
            projection onto <Tex tex="P" />
          </small>
        </div>
        <div className="l25-cob-m l25-rcob-d">
          <Tex tex={r`D=\begin{bmatrix}1&0&0\\0&1&0\\0&0&0\end{bmatrix}`} />
          <small>
            projection onto the <Tex tex="xy" />
            -plane
          </small>
        </div>

        <div className="l25-rcob-pic l25-rcob-b" ref={bBox}>
          {pics.B}
        </div>
        <div className="l25-rcob-mid">
          <Fragment index={5} as="p" className="l25-rcob-lab">
            <Tex tex="W^{-1}" />
          </Fragment>
          {/* key press 1: between the bases, as on Basis of eigenvectors, as B's picture moves onto D's;
              2: up here (deck.css) */}
          <Fragment index={1}>
            <div className="l25-rcob-arrow l25-rcob-cob">
              <Arrow />
              <small>change of basis</small>
            </div>
          </Fragment>
          <Fragment index={3} className="l25-rcob-arrow l25-rcob-back">
            <Arrow left />
            <p className="l25-rcob-eu">
              <Tex tex={`${col(AMBER, r`\vv e_1`)}\\to${col(AMBER, r`\vv u`)},\\ ${col(AMBER, r`\vv e_2`)}\\to${col(AMBER, r`\vv v`)},\\ ${col(PURPLE, r`\vv e_3`)}\\to${col(PURPLE, r`\vv w`)}`} />
            </p>
            <Fragment index={4} className="l25-rcob-w">
              <Tex tex={W_TEX} />
            </Fragment>
          </Fragment>
        </div>
        <div className="l25-rcob-pic l25-rcob-d" ref={dBox}>
          {pics.D}
        </div>

        <p className="l25-rcob-basis l25-rcob-b">
          Orthonormal basis: <Tex tex={BASES.B} />
        </p>
        <Fragment index={6} as="p" className="block l25-rcob-formula">
          <Tex tex={FORMULA} />
        </Fragment>
        <p className="l25-rcob-basis l25-rcob-d">
          Basis: <Tex tex={BASES.D} />
        </p>
      </div>
    </section>
  );
}
