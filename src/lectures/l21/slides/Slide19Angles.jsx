import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot, AngleArc } from '../components/Plane.jsx';
import { I, B } from '../components/svgmath.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, BLUE, RED, apply, rot, clamp01 } from '../components/tr.js';

export const polar = (len, deg) => [len * Math.cos((deg * Math.PI) / 180), len * Math.sin((deg * Math.PI) / 180)];
export const X = polar(2, 70);
export const Y_LEN = 1.6;
export const Y_DEG = 115; // y at 45° from x
export const Y = polar(Y_LEN, Y_DEG);
// x and y go to Ax and Ay along a path of matrices from I: for A orthogonal, the rotations up to
// the rotation by −120° (so that Ax and Ay end well clear of x and y), all orthogonal, θ kept; for A
// not orthogonal (the user's request: lengths kept, θ changed), x and y each turn on its own circle,
// x by −140° and y by −85°, so that ‖Ax‖ = ‖x‖ and ‖Ay‖ = ‖y‖ all the way while the angle opens from
// 45° to 100°: A(t) is the matrix taking x, y there, [A(t)x  A(t)y][x  y]⁻¹ (once the stretch
// diag(1.5, 0.5), which changed the lengths too)
export const ORTH = (t) => rot(-120 * t);
export const DET = X[0] * Y[1] - Y[0] * X[1];
export const XY_INV = [
  [Y[1] / DET, -Y[0] / DET],
  [-X[1] / DET, X[0] / DET],
];
export const NOT_ORTH = (t) => {
  const ax = apply(rot(-140 * t), X);
  const ay = apply(rot(-85 * t), Y);
  return [
    [ax[0] * XY_INV[0][0] + ay[0] * XY_INV[1][0], ax[0] * XY_INV[0][1] + ay[0] * XY_INV[1][1]],
    [ax[1] * XY_INV[0][0] + ay[1] * XY_INV[1][0], ax[1] * XY_INV[0][1] + ay[1] * XY_INV[1][1]],
  ];
};
export const XR = [-1.6, 2.6]; // room on the right for the label A(x − y)
export const YR = [-2.4, 2.25]; // Ax ends at −70°, its label under it
export const unitV = (v) => {
  const k = Math.hypot(...v) || 1;
  return [v[0] / k, v[1] / k];
};

/** A label in KaTeX's fonts just past the tip of the vector `to`, out along its direction. */
export function Label({ p, to, color, children }) {
  const len = Math.hypot(...to) || 1;
  const [ux, uy] = [to[0] / len, to[1] / len];
  const anchor = ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle';
  return (
    <text x={p.px(to[0]) + 16 * ux} y={p.py(to[1]) - 16 * uy + 8 + (uy < -0.5 ? 10 : 0)} textAnchor={anchor} fontSize="25" fill={color} stroke="#fff" strokeWidth="5" paintOrder="stroke" fontFamily="KaTeX_Main, Georgia, serif">
      {children}
    </text>
  );
}

/** The angle θ between the vectors a and b: its arc, and θ on the bisector. */
export function Angle({ p, a, b, color, label = true }) {
  const bis = unitV([unitV(a)[0] + unitV(b)[0], unitV(a)[1] + unitV(b)[1]]);
  return (
    <g>
      <AngleArc p={p} a={a} b={b} radius={40} color={color} width={2.4} />
      {label && (
      <text x={p.px(0.74 * bis[0])} y={p.py(0.74 * bis[1]) + 8} textAnchor="middle" fontSize="25" fill={color} stroke="#fff" strokeWidth="5" paintOrder="stroke" fontFamily="KaTeX_Main, Georgia, serif">
        <I>θ</I>
      </text>
      )}
    </g>
  );
}

/**
 * The label of the segment from `a` to `b` (a picture of b − a), off its midpoint by `d` units, on
 * the side away from the origin (`out`) or towards it.
 */
export function SegLabel({ p, a, b, color, out = true, d = 0.3, opacity, children }) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let n = unitV([a[1] - b[1], b[0] - a[0]]);
  if ((n[0] * mid[0] + n[1] * mid[1] > 0) !== out) n = [-n[0], -n[1]];
  const anchor = n[0] > 0.5 ? 'start' : n[0] < -0.5 ? 'end' : 'middle';
  return (
    <text x={p.px(mid[0] + d * n[0])} y={p.py(mid[1] + d * n[1]) + 8} textAnchor={anchor} fontSize="23" fill={color} stroke="#fff" strokeWidth="5" paintOrder="stroke" fontFamily="KaTeX_Main, Georgia, serif" opacity={opacity}>
      {children}
    </text>
  );
}

