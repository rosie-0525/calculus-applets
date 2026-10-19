import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import { CurvePicture, pointOn } from '../components/CurveMap.jsx';
import { MovingPoint } from '../components/Tangent.jsx';
import { PURPLE } from '../components/Example1.jsx';
import { CONTOURS, CURVE } from '../components/hour27.js';

export const RED = '#8c1515';

// On Example 1's picture, each moved by a slider (the fraction of the way along its curve):
// a point x on the level curve f = 12 that is tangent to C (CONTOURS[5], which runs from left to
// right, so f increases to its left), with ∇f(x), the tangent line and the right angle; it touches
// C at 0.62. And a point a on C (counterclockwise, so outward is to its right), with ∇g(a)
// pointing out of C (g larger outside); the top of C, where it touches the level curve, is at 0.07.
// ∇f(x) is drawn longer than ∇g(a), and the names x and a are turned apart, so that both show when
// x and a meet there.
export const LEVEL12 = CONTOURS[5];
export const X0 = 0.4;
export const A0 = 0.88;
export const SLIDE = { step: 0.002, format: () => '' };

/**
 * Recall: Gradient is perpendicular to the level curves (Recall: gradient and level curves and
 * Tangent line to the curve g=c, combined at the user's request; Lecture 11's statement, without
 * its argument): Mark's statement, in the user's simpler words, beside the picture of Example 1
 * (CurvePicture, CurveMap.jsx), in the same place as on Example 1 and with no fade between them
 * (`l12-curve-stage` and `data-transition="none"` on both), so that it stays put; key press 1: a point x on the level curve f = 12 tangent to C,
 * with ∇f(x) (red), the tangent line and the right angle, and a slider that moves it. Key press 2:
 * "Since the curve g(x) = c is a level set of the function g," (the user's words), the box for
 * g = c, and a point a on C with ∇g(a) (purple) and its own slider. Key press 3: "Well, at least when the tangent
 * line makes sense..." (the user's words), in green, at the bottom of the left column. The sliders start at X0 and A0 (the still
 * of print mode).
 */
export function OnLevel({ p, s }) {
  const { at, tangent } = pointOn(LEVEL12, s);
  return <MovingPoint p={p} a={at} grad={[-tangent[1], tangent[0]]} scale={0.32} reach={0.3} fn="f" color={RED} name="x" turn={-45} />;
}

export function OnC({ p, s }) {
  const { at, tangent } = pointOn(CURVE, s);
  return <MovingPoint p={p} a={at} grad={[tangent[1], -tangent[0]]} scale={0.2} reach={0.3} turn={45} />;
}

export default function Slide02dRecallNormal() {
  const [x, setX] = useState(X0);
  const [a, setA] = useState(A0);
  return (
    <section data-transition="none">
      <h2>Recall: Gradient is perpendicular to the level curves</h2>

      <div className="stage l12-curve-stage">
        <div className="stage-text">
          <div className="block theorem">
            <p>
              The gradient <Tex tex={r`\nabla f(\vv a)`} /> of a function is perpendicular to the tangent line to the level
              curve through <Tex tex={r`\vv a`} />.
            </p>
          </div>
          <Fragment index={2}>
            <p className="l12-particular">
              Since the curve <Tex tex={r`g(\vv x)=c`} /> is a level set of the function <Tex tex="g" />,
            </p>
            {/* in purple, the colour of g, to set it apart from the recall */}
            <div className="block l12-box-g">
              <p>
                The tangent line to <Tex tex="g=c" /> is perpendicular to <Tex tex={r`\nabla g(\vv a)`} />.
              </p>
            </div>
          </Fragment>
          <Fragment index={3} as="p" className="l12-tangent-caveat">
            Well, at least when the tangent line makes sense...
          </Fragment>
        </div>

        <figure className="stage-fig l12-tangent-fig">
          <CurvePicture>
            {(p) => (
              <g>
                <Fragment as="g" index={1}>
                  <OnLevel p={p} s={x} />
                </Fragment>
                <Fragment as="g" index={2}>
                  <OnC p={p} s={a} />
                </Fragment>
              </g>
            )}
          </CurvePicture>
          <Fragment index={1}>
            <Slider name="x" label={<Tex tex={r`\vv x`} />} value={x} onChange={setX} color={RED} min={0.05} max={0.95} {...SLIDE} />
          </Fragment>
          <Fragment index={2}>
            <Slider name="a" label={<Tex tex={r`\vv a`} />} value={a} onChange={setA} color={PURPLE} min={0} max={1} {...SLIDE} />
          </Fragment>
        </figure>
      </div>
    </section>
  );
}
