import { useEffect, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import { ChallengeLink } from '../components/ChallengeCard.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { sample, levelSegments, segmentsPath, lineColor } from '../components/levels.js';
import { PRINT } from '../components/bay.js';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';

// the arm: upper arm and forearm (m), the cup it reaches for, and its parked pose (degrees)
export const L1 = 0.5;
export const L2 = 0.4;
export const CUP = [0.6, -0.35];
export const START = [135, -90];

export const rad = (d) => (d * Math.PI) / 180;
export const deg = (a) => (a * 180) / Math.PI;
export const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

/** The elbow and the hand for the angles t1, t2 (degrees). */
export function joints(t1, t2) {
  const a = rad(t1);
  const b = rad(t1 + t2);
  const elbow = [L1 * Math.cos(a), L1 * Math.sin(a)];
  return { elbow, hand: [elbow[0] + L2 * Math.cos(b), elbow[1] + L2 * Math.sin(b)] };
}

/** D(t1, t2) = ‖f(t1, t2) − p‖, the distance from the hand to the cup (m). */
export function dist(t1, t2) {
  const { hand } = joints(t1, t2);
  return Math.hypot(hand[0] - CUP[0], hand[1] - CUP[1]);
}

// the level set D = 0: the two poses that reach the cup
export const PITS = (() => {
  const c2 = (CUP[0] ** 2 + CUP[1] ** 2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  return [1, -1].map((s) => {
    const b = s * Math.acos(c2);
    const a = Math.atan2(CUP[1], CUP[0]) - Math.atan2(L2 * Math.sin(b), L1 + L2 * Math.cos(b));
    return { at: [deg(a), deg(b)], name: s > 0 ? 'elbow down' : 'elbow up' };
  });
})();

/**
 * Gradient descent on ½D² from (t1, t2), down to the cup: the points (degrees), about one degree
 * apart, so that the dot moves at a steady pace.
 */
export function descent([t1, t2]) {
  let a = rad(t1);
  let b = rad(t2);
  const pts = [[t1, t2]];
  for (let k = 0; k < 20000; k += 1) {
    const s1 = Math.sin(a);
    const c1 = Math.cos(a);
    const s12 = Math.sin(a + b);
    const c12 = Math.cos(a + b);
    const e = [L1 * c1 + L2 * c12 - CUP[0], L1 * s1 + L2 * s12 - CUP[1]];
    if (Math.hypot(e[0], e[1]) < 1e-3) break;
    // the gradient of ½‖f − p‖² is (derivative matrix of f)ᵀ (f − p)
    a -= 0.1 * ((-L1 * s1 - L2 * s12) * e[0] + (L1 * c1 + L2 * c12) * e[1]);
    b -= 0.1 * (-L2 * s12 * e[0] + L2 * c12 * e[1]);
    const last = pts[pts.length - 1];
    if (Math.hypot(deg(a) - last[0], deg(b) - last[1]) >= 1) pts.push([deg(a), deg(b)]);
  }
  pts.push([deg(a), deg(b)]);
  return pts;
}

/** The distance from the point q to the segment ab. */
export function segDist(q, a, b) {
  const v = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * v[0] + (q[1] - a[1]) * v[1]) / (v[0] ** 2 + v[1] ** 2)));
  return Math.hypot(q[0] - a[0] - t * v[0], q[1] - a[1] - t * v[1]);
}

/**
 * Where to put the label of the hand (the middle of the text, m): of eight spots around the hand,
 * the one farthest from the arm and the cup that stays inside the picture.
 */
export function handLabelAt(elbow, hand) {
  let best;
  let score = -Infinity;
  for (let k = 0; k < 8; k += 1) {
    const a = (k * Math.PI) / 4;
    const q = [hand[0] + 0.3 * Math.cos(a), hand[1] + 0.13 * Math.sin(a)];
    const sc = Math.min(
      segDist(q, [0, 0], elbow) / 0.6, // the label is wide: keep it farther from the links
      segDist(q, elbow, hand) / 0.6,
      Math.hypot(q[0] - CUP[0], q[1] - CUP[1]) / 0.6,
      (ARM_R - 0.22 - Math.abs(q[0])) * 4,
      (ARM_R - 0.06 - Math.abs(q[1])) * 4,
    );
    if (sc > score) [best, score] = [q, sc];
  }
  return best;
}

