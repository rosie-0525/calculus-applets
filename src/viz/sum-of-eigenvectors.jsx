import { useEffect, useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import { useTwice, Applet as SumApplet } from '../lectures/l24/slides/Slide10cPollSums.jsx';
import { TrueFalse } from './orthogonal-products.jsx';

export const lecture = 24;

/**
 * One of the two applets, the T that multiplies v by `kv` and w by `kw` (SumScene.jsx): T plays on v
 * and w once the poll is answered (`on`); its button plays the second play, T(v) and T(w) scaling
 * back to v and w, v + w fading in, and T again; a second click goes back to v and w.
 */
function Card({ kv, kw, on, remark }) {
  const [sum, setSum] = useState(false);
  useEffect(() => {
    if (!on) setSum(false);
  }, [on]);
  const play = useTwice(on, on && sum);
  return (
    <div className="l24-psum-card">
      <SumApplet kv={kv} kw={kw} at={0} play={play} />
      <p className="l24-psum-remark">{remark}</p>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={sum} disabled={!on} onClick={() => setSum((v) => !v)}>
          And <Tex tex={r`T(\vv v+\vv w)`} />?
        </button>
      </div>
    </div>
  );
}

/*
 * Poll, after Eigenspace, without its title: true or false, a sum of two eigenvectors is an
 * eigenvector. Then why not: Eigenspace's two applets side by side (SumScene.jsx), each with its
 * sentence under it: v (amber) and w (purple), eigenvectors of T, on the grid, the unit square and F,
 * T moving them; then v + w (ink), its line dotted. T = 2I doubles v + w along its line (a sum of
 * eigenvectors with the same eigenvalue is an eigenvector); the T that keeps v and doubles w takes
 * v + w to v + 2w, off its line (with different eigenvalues it is not). On the slide False is
 * outlined on key press 1, and each applet plays on v and w, then on v + w, on two key presses of
 * its own; here a click on True or False outlines False and plays each applet on v and w, and each
 * applet's button plays it on v + w.
 */
export default function SumOfEigenvectors() {
  return (
    <div className="sum-poll">
      <TrueFalse
        answer="False"
        statement={
          <>
            <strong>True or false?</strong> Sum of two eigenvectors is an eigenvector.
          </>
        }
      >
        {(on) => (
          <div className="l24-psum">
            <Card kv={2} kw={2} on={on} remark="Sum of eigenvectors with the same eigenvalue is an eigenvector." />
            <Card kv={1} kw={2} on={on} remark="Sum of eigenvectors with different eigenvalues is not an eigenvector." />
          </div>
        )}
      </TrueFalse>
    </div>
  );
}
