import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { Arrow, RightAngle } from '../components/Plane.jsx';
import { CubicContour, NamedPoint, cubicGrad } from '../components/Cubic.jsx';
import { B, I, MAIN } from '../components/svgmath.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const RED = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GRAY = '#6b7280';
export const LEN = 1.2; // the arrow's length: it shows the direction of the gradient
export const unit = ([u, v]) => {
  const n = Math.hypot(u, v);
  return [u / n, v / n];
};
export const A = [1, 0]; // the point a, on the level curve x³ + xy + y² = 1 (the one at (−2, −1) is Example 2 (continued))
export const G = unit(cubicGrad(...A)); // the direction of ∇f(1, 0) = (3, 1)
export const TIP = [A[0] + LEN * G[0], A[1] + LEN * G[1]];
export const TDIR = unit([-1, 3]); // along the tangent line 3(x − 1) + y = 0, perpendicular to ∇f(1, 0)

/** The point of the level curve x³ + xy + y² = 1 at height y > 0 (Newton: x³ + yx + y² − 1 rises in x). */
export function onCurve(y) {
  let x = 1;
  for (let k = 0; k < 30; k += 1) x -= (x ** 3 + y * x + y * y - 1) / (3 * x * x + y);
  return [x, y];
}
export const Y0 = 1.25; // x glides along the level curve from (−0.42, 1.25) to (0.80, 0.4), close to a
export const Y1 = 0.4;

/** The point x on the level curve, the segment from a to it, and their labels; t = 0 far, 1 close. */
export function MovingX({ p, t }) {
  const X = onCurve(Y0 + t * (Y1 - Y0));
  return (
    <g>
      <line x1={p.px(A[0])} y1={p.py(A[1])} x2={p.px(X[0])} y2={p.py(X[1])} stroke={GRAY} strokeWidth="2" strokeDasharray="5 4" />
      <NamedPoint p={p} at={X} />
      <text x={p.px(X[0]) - 10} y={p.py(X[1]) - 4} textAnchor="end" fontSize="19" fontFamily={MAIN} fill={INK} className="map-label">
        <B>x</B>
      </text>
    </g>
  );
}

/**
 * Gradient and level curves: Mark's statement (→ Theorem 11.2.1), with Example 2's contour plot,
 * the point a = (1, 0) and the arrow ∇f(a) (its direction). Key press 1: Why? (the linear
 * approximation, Section 11.4), and a point x of the level curve through a, which glides along it
 * close to a (the PDF shows it close); 2: the tangent line ∇f(a) · (x − a) = 0, in a
 * box, and on the plot with its right angle.
 */
export default function Slide09Normal2D() {
  const marker = useRef(null);
  const tween = useTween(useFragmentShown(marker), { ms: 2200, delay: 400 });
  const t = PRINT ? 1 : tween;

  return (
    <section className="dense">
      <h2>Gradient and level curves</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block theorem">
            <p>
              The gradient of the function <Tex tex={r`f:\mathbb R^2\to\mathbb R`} /> at a point <Tex tex={r`\vv a`} /> is
              perpendicular to the tangent line to the level curve that passes through <Tex tex={r`\vv a`} />.
            </p>
            <p className="pointer right">(→ Theorem 11.2.1)</p>
          </div>

          <span ref={marker} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
          <Fragment index={1}>
            <p>
              <strong>Why?</strong> For <Tex tex={r`\vv x`} /> on the level curve, near <Tex tex={r`\vv a`} />: <Tex tex={r`f(\vv x)=f(\vv a)`} />, and
            </p>
            <Tex display tex={r`f(\vv x)\approx f(\vv a)+\nabla f(\vv a)\cdot(\vv x-\vv a),\ \text{ so }\ \nabla f(\vv a)\cdot(\vv x-\vv a)\approx 0.`} />
          </Fragment>

          <Fragment index={2}>
            <div className="block theorem">
              <p>
                The tangent line to the level curve through <Tex tex={r`\vv a`} /> is
              </p>
              <Tex display tex={r`\nabla f(\vv a)\cdot(\vv x-\vv a)=0.`} />
            </div>
          </Fragment>
        </div>

        <CubicContour title="Contour plot of f(x, y) = x³ + xy + y² with the point a = (1, 0), the gradient there, and a point x of the level curve through a">
          {(p) => (
            <g>
              <Fragment as="g" index={2}>
                <line
                  x1={p.px(A[0] - 1.6 * TDIR[0])}
                  y1={p.py(A[1] - 1.6 * TDIR[1])}
                  x2={p.px(A[0] + 1.6 * TDIR[0])}
                  y2={p.py(A[1] + 1.6 * TDIR[1])}
                  stroke={TEAL}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <RightAngle p={p} at={A} a={[A[0] + TDIR[0], A[1] + TDIR[1]]} b={[A[0] + G[0], A[1] + G[1]]} color={TEAL} size={12} />
              </Fragment>
              <Fragment as="g" index={1}>
                <MovingX p={p} t={t} />
              </Fragment>
              <Arrow p={p} from={A} to={TIP} color={RED} width={3} head={12} />
              <text x={p.px(TIP[0]) + 4} y={p.py(TIP[1]) - 10} textAnchor="middle" fontSize="18" fontFamily={MAIN} fill={RED} className="map-label">
                ∇<I>f</I>(<B>a</B>)
              </text>
              <NamedPoint p={p} at={A} />
              <text x={p.px(A[0]) - 10} y={p.py(A[1]) + 18} textAnchor="end" fontSize="19" fontFamily={MAIN} fill={INK} className="map-label">
                <B>a</B>
              </text>
            </g>
          )}
        </CubicContour>
      </div>
    </section>
  );
}
