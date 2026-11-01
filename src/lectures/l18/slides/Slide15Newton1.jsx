import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { Sub, I, MAIN } from '../components/svgmath.jsx';
import { INK, RED, BLUE, AMBER } from '../components/inv.js';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

// the tangent lines, their name and their points, in amber (the user's request: not red)
export const TAN = AMBER;

// ---------- the derivation's picture: a function f (e^x − 3, not named on the slide), its zero ln 3,
// a guess a₁ = 2.6 and the next five, each where the tangent line at the one before crosses the x-axis
export const f = (x) => Math.exp(x) - 3;
export const df = (x) => Math.exp(x);
export const ZERO = Math.log(3);
export const A = [2.6];
for (let k = 0; k < 5; k += 1) A.push(A[k] - f(A[k]) / df(A[k]));

export const W = 600;
export const H = 440;
export const PAD = 12;
export const XR = [0.55, 2.95];
export const YR = [-2.6, 12.5];
export const UX = (W - 2 * PAD) / (XR[1] - XR[0]);
export const UY = (H - 2 * PAD) / (YR[1] - YR[0]);

// the zoom (the user's request: after a₄, zoom in and take a few more steps): the window V0; key
// press 5, ×Z1 into the window around a₄ and the zero, then the step to a₅; 6, ×Z2 more, around a₅
// and the zero, then the step to a₆ (each step squares the distance to the zero, 2·10⁻², 2·10⁻⁴,
// 2·10⁻⁸, so each needs a zoom of its own to be seen). Each window keeps the x-axis where it was.
export const Z1 = 30;
export const Z2 = 100;
export const V0 = { x0: XR[0], y0: YR[0], ux: UX, uy: UY };
export const V1 = { x0: ZERO - 0.03, y0: YR[0] / Z1, ux: UX * Z1, uy: UY * Z1 };
export const V2 = { x0: ZERO - 0.0003, y0: YR[0] / (Z1 * Z2), ux: UX * Z1 * Z2, uy: UY * Z1 * Z2 };

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
  };
}
export const line = (v, P) => P.map(([x, y]) => `${v.px(x).toFixed(1)},${v.py(y).toFixed(1)}`).join(' ');
export const clamp = (x) => Math.max(0, Math.min(1, x));

/** The guess a_{k+1} (A[k]) on the x-axis: a dot, its name under it. */
export function Mark({ v, k, opacity }) {
  const x = A[k];
  return (
    <g opacity={opacity}>
      <circle cx={v.px(x)} cy={v.py(0)} r={5.5} fill={INK} />
      <text x={v.px(x)} y={v.py(0) + 33} fontSize="24" fontFamily={MAIN} fill={INK} textAnchor="middle" className="l18-halo">
        <I>a</I>
        <Sub>{k + 1}</Sub>
      </text>
    </g>
  );
}

/** Up from the guess A[k] to the graph (gray, dashed), and the point there. */
export function Up({ v, k, opacity }) {
  const a = A[k];
  return (
    <g opacity={opacity}>
      <polyline points={line(v, [[a, 0], [a, f(a)]])} stroke="#6b7280" strokeWidth="2" strokeDasharray="6 5" fill="none" />
      <circle cx={v.px(a)} cy={v.py(f(a))} r={5} fill={TAN} />
    </g>
  );
}

/**
 * The tangent line at (A[k], f(A[k])), from a little above the point down to the x-axis, at A[k+1]:
 * drawn on by CSS when its fragment shows (`cssK`, its delay), or `progress` of the way (the zoom's
 * steps, timed in JS).
 */
export function Tangent({ v, k, cssK, progress = 1, opacity }) {
  const a = A[k];
  const b = A[k + 1];
  const t = (x) => f(a) + df(a) * (x - a);
  const from = a + (a - b) * 0.1;
  const to = from + (b - from) * progress;
  const drawn = cssK == null ? {} : { pathLength: '1', className: 'l18-draw', style: { '--k': cssK } };
  return (
    <polyline
      points={line(v, [
        [from, t(from)],
        [to, t(to)],
      ])}
      stroke={TAN}
      strokeWidth="3"
      fill="none"
      opacity={opacity}
      {...drawn}
    />
  );
}

/** "tangent line", along the first tangent line, under it. */
export function TangentName({ v }) {
  const [a] = A;
  const t = (x) => f(a) + df(a) * (x - a);
  const x = 2.08;
  const P = [v.px(x), v.py(t(x))];
  const Q = [v.px(x + 0.1), v.py(t(x + 0.1))];
  const ang = Math.atan2(Q[1] - P[1], Q[0] - P[0]);
  const at = [P[0] - 18 * Math.sin(ang), P[1] + 18 * Math.cos(ang)];
  return (
    <text
      transform={`translate(${at[0].toFixed(1)},${at[1].toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})`}
      dy="0.35em"
      fontSize="21"
      fontFamily={MAIN}
      fill={TAN}
      textAnchor="middle"
      className="l18-halo"
    >
      tangent line
    </text>
  );
}

