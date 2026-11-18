import { useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import EigGrid from '../lectures/l24/components/EigGrid.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { D_EIGS, STRETCH, FLIP } from '../lectures/l24/slides/Slide06Diagonal.jsx';

export const lecture = 24;

// the eigenlines and e₁, e₂ fade in as the first move starts (shown at rest, they would answer the
// question); played again, they stay
const SHOW = { ms: 500, delay: 200 };

/** The slide's picture, its move played as it mounts once `on`: the stretch along e₁, then the flip. */
function Picture({ on, again }) {
  const fade = useTween(on, SHOW);
  const show = again ? 1 : fade;
  const s1 = useTween(on, STRETCH);
  const s2 = useTween(on, FLIP);
  return <EigGrid eigs={D_EIGS} s={[s1, s2]} unit={84} xRange={[-2.5, 3.5]} yRange={[-1.75, 1.6]} lines={show} arrows={show} />;
}

/*
 * Example 3 (board), without its title, its question and Mark's remarks (the caption has them):
 * D = [2 0; 0 −1] beside its picture (EigGrid.jsx): the square grid and its shaded cell, the
 * eigenlines of e₁ (amber) and e₂ (purple). On the slide the picture comes on key press 1, and a
 * moment later D stretches the grid along e₁ (De₁ = 2e₁), then flips it along e₂ (De₂ = −e₂); here
 * the picture is at rest until its button, which plays the move afresh, and the eigenlines and the
 * arrows e₁, e₂ fade in only then (until then the grid and its cell alone: they would tell).
 */
export default function DiagonalEigenvectors() {
  const [run, setRun] = useState(0);
  return (
    <div className="viz-col dge">
      <div className="l24-diag dge-row">
        <p>
          <Tex tex={r`D=\begin{bmatrix}2&0\\0&-1\end{bmatrix}`} />
        </p>
        <Picture key={run} on={run > 0} again={run > 1} />
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setRun((n) => n + 1)}>
          {run ? (
            <>
              Play <Tex tex="D" /> again
            </>
          ) : (
            <>
              What does <Tex tex="D" /> do?
            </>
          )}
        </button>
      </div>
    </div>
  );
}
