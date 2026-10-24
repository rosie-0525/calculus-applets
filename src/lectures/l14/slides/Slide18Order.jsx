import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import BallCanvas, { BallStill, VIEW } from '../components/Ball.jsx';
import { axisRotation } from '../components/Rotation3.jsx';
import { useFragmentShown, useLoopTween, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const W = 330;
export const H = 240;
export const O = [165, 126]; // the ball's centre
export const RADIUS = 62;
export const GAP = 80; // between the two balls of a row: the arrow
export const TEAL = '#0e7490';
export const VIOLET = '#7c3aed';

export const mul = (P, Q) => P.map((row) => Q[0].map((_, j) => row.reduce((s, a, k) => s + a * Q[k][j], 0)));
export const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
export const ID = axisRotation(2, 0);

// R₁: 90° around the z-axis (matrix A); R₂: 90° around the y-axis (matrix B)
// (ring: the height and radius of its ring arrow; around y, it keeps clear of the face)
export const R1 = { k: 2, name: 'R_1', axis: 'z', color: TEAL, ring: [0.72, 0.82], turn: (t) => axisRotation(2, 90 * t) };
export const R2 = { k: 1, name: 'R_2', axis: 'y', color: VIOLET, ring: [0.58, 0.92], turn: (t) => axisRotation(1, 90 * t) };

// a point of space (in radii of the ball) on the picture, and how far it is toward the viewer
export const P = (q) => [O[0] + RADIUS * dot(VIEW[0], q), O[1] - RADIUS * dot(VIEW[1], q)];
export const depth = (q) => dot(VIEW[2], q);
export const unit = (k, t = 1) => [0, 1, 2].map((i) => (i === k ? t : 0));
export const pts = (qs) => qs.map((q) => P(q).map((v) => v.toFixed(1)).join(',')).join(' ');
// the axes reach just past the ball on the picture, 1.48 radii (1.22 on the negative side): the more
// foreshortened (x), the farther
export const onScreen = (k) => Math.hypot(VIEW[0][k], VIEW[1][k]);
export const POS = [0, 1, 2].map((k) => 1.48 / onScreen(k));
export const NEG = [0, 1, 2].map((k) => 1.22 / onScreen(k));

/** The x, y, z axes through the ball: solid on the positive side, dashed on the negative. */
export function Axis({ k, color = '#6b7280', width = 1.5 }) {
  const [a, b, c] = [P(unit(k, -NEG[k])), P([0, 0, 0]), P(unit(k, POS[k]))];
  const lab = P(unit(k, POS[k] + 0.22));
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width * 0.8} strokeDasharray="3 4" />
      <line x1={b[0]} y1={b[1]} x2={c[0]} y2={c[1]} stroke={color} strokeWidth={width} />
      <text x={lab[0]} y={lab[1] + 6} textAnchor="middle" fill={color} fontSize="19" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
        {'xyz'[k]}
      </text>
    </g>
  );
}

/**
 * The ring round axis k that shows which way the ball turns: three quarters of the circle of radius
 * rho at height h along the axis (just outside the ball), counterclockwise by the right-hand rule,
 * ending, with an arrowhead, on the side facing the viewer. `part`: 'back' is all of it (drawn under
 * the ball, which hides what is behind it), 'front' the runs in front of the ball and the arrowhead.
 */
export function Ring({ k, h, rho, color, part }) {
  const [i, j] = [(k + 1) % 3, (k + 2) % 3];
  const at = (t) => {
    const q = unit(k, h);
    q[i] = rho * Math.cos(t);
    q[j] = rho * Math.sin(t);
    return q;
  };
  const end = Math.atan2(VIEW[2][j], VIEW[2][i]) + (75 * Math.PI) / 180;
  const n = 90;
  const qs = Array.from({ length: n + 1 }, (_, m) => at(end - 1.5 * Math.PI * (1 - m / n)));
  if (part === 'back') return <polyline points={pts(qs)} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />;
  // in front of the ball: off its disc, or nearer than its surface
  const seen = (q) => {
    const [a, b] = [dot(VIEW[0], q), dot(VIEW[1], q)];
    return a * a + b * b >= 1 || depth(q) > Math.sqrt(1 - a * a - b * b);
  };
  const runs = [];
  qs.forEach((q, m) => {
    if (!seen(q)) return;
    if (m > 0 && seen(qs[m - 1])) runs[runs.length - 1].push(q);
    else runs.push([q]);
  });
  const [x2, y2] = P(qs[n]);
  const [x1, y1] = P(qs[n - 4]);
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const hd = 15;
  return (
    <g>
      {runs.map((run, m) => (
        <polyline key={m} points={pts(run)} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      ))}
      <polygon
        points={`${x2 + ux * 5},${y2 + uy * 5} ${x2 - ux * hd - uy * hd * 0.55},${y2 - uy * hd + ux * hd * 0.55} ${x2 - ux * hd + uy * hd * 0.55},${y2 - uy * hd - ux * hd * 0.55}`}
        fill={color}
      />
    </g>
  );
}

