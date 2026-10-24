import Plane from './Plane.jsx';

const INK = '#14213d';
const RED = '#8c1515';

// the letter F inside the unit square, to show which way round its image is
export const F = [
  [0.25, 0.12],
  [0.45, 0.12],
  [0.45, 0.42],
  [0.68, 0.42],
  [0.68, 0.58],
  [0.45, 0.58],
  [0.45, 0.7],
  [0.78, 0.7],
  [0.78, 0.88],
  [0.25, 0.88],
];
export const S = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
const X = [-1.3, 2.3];
const Y = [-1.3, 1.3];

/**
 * The effect of f(x) = Mx on the unit square S (with the letter F in it): the faint square grid,
 * S and F in gray, then f(S) (orange, as in the textbook) and f(F) (red); a map onto a line squashes
 * them into a segment.
 */
export default function FPanel({ M, unit = 62, title }) {
  const f = ([x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
  return (
    <Plane xRange={X} yRange={Y} unit={unit} pad={8} grid={false} axes={false} title={title}>
      {(p) => {
        const pts = (qs) => qs.map((q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`).join(' ');
        return (
          <g>
            <g stroke="#eceef2" strokeWidth="1">
              {[-1, 0, 1, 2].map((k) => (
                <line key={`v${k}`} x1={p.px(k)} y1={p.py(Y[0])} x2={p.px(k)} y2={p.py(Y[1])} />
              ))}
              {[-1, 0, 1].map((k) => (
                <line key={`h${k}`} x1={p.px(X[0])} y1={p.py(k)} x2={p.px(X[1])} y2={p.py(k)} />
              ))}
            </g>
            <g stroke="#c4c9d1" strokeWidth="1.4">
              <line x1={p.px(X[0])} y1={p.py(0)} x2={p.px(X[1])} y2={p.py(0)} />
              <line x1={p.px(0)} y1={p.py(Y[0])} x2={p.px(0)} y2={p.py(Y[1])} />
            </g>
            <polygon points={pts(S)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points={pts(F)} fill="#d1d5db" />
            <polygon points={pts(S.map(f))} fill="rgba(242, 179, 122, 0.55)" stroke="#c2702a" strokeWidth="2" strokeLinejoin="round" />
            <polygon points={pts(F.map(f))} fill={RED} stroke={RED} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx={p.px(0)} cy={p.py(0)} r="3.5" fill={INK} />
          </g>
        );
      }}
    </Plane>
  );
}
