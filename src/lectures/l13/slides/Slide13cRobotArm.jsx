import { useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import { useFragmentShown, useGlide } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { MAIN, MATH } from '../components/svgmath.jsx';

export const CARDINAL = '#8c1515'; // θ₂ and its column, as in Lecture 7
export const TEAL = '#0e7490'; // θ₁ and its column
export const INK = '#14213d';
export const GOLD = '#d99a1e'; // the linear approximation, as on Zooming in

// Lecture 7's arm: upper arm and forearm (m); the pose on arrival (degrees)
export const L1 = 0.5;
export const L2 = 0.4;
export const START = [20, 70];
export const H = 0.25; // the turns h₁ = h₂ = 0.25 rad (14°) of the arrows, and the bound of the region
export const SIZE = 400;
// the picture shows x and y from −0.2 to 1 (m), around the hand rather than the shoulder, so that
// the arrows and the parallelogram are large enough to see
export const [X0, X1, Y1] = [-0.2, 1, 1];
export const K = SIZE / (X1 - X0);

export const rad = (d) => (d * Math.PI) / 180;
export const f = (a, b) => [L1 * Math.cos(a) + L2 * Math.cos(a + b), L1 * Math.sin(a) + L2 * Math.sin(a + b)];
/** The columns of (Df)(θ₁, θ₂) (θ in radians). */
export const columns = (a, b) => [
  [-L1 * Math.sin(a) - L2 * Math.sin(a + b), L1 * Math.cos(a) + L2 * Math.cos(a + b)],
  [-L2 * Math.sin(a + b), L2 * Math.cos(a + b)],
];
export const map = ([x, y]) => [(x - X0) * K, (Y1 - y) * K];
export const pts = (qs) => qs.map((q) => map(q).map((v) => v.toFixed(1)).join(',')).join(' ');

// the boundary of the square |h₁|, |h₂| ≤ H, counterclockwise, 24 points a side
export const EDGE = (() => {
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const out = [];
  corners.forEach((p, k) => {
    const q = corners[(k + 1) % 4];
    for (let i = 0; i < 24; i += 1) out.push([H * (p[0] + ((q[0] - p[0]) * i) / 24), H * (p[1] + ((q[1] - p[1]) * i) / 24)]);
  });
  return out;
})();

/** Points along an arc around c from angle a0 to a1 (degrees), radius rr (m). */
export function arc(c, rr, a0, a1) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 4));
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = rad(a0 + ((a1 - a0) * k) / n);
    return map([c[0] + rr * Math.cos(t), c[1] + rr * Math.sin(t)]).map((v) => v.toFixed(1)).join(',');
  }).join(' ');
}

