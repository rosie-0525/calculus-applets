import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import { Sub, I, MAIN } from '../components/svgmath.jsx';
import { INK, RED, BLUE } from '../components/inv.js';
import { PRINT } from '../components/print.js';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';

// ---------- Newton's own example (1669): x³ − 2x − 5 = 0, from a₁ = 3
export const g = (x) => x ** 3 - 2 * x - 5;
export const dg = (x) => 3 * x * x - 2;
export const AS = [3];
for (let k = 0; k < 5; k += 1) AS.push(AS[k] - g(AS[k]) / dg(AS[k]));
export const ROOT = '2.0945514815'; // the cubic formula's value, to 10 decimals
export const ZERO = 2.0945514815423265;

// the computation of a_{k+1}, on the key press of its row, in place of the one before (the user's
// request): a₂ as it was; a₃ from 2.36 the same way; from a₄ on, a_k (too long a number to write
// three times) by its name in f(a_k)/f′(a_k), with as many digits as the next step needs
export const EQS = [
  r`a_2=3-\frac{f(3)}{f'(3)}=3-\frac{16}{25}=2.36`,
  r`a_3=2.36-\frac{f(2.36)}{f'(2.36)}\approx2.36-\frac{3.4243}{14.709}\approx2.1272`,
  r`a_4=a_3-\frac{f(a_3)}{f'(a_3)}\approx2.1272-\frac{0.3711}{11.575}\approx2.0951`,
  r`a_5=a_4-\frac{f(a_4)}{f'(a_4)}\approx2.095136-\frac{0.006527}{11.169}\approx2.094552`,
  r`a_6=a_5-\frac{f(a_5)}{f'(a_5)}\approx2.0945517-\frac{2.15\cdot10^{-6}}{11.16}\approx2.0945515`,
];

// ---------- the picture (Why does it work?'s, CubicSteps, but in step with the table; the user's
// request): the window V0; key press 4, ×Z1 into the window around a₄ and the zero, then the step to
// a₅; 5, ×Z2 more, around a₅ and the zero, then the step to a₆ (each step about squares the distance
// to the zero, 6·10⁻⁴, 2·10⁻⁷, 2·10⁻¹⁴, so each needs a zoom of its own to be seen). Each zoomed
// window keeps the x-axis where it was, and the zero 40% of the way across.
export const W = 540;
export const H = 430;
export const PAD = 10;
export const X0 = [1.55, 3.15];
export const Y0 = [-5.5, 19];
export const UX = (W - 2 * PAD) / (X0[1] - X0[0]);
export const UY = (H - 2 * PAD) / (Y0[1] - Y0[0]);
export const Z1 = 1000;
export const Z2 = 3000;
export const zoomed = (z) => ({ x0: ZERO - (0.4 * (W - 2 * PAD)) / (UX * z), y0: Y0[0] / z, ux: UX * z, uy: UY * z });
export const V0 = { x0: X0[0], y0: Y0[0], ux: UX, uy: UY };
export const V1 = zoomed(Z1);
export const V2 = zoomed(Z1 * Z2);

/** The window `t` of the way from P to Q (Q is P zoomed by Z), the point the two share kept put. */
export function between(P, Q, Z, t) {
  const fx = (Z * Q.x0 - P.x0) / (Z - 1);
  const fy = (Z * Q.y0 - P.y0) / (Z - 1);
  const s = Z ** t;
  return { x0: fx - (fx - P.x0) / s, y0: fy - (fy - P.y0) / s, ux: P.ux * s, uy: P.uy * s };
}

/** The picture's coordinates: the first zoom `z1` of the way, then the second `z2` of the way. */
export function view(z1, z2) {
  const V = z2 > 0 ? between(V1, V2, Z2, z2) : z1 > 0 ? between(V0, V1, Z1, z1) : V0;
  return {
    px: (x) => PAD + (x - V.x0) * V.ux,
    py: (y) => H - PAD - (y - V.y0) * V.uy,
    xs: [V.x0 - PAD / V.ux, V.x0 + (W - PAD) / V.ux],
    ys: [V.y0 - PAD / V.uy, V.y0 + (H - PAD) / V.uy],
  };
}
export const clamp = (x) => Math.max(0, Math.min(1, x));
export const onScreen = (x, y, m = 120) => x > -m && x < W + m && y > -m && y < H + m;

