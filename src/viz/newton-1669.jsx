import { useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { MAIN } from '../lectures/l18/components/svgmath.jsx';
import { RED, BLUE } from '../lectures/l18/components/inv.js';
import { g, AS, ZERO, EQS, W, H, PAD, Z1, Z2, view, clamp, ticks, Mark, Step, TangentName, ROWS, Row } from '../lectures/l18/slides/Slide15bNewtonExample.jsx';
import { useClock, zoomPart, stepPart } from '../lectures/l18/slides/Slide15Newton1.jsx';

export const lecture = 18;

// the steps: a₂, a₃, a₄; a zoom ×1000 and a₅; a zoom ×3000 more and a₆; then the wrong digits gray
const STEPS = ROWS.length;
const MS = [1500, 1500, 1500, 3800, 3800];

/**
 * The slide's picture, step `n` (0: a₁ alone; 6: as 5) `k` of the way (from 0 to 1; the steps before
 * it done): the graph of x³ − 2x − 5, its zero ringed, a₁ = 3; steps 1–3, up to the graph at a_k,
 * the tangent line there (the first named) and a_{k+1}; 4 and 5, the zoom, then the step after it.
 * On the slide steps 1–3 are drawn on by CSS on their key presses, and the zooms timed in JS; here
 * all of them are timed in JS, as the zooms.
 */
function Picture({ n, k }) {
  const s = (i) => (i < n ? 1 : i > n ? 0 : i >= 4 ? stepPart(k) : k);
  const z = (i) => (i < n ? 1 : i > n ? 0 : zoomPart(k));
  const z1 = z(4);
  const z2 = z(5);
  const v = view(z1, z2);
  const graph = Array.from({ length: 221 }, (_, i) => v.xs[0] + ((v.xs[1] - v.xs[0]) * i) / 220).map((x) => `${v.px(x).toFixed(1)},${v.py(g(x)).toFixed(1)}`);
  const late = z2 > 0 ? 1 : clamp((z1 - 0.65) / 0.3);
  const xticks = ticks(v.xs, 2.5);
  return (
    <svg className="figure-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="The graph of x³ − 2x − 5 and Newton's steps from 3, each along a tangent line; zoomed in, the steps to a₅ and a₆">
      <g stroke="#eef0f3">
        {xticks.map((x) => (
          <line key={`x${x}`} x1={v.px(x)} y1={0} x2={v.px(x)} y2={H} />
        ))}
        {ticks(v.ys, 4).map((y) => (
          <line key={`y${y}`} x1={0} y1={v.py(y)} x2={W} y2={v.py(y)} />
        ))}
      </g>
      <line x1={0} y1={v.py(0)} x2={W} y2={v.py(0)} stroke="#6b7280" strokeWidth="1.5" />
      <g fill="#6b7280" fontSize="13">
        {xticks
          .filter((x) => v.px(x) > 34 && v.px(x) < W - 34 && AS.every((a) => Math.abs(v.px(x) - v.px(a)) > 26))
          .map((x) => (
            <text key={x} x={v.px(x)} y={v.py(0) + 17} textAnchor="middle">
              {x}
            </text>
          ))}
        <text x={W - PAD - 2} y={v.py(0) - 8} textAnchor="end" fontSize="15" fontStyle="italic">
          x
        </text>
      </g>

      <polyline points={graph.join(' ')} stroke={BLUE} strokeWidth="3.5" fill="none" />
      <circle cx={v.px(ZERO)} cy={v.py(0)} r={12} fill="none" stroke={RED} strokeWidth="2.6" />

      {[1, 2, 3, 4, 5].map((i) => s(i) > 0 && <Step key={i} v={v} k={i - 1} s={s(i)} />)}
      {/* "tangent line" (a .l18-head, which site.css shows at once) */}
      {s(1) > 0.6 && (
        <g opacity={clamp((s(1) - 0.6) / 0.3)}>
          <TangentName v={v} />
        </g>
      )}

      <Mark v={v} k={0} />
      {[1, 2, 4, 5].map((i) => s(i) > 0 && <Mark key={i} v={v} k={i} opacity={clamp((s(i) - 0.8) / 0.2)} />)}
      {/* a₄ on the zero's ring, named once zoomed */}
      {s(3) > 0 && (
        <g opacity={clamp((s(3) - 0.8) / 0.2)}>
          <Mark v={v} k={3} label={false} />
          <Mark v={v} k={3} opacity={late} />
        </g>
      )}

      {late > 0 && (
        <text x={PAD + 12} y={PAD + 28} fontSize="22" fontFamily={MAIN} fill="#6b7280" opacity={late}>
          zoom &times;{z2 > 0.8 ? (Z1 * Z2).toLocaleString('en-US') : Z1}
        </text>
      )}
    </svg>
  );
}

/** Step `n` of the picture, timed from when it mounts (the gray digits, step 6, are not in it). */
function Timed({ n }) {
  const m = Math.min(n, STEPS - 1);
  const k = useClock(m > 0, MS[Math.max(0, m - 1)]);
  return <Picture n={m} k={m > 0 ? k : 0} />;
}

/*
 * Newton's example (1669), without its title: on the left, f and a₁ = 3, the computation of the
 * latest a_k, and the table of a_k and f(a_k), a row a step; on the right the slide's picture, in
 * step with the table: the tangent lines to a₂, a₃, a₄, then a zoom ×1000 and the step to a₅, a zoom
 * ×3000 more and the step to a₆; last, the digits of each a_k that are wrong fade to gray. On the
 * slide each comes on a key press; here on Next step, and Start again goes back to a₁.
 */
export default function Newton1669() {
  const [n, setN] = useState(0);
  return (
    <div className="viz-col nex-col">
      <div className="l18-nex">
        <div className="l18-nex-text">
          <p>
            To solve <Tex tex="f(x)=x^3-2x-5=0" />,
          </p>
          <p>
            start with <Tex tex="a_1=3" />.
          </p>
          <div className="l18-nex-eqs">{n > 0 && <Tex display tex={EQS[Math.min(n, EQS.length) - 1]} />}</div>
          <div className="l18-nex-table">
            <span className={`fx-marker${n >= STEPS ? ' visible' : ''}`} data-fx="l18-digits" aria-hidden="true" />
            <div className="fx-host">
              <table className="l18-table l18-alg-table">
                <thead>
                  <tr>
                    <th>
                      <Tex tex="k" />
                    </th>
                    <th>
                      <Tex tex="a_k" />
                    </th>
                    <th>
                      <Tex tex="f(a_k)" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((_, k) => (
                    <tr key={k} style={{ visibility: k <= n ? 'visible' : 'hidden' }}>
                      <Row k={k} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="l18-nex-pic">
          <p className="l18-fn-name">
            <Tex tex={r`y=x^3-2x-5`} />
          </p>
          <Timed key={Math.min(n, STEPS - 1)} n={n} />
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setN((m) => Math.min(STEPS, m + 1))} disabled={n >= STEPS}>
          {n < STEPS - 1 ? `Next step: a${'₂₃₄₅₆'[n]}` : 'Which digits are right?'}
        </button>
        <button type="button" className="viz-button" onClick={() => setN(0)} disabled={n === 0}>
          Start again
        </button>
      </div>
    </div>
  );
}
