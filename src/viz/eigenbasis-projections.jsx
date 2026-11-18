import { useLayoutEffect, useRef, useState } from 'react';
import '../lectures/l25/styles/deck.css';
import Tex, { r } from '../lectures/l25/components/Tex.jsx';
import { ProjFrame, ProjContent } from '../lectures/l25/components/BFrame.jsx';
import { sceneProps, turnedProps } from '../lectures/l25/components/cobFrames.js';
import { useTween } from '../lectures/l25/components/useFragmentTween.js';
import { Picture, FADE, MOVE, OVER, BX, DX, BASES, DONE, names, planeName, clamp01 } from '../lectures/l25/slides/Slide02aChangeOfBasis.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 25;

/**
 * D's picture, as the slide's (its Picture for side D), there from the start, and with B's picture
 * moving onto it from `shift` = [dx, dy] px away, so that it can come from above as well as from the
 * left (in a narrow box the two pictures are one under the other). `drop`: x dropping onto the
 * xy-plane (with e₃ shrinking into 0), 0 not yet, 1 playing, 2 dropped already; `move`: B's picture
 * moving onto it.
 */
function DPicture({ drop, move, shift }) {
  const xIn = useTween(drop === 1, FADE);
  const dIn = useTween(drop === 1, MOVE);
  const [xo, d] = drop === 2 ? [1, 1] : [xIn, dIn];
  const m = useTween(move, OVER);
  const over = (sp) =>
    m > 0 && (
      <g transform={`translate(${(shift[0] * (1 - m)).toFixed(2)} ${(shift[1] * (1 - m)).toFixed(2)})`}>
        <ProjContent sp={sp} {...turnedProps(m)} {...DONE} names={names(BX, true)} labels={clamp01(1 - m / 0.15)} spaces={planeName('B', clamp01(1 - m / 0.15))} />
      </g>
    );
  return (
    <ProjFrame
      {...sceneProps('D')}
      title="The projection onto the xy-plane, the same picture turned: x drops onto the xy-plane, and e₃ shrinks into 0"
      className="l25-cob-over"
      over={over}
      xo={xo}
      d={d}
      names={names(DX, d >= 1)}
      spaces={planeName('D', 1)}
    />
  );
}

// the buttons, and what each sets going: x dropping onto P (b), onto the xy-plane (d: 1 playing, 2
// dropped already), B's picture moving onto D's (move)
const PLAYS = [
  { label: <Tex tex={r`B\vv x`} />, name: 'B x', set: { b: true, d: 0, move: false } },
  { label: <Tex tex={r`D\vv x`} />, name: 'D x', set: { b: false, d: 1, move: false } },
  { label: 'Change of basis', name: 'Change of basis', set: { b: true, d: 2, move: true } },
];

/*
 * Basis of eigenvectors, without its title: B (Lecture 24's Example 2), the projection onto the plane
 * P, beside D, the projection onto the xy-plane, each over its picture (the slide's Picture, BFrame's
 * ProjFrame), the right one exactly the left one turned about span{(2, −1, 0)}, where P meets the
 * xy-plane, and each basis of eigenvectors under its picture: u, v, w in P's picture, e₁, e₂, e₃ in
 * the other. The 3-D pictures rock while the applet is on screen and turn when dragged. On the slide
 * D and its picture come on a key press after B's, then x drops onto each plane (Bx, Dx) on a key
 * press each, and on the last one B's picture moves onto D's, turning on the way, its two vectors in
 * P onto e₁ and e₂, with the arrow "change of basis" between the bases. Here both pictures are there
 * from the start, and three buttons play the drops and the move (each picture drawn afresh to play
 * again); the arrow shows with the move. In a narrow box the pictures are one under the other, and
 * B's picture moves down onto D's.
 */
export default function EigenbasisProjections() {
  const ref = useRef(null);
  const bBox = useRef(null);
  const dBox = useRef(null);
  // what plays (PLAYS), and a count of the clicks, which draws the pictures afresh
  const [play, setPlay] = useState({ set: { b: false, d: 0, move: false }, run: 0 });
  const { b, d, move } = play.set;
  // B's picture: the slide's markers 1–6 (B's words, its basis, x onto P, D, x onto the xy-plane,
  // the move)
  const on = [true, true, b, true, d > 0, move];
  // the arrow, change of basis (the slide's key press 6), only with the move
  useFragmentSteps(ref, move ? 6 : 5);
  // where B's picture is from D's (layout px, unscaled: the svgs are drawn at their own size)
  const [shift, setShift] = useState([0, 0]);
  useLayoutEffect(() => {
    if (!bBox.current || !dBox.current) return;
    const s = [bBox.current.offsetLeft - dBox.current.offsetLeft, bBox.current.offsetTop - dBox.current.offsetTop];
    setShift((old) => (old[0] === s[0] && old[1] === s[1] ? old : s));
  });
  return (
    <div className="viz-col ebp" ref={ref}>
      <div className="l25-cob-pics ebp-grid">
        <div className="l25-cob-m ebp-mb">
          <span className="l25-b-mat">
            <Tex tex={r`B=\dfrac{1}{14}\begin{bmatrix}13&-2&-3\\-2&10&-6\\-3&-6&5\end{bmatrix}`} />
          </span>
          <small>
            projection onto <Tex tex="P" />
          </small>
        </div>
        <div className="l25-cob-m ebp-md">
          <Tex tex={r`D=\begin{bmatrix}1&0&0\\0&1&0\\0&0&0\end{bmatrix}`} />
          <small>
            projection onto the <Tex tex="xy" />
            -plane
          </small>
        </div>
        <div className="ebp-pb" ref={bBox}>
          <Picture key={`b${play.run}`} side="B" on={on} />
        </div>
        <div className="ebp-pd" ref={dBox}>
          <DPicture key={`d${play.run}`} drop={d} move={move} shift={shift} />
        </div>
        <p className="l25-cob-basis l25-cob-basis-b">
          Basis: <Tex tex={BASES.B} />
        </p>
        <p className="l25-cob-basis l25-cob-basis-d">
          Basis: <Tex tex={BASES.D} />
        </p>
        <div className="fragment l25-cob-arrow" data-fragment-index={6}>
          <small>change of basis</small>
          <svg className="ebp-right" viewBox="0 0 240 16" width="240" height="16" aria-hidden="true">
            <line x1="2" y1="8" x2="226" y2="8" stroke="currentColor" strokeWidth="2.5" />
            <polygon points="238,8 222,1.5 222,14.5" fill="currentColor" />
          </svg>
          {/* in a narrow box, where D's picture is under B's, pointing down (site.css) */}
          <svg className="ebp-down" viewBox="0 0 16 70" width="16" height="70" aria-hidden="true">
            <line x1="8" y1="2" x2="8" y2="56" stroke="currentColor" strokeWidth="2.5" />
            <polygon points="8,68 1.5,52 14.5,52" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div className="viz-toggle ebp-buttons" role="group" aria-label="What to play">
        {PLAYS.map((p) => (
          <button key={p.name} type="button" className="viz-button" aria-label={p.name} onClick={() => setPlay((s) => ({ set: p.set, run: s.run + 1 }))}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
