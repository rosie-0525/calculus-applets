import { useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import { useGlide } from '../lectures/l21/components/useFragmentTween.js';
import { BLUE, RED } from '../lectures/l21/components/tr.js';
import { AnglePicture, ORTH, NOT_ORTH } from '../lectures/l21/slides/Slide19Angles.jsx';
import { from } from './redundancies.jsx';

export const lecture = 21;

/**
 * One of the slide's two pictures: x and y and the angle θ between them, and a button taking them to
 * Ax and Ay along the slide's path of matrices (and back).
 */
function Side({ M, color, keep, gap, name, children }) {
  const [on, setOn] = useState(false);
  const [t] = useGlide(on ? 1 : 0, 1800);
  return (
    <figure className="la-side">
      <AnglePicture M={M} t={t} color={color} keep={keep} index={0} gap={gap} />
      <figcaption>
        <p className="l21-ang-cap">{name}</p>
        <div className="viz-toggle">
          <button type="button" className="viz-button" aria-pressed={on} onClick={() => setOn((v) => !v)}>
            {on ? 'Back to x and y' : 'Apply A'}
          </button>
        </div>
        {/* under the button, so that the two buttons line up */}
        {children && (
          <p className="l21-ang-cap l21-ang-gap" style={from(t > 0.6 ? 1 : 0, 1)}>
            {children}
          </p>
        )}
      </figcaption>
    </figure>
  );
}

/*
 * Orthogonal matrices preserve lengths and angles, without its title and its boxes (the caption has
 * them): the slide's two pictures side by side. On the left, A orthogonal (the rotation by −120°,
 * through rotations, blue): x and y go to Ax and Ay, θ unchanged. On the right, A not orthogonal
 * (red): ‖Ax‖ = ‖x‖ and ‖Ay‖ = ‖y‖ kept, x and y each turning on its own circle, but the angle opens
 * from 45° to 100°; x − y and A(x − y), dashed blue, and under its button, once Ax and Ay arrive,
 * "The length of x − y is not preserved." On the slide the right picture takes the left one's place
 * on a key press, and each plays once; here each has its button, which plays it there and back.
 */
export default function LengthsAngles() {
  return (
    <div className="la">
      <Side M={ORTH} color={BLUE} keep name={<><Tex tex="A" /> orthogonal</>} />
      <Side M={NOT_ORTH} color={RED} gap={0} name={<><Tex tex="A" /> not orthogonal</>}>
        The length of <Tex tex={r`\vv x-\vv y`} /> is not preserved.
      </Side>
    </div>
  );
}
