import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import { PURPLE } from '../components/Example1.jsx';
import { Panel, path, sample, MovingPoint } from '../components/Tangent.jsx';

export const W = 540;
export const H = 330;

// x² − y³ = 0: y = |x|^(2/3), a cusp at the origin; ∇g = (2x, −3y²)
export const CUSP = sample((x) => [x, Math.cbrt(x * x)], -1.4, 1.4, 200);
// x² − y² = 0: the lines y = x and y = −x; ∇g = (2x, −2y). a goes along the upper halves,
// (x, |x|): down y = −x to where they cross, then up y = x
export const SLIDE = { min: -0.9, max: 0.9, step: 0.01, format: () => '' };

/**
 * When ∇g(a) = 0 (the second half of Tangent line to the curve g=c, now combined with Recall:
 * gradient and level curves): if ∇g(a) = 0, the tangent line may not make sense: the cusp
 * x² − y³ = 0 (Example 4's curve) has none at a = 0; key press 1: the two lines x² − y² = 0 cross at
 * a = 0, with no single tangent line. Under each picture, a slider moves a along the curve, with
 * ∇g(a) and the tangent line; a starts at 0 (the still of print mode), where ∇g(a) = 0. Each
 * picture has its curve's equation under it.
 */
export default function Slide02eGradZero() {
  const [x, setX] = useState(0);
  const [u, setU] = useState(0);
  const a = [x, Math.cbrt(x * x)];
  const b = [u, Math.abs(u)];
  return (
    <section>
      <h2>
        When <Tex tex={r`\nabla g(\vv a)=\vv 0`} />
      </h2>

      <p className="l12-tangent-if">
        If <Tex tex={r`\nabla g(\vv a)=\vv 0`} />, the tangent line may not make sense:
      </p>

      <div className="l12-tangent-row">
        <figure className="l12-tangent-fig">
          <Panel range={[-1.65, 1.65, -0.6, 1.3]} w={W} h={H} title="The curve x² − y³ = 0, with a cusp at the origin, a point a on it, the gradient of g at a and the tangent line at a; at the cusp the gradient is zero and there is no tangent line">
            {(p) => (
              <g>
                <path d={path(p, CUSP)} fill="none" stroke={PURPLE} strokeWidth="2.6" strokeLinejoin="round" />
                <MovingPoint p={p} a={a} grad={[2 * a[0], -3 * a[1] * a[1]]} scale={0.22} reach={0.5} zero={[12, 24]} rest={[-17, 18]} />
              </g>
            )}
          </Panel>
          <Slider name="a" label={<Tex tex={r`\vv a`} />} value={x} onChange={setX} color={PURPLE} {...SLIDE} />
          <figcaption>
            <Tex tex={r`x^2-y^3=0`} />: a cusp, no tangent line
          </figcaption>
        </figure>

        <Fragment index={1} as="figure" className="l12-tangent-fig">
          <Panel range={[-1.2, 1.2, -1.1, 1.1]} w={W} h={H} title="The curve x² − y² = 0, two lines crossing at the origin, a point a on them, the gradient of g at a and the tangent line at a; where they cross the gradient is zero and there are two tangent lines">
            {(p) => (
              <g>
                <line x1={p.px(-1.05)} y1={p.py(-1.05)} x2={p.px(1.05)} y2={p.py(1.05)} stroke={PURPLE} strokeWidth="2.6" />
                <line x1={p.px(-1.05)} y1={p.py(1.05)} x2={p.px(1.05)} y2={p.py(-1.05)} stroke={PURPLE} strokeWidth="2.6" />
                <MovingPoint p={p} a={b} grad={[2 * b[0], -2 * b[1]]} scale={0.3} reach={0.5} zero={[18, 7]} rest={[-21, 1]} />
              </g>
            )}
          </Panel>
          <Slider name="a" label={<Tex tex={r`\vv a`} />} value={u} onChange={setU} color={PURPLE} {...SLIDE} />
          <figcaption>
            <Tex tex={r`x^2-y^2=0`} />: two lines cross, no single tangent line
          </figcaption>
        </Fragment>
      </div>
    </section>
  );
}