/** Grid lines (and, for x, tick labels) at a round step (1, 2 or 5 times a power of 10), `n` or more across. */
export function ticks([a, b], n) {
  const most = (b - a) / n;
  const e = 10 ** Math.floor(Math.log10(most));
  const step = [5 * e, 2 * e, e].find((s) => s <= most);
  const d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  const out = [];
  for (let k = Math.ceil(a / step); k * step <= b; k += 1) out.push(+(k * step).toFixed(d));
  return out;
}

/**
 * The segment from P to Q (in the plane), in pixels, cut to a little past the picture (zoomed, the
 * parts far out of it get too big to draw), as a polyline's points; null if none of it is near.
 */
export function seg(v, P, Q) {
  const A = [v.px(P[0]), v.py(P[1])];
  const d = [v.px(Q[0]) - A[0], v.py(Q[1]) - A[1]];
  const lo = [-40, -40];
  const hi = [W + 40, H + 40];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 2; i += 1) {
    for (const [p, q] of [
      [-d[i], A[i] - lo[i]],
      [d[i], hi[i] - A[i]],
    ]) {
      if (p === 0) {
        if (q < 0) return null;
      } else if (p < 0) {
        t0 = Math.max(t0, q / p);
      } else {
        t1 = Math.min(t1, q / p);
      }
    }
  }
  if (t0 > t1) return null;
  const at = (t) => `${(A[0] + t * d[0]).toFixed(1)},${(A[1] + t * d[1]).toFixed(1)}`;
  return `${at(t0)} ${at(t1)}`;
}

/** a_{k+1} (AS[k]) on the x-axis: a dot and, if `label`, its name under it. */
export function Mark({ v, k, label = true, opacity }) {
  const x = v.px(AS[k]);
  const y = v.py(0);
  if (!onScreen(x, y)) return null;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={5.5} fill={INK} />
      {label && (
        <text x={x} y={y + 30} fontSize="22" fontFamily={MAIN} fill={INK} textAnchor="middle" className="l18-halo">
          <I>a</I>
          <Sub>{k + 1}</Sub>
        </text>
      )}
    </g>
  );
}

/**
 * The step from a_{k+1} (AS[k]): up to the graph (gray), the point there (red), then the tangent line
 * there (red), from a little above the point to a little past the x-axis. Drawn on by CSS when its
 * fragment shows (`css`), or, zoomed, `s` of the way (timed in JS): up, then the tangent line, then
 * the next guess, a_{k+2}, where it crosses the x-axis.
 */
export function Step({ v, k, css = false, s = 1 }) {
  const a = AS[k];
  const b = AS[k + 1];
  const from = a + (a - b) * 0.14;
  const over = b - (a - b) * 0.14;
  const tan = (x) => g(a) + dg(a) * (x - a);
  const to = css ? over : from + (over - from) * clamp((s - 0.2) / 0.55);
  const up = seg(v, [a, 0], [a, g(a)]);
  const along = seg(v, [from, tan(from)], [to, tan(to)]);
  const dot = [v.px(a), v.py(g(a))];
  const drawn = (j) => (css ? { pathLength: '1', className: 'l18-draw', style: { '--k': j } } : {});
  return (
    <g>
      <g opacity={css ? 1 : clamp(s * 5)}>
        {up && <polyline points={up} stroke="#6b7280" strokeWidth="1.8" fill="none" {...drawn(0)} />}
        {onScreen(...dot) && <circle cx={dot[0]} cy={dot[1]} r={5} fill={RED} className={css ? 'l18-head' : undefined} style={{ '--k': 0 }} />}
      </g>
      {along && <polyline points={along} stroke={RED} strokeWidth="2.6" fill="none" {...drawn(4)} />}
    </g>
  );
}

