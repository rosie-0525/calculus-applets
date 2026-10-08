import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Dot3, Label3, PlanePatch } from '../components/Space.jsx';

export const INK = '#14213d';
export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const AMBER = '#b45309';

/* ---------- a helix ---------- */

export const T_MAX = 4 * Math.PI; // two turns
export const helix = (t) => [Math.cos(t), Math.sin(t), t / 4];
export const SAMPLES = Array.from({ length: 241 }, (_, k) => (T_MAX * k) / 240);

/** One component of p: its graph for 0 ≤ t ≤ 4π, with the time t marked. */
export function Component({ name, at, lo, hi, t, color }) {
  const W = 300;
  const H = 58;
  const px = (s) => 4 + (s / T_MAX) * (W - 8);
  const py = (v) => H - 5 - ((v - lo) / (hi - lo)) * (H - 10);
  const d = SAMPLES.map((s, k) => `${k ? 'L' : 'M'}${px(s).toFixed(1)},${py(at(s)).toFixed(1)}`).join('');
  const zero = py(Math.max(lo, Math.min(hi, 0)));
  return (
    <div className="vex-comp">
      <span className="vex-comp-name" style={{ color }}>
        <Tex tex={name} />
      </span>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${name} for t from 0 to 4π`}>
        <line x1={4} x2={W - 4} y1={zero} y2={zero} stroke="#d5dbe1" />
        <path d={d} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx={px(t)} cy={py(at(t))} r="4.5" fill={color} stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/** The helix for 0 ≤ t ≤ 4π (solid up to t, faint after), with the point p(t). */
export function HelixFigure({ t }) {
  const P = helix(t);
  const pts = (s, from, to) => {
    const n = Math.max(2, Math.ceil(((to - from) / T_MAX) * 240));
    return Array.from({ length: n + 1 }, (_, k) => s.P(helix(from + ((to - from) * k) / n)).map((v) => v.toFixed(1)).join(',')).join(' ');
  };
  const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };
  return (
    <Space
      className="vex-fig"
      width={390}
      height={330}
      unit={66}
      center={[0.5, 0.84]}
      axisLen={[1.7, 1.7, 3.3]}
      az={-30}
      el={20}
      swing={10}
      title="The helix p(t) = (cos t, sin t, t/4) for t from 0 to 4π, with the point p(t)"
    >
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, 0]} e={[1, 0, 0]} e2={[0, 1, 0]} range={[-1.5, 1.5]} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <polyline points={pts(s, 0, T_MAX)} fill="none" stroke="#9aa5b1" strokeWidth="1.8" strokeDasharray="5 5" />
          {t > 0 && <polyline points={pts(s, 0, t)} fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />}
          <Dot3 s={s} at={P} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />
          <Label3 s={s} at={P} dx={12} dy={-8} color={INK} size={17} {...halo}>
            p(t)
          </Label3>
        </g>
      )}
    </Space>
  );
}

/**
 * Vector-valued functions (Mark's box). Under it, the example of a helix, one step per key press:
 * 1: "e.g. p(t) = (cos t, sin t, t/4)"; 2: "This is a vector-valued function ℝ → ℝ³" (the same
 * curve as slide 19's f); 3: the helix for 0 ≤ t ≤ 4π with the point p(t) and its value in the
 * corner, "A helix" under it, and a slider for t; 4: the three components cos t, sin t, t/4, each a
 * scalar-valued function of t, as graphs. Lines 1 and 2 are right below the box, on the left, with
 * the slider under them; the helix in the middle, the components on the right. The photo follows on slide 17c.
 */
export default function Slide17Functions() {
  const [t, setT] = useState(7);
  const [x, y, z] = helix(t);
  const two = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);

  return (
    <section className="dense">
      <h2>Vector-valued functions</h2>

      <div className="block definition fn-def">
        <p>
          A <strong>vector-valued</strong> function is a function <Tex tex={r`\vv{f}:\mathbb{R}^n\to\mathbb{R}^m`} /> with{' '}
          <Tex tex="m>1" />:
        </p>
        <Tex
          display
          tex={r`\vv{x}=\begin{bmatrix}x_1\\ \vdots\\ x_n\end{bmatrix}=(x_1,\ldots,x_n)
                 \quad\longmapsto\quad
                 \vv{f}(\vv{x})=\begin{bmatrix}f_1(\vv{x})\\ \vdots\\ f_m(\vv{x})\end{bmatrix}=\bigl(f_1(\vv{x}),\ldots,f_m(\vv{x})\bigr).`}
        />
        <p>
          Each <Tex tex="f_i" /> is a scalar-valued function of <Tex tex={r`\vv{x}`} />, called a{' '}
          <strong>component</strong> of <Tex tex={r`\vv{f}`} />.
        </p>
      </div>

      <div className="vex-row helix-row">
        <div className="vex-side helix-side helix-intro">
          <Fragment index={1} as="p">
            e.g. <Tex tex={r`\vv{p}(t)=(\cos t,\sin t,t/4)`} />
          </Fragment>
          <Fragment index={2} as="p">
            This is a vector-valued function <Tex tex={r`\mathbb{R}\to\mathbb{R}^3`} />.
          </Fragment>
          <Fragment index={3} className="vex-slider">
            <Slider name="t" label={<Tex tex="t" />} value={t} onChange={setT} color={INK} min={0} max={Number(T_MAX.toFixed(2))} step={0.01} format={(v) => v.toFixed(2)} />
          </Fragment>
        </div>
        <Fragment index={3} as="figure" className="helix-fig">
          <div className="helix-plot">
            <HelixFigure t={t} />
            <p className="helix-readout">
              <Tex tex={r`\vv{p}(${t.toFixed(2)})=(${two(x)},\ ${two(y)},\ ${two(z)})`} />
            </p>
          </div>
          <figcaption>
            <strong>A helix</strong>
          </figcaption>
        </Fragment>
        <div className="vex-side helix-side">
          <Fragment index={4}>
            <p>Each component is a scalar-valued function:</p>
            <div className="vex-comps">
              <Component name={r`\cos t`} at={Math.cos} lo={-1.1} hi={1.1} t={t} color={TEAL} />
              <Component name={r`\sin t`} at={Math.sin} lo={-1.1} hi={1.1} t={t} color={CARDINAL} />
              <Component name="t/4" at={(u) => u / 4} lo={0} hi={Math.PI} t={t} color={AMBER} />
            </div>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
