import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import { I, B, MAIN } from '../components/svgmath.jsx';
import { PRINT } from '../components/print.js';

export const RED = '#8c1515';
export const FIELD = '#6b9aa6';
export const INK = '#14213d';
export const K = 0.25; // the arrows are drawn at 1/4 of their length
export const RANGE = [-3.5, 3.5];
export const UNIT = 40;
export const PAD = 12;
export const grad = ([x, y]) => [y, x]; // the gradient of f(x, y) = xy
export const POINTS = [];
for (let x = -3; x <= 3; x += 1) for (let y = -3; y <= 3; y += 1) POINTS.push([x, y]);
export const num = (v) => String(v).replace('-', '−');

/**
 * The gradient of f(x, y) = xy as a picture: the vector ∇f(x, y) = (y, x) drawn at each point of the
 * grid (at 1/4 of its length), and a point a that the mouse moves (to halves), with ∇f(a) in red
 * and its value under the picture. The PDF shows a = (2, 3).
 */
export function GradientField() {
  const [a, setA] = useState([2, 3]);
  const move = (e) => {
    if (PRINT || (!(e.buttons & 1) && e.type !== 'pointerdown')) return;
    const svg = e.currentTarget.querySelector('svg');
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const X = ((e.clientX - rect.left) / rect.width) * vb.width;
    const Y = ((e.clientY - rect.top) / rect.height) * vb.height;
    const snap = (v) => Math.max(-3, Math.min(3, Math.round(2 * v) / 2));
    setA([snap(RANGE[0] + (X - PAD) / UNIT), snap(RANGE[1] - (Y - PAD) / UNIT)]);
  };
  const g = grad(a);
  const tip = [a[0] + K * g[0], a[1] + K * g[1]];
  const len = Math.hypot(...g) || 1;
  return (
    <div className="l10-grad-fig" onPointerDown={move} onPointerMove={move} data-prevent-swipe>
      <Plane xRange={RANGE} yRange={RANGE} unit={UNIT} pad={PAD} grid={false} title="The gradient of f(x, y) = xy, the vector (y, x), drawn at each point (x, y) of a grid, and at a point a in red">
        {(p) => (
          <g>
            {POINTS.map((q) => (
              <Arrow key={q.join()} p={p} from={q} to={[q[0] + K * grad(q)[0], q[1] + K * grad(q)[1]]} color={FIELD} width={1.6} head={7} />
            ))}
            <Arrow p={p} from={a} to={tip} color={RED} width={3.5} head={Math.min(13, 0.45 * K * len * UNIT)} />
            <Dot p={p} at={a} color={INK} r={5.5} stroke="#fff" strokeWidth="1.5" />
            <text
              x={Math.min(p.W - 30, Math.max(30, p.px(tip[0]) + (14 * g[0]) / len))}
              y={Math.min(p.H - 8, Math.max(20, p.py(tip[1]) - (14 * g[1]) / len + 6))}
              textAnchor="middle"
              fontSize="18"
              fontFamily={MAIN}
              fill={RED}
              className="map-label"
            >
              ∇<I>f</I>(<B>a</B>)
            </text>
            <text x={p.px(a[0]) - 10} y={p.py(a[1]) + 20} textAnchor="end" fontSize="18" fontFamily={MAIN} fill={INK} className="map-label">
              <B>a</B>
            </text>
          </g>
        )}
      </Plane>
      <p>
        <Tex tex={r`\vv a=(${num(a[0])},${num(a[1])})`} />
      </p>
      <p>
        <Tex tex={r`\nabla f(\vv a)=\begin{bmatrix}${num(g[0])}\\ ${num(g[1])}\end{bmatrix}`} />
      </p>
    </div>
  );
}

/**
 * Gradient: Mark's definition alone (the linear approximation comes after Slide03Steps.jsx).
 * Key press 1: ∇f: ℝⁿ → ℝⁿ is a vector-valued function; 2: one example, f(x, y) = x² + 2y² + xy (the
 * function of Example 1), ∇f(x, y) = (∂f/∂x, ∂f/∂y); 3: = (2x + y, x + 4y); 4: its value at (2, −1)
 * (Example 1 asks for (1, 1)). The picture of ∇(xy), GradientField, is commented out for now.
 */
export default function Slide04Gradient() {
  return (
    <section className="dense">
      <h2>Gradient</h2>

      <div className="l10-grad-cols">
        <div className="l10-grad-left">
          <div className="block definition">
            <p className="block-title">Definition</p>
            <p>
              The <strong>gradient</strong> of a function <Tex tex={r`f:\mathbb R^n\to\mathbb R`} /> is{' '}
              <Tex tex={r`\nabla f=\begin{bmatrix}\frac{\partial f}{\partial x_1}\\[2pt] \vdots\\[2pt] \frac{\partial f}{\partial x_n}\end{bmatrix}`} />.
            </p>
          </div>

          <Fragment index={1} as="p" className="l10-grad-note">
            <Tex tex={r`\nabla f:\mathbb R^n\to\mathbb R^n`} /> is a <strong>vector-valued function</strong>.
          </Fragment>

          <Fragment index={2} as="p">
            e.g. <Tex tex={r`f(x,y)=x^2+2y^2+xy`} />:
          </Fragment>
          <div className="l10-grad-ex">
            <div className="l10-grad-eq">
              <Fragment index={2}>
                <Tex display tex={r`\nabla f(x,y)=\begin{bmatrix}\frac{\partial f}{\partial x}\\[6pt] \frac{\partial f}{\partial y}\end{bmatrix}`} />
              </Fragment>
              <Fragment index={3}>
                <Tex display tex={r`{}=\begin{bmatrix}2x+y\\ x+4y\end{bmatrix}`} />
              </Fragment>
            </div>
            <Fragment index={4}>
              <Tex display tex={r`\nabla f(2,-1)=\begin{bmatrix}3\\ -2\end{bmatrix}`} />
            </Fragment>
          </div>
        </div>

        {/* the picture of ∇(xy), a vector at each point, with a point a the mouse moves (removed for now)
        <Fragment index={3} as="div">
          <GradientField />
        </Fragment> */}
      </div>
    </section>
  );
}
