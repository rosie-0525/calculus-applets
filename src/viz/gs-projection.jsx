import { useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import { GSBasisPicture } from '../lectures/l21/components/GSProj.jsx';
import { sumW, projV } from '../lectures/l21/slides/Slide01eGSProjection.jsx';

export const lecture = 21;

/*
 * The projection at each step, without its title, its first sentence and its box (the caption has
 * them): a plane V with w₁ and w₂ (green), a vector v above it and Proj_V v (teal); the two
 * projections Proj_{w₁} v and Proj_{w₂} v (blue) and their dashed parallelogram, whose far corner is
 * their sum. Dragging anywhere on the picture turns w₂ and changes the angle between w₁ and w₂; under
 * the picture, the verdict: = at 90°, ≠ elsewhere. On the slide the projections and the verdict come
 * on a key press; here they are there from the start. The picture rocks while the applet is on
 * screen.
 */
export default function GSProjection() {
  const [theta, setTheta] = useState(90);
  const equal = Math.abs(theta - 90) < 0.5;
  return (
    <div className="viz-col gsp">
      <p className="viz-hint">Drag the picture to turn w₂.</p>
      <GSBasisPicture theta={theta} onTheta={setTheta} sumAt={0} width={560} height={420} />
      <p className="l21-stack l21-gs-verdict">
        <span className="l21-gs-fade" style={{ opacity: equal ? 1 : 0 }}>
          <Tex tex={r`${sumW}=${projV}`} />
        </span>
        <span className="l21-gs-fade" style={{ opacity: equal ? 0 : 1 }}>
          <Tex tex={r`${sumW}\ne${projV}`} />
        </span>
      </p>
      <div className="viz-toggle">
        <button type="button" className="viz-button" disabled={equal} onClick={() => setTheta(90)}>
          Back to a right angle
        </button>
      </div>
    </div>
  );
}
