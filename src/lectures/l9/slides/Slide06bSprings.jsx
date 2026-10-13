import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { lineColor } from '../components/levels.js';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const RED = '#8c1515';
export const INK = '#14213d';
export const GRAY = '#6b7280';
export const TEAL = '#0e7490';
export const VIOLET = '#6d28d9';
export const MATH = 'KaTeX_Math, Georgia, serif';
export const MAIN = 'KaTeX_Main, Georgia, serif';

// ---------- The physics (the textbook's Example 10.1.3) ----------
// Two identical springs, natural length 0.5 m (the unit of length below, as in the textbook, where
// the springs have length 1), 9.8 N/m; the weights 0.1–0.8 kg. A drag on each weight proportional
// to its mass and its speed (rate GAMMA) makes the bouncing die out in about 7 s. u₁, u₂ are how
// far the weights have dropped from where they are held, so the stretches are x₁ = u₁, x₂ = u₂ − u₁.
export const G = 9.8;
export const L0 = 0.5;
export const K = 9.8;
export const GAMMA = 1.2;
export const A = G / L0; // g in natural lengths per s²
export const LMIN = 0.3; // the shortest a spring can be: its coils touch
export const M0 = 0.5;
export const DT = 1 / 240;

/** The rest position (x₁, x₂): k x₁ = (m₁ + m₂) g and k x₂ = m₂ g, in natural lengths. */
export const restOf = (m1, m2) => [((m1 + m2) * G) / (K * L0), (m2 * G) / (K * L0)];

/** The accelerations of the weights, for the state s = [u₁, u₂, w₁, w₂] (w the velocities). */
export function accel([u1, u2, w1, w2], m1, m2) {
  const x1 = u1;
  const x2 = u2 - u1;
  return [A - (K / m1) * (x1 - x2) - GAMMA * w1, A - (K / m2) * x2 - GAMMA * w2];
}

/** A spring pushed shorter than LMIN stops (its coils touch): an inelastic collision. */
export function bind([u1, u2, w1, w2], m1, m2) {
  if (1 + u2 - u1 < LMIN) {
    const d = LMIN - (1 + u2 - u1);
    u1 -= (m2 / (m1 + m2)) * d;
    u2 += (m1 / (m1 + m2)) * d;
    if (w2 < w1) {
      const w = (m1 * w1 + m2 * w2) / (m1 + m2);
      w1 = w;
      w2 = w;
    }
  }
  if (1 + u1 < LMIN) {
    const d = LMIN - 1 - u1;
    u1 += d;
    u2 = Math.max(u2, u1 + LMIN - 1);
    if (w1 < 0) w1 = 0;
    w2 = Math.max(w2, w1);
  }
  return [u1, u2, w1, w2];
}

/** One Runge–Kutta step of length h. */
export function step(s, m1, m2, h) {
  const f = (q) => {
    const [a1, a2] = accel(q, m1, m2);
    return [q[2], q[3], a1, a2];
  };
  const add = (q, d, t) => q.map((v, i) => v + t * d[i]);
  const k1 = f(s);
  const k2 = f(add(s, k1, h / 2));
  const k3 = f(add(s, k2, h / 2));
  const k4 = f(add(s, k3, h));
  return bind(
    s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])),
    m1,
    m2,
  );
}

export const stretches = (s) => [s[0], s[1] - s[0]];
export const settled = (s, m1, m2) => {
  const [r1, r2] = restOf(m1, m2);
  const [x1, x2] = stretches(s);
  return Math.hypot(x1 - r1, x2 - r2) < 1e-3 && Math.hypot(s[2], s[3]) < 1e-3;
};

/** The path (x₁, x₂) from `from`, let go at rest, every 1/60 s until it settles (for print). */
export function pathFrom(from, m1, m2) {
  let s = [from[0], from[0] + from[1], 0, 0];
  const pts = [from];
  for (let k = 0; k < 60 * 20 && !settled(s, m1, m2); k += 1) {
    for (let j = 0; j < 4; j += 1) s = step(s, m1, m2, DT);
    pts.push(stretches(s));
  }
  return pts;
}

// ---------- The picture of the springs ----------
export const SW = 250;
export const SH = 720;
export const CX = 128; // the axis of the springs
export const CEIL = 16; // the ceiling's underside
export const U = 66; // pixels per natural length
export const side = (m) => 52 * Math.sqrt(m / M0); // the weights: area in proportion to the mass

