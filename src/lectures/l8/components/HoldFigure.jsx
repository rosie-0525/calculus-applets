import { useEffect, useRef, useState } from 'react';
import Fragment from './Fragment.jsx';
import Space, { Dot3, Label3 } from './Space.jsx';
import Surface from './Surface.jsx';
import SlicedGraph, { along } from './Slices.jsx';
import { useFragmentShown } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { hills as f, HILLS_R as R } from './hills.js';

const CARDINAL = '#8c1515';
const GREEN = '#175e54';
const INK = '#14213d';
const PLANE_INK = '#3b5f91';
export const Z = 1.1; // heights drawn at 1.1 × f
export const ZR = [0, 2.4]; // the planes, from the floor to above the hills
const MESH = 'rgba(15, 40, 50, 0.16)';
const AXIS = '#6b7280'; // as Space draws the axes
const ZL = 3.2; // the z-axis, up to z = 3.2
export const A = 1.5; // the point (a, b), on the big hill's east flank
export const B = 0.2;
// Holding y = b, the point moves along the x direction, a − 0.8 ≤ x ≤ a + 0.8; holding x = a, along
// the y direction, −0.7 ≤ y ≤ 0.4 (above 0.4 it would go behind the big hill), starting from (a, b)
const DX = 0.8;
const Y_MID = -0.15;
const Y_AMP = 0.55;
const Y_PHASE = Math.asin((B - Y_MID) / Y_AMP);
const PERIOD = 6; // seconds, there and back

const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };

/**
 * The graph of the two hills in one of four states: 0, the graph and the point (a, b, f(a, b));
 * 1, cut by the plane y = b, the slice z = f(x, b) in red; 2, cut by the plane x = a, the slice
 * z = f(a, y) in green; 3, both slices on the graph, no planes. The point is drawn over (x, y), (a, b)
 * unless given.
 */
function Picture({ s, state, a, b, at: [x, y] = [a, b] }) {
  const P = [x, y, Z * f(x, y)];
  const base = { f, x: R, y: R, n: 32, zScale: Z, mesh: MESH };
  // the z-axis above the graph, painted with it, in depth order (Space paints its axes first, under the graph)
  const zAxis = { pts: along([Z * f(0, 0), ZL], (t) => [0, 0, t], 12), color: AXIS, width: 1.5 };
  const point = <Dot3 s={s} at={P} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />;
  const label = (text, at, dx) => (
    <Label3 s={s} at={at} dx={dx} dy={-8} color={PLANE_INK} size={19} fontWeight="400" textAnchor={dx < 0 ? 'end' : 'start'} {...halo}>
      {text[0]}
      <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
        {' = '}
      </tspan>
      {text[1]}
    </Label3>
  );
  if (state === 1) {
    return (
      <g>
        <SlicedGraph s={s} {...base} cut={{ axis: 'y', at: b, z: ZR }} curveColor={CARDINAL} lines={[zAxis]} />
        {point}
        {label(['y', 'b'], [R[1], b, ZR[1]], 6)}
      </g>
    );
  }
  if (state === 2) {
    return (
      <g>
        <SlicedGraph s={s} {...base} cut={{ axis: 'x', at: a, z: ZR }} curveColor={GREEN} lines={[zAxis]} />
        {point}
        {label(['x', 'a'], [a, R[1], ZR[1]], -6)}
      </g>
    );
  }
  const lines =
    state === 3
      ? [
          zAxis,
          { pts: along(R, (t) => [t, b, Z * f(t, b)]), color: CARDINAL, width: 3.5 },
          { pts: along(R, (t) => [a, t, Z * f(a, t)]), color: GREEN, width: 3.5 },
        ]
      : [zAxis];
  return (
    <g>
      <Surface s={s} {...base} lines={lines} />
      {point}
    </g>
  );
}

/**
 * Seconds since `state` last changed, counted while it is 1 or 2 (the point moves) and the slide is
 * showing; 0 otherwise, and in print.
 */
function useClock(state, ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    setT(0);
    if (PRINT || (state !== 1 && state !== 2)) return undefined;
    let id;
    let t0;
    const tick = (now) => {
      t0 ??= now;
      if (ref.current?.closest('section')?.classList.contains('present')) setT((now - t0) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [state, ref]);
  return t;
}

/**
 * The graph of the two hills of Lecture 7, with the axes and a point (a, b, f(a, b)) on it, cut
 * through the point by vertical planes as the slide goes on: from key press `steps[0]`, by the plane
 * y = b (the curve z = f(x, b) in red, the point moving back and forth along it, in the x direction);
 * from `steps[1]`, by the plane x = a (z = f(a, y) in green, the point moving along it in the y
 * direction); from `steps[2]`, both curves, no planes, the point still. Shared by the slides
 * "Multivariable functions" and "Partial derivatives"; `space` (width, height, unit, …) goes to the
 * Space. `viewRef`, if given, holds the Space's current view `s` (it rocks), for a slide that draws
 * over the picture (Linear approximation: the plane y = b moving down to a graph of its own).
 */
export default function HoldFigure({ steps: [k1, k2, k3], viewRef, ...space }) {
  const a = A;
  const b = B;
  const m1 = useRef(null);
  const m2 = useRef(null);
  const m3 = useRef(null);
  const s1 = useFragmentShown(m1);
  const s2 = useFragmentShown(m2);
  const s3 = useFragmentShown(m3);
  const state = s3 ? 3 : s2 ? 2 : s1 ? 1 : 0;
  const w = (2 * Math.PI * useClock(state, m1)) / PERIOD;
  const at = state === 1 ? [a + DX * Math.sin(w), b] : state === 2 ? [a, Y_MID + Y_AMP * Math.sin(w + Y_PHASE)] : [a, b];

  return (
    <>
      <span ref={m1} className="fragment fx-marker" data-fragment-index={k1} aria-hidden="true" />
      <span ref={m2} className="fragment fx-marker" data-fragment-index={k2} aria-hidden="true" />
      <span ref={m3} className="fragment fx-marker" data-fragment-index={k3} aria-hidden="true" />
      <Space center={[0.5, 0.66]} axisLen={[4.5, 4.5, ZL]} az={135} el={30} swing={6} title="The graph of a function of two variables, with the axes and a point on it, cut by vertical planes through the point" {...space}>
        {(s) => {
          if (viewRef) viewRef.current = s;
          return PRINT ? (
            <g>
              <Picture s={s} state={0} a={a} b={b} />
              <Fragment as="g" index={k1}>
                <Fragment as="g" index={k2} effect="fade-out">
                  <Picture s={s} state={1} a={a} b={b} />
                </Fragment>
              </Fragment>
              <Fragment as="g" index={k2}>
                <Fragment as="g" index={k3} effect="fade-out">
                  <Picture s={s} state={2} a={a} b={b} />
                </Fragment>
              </Fragment>
              <Fragment as="g" index={k3}>
                <Picture s={s} state={3} a={a} b={b} />
              </Fragment>
            </g>
          ) : (
            <Picture s={s} state={state} a={a} b={b} at={at} />
          );
        }}
      </Space>
    </>
  );
}