/**
 * x and y (ink) and the angle θ between them; from key press `index`, M(t)x and M(t)y in `color`,
 * `M` a path of matrices from I, labelled Ax and Ay as they arrive (t from 0 to 1), with the angle
 * between them: θ again if `keep`, else unlabelled. From key press `gap` (if any), x − y from the tip
 * of y to the tip of x and A(x − y) = Ax − Ay from the tip of Ay to the tip of Ax, both blue and
 * dashed (the user's request).
 */
export function AnglePicture({ M, t, color, keep = false, index, gap }) {
  const m = M(t);
  const ax = apply(m, X);
  const ay = apply(m, Y);
  const arrive = clamp01((t - 0.6) / 0.4);
  const seg = (p, a, b, c) => <line x1={p.px(a[0])} y1={p.py(a[1])} x2={p.px(b[0])} y2={p.py(b[1])} stroke={c} strokeWidth="2.4" strokeDasharray="7 5" strokeLinecap="round" />;
  return (
    <Plane xRange={XR} yRange={YR} unit={74} pad={8} grid={false} axes={false} title={`x and y going to Ax and Ay; ${keep ? 'A orthogonal: the angle stays the same' : 'A not orthogonal: the lengths stay the same, the angle changes, and so does the length of x − y'}`}>
      {(p) => (
        <g>
          <line x1={p.px(XR[0])} y1={p.py(0)} x2={p.px(XR[1])} y2={p.py(0)} stroke="#e3e6eb" strokeWidth="1.4" />
          <line x1={p.px(0)} y1={p.py(YR[0])} x2={p.px(0)} y2={p.py(YR[1])} stroke="#e3e6eb" strokeWidth="1.4" />
          {gap != null && (
            <Fragment as="g" index={gap}>
              {seg(p, Y, X, BLUE)}
              {t > 0.01 && seg(p, ay, ax, BLUE)}
            </Fragment>
          )}
          <Angle p={p} a={X} b={Y} color={INK} />
          <Arrow p={p} to={X} color={INK} />
          <Arrow p={p} to={Y} color={INK} />
          <Fragment as="g" index={index}>
            {t > 0.01 && (
              <g>
                <Angle p={p} a={ax} b={ay} color={color} label={keep} />
                <Arrow p={p} to={ax} color={color} />
                <Arrow p={p} to={ay} color={color} />
                <g opacity={arrive}>
                  <Label p={p} to={ax} color={color}>
                    <I>A</I>
                    <B>x</B>
                  </Label>
                  <Label p={p} to={ay} color={color}>
                    <I>A</I>
                    <B>y</B>
                  </Label>
                </g>
              </g>
            )}
          </Fragment>
          <Dot p={p} at={[0, 0]} color={INK} r={4} />
          <Label p={p} to={X} color={INK}>
            <B>x</B>
          </Label>
          <Label p={p} to={Y} color={INK}>
            <B>y</B>
          </Label>
          {gap != null && (
            <Fragment as="g" index={gap}>
              <SegLabel p={p} a={Y} b={X} color={BLUE} d={0.26}>
                <B>x</B> − <B>y</B>
              </SegLabel>
              {t > 0.01 && (
                <SegLabel p={p} a={ay} b={ax} color={BLUE} d={0.2} opacity={arrive}>
                  <I>A</I>(<B>x</B> − <B>y</B>)
                </SegLabel>
              )}
            </Fragment>
          )}
        </g>
      )}
    </Plane>
  );
}

