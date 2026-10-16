import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Dot3, PlanePatch, Seg3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import { I, MAIN } from '../components/svgmath.jsx';

export const INK = '#14213d';
export const GOLD = '#d99a1e'; // L, as the tangent line and plane on Linear approximation
export const PLANE = '#f2c14e'; // the tangent plane, as there
export const BLUE = '#0e7490'; // f, as its graph there
export const RED = '#8c1515'; // the error
export const f = (x, y) => x * x + 2 * y * y + x * y;
export const L = (x, y) => 4 + 3 * (x - 1) + 5 * (y - 1); // the linear approximation at (1, 1)
// the table: L against f, nearest to (1, 1) first, and the error f − L
export const ROWS = [
  [r`(1.03,\,0.99)`, '4.04', '4.0408', '0.0008'],
  [r`(1.3,\,0.9)`, '4.4', '4.48', '0.08'],
  [r`(10,\,10)`, '76', '400', '324'],
];
// the graph over [0, 10] × [0, 10], out to (10, 10); seen from the side, (10, 10) on the right
export const D = [0, 10];
export const Z = 0.02;
export const FLOOR = -0.4;
export const FAR = [10, 10];

export const label = { fontSize: 18, fontFamily: MAIN, stroke: 'rgba(255, 255, 255, 0.85)', strokeWidth: 4, style: { paintOrder: 'stroke' } };

/**
 * The graph of f; from key press 3, with its tangent plane at (1, 1, 4) (the graph of L) and the
 * error at (10, 10), the red segment from L(10, 10) = 76 up to f(10, 10) = 400 (the errors at the
 * other two points are too small to see).
 */
export function Graph() {
  const surface = (s, plane) => (
    <Surface
      s={s}
      f={f}
      x={D}
      y={D}
      n={24}
      zScale={Z}
      mesh="rgba(15, 40, 50, 0.16)"
      patches={plane ? [{ f: L, x: D, y: D, n: 10, fill: PLANE, opacity: 0.82, ghost: 0.3, stroke: 'rgba(120, 90, 20, 0.25)' }] : []}
    />
  );
  return (
    <Space width={460} height={340} unit={26} center={[0.06, 0.65]} axes={false} az={45} el={22} swing={8} title="The graph of f(x, y) = x² + 2y² + xy over 0 ≤ x, y ≤ 10, its tangent plane at (1, 1, 4), and the error at (10, 10)">
      {(s) => {
        const at = (x, y, z) => s.P([x, y, Z * z]);
        const [ax, ay] = at(1, 1, f(1, 1));
        const [tx, ty] = at(...FAR, f(...FAR));
        const [bx, by] = at(...FAR, L(...FAR));
        const [fx, fy] = at(0, 10, f(0, 10));
        const [lx, ly] = at(10, 0, L(10, 0));
        return (
          <g>
            <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={D} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
            <Fragment as="g" index={3} effect="fade-out">
              {surface(s, false)}
            </Fragment>
            <Fragment as="g" index={3}>
              {surface(s, true)}
            </Fragment>
            <Dot3 s={s} at={[1, 1, Z * f(1, 1)]} color={INK} r={5.5} stroke="#fff" strokeWidth="1.5" />
            <text x={ax + 4} y={ay - 14} textAnchor="middle" fill={INK} {...label}>
              (1, 1, 4)
            </text>
            <text x={fx - 10} y={fy - 14} textAnchor="end" fill={BLUE} {...label}>
              <I>z</I> = <I>f</I>(<I>x</I>, <I>y</I>)
            </text>
            <Fragment as="g" index={3}>
              <text x={lx + 6} y={ly + 26} textAnchor="middle" fill={GOLD} {...label}>
                <I>z</I> = <I>L</I>(<I>x</I>, <I>y</I>)
              </text>
              <Seg3 s={s} from={[...FAR, Z * L(...FAR)]} to={[...FAR, Z * f(...FAR)]} color={RED} width={3.5} />
              <Dot3 s={s} at={[...FAR, Z * f(...FAR)]} color={BLUE} r={5} stroke="#fff" strokeWidth="1.5" />
              <Dot3 s={s} at={[...FAR, Z * L(...FAR)]} color={GOLD} r={5} stroke="#fff" strokeWidth="1.5" />
              <text x={tx + 10} y={(ty + by) / 2 - 4} textAnchor="start" fill={RED} {...label}>
                error
              </text>
              <text x={tx + 10} y={(ty + by) / 2 + 18} textAnchor="start" fill={RED} {...label}>
                = 324
              </text>
              <text x={bx + 10} y={by + 6} textAnchor="start" fill={INK} {...label} fontSize={15}>
                (10, 10)
              </text>
            </Fragment>
          </g>
        );
      }}
    </Space>
  );
}

/**
 * Example 1 (board; the textbook's Examples 11.1.2 and 11.1.3): f(x, y) = x² + 2y² + xy near
 * a = (1, 1): (i) ∇f(1, 1); (ii) estimate f(1.3, 0.9). One part per key press; the graph of f over
 * [0, 10] × [0, 10] beside them from the start, with the point (1, 1, 4). The answers are commented
 * out. Key press 3 (f(1.03, 0.99) and f(10, 10) the same way, said aloud): the table of the
 * approximations L(x, y), the actual values f(x, y) and the errors f − L, nearest to a first; on the
 * graph, the tangent plane (the graph of L) and the error at (10, 10).
 */
export default function Slide06Example1() {
  return (
    <section>
      <h2>
        Example 1 <span className="board-pill">board</span>
      </h2>

      <div className="stage">
        <div className="stage-text">
          <p>
            Let <Tex tex={r`f(x,y)=x^2+2y^2+xy`} />.
          </p>
          <ol className="parts">
            <Fragment index={1} as="li">
              Compute <Tex tex={r`\nabla f(1,1)`} />.
            </Fragment>
            {/* ∇f = (2x + y, 4y + x), so ∇f(1, 1) = (3, 5); f(1, 1) = 4. */}
            <Fragment index={2} as="li">
              Use the linear approximation at <Tex tex="(1,1)" /> to estimate <Tex tex="f(1.3,\,0.9)" />.
            </Fragment>
            {/* f(1.3, 0.9) ≈ 4 + (3, 5) · (0.3, −0.1) = 4 + 0.9 − 0.5 = 4.4; exactly 4.48. */}
          </ol>
          <Fragment index={3} as="table" className="l10-ex1-table">
            <thead>
              <tr>
                <th>
                  <Tex tex="(x,y)" />
                </th>
                <th>
                  Approximation
                  <br />
                  <Tex tex={r`\textcolor{${GOLD}}{L(x,y)}`} />
                </th>
                <th>
                  Actual value
                  <br />
                  <Tex tex={r`\textcolor{${BLUE}}{f(x,y)}`} />
                </th>
                <th>
                  Error
                  <br />
                  <Tex tex={r`\textcolor{${RED}}{f-L}`} />
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([pt, approx, actual, error]) => (
                <tr key={pt}>
                  <td>
                    <Tex tex={pt} />
                  </td>
                  <td>
                    <Tex tex={r`\textcolor{${GOLD}}{${approx}}`} />
                  </td>
                  <td>
                    <Tex tex={r`\textcolor{${BLUE}}{${actual}}`} />
                  </td>
                  <td>
                    <Tex tex={r`\textcolor{${RED}}{${error}}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Fragment>
        </div>

        <div className="stage-fig">
          <Graph />
        </div>
      </div>
    </section>
  );
}
