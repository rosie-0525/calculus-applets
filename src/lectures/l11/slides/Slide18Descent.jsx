import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import Ticks from '../components/Ticks.jsx';
import Slider from '../components/Slider.jsx';
import { lineColor } from '../components/levels.js';
import { B, Sub, MAIN } from '../components/svgmath.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

// the textbook's Example 11.3.5: f(x, y) = x² − 3xy + 3y² + 5y + 2x, from (0, 0), with t = 0.1; it
// converges for t < 2/7.61 ≈ 0.26 (7.61 is the larger eigenvalue of the Hessian), so the slider's
// top end, 0.3, diverges
export const f = (x, y) => x * x - 3 * x * y + 3 * y * y + 5 * y + 2 * x;
export const grad = (x, y) => [2 * x - 3 * y + 2, -3 * x + 6 * y + 5];
export const T = 0.1;
export const N = 100; // the number of steps
export const FAR = 50; // a run stops once the point is this far from (0, 0)
export const START = [0, 0];
export const step = ([x, y], t) => {
  const [gx, gy] = grad(x, y);
  return [x - t * gx, y - t * gy];
};
export const STEPS = [START]; // print mode: t = 0.1, after N steps
for (let n = 0; n < N; n += 1) STEPS.push(step(STEPS[n], T));
export const MIN = [-9, -16 / 3];
export const BOX = [
  [-11, 1.5],
  [-7, 1],
];
export const LEVELS = [-22, -20, -16, -10, -2, 8, 20];
export const RED = '#8c1515';
export const INK = '#14213d';
export const blur = (e) => e.currentTarget.blur();

/**
 * Gradient descent: Mark's definition as one sentence (repeatedly replacing a → a − t ∇f(a) to find the
 * minimum); under it, two bullets: to find the maximum, use a → a + t ∇f(a); t is the learning rate. Key press
 * 1: the textbook's Example 11.3.5, f(x, y) = x² − 3xy + 3y² + 5y + 2x, its contour plot, on which
 * gradient descent runs from (0, 0) for 100 steps (slowly at first) towards the minimum (−9, −16/3);
 * under it, a slider for the learning rate t (a change starts a new run), Replay, the step number
 * and f(a). The PDF shows t = 0.1 after 100 steps.
 */
export default function Slide18Descent() {
  const marker = useRef(null);
  const shown = useFragmentShown(marker);
  const [rate, setRate] = useState(T);
  const [run, setRun] = useState(0);
  const [pts, setPts] = useState(() => (PRINT ? STEPS : [START]));

  useEffect(() => {
    if (PRINT) return undefined;
    setPts([START]);
    if (!shown) return undefined;
    let cur = [START];
    let timer;
    const tick = () => {
      cur = [...cur, step(cur[cur.length - 1], rate)];
      setPts(cur);
      if (cur.length <= N && Math.hypot(...cur[cur.length - 1]) < FAR) timer = setTimeout(tick, cur.length < 5 ? 450 : 70);
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [shown, rate, run]);

  const a = pts[pts.length - 1];
  const path = (p) => pts.map(([u, v], n) => `${n ? 'L' : 'M'}${p.px(u).toFixed(1)},${p.py(v).toFixed(1)}`).join('');
  return (
    <section className="dense">
      <h2>Gradient descent</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block definition">
            <p className="block-title">Definition</p>
            <p>The algorithm of repeatedly replacing</p>
            <Tex display tex={r`\vv a\ \longrightarrow\ \vv a-t\,\nabla f(\vv a)`} />
            <p>
              to find the minimum of <Tex tex="f" /> is called <strong>gradient descent</strong>.
            </p>
          </div>

          <ul className="bullets l10-gd-notes">
            <li>
              To find the maximum, use <Tex tex={r`\vv a\to\vv a+t\,\nabla f(\vv a)`} />.
            </li>
            <li>
              In the context of machine learning, <Tex tex="t" /> is called the <strong>learning rate</strong>.
            </li>
          </ul>
          <span ref={marker} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
        </div>

        <Fragment index={1} className="l10-gd-fig">
          <p className="l10-gd-f">
            <Tex tex={r`f(x,y)=x^2-3xy+3y^2+5y+2x`} />
          </p>
          <ContourPlot
            f={f}
            x={BOX[0]}
            y={BOX[1]}
            size={[460, 300]}
            pad={[6, 8, 26, 30]}
            n={160}
            levels={LEVELS}
            color={(c) => lineColor(0.25 + (0.75 * (c + 22)) / 42)}
            labels={(c) => String(c).replace('-', '−')}
            labelSize={12}
            title="Contour plot of f(x, y) = x² − 3xy + 3y² + 5y + 2x, long thin ellipses around the minimum (−9, −16/3), with the steps of gradient descent from (0, 0)"
          >
            {(p) => {
              const clip = { x: p.px(BOX[0][0]), y: p.py(BOX[1][1]), w: p.px(BOX[0][1]) - p.px(BOX[0][0]), h: p.py(BOX[1][0]) - p.py(BOX[1][1]) };
              return (
                <g>
                  <Ticks p={p} box={BOX} x={[-10, -8, -6, -4, -2, 0]} y={[-6, -4, -2, 0]} />
                  <circle cx={p.px(MIN[0])} cy={p.py(MIN[1])} r={5} fill={INK} stroke="#fff" strokeWidth="1.5" />
                  {/* clipped to the plot by a nested svg (a clipPath's id would be repeated in the PDF's copies) */}
                  <svg x={clip.x} y={clip.y} width={clip.w} height={clip.h} viewBox={`${clip.x} ${clip.y} ${clip.w} ${clip.h}`} overflow="hidden">
                    <path d={path(p)} fill="none" stroke={RED} strokeWidth="1.5" />
                    {pts.slice(0, -1).map(([u, v], n) => (
                      <circle key={n} cx={p.px(u)} cy={p.py(v)} r={2.6} fill={RED} />
                    ))}
                    <circle cx={p.px(a[0])} cy={p.py(a[1])} r={5.5} fill={RED} stroke="#fff" strokeWidth="1.5" />
                  </svg>
                  <text x={p.px(START[0]) + 8} y={p.py(START[1]) + 5} fontSize="15" fontFamily={MAIN} fill={RED} className="map-label">
                    <B>a</B>
                    <Sub>0</Sub>
                  </text>
                </g>
              );
            }}
          </ContourPlot>

          <div className="l10-ai-controls l10-gd-controls">
            <Slider name="learning rate t" label={<span>learning rate <Tex tex="t" /></span>} value={rate} onChange={setRate} min={0.01} max={0.3} step={0.01} format={(v) => v.toFixed(2)} />
            <button type="button" onPointerUp={blur} onClick={() => setRun((k) => k + 1)}>
              Replay
            </button>
          </div>
          <p className="l10-gd-read">
            <span>step {pts.length - 1}</span>
            <Tex tex={`f(\\vv a)=${f(...a).toFixed(3)}`} />
          </p>
        </Fragment>
      </div>
    </section>
  );
}
