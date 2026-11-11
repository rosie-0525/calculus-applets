import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { FImage } from '../components/FShape.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import useSwing from '../components/useSwing.js';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, GRAY, GREEN, apply, clamp01 } from '../components/tr.js';
import { EXAMPLES } from './Slide18bOrthOrNot.jsx';

/** A 2 × 2 matrix, its first column red and its second blue (the colours of Ae₁ and Ae₂). */
export const mat = ([[a, b], [c, d]], pre = '') =>
  r`${pre}\begin{bmatrix}\textcolor{${RED}}{${a}}&\textcolor{${BLUE}}{${b}}\\ \textcolor{${RED}}{${c}}&\textcolor{${BLUE}}{${d}}\end{bmatrix}`;

export const byOpt = (opt) => EXAMPLES.find((ex) => ex.opt === opt);
/**
 * The 2 × 2 examples of Orthogonal or not?, its own (`at(t)`, the matrix on its way from I to it, and
 * the picture's frame, so that F moves as it did there), in its order within each group; `tex`: the
 * matrix with its columns red and blue; `nudge`: a label's offset from its tip (px), where the
 * default (`beyond` for Aeᵢ, under e₁, left of e₂) would meet a label, an arrow or the edge.
 */
export const NOT = [
  { ...byOpt('a)'), tex: mat([[1, 1], [0, 1]]), nudge: { e1: [-4, 18] } },
  { ...byOpt('b)'), tex: mat([[1, -1], [1, 1]]), nudge: { a2: [8, 20], e2: [20, -16] } },
  { ...byOpt('e)'), tex: mat([[4, 2], [2, 1]], r`\tfrac15`), nudge: { a1: [8, 19], a2: [-9, -19] } },
];
export const ORTH = [
  { ...byOpt('c)'), tex: mat([[1, -1], [1, 1]], r`\tfrac1{\sqrt2}`), nudge: { a2: [-6, 18], e2: [28, -16] } },
  { ...byOpt('d)'), tex: mat([[-1, 0], [0, 1]]), nudge: { a1: [12, 18], a2: [-20, -14], e2: [18, -14] } },
  { ...byOpt('f)'), tex: mat([['3/5', '4/5'], ['4/5', '-3/5']]), nudge: { e1: [22, 22] } },
];

/** The default offset (px) of the label of the arrow from the origin to `tip`: a little beyond its tip. */
export function beyond(p, tip, d = 21) {
  const x = p.px(tip[0]) - p.px(0);
  const y = p.py(tip[1]) - p.py(0);
  const len = Math.hypot(x, y) || 1;
  return [(d * x) / len, (d * y) / len];
}

// The redesign's frame (the user's request, "more aesthetic"): Orthogonal or not?'s, a little taller
// (it once held the unit circle, dotted, which the user removed), and drawn larger, with no frame,
// grid or card round it.
export const FX = [-1.2, 2.2];
export const FY = [-1.12, 2.12];
export const FU = 55;
export const AXIS = '#cfd4dc';

/**
 * The right-angle mark at the origin between the arrows to `a` and `b` (`s`: its side, in units), in
 * full where they are perpendicular, fading out as the angle leaves 90° or an arrow shrinks to 0
 * (d)'s Ae₁ on its way through the origin).
 */
export function RightAngle({ p, a, b, s = 0.17 }) {
  const la = Math.hypot(a[0], a[1]);
  const lb = Math.hypot(b[0], b[1]);
  if (la < 1e-6 || lb < 1e-6) return null;
  const cos = (a[0] * b[0] + a[1] * b[1]) / (la * lb);
  const opacity = clamp01(1 - Math.abs(cos) / 0.04) * clamp01((Math.min(la, lb) - 0.25) / 0.15);
  if (opacity <= 0) return null;
  const u = [(s * a[0]) / la, (s * a[1]) / la];
  const v = [(s * b[0]) / lb, (s * b[1]) / lb];
  const q = [u, [u[0] + v[0], u[1] + v[1]], v].map(([x, y]) => `${p.px(x)},${p.py(y)}`).join(' ');
  return <polyline points={q} fill="none" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" opacity={opacity} />;
}

