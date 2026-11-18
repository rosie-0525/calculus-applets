import { useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { AMBER, PURPLE, col } from '../lectures/l24/components/eig.js';
import { Scene } from '../lectures/l24/slides/Slide05Example1.jsx';

export const lecture = 24;

// the buttons, as the slide's key presses 1–3: what each says
const STAGES = [
  <>
    What does <Tex tex="A" /> do?
  </>,
  <>
    <Tex tex={r`\vv u`} /> and <Tex tex={r`\vv v`} />
  </>,
  <>
    <Tex tex="A" /> on <Tex tex={r`\vv u`} /> and <Tex tex={r`\vv v`} />
  </>,
];

/** The picture at stage `k` (none yet: −1), its move played as it mounts. */
function Picture({ k }) {
  const t = useTween(k === 0 || k === 2, { ms: 4000, delay: 500 });
  if (k === 2) return <Scene t={t} eigs images steps />;
  if (k === 1) return <Scene t={0} eigs />;
  return <Scene t={k === 0 ? t : 0} />;
}

/*
 * Example 1 (board), without its title and its questions (the caption has them): A = (1/2)[1 3; 3 1],
 * u = (1, 1) and v = (1, −1) beside the picture of what A does (Slide05Example1's Scene): the square
 * grid, the unit square and F (gray: where they start). On the slide, key press 1 plays T_A on them as
 * a whole; 2 puts them back, faded, with u and v on their eigenlines (amber and purple); 3 plays T_A
 * again, u and v moving with it in two steps: u stretches by 2, then, after a pause, v flips, the
 * plane turning over about u's line like a page; then Au = 2u and Av = −v. Here the three are
 * buttons (the picture at rest until the first), each playing its move afresh.
 */
export default function StretchAndFlip() {
  const [k, setK] = useState(-1);
  const [turn, setTurn] = useState(0);
  return (
    <div className="viz-col saf">
      <div className="saf-row">
        <div className="saf-text">
          <p>
            <Tex tex={r`A=\dfrac12\begin{bmatrix}1&3\\3&1\end{bmatrix}`} />
          </p>
          <p>
            <Tex tex={`${col(AMBER, r`\vv u`)}=\\begin{bmatrix}1\\\\1\\end{bmatrix},\\quad ${col(PURPLE, r`\vv v`)}=\\begin{bmatrix}1\\\\-1\\end{bmatrix}`} />
          </p>
        </div>
        <Picture key={`${k}-${turn}`} k={k} />
      </div>
      <div className="viz-toggle saf-pick" role="group" aria-label="What the picture shows">
        {STAGES.map((label, i) => (
          <button
            key={i}
            type="button"
            className="viz-button"
            aria-pressed={k === i}
            onClick={() => {
              setK(i);
              setTurn((n) => n + 1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
