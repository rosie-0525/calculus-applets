import { useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import TexSvg from '../lectures/l18/components/TexSvg.jsx';
import { I, MAIN } from '../lectures/l18/components/svgmath.jsx';
import { INK, RED, BLUE } from '../lectures/l18/components/inv.js';
import { TAN, f, ZERO, A, W, H, PAD, Z1, Z2, view, line, clamp, Mark, Up, Tangent, TangentName, useClock, zoomPart, stepPart, LINEAR } from '../lectures/l18/slides/Slide15Newton1.jsx';

export const lecture = 18;

// the steps: to a₂, a₃, a₄; then a zoom ×30 and the step to a₅; a zoom ×100 more and the step to a₆
const LAST = 5;
const MS = [1500, 1500, 1500, 3800, 3800];

/**
 * The slide's picture, step `n` (0: a₁ alone) `k` of the way (k from 0 to 1; the steps before it
 * done): the graph of f, its zero ringed, a₁ and the height f(a₁); step 1, the tangent line at a₁
 * drawn on, its name, and a₂; steps 2 and 3, up from a_k to the graph, the tangent line there, and
 * a_{k+1}; steps 4 and 5, the zoom, then the step after it. On the slide the steps come on key
 * presses, drawn on by CSS; here each is timed in JS, as the slide's zooms are.
 */
function Picture({ n, k }) {
  const s = (i) => (i < n ? 1 : i > n ? 0 : i >= 4 ? stepPart(k) : k);
  const z = (i) => (i < n ? 1 : i > n ? 0 : zoomPart(k));
  const z1 = z(4);
  const z2 = z(5);
  const v = view(z1, z2);
  const curve = Array.from({ length: 161 }, (_, i) => v.xs[0] + ((v.xs[1] - v.xs[0]) * i) / 160).map((x) => [x, f(x)]);
  const [a] = A;
  const zoomOpacity = z2 > 0 ? 1 : clamp((z1 - 0.5) / 0.4);
  const s1 = s(1);
  return (
    <svg className="figure-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="The graph of f; a guess a_1; the tangent line at (a_1, f(a_1)) crosses the x-axis at a_2, nearer the zero of f; then a_3, a_4, and, zoomed in, a_5 and a_6">
      <line x1={0} y1={v.py(0)} x2={W} y2={v.py(0)} stroke="#6b7280" strokeWidth="1.5" />
      <text x={W - PAD - 2} y={v.py(0) - 10} fill="#6b7280" fontSize="20" fontFamily={MAIN} textAnchor="end">
        <I>x</I>
      </text>

      <polyline points={line(v, curve)} stroke={BLUE} strokeWidth="3.5" fill="none" />
      <TexSvg x={v.px(0.62)} y={v.py(1.5)} tex="y=f(x)" size={25} color={BLUE} anchor="start" w={140} h={40} className="l18-halo" />
      <circle cx={v.px(ZERO)} cy={v.py(0)} r={12} fill="none" stroke={RED} strokeWidth="2.6" />

      <line x1={v.px(a)} y1={v.py(0)} x2={v.px(a)} y2={v.py(f(a))} stroke="#6b7280" strokeWidth="2" strokeDasharray="6 5" />
      <TexSvg x={v.px(a) + 12} y={v.py(f(a) / 2)} tex="f(a_1)" size={24} color={INK} anchor="start" w={90} h={40} className="l18-halo" />

      {s1 > 0 && (
        <g>
          <Tangent v={v} k={0} progress={clamp(s1 / 0.7)} />
          <g opacity={clamp((s1 - 0.6) / 0.3)}>
            <TangentName v={v} />
          </g>
        </g>
      )}
      <circle cx={v.px(a)} cy={v.py(f(a))} r={5.5} fill={s1 > 0 ? TAN : BLUE} />
      <Mark v={v} k={0} />
      {s1 > 0 && <Mark v={v} k={1} opacity={clamp((s1 - 0.8) / 0.2)} />}

      {[2, 3, 4, 5].map(
        (i) =>
          s(i) > 0 && (
            <g key={i}>
              <Up v={v} k={i - 1} opacity={clamp(s(i) * 5)} />
              <Tangent v={v} k={i - 1} progress={clamp((s(i) - 0.2) / 0.55)} opacity={0.8} />
              <Mark v={v} k={i} opacity={clamp((s(i) - 0.8) / 0.2)} />
            </g>
          ),
      )}

      {zoomOpacity > 0 && (
        <text x={PAD + 14} y={PAD + 32} fontSize="22" fontFamily={MAIN} fill="#6b7280" opacity={zoomOpacity}>
          zoom &times;{z2 > 0 ? Z1 * Z2 : Z1}
        </text>
      )}
    </svg>
  );
}

/** Step `n`, timed from when it mounts. */
function Timed({ n }) {
  const k = useClock(n > 0, MS[Math.max(0, n - 1)]);
  return <Picture n={n} k={n > 0 ? k : 0} />;
}

/*
 * Newton's method in one variable, without its title: on the left, its text, all shown (the slide's
 * key presses bring the linear approximation, its brace, the better guess and the box); on the
 * right its picture, a step per click on Next step: the tangent line at a₁ and a₂, then a₃ and a₄;
 * then a zoom ×30 into a₄ and the zero and the step to a₅, and a zoom ×100 more and the step to a₆.
 * Start again goes back to a₁.
 */
export default function NewtonTangent() {
  const [n, setN] = useState(0);
  return (
    <div className="viz-col">
      <div className="l18-n1">
        <div className="l18-n1-text">
          <p>
            To solve <Tex tex="f(x)=0" />, start with a guess <Tex tex="a_1" />.
          </p>
          <div className="l18-lin-block">
            <p>
              Linear approximation of <Tex tex="f" /> at <Tex tex="a_1" />:
            </p>
            <span className="fx-marker visible" data-fx="l18-brace" aria-hidden="true" />
            <div className="l18-lin">
              <Tex display tex={LINEAR} />
            </div>
          </div>
          <p className="l18-better">
            Better guess: <Tex tex={r`a_2=a_1-\dfrac{f(a_1)}{f'(a_1)}`} />
          </p>
          <div className="l18-deriv">
            <div className="l18-deriv-row l18-deriv-result l18-n1-box">
              <Tex tex="a_{k+1}" />
              <Tex tex="=" />
              <Tex tex={r`a_k-\dfrac{f(a_k)}{f'(a_k)}\qquad(k=1,2,3,\ldots)`} />
            </div>
          </div>
        </div>
        <div className="l18-n1-right">
          <div className="l18-n1-pic">
            <Timed key={n} n={n} />
          </div>
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setN((m) => Math.min(LAST, m + 1))} disabled={n >= LAST}>
          {n < 3 ? `Next step: a${'₂₃₄'[n]}` : n === 3 ? 'Zoom in: a₅' : 'Zoom in: a₆'}
        </button>
        <button type="button" className="viz-button" onClick={() => setN(0)} disabled={n === 0}>
          Start again
        </button>
      </div>
    </div>
  );
}
