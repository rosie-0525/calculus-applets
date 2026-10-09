import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot, PlaneLabel } from '../components/Plane.jsx';
import HoldFigure, { A, B, Z, ZR as PLANE_Z } from '../components/HoldFigure.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { hills as f, HILLS_R } from '../components/hills.js';

export const CARDINAL = '#8c1515';
export const GREEN = '#175e54';
export const INK = '#14213d';
export const TEAL = '#0e7490'; // the tangent line, as on Single variable function
export const GRAY = '#6b7280';
export const PLANE = '#608dc4'; // the planes' blue, as in Slices.jsx

export const D = 1e-5;
// the two slices through (a, b) as graphs of one variable, each with its tangent line at the point
export const SLICES = {
  x: {
    g: (t) => f(t, B),
    t0: A,
    slope: (f(A + D, B) - f(A - D, B)) / (2 * D), // f_x(a, b) ≈ −1.23
    color: CARDINAL,
    axisLabels: ['x', 'z'],
    tick: 'a',
    curve: 'z = f(x, b)',
    curveAt: [-0.45, 0.9],
    curveAnchor: 'end',
    slopeLabel: ['slope = ', 'f', 'x', '(a, b)'],
    slopeAt: [A + 0.25, 1.4],
    slopeAnchor: 'start',
    title: 'The slice z = f(x, b) as the graph of a function of x, with its tangent line at x = a',
  },
  y: {
    g: (t) => f(A, t),
    t0: B,
    slope: (f(A, B + D) - f(A, B - D)) / (2 * D), // f_y(a, b) ≈ 0.88
    color: GREEN,
    axisLabels: ['y', 'z'],
    tick: 'b',
    curve: 'z = f(a, y)',
    curveAt: [1.95, 0.55],
    curveAnchor: 'start',
    slopeLabel: ['slope = ', 'f', 'y', '(a, b)'],
    slopeAt: [-1.9, 1.4],
    slopeAnchor: 'start',
    title: 'The slice z = f(a, y) as the graph of a function of y, with its tangent line at y = b',
  },
};
export const XR = [-2, 3.2];
export const ZR = [-0.25, 1.75];
export const UNIT = 80;
export const PAD = 22; // Plane's margin around the axes

export const path = (p, g, N = 90) =>
  Array.from({ length: N + 1 }, (_, k) => XR[0] + 0.1 + ((XR[1] - XR[0] - 0.2) * k) / N)
    .map((t, k) => `${k ? 'L' : 'M'}${p.px(t).toFixed(1)},${p.py(g(t)).toFixed(1)}`)
    .join(' ');

/** A slice of the graph through (a, b) as the graph of a function of one variable; its tangent line from key press `tangentAt`. */
export function SliceGraph({ sl, tangentAt }) {
  const z0 = sl.g(sl.t0);
  const T = (t) => [t, z0 + sl.slope * (t - sl.t0)];
  const [lo, hi] = [T(sl.t0 - 0.6), T(sl.t0 + 0.6)];
  return (
    <Plane xRange={XR} yRange={ZR} unit={UNIT} pad={PAD} xTicks={[]} yTicks={[]} grid={false} axisLabels={sl.axisLabels} title={sl.title}>
      {(p) => {
        const line = (
          <g>
            <line x1={p.px(lo[0])} y1={p.py(lo[1])} x2={p.px(hi[0])} y2={p.py(hi[1])} stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
            <text x={p.px(sl.slopeAt[0])} y={p.py(sl.slopeAt[1])} fill={TEAL} fontSize="17" fontWeight="700" textAnchor={sl.slopeAnchor} fontFamily="KaTeX_Main, Georgia, serif">
              {sl.slopeLabel[0]}
              <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
                {sl.slopeLabel[1]}
              </tspan>
              <tspan dy="5" fontSize="12" fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
                {sl.slopeLabel[2]}
              </tspan>
              <tspan dy="-5">(</tspan>
              <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
                a
              </tspan>
              {', '}
              <tspan fontStyle="italic" fontFamily="KaTeX_Math, Georgia, serif">
                b
              </tspan>
              )
            </text>
          </g>
        );
        return (
          <g>
            <path d={path(p, sl.g)} fill="none" stroke={sl.color} strokeWidth="3.5" strokeLinecap="round" />
            <PlaneLabel p={p} at={sl.curveAt} color={sl.color} size={17} textAnchor={sl.curveAnchor}>
              {sl.curve}
            </PlaneLabel>
            {tangentAt ? (
              <Fragment as="g" index={tangentAt}>
                {line}
              </Fragment>
            ) : (
              line
            )}
            <line x1={p.px(sl.t0)} y1={p.py(0)} x2={p.px(sl.t0)} y2={p.py(z0)} stroke={GRAY} strokeWidth="1.8" strokeDasharray="0.1 6" strokeLinecap="round" />
            <Dot p={p} at={[sl.t0, 0]} color={INK} r={4.5} />
            <PlaneLabel p={p} at={[sl.t0, 0]} dy={24} color={INK} size={17} textAnchor="middle">
              {sl.tick}
            </PlaneLabel>
            <Dot p={p} at={[sl.t0, z0]} color={INK} r={6} stroke="#fff" strokeWidth="1.5" />
          </g>
        );
      }}
    </Plane>
  );
}