export const sub = (c, k) => (
  <>
    <tspan fontFamily={MATH} fontStyle="italic">
      {c}
    </tspan>
    <tspan fontFamily={MAIN} fontSize="0.7em" dy="0.3em">
      {k}
    </tspan>
  </>
);

/** Math in an SVG label at font size 20: 'k_1' is k₁ (italic, with its subscript); other pieces are upright. */
export function MathText({ parts }) {
  const DROP = 4; // a subscript's drop
  let down = false;
  return parts.flatMap((part, i) => {
    const [c, k] = part.split('_');
    const italic = /^[a-z]$/i.test(c);
    const out = [
      <tspan key={i} fontFamily={italic ? MATH : MAIN} fontStyle={italic ? 'italic' : 'normal'} dy={down ? -DROP : undefined}>
        {c}
      </tspan>,
    ];
    down = !!k;
    if (k) {
      out.push(
        <tspan key={`${i}s`} fontFamily={MAIN} fontSize="0.7em" dy={DROP}>
          {k}
        </tspan>,
      );
    }
    return out;
  });
}

// ---------- The forces (key presses 6 and 7), from the middle of each weight ----------
export const GU = G / (K * L0); // m g in units of k × (natural length), the unit of the springs' pull k x
export const FS = 40; // pixels per unit of force
export const WEIGHT = '#cfd6e0'; // the weights, light so that the arrows show on them
export const WEIGHT_EDGE = '#64748b';

/** A vertical arrow from (x, y), len pixels up (down when len < 0), with a white halo over the springs. */
export function Arrow({ x, y, len }) {
  const a = Math.abs(len);
  if (a < 2) return null;
  const head = Math.min(12, a);
  const tip = y - len;
  const base = tip + Math.sign(len) * head;
  return (
    <g>
      {a > head && <line x1={x} x2={x} y1={y} y2={base} stroke="#fff" strokeWidth="7" />}
      {a > head && <line x1={x} x2={x} y1={y} y2={base} stroke={VIOLET} strokeWidth="3" />}
      <path d={`M${x},${tip}L${x - 6},${base}L${x + 6},${base}Z`} fill={VIOLET} stroke="#fff" strokeWidth="2" strokeLinejoin="round" paintOrder="stroke" />
    </g>
  );
}

/**
 * The forces on the weight with top y0 and side s, from its middle: the spring above pulls it up
 * (its pull k x, for the stretch now), and `down` pulls it down; they balance at the rest position.
 * The labels go right of the arrows, beside their parts outside the weight.
 */
export function Forces({ y0, s, up, down, upLabel, downLabel }) {
  const y = y0 + s / 2;
  const upMid = Math.min(y0 - 10, (y0 + y - up * FS) / 2);
  const downMid = Math.max(y0 + s + 10, (y0 + s + y + down * FS) / 2);
  return (
    <g>
      <Arrow x={CX} y={y} len={up * FS} />
      <Arrow x={CX} y={y} len={-down * FS} />
      <circle cx={CX} cy={y} r="4" fill={VIOLET} stroke="#fff" strokeWidth="1.5" />
      <g fontSize="20" fill={VIOLET}>
        <text x={CX + 24} y={upMid + 7}>
          <MathText parts={upLabel} />
        </text>
        <text x={CX + 24} y={downMid + 7}>
          <MathText parts={downLabel} />
        </text>
      </g>
    </g>
  );
}

/** A spring from y0 down to y1 on the axis: a zigzag with straight ends. */
export function Spring({ y0, y1 }) {
  const lead = 7;
  const n = 18;
  const w = 30;
  const h = (y1 - y0 - 2 * lead) / n;
  const pts = [[CX, y0], [CX, y0 + lead]];
  for (let i = 0; i < n; i += 1) pts.push([CX + (i % 2 ? -w / 2 : w / 2), y0 + lead + h * (i + 0.5)]);
  pts.push([CX, y1 - lead], [CX, y1]);
  return <polyline points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} fill="none" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />;
}

/** A bracket left of a spring, from y0 to y1, with its length "1 + xₖ". */
export function Bracket({ y0, y1, k }) {
  const x = CX - 32;
  const m = (y0 + y1) / 2;
  return (
    <g stroke={TEAL} strokeWidth="1.6" fill="none">
      <path d={`M${x + 6},${y0 + 2}h-6V${y1 - 2}h6`} />
      <text x={x - 8} y={m + 6} textAnchor="end" fontSize="20" fill={TEAL} stroke="none" fontFamily={MAIN}>
        1 + {sub('x', k)}
      </text>
    </g>
  );
}

