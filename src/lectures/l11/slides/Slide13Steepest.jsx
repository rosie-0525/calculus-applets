import Tex, { r } from '../components/Tex.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { Arrow } from '../components/Plane.jsx';
import Space, { Arrow3, Dot3, Label3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import { hills as f, HILLS_LEVELS, hillsTone } from '../components/hills.js';
import { I, B, MAIN } from '../components/svgmath.jsx';

export const RED = '#8c1515';
export const BLUE = '#1d4ed8';
export const A = [1.9, -0.6]; // on the slope of the big hill
export const H = 1e-4;
export const G = [(f(A[0] + H, A[1]) - f(A[0] - H, A[1])) / (2 * H), (f(A[0], A[1] + H) - f(A[0], A[1] - H)) / (2 * H)];
export const g = Math.hypot(...G);
export const U = [G[0] / g, G[1] / g];
export const LEN = 1.3;
export const tip = (d, k = LEN) => [A[0] + k * d[0], A[1] + k * d[1]];

// the graph of the same part of the hills as the contour plot, with the paths from a along ±∇f(a)
export const X = [-0.2, 3.8];
export const Y = [-2.6, 1.4];
export const Z = 0.75;
export const LEN3 = 1.1; // the paths' length on the graph
export const onGraph = (d, t) => {
  const x = A[0] + t * d[0];
  const y = A[1] + t * d[1];
  return [x, y, Z * f(x, y)];
};
export const path = (d) => Array.from({ length: 23 }, (_, k) => onGraph(d, (LEN3 * k) / 22));

/** The graph of the hills over the contour plot's square, with a and the ways up (red) and down (blue). */
export function HillGraph() {
  const down = [-U[0], -U[1]];
  return (
    <Space width={470} height={300} unit={76} center={[0.72, 0.56]} axes={false} az={-40} el={24} swing={8} title="The graph of the hill, with the point a on its slope and the paths from a in the directions of the gradient (up, in red) and minus the gradient (down, in blue)">
      {(s) => (
        <g>
          <Surface
            s={s}
            f={f}
            x={X}
            y={Y}
            n={30}
            zScale={Z}
            mesh="rgba(15, 40, 50, 0.16)"
            lines={[
              { pts: path(U), color: RED, width: 4 },
              { pts: path(down), color: BLUE, width: 4 },
            ]}
          />
          <Arrow3 s={s} from={onGraph(U, LEN3 - 0.06)} to={onGraph(U, LEN3 + 0.02)} color={RED} width={4} head={14} />
          <Arrow3 s={s} from={onGraph(down, LEN3 - 0.06)} to={onGraph(down, LEN3 + 0.02)} color={BLUE} width={4} head={14} />
          <Dot3 s={s} at={onGraph(U, 0)} color="#14213d" r={6} stroke="#fff" strokeWidth="1.5" />
          <Label3 s={s} at={onGraph(U, 0)} dx={-12} dy={18} color="#14213d" italic={false}>
            <B>a</B>
          </Label3>
        </g>
      )}
    </Space>
  );
}

/**
 * Direction of fastest increase: Mark's theorem (→ Theorem 11.3.2) as two bullets, then (unless
 * ∇f(a) = 0); under it, the graph of the two hills, with a on the slope of the big hill and the
 * paths from a in the directions of ∇f(a) (up, red) and −∇f(a) (down, blue), beside the contour plot
 * with ∇f(a) and −∇f(a). The critical points (∇f(a) = 0) are on the next slide, At a critical
 * point (Slide13cCritical.jsx); the reasoning after it, Slide13bSteepestWhy.jsx.
 */
export default function Slide13Steepest() {
  return (
    <section className="dense">
      <h2>Direction of fastest increase</h2>

      <div className="block theorem l10-st-box">
        <p className="block-title">Theorem</p>
        <p>
          Let <Tex tex={r`f:\mathbb R^n\to\mathbb R`} />. At a point <Tex tex={r`\vv a`} />:
        </p>
        <ul className="l10-st-list">
          <li>
            <Tex tex={r`\nabla f(\vv a)`} /> points towards the greatest increase of <Tex tex="f" />;
          </li>
          <li>
            <Tex tex={r`-\nabla f(\vv a)`} /> points towards the greatest decrease of <Tex tex="f" />
          </li>
        </ul>
        <p>
          (unless <Tex tex={r`\nabla f(\vv a)=\vv 0`} />).
        </p>
        <p className="pointer corner">(→ Theorem 11.3.2)</p>
      </div>

      <div className="l10-st-pics">
        <HillGraph />
        <ContourPlot
          f={f}
          x={X}
          y={Y}
          size={300}
          levels={HILLS_LEVELS.concat([0.15, 0.45, 0.75, 1.05, 1.35, 1.65])}
          color={hillsTone}
          title="Contour plot of a hill, with the gradient and minus the gradient at a point on its slope"
        >
          {(p) => (
            <g>
              <Arrow p={p} from={A} to={tip(U)} color={RED} width={3.5} head={13} />
              <Arrow p={p} from={A} to={tip([-U[0], -U[1]])} color={BLUE} width={3.5} head={13} />
              <circle cx={p.px(A[0])} cy={p.py(A[1])} r="5.5" fill="#14213d" stroke="#fff" strokeWidth="1.5" />
              <text x={p.px(tip(U)[0]) - 4} y={p.py(tip(U)[1]) - 10} fontSize="19" fontFamily={MAIN} fill={RED} textAnchor="middle" className="map-label">
                ∇<I>f</I>(<B>a</B>)
              </text>
              <text x={p.px(tip([-U[0], -U[1]])[0])} y={p.py(tip([-U[0], -U[1]])[1]) + 24} fontSize="19" fontFamily={MAIN} fill={BLUE} textAnchor="middle" className="map-label">
                −∇<I>f</I>(<B>a</B>)
              </text>
              <text x={p.px(A[0]) - 10} y={p.py(A[1]) + 22} fontSize="19" fontFamily={MAIN} fill="#14213d" textAnchor="end" className="map-label">
                <B>a</B>
              </text>
            </g>
          )}
        </ContourPlot>
      </div>
    </section>
  );
}
