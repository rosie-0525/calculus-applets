import { useLayoutEffect, useRef, useState } from 'react';
import '../lectures/l25/styles/deck.css';
import Tex, { r } from '../lectures/l25/components/Tex.jsx';
import { ProjContent } from '../lectures/l25/components/BFrame.jsx';
import { turnedProps, CB_ON } from '../lectures/l25/components/cobFrames.js';
import { AMBER, PURPLE, col } from '../lectures/l25/components/eig.js';
import { Picture, Arrow, named, planeName, clamp01, DONE, EMPTY, MOVE, OVER, UNITS, BASES, W_TEX, FORMULA } from '../lectures/l25/slides/Slide02fRecallBasis.jsx';

export const lecture = 25;

const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

/** An arrow down (up: `up`), for a narrow box, where D's picture is under B's (site.css). */
function DownArrow({ up = false }) {
  return (
    <svg className="cob-v" viewBox="0 0 16 70" width="16" height="70" aria-hidden="true" style={up ? { transform: 'scaleY(-1)' } : undefined}>
      <line x1="8" y1="2" x2="8" y2="56" stroke="currentColor" strokeWidth="2.5" />
      <polygon points="8,68 1.5,52 14.5,52" fill="currentColor" />
    </svg>
  );
}

/** A number that glides from 0 to 1 (eased) over `ms`, `delay` ms after `run` changes (0: stays 0). */
function usePlay(run, { ms, delay }) {
  const [t, setT] = useState(0);
  useLayoutEffect(() => {
    setT(0);
    if (!run) return undefined;
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      setT(ease(k));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [run, ms, delay]);
  return t;
}

/**
 * The picture on its way, as the slide's `moving`, drawn in D's svg, `shift` = [dx, dy] svg units
 * from it at k = 0 (B's place; in a narrow box B's picture is above D's): k from 0 (B's place, P's
 * frame, u, v, w) to 1 (D's place, the xy-plane, e₁, e₂, e₃), turning about the hinge, and x dropped
 * by d; its labels only at rest, B's or D's.
 */
const moving = (k, d, [sx, sy]) => (sp) => {
  const side = k < 0.5 ? 'B' : 'D';
  const lab = k < 0.5 ? clamp01(1 - k / 0.15) : clamp01((k - 0.85) / 0.15);
  return (
    <g transform={`translate(${(sx * (1 - k)).toFixed(2)} ${(sy * (1 - k)).toFixed(2)})`}>
      <ProjContent sp={sp} {...turnedProps(k, CB_ON)} ab={1} n={1} xo={1} d={d} names={named(side, d)} labels={lab} spaces={planeName(side, lab)} />
    </g>
  );
};

// the replays, each with its part of B = WDW⁻¹ highlighted: B, x drops onto P; W⁻¹, B's picture (x
// not dropped) moves onto D's place; D, there x drops onto the xy-plane; W, the picture moves back
// onto B's place
const STEPS = [
  { id: 'B', tex: 'B', name: 'B', timing: MOVE },
  { id: 'Wi', tex: r`W^{-1}`, name: 'W inverse', timing: OVER },
  { id: 'D', tex: 'D', name: 'D', timing: MOVE },
  { id: 'W', tex: 'W', name: 'W', timing: OVER },
];

/*
 * Change of basis, without its title: Basis of eigenvectors's two pictures, each at the end of its
 * key presses (x, and Bx or Dx dropped onto the plane, the third vector sent to 0, a dashed copy
 * left), u, v, w orthonormal, with B and D over them and their bases under them; between them the
 * change of basis arrow, W⁻¹, and the arrow back, e₁ → u, e₂ → v, e₃ → w, with W = [u v w]; between
 * the bases, B = WDW⁻¹ in a blue box. The 3-D pictures rock while the applet is on screen and turn
 * when dragged. On the slide the arrows, W and the formula come one key press at a time, then four
 * replays, each with its part of the formula highlighted; here everything is there at once, and the
 * replays are four buttons, each playing its step from where it starts (site.css highlights the
 * factor, `data-hl`; the deck's markers for the highlights are left out). In a narrow box the column
 * goes down: B, the arrows (pointing down and up), D, then the formula, and the picture moves down
 * onto D's place and back up.
 */
export default function ChangeOfBasis() {
  const bBox = useRef(null);
  const dBox = useRef(null);
  // the step playing, and a count of the clicks, which starts it again
  const [play, setPlay] = useState({ step: null, run: 0 });
  const timing = STEPS.find((s) => s.id === play.step)?.timing ?? MOVE;
  const t = usePlay(play.run, timing);
  // how far B's picture is from D's, in D's svg units
  const [shift, setShift] = useState([0, 0]);
  useLayoutEffect(() => {
    if (!bBox.current || !dBox.current) return;
    const s = [(bBox.current.offsetLeft - dBox.current.offsetLeft) * UNITS, (bBox.current.offsetTop - dBox.current.offsetTop) * UNITS];
    setShift((old) => (Math.abs(old[0] - s[0]) < 0.5 && Math.abs(old[1] - s[1]) < 0.5 ? old : s));
  });
  let pics;
  if (play.step === 'B') pics = { B: <Picture side="B" p={{ ...DONE, d: t }} />, D: <Picture side="D" /> };
  else if (play.step) {
    const [k, d] = { Wi: [t, 0], D: [1, t], W: [1 - t, 1] }[play.step];
    pics = { B: <Picture side="B" p={EMPTY} />, D: <Picture side="D" p={EMPTY} over={moving(k, d, shift)} /> };
  } else pics = { B: <Picture side="B" />, D: <Picture side="D" /> };
  return (
    <div className="viz-col cob">
      <div className="l25-rcob cob-grid" data-hl={play.step ?? undefined}>
        <div className="l25-cob-m l25-rcob-b cob-mb">
          <Tex tex={r`B=\dfrac{1}{14}\begin{bmatrix}13&-2&-3\\-2&10&-6\\-3&-6&5\end{bmatrix}`} />
          <small>
            projection onto <Tex tex="P" />
          </small>
        </div>
        <div className="l25-cob-m l25-rcob-d cob-md">
          <Tex tex={r`D=\begin{bmatrix}1&0&0\\0&1&0\\0&0&0\end{bmatrix}`} />
          <small>
            projection onto the <Tex tex="xy" />
            -plane
          </small>
        </div>
        <div className="l25-rcob-pic l25-rcob-b cob-pb" ref={bBox}>
          {pics.B}
        </div>
        <div className="l25-rcob-mid cob-mid">
          <p className="l25-rcob-lab">
            <Tex tex="W^{-1}" />
          </p>
          <div className="l25-rcob-arrow l25-rcob-cob cob-down">
            <Arrow />
            <DownArrow />
            <small>change of basis</small>
          </div>
          <div className="l25-rcob-arrow l25-rcob-back">
            <Arrow left />
            <DownArrow up />
            <p className="l25-rcob-eu">
              <Tex tex={`${col(AMBER, r`\vv e_1`)}\\to${col(AMBER, r`\vv u`)},\\ ${col(AMBER, r`\vv e_2`)}\\to${col(AMBER, r`\vv v`)},\\ ${col(PURPLE, r`\vv e_3`)}\\to${col(PURPLE, r`\vv w`)}`} />
            </p>
            <div className="l25-rcob-w">
              <Tex tex={W_TEX} />
            </div>
          </div>
        </div>
        <div className="l25-rcob-pic l25-rcob-d cob-pd" ref={dBox}>
          {pics.D}
        </div>
        <p className="l25-rcob-basis l25-rcob-b cob-bb">
          Orthonormal basis: <Tex tex={BASES.B} />
        </p>
        <p className="block l25-rcob-formula cob-formula">
          <Tex tex={FORMULA} />
        </p>
        <p className="l25-rcob-basis l25-rcob-d cob-bd">
          Basis: <Tex tex={BASES.D} />
        </p>
      </div>
      <div className="viz-toggle cob-buttons" role="group" aria-label="Which factor of B = WDW⁻¹ to play">
        {STEPS.map((s) => (
          <button key={s.id} type="button" className="viz-button" aria-label={s.name} aria-pressed={play.step === s.id} onClick={() => setPlay((p) => ({ step: s.id, run: p.run + 1 }))}>
            <Tex tex={s.tex} />
          </button>
        ))}
        <button type="button" className="viz-button" disabled={!play.step} onClick={() => setPlay((p) => ({ step: null, run: p.run + 1 }))}>
          Start again
        </button>
      </div>
    </div>
  );
}
