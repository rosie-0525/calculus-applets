import { useRef, useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex from '../lectures/l26/components/Tex.jsx';
import { QuadLineFigure } from '../lectures/l26/components/QuadFigures.jsx';
import { TAYLOR } from '../lectures/l26/slides/Slide02RecallLinear.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 26;

// the buttons: the key press of the slide each one shows
const STEPS = [
  ['Linear', 2],
  ['Quadratic', 3],
];

/*
 * Recall: linear and quadratic approximation, without its title and its two sentences (the caption
 * has them): the graph of f(x) = 1.5 + sin(x − 1) (QuadLineFigure), a and (a, f(a)) in it, and under
 * it the Taylor expansion of f at a. On the slide the tangent line comes on a key press, the first two
 * terms of the expansion lighting up gold with their brace, "a line", then the parabola, the first
 * three terms red with theirs, "a parabola", the line faint; here Linear and Quadratic show those two
 * steps (useFragmentSteps), and a click on the button that is down goes back to the graph alone.
 */
export default function TaylorExpansion() {
  const ref = useRef(null);
  const [n, setN] = useState(1);
  useFragmentSteps(ref, n);
  return (
    <div className="viz-col te" ref={ref}>
      <div className="l26-ta-fig">
        <QuadLineFigure steps={{ a: 1, line: 2, quad: 3 }} unit={64} />
      </div>
      <span className="fragment fx-marker" data-fragment-index={2} data-fx="l26-ta-l" aria-hidden="true" />
      <span className="fragment fx-marker" data-fragment-index={3} data-fx="l26-ta-q" aria-hidden="true" />
      <Tex display className="l26-ta" tex={TAYLOR} />
      <div className="viz-toggle">
        {STEPS.map(([label, k]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={n === k} onClick={() => setN((m) => (m === k ? 1 : k))}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
