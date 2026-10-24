import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import { F, S } from '../components/FPanel.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { TEAL, VIOLET } from './Slide18Order.jsx';

export const W = 240;
export const H = 210;
export const GAP = 70; // between the two panels of a row: the arrow
export const U = 72; // px per unit
export const X = [-1.9, 1.4];
export const Y = [-0.95, 1.9];
export const OX = (W - (X[1] - X[0]) * U) / 2 - X[0] * U; // where x = 0 is, in px
export const OY = (H - (Y[1] - Y[0]) * U) / 2 + Y[1] * U; // where y = 0 is
export const px = (x) => OX + x * U;
export const py = (y) => OY - y * U;
export const RED = '#8c1515';
export const GREEN = '#15803d'; // the two panels the rows end in, the same
export const RADIUS = 1.6; // of the arc arrows, just outside S's far corner

// the two rotations, in Order matters' colours
export const R90 = { deg: 90, name: r`R_{90^\circ}`, color: TEAL };
export const R45 = { deg: 45, name: r`R_{45^\circ}`, color: VIOLET };

export const turn = ([x, y], deg) => {
  const a = (deg * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
};
export const pts = (qs, deg) =>
  qs
    .map((q) => turn(q, deg))
    .map(([x, y]) => `${px(x).toFixed(1)},${py(y).toFixed(1)}`)
    .join(' ');

/** S and F turned by `deg` degrees: orange and red (as on Linear transformations of ℝ²), or gray (`ghost`). */
export function Shape({ deg, ghost = false }) {
  return ghost ? (
    <g>
      <polygon points={pts(S, deg)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points={pts(F, deg)} fill="#d1d5db" />
    </g>
  ) : (
    <g>
      <polygon points={pts(S, deg)} fill="rgba(242, 179, 122, 0.55)" stroke="#c2702a" strokeWidth="2" strokeLinejoin="round" />
      <polygon points={pts(F, deg)} fill={RED} stroke={RED} strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
}

/** The arc arrow of a turn by `deg` from `from` degrees, round S's far corner, drawn as far as t. */
export function Arc({ from, deg, t, color }) {
  if (deg * t < 8) return null;
  const a0 = ((from + 45) * Math.PI) / 180;
  const a1 = a0 + (deg * t * Math.PI) / 180;
  const at = (a) => [px(RADIUS * Math.cos(a)), py(RADIUS * Math.sin(a))];
  const n = 40;
  const line = Array.from({ length: n + 1 }, (_, m) => at(a0 + ((a1 - a0) * m) / n).map((v) => v.toFixed(1)).join(',')).join(' ');
  const [x, y] = at(a1);
  const [ux, uy] = [-Math.sin(a1), -Math.cos(a1)]; // counterclockwise, on the screen
  const hd = 13;
  return (
    <g>
      <polyline points={line} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <polygon
        points={`${x + ux * 4},${y + uy * 4} ${x - ux * hd - uy * hd * 0.55},${y - uy * hd + ux * hd * 0.55} ${x - ux * hd + uy * hd * 0.55},${y - uy * hd - ux * hd * 0.55}`}
        fill={color}
      />
    </g>
  );
}

/**
 * One panel: S and F, turned by `from` degrees to start with (a gray copy stays there), then by s
 * on key press `index`, its arc arrow growing as it turns. `glide` (px): S and F first come in from
 * that far to the left (from the panel before, where they ended), then turn. `last`: a panel the
 * two rows end in (outlined green, joined by a bracket, "both = R_135°"). Print mode shows S and F before and after.
 */
export function Panel({ index, s, from = 0, glide = 0, last = false }) {
  const m = useRef(null);
  const t = useTween(useFragmentShown(m), { ms: 1500, delay: glide ? 1400 : 400 });
  return (
    <div className={`l14-ball-screen${last ? ' l14-spin-last' : ''}`} style={{ width: W, height: H }}>
      <span ref={m} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <g stroke="#eceef2" strokeWidth="1">
          {[-1, 1].map((k) => (
            <line key={`v${k}`} x1={px(k)} y1={0} x2={px(k)} y2={H} />
          ))}
          {[1].map((k) => (
            <line key={`h${k}`} x1={0} y1={py(k)} x2={W} y2={py(k)} />
          ))}
        </g>
        <g stroke="#c4c9d1" strokeWidth="1.4">
          <line x1={0} y1={py(0)} x2={W} y2={py(0)} />
          <line x1={px(0)} y1={0} x2={px(0)} y2={H} />
        </g>
        <Shape deg={from} ghost />
      </svg>
      <div className="l14-ball-glide" style={{ '--dx': `${-glide}px` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
          {PRINT ? (
            <>
              <Fragment as="g" index={index} effect="fade-out">
                <Shape deg={from} />
              </Fragment>
              <Fragment as="g" index={index}>
                <Shape deg={from + s.deg} />
                <Arc from={from} deg={s.deg} t={1} color={s.color} />
              </Fragment>
            </>
          ) : (
            <>
              <Shape deg={from + s.deg * t} />
              <Arc from={from} deg={s.deg} t={t} color={s.color} />
            </>
          )}
          <circle cx={px(0)} cy={py(0)} r="3.5" fill="#14213d" />
        </svg>
      </div>
    </div>
  );
}

/** The turn s as the m-th step under a panel, on key press `index`. */
export function Step({ s, m, index }) {
  return (
    <div className="l14-steps">
      <Fragment index={index} as="span" className="l14-step" style={{ '--c': s.color }}>
        <b>{m + 1}</b>
        <span>
          <Tex tex={s.name} />
        </span>
      </Fragment>
    </div>
  );
}

/**
 * A row: S and F turned by `first` on key press `index` (they stay so); on the next, an arrow, and a
 * copy glides to the right of the arrow and turns by `second`.
 */
export function Row({ first, second, index }) {
  return (
    <div className="l14-spin-row">
      <figure>
        <Panel index={index} s={first} />
        <Step s={first} m={0} index={index} />
      </figure>
      <Fragment index={index + 1}>
        <svg viewBox={`0 0 ${GAP} ${H}`} width={GAP} height={H} aria-hidden="true">
          <line x1={12} y1={H / 2} x2={GAP - 18} y2={H / 2} stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points={`${GAP - 10},${H / 2} ${GAP - 22},${H / 2 - 7} ${GAP - 22},${H / 2 + 7}`} fill="#6b7280" />
        </svg>
      </Fragment>
      <Fragment index={index + 1} as="figure">
        <Panel index={index + 1} s={second} from={first.deg} glide={W + GAP} last />
        <Step s={second} m={1} index={index + 1} />
      </Fragment>
    </div>
  );
}

/**
 * Rotations of ℝ² commute (unlike the rotations of ℝ³ on Order matters, whose layout it follows):
 * S and F, R_90° then R_45°, and R_45° then R_90°. Key press 1: the first panel turns by R_90°
 * and stays so; 2: a copy glides to its right and turns by R_45°; 3, 4: the same below, the other
 * way round; 5: the two panels on the right, the same, outlined green and joined by a bracket, "both = R_135°"; and
 * R_β ∘ R_α = R_α ∘ R_β = R_{α+β} in a box; 6: the matrices, the product of those of R_β and R_α.
 */
export default function Slide18cCommute() {
  return (
    <section className="dense">
      <h2>
        Rotations of <Tex tex={r`\mathbb R^2`} /> commute
      </h2>

      <FxMarker index={5} id="spin-same" />
      <div className="l14-spin">
        <div className="l14-spin-left">
          <div className="l14-spin-rows">
            <Row first={R90} second={R45} index={1} />
            <Row first={R45} second={R90} index={3} />
          </div>
          <Fragment index={5} className="l14-spin-both" style={{ '--c': GREEN }}>
            <span className="l14-spin-brace" />
            <span>
              both <Tex tex={r`=R_{135^\circ}`} />
            </span>
          </Fragment>
        </div>

        <div className="l14-spin-text">
          <Fragment index={5} className="block theorem">
            <p>
              For any angles <Tex tex={r`\alpha`} /> and <Tex tex={r`\beta`} />,
            </p>
            <Tex display tex={r`R_\beta\circ R_\alpha=R_\alpha\circ R_\beta=R_{\alpha+\beta}.`} />
          </Fragment>
          <Fragment index={6} className="l14-spin-matrices">
            <p>In matrices:</p>
            <Tex
              display
              tex={r`\begin{aligned}&\begin{bmatrix}\cos\beta&-\sin\beta\\ \sin\beta&\cos\beta\end{bmatrix}\begin{bmatrix}\cos\alpha&-\sin\alpha\\ \sin\alpha&\cos\alpha\end{bmatrix}\\ &\quad=\begin{bmatrix}\cos(\alpha+\beta)&-\sin(\alpha+\beta)\\ \sin(\alpha+\beta)&\cos(\alpha+\beta)\end{bmatrix}.\end{aligned}`}
            />
          </Fragment>
        </div>
      </div>
    </section>
  );
}
