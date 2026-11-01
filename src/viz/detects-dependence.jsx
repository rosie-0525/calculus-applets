import { useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex, { r } from '../lectures/l20/components/Tex.jsx';
import Space from '../lectures/l20/components/Space.jsx';
import { useGlide } from '../lectures/l20/components/useFragmentTween.js';
import { W1, W2, W3, V3, fit, floorCorners } from '../lectures/l20/components/gs.js';
import { Lowering } from '../lectures/l20/slides/Slide13Detects.jsx';

export const lecture = 20;

const BOX = { width: 500, height: 360, ...fit([[0, 0, 0], W1, W2, V3, W3, ...floorCorners()], 500, 360, { pad: 26 }), axes: false };

/*
 * Gram–Schmidt detects linear dependence, without its title and its five vectors (five-vectors.jsx):
 * the question, what if v₃ ∈ V₂?, beside the floor V₂ with w₁ and w₂, v₃ above it with
 * Proj_{V₂}(v₃) and w₃; v₃ glides down into V₂ and w₃ shrinks to 0, and the answer comes, on its
 * amber card: w_i = 0 ⟺ v_i is redundant. The 3-D picture rocks while the applet is on screen and
 * turns when dragged. On the slide these come on a key press; here the button lowers v₃, and lifts
 * it back on the next click.
 */
export default function DetectsDependence() {
  const [down, setDown] = useState(false);
  const [t] = useGlide(down ? 1 : 0, 2200);
  return (
    <div className="viz-col">
      <div className="stage dd-stage">
        <div className="stage-text">
          <p className="question l20-what-if">
            What if <Tex tex={r`\vv v_3\in V_2=\operatorname{span}\{\vv v_1,\vv v_2\}`} />?
          </p>
          <div className="l20-key" style={{ opacity: t > 0.99 ? 1 : 0, transition: 'opacity 0.35s ease' }}>
            <span className="l20-key-main">
              <Tex tex={r`\vv w_i=\vv 0\iff\vv v_i`} /> is redundant
            </span>
            <span className="l20-key-sub">
              i.e. <Tex tex={r`\vv v_i`} /> is a linear combination of <Tex tex={r`\vv v_1,\dots,\vv v_{i-1}`} />
            </span>
          </div>
        </div>
        <div className="stage-fig">
          <Space {...BOX} title="v3 lowered into the plane V2: w3 shrinks to 0">
            {(s) => <Lowering s={s} t={t} />}
          </Space>
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={down} onClick={() => setDown((v) => !v)}>
          {down ? 'Lift v₃ out of V₂' : 'Lower v₃ into V₂'}
        </button>
      </div>
    </div>
  );
}
