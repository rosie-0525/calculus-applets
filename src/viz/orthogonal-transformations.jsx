import { useRef, useState } from 'react';
import '../lectures/l21/styles/deck.css';
import useSwing from '../lectures/l21/components/useSwing.js';
import { GREEN, RED } from '../lectures/l21/components/tr.js';
import { NOT, ORTH, Example } from '../lectures/l21/slides/Slide03eOrthTransform.jsx';
import { from } from './redundancies.jsx';

export const lecture = 21;

/*
 * Orthogonal matrices as linear transformations, without its title and its sentence (the caption has
 * it): the 2 × 2 examples of Orthogonal or not? in a T-chart, Not orthogonal on the left (a shear,
 * [1 −1; 1 1], the projection onto the line through (2, 1)), Orthogonal on the right (the rotation by
 * 45°, the reflection across the y-axis, a reflection), each its matrix (the columns red and blue)
 * over its picture: e₁, e₂ (gray, dashed) and Ae₁ (red), Ae₂ (blue), the unit square and F moving to
 * their images, the right-angle mark while Ae₁ ⟂ Ae₂. On the slide the examples come one by one,
 * then all six loop; here they all loop (while the applet is on screen), and a button shows what
 * happens to the unit square, under each side.
 */
export default function OrthogonalTransformations() {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  const swing = useSwing(true, { ms: 1500, hold: 1100, delay: 600, live });
  return (
    <div className="viz-col otr" ref={ref}>
      <div className="l21-ot-chart">
        <p className="l21-ot-head l21-ot-left l21-oq-no">Not orthogonal</p>
        <p className="l21-ot-head l21-ot-right l21-oq-yes">Orthogonal</p>
        <div className="l21-ot-rule" />
        <div className="l21-ot-divider" />
        <div className="l21-ot-row l21-ot-left">
          {NOT.map((ex) => (
            <Example key={ex.opt} ex={ex} color={RED} t={swing} />
          ))}
        </div>
        <div className="l21-ot-row l21-ot-right">
          {ORTH.map((ex) => (
            <Example key={ex.opt} ex={ex} color={GREEN} t={swing} />
          ))}
        </div>
        <p className="l21-ot-says l21-ot-left" style={from(n, 1)}>
          The unit&nbsp;square gets sheared, stretched or squashed.
        </p>
        <p className="l21-ot-says l21-ot-right" style={from(n, 1)}>
          The unit&nbsp;square stays a unit&nbsp;square, possibly rotated or flipped.
        </p>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={n === 1} onClick={() => setN((k) => 1 - k)}>
          {n ? 'Hide' : 'What happens to the unit square?'}
        </button>
      </div>
    </div>
  );
}
