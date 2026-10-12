import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { PlanePatch, Dot3, Seg3, Sub } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import { hills as f, HILLS_R as R } from '../components/hills.js';

export const RED = '#8c1515';
export const GREEN = '#175e54';
export const INK = '#14213d';
export const MATH = 'KaTeX_Math, Georgia, serif';
export const MAIN = 'KaTeX_Main, Georgia, serif';
export const GRAY = '#6b7280';
export const Z = 1.1;
export const L = 0.5; // half the length of the tangent lines, along x and along y
export const AX = 4; // the x- and y-axes run from −4 to 4, the z-axis up to Z_TOP
export const Z_TOP = 2.6;
// on the small hill, to its south, only one partial derivative is 0: f_x = 0 and f_y ≈ 1.14
export const ONLY_X = [-1.099, -2];
// two critical points (Newton's method on f_x = f_y = 0): the top of the big hill, and the pass
// between the two hills, a saddle point
export const TOP = [0.8, 0.7];
export const PASS = [-0.277, -0.377];

export const h = 1e-5;
export const fx = (a, b) => (f(a + h, b) - f(a - h, b)) / (2 * h);
export const fy = (a, b) => (f(a, b + h) - f(a, b - h)) / (2 * h);

/** The point (a, b, f(a, b)) of the graph and its tangent lines in the x direction (red) and the y direction (green). */
export function Tangents({ s, at: [a, b] }) {
  const z = Z * f(a, b);
  const dx = L * Z * fx(a, b);
  const dy = L * Z * fy(a, b);
  return (
    <g>
      <Seg3 s={s} from={[a - L, b, z - dx]} to={[a + L, b, z + dx]} color={RED} width={3} />
      <Seg3 s={s} from={[a, b - L, z - dy]} to={[a, b + L, z + dy]} color={GREEN} width={3} />
      <Dot3 s={s} at={[a, b, z]} color={INK} r={6} stroke="#fff" strokeWidth="1.5" />
    </g>
  );
}

/** The x- and y-axes in the plane z = 0, under the graph (the negative halves dashed), and their labels. */
export function FloorAxes({ s }) {
  const o = s.P([0, 0, 0]);
  return (
    <g>
      {[
        [[1, 0, 0], 'x'],
        [[0, 1, 0], 'y'],
      ].map(([e, name]) => {
        const pos = s.P(e.map((c) => c * AX));
        const neg = s.P(e.map((c) => -c * AX));
        const lab = s.P(e.map((c) => c * (AX + 0.35)));
        return (
          <g key={name}>
            <line x1={o[0]} y1={o[1]} x2={neg[0]} y2={neg[1]} stroke="#9ca3af" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1={o[0]} y1={o[1]} x2={pos[0]} y2={pos[1]} stroke={GRAY} strokeWidth="2" />
            <text x={lab[0]} y={lab[1] + 7} textAnchor="middle" fill={GRAY} fontSize="22" fontStyle="italic" fontFamily={MATH}>
              {name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** "f_x = 0, f_y ≠ 0" next to a point, each partial derivative in the colour of its tangent line. */
export function Which({ s, at: [a, b], x, y, dx = 0, dy = 0, anchor = 'start' }) {
  const [px, py] = s.P([a, b, Z * f(a, b)]);
  const part = (v, rel, color) => (
    <tspan fill={color}>
      <tspan fontFamily={MATH} fontStyle="italic">
        f
      </tspan>
      <Sub>
        <tspan fontFamily={MATH} fontStyle="italic">
          {v}
        </tspan>
      </Sub>
      {` ${rel} 0`}
    </tspan>
  );
  return (
    <text x={px + dx} y={py + dy} textAnchor={anchor} fontSize="20" fontFamily={MAIN} className="map-label">
      {part('x', x ? '=' : '≠', RED)}
      <tspan fill={INK}>, </tspan>
      {part('y', y ? '=' : '≠', GREEN)}
    </text>
  );
}

/**
 * Critical points: "Let f: ℝⁿ → ℝ", Mark's definition. Beside it the graph of the two hills over
 * the xy-plane, with the x-, y- and z-axes; key press 1: e.g. (a, b) is a critical point for
 * f(x, y) if f_x(a, b) = f_y(a, b) = 0, and the top of the big hill, with its tangent lines in the
 * x direction (red) and the y direction (green), both horizontal; 2: a point where only f_x is 0
 * (only the red tangent line horizontal); 3: the pass between the hills, a saddle point, where
 * both are horizontal.
 */
export default function Slide04Critical() {
  return (
    <section>
      <h2>Critical points</h2>

      <p>
        Let <Tex tex={r`f:\mathbb{R}^n\to\mathbb{R}`} /> be a scalar-valued function.
      </p>

      <div className="stage">
        <div className="stage-text">
          <div className="block definition">
            <p className="block-title">Definition</p>
            <p>
              A <strong>critical point</strong> is a point where all the partial derivatives <em>vanish</em> (that
              is, are equal to 0).
            </p>
          </div>

          <Fragment index={1} className="crit-two">
            <p>
              e.g. <Tex tex="(a,b)" /> is a critical point for <Tex tex="f(x,y)" /> if <Tex tex="f_x(a,b)=0" /> and{' '}
              <Tex tex="f_y(a,b)=0" />
            </p>
          </Fragment>
        </div>

        <Space width={640} height={400} unit={70} center={[0.5, 0.56]} axes={false} az={45} el={28} swing={8} title="The graph of a function with two hills over the xy-plane, seen across the valley between them, with the x-, y- and z-axes; at a point on a slope only the tangent line in the x direction is horizontal; at the top of the big hill and at the pass between the hills both tangent lines are horizontal">
          {(s) => {
            const zLab = s.P([0, 0, Z_TOP + 0.25]);
            return (
              <g>
                <PlanePatch s={s} P={[0, 0, 0]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
                <FloorAxes s={s} />
                {/* the z-axis is painted with the graph, so that the graph hides the part under it */}
                <Surface s={s} f={f} x={R} y={R} n={36} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" lines={[{ pts: [[0, 0, 0], [0, 0, Z_TOP]], color: GRAY, width: 2 }]} />
                <text x={zLab[0]} y={zLab[1] + 6} textAnchor="middle" fill={GRAY} fontSize="22" fontStyle="italic" fontFamily={MATH}>
                  z
                </text>
                <Fragment as="g" index={2}>
                  <Tangents s={s} at={ONLY_X} />
                  <Which s={s} at={ONLY_X} x dx={-12} dy={74} anchor="middle" />
                </Fragment>
                <Fragment as="g" index={1}>
                  <Tangents s={s} at={TOP} />
                  <Which s={s} at={TOP} x y dx={24} dy={-26} anchor="middle" />
                </Fragment>
                <Fragment as="g" index={3}>
                  <Tangents s={s} at={PASS} />
                  <Which s={s} at={PASS} x y dy={44} anchor="middle" />
                </Fragment>
              </g>
            );
          }}
        </Space>
      </div>
    </section>
  );
}