/**
 * The ceiling, spring 1, weight 1, spring 2, weight 2, for the stretches x = [x₁, x₂] (the springs
 * unstretched, held, when x = 0). Below the slide's edge, the picture is cut off.
 */
export function SpringsPicture({ x, m }) {
  const [s1, s2] = m.map(side);
  const y1 = CEIL + U * (1 + x[0]);
  const y2 = y1 + s1 + U * (1 + x[1]);
  return (
    <g>
      <rect x={CX - 70} y="0" width="140" height={CEIL} fill="#e5e7eb" />
      <line x1={CX - 70} x2={CX + 70} y1={CEIL} y2={CEIL} stroke={INK} strokeWidth="2.5" />
      <Spring y0={CEIL} y1={y1} />
      <Spring y0={y1 + s1} y1={y2} />
      <rect x={CX - s1 / 2} y={y1} width={s1} height={s1} rx="4" fill={WEIGHT} stroke={WEIGHT_EDGE} strokeWidth="1.5" />
      <rect x={CX - s2 / 2} y={y2} width={s2} height={s2} rx="4" fill={WEIGHT} stroke={WEIGHT_EDGE} strokeWidth="1.5" />
      <g fontSize="22" fill={INK}>
        <text x={CX + 26} y={(CEIL + y1) / 2 + 7}>{sub('k', 1)}</text>
        <text x={CX + 26} y={(y1 + s1 + y2) / 2 + 7}>{sub('k', 2)}</text>
        <text x={CX + s1 / 2 + 10} y={y1 + s1 / 2 + 7}>{sub('m', 1)}</text>
        <text x={CX + s2 / 2 + 10} y={y2 + s2 / 2 + 7}>{sub('m', 2)}</text>
      </g>
      <Fragment as="g" index={2}>
        <Bracket y0={CEIL} y1={y1} k={1} />
        <Bracket y0={y1 + s1} y1={y2} k={2} />
      </Fragment>
      <Fragment as="g" index={6}>
        <Forces y0={y1} s={s1} up={x[0]} down={GU * (m[0] + m[1])} upLabel={['k_1', 'x_1']} downLabel={['(', 'm_1', ' + ', 'm_2', ')', 'g']} />
      </Fragment>
      <Fragment as="g" index={7}>
        <Forces y0={y2} s={s2} up={x[1]} down={GU * m[1]} upLabel={['k_2', 'x_2']} downLabel={['m_2', 'g']} />
      </Fragment>
    </g>
  );
}

// ---------- The contour plot of V ----------
export const XR = [-0.6, 5];
export const YR = [-0.6, 3];
export const PW = 480;
export const PH = Math.round((PW * (YR[1] - YR[0])) / (XR[1] - XR[0]));
export const DV = 0.5; // the step between levels
export const NLEV = 26;

/** V(x₁, x₂) in units of k (natural length)², whose minimum is at the rest position. */
export const energyOf = (m1, m2) => {
  const [a, b] = restOf(m1, m2);
  const f = (x1, x2) => 0.5 * (x1 * x1 + x2 * x2) - a * x1 - b * x2;
  const min = -(a * a + b * b) / 2;
  return { f, levels: Array.from({ length: NLEV }, (_, n) => min + DV * (n + 1)), min };
};

export const pathD = (pts, p) => pts.map(([u, v], k) => `${k ? 'L' : 'M'}${p.px(u).toFixed(1)},${p.py(v).toFixed(1)}`).join('');

/** The axes' names, the path since the springs were let go, the dot, and (key press 5) the minimum. */
export function PlotMarks({ p, trail, x, rest }) {
  return (
    <g>
      <g fill={GRAY} fontSize="20">
        <text x={p.px(XR[1]) - 8} y={p.py(0) - 8} textAnchor="end">
          {sub('x', 1)}
        </text>
        <text x={p.px(0) + 8} y={p.py(YR[1]) + 22}>
          {sub('x', 2)}
        </text>
      </g>
      {/* a nested svg cuts the path off at the frame (a clipPath's id would be repeated by print mode) */}
      <svg x="1" y="1" width={p.W - 2} height={p.H - 2} viewBox={`1 1 ${p.W - 2} ${p.H - 2}`} overflow="hidden">
        {trail.length > 1 && <path d={pathD(trail, p)} fill="none" stroke={RED} strokeOpacity="0.55" strokeWidth="1.8" strokeLinejoin="round" />}
        <Fragment as="g" index={5}>
          <circle cx={p.px(rest[0])} cy={p.py(rest[1])} r="13" fill="none" stroke={RED} strokeWidth="2.5" />
          <text x={p.px(rest[0]) + 18} y={p.py(rest[1]) - 14} fill={RED} fontSize="19" fontWeight="700" className="map-label">
            minimum
          </text>
        </Fragment>
        <circle cx={p.px(x[0])} cy={p.py(x[1])} r="7" fill={RED} stroke="#fff" strokeWidth="2" />
      </svg>
    </g>
  );
}