/** An arrow from a to b (m). */
export function Arrow({ from, to, color }) {
  const [x1, y1] = map(from);
  const [x2, y2] = map(to);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 3) return null;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const h = Math.min(12, 0.5 * len);
  const w = 0.45 * h;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - ux * h * 0.8} y2={y2 - uy * h * 0.8} stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${x2 - ux * h - uy * w},${y2 - uy * h + ux * w} ${x2 - ux * h + uy * w},${y2 - uy * h - ux * w}`} fill={color} />
    </g>
  );
}

/** The label "h₁c₁" (k = 1) or "h₂c₂" just beyond the tip of its arrow, from the hand. */
export function ArrowLabel({ hand, tip, k, color }) {
  const [hx, hy] = map(hand);
  const [x, y] = map(tip);
  const l = Math.hypot(x - hx, y - hy) || 1;
  return (
    <text x={x + ((x - hx) / l) * 24} y={y + ((y - hy) / l) * 18 + 6} fill={color} textAnchor="middle" fontSize="19" fontFamily={MATH} fontStyle="italic" paintOrder="stroke" stroke="#fff" strokeWidth="4">
      h<tspan fontSize="13" dy="4" fontStyle="normal">{k}</tspan>
      <tspan dy="-4" fontWeight="700" fontStyle="normal" fontFamily={MAIN}>
        c
      </tspan>
      <tspan fontSize="13" dy="4" fontStyle="normal">
        {k}
      </tspan>
    </text>
  );
}

/**
 * The arm at (t1, t2) (degrees), drawn as in Lecture 7 (without the cup, and the hand a dot, so that
 * the arrows from it show). Key press 1: the hand's
 * moves h₁c₁ and h₂c₂ (h₁ = h₂ = 0.25) when only the shoulder, or only the elbow, turns; 2: the
 * region the hand reaches for |h₁|, |h₂| ≤ 0.25 (gray) and the parallelogram f(θ) + (Df)(θ)h that
 * approximates it (gold, dashed).
 */
export function ArmFigure({ t1, t2 }) {
  const [a, b] = [rad(t1), rad(t2)];
  const elbow = [L1 * Math.cos(a), L1 * Math.sin(a)];
  const hand = f(a, b);
  const [c1, c2] = columns(a, b);
  const [sx, sy] = map([0, 0]);
  const [ex, ey] = map(elbow);
  const reach = EDGE.map(([h1, h2]) => f(a + h1, b + h2));
  const flat = EDGE.map(([h1, h2]) => [hand[0] + h1 * c1[0] + h2 * c2[0], hand[1] + h1 * c1[1] + h2 * c2[1]]);
  const tip1 = [hand[0] + H * c1[0], hand[1] + H * c1[1]];
  const tip2 = [hand[0] + H * c2[0], hand[1] + H * c2[1]];
  const [hx, hy] = map(hand);
  // θ1's label goes inside its arc, unless the arc is too small: then just outside it
  const mid1 = rad(Math.abs(t1) < 30 ? (t1 >= 0 ? -16 : 16) : t1 / 2);
  const mid2 = rad(t1 + t2 / 2);
  const showT2 = Math.abs(t2) > 4;

  return (
    <svg className="figure-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label="A robot arm with a shoulder and an elbow; at its hand, the moves when each joint turns, and the small region the hand reaches">
      <path d={`M${sx - 22} ${sy + 34} L${sx + 22} ${sy + 34} L${sx + 9} ${sy + 4} L${sx - 9} ${sy + 4} Z`} fill="#cbd5e1" />

      {/* the angles: θ1 from the horizontal, θ2 from the line of the upper arm */}
      <g fill="none" strokeWidth="2">
        <line x1={sx} y1={sy} x2={sx + 0.26 * K} y2={sy} stroke={TEAL} strokeDasharray="5 5" />
        <polyline points={arc([0, 0], 0.15, 0, t1)} stroke={TEAL} />
        <line x1={ex} y1={ey} x2={ex + (ex - sx) * 0.42} y2={ey + (ey - sy) * 0.42} stroke={CARDINAL} strokeDasharray="5 5" />
        {showT2 && <polyline points={arc(elbow, 0.12, t1, t1 + t2)} stroke={CARDINAL} />}
      </g>
      <g fontSize="19" fontWeight="700" fontStyle="italic" fontFamily={MATH} textAnchor="middle" dominantBaseline="middle">
        <text x={sx + Math.cos(mid1) * 0.23 * K} y={sy - Math.sin(mid1) * 0.23 * K} fill={TEAL}>
          θ<tspan fontSize="13" dy="5" fontStyle="normal">1</tspan>
        </text>
        {showT2 && (
          <text x={ex + Math.cos(mid2) * 0.2 * K} y={ey - Math.sin(mid2) * 0.2 * K} fill={CARDINAL}>
            θ<tspan fontSize="13" dy="5" fontStyle="normal">2</tspan>
          </text>
        )}
      </g>

      <Fragment as="g" index={2}>
        <polygon points={pts(reach)} fill="rgba(20, 33, 61, 0.13)" stroke="#64748b" strokeWidth="1.4" />
        <polygon points={pts(flat)} fill="none" stroke={GOLD} strokeWidth="2.6" strokeDasharray="7 4" strokeLinejoin="round" />
      </Fragment>

      {/* the arm */}
      <g stroke={INK} strokeLinecap="round" fill="none">
        <line x1={sx} y1={sy} x2={ex} y2={ey} strokeWidth="11" />
        <line x1={ex} y1={ey} x2={hx} y2={hy} strokeWidth="8" />
      </g>
      <circle cx={sx} cy={sy} r={8} fill="#fff" stroke={INK} strokeWidth="3" />
      <circle cx={ex} cy={ey} r={6.5} fill="#fff" stroke={INK} strokeWidth="3" />

      <Fragment as="g" index={1}>
        <Arrow from={hand} to={tip1} color={TEAL} />
        <Arrow from={hand} to={tip2} color={CARDINAL} />
        <ArrowLabel hand={hand} tip={tip1} k={1} color={TEAL} />
        <ArrowLabel hand={hand} tip={tip2} k={2} color={CARDINAL} />
      </Fragment>
      <circle cx={hx} cy={hy} r={5.5} fill="#fff" stroke={INK} strokeWidth="3" />
    </svg>
  );
}

export const fmtDeg = (v) => `${v < 0 ? '−' : ''}${Math.abs(Math.round(v))}°`;

export function AngleSliders({ t1, t2, onT1 = () => {}, onT2 = () => {} }) {
  return (
    <div className="lc-sliders l13-arm-sliders">
      <Slider name="theta 1" label={<Tex tex={r`\theta_1`} />} value={t1} onChange={onT1} color={TEAL} min={0} max={120} step={1} format={fmtDeg} />
      <Slider name="theta 2" label={<Tex tex={r`\theta_2`} />} value={t2} onChange={onT2} color={CARDINAL} min={-160} max={160} step={1} format={fmtDeg} />
    </div>
  );
}

/**
 * Robot arm (right after Zooming in; Lecture 7's arm, the textbook's Example 13.5.11): the hand's
 * position f(θ₁, θ₂) and its derivative matrix, its columns in the joints' colors, beside the arm
 * (two sliders). Key press 1: f(θ + h) ≈ f(θ) + h₁c₁ + h₂c₂, where c₁, c₂ are the columns of
 * (Df)(θ): turning only the shoulder by h₁ moves the hand by about h₁c₁, only the elbow by h₂ by
 * about h₂c₂ (arrows at the hand); 2: for |h₁|, |h₂| ≤ 0.25, the region the hand reaches ≈ the
 * parallelogram; 3: the arm straightens (θ₂ glides to 0): c₁ ∥ c₂, the parallelogram is flat, and
 * the hand cannot move along the arm; 4: Chapter 18: solve (Df)(θ)h = Δp for the turns with the
 * inverse matrix, which fails where the arm is straight (→ Example 18.5.7). Print mode shows the
 * start pose, then the straight arm.
 */
export default function Slide13cRobotArm() {
  const marker = useRef(null);
  const straight = useFragmentShown(marker);
  const [t1, setT1] = useState(START[0]);
  const [t2, setT2] = useGlide(straight ? 0 : START[1], 1400);

  const pose = PRINT ? (
    <div className="stack">
      <Fragment index={3} effect="fade-out">
        <ArmFigure t1={START[0]} t2={START[1]} />
        <AngleSliders t1={START[0]} t2={START[1]} />
      </Fragment>
      <Fragment index={3}>
        <ArmFigure t1={START[0]} t2={0} />
        <AngleSliders t1={START[0]} t2={0} />
      </Fragment>
    </div>
  ) : (
    <>
      <ArmFigure t1={t1} t2={t2} />
      <AngleSliders t1={t1} t2={t2} onT1={setT1} onT2={setT2} />
    </>
  );

  return (
    <section className="dense">
      <h2>Robot arm</h2>
      <span ref={marker} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />

      <div className="stage l13-arm-stage">
        <div className="stage-fig l13-arm-fig" data-prevent-swipe>
          {pose}
        </div>

        <div className="stage-text">
          <p>
            Position of the hand <Tex tex={r`f:\mathbb R^2\to\mathbb R^2`} />:
          </p>
          <Tex display tex={r`f(\theta_1,\theta_2)=\begin{bmatrix}L_1\cos\theta_1+L_2\cos(\theta_1+\theta_2)\\ L_1\sin\theta_1+L_2\sin(\theta_1+\theta_2)\end{bmatrix}`} />
          <Tex
            display
            tex={r`(Df)(\theta_1,\theta_2)=\begin{bmatrix}\textcolor{${TEAL}}{-L_1\sin\theta_1-L_2\sin(\theta_1+\theta_2)}&\textcolor{${CARDINAL}}{-L_2\sin(\theta_1+\theta_2)}\\ \textcolor{${TEAL}}{L_1\cos\theta_1+L_2\cos(\theta_1+\theta_2)}&\textcolor{${CARDINAL}}{L_2\cos(\theta_1+\theta_2)}\end{bmatrix}`}
          />
          <Fragment index={1}>
            <Tex display tex={r`f(\boldsymbol\theta+\vv h)\approx f(\boldsymbol\theta)+\big((Df)(\boldsymbol\theta)\big)\vv h=f(\boldsymbol\theta)+h_1\textcolor{${TEAL}}{\vv c_1}+h_2\textcolor{${CARDINAL}}{\vv c_2}`} />
          </Fragment>
          <Fragment index={2} as="p" className="l13-arm-note">
            <Tex tex={r`|h_1|,|h_2|\le 0.25`} />: the hand’s reach (gray) <Tex tex={r`\approx`} /> a parallelogram (gold).
          </Fragment>
          <Fragment index={3} as="p" className="l13-arm-note">
            Arm straight (<Tex tex={r`\theta_2=0`} />): <Tex tex={r`\textcolor{${TEAL}}{\vv c_1}\parallel\textcolor{${CARDINAL}}{\vv c_2}`} />, so the hand can’t move along the
            arm.
          </Fragment>
          <Fragment index={4} className="block why l13-arm-18">
            <p className="block-title">Chapter 18</p>
            <p>
              To move the hand by a small <Tex tex={r`\Delta\vv p`} />, solve <Tex tex={r`\big((Df)(\boldsymbol\theta)\big)\vv h=\Delta\vv p`} /> for the
              turns <Tex tex={r`\vv h`} /> with the <strong>inverse matrix</strong>. With the arm straight, there is none: the robot gets stuck.
            </p>
            <p className="pointer corner">(→ Example 18.5.7)</p>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
