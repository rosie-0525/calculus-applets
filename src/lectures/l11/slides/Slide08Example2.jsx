import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { Arrow } from '../components/Plane.jsx';
import { CubicContour, NamedPoint, cubic, cubicGrad } from '../components/Cubic.jsx';

export const RED = '#8c1515';
export const SCALE = 0.18; // each arrow is SCALE ∇f(q), so the lengths show the relative magnitudes
// more points on the drawn level curves, at 1.4 or more from each other (and from (1, 0) and
// (−2, −1)), whose arrows stay in the plot and apart: x given, y the root of y² + xy + x³ = c. On
// the levels 35 and 100 (and −20, −50) ∇f is too large for an arrow at this scale.
export const onLevel = (c, x, sign) => [x, (-x + sign * Math.sqrt(x * x - 4 * (x ** 3 - c))) / 2];
export const MORE = [
  onLevel(-5, -2, 1),
  onLevel(8, 1, -1),
  onLevel(8, 0.5, 1),
  onLevel(8, -1.75, -1),
  onLevel(1, -0.5, 1),
  onLevel(8, 2, -1),
  onLevel(8, 1.5, 1),
];

/** The arrow SCALE ∇f(q) from q, and the point q. */
export function GradArrow({ p, q }) {
  const [u, v] = cubicGrad(...q);
  return (
    <g>
      <Arrow p={p} from={q} to={[q[0] + SCALE * u, q[1] + SCALE * v]} color={RED} width={3} head={12} />
      <NamedPoint p={p} at={q} />
    </g>
  );
}

/**
 * Example 2 (board; Mark's Example 1, shortened): the contour plot of f(x, y) = x³ + xy + y², ∇f
 * given, with the points (1, 0) and (−2, −1): (i) ∇f(1, 0), and plot it; (ii) the same
 * at (−2, −1), written out; (iii) what do you observe? The three parts from the start (their answers commented
 * out); key press 1: ∇f(1, 0) on the plot, to scale; 2: ∇f(−2, −1); 3: ∇f at seven more
 * points of the level curves. Mark's part 3, the tangent line at (−2, −1), is Example 2
 * (continued), after Gradient and level curves.
 */
export default function Slide08Example2() {
  return (
    <section className="dense">
      <h2>
        Example 2 <span className="board-pill">board</span>
      </h2>

      <div className="stage">
        <div className="stage-text">
          <p>
            Let <Tex tex={r`f(x,y)=x^3+xy+y^2`} />. Then <Tex tex={r`\nabla f(x,y)=\begin{bmatrix}3x^2+y\\ x+2y\end{bmatrix}`} />.
          </p>
          <ol className="parts">
            <li>
              Compute <Tex tex={r`\nabla f(1,0)`} />, and plot it.
            </li>
            {/* ∇f(1, 0) = (3, 1). */}
            <li>
              Compute <Tex tex={r`\nabla f(-2,-1)`} />, and plot it.
            </li>
            {/* ∇f(−2, −1) = (11, −4). */}
            <li>What do you observe?</li>
            {/* Each arrow is perpendicular to the level curve through its point (and points toward the
                higher levels). */}
          </ol>
        </div>

        <CubicContour>
          {(p) => (
            <g>
              <Fragment as="g" index={3}>
                {MORE.map((q) => (
                  <GradArrow key={q.join()} p={p} q={q} />
                ))}
              </Fragment>
              <Fragment as="g" index={1}>
                <GradArrow p={p} q={[1, 0]} />
              </Fragment>
              <Fragment as="g" index={2}>
                <GradArrow p={p} q={[-2, -1]} />
              </Fragment>
              <NamedPoint p={p} at={[1, 0]} name="(1, 0)" dx={0} dy={-12} />
              <NamedPoint p={p} at={[-2, -1]} name="(−2, −1)" dx={-6} dy={-10} anchor="end" />
            </g>
          )}
        </CubicContour>
      </div>
    </section>
  );
}
