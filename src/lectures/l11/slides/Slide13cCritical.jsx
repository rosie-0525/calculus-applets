import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Dot3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { Arrow } from '../components/Plane.jsx';
import { lineColor } from '../components/levels.js';
import { MAIN } from '../components/svgmath.jsx';

export const RED = '#8c1515';
export const INK = '#14213d';

// a function with all three: f = x³ − 3x − y³ + 3y, a maximum at (−1, 1), a minimum at (1, −1), and
// saddles at (1, 1) and (−1, −1); its gradient (3x² − 3, 3 − 3y²)
export const F = (x, y) => x ** 3 - 3 * x - y ** 3 + 3 * y;
export const gradF = (x, y) => [3 * x * x - 3, 3 - 3 * y * y];
export const BOX = [-2.3, 2.3];
export const LEVELS = [-9, -7, -5, -3.5, -2.5, -1.5, 0, 1.5, 2.5, 3.5, 5, 7, 9];
export const POINTS = [
  { at: [-1, 1], name: 'max', dy: -14 },
  { at: [1, -1], name: 'min', dy: -14 },
  { at: [1, 1], name: 'saddle', dy: -14 },
  { at: [-1, -1], name: 'saddle', dy: -14 },
];
export const FIELD = []; // the lattice of the gradient field, every 0.4
for (let i = -5; i <= 5; i += 1) for (let j = -5; j <= 5; j += 1) FIELD.push([0.4 * i, 0.4 * j]);
// the three kinds of critical points, each a graph over a disk with the critical point at 0
export const polar = (rr, t) => [rr * Math.cos(t), rr * Math.sin(t)];
export const CRITICAL = [
  { name: 'minimum', what: 'up in every direction', f: (x, y) => x * x + y * y, center: [0.5, 0.7] },
  { name: 'maximum', what: 'down in every direction', f: (x, y) => -(x * x + y * y), center: [0.5, 0.34] },
  { name: 'saddle', what: 'up in some directions, down in others', f: (x, y) => x * x - y * y, center: [0.5, 0.52] },
];

/** The graph of one of CRITICAL, with its critical point. */
export function CriticalGraph({ c }) {
  return (
    <Space width={270} height={140} unit={60} center={c.center} axes={false} az={-40} el={26} swing={8} title={`A ${c.name} of a function of two variables: its graph near the critical point`}>
      {(s) => (
        <g>
          <Surface s={s} f={c.f} param={polar} x={[0, 1.45]} y={[0, 2 * Math.PI]} n={[10, 40]} zScale={0.34} color="#a9d6e0" mesh="rgba(15, 40, 50, 0.14)" />
          <Dot3 s={s} at={[0, 0, 0]} color={RED} r={6} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </Space>
  );
}

/**
 * The contour plot of F with its critical points named; key press `field`: the gradient field, each
 * arrow in the direction of ∇F, its length growing with ‖∇F‖ up to a cap (0 at the critical points).
 */
export function FieldPlot({ field }) {
  return (
    <ContourPlot
      f={F}
      x={BOX}
      y={BOX}
      size={400}
      levels={LEVELS}
      color={(c) => lineColor((c + 10) / 20)}
      title="Contour plot of f(x, y) = x³ − 3x − y³ + 3y, with its maximum, minimum and two saddle points, and its gradient field"
    >
      {(p) => (
        <g>
          <Fragment as="g" index={field}>
            {FIELD.map(([x, y]) => {
              const [u, v] = gradF(x, y);
              const n = Math.hypot(u, v);
              if (n < 1e-9) return null;
              const len = 0.32 * Math.tanh(n / 5);
              const to = [x + (len * u) / n, y + (len * v) / n];
              return <Arrow key={`${x},${y}`} p={p} from={[x, y]} to={to} color={RED} width={1.7} head={Math.min(8, 0.45 * len * (p.px(1) - p.px(0)))} />;
            })}
          </Fragment>
          {POINTS.map(({ at, name, dy }) => (
            <g key={at.join()}>
              <circle cx={p.px(at[0])} cy={p.py(at[1])} r="5.5" fill={INK} stroke="#fff" strokeWidth="1.5" />
              <text x={p.px(at[0])} y={p.py(at[1]) + dy} textAnchor="middle" fontSize="17" fontFamily={MAIN} fill={INK} className="map-label">
                {name}
              </text>
            </g>
          ))}
        </g>
      )}
    </ContourPlot>
  );
}

/**
 * At a critical point (right after Direction of fastest increase): when ∇f(a) = 0, a is a critical
 * point; which way is the greatest increase there? Key presses 1–3: the graphs of a minimum (up in
 * every direction), a maximum (down in every direction) and a saddle (up in some directions, down
 * in others), the critical point in red, in a column; 4: on the right, the contour plot of
 * f = x³ − 3x − y³ + 3y, with a maximum, a minimum and two saddles; 5: its gradient field, named
 * under it.
 */
export default function Slide13cCritical() {
  return (
    <section className="dense">
      <h2>At a critical point</h2>

      <p className="l10-crit-q">
        When <Tex tex={r`\nabla f(\vv a)=\vv 0`} />, <Tex tex={r`\vv a`} /> is a <strong>critical point</strong>. Which way is the greatest
        increase there?
      </p>
      <div className="l10-crit-row">
        <div className="l10-crit-graphs">
          {CRITICAL.map((c, k) => (
            <Fragment key={c.name} index={k + 1} as="figure">
              <CriticalGraph c={c} />
              <figcaption>
                <strong>{c.name}</strong>
                <br />
                {c.what}
              </figcaption>
            </Fragment>
          ))}
        </div>

        <Fragment index={4} className="l10-crit-plot">
          <p>
            <Tex tex={r`f(x,y)=x^3-3x-y^3+3y`} />
          </p>
          <FieldPlot field={5} />
          <Fragment index={5} as="p" className="l10-crit-field">
            Gradient vector field
          </Fragment>
        </Fragment>
      </div>
    </section>
  );
}