/** "tangent line", along the first tangent line, under it (only while it is in the picture). */
export function TangentName({ v }) {
  const a = AS[0];
  const x = 2.7;
  const P = [v.px(x), v.py(g(a) + dg(a) * (x - a))];
  if (!onScreen(...P)) return null;
  const Q = [v.px(x + 0.1), v.py(g(a) + dg(a) * (x + 0.1 - a))];
  const ang = Math.atan2(Q[1] - P[1], Q[0] - P[0]);
  const at = [P[0] - 17 * Math.sin(ang), P[1] + 17 * Math.cos(ang)];
  return (
    <text
      transform={`translate(${at[0].toFixed(1)},${at[1].toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})`}
      dy="0.35em"
      fontSize="21"
      fontFamily={MAIN}
      fill={RED}
      textAnchor="middle"
      className="l18-head l18-halo"
      style={{ '--k': 6 }}
    >
      tangent line
    </text>
  );
}

/**
 * The graph of x³ − 2x − 5 (blue), its zero ringed, a₁, and Newton's steps, with the table's rows:
 * key press 1, the tangent line at a₁ (with its name) and a₂; 2, the step from a₂ to a₃; 3, from a₃
 * to a₄ (on the zero's ring; its name once zoomed); 4, the zoom ×Z1 (`z1`), then the step from a₄ to
 * a₅ (`s4`); 5, the zoom ×Z2 more (`z2`), then the step from a₅ to a₆ (`s5`).
 */
export function Picture({ z1 = 0, z2 = 0, s4 = 0, s5 = 0 }) {
  const v = view(z1, z2);
  const n = 220;
  const graph = Array.from({ length: n + 1 }, (_, i) => v.xs[0] + ((v.xs[1] - v.xs[0]) * i) / n).map((x) => `${v.px(x).toFixed(1)},${v.py(g(x)).toFixed(1)}`);
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
          .filter((x) => v.px(x) > 34 && v.px(x) < W - 34 && AS.every((a) => Math.abs(v.px(x) - v.px(a)) > 26)) // in the picture, not under an a_k's name
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

      <Fragment as="g" index={1}>
        <Step v={v} k={0} css />
        <TangentName v={v} />
      </Fragment>
      <Fragment as="g" index={2}>
        <Step v={v} k={1} css />
      </Fragment>
      <Fragment as="g" index={3}>
        <Step v={v} k={2} css />
      </Fragment>
      {s4 > 0 && <Step v={v} k={3} s={s4} />}
      {s5 > 0 && <Step v={v} k={4} s={s5} />}

      <Mark v={v} k={0} />
      {[1, 2].map((k) => (
        <Fragment key={k} as="g" index={k}>
          <g className="l18-head" style={{ '--k': 6 }}>
            <Mark v={v} k={k} />
          </g>
        </Fragment>
      ))}
      <Fragment as="g" index={3}>
        <g className="l18-head" style={{ '--k': 6 }}>
          <Mark v={v} k={3} label={false} />
          <Mark v={v} k={3} opacity={late} />
        </g>
      </Fragment>
      {s4 > 0 && <Mark v={v} k={4} opacity={clamp((s4 - 0.8) / 0.2)} />}
      {s5 > 0 && <Mark v={v} k={5} opacity={clamp((s5 - 0.8) / 0.2)} />}

      {late > 0 && (
        <text x={PAD + 12} y={PAD + 28} fontSize="22" fontFamily={MAIN} fill="#6b7280" opacity={late}>
          zoom &times;{z2 > 0.8 ? (Z1 * Z2).toLocaleString('en-US') : Z1}
        </text>
      )}
    </svg>
  );
}

/** a_k to 10 decimals (3 and 2.36 as they are), split into the digits that agree with ROOT ("2." at least) and the rest. */
export function digits(a, k) {
  const s = k < 2 ? String(+a.toFixed(2)) : a.toFixed(10);
  let n = 0;
  while (n < s.length && s[n] === ROOT[n]) n += 1;
  return [s.slice(0, n), s.slice(n)];
}

export const ROWS = [
  [AS[0], '16'],
  [AS[1], '3.42'],
  [AS[2], '0.371'],
  [AS[3], '0.0065'],
  [AS[4], r`2\cdot 10^{-6}`],
  [AS[5], r`2\cdot 10^{-13}`],
];

export function Row({ k }) {
  const [right, wrong] = digits(ROWS[k][0], k);
  return (
    <>
      <td>
        <Tex tex={`${k + 1}`} />
      </td>
      <td className="l18-digits">
        <span className="l18-right">{right}</span>
        <span className="l18-wrong">{wrong}</span>
      </td>
      <td>
        <Tex tex={ROWS[k][1]} />
      </td>
    </>
  );
}

