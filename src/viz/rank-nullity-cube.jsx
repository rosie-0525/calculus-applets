import { useRef, useState } from 'react';
import '../lectures/l23/styles/deck.css';
import Tex, { r } from '../lectures/l23/components/Tex.jsx';
import RankPicture from '../lectures/l23/components/RankPicture.jsx';
import { GREEN } from '../lectures/l23/components/ls22.js';
import { AT, MATRIX } from '../lectures/l23/slides/Slide01gRankNullity.jsx';
import { useKeyPresses } from './back-substitution.jsx';
import { useReplay } from './zoom-in.jsx';
import { from } from './redundancies.jsx';

export const lecture = 23;

// the picture's stages, the slide's key presses 1–6: what each button says, and its key press
const STAGES = [
  [
    <>
      Play <Tex tex="T_A" />
    </>,
    AT.play1,
  ],
  [<Tex key="e" tex={r`\vv e_1,\vv e_2,\vv e_3`} />, AT.axes],
  [<Tex key="n" tex="N(A)" />, AT.nul],
  [
    <>
      <Tex tex="T_A" /> again
    </>,
    AT.play2,
  ],
  ['The rest', AT.play3],
  ['Rank', AT.rank],
];

/*
 * Rank–nullity theorem, without its title, its bullets and its box (the caption has them): its
 * example, A = [1 −1 0; 0 1 0; −1 0 0], T_A: ℝ³ → ℝ³, beside its picture (RankPicture.jsx), T_A
 * played three times on the unit cube, a layer more each time: the cube alone, gray; back at the
 * inputs, e₁, e₂, e₃; N(A), the e₃-axis, green; T_A again, N(A) shrinking into 0, e₁, e₂ onto Ae₁,
 * Ae₂; the rest, the square on e₁, e₂ purple, landing with no collapse on the parallelogram on Ae₁,
 * Ae₂ in C(A), which lights up; then rank = 3 − 1 = 2 under it. The picture rocks while the applet
 * is on screen and turns when dragged. On the slide each stage is a key press, the bullets with
 * them; here a button picks the stage (the stages before it shown, its own played; picked again, it
 * plays again), and the first plays the first time the applet is on screen.
 */
export default function RankNullityCube() {
  const ref = useRef(null);
  const [run, replay] = useReplay(ref);
  const [n, setN] = useState(AT.play1);
  useKeyPresses(ref, run ? n : 0, run);
  const pick = (k) => {
    if (k === n) replay();
    setN(k);
  };
  return (
    <div className="viz-col rn-cube" ref={ref}>
      <div className="viz-toggle rn-cube-pick" role="group" aria-label="How far the picture goes">
        {STAGES.map(([label, k]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={n === k} onClick={() => pick(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="l22-pick">
        <div className="l22-img-card">
          <div className="l22-img-text rn-cube-text">
            <Tex tex={MATRIX} />
            <div className="l23-rnk-sig">
              <Tex tex={r`T_A:\mathbb R^3\to\mathbb R^3`} />
            </div>
          </div>
          <RankPicture key={run} at={AT} />
        </div>
        <p className="l23-rnk-says" style={from(n, AT.rank)}>
          <span className="l22-rn-rank">rank</span> <Tex tex={r`=3-\textcolor{${GREEN}}{1}=2`} />
        </p>
      </div>
    </div>
  );
}
