import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import Space, { Dot3, PlanePatch, Seg3 } from '../lectures/l11/components/Space.jsx';
import Surface from '../lectures/l11/components/Surface.jsx';
import { I } from '../lectures/l11/components/svgmath.jsx';
import { f, L, ROWS, D, Z, FLOOR, FAR, label, INK, GOLD, PLANE, BLUE, RED } from '../lectures/l11/slides/Slide06Example1.jsx';

export const lecture = 11;

/** The slide's Graph as it is after its last key press: the graph of f with its tangent plane at (1, 1, 4), the graph of L, and the error at (10, 10). */
function Graph() {
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
            <Surface
              s={s}
              f={f}
              x={D}
              y={D}
              n={24}
              zScale={Z}
              mesh="rgba(15, 40, 50, 0.16)"
              patches={[{ f: L, x: D, y: D, n: 10, fill: PLANE, opacity: 0.82, ghost: 0.3, stroke: 'rgba(120, 90, 20, 0.25)' }]}
            />
            <Dot3 s={s} at={[1, 1, Z * f(1, 1)]} color={INK} r={5.5} stroke="#fff" strokeWidth="1.5" />
            <text x={ax + 4} y={ay - 14} textAnchor="middle" fill={INK} {...label}>
              (1, 1, 4)
            </text>
            <text x={fx - 10} y={fy - 14} textAnchor="end" fill={BLUE} {...label}>
              <I>z</I> = <I>f</I>(<I>x</I>, <I>y</I>)
            </text>
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
          </g>
        );
      }}
    </Space>
  );
}

/*
 * Example 1 with its last key press showing, without the two questions (∇f(1, 1) and the estimate
 * of f(1.3, 0.9), which the table answers): the table of the approximations L(x, y), the actual
 * values f(x, y) and the errors f − L, nearest to (1, 1) first, beside the graph of f with its
 * tangent plane at (1, 1, 4) and the error at (10, 10). On the slide the graph is drawn without the
 * plane until the table comes (a fade-out fragment, which the page would show too).
 */
export default function LinearError() {
  return (
    <div className="stage lin-error">
      <div className="stage-text">
        <table className="l10-ex1-table">
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
        </table>
      </div>

      <div className="stage-fig">
        <Graph />
      </div>
    </div>
  );
}
