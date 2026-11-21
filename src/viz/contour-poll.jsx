import { useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex, { r } from '../lectures/l26/components/Tex.jsx';
import { FxMarker } from '../lectures/l26/components/Fragment.jsx';
import DiagCard from '../lectures/l26/components/DiagCard.jsx';
import { OPTIONS } from '../lectures/l26/slides/Slide11Zoom.jsx';
import { from } from './redundancies.jsx';

export const lecture = 26;

/*
 * Poll, without its title and Mark's box (the caption has it): f(x, y) = 2 cos x + 2 cos 2y has a local
 * maximum at a = (0, 0); what does its contour plot look like near (0, 0)? Its options, three contour
 * plots (DiagCard): circles, ellipses longer along the y-axis, ellipses longer along the x-axis (c, the
 * answer). On the slide the quadratic approximation, f(x, y) ≈ 4 − x² − 4y², comes under the poll on a
 * key press, then c is outlined; here a click on an option outlines c (orthogonal-products.jsx's
 * TrueFalse, its styles: the option picked wrongly in red) and shows the approximation; a click again
 * starts over. In a narrow box two options to a row.
 */
export default function ContourPoll() {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  return (
    <div className="viz-col cp">
      <FxMarker index={0} id="poll-answer" />
      <div className="block poll fx-host l26-zq-poll tf-poll cp-poll">
        <p>
          <Tex tex={r`f(x,y)=2\cos x+2\cos 2y`} /> has a local maximum at <Tex tex={r`\vv a=(0,0)`} />. What does its contour plot look like near <Tex tex="(0,0)" />?
        </p>
        <ul className="poll-options l26-zq-opts">
          {OPTIONS.map((o, k) => (
            <li key={o.title} className={answered && o.correct ? 'correct tf-correct' : picked === k ? 'tf-wrong' : undefined}>
              <button type="button" className="tf-opt cp-opt" aria-pressed={picked === k} aria-label={`${'abc'[k]}) ${o.title}`} onClick={() => setPicked((p) => (p === null ? k : null))}>
                <span className="opt">{'abc'[k]})</span>
                <DiagCard l1={o.l1} l2={o.l2} size={165} title={o.title} axisLabels />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="l26-zq-approx" style={from(answered ? 1 : 0, 1)}>
        The quadratic approximation gives{' '}
        <span className="nowrap">
          <Tex tex={r`f(x,y)\approx 4-x^2-4y^2`} />.
        </span>
      </p>
    </div>
  );
}