/**
 * Orthogonal matrices preserve lengths and angles (Christine's property; the textbook's Theorem
 * 20.4.1), with Preserving lengths is enough folded in (the user's request: the claim right away, the
 * intuition being clear from the examples; derived on the board if there is time). On arrival, in a
 * box: for any n × n matrix A, ‖Ax‖ = ‖x‖ for all x ⟺ A is orthogonal (→ Theorem 20.4.1); beside it,
 * x, y and the angle θ between them. Key press 1 (the user's requests): orthogonal matrices preserve
 * angles as well (plain, over a box); in the box, the user's words: if A is an n × n orthogonal
 * matrix, and x, y ∈ ℝⁿ, then (centred) angle between x, y = angle between Ax and Ay; in the picture,
 * played once (the user's request: Ax and Ay never go back to x and y; once on a loop),
 * x and y go to Ax and Ay (blue; A the rotation by −120°, through rotations), θ unchanged, "A
 * orthogonal" under it; no numbers. 2: under the box, "Why?" (green), the user's words: cos θ = x · y /
 * (‖x‖‖y‖) is preserved by orthogonal matrices (once the chain = x · (AᵀAy) / (‖Ax‖‖Ay‖) = Ax · Ay /
 * (‖Ax‖‖Ay‖), at first in the box). 3: in
 * its place, the same with A not orthogonal (red; the user's request: ‖Ax‖ = ‖x‖ and ‖Ay‖ = ‖y‖ kept,
 * x and y each turning on its own circle, but θ changed, opening from 45° to 100°; once the stretch
 * diag(1.5, 0.5)), "A not orthogonal" under it. 4 (the user's request): x − y (dashed, from the tip of
 * y to the tip of x) and A(x − y) (dashed, from the tip of Ay to the tip of Ax), and under the caption,
 * "The length of x − y is not preserved.", all three in blue (the user's request). (An earlier argument by ‖x − y‖, with ‖x‖, ‖y‖,
 * ‖x − y‖ under the picture, and y swinging with Ay following, gave way.) Print: Ax and Ay arrived.
 */
export default function Slide19Angles() {
  const ref1 = useRef(null);
  const ref3 = useRef(null);
  const on1 = useFragmentShown(ref1);
  const on3 = useFragmentShown(ref3);
  // each picture played once (the user's request), Ax and Ay staying where they arrive
  const t1 = useTween(on1, { ms: 1800, delay: 400 });
  const t3 = useTween(on3, { ms: 1800, delay: 400 });
  return (
    <section>
      <h2>Orthogonal matrices preserve lengths and angles</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block theorem l21-ang-main">
            <p>
              For any <Tex tex={r`n\times n`} /> matrix <Tex tex="A" />:
            </p>
            <Tex display tex={r`\norm{A\vv x}=\norm{\vv x}\ \text{ for all }\vv x\in\mathbb R^n\iff A\text{ is orthogonal.}`} />
            <p className="pointer corner">(→ Theorem 20.4.1)</p>
          </div>
          <Fragment index={1} className="l21-ang-so-wrap">
            <p className="l21-ang-lead">Orthogonal matrices preserve angles as well:</p>
            <div className="block theorem l21-ang-so">
              <p>
                If <Tex tex="A" /> is an <Tex tex={r`n\times n`} /> orthogonal matrix, and <Tex tex={r`\vv x,\vv y\in\mathbb R^n`} />, then
              </p>
              <Tex display className="centered" tex={r`\text{angle between }\vv x,\vv y=\text{angle between }A\vv x\text{ and }A\vv y`} />
            </div>
          </Fragment>
          <Fragment index={2} as="p" className="l21-ang-cos">
            <span className="l21-why-label">Why?</span> <Tex tex={r`\cos\theta=\dfrac{\vv x\cdot\vv y}{\norm{\vv x}\,\norm{\vv y}}`} /> is preserved by orthogonal matrices.
          </Fragment>
        </div>

        <div className="stage-fig l21-ang-fig">
          <span ref={ref1} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
          <span ref={ref3} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
          <div className="l21-stack">
            <Fragment index={3} effect="fade-out">
              <AnglePicture M={ORTH} t={PRINT ? 1 : t1} color={BLUE} keep index={1} />
              <Fragment index={1} as="p" className="l21-ang-cap">
                <Tex tex="A" /> orthogonal
              </Fragment>
            </Fragment>
            <Fragment index={3}>
              <AnglePicture M={NOT_ORTH} t={PRINT ? 1 : t3} color={RED} index={3} gap={4} />
              <p className="l21-ang-cap">
                <Tex tex="A" /> not orthogonal
              </p>
              <Fragment index={4} as="p" className="l21-ang-cap l21-ang-gap">
                The length of <Tex tex={r`\vv x-\vv y`} /> is not preserved.
              </Fragment>
            </Fragment>
          </div>
        </div>
      </div>
    </section>
  );
}