/** Points along an arc around c from angle a0 to a1 (degrees), radius rr. */
export function arc(c, rr, a0, a1, map) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 4));
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = rad(a0 + ((a1 - a0) * k) / n);
    return map([c[0] + rr * Math.cos(t), c[1] + rr * Math.sin(t)]).map((v) => v.toFixed(1)).join(',');
  }).join(' ');
}

export const ARM_SIZE = 370;
export const ARM_R = 0.97; // half the width of the picture (m)

/** The arm at the angles t1, t2: the shoulder, the elbow, the hand, the angles and the cup. */
export function ArmFigure({ t1, t2 }) {
  const k = ARM_SIZE / 2 / ARM_R;
  const map = ([x, y]) => [ARM_SIZE / 2 + x * k, ARM_SIZE / 2 - y * k];
  const { elbow, hand } = joints(t1, t2);
  const [sx, sy] = map([0, 0]);
  const [ex, ey] = map(elbow);
  const [hx, hy] = map(hand);
  const [cx, cy] = map(CUP);
  // the gripper: a bar across the forearm just behind the hand, and two fingers around it
  const u = [Math.cos(rad(t1 + t2)), Math.sin(rad(t1 + t2))];
  const n = [-u[1], u[0]];
  const at = (s, w) => map([hand[0] + s * u[0] + w * n[0], hand[1] + s * u[1] + w * n[1]]);
  const grip = [at(0.035, 0.045), at(-0.035, 0.045), at(-0.035, -0.045), at(0.035, -0.045)];
  // θ1's label goes inside its arc, unless the arc is too small: then just outside it
  const mid1 = rad(Math.abs(t1) < 30 ? (t1 >= 0 ? -16 : 16) : t1 / 2);
  const mid2 = rad(t1 + t2 / 2);
  const d = dist(t1, t2);
  const [lx, ly] = map(handLabelAt(elbow, hand));
  const cupW = 0.09 * k;
  const cupH = 0.13 * k;

  return (
    <svg
      className="figure-svg arm-fig"
      viewBox={`0 0 ${ARM_SIZE} ${ARM_SIZE}`}
      width={ARM_SIZE}
      height={ARM_SIZE}
      role="img"
      aria-label="A robot arm with a shoulder and an elbow, reaching for a cup on a table"
    >
      {/* the table and the cup, whose middle is the point p */}
      <rect x={cx - 0.2 * k} y={cy + cupH / 2} width={0.6 * k} height={6} rx={2} fill="#c9b79c" />
      <path
        d={`M${cx - cupW / 2} ${cy - cupH / 2} L${cx + cupW / 2} ${cy - cupH / 2} L${cx + cupW * 0.4} ${cy + cupH / 2} L${cx - cupW * 0.4} ${cy + cupH / 2} Z`}
        fill="#fde68a"
        stroke="#b7791f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={`M${cx + cupW * 0.47} ${cy - cupH * 0.25} q${cupW * 0.45} ${cupH * 0.2} 0 ${cupH * 0.45}`} fill="none" stroke="#b7791f" strokeWidth="2.5" />
      <text x={cx + cupW / 2 + 16} y={cy + cupH / 2 - 12} fill="#8a5a12" fontSize="20" fontWeight="700" fontFamily="KaTeX_Main, Georgia, serif">
        p
      </text>

      {/* the base under the shoulder */}
      <path d={`M${sx - 22} ${sy + 34} L${sx + 22} ${sy + 34} L${sx + 9} ${sy + 4} L${sx - 9} ${sy + 4} Z`} fill="#cbd5e1" />

      {/* the angles: θ1 from the horizontal, θ2 from the line of the upper arm */}
      <g fill="none" strokeWidth="2">
        <line x1={sx} y1={sy} x2={sx + 0.26 * k} y2={sy} stroke={TEAL} strokeDasharray="5 5" />
        <polyline points={arc([0, 0], 0.15, 0, t1, map)} stroke={TEAL} />
        <line x1={ex} y1={ey} x2={ex + (ex - sx) * 0.42} y2={ey + (ey - sy) * 0.42} stroke={CARDINAL} strokeDasharray="5 5" />
        <polyline points={arc(elbow, 0.12, t1, t1 + t2, map)} stroke={CARDINAL} />
      </g>
      <g fontSize="19" fontWeight="700" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif" textAnchor="middle" dominantBaseline="middle">
        <text x={sx + Math.cos(mid1) * 0.23 * k} y={sy - Math.sin(mid1) * 0.23 * k} fill={TEAL}>
          θ<tspan fontSize="13" dy="5" fontStyle="normal">1</tspan>
        </text>
        <text x={ex + Math.cos(mid2) * 0.2 * k} y={ey - Math.sin(mid2) * 0.2 * k} fill={CARDINAL}>
          θ<tspan fontSize="13" dy="5" fontStyle="normal">2</tspan>
        </text>
      </g>

      {/* the arm */}
      <g stroke={INK} strokeLinecap="round" fill="none">
        <line x1={sx} y1={sy} x2={ex} y2={ey} strokeWidth="11" />
        <line x1={ex} y1={ey} x2={at(-0.035, 0)[0]} y2={at(-0.035, 0)[1]} strokeWidth="8" />
        <polyline points={grip.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')} strokeWidth="4" strokeLinejoin="round" />
      </g>
      <circle cx={sx} cy={sy} r={8} fill="#fff" stroke={INK} strokeWidth="3" />
      <circle cx={ex} cy={ey} r={6.5} fill="#fff" stroke={INK} strokeWidth="3" />

      {/* key press 1: the hand is at f(θ1, θ2); 3: its distance D to the cup */}
      <Fragment as="g" index={3}>
        {d > 0.02 && <line x1={hx} y1={hy} x2={cx} y2={cy} stroke={CARDINAL} strokeWidth="2" strokeDasharray="0.1 6" strokeLinecap="round" />}
        <text x={10} y={ARM_SIZE - 12} fill={CARDINAL} fontSize="17" fontFamily="KaTeX_Main, Georgia, serif">
          <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">D</tspan> = {d.toFixed(2)} m
        </text>
      </Fragment>
      <Fragment as="g" index={1}>
        <text
          x={lx}
          y={ly + 6}
          textAnchor="middle"
          fill={INK}
          fontSize="17"
          fontFamily="KaTeX_Main, Georgia, serif"
          paintOrder="stroke"
          stroke="#fff"
          strokeWidth="4"
        >
          <tspan fontWeight="700">f</tspan>(<tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">θ</tspan>
          <tspan fontSize="11" dy="4">1</tspan>
          <tspan dy="-4">, </tspan>
          <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">θ</tspan>
          <tspan fontSize="11" dy="4">2</tspan>
          <tspan dy="-4">)</tspan>
        </text>
      </Fragment>
    </svg>
  );
}

export const MAP = 340; // the square of the contour plot, px
export const M_LEFT = 50;
export const M_BOTTOM = 44;
export const LEVELS = Array.from({ length: 15 }, (_, i) => 0.1 * (i + 1));
export const GRID = sample(dist, [-180, 180], [-180, 180], 144);
export const CONTOURS = LEVELS.map((c) => ({ c, segs: levelSegments(GRID, c) }));
export const TICKS = [-180, -90, 0, 90, 180];

/**
 * The contour plot of D over the angles (θ1, θ2) ∈ [−180°, 180°]², with the pose (t1, t2) as a dot
 * that can be dragged, the two poses where D = 0, and the path of gradient descent so far.
 */
export function AngleMap({ t1, t2, onChange = () => {}, path }) {
  const px = (t) => M_LEFT + ((t + 180) / 360) * MAP;
  const py = (t) => MAP - ((t + 180) / 360) * MAP + 6;
  const map = ([a, b]) => [px(a), py(b)];
  const svgRef = useRef(null);

  const move = (e) => {
    const box = svgRef.current.getBoundingClientRect();
    const s = box.width / (M_LEFT + MAP + 12); // the slide is scaled
    const a = ((e.clientX - box.left) / s - M_LEFT) / MAP;
    const b = 1 - ((e.clientY - box.top) / s - 6) / MAP;
    const clamp = (v) => Math.round(Math.max(-180, Math.min(180, 360 * v - 180)));
    onChange([clamp(a), clamp(b)]);
  };

  // the path, broken where it goes off one edge and comes back at the other
  const trail = useMemo(() => {
    if (!path || path.length < 2) return '';
    let d = '';
    path.forEach(([a, b], i) => {
      const [x, y] = map([wrap(a), wrap(b)]);
      const prev = path[i - 1];
      const jump = prev && (Math.abs(wrap(a) - wrap(prev[0])) > 180 || Math.abs(wrap(b) - wrap(prev[1])) > 180);
      d += `${i === 0 || jump ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return d;
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      ref={svgRef}
      className="arm-map"
      viewBox={`0 0 ${M_LEFT + MAP + 12} ${MAP + 6 + M_BOTTOM}`}
      width={M_LEFT + MAP + 12}
      height={MAP + 6 + M_BOTTOM}
      role="img"
      aria-label="The contour plot of the distance D from the hand to the cup, over the two angles"
      data-prevent-swipe
      onPointerDown={(e) => {
        if (PRINT) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
      }}
    >
      <rect x={M_LEFT} y={6} width={MAP} height={MAP} rx={6} fill="#fff" stroke="#e5e7eb" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {CONTOURS.map(({ c, segs }) => (
          <path key={c} d={segmentsPath(segs, map)} stroke={lineColor(c / 1.6)} strokeWidth="1.6" />
        ))}
      </g>

      {/* the level set D = 0: two points */}
      {PITS.map(({ at, name }) => {
        const [x, y] = map(at);
        return (
          <g key={name}>
            <path d={`M${x - 6} ${y - 6}L${x + 6} ${y + 6}M${x - 6} ${y + 6}L${x + 6} ${y - 6}`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
            <text x={x - 12} y={y + 5} textAnchor="end" fontSize="14" fill={INK} fontFamily="KaTeX_Main, Georgia, serif" paintOrder="stroke" stroke="#fff" strokeWidth="4">
              {name}
            </text>
          </g>
        );
      })}

      {trail && <path d={trail} fill="none" stroke={CARDINAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      <circle cx={px(wrap(t1))} cy={py(wrap(t2))} r={8} fill={CARDINAL} stroke="#fff" strokeWidth="2.5" style={{ cursor: 'grab' }} />

      {/* the axes */}
      <g fontSize="13" fill="#6b7280" fontFamily="KaTeX_Main, Georgia, serif">
        {TICKS.map((t) => (
          <g key={t}>
            <text x={px(t)} y={MAP + 24} textAnchor="middle">{`${t < 0 ? '−' : ''}${Math.abs(t)}°`}</text>
            <text x={M_LEFT - 6} y={py(t) + 4} textAnchor="end">{`${t < 0 ? '−' : ''}${Math.abs(t)}°`}</text>
          </g>
        ))}
      </g>
      <g fontSize="17" fontWeight="700" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
        <text x={M_LEFT + MAP / 2} y={MAP + 6 + 38} textAnchor="middle" fill={TEAL}>
          θ<tspan fontSize="12" dy="4" fontStyle="normal">1</tspan>
        </text>
        <text x={14} y={6 + MAP / 2} textAnchor="middle" fill={CARDINAL}>
          θ<tspan fontSize="12" dy="4" fontStyle="normal">2</tspan>
        </text>
      </g>
    </svg>
  );
}

export const fmtDeg = (v) => `${v < 0 ? '−' : ''}${Math.abs(Math.round(v))}°`;

export function AngleSliders({ t, onChange = () => {} }) {
  return (
    <div className="graph-slider arm-sliders">
      <Slider name="theta 1" label={<Tex tex={r`\theta_1`} />} value={t[0]} onChange={(v) => onChange([v, t[1]])} color={TEAL} min={-180} max={180} step={1} format={fmtDeg} />
      <Slider name="theta 2" label={<Tex tex={r`\theta_2`} />} value={t[1]} onChange={(v) => onChange([t[0], v])} color={CARDINAL} min={-180} max={180} step={1} format={fmtDeg} />
    </div>
  );
}

export const PRINT_PATH = descent(START);
export const PRINT_END = PRINT_PATH[PRINT_PATH.length - 1].map(wrap);

/**
 * How does a robot arm reach for a cup? (After composite functions.) (For the Longevity Design Challenge
 * 2026–27, "Human-Centered Robotics for Longevity": its name, a link to its page, in one line at
 * the bottom, on the last key press, 6.) A two-joint arm, turned by θ1 at the
 * shoulder and θ2 at the elbow, on the left; sliders for the angles. The text in the middle. Key press 1: the position of the arm,
 * f(θ1, θ2), f: ℝ² → ℝ². 2: the distance function d: ℝ² → ℝ, d(x) = ‖x − p‖. 3: the composition
 * D(θ1, θ2) = d(f(θ1, θ2)) = ‖f(θ1, θ2) − p‖, the distance between the arm and the cup. 4: the
 * contour plot of D over the angles, titled "Contour plot for D(θ1, θ2)", a map of the poses (drag
 * the dot), with the two poses where D = 0, elbow up and elbow down, marked. 5: gradient descent
 * slides the dot downhill on the map, and the arm reaches the cup, with "(→ gradient descent in
 * Chapter 11)" under the map, flush right.
 */
export default function Slide19bRobotArm() {
  const [t, setT] = useState(START);
  const [path, setPath] = useState(null);
  const descendRef = useRef(null);
  const descending = useFragmentShown(descendRef);
  const before = useRef(null);
  const tNow = useRef(t);
  tNow.current = t;

  // key press 5: slide downhill from where the dot is; going back puts the arm where it was
  useEffect(() => {
    if (PRINT) return undefined;
    if (!descending) {
      if (before.current) setT(before.current);
      before.current = null;
      setPath(null);
      return undefined;
    }
    before.current = tNow.current;
    const pts = descent(tNow.current);
    let frame;
    let t0;
    const ms = Math.min(3200, 600 + 14 * pts.length);
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      const k = Math.min(1, (now - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const m = Math.round(e * (pts.length - 1));
      setPath(pts.slice(0, m + 1));
      setT(pts[m].map(wrap));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [descending]);

  const setPose = (p) => {
    setPath(null);
    setT(p);
  };

  return (
    <section className="dense">
      <h2>How does a robot arm reach for a cup?</h2>
      <span ref={descendRef} className="fragment fx-marker" data-fragment-index={5} aria-hidden="true" />

      <div className="arm">
        <div className="arm-pose">
          {PRINT ? (
            <div className="stack">
              <Fragment index={5} effect="fade-out">
                <ArmFigure t1={START[0]} t2={START[1]} />
                <AngleSliders t={START} />
              </Fragment>
              <Fragment index={5}>
                <ArmFigure t1={PRINT_END[0]} t2={PRINT_END[1]} />
                <AngleSliders t={PRINT_END.map(Math.round)} />
              </Fragment>
            </div>
          ) : (
            <>
              <ArmFigure t1={t[0]} t2={t[1]} />
              <AngleSliders t={t} onChange={setPose} />
            </>
          )}
        </div>

        <div className="arm-side">
          <Fragment index={1} className="arm-step">
            <p>
              Position of the arm <Tex tex={r`\vv{f}:\mathbb{R}^2\to\mathbb{R}^2`} />:
            </p>
            <Tex
              display
              tex={r`\vv{f}(\theta_1,\theta_2)=\begin{bmatrix}L_1\cos\theta_1+L_2\cos(\theta_1+\theta_2)\\ L_1\sin\theta_1+L_2\sin(\theta_1+\theta_2)\end{bmatrix}.`}
            />
          </Fragment>

          <Fragment index={2} className="arm-step">
            <p>
              Distance function <Tex tex={r`d:\mathbb{R}^2\to\mathbb{R}`} />:
            </p>
            <Tex display tex={r`d(\vv{x})=\norm{\vv{x}-\vv{p}}.`} />
          </Fragment>

          <Fragment index={3}>
            <p>Composition</p>
            <Tex display tex={r`D(\theta_1,\theta_2)=d\bigl(\vv{f}(\theta_1,\theta_2)\bigr)=\norm{\vv{f}(\theta_1,\theta_2)-\vv{p}}`} />
            <p>is the distance between the arm and the cup.</p>
          </Fragment>
        </div>

        <div className="arm-right">
          <Fragment index={4} className="arm-map-wrap">
            <p className="arm-map-title">
              Contour plot for <Tex tex={r`D(\theta_1,\theta_2)`} />
            </p>
            {PRINT ? (
              <div className="stack">
                <Fragment index={5} effect="fade-out">
                  <AngleMap t1={START[0]} t2={START[1]} />
                </Fragment>
                <Fragment index={5}>
                  <AngleMap t1={PRINT_END[0]} t2={PRINT_END[1]} path={PRINT_PATH} />
                </Fragment>
              </div>
            ) : (
              <AngleMap t1={t[0]} t2={t[1]} onChange={setPose} path={path} />
            )}
          </Fragment>
          <Fragment index={5} as="p" className="pointer right">
            (→ gradient descent in Chapter 11)
          </Fragment>
        </div>
      </div>

      <Fragment index={6} as="p" className="arm-foot">
        <ChallengeLink />
      </Fragment>
    </section>
  );
}
