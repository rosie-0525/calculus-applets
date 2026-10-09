import { useRef, useState } from 'react';
import '../lectures/l8/styles/deck.css';
import Tex from '../lectures/l8/components/Tex.jsx';
import Space, { Dot3, Label3 } from '../lectures/l8/components/Space.jsx';
import SlicedGraph, { along } from '../lectures/l8/components/Slices.jsx';
import { A, B, Z, ZR } from '../lectures/l8/components/HoldFigure.jsx';
import { hills as f, HILLS_R as R } from '../lectures/l8/components/hills.js';
import { SliceGraph, SLICES, CARDINAL, GREEN, INK } from '../lectures/l8/slides/Slide05bLinearApprox.jsx';
import { useClock } from '../lectures/l8/slides/Slide05Compute.jsx';

export const lecture = 8;

const PLANE_INK = '#3b5f91';
const MESH = 'rgba(15, 40, 50, 0.16)';
const AXIS = '#6b7280'; // as Space draws the axes
const ZL = 3.2; // the z-axis, up to z = 3.2
const PERIOD = 6; // seconds, there and back
const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };
const AMBER = '#b45309'; // the moving point, apart from the point (a, b) in ink
const P0 = [A, B, Z * f(A, B)]; // the point (a, b) on the graph

// The two ways to hold a variable, as in HoldFigure (whose picture is not exported): the plane, the
// slice's colour, and where the point is after w radians, moving back and forth along the slice
// (in the x direction a − 0.8 ≤ x ≤ a + 0.8; in the y direction −0.7 ≤ y ≤ 0.4, above which it
// would go behind the big hill), starting from (a, b)
const Y_MID = -0.15;
const Y_AMP = 0.55;
const Y_PHASE = Math.asin((B - Y_MID) / Y_AMP);
const HOLD = {
  y: {
    cut: { axis: 'y', at: B, z: ZR },
    color: CARDINAL,
    name: ['y', 'b'],
    nameAt: [R[1], B, ZR[1]],
    dx: 6,
    at: (w) => [A + 0.8 * Math.sin(w), B],
    slice: SLICES.x,
    sliceTex: 'z=f(x,b)',
    of: 'x',
  },
  x: {
    cut: { axis: 'x', at: A, z: ZR },
    color: GREEN,
    name: ['x', 'a'],
    nameAt: [A, R[1], ZR[1]],
    dx: -6,
    at: (w) => [A, Y_MID + Y_AMP * Math.sin(w + Y_PHASE)],
    slice: SLICES.y,
    sliceTex: 'z=f(a,y)',
    of: 'y',
  },
};

/**
 * The graph of the two hills cut by the plane y = b (or x = a), with the point (a, b) on it, labelled,
 * and a point moving along the slice, at (x, y).
 */
function Picture({ s, hold, at: [x, y] }) {
  // the z-axis above the graph, painted with it, in depth order
  const zAxis = { pts: along([Z * f(0, 0), ZL], (t) => [0, 0, t], 12), color: AXIS, width: 1.5 };
  return (
    <g>
      <SlicedGraph s={s} f={f} x={R} y={R} n={32} zScale={Z} mesh={MESH} cut={hold.cut} curveColor={hold.color} lines={[zAxis]} />
      <Dot3 s={s} at={P0} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />
      <Label3 s={s} at={P0} dx={12} dy={-12} color={INK} size={17} {...halo}>
        (a, b)
      </Label3>
      <Dot3 s={s} at={[x, y, Z * f(x, y)]} color={AMBER} r={6} stroke="#fff" strokeWidth="1.5" />
      <Label3 s={s} at={hold.nameAt} dx={hold.dx} dy={-8} color={PLANE_INK} size={19} fontWeight="400" textAnchor={hold.dx < 0 ? 'end' : 'start'} {...halo}>
        {hold.name[0]}
        <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
          {' = '}
        </tspan>
        {hold.name[1]}
      </Label3>
    </g>
  );
}

/*
 * The graph of Multivariable functions and Partial derivatives, cut through the point (a, b) by the
 * plane y = b or x = a (the buttons), the point moving back and forth along the slice; beside it,
 * the slice as the graph of a function of one variable with its tangent line at the point, as on
 * Linear approximation.
 */
export default function Slices() {
  const [key, setKey] = useState('y');
  const hold = HOLD[key];
  const ref = useRef(null);
  const w = (2 * Math.PI * useClock(key, ref)) / PERIOD;
  return (
    <div ref={ref} className="viz-col">
      <div className="viz-toggle" role="group" aria-label="Which variable to hold constant">
        {[
          ['y', 'y=b'],
          ['x', 'x=a'],
        ].map(([k, tex]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={key === k} onClick={() => setKey(k)}>
            Hold <Tex tex={tex} /> constant
          </button>
        ))}
      </div>
      <div className="steep">
        <figure>
          <Space width={560} height={352} unit={64} center={[0.5, 0.736]} axisLen={[4.5, 4.5, ZL]} az={135} el={30} swing={6} title="The graph of a function of two variables, with the axes and a point on it, cut by a vertical plane through the point">
            {(s) => <Picture s={s} hold={hold} at={hold.at(w)} />}
          </Space>
          <figcaption>
            Graph of <Tex tex="f" />
          </figcaption>
        </figure>
        <figure>
          <SliceGraph key={key} sl={hold.slice} />
          <figcaption>
            The slice <Tex tex={hold.sliceTex} />, a function of <Tex tex={hold.of} />
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
