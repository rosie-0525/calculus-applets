import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import { fmt } from '../components/Slider.jsx';
import { F, S } from '../components/FPanel.jsx';
import { useFragmentShown, useLoopTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, AMBER, pts } from '../components/la.js';

export const R = [-0.35, 2.35];
export const GRID = [0, 1, 2, 3, 4, 5, 6];
// the scalings (d₁, d₂) shown, one animation each
export const SCALINGS = [
  [2, 1],
  [1, 0.5],
  [2, 2],
  [0.5, 2],
];
export const tint = (color, d) => r`\textcolor{${color}}{${fmt(d)}}`;
// d xᵢ, written x_i when d = 1
export const term = (color, d, i) => (d === 1 ? `x_${i}` : `${tint(color, d)}x_${i}`);

/**
 * The scaling by (d₁, d₂), t of the way from the identity: the grid (its vertical lines moved by
 * d₁, its horizontal ones by d₂), the unit square and F in gray, their images in orange and red; on
 * key press `index`, S(e₁) = d₁e₁ (blue) and S(e₂) = d₂e₂ (amber), the columns of its matrix.
 */
export function ScalePanel({ d, t, index }) {
  const a = 1 + (d[0] - 1) * t;
  const b = 1 + (d[1] - 1) * t;
  const f = ([x, y]) => [a * x, b * y];
  const clip = `l15-scale-clip-${index}`;
  return (
    <Plane xRange={R} yRange={R} unit={74} pad={6} grid={false} axes={false} title={`The unit square and the letter F, scaled by ${d[0]} and ${d[1]}`}>
      {(p) => (
        <g>
          <defs>
            <clipPath id={clip}>
              <rect x={0} y={0} width={p.W} height={p.H} rx={10} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clip})`}>
            <g strokeWidth="1.2">
              {GRID.map((k) => (
                <g key={k}>
                  <line x1={p.px(a * k)} y1={p.py(R[0])} x2={p.px(a * k)} y2={p.py(R[1])} stroke="#dbe6f3" />
                  <line x1={p.px(R[0])} y1={p.py(b * k)} x2={p.px(R[1])} y2={p.py(b * k)} stroke="#f6e1cc" />
                </g>
              ))}
            </g>
            <g strokeWidth="1.8">
              <line x1={p.px(R[0])} y1={p.py(0)} x2={p.px(R[1])} y2={p.py(0)} stroke={BLUE} opacity="0.55" />
              <line x1={p.px(0)} y1={p.py(R[0])} x2={p.px(0)} y2={p.py(R[1])} stroke={AMBER} opacity="0.55" />
            </g>
          </g>
          <polygon points={pts(p, S)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points={pts(p, F)} fill="#d1d5db" />
          <polygon points={pts(p, S.map(f))} fill="rgba(242, 179, 122, 0.5)" stroke="#c2702a" strokeWidth="2" strokeLinejoin="round" />
          <polygon points={pts(p, F.map(f))} fill={RED} stroke={RED} strokeWidth="1.5" strokeLinejoin="round" />
          <Fragment as="g" index={index}>
            <Arrow p={p} to={[a, 0]} color={BLUE} width={3.5} head={12} />
            <Arrow p={p} to={[0, b]} color={AMBER} width={3.5} head={12} />
          </Fragment>
          <Dot p={p} at={[0, 0]} color={INK} r={3} />
        </g>
      )}
    </Plane>
  );
}

/**
 * One scaling, shown on key press `step`: its picture, the unit square, F and the grid gliding to
 * their images on a loop from then on (in print mode, the images), with its formula below; on key
 * press step + 1, its matrix on the right and its columns S(e₁), S(e₂) drawn on the picture.
 */
export function Scaling({ d, step }) {
  const ref = useRef(null);
  const live = () => Boolean(ref.current?.closest('section')?.classList.contains('present'));
  const tween = useLoopTween(useFragmentShown(ref), { ms: 1600, delay: 500, hold: 2200, live });
  const t = PRINT ? 1 : tween;
  return (
    <Fragment index={step} className="l15-scale">
      <span ref={ref} className="fragment fx-marker" data-fragment-index={step} aria-hidden="true" />
      <div className="l15-scale-plot">
        <ScalePanel d={d} t={t} index={step + 1} />
      </div>
      <Fragment index={step + 1} className="l15-scale-mat">
        <Tex tex={r`\begin{bmatrix}${tint(BLUE, d[0])}&0\\ 0&${tint(AMBER, d[1])}\end{bmatrix}`} />
      </Fragment>
      <div className="l15-scale-formula">
        <Tex tex={r`S(x_1,x_2)=\begin{bmatrix}${term(BLUE, d[0], 1)}\\ ${term(AMBER, d[1], 2)}\end{bmatrix}`} />
      </div>
    </Fragment>
  );
}

/**
 * Scaling (Christine's first linear function on ℝ²): S multiplies x₁ by d₁ and x₂ by d₂. Four
 * scalings in a 2 × 2 grid, each picture with its formula below it. Key presses 1, 3, 5, 7: each
 * scaling's picture, looping; 2, 4, 6, 8: its matrix, on the right.
 */
export default function Slide02dScaling() {
  return (
    <section className="dense">
      <h2>Scaling</h2>
      <div className="l15-scales">
        {SCALINGS.map((d, k) => (
          <Scaling key={k} d={d} step={2 * k + 1} />
        ))}
      </div>
    </section>
  );
}