/**
 * One example: its matrix over its picture, Orthogonal or not?'s animation on a cleaner stage (the
 * redesign): the axes, faint; the unit square and F in gray, and their image under `ex.at(t)`, the
 * square tinted, green if orthogonal, red if not; e₁, e₂ (gray, dashed) and Ae₁ (red), Ae₂ (blue) on
 * top, in a white casing so that they show on F, with the right-angle mark while they are
 * perpendicular. The labels of Aeᵢ fade in as the arrows arrive; the labels come after all the
 * arrows, in a white halo.
 */
export function Example({ ex, color, t }) {
  const M = ex.at(t);
  const A = ex.at(1);
  const a1 = apply(M, [1, 0]);
  const a2 = apply(M, [0, 1]);
  const n = ex.nudge ?? {};
  const at = (key, [x, y], [dx, dy]) => [x + (n[key]?.[0] ?? dx), y + (n[key]?.[1] ?? dy)];
  const arrive = clamp01((t - 0.6) / 0.4);
  return (
    <div className="l21-ot-ex">
      <p className="l21-ot-mat">
        <Tex tex={ex.tex} />
      </p>
      <Plane xRange={FX} yRange={FY} unit={FU} pad={2} grid={false} axes={false} title={`What it does: ${ex.what}`}>
        {(p) => {
          const fixed = [
            { tex: r`\vv e_1`, color: GRAY, xy: at('e1', [p.px(1), p.py(0)], [4, 18]) },
            { tex: r`\vv e_2`, color: GRAY, xy: at('e2', [p.px(0), p.py(1)], [-20, 2]) },
          ];
          const moving = [
            { tex: r`A\vv e_1`, color: RED, xy: at('a1', [p.px(a1[0]), p.py(a1[1])], beyond(p, apply(A, [1, 0]))) },
            { tex: r`A\vv e_2`, color: BLUE, xy: at('a2', [p.px(a2[0]), p.py(a2[1])], beyond(p, apply(A, [0, 1]))) },
          ];
          return (
            <g>
              <g stroke={AXIS} strokeWidth="1.3">
                <line x1={p.px(FX[0])} y1={p.py(0)} x2={p.px(FX[1])} y2={p.py(0)} />
                <line x1={p.px(0)} y1={p.py(FY[0])} x2={p.px(0)} y2={p.py(FY[1])} />
              </g>
              <FImage p={p} home />
              <FImage p={p} M={M} color={color} opacity={0.88} squareFill={`${color}1c`} />
              <Arrow p={p} to={[1, 0]} color={GRAY} width={1.7} head={8} shaftProps={{ strokeDasharray: '4 4' }} />
              <Arrow p={p} to={[0, 1]} color={GRAY} width={1.7} head={8} shaftProps={{ strokeDasharray: '4 4' }} />
              <Arrow p={p} to={a1} color="#fff" width={6} head={14} />
              <Arrow p={p} to={a2} color="#fff" width={6} head={14} />
              <Arrow p={p} to={a1} color={RED} width={2.7} head={11} />
              <Arrow p={p} to={a2} color={BLUE} width={2.7} head={11} />
              <RightAngle p={p} a={a1} b={a2} />
              <Dot p={p} at={[0, 0]} color={INK} r={3} />
              <g className="l21-ot-labels">
                {fixed.map((l) => (
                  <TexSvg key={l.tex} x={l.xy[0]} y={l.xy[1]} tex={l.tex} color={l.color} size={19} w={50} h={28} />
                ))}
                {moving.map((l) => (
                  <TexSvg key={l.tex} x={l.xy[0]} y={l.xy[1]} tex={l.tex} color={l.color} size={19} w={50} h={28} opacity={arrive} />
                ))}
              </g>
            </g>
          );
        }}
      </Plane>
    </div>
  );
}

/** True from key press `index` on, and the fragment marker that tells. */
export function useMarker(index) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const marker = <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />;
  return [on, marker, ref];
}

/** An example's animation, played once from key press `index` on: its t, its marker, and whether shown. */
export function useOnce(index) {
  const [on, marker, ref] = useMarker(index);
  const t = useTween(on, { ms: 1500, delay: 400 });
  return [t, marker, ref, on];
}