export const MORPH = 1300; // ms: the plane y = b moving down to the graph under the 3-D picture
export const FADE = 400; // ms: then its blue fades as the graph fades in (.la-land in deck.css, after MORPH)

/** Milliseconds since `on` turned true, counted up to `until`; null while `on` is false, and in print. */
export function useElapsed(on, until) {
  const [ms, setMs] = useState(null);
  useEffect(() => {
    setMs(null);
    if (!on || PRINT) return undefined;
    let id;
    let t0;
    const tick = (now) => {
      t0 ??= now;
      setMs(Math.min(now - t0, until));
      if (now - t0 < until) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [on, until]);
  return ms;
}

export const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
export const mix = (p, q, u) => p + (q - p) * u;
export const mixRange = (p, q, u) => [mix(p[0], q[0], u), mix(p[1], q[1], u)];

/** Where an svg's viewBox sits in `host`: the corner of its content box and its scale, in the host's pixels. */
export function placeIn(svg, host) {
  const h = host.getBoundingClientRect();
  const k = h.width / host.offsetWidth; // reveal scales the slide
  const b = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  return { x: (b.left - h.left) / k + svg.clientLeft, y: (b.top - h.top) / k + svg.clientTop, sx: svg.clientWidth / vb.width, sy: svg.clientHeight / vb.height };
}

/**
 * From key press `at`, a copy of the plane y = b, with the slice z = f(x, b) on it, moves down out of
 * the 3-D picture (`.la-fig`, drawn with the view `view`) and becomes the xz-plane of the graph under
 * it (`.la-land`): each point (x, z) of the plane glides from where the picture draws (x, b, z) to
 * where the graph draws (x, z), the plane's edges to the graph's frame, and the lines z = 0 and x = 0
 * on it appear and land on the axes. Then the graph fades in and the copy goes. None from key press
 * `until` (the next slice) and in print.
 */
export function PlaneDown({ host, view, at, until }) {
  const m1 = useRef(null);
  const m2 = useRef(null);
  const on = useFragmentShown(m1);
  const off = useFragmentShown(m2);
  const ms = useElapsed(on, MORPH + FADE);
  const markers = (
    <>
      <span ref={m1} className="fragment fx-marker" data-fragment-index={at} aria-hidden="true" />
      <span ref={m2} className="fragment fx-marker" data-fragment-index={until} aria-hidden="true" />
    </>
  );
  const h = host.current;
  const s = view.current;
  const svg3 = h?.querySelector('.la-fig svg');
  const svg2 = h?.querySelector('.la-land svg');
  if (ms === null || ms >= MORPH + FADE || off || !s || !svg3 || !svg2) return markers;

  const u = ease(Math.min(1, ms / MORPH));
  const o3 = placeIn(svg3, h);
  const o2 = placeIn(svg2, h);
  const H2 = (ZR[1] - ZR[0]) * UNIT + 2 * PAD;
  const pt = (x, z) => {
    const [X, Y] = s.P([x, B, Z * z]);
    const p = [o3.x + o3.sx * X, o3.y + o3.sy * Y];
    const q = [o2.x + o2.sx * (PAD + (x - XR[0]) * UNIT), o2.y + o2.sy * (H2 - PAD - (z - ZR[0]) * UNIT)];
    return `${mix(p[0], q[0], u).toFixed(1)},${mix(p[1], q[1], u).toFixed(1)}`;
  };
  const line = (pts) => pts.map(([x, z], k) => `${k ? 'L' : 'M'}${pt(x, z)}`).join(' ');
  const M = PAD / UNIT;
  const xs = mixRange(HILLS_R, [XR[0] - M, XR[1] + M], u);
  const zs = mixRange([PLANE_Z[0] / Z, PLANE_Z[1] / Z], [ZR[0] - M, ZR[1] + M], u);
  const cx = mixRange(HILLS_R, [XR[0] + 0.1, XR[1] - 0.1], u);
  const ax = mixRange(HILLS_R, XR, u);
  const az = mixRange([0, PLANE_Z[1] / Z], ZR, u);
  const curve = line(Array.from({ length: 91 }, (_, k) => cx[0] + ((cx[1] - cx[0]) * k) / 90).map((x) => [x, f(x, B)]));
  const planeOpacity = ms > MORPH ? 1 - (ms - MORPH) / FADE : Math.min(1, ms / 150);
  const W = h.offsetWidth;
  const Hh = h.offsetHeight;

  return (
    <>
      {markers}
      <svg className="la-move" width={W} height={Hh} viewBox={`0 0 ${W} ${Hh}`} aria-hidden="true">
        <polygon
          points={[xs[0], xs[1], xs[1], xs[0]].map((x, k) => pt(x, zs[k < 2 ? 0 : 1])).join(' ')}
          fill={PLANE}
          fillOpacity={0.4}
          stroke={PLANE}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity={planeOpacity}
        />
        <path d={`${line([[ax[0], 0], [ax[1], 0]])} ${line([[0, az[0]], [0, az[1]]])}`} fill="none" stroke={GRAY} strokeWidth="1.5" opacity={Math.min(1, Math.max(0, (u - 0.3) / 0.5))} />
        <path d={curve} fill="none" stroke={CARDINAL} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
}

/**
 * Linear approximation: recalled for one variable, f(x + h) ≈ f(x) + f′(x) h; key press 1: for h
 * small (as after the two approximations below). Then for f(x, y), beside the graph of Partial derivatives (HoldFigure) and, under it, the
 * slice through (a, b) as the graph of a function of one variable. Key press 2: hold y = b constant
 * (the plane y = b, the point moving in the x direction); 3: we get f(x, b), a function of x (the
 * plane y = b moves down out of the 3-D picture and becomes the xz-plane of a graph of its own,
 * PlaneDown); 4: f(a + h, b) ≈ f(a, b) + f_x(a, b) h (its tangent line, slope f_x(a, b)); 5: the same
 * for x = a: y ↦ f(a, y), f(a, b + h) ≈ f(a, b) + f_y(a, b) h (the plane x = a, the slice in green
 * with its tangent line); 6: what is f(a + h₁, b + h₂)? → Sections 11.1 and 11.4 (both curves).
 */
export default function Slide05bLinearApprox() {
  const figs = useRef(null);
  const view = useRef(null);
  return (
    <section className="dense">
      <h2>Linear approximation</h2>

      <div className="stage la-stage">
        <div className="stage-text">
          <p>
            <strong>One variable:</strong> <Tex tex={r`f(x+h)\approx f(x)+f'(x)\,h`} />{' '}
            <Fragment index={1} as="span" className="la-cond">
              for <Tex tex="h" /> small.
            </Fragment>
          </p>
          <Fragment index={2} as="p" className="la-two">
            <strong>Two variables:</strong>
          </Fragment>
          <ul className="bullets la-steps">
            <Fragment index={2} as="li">
              <span className="red">
                Hold <Tex tex="y=b" /> constant
              </span>
              <Fragment index={3} as="span">
                : we get <Tex tex="f(x,b)" />, a function of <Tex tex="x" />.
              </Fragment>
              <Fragment index={4} as="span" className="la-formula">
                <Tex tex={r`f(a+h,b)\approx f(a,b)+f_x(a,b)\,h`} />
                <span className="la-cond">
                  for <Tex tex="h" /> small
                </span>
              </Fragment>
            </Fragment>
            <Fragment index={5} as="li">
              <span style={{ color: GREEN }}>
                Hold <Tex tex="x=a" /> constant
              </span>
              : a function of <Tex tex="y" />, <Tex tex={r`y\mapsto f(a,y)`} />.
              <span className="la-formula">
                <Tex tex={r`f(a,b+h)\approx f(a,b)+f_y(a,b)\,h`} />
                <span className="la-cond">
                  for <Tex tex="h" /> small
                </span>
              </span>
            </Fragment>
          </ul>
          <Fragment index={6} as="p" className="pointer right">
            What is <Tex tex="f(a+h_1,b+h_2)" />? → Sections 11.1 and 11.4
          </Fragment>
        </div>

        <div className="la-figs" ref={figs}>
          <figure className="la-fig">
            <HoldFigure steps={[2, 5, 6]} viewRef={view} width={460} height={290} unit={50} center={[0.5, 0.7]} />
          </figure>
          {/* the plane y = b moves down out of the 3-D picture and lands as the xz-plane of x ↦ f(x, b) (PlaneDown); then y ↦ f(a, y) flies out of it */}
          <div className="la-slices">
            <Fragment index={3} className="la-land">
              <Fragment index={5} effect="fade-out">
                <SliceGraph sl={SLICES.x} tangentAt={4} />
              </Fragment>
            </Fragment>
            <Fragment index={5} className="la-fly">
              <SliceGraph sl={SLICES.y} />
            </Fragment>
          </div>
          <PlaneDown host={figs} view={view} at={3} until={5} />
        </div>
      </div>
    </section>
  );
}