/**
 * One ball, turned by M0 to start with, then 90° around the axis of `s` on key press `index`: from
 * then on, that axis in its colour, with a ring arrow round the ball. `glide` (px): the ball first
 * comes in from that far to the left (from the ball before it, where it ended), then turns; its ring
 * waits for it (`l14-ring-late`). `loop`: the ball turns again and again (while its slide is on
 * screen; The algebra behind). Print mode shows a still of the ball before and after.
 */
export function Turning({ index, s, M0 = ID, glide = 0, loop = false }) {
  const m = useRef(null);
  const shown = useFragmentShown(m);
  const once = useTween(shown && !loop, { ms: 1600, delay: glide ? 1400 : 500 });
  const live = () => !!m.current?.closest('section')?.classList.contains('present');
  const again = useLoopTween(shown && loop, { ms: 1600, delay: 700, hold: 2200, live });
  const t = loop ? again : once;
  const ball = { width: W, height: H, center: O, radius: RADIUS };
  const late = glide ? 'l14-ring-late' : '';
  return (
    <div className="l14-ball-screen" style={{ width: W, height: H }}>
      <span ref={m} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <Axis key={k} k={k} />
        ))}
        <Fragment as="g" index={index} className={late}>
          <Axis k={s.k} color={s.color} width={3.2} />
          <Ring k={s.k} h={s.ring[0]} rho={s.ring[1]} color={s.color} part="back" />
        </Fragment>
      </svg>
      <div className="l14-ball-glide" style={{ '--dx': `${-glide}px` }}>
        {PRINT ? (
          <>
            <Fragment index={index} effect="fade-out" className="l14-still">
              <BallStill M={M0} {...ball} />
            </Fragment>
            <Fragment index={index} className="l14-still">
              <BallStill M={mul(s.turn(1), M0)} {...ball} />
            </Fragment>
          </>
        ) : (
          <BallCanvas M={mul(s.turn(t), M0)} {...ball} />
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <Fragment as="g" index={index} className={late}>
          <Ring k={s.k} h={s.ring[0]} rho={s.ring[1]} color={s.color} part="front" />
        </Fragment>
      </svg>
    </div>
  );
}

/** The turn s as the m-th step under a ball (no number if m is not given), on key press `index`. */
export function Step({ s, m, index }) {
  return (
    <div className="l14-steps">
      <Fragment index={index} as="span" className="l14-step" style={{ '--c': s.color }}>
        {m != null && <b>{m + 1}</b>}
        <span>
          <Tex tex={s.name} />: <Tex tex={r`90^\circ`} /> around <Tex tex={s.axis} />
        </span>
      </Fragment>
    </div>
  );
}

/**
 * A row: the ball turned by `first` on key press `index` (it stays so); on the next, an arrow, and a
 * copy of it glides to the right of the arrow and turns by `second`.
 */
export function Row({ first, second, index }) {
  return (
    <div className="l14-order-row">
      <figure>
        <Turning index={index} s={first} />
        <Step s={first} m={0} index={index} />
      </figure>
      <Fragment index={index + 1} className="l14-order-arrow">
        <svg viewBox={`0 0 ${GAP} ${H}`} width={GAP} height={H} aria-hidden="true">
          <line x1={14} y1={O[1]} x2={GAP - 20} y2={O[1]} stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points={`${GAP - 12},${O[1]} ${GAP - 24},${O[1] - 7} ${GAP - 24},${O[1] + 7}`} fill="#6b7280" />
        </svg>
      </Fragment>
      <Fragment index={index + 1} as="figure">
        <Turning index={index + 1} s={second} M0={first.turn(1)} glide={W + GAP} />
        <Step s={second} m={1} index={index + 1} />
      </Fragment>
    </div>
  );
}

/**
 * Order matters (the textbook's opening example of Chapter 14, Section 14.5, with 90° rather than
 * 45°), for the students to follow on their Halloween balls: R₁ turns 90° around the z-axis, R₂ 90°
 * around the y-axis. Four balls, in two rows. Key press 1: the first ball turns by R₁ and stays so;
 * 2: a copy of it glides to its right and turns by R₂; 3, 4: the same below, R₂ then R₁: the two
 * balls on the right differ. The matrices, A, B, BA and AB, are on the next slide, The algebra
 * behind (Slide18bMatrices.jsx). The view (Ball.jsx's VIEW) has the face look at the students at the start.
 */
export default function Slide18Order() {
  return (
    <section className="dense">
      <h2>Order matters</h2>

      <div className="l14-order-rows">
        <Row first={R1} second={R2} index={1} />
        <Row first={R2} second={R1} index={3} />
      </div>
    </section>
  );
}
