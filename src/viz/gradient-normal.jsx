import { useState } from 'react';
import '../lectures/l12/styles/deck.css';
import Tex, { r } from '../lectures/l12/components/Tex.jsx';
import Slider from '../lectures/l12/components/Slider.jsx';
import { CurvePicture } from '../lectures/l12/components/CurveMap.jsx';
import { PURPLE } from '../lectures/l12/components/Example1.jsx';
import { OnLevel, OnC, X0, A0, SLIDE, RED } from '../lectures/l12/slides/Slide02dRecallNormal.jsx';

export const lecture = 12;

/*
 * Recall: Gradient is perpendicular to the level curves with every step showing, without its
 * statements (the caption says them): Example 1's picture with a point x on the level curve f = 12,
 * ∇f(x), the tangent line and the right angle, and a point a on C with ∇g(a), each moved by its
 * slider. They meet at the top of C, where the level curve touches C.
 */
export default function GradientNormal() {
  const [x, setX] = useState(X0);
  const [a, setA] = useState(A0);
  return (
    <figure className="l12-tangent-fig">
      <CurvePicture>
        {(p) => (
          <g>
            <OnLevel p={p} s={x} />
            <OnC p={p} s={a} />
          </g>
        )}
      </CurvePicture>
      <Slider name="x" label={<Tex tex={r`\vv x`} />} value={x} onChange={setX} color={RED} min={0.05} max={0.95} {...SLIDE} />
      <Slider name="a" label={<Tex tex={r`\vv a`} />} value={a} onChange={setA} color={PURPLE} min={0} max={1} {...SLIDE} />
    </figure>
  );
}