// the last key press: the digits that are wrong fade to gray (the row of the solution x removed by the user)
export const LAST = ROWS.length;
// the key presses of the picture's zooms (a₅'s row and a₆'s)
export const ZOOMS = [4, 5];

/**
 * Newton's example (1669), on a slide of its own (the user's request: the numerical computation moved
 * off Newton's method in one variable, onto the next slide). On the left, at the slide's edge (the
 * user's request), "To solve f(x) = x³ − 2x − 5 = 0," and "start with a₁ = 3." on the next line (the
 * user's words; f and f′ removed), then the computation of the latest a_k, and the table of a_k and
 * f(a_k) below, its first row on arrival; on the right, the animation (the user's request): Why does
 * it work?'s picture of Newton's steps on y = x³ − 2x − 5 (Picture), in step with the table (the
 * user's request). Key presses 1–5: a₂, …, a₆, each computed (in place of the one before), its row,
 * and its step on the picture; a₅ and a₆ each after a zoom (×1000, then ×3000 more), as the step
 * gets too small to see. 6: the digits of each a_k that are wrong (against the cubic formula's
 * value, Solving equations) fade to gray: the right ones about double each step (the row of the
 * solution x under the table removed by the user). In print, a still of the picture per zoom.
 */
export default function Slide15bNewtonExample() {
  const zoomRefs = [useRef(null), useRef(null)];
  const on4 = useFragmentShown(zoomRefs[0]);
  const on5 = useFragmentShown(zoomRefs[1]);
  // each zoom's key press: the zoom, then the step after it
  const z1 = useTween(on4, { ms: 1900, delay: 150 });
  const s4 = useTween(on4, { ms: 1800, delay: 2250 });
  const z2 = useTween(on5, { ms: 1900, delay: 150 });
  const s5 = useTween(on5, { ms: 1800, delay: 2250 });
  return (
    <section>
      <h2>Newton&rsquo;s example (1669)</h2>

      <div className="l18-nex">
        <div className="l18-nex-text">
          <p>
            To solve <Tex tex="f(x)=x^3-2x-5=0" />,
          </p>
          <p>
            start with <Tex tex="a_1=3" />.
          </p>
          {/* each a_k's computation on its row's key press, in place of the one before (one cell, .l18-nex-eqs) */}
          <div className="l18-nex-eqs">
            {EQS.map((tex, k) =>
              k + 1 < EQS.length ? (
                <Fragment key={k} index={k + 2} effect="fade-out">
                  <Fragment index={k + 1}>
                    <Tex display tex={tex} />
                  </Fragment>
                </Fragment>
              ) : (
                <Fragment key={k} index={k + 1}>
                  <Tex display tex={tex} />
                </Fragment>
              ),
            )}
          </div>
          <div className="l18-nex-table">
            <FxMarker index={LAST} id="l18-digits" />
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
                  {ROWS.map((_, k) =>
                    k === 0 ? (
                      <tr key={k}>
                        <Row k={k} />
                      </tr>
                    ) : (
                      <Fragment key={k} as="tr" index={k}>
                        <Row k={k} />
                      </Fragment>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="l18-nex-pic">
          <p className="l18-fn-name">
            <Tex tex={r`y=x^3-2x-5`} />
          </p>
          {zoomRefs.map((ref, k) => (
            <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={ZOOMS[k]} aria-hidden="true" />
          ))}
          {PRINT ? (
            <div className="l15-stills">
              <Fragment index={ZOOMS[0]} effect="fade-out">
                <Picture />
              </Fragment>
              <Fragment index={ZOOMS[0]}>
                <Fragment index={ZOOMS[1]} effect="fade-out">
                  <Picture z1={1} s4={1} />
                </Fragment>
              </Fragment>
              <Fragment index={ZOOMS[1]}>
                <Picture z1={1} s4={1} z2={1} s5={1} />
              </Fragment>
            </div>
          ) : (
            <Picture z1={z1} s4={s4} z2={z2} s5={s5} />
          )}
        </div>
      </div>
    </section>
  );
}
