import { useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import ObserveOwl from '../lectures/l24/components/ObserveOwl.jsx';
import { ProjScene } from '../lectures/l24/components/ProjPlane.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { a, b, n } from '../lectures/l24/slides/Slide09WhatBDoes.jsx';
import { from } from './redundancies.jsx';

export const lecture = 24;

// ProjPlane's size and its moves, as on the slide
const SIZE = { width: 500, height: 440, unit: 60, center: [0.53, 0.58] };
const FADE = { ms: 350, delay: 0 };
const MOVE = { ms: 1900, delay: 1000 };
const GLOW = { ms: 600, delay: 0 };

// what the button asks before each step, then Start again
const ASK = [
  <>
    What is <Tex tex={r`B(1,2,3)`} />?
  </>,
  <>
    What are <Tex tex={r`B(2,-1,0)`} /> and <Tex tex={r`B(3,0,-1)`} />?
  </>,
  <>And their linear combinations?</>,
  <>
    So what is <Tex tex="T_B" />?
  </>,
  <>Start again</>,
];

/*
 * The linear transformation T_B, without its title, for Example 2's B = (1/14)[13 −2 −3; −2 10 −6;
 * −3 −6 5] (the board example before it; the caption has its questions): B over the four lines,
 * beside the 3-D picture (ProjPlane.jsx's ProjScene), the plane P: x + 2y + 3z = 0 as its floor. Step
 * 1: (1, 2, 3) is an eigenvector with eigenvalue 0, n shrinking into 0; 2: (2, −1, 0) and (3, 0, −1)
 * are eigenvectors with eigenvalue 1, the two vectors in P; 3: Observation (after the owl, which hops
 * in): every linear combination of them is an eigenvector with eigenvalue 1, P and the line of n
 * lighting up; 4: ⟹ T_B is the projection to the plane spanned by them, a vector x dropping onto P.
 * On the slide the steps are key presses (ProjPlane reads them with useMarkers, which on the page sees
 * them all at once); here one button takes the steps, asking the question each answers, and the
 * picture's moves follow its state. The picture rocks while on screen and turns when dragged.
 */
export default function ProjectionEigenvectors() {
  const [s, setS] = useState(0);
  const nIn = useTween(s >= 1, FADE);
  const tn = useTween(s >= 1, MOVE);
  const ab = useTween(s >= 2, FADE);
  const glow = useTween(s >= 3, GLOW);
  const xIn = useTween(s >= 4, FADE);
  const tx = useTween(s >= 4, MOVE);
  return (
    <div className="viz-col pje">
      <div className="l24-proj pje-row">
        <div className="l24-proj-text pje-text">
          <p className="pje-b">
            <Tex tex={r`B=\dfrac{1}{14}\begin{bmatrix}13&-2&-3\\-2&10&-6\\-3&-6&5\end{bmatrix}`} />
          </p>
          <p style={from(s, 1)}>
            <Tex tex={n} /> is an eigenvector with eigenvalue 0
          </p>
          <p style={from(s, 2)}>
            <Tex tex={a} /> and <Tex tex={b} /> are eigenvectors with eigenvalue 1
          </p>
          {/* remounted when reached, so that the owl hops in then (deck.css: .l24-observe.fragment.visible) */}
          <p key={s >= 3 ? 'on' : 'off'} className={`l24-observe${s >= 3 ? ' fragment' : ''}`} style={from(s, 3)}>
            <ObserveOwl />
            <span className="l24-observe-label">Observation:</span> Every linear combination of <Tex tex={a} /> and <Tex tex={b} /> is an eigenvector with eigenvalue 1
          </p>
          <p style={from(s, 4)}>
            <Tex tex={r`\Longrightarrow`} /> <Tex tex="T_B" /> is the projection to the plane spanned by <Tex tex={a} /> and <Tex tex={b} />
          </p>
        </div>
        <div className="l24-proj-pic">
          <ProjScene {...SIZE} n={nIn} tn={tn} ab={ab} glow={glow} x={xIn} tx={tx} />
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setS((k) => (k + 1) % ASK.length)}>
          {ASK[s]}
        </button>
      </div>
    </div>
  );
}
