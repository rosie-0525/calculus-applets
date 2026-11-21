import { useRef, useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex, { r } from '../lectures/l26/components/Tex.jsx';
import Fragment, { FxMarker } from '../lectures/l26/components/Fragment.jsx';
import { QuadSurfaceFigure } from '../lectures/l26/components/QuadFigures.jsx';
import { MANY, SECOND } from '../lectures/l26/slides/Slide05QuadApprox.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 26;

// the buttons: the key press of the slide each one shows
const STEPS = [
  ['Linear approximation', 1],
  ['Quadratic approximation', 5],
];

/*
 * Quadratic approximation, its second row: the definition (the textbook's Definition 25.3.1) beside a
 * smooth hill with its tangent plane at a point on its slope (QuadSurfaceFigure), without the row over
 * it, f(x) beside its graph (taylor-expansion.jsx has it). On the slide the terms of
 * f(a + h) ≈ f(a) + f'(a)h + ½ f''(a)h² fly down into the definition one key press at a time (Flights),
 * the quadratic approximation (red) coming onto the hill with the first of the quadratic pieces, the
 * plane faint; here Linear approximation shows the definition's first line up to its linear part,
 * beside the tangent plane, and Quadratic approximation the whole definition, beside the quadratic
 * approximation (useFragmentSteps: key presses 1 and 5). The picture turns when dragged. In a narrow
 * box the picture is under the definition.
 */
export default function QuadraticApproximation() {
  const ref = useRef(null);
  const [n, setN] = useState(1);
  useFragmentSteps(ref, n);
  return (
    <div className="viz-col qap" ref={ref}>
      <FxMarker index={2} id="l26-qa" />
      <FxMarker index={3} id="l26-qa3" />
      <FxMarker index={4} id="l26-qa4" />
      <div className="l26-qa fx-host qa-row">
        <div className="block definition l26-qa-box">
          <p className="block-title">Definition</p>
          <p>
            The <strong>quadratic approximation</strong> of a scalar-valued function <Tex tex="f" /> near a point <Tex tex={r`\vv a`} /> is:
          </p>
          <div className="l26-qa-lines">
            <Tex display tex={MANY} />
            <Fragment index={5}>
              <Tex display tex={SECOND} />
            </Fragment>
          </div>
        </div>
        <div className="l26-qa-pic">
          <QuadSurfaceFigure steps={{ quad: 2 }} width={435} height={325} />
        </div>
      </div>
      <div className="viz-toggle">
        {STEPS.map(([label, k]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={n === k} onClick={() => setN(k)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
