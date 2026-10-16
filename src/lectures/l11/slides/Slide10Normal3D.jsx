import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Arrow3, Dot3, PlanePatch, Label3 } from '../components/Space.jsx';
import { I, B } from '../components/svgmath.jsx';

export const RED = '#8c1515';
export const INK = '#14213d';
export const PLANE = '#f2c14e';
// the textbook's Example 11.2.6: the sphere x² + y² + z² = 6, a level surface of g = x² + y² + z²,
// its tangent plane 2x + y + z = 6 at a = (2, 1, 1), where ∇g = (4, 2, 2)
export const R = Math.sqrt(6);
export const A = [2, 1, 1];
export const GRAD = [4, 2, 2];
export const K = 0.24; // the arrow is ∇g(a) scaled by K
export const n = GRAD.map((c) => c / Math.hypot(...GRAD));
export const E1 = [-1 / Math.sqrt(5), 2 / Math.sqrt(5), 0]; // two unit vectors along the plane
export const E2 = [n[1] * E1[2] - n[2] * E1[1], n[2] * E1[0] - n[0] * E1[2], n[0] * E1[1] - n[1] * E1[0]];

/** The sphere of radius R: its outline, shaded, and its parallels and meridians on the near side. */
export function Sphere({ s }) {
  const [cx, cy] = s.P([0, 0, 0]);
  const rad = R * s.unit;
  const curves = [];
  const circle = (pt) => {
    const pts = [];
    for (let k = 0; k <= 96; k += 1) pts.push(pt((2 * Math.PI * k) / 96));
    return pts;
  };
  for (const lat of [-60, -30, 0, 30, 60]) {
    const f = (lat * Math.PI) / 180;
    curves.push(circle((t) => [R * Math.cos(f) * Math.cos(t), R * Math.cos(f) * Math.sin(t), R * Math.sin(f)]));
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const g = (lon * Math.PI) / 180;
    curves.push(circle((t) => [R * Math.cos(t) * Math.cos(g), R * Math.cos(t) * Math.sin(g), R * Math.sin(t)]));
  }
  // the near half of each curve, piece by piece
  const d = curves
    .map((pts) => {
      let out = '';
      let pen = false;
      for (const q of pts) {
        if (s.depth(q) < 0) {
          pen = false;
          continue;
        }
        const [x, y] = s.P(q);
        out += `${pen ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
        pen = true;
      }
      return out;
    })
    .join('');
  return (
    <g>
      <defs>
        <radialGradient id="l10-sphere" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#e3f1f4" />
          <stop offset="100%" stopColor="#5d9fb0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rad} fill="url(#l10-sphere)" stroke="#3d7f90" strokeWidth="1.2" />
      <path d={d} fill="none" stroke="rgba(15, 50, 60, 0.28)" strokeWidth="1" />
    </g>
  );
}

/**
 * Gradient and level surfaces: Mark's statement (→ Theorem 11.2.2). Key press 1: the tangent plane
 * ∇g(a) · (x − a) = 0; 2: the example (the textbook's Example 11.2.6), g = x² + y² + z², whose
 * level surface g = 6 is a sphere, with its picture; 3: at (2, 1, 1), ∇g(2, 1, 1), on one line, and
 * drawn; 4: the tangent plane at (2, 1, 1) is 4(x − 2) + 2(y − 1) + 2(z − 1) = 0, and drawn.
 */
export default function Slide10Normal3D() {
  return (
    <section className="dense l10-n3">
      <h2>Gradient and level surfaces</h2>

      <div className="block theorem">
        <p>
          The gradient of a function <Tex tex={r`g:\mathbb R^3\to\mathbb R`} /> at a point <Tex tex={r`\vv a`} /> is
          perpendicular to the tangent plane to the level surface that passes through <Tex tex={r`\vv a`} />.
        </p>
        <p className="pointer corner">(→ Theorem 11.2.2)</p>
      </div>

      <Fragment index={1} as="p" className="l10-n3-tp">
        Tangent plane at <Tex tex={r`\vv a`} />: <Tex tex={r`\nabla g(\vv a)\cdot(\vv x-\vv a)=0`} />
      </Fragment>

      {/* the example: its text on the left, the sphere on the right */}
      <div className="l10-n3-ex">
        <div className="l10-n3-text">
          <Fragment index={2}>
            <p>
              <strong>Example:</strong> <Tex tex={r`g(x,y,z)=x^2+y^2+z^2`} />.
            </p>
            <p className="l10-n3-in">
              The level surface <Tex tex={r`g(x,y,z)=6`} /> is a sphere.
            </p>
          </Fragment>
          <Fragment index={3} as="p" className="l10-n3-in">
            At <Tex tex="(2,1,1)" />, <Tex tex={r`\nabla g(2,1,1)=\begin{bmatrix}4\\ 2\\ 2\end{bmatrix}`} />.
          </Fragment>
          <Fragment index={4} className="l10-n3-in">
            <p>
              The tangent plane at <Tex tex="(2,1,1)" /> is
            </p>
            <Tex display tex={r`4(x-2)+2(y-1)+2(z-1)=0.`} />
          </Fragment>
        </div>

        <Fragment index={2} className="l10-n3-fig">
          <Space width={500} height={340} unit={58} center={[0.45, 0.5]} axes={false} az={45} el={18} title="The sphere x² + y² + z² = 6, the gradient of x² + y² + z² at the point (2, 1, 1), and the tangent plane there">
            {(s) => (
              <g>
                <Sphere s={s} />
                <Fragment as="g" index={4}>
                  <PlanePatch s={s} P={A} e={E1} e2={E2} range={[-1.5, 1.5]} fill={PLANE} opacity={0.7} stroke="#b08a2e" />
                </Fragment>
                <Fragment as="g" index={3}>
                  <Arrow3 s={s} from={A} to={A.map((c, i) => c + K * GRAD[i])} color={RED} width={3.5} />
                  <Dot3 s={s} at={A} color={INK} r={6} stroke="#fff" strokeWidth="1.5" />
                  <Label3 s={s} at={A.map((c, i) => c + K * GRAD[i])} dx={8} dy={-8} color={RED} italic={false}>
                    ∇<I>g</I>(<B>a</B>)
                  </Label3>
                </Fragment>
              </g>
            )}
          </Space>
        </Fragment>
      </div>
    </section>
  );
}
