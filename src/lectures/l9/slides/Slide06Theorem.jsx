import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { PlanePatch, Dot3, Seg3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import SlicedGraph from '../components/Slices.jsx';

export const RED = '#8c1515';
export const INK = '#14213d';
export const GRAY = '#6b7280';
export const BLUE = '#2f5d99'; // the label of the plane y = b
export const MATH = 'KaTeX_Math, Georgia, serif';
export const MAIN = 'KaTeX_Main, Georgia, serif';

// the peak of Local maximum and minimum, at (a, b) = (1, 0)
export const f = (x, y) => 3 * x * Math.exp(-(x * x + y * y) / 2);
export const R = [-3, 3];
export const Z = 0.7;
export const FLOOR = -2.1;
export const TOP = [1, 0, Z * f(1, 0)];
// The floor is the xy-plane, with the origin under the point O of the graph, at the back on the
// right: the peak is then over (a, b) = (3.5, 1.5), the plane y = b is not the plane of the x- and
// z-axes, and the z-axis stands clear of the peak.
export const O = [-2.5, -1.5];
export const AX = 3.4; // the x- and y-axes run past the edge of the floor, at 3
export const Z_TOP = 2.3;
// the z-axis is painted with the graph, so that the graph hides the part under it
export const Z_AXIS = { pts: [[...O, FLOOR], [...O, Z_TOP]], color: GRAY, width: 2 };

export const VIEW = { width: 500, height: 430, unit: 56, center: [0.5, 0.5], axes: false, az: -62, el: 24, swing: 8 };

/** The x- and y-axes on the floor, under the graph (the negative halves dashed). */
export function FloorAxes({ s }) {
  const o = s.P([...O, FLOOR]);
  return (
    <g>
      {[
        [[AX, O[1], FLOOR], [-3, O[1], FLOOR]],
        [[O[0], AX, FLOOR], [O[0], -3, FLOOR]],
      ].map(([pos3, neg3], k) => {
        const pos = s.P(pos3);
        const neg = s.P(neg3);
        return (
          <g key={k}>
            <line x1={o[0]} y1={o[1]} x2={neg[0]} y2={neg[1]} stroke="#9ca3af" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1={o[0]} y1={o[1]} x2={pos[0]} y2={pos[1]} stroke={GRAY} strokeWidth="2" />
          </g>
        );
      })}
    </g>
  );
}

/** The labels x, y, z at the ends of the axes, over everything. */
export function AxisLabels({ s }) {
  return (
    <g>
      {[
        [[AX + 0.35, O[1], FLOOR], 'x'],
        [[O[0], AX + 0.35, FLOOR], 'y'],
        [[...O, Z_TOP + 0.3], 'z'],
      ].map(([at, name]) => {
        const [px, py] = s.P(at);
        return (
          <text key={name} x={px} y={py + 7} textAnchor="middle" fill={GRAY} fontSize="20" fontStyle="italic" fontFamily={MATH}>
            {name}
          </text>
        );
      })}
    </g>
  );
}

export const it = (c) => (
  <tspan fontFamily={MATH} fontStyle="italic">
    {c}
  </tspan>
);

/** "y = b" on the plane, at its top on the right. */
export function PlaneLabel({ s }) {
  const [px, py] = s.P([-2.55, 0, 1.45]);
  return (
    <text x={px} y={py} textAnchor="middle" fill={BLUE} fontSize="20" fontFamily={MAIN} className="map-label">
      {it('y')} = {it('b')}
    </text>
  );
}

/** "f(x, b)" next to the slice curve. */
export function SliceLabel({ s }) {
  const t = 2.3;
  const [px, py] = s.P([t, 0, Z * f(t, 0)]);
  return (
    <text x={px} y={py - 14} textAnchor="middle" fill={RED} fontSize="20" fontFamily={MAIN} className="map-label">
      {it('f')}({it('x')}, {it('b')})
    </text>
  );
}

/**
 * Local extrema and critical points: Mark's theorem (with Christine's "(maximum or minimum)").
 * Why: key press 1, let (a, b) be a local extremum; 2, fix y = b; 3, the slice f(x, b) has a local
 * extremum at x = a, so f_x(a, b) = 0; the same for y. 4: critical points need not be local
 * extrema, e.g. they can be saddle points. The graph of Local maximum and minimum with its peak, over the xy-plane with the x-, y-
 * and z-axes; key press 2: cut by the plane y = b through the peak; 3: the slice f(x, b) with its
 * horizontal tangent line.
 */
/** The graph cut by the plane y = b, with (`slice`) the slice f(x, b) and its tangent line at the peak. */
export function CutGraph({ slice = false, title }) {
  return (
    <Space {...VIEW} title={title}>
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <FloorAxes s={s} />
          <SlicedGraph
            s={s}
            f={f}
            x={R}
            y={R}
            n={36}
            zScale={Z}
            cut={{ axis: 'y', at: 0, z: [FLOOR, 1.9] }}
            curveColor={slice ? RED : 'none'}
            mesh="rgba(15, 40, 50, 0.16)"
            lines={[Z_AXIS]}
          />
          {slice && <Seg3 s={s} from={[TOP[0] - 0.9, 0, TOP[2]]} to={[TOP[0] + 0.9, 0, TOP[2]]} color={RED} width={3} />}
          <Dot3 s={s} at={TOP} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />
          <PlaneLabel s={s} />
          {slice && <SliceLabel s={s} />}
          <AxisLabels s={s} />
        </g>
      )}
    </Space>
  );
}

export default function Slide06Theorem() {
  return (
    <section className="dense">
      <h2>Local extrema and critical points</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block theorem">
            <p>
              If <Tex tex="f" /> has a <strong>local extremum</strong> (maximum or minimum) at a point <Tex tex="P" /> then{' '}
              <Tex tex="P" /> is a critical point.
            </p>
          </div>

          <Fragment index={1} className="block why">
            <p className="block-title">Why?</p>
            <p>
              Let <Tex tex="(a,b)" /> be a local extremum of <Tex tex="f" />.{' '}
              <Fragment index={2} as="span">
                Fix <Tex tex="y=b" />.
              </Fragment>{' '}
              <Fragment index={3} as="span">
                The function <Tex tex="f(x,b)" /> has a local extremum when <Tex tex="x=a" />, so
              </Fragment>
            </p>
            <Fragment index={3}>
              <Tex display tex="f_x(a,b)=0." />
              <p>
                Similarly, <Tex tex="f_y(a,b)=0" />.
              </p>
            </Fragment>
          </Fragment>

          <Fragment index={4} as="p" className="crit-not">
            Critical points need not be local extrema.
            <br />
            e.g. they can be saddle points
          </Fragment>
        </div>

        <div className="l9-stack">
          <Fragment as="div" index={2} effect="fade-out">
            <Space {...VIEW} title="The graph of a function with a peak">
              {(s) => (
                <g>
                  <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
                  <FloorAxes s={s} />
                  <Surface s={s} f={f} x={R} y={R} n={36} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" lines={[Z_AXIS]} />
                  <Dot3 s={s} at={TOP} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />
                  <AxisLabels s={s} />
                </g>
              )}
            </Space>
          </Fragment>
          <Fragment as="div" index={2}>
            <Fragment as="div" index={3} effect="fade-out">
              <CutGraph title="The graph cut by the vertical plane y = b through the peak" />
            </Fragment>
          </Fragment>
          <Fragment as="div" index={3}>
            <CutGraph slice title="The graph cut by the vertical plane y = b through the peak: the slice f(x, b) has a maximum there, with a horizontal tangent line" />
          </Fragment>
        </div>
      </div>
    </section>
  );
}
