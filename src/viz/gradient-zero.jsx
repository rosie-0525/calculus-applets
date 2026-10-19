import { useState } from 'react';
import '../lectures/l12/styles/deck.css';
import Tex, { r } from '../lectures/l12/components/Tex.jsx';
import Slider from '../lectures/l12/components/Slider.jsx';
import { PURPLE } from '../lectures/l12/components/Example1.jsx';
import { Panel, path, MovingPoint } from '../lectures/l12/components/Tangent.jsx';
import { W, H, CUSP, SLIDE } from '../lectures/l12/slides/Slide02eGradZero.jsx';

export const lecture = 12;

/*
 * When ∇g(a) = 0, without its title and its sentence (the caption says it): the cusp x² − y³ = 0
 * and the two lines x² − y² = 0, each with a point a that its slider moves along the curve, ∇g(a)
 * and the tangent line at a; a starts at the origin, where ∇g(a) = 0.
 */
export default function GradientZero() {
  const [x, setX] = useState(0);
  const [u, setU] = useState(0);
  const a = [x, Math.cbrt(x * x)];
  const b = [u, Math.abs(u)];
  return (
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

      <figure className="l12-tangent-fig">
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
      </figure>
    </div>
  );
}
