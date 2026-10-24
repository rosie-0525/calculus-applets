import { useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import RotationPicture from '../components/Rotation.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

/**
 * Rotations of ℝ²: the notation R_θ (Section 14.4), with v and R_θ(v) on the picture; R_θ is
 * linear because (the Linearity Principle, as the textbook argues; the equations only). Key press 1:
 * R_θ(v + w) = R_θ(v) + R_θ(w); 2: the picture (the textbook's Figure 14.4.1) builds its left side:
 * v + w (the parallelogram's diagonal), then R_θ(v + w); 3: its right side, R_θ(v) and R_θ(w), then
 * their parallelogram, whose diagonal is R_θ(v + w) (the user's request); 4: R_θ(cv) = c R_θ(v); 5: its
 * left side (cv, then R_θ(cv); the parallelograms fade out); 6: its right side (R_θ(v), then
 * c R_θ(v)). A slider for θ. Its matrix is on the next slide. (The box "R_θ is linear" was removed.)
 */
export default function Slide07Rotations() {
  const [theta, setTheta] = useState(40);
  const pairRef = useRef(null);
  const splitRef = useRef(null);
  const scaleRef = useRef(null);
  const scaleSplitRef = useRef(null);
  const pairShown = useFragmentShown(pairRef);
  const splitShown = useFragmentShown(splitRef);
  const done = (t) => (PRINT ? 1 : t);
  const staged = {
    sum: done(useTween(pairShown, { ms: 700, delay: 300 })),
    turn: done(useTween(pairShown, { ms: 1500, delay: 1300 })),
    splitIndex: 3,
    turnParts: done(useTween(splitShown, { ms: 1500, delay: 300 })),
    add: done(useTween(splitShown, { ms: 700, delay: 2000 })),
  };
  const scaleShown = useFragmentShown(scaleRef);
  const scaleSplitShown = useFragmentShown(scaleSplitRef);
  const scaled = {
    grow: done(useTween(scaleShown, { ms: 900, delay: 300 })),
    turn: done(useTween(scaleShown, { ms: 1500, delay: 1400 })),
    splitIndex: 6,
    turnV: done(useTween(scaleSplitShown, { ms: 1500, delay: 300 })),
    stretch: done(useTween(scaleSplitShown, { ms: 900, delay: 2000 })),
  };
  return (
    <section className="dense">
      <h2>
        Rotations of <Tex tex={r`\mathbb R^2`} />
      </h2>
      <span ref={pairRef} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />
      <span ref={splitRef} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
      <span ref={scaleRef} className="fragment fx-marker" data-fragment-index={5} aria-hidden="true" />
      <span ref={scaleSplitRef} className="fragment fx-marker" data-fragment-index={6} aria-hidden="true" />

      <div className="stage l14-rot-stage">
        <div className="stage-text">
          <p>
            <Tex tex={r`R_\theta(\vv v)`} /> = the rotation of <Tex tex={r`\vv v`} /> counterclockwise by{' '}
            <Tex tex={r`\theta`} /> around <Tex tex={r`\vv 0`} />.
          </p>

          <Fragment index={1} className="l14-why">
            <p className="l14-why-label">
              <Tex tex={r`R_\theta`} /> is linear because
            </p>
            <ul className="bullets">
              <li>
                <Tex tex={r`R_\theta(\vv v+\vv w)=R_\theta(\vv v)+R_\theta(\vv w)`} />
              </li>
              <Fragment index={4} as="li">
                <Tex tex={r`R_\theta(c\vv v)=c\,R_\theta(\vv v)`} />
              </Fragment>
            </ul>
          </Fragment>
        </div>

        <div className="stage-fig l14-rot-fig">
          <RotationPicture
            theta={theta}
            single={{ fadeAt: 2 }}
            pair={{ index: 2, fadeAt: 5, staged }}
            scale={{ index: 5, staged: scaled }}
            unit={132}
          />
          <div className="l14-rot-controls">
            <Slider name="θ" label={<Tex tex={r`\theta`} />} value={theta} onChange={setTheta} min={0} max={360} step={1} format={(v) => `${v}°`} />
          </div>
        </div>
      </div>
    </section>
  );
}