/**
 * Orthogonal matrices as linear transformations (the user's request, after Orthogonal or not?), in
 * few words (the user's request): "Let A be an orthogonal matrix. The linear transformation
 * T_A(x) = Ax sends eᵢ to columns of A, which are by definition orthonormal." (the user's words). Then
 * the 2 × 2 examples of Orthogonal or not? in two groups (g) and h), 3 × 3, left out; the user removed
 * the options' letters), side by side in a T-chart (rule 14d), Not orthogonal on the left (the
 * user's request), each example its matrix (the columns red and blue) over Orthogonal or not?'s
 * picture, moving as it did there (the user's request: the same animations, with eᵢ and Aeᵢ added on
 * top), one example per key press, played once as it comes (the user's request): key presses 1–3,
 * Not orthogonal (red, with the first): a) a shear, b) [1 −1; 1 1], e) the projection onto the line
 * through (2, 1) (the user's request); 4: under them, the unit square gets sheared, stretched or
 * squashed ("the unit square gets …", the user's words); 5–7: Orthogonal (green, with the first):
 * c) the rotation by 45°, d) the reflection across the y-axis, f) a reflection, then, f) done, all six
 * on a loop, as Orthogonal or not? replays them; 8: under them, "The unit square stays a unit square,
 * possibly rotated or flipped." (the user's words). Print: the images. (It was a recall
 * of T_A beside one picture, cross-faded from A = [1 1/2; 1/2 1] to the rotation
 * [3/5 −4/5; 4/5 3/5], and two sentences more; then the same chart with still pictures.) Redesigned
 * to look better (the user's request): the sentence in a box, the pictures larger and frameless, the
 * image square tinted and a right-angle mark while Ae₁ ⟂ Ae₂, the heads and the sentences under the
 * pictures centred (and the unit circle, dotted, which the user removed).
 */
export default function Slide03eOrthTransform() {
  // each example played once on its key press (a), b), e) on 1–3, c), d), f) on 5–7), then, f) done,
  // all six on a loop, from the images back to F and forth again (1 − swing, so that nothing jumps)
  const [ta, ma, ref] = useOnce(1);
  const [tb, mb] = useOnce(2);
  const [te, me] = useOnce(3);
  const [tc, mc] = useOnce(5);
  const [td, md] = useOnce(6);
  const [tf, mf, , onLast] = useOnce(7);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  const swing = useSwing(onLast, { ms: 1500, hold: 1100, delay: 400 + 1500 + 1100, live });
  const at = (once) => (PRINT ? 1 : Math.min(once, 1 - swing));
  const tNot = [ta, tb, te].map(at);
  const tOrth = [tc, td, tf].map(at);
  return (
    <section>
      <h2>Orthogonal matrices as linear transformations</h2>
      {ma}
      {mb}
      {me}
      {mc}
      {md}
      {mf}

      <div className="block theorem l21-ot-lead">
        <p>
          Let <Tex tex="A" /> be an orthogonal matrix. The linear transformation <Tex tex={r`T_A(\vv x)=A\vv x`} /> sends <Tex tex={r`\vv e_i`} /> to columns of <Tex tex="A" />, which are by definition orthonormal.
        </p>
      </div>

      <div className="l21-ot-chart">
        <Fragment index={1} as="p" className="l21-ot-head l21-ot-left l21-oq-no">
          Not orthogonal
        </Fragment>
        <Fragment index={5} as="p" className="l21-ot-head l21-ot-right l21-oq-yes">
          Orthogonal
        </Fragment>
        <Fragment index={1} className="l21-ot-rule" />
        <Fragment index={1} className="l21-ot-divider" />
        <div className="l21-ot-row l21-ot-left">
          {NOT.map((ex, i) => (
            <Fragment key={ex.opt} index={1 + i}>
              <Example ex={ex} color={RED} t={tNot[i]} />
            </Fragment>
          ))}
        </div>
        <div className="l21-ot-row l21-ot-right">
          {ORTH.map((ex, i) => (
            <Fragment key={ex.opt} index={5 + i}>
              <Example ex={ex} color={GREEN} t={tOrth[i]} />
            </Fragment>
          ))}
        </div>
        <Fragment index={4} as="p" className="l21-ot-says l21-ot-left">
          The unit&nbsp;square gets sheared, stretched or squashed.
        </Fragment>
        <Fragment index={8} as="p" className="l21-ot-says l21-ot-right">
          The unit&nbsp;square stays a unit&nbsp;square, possibly rotated or flipped.
        </Fragment>
      </div>
    </section>
  );
}