/**
 * The graph of f, its zero ringed; a guess a₁ (first a_k; the user's request), up to the graph, the
 * height f(a₁). Key press 1: the tangent line there (amber, the user's request; its equation is the
 * text's, beside it); 2: its name, "tangent line"; 3 (better guess: a₂ = …): a₂, where it crosses the
 * x-axis; 4: the same again, from a₂ to a₃, then from a₃ to a₄, one after the other; 5: the zoom ×30
 * (`z1`), then the step from a₄ to a₅ (`s5`); 6: the zoom ×100 more (`z2`), then the step from a₅ to
 * a₆ (`s6`) (the user's request: more steps, and a zoom after a₄).
 */
export function Picture({ z1 = 0, z2 = 0, s5 = 0, s6 = 0 }) {
  const v = view(z1, z2);
  const n = 160;
  const curve = Array.from({ length: n + 1 }, (_, i) => v.xs[0] + ((v.xs[1] - v.xs[0]) * i) / n).map((x) => [x, f(x)]);
  const [a] = A;
  const zoomed = z2 > 0 ? Z1 * Z2 : Z1;
  const zoomOpacity = z2 > 0 ? 1 : clamp((z1 - 0.5) / 0.4);
  return (
    <svg className="figure-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="The graph of f; a guess a_1; the tangent line at (a_1, f(a_1)) crosses the x-axis at a_2, nearer the zero of f; then a_3, a_4, and, zoomed in, a_5 and a_6">
      <line x1={0} y1={v.py(0)} x2={W} y2={v.py(0)} stroke="#6b7280" strokeWidth="1.5" />
      <text x={W - PAD - 2} y={v.py(0) - 10} fill="#6b7280" fontSize="20" fontFamily={MAIN} textAnchor="end">
        <I>x</I>
      </text>

      <polyline points={line(v, curve)} stroke={BLUE} strokeWidth="3.5" fill="none" />
      <TexSvg x={v.px(0.62)} y={v.py(1.5)} tex="y=f(x)" size={25} color={BLUE} anchor="start" w={140} h={40} className="l18-halo" />
      <circle cx={v.px(ZERO)} cy={v.py(0)} r={12} fill="none" stroke={RED} strokeWidth="2.6" />

      {/* the guess a₁ (the user's request: a₁ in the picture, as in the first sentence), and up to the graph: the height f(a₁) */}
      <line x1={v.px(a)} y1={v.py(0)} x2={v.px(a)} y2={v.py(f(a))} stroke="#6b7280" strokeWidth="2" strokeDasharray="6 5" />
      <TexSvg x={v.px(a) + 12} y={v.py(f(a) / 2)} tex="f(a_1)" size={24} color={INK} anchor="start" w={90} h={40} className="l18-halo" />

      {/* key press 1: the tangent line; 2: its name, with the text's brace */}
      <Fragment as="g" index={1}>
        <Tangent v={v} k={0} cssK={0} />
      </Fragment>
      <Fragment as="g" index={2}>
        <TangentName v={v} />
      </Fragment>
      <circle cx={v.px(a)} cy={v.py(f(a))} r={5.5} fill={BLUE} />
      <Fragment as="g" index={1}>
        <circle cx={v.px(a)} cy={v.py(f(a))} r={5.5} fill={TAN} />
      </Fragment>
      <Mark v={v} k={0} />

      {/* key press 3, better guess: a₂ = …, where the tangent line crosses the x-axis */}
      <Fragment as="g" index={3}>
        <Mark v={v} k={1} />
      </Fragment>

      {/* key press 4: from a₂ to a₃, then from a₃ to a₄, one after the other (CSS delays, --k) */}
      <Fragment as="g" index={4}>
        <Up v={v} k={1} />
        <Tangent v={v} k={1} cssK={2} opacity={0.8} />
        <g className="l18-head" style={{ '--k': 3 }}>
          <Mark v={v} k={2} />
        </g>
        <g className="l18-head" style={{ '--k': 5 }}>
          <Up v={v} k={2} />
        </g>
        <Tangent v={v} k={2} cssK={12} opacity={0.8} />
        <g className="l18-head" style={{ '--k': 13 }}>
          <Mark v={v} k={3} />
        </g>
      </Fragment>

      {/* key presses 5 and 6, once zoomed in: from a₄ to a₅, then from a₅ to a₆ (timed in JS) */}
      {[
        [3, s5],
        [4, s6],
      ].map(
        ([k, s]) =>
          s > 0 && (
            <g key={k}>
              <Up v={v} k={k} opacity={clamp(s * 5)} />
              <Tangent v={v} k={k} progress={clamp((s - 0.2) / 0.55)} opacity={0.8} />
              <Mark v={v} k={k + 1} opacity={clamp((s - 0.8) / 0.2)} />
            </g>
          ),
      )}

      {zoomOpacity > 0 && (
        <text x={PAD + 14} y={PAD + 32} fontSize="22" fontFamily={MAIN} fill="#6b7280" opacity={zoomOpacity}>
          zoom &times;{zoomed}
        </text>
      )}
    </svg>
  );
}