/**
 * Let go! (right after Local extrema and critical points; the textbook's Example 10.1.3): two
 * identical springs and two weights hang from the ceiling, held so that the springs are not
 * stretched. Key press 1: let go, and they drop, bounce and come to rest (a simulation): they
 * settle at the minimum of the potential energy. 2: centred, V(x₁, x₂) = spring potential energy
 * (teal) + gravitational potential energy (amber); the lengths 1 + x₁, 1 + x₂ on the springs.
 * 3: on the next line, = its formula, its two parts in the same colours. 4: its contour plot, with
 * the grey caption Contour plot for V(x₁, x₂); the weights are held and let go again, and the dot
 * (x₁, x₂) runs on the contour plot to the minimum. 5: beside it, V is minimized at critical points:
 * ∂V/∂x₁ = ∂V/∂x₂ = 0. 6: what the first says, spring 1 holds up both weights, and the forces on
 * the top weight, k₁x₁ against (m₁ + m₂)g, as arrows from its middle. 7: what the second says,
 * spring 2 holds up the bottom weight, and its forces, k₂x₂ against m₂g. 8: along the bottom, in
 * one row, sliders for the two masses (the minimum moves and the weights follow), and Let go; a
 * click on the contour plot lets the weights go from there.
 */
export default function Slide06bSprings() {
  const [m1, setM1] = useState(M0);
  const [m2, setM2] = useState(M0);
  const sim = useRef({ s: [0, 0, 0, 0], trail: [], held: true, m: [M0, M0] });
  const [, setTick] = useState(0);
  const frame = useRef(0);
  const timer = useRef(0);
  const mk1 = useRef(null);
  const mk2 = useRef(null);
  const on1 = useFragmentShown(mk1);
  const on2 = useFragmentShown(mk2);

  const run = useCallback(() => {
    cancelAnimationFrame(frame.current);
    let last;
    const go = (now) => {
      const q = sim.current;
      let dt = last === undefined ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      const [a, b] = q.m;
      while (dt > 1e-9) {
        const h = Math.min(DT, dt);
        q.s = step(q.s, a, b, h);
        dt -= h;
      }
      if (q.trail.length < 3000) q.trail.push(stretches(q.s));
      setTick((t) => t + 1);
      if (!settled(q.s, a, b)) frame.current = requestAnimationFrame(go);
    };
    frame.current = requestAnimationFrame(go);
  }, []);

  const letGo = useCallback(
    (from = [0, 0]) => {
      clearTimeout(timer.current);
      const q = sim.current;
      q.s = [from[0], from[0] + from[1], 0, 0];
      q.trail = [from];
      q.held = false;
      run();
    },
    [run],
  );

  const hold = useCallback(() => {
    clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    const q = sim.current;
    q.s = [0, 0, 0, 0];
    q.trail = [];
    q.held = true;
    setTick((t) => t + 1);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  // key press 1 lets go; going back holds the weights again
  useEffect(() => {
    if (PRINT) return;
    if (on1) letGo();
    else hold();
  }, [on1, letGo, hold]);

  // key press 4: hold them, and let go again once the contour plot is in
  useEffect(() => {
    if (PRINT || !on2) return;
    hold();
    timer.current = setTimeout(() => letGo(), 900);
  }, [on2, letGo, hold]);

  // a new mass: the weights move to the new rest position
  useEffect(() => {
    const q = sim.current;
    q.m = [m1, m2];
    if (!q.held && !settled(q.s, m1, m2)) run();
  }, [m1, m2, run]);

  const V = useMemo(() => energyOf(m1, m2), [m1, m2]);
  const rest = restOf(m1, m2);
  const printPath = useMemo(() => (PRINT ? pathFrom([0, 0], M0, M0) : null), []);

  const q = sim.current;
  const x = stretches(q.s);

  const onPlotDown = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * PW;
    const py = ((e.clientY - box.top) / box.height) * PH;
    const u = XR[0] + ((px - 1) / (PW - 2)) * (XR[1] - XR[0]);
    const v = YR[0] + ((PH - 1 - py) / (PH - 2)) * (YR[1] - YR[0]);
    letGo([Math.min(XR[1], Math.max(XR[0], u)), Math.min(YR[1], Math.max(YR[0], v))]);
  };

  const plot = (trail, at) => (
    <ContourPlot f={V.f} x={XR} y={YR} size={[PW, PH]} levels={V.levels} color={(c) => lineColor((c - V.min) / (DV * NLEV))} width={1.4} axes title="Contour plot of the potential energy V, with the path of the point (x1, x2)">
      {(p) => <PlotMarks p={p} trail={trail} x={at} rest={rest} />}
    </ContourPlot>
  );

  const restM = [M0, M0];
  const restX = restOf(M0, M0);

  return (
    <section className="springs">
      <span ref={mk1} className="fragment fx-marker" data-fragment-index={1} aria-hidden="true" />
      <span ref={mk2} className="fragment fx-marker" data-fragment-index={4} aria-hidden="true" />
      <h2>Let go!</h2>

      <svg className="spr-col" viewBox={`0 0 ${SW} ${SH}`} width={SW} height={SH} role="img" aria-label="Two springs and two weights hanging from the ceiling">
        {PRINT ? (
          <g>
            <Fragment as="g" index={1} effect="fade-out">
              <SpringsPicture x={[0, 0]} m={restM} />
            </Fragment>
            <Fragment as="g" index={1}>
              <SpringsPicture x={restX} m={restM} />
            </Fragment>
          </g>
        ) : (
          <SpringsPicture x={x} m={q.m} />
        )}
      </svg>

      <div className="spr-main">
        <div className="spr-energy">
          <Fragment index={1} as="p">
            The springs bounce, then settle at the minimum of the potential energy:
          </Fragment>
          <div className="spr-derive">
            <Fragment index={2} as="p">
              <Tex tex="V(x_1,x_2)=" /> <span className="spr-spring">spring potential energy</span> +{' '}
              <span className="spr-gravity">gravitational potential energy</span>
            </Fragment>
            <Fragment index={3} as="p">
              <Tex tex={r`\phantom{V(x_1,x_2)}=\textcolor{#0e7490}{\tfrac12\left(k_1x_1^2+k_2x_2^2\right)}\textcolor{#b45309}{-m_1g\,x_1-m_2g\,(x_1+x_2)}`} />
            </Fragment>
          </div>
        </div>

        <div className="spr-row">
          <div className="spr-left" style={{ width: PW }}>
            <Fragment index={4} className="spr-plot" onPointerDown={PRINT ? undefined : onPlotDown}>
              {PRINT ? plot(printPath, restX) : plot(q.held ? [] : q.trail, x)}
            </Fragment>
            <Fragment index={4} as="p" className="spr-caption">
              Contour plot for <Tex tex="V(x_1,x_2)" />
            </Fragment>
          </div>

          {/* as tall as the contour plot, with its text centred vertically beside it */}
          <div className="spr-side" style={{ height: PH }}>
            <Fragment index={5} as="p">
              <Tex tex="V" /> is minimized at critical points:
            </Fragment>
            <Fragment index={5} className="spr-eq tex-left">
              <Tex display tex={r`\frac{\partial V}{\partial x_1}=k_1x_1-(m_1+m_2)g=0`} />
              <Fragment index={6} as="p" className="spr-says">
                → spring 1 holds up both weights
              </Fragment>
              <Tex display tex={r`\frac{\partial V}{\partial x_2}=k_2x_2-m_2g=0`} />
              <Fragment index={7} as="p" className="spr-says">
                → spring 2 holds up the bottom weight
              </Fragment>
            </Fragment>
          </div>
        </div>

        {/* one row along the bottom: the two sliders, then Let go */}
        <Fragment index={8} className="spr-controls">
          <div className="lc-sliders">
            <Slider name="m1" label={<Tex tex="m_1" />} value={m1} onChange={setM1} min={0.1} max={0.8} step={0.05} color={INK} format={(v) => `${v.toFixed(2)} kg`} />
            <Slider name="m2" label={<Tex tex="m_2" />} value={m2} onChange={setM2} min={0.1} max={0.8} step={0.05} color={INK} format={(v) => `${v.toFixed(2)} kg`} />
          </div>
          <button type="button" onPointerUp={(e) => e.currentTarget.blur()} onClick={() => letGo()}>
            Let go
          </button>
        </Fragment>
      </div>
    </section>
  );
}
