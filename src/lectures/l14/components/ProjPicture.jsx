import Plane, { Arrow } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { B, Sub, MAIN } from './svgmath.jsx';

const INK = '#14213d';
const RED = '#8c1515';
const TEAL = '#0e7490';
const W = [1, 2];
const proj = ([x, y]) => {
  const k = (x * W[0] + y * W[1]) / (W[0] * W[0] + W[1] * W[1]);
  return [k * W[0], k * W[1]];
};

/** The small square marking the right angle at `at` between the directions a and b (px). */
function RightAngle({ p, at, a, b, size = 11 }) {
  const n = (v) => Math.hypot(...v) || 1;
  const ua = [a[0] / n(a), -a[1] / n(a)];
  const ub = [b[0] / n(b), -b[1] / n(b)];
  const [x, y] = [p.px(at[0]), p.py(at[1])];
  const d = `M ${x + size * ua[0]} ${y + size * ua[1]} L ${x + size * (ua[0] + ub[0])} ${y + size * (ua[1] + ub[1])} L ${x + size * ub[0]} ${y + size * ub[1]}`;
  return <path d={d} fill="none" stroke={INK} strokeWidth="1.5" />;
}

/**
 * Mark's Example 2 for w = (1, 2): the line through w, e₁ and e₂, and, on key press `index`, their
 * projections Proj_w(e₁) = (1/5)w, Proj_w(e₂) = (2/5)w (red) with the dotted perpendiculars and the
 * right-angle marks. `unit`: pixels per unit.
 */
export default function ProjPicture({ index, unit = 150 }) {
  const X = [-0.45, 1.5];
  const Y = [-0.3, 2.2];
  return (
    <Plane xRange={X} yRange={Y} unit={unit} pad={10} grid={false} axes={false} title="The projections of e1 and e2 onto the line through w = (1, 2)">
      {(p) => {
        const line = [
          [-0.15, -0.3],
          [1.1, 2.2],
        ];
        return (
          <g>
            <g stroke="#d1d5db" strokeWidth="1.3">
              <line x1={p.px(X[0])} y1={p.py(0)} x2={p.px(X[1])} y2={p.py(0)} />
              <line x1={p.px(0)} y1={p.py(Y[0])} x2={p.px(0)} y2={p.py(Y[1])} />
            </g>
            <line x1={p.px(line[0][0])} y1={p.py(line[0][1])} x2={p.px(line[1][0])} y2={p.py(line[1][1])} stroke={TEAL} strokeWidth="1.6" opacity="0.6" />
            <Arrow p={p} to={W} color={TEAL} width={3.4} />
            <text x={p.px(W[0]) + 12} y={p.py(W[1]) + 8} fontSize="22" fontFamily={MAIN} fill={TEAL}>
              <B>w</B>
            </text>
            <Arrow p={p} to={[1, 0]} color={INK} width={3.2} />
            <Arrow p={p} to={[0, 1]} color={INK} width={3.2} />
            <text x={p.px(1) - 8} y={p.py(0) + 28} fontSize="22" fontFamily={MAIN} fill={INK}>
              <B>e</B>
              <Sub>1</Sub>
            </text>
            <text x={p.px(0) - 12} y={p.py(1) + 6} textAnchor="end" fontSize="22" fontFamily={MAIN} fill={INK}>
              <B>e</B>
              <Sub>2</Sub>
            </text>
            <Fragment as="g" index={index}>
              {[
                [1, 0],
                [0, 1],
              ].map((e) => {
                const q = proj(e);
                return (
                  <g key={e.join()}>
                    <line x1={p.px(e[0])} y1={p.py(e[1])} x2={p.px(q[0])} y2={p.py(q[1])} stroke={INK} strokeWidth="2.4" strokeDasharray="0.1 6.5" strokeLinecap="round" />
                    <RightAngle p={p} at={q} a={[e[0] - q[0], e[1] - q[1]]} b={[-W[0], -W[1]]} />
                  </g>
                );
              })}
              <Arrow p={p} to={proj([0, 1])} color={RED} width={3.6} />
              <Arrow p={p} to={proj([1, 0])} color={RED} width={3.6} />
              <TexSvg x={p.px(0.2) + 16} y={p.py(0.4) - 4} anchor="start" color={RED} tex={String.raw`\operatorname{Proj}_{\mathbf w}(\mathbf e_1)`} />
              <TexSvg x={p.px(0.4) + 16} y={p.py(0.8) + 12} anchor="start" color={RED} tex={String.raw`\operatorname{Proj}_{\mathbf w}(\mathbf e_2)`} />
            </Fragment>
            <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
          </g>
        );
      }}
    </Plane>
  );
}