/** A clock from 0 to 1, linear, over `ms` from when `on` turns true; back to 0 at once when it turns false. */
export function useClock(on, ms) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!on) {
      setK(0);
      return undefined;
    }
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const v = Math.min(1, (now - t0) / ms);
      setK(v);
      if (v < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [on, ms]);
  return k;
}
export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
// a key press's clock: the zoom in its first 45%, the step after it from 55% on
export const zoomPart = (k) => ease(clamp(k / 0.45));
export const stepPart = (k) => clamp((k - 0.55) / 0.45);

// the derivation (the user's requests), at a₁: the linear approximation of f at a₁, displayed, the
// tangent line under a brace on a key press of its own (LINEAR, 1 and 2); better guess: a₂ = … (3; "⇒
// x ≈ …" before it removed by the user); last, after the picture's a₃ and a₄ (4) and its zooms (5, 6),
// Newton's method, a_{k+1} = …, in a box (7)
export const LINEAR = r`f(x)\approx\underbrace{f(a_1)+f'(a_1)(x-a_1)}_{\htmlClass{l18-brace-label}{\textcolor{${AMBER}}{\text{tangent line}}}}`;


/**
 * Newton's method in one variable (the user's requests: first the formula derived, with a picture and
 * with the linear approximation as the reason; then Newton's own example; after Solving equations).
 * On the left, to solve f(x) = 0, start with a guess a₁ (a₁ in the picture, the user's request);
 * then, at a₁ (the user's requests), key press 1: linear approximation of f at a₁:, and in the next
 * row, displayed, f(x) ≈ f(a₁) + f′(a₁)(x − a₁), with the tangent line on the picture; 2: a brace under its right
 * side, "tangent line" (amber, not red); 3: better guess: a₂ = a₁ − f(a₁)/f′(a₁), where it crosses
 * the x-axis (a₂ on the picture); 4: on the picture, a₃ and a₄; 5: the picture zooms ×30 into a₄ and
 * the zero, and takes the step to a₅; 6: ×100 more, and the step to a₆ (the user's request); 7:
 * Newton's method, a_{k+1} = …, for every k, in a box. In print, a still of the picture per zoom. Newton's example is on the next slide (Slide15bNewtonExample; the user's
 * request).
 */
export default function Slide15Newton1() {
  const zoomRefs = [useRef(null), useRef(null)];
  const k5 = useClock(useFragmentShown(zoomRefs[0]), 3800);
  const k6 = useClock(useFragmentShown(zoomRefs[1]), 3800);
  return (
    <section>
      <h2>Newton&rsquo;s method in one variable</h2>

      <div className="l18-n1">
        <div className="l18-n1-text">
          <p>
            To solve <Tex tex="f(x)=0" />, start with a guess <Tex tex="a_1" />.
          </p>
          {/* key press 1, the formula in the next row, displayed, centred (the user's request); 2, the brace under it, "tangent line" (CSS, .l18-lin) */}
          <Fragment index={1} className="l18-lin-block">
            <p>
              Linear approximation of <Tex tex="f" /> at <Tex tex="a_1" />:
            </p>
            <FxMarker index={2} id="l18-brace" />
            <div className="l18-lin">
              <Tex display tex={LINEAR} />
            </div>
          </Fragment>
          <Fragment index={3} as="p" className="l18-better">
            Better guess: <Tex tex={r`a_2=a_1-\dfrac{f(a_1)}{f'(a_1)}`} />
          </Fragment>
          <div className="l18-deriv">
            <Fragment index={7} className="l18-deriv-row l18-deriv-result l18-n1-box">
              <Tex tex="a_{k+1}" />
              <Tex tex="=" />
              <Tex tex={r`a_k-\dfrac{f(a_k)}{f'(a_k)}\qquad(k=1,2,3,\ldots)`} />
            </Fragment>
          </div>
        </div>

        <div className="l18-n1-right">
          {zoomRefs.map((ref, k) => (
            <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={5 + k} aria-hidden="true" />
          ))}
          {PRINT ? (
            <div className="l18-n1-pic l15-stills">
              <Fragment index={5} effect="fade-out">
                <Picture />
              </Fragment>
              <Fragment index={5}>
                <Fragment index={6} effect="fade-out">
                  <Picture z1={1} s5={1} />
                </Fragment>
              </Fragment>
              <Fragment index={6}>
                <Picture z1={1} z2={1} s5={1} s6={1} />
              </Fragment>
            </div>
          ) : (
            <div className="l18-n1-pic">
              <Picture z1={zoomPart(k5)} s5={stepPart(k5)} z2={zoomPart(k6)} s6={stepPart(k6)} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
