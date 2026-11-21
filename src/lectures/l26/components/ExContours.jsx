import ContourPlot from './ContourPlot.jsx';
import { fEx } from './hessian.js';

const CURVE = '#5f6b7a';
// Example 3's f, 3x²y − 6xy² + 4y³ − 3y (the user's requests, in place of Mark's −x³ + 6x² + 3y² − 2y³,
// whose critical points needed his two windows; then rotated ellipses near the minimum, and f simple
// and expanded; then, in place of x²y + xy² − 3xy, a local minimum, a local maximum and two saddle
// points; then a simpler contour plot, filling the window): one window, x and y at the same scale, with all four critical
// points (1, 1), (−1, −1), (1, 0), (−1, 0); the levels: 0 (the line y = 0 and the ellipse
// 3x² − 6xy + 4y² = 3, through the saddles: f < 0 inside it above the line and outside it under the
// line, f > 0 elsewhere), −1.5, −1 round the minimum (−2), 1, 1.5 round the maximum (2) (each also
// outside the ellipse), and outside it ±3, ±6, ±12, ±25, ±50, ±100, to fill the window (f grows fast
// towards the top left and bottom right corners: about ±150 there). The level 0 is drawn as curves (`zero`: polylines [[x, y], …]: the line and the
// ellipse), with its labels at `zeroLabels` ([x, y, angle in degrees]): traced from the grid, it was
// doubled (f is exactly 0 at the grid's points on the line) and kinked at the saddles. `noLabels`: the
// rectangles [x₀, y₀, x₁, y₁] where no level is labelled
// the ellipse 3x² − 6xy + 4y² = 3, in polar coordinates
const ELLIPSE = Array.from({ length: 241 }, (_, k) => {
  const t = (2 * Math.PI * k) / 240;
  const [c, s] = [Math.cos(t), Math.sin(t)];
  const rr = Math.sqrt(3 / (3 * c * c - 6 * c * s + 4 * s * s));
  return [rr * c, rr * s];
});
export const EX_PLOTS = [
  {
    x: [-2.5, 2.5],
    y: [-2.2, 2.2],
    levels: [-100, -50, -25, -12, -6, -3, -1.5, -1, 1, 1.5, 3, 6, 12, 25, 50, 100],
    ticks: [-2, -1, 0, 1, 2],
    zero: [
      [
        [-2.5, 0],
        [2.5, 0],
      ],
      ELLIPSE,
    ],
    zeroLabels: [
      [-2.2, 0, 0],
      [0, -0.866, -36.9],
    ],
    // no labels where the curves hug the axis, at its ends
    noLabels: [
      [-2.5, -0.35, -1.8, 0.35],
      [1.8, -0.35, 2.5, 0.35],
    ],
  },
];

const fmt = (k) => (k < 0 ? `−${-k}` : String(k));

/**
 * The contour plot of Example 3's f(x, y) = 3x²y − 6xy² + 4y³ − 3y in the window `k` of EX_PLOTS, with the
 * levels on the curves and ticks on the frame (as in Mark's outline, for his f). `children(p)`: more drawing.
 * `size`: a number (a square) or [width, height]; `labelSize`, `tickSize`: the font sizes (px) of the
 * levels on the curves and of the ticks.
 */
export default function ExContour({ k, size = 300, labelSize = 11, tickSize = 12, children }) {
  const P = EX_PLOTS[k];
  return (
    <ContourPlot
      f={fEx}
      x={P.x}
      y={P.y}
      size={size}
      n={151}
      levels={P.levels}
      color={() => CURVE}
      width={1.4}
      labels={fmt}
      labelSize={labelSize}
      labelMin={40}
      labelAvoid={(p) => [
        ...(P.zeroLabels ?? []).map(([x, y]) => [p.px(x) - labelSize, p.py(y) - labelSize, p.px(x) + labelSize, p.py(y) + labelSize]),
        ...(P.noLabels ?? []).map(([x0, y0, x1, y1]) => [p.px(x0), p.py(y1), p.px(x1), p.py(y0)]),
      ]}
      pad={[6, tickSize, 14 + tickSize, 10 + 2 * tickSize]}
      title={`The contour plot of f(x, y) = 3x²y − 6xy² + 4y³ − 3y for ${P.x[0]} ≤ x ≤ ${P.x[1]}, ${P.y[0]} ≤ y ≤ ${P.y[1]}`}
    >
      {(p) => (
        <g>
          {P.zero?.map((pts, i) => (
            <polyline
              key={`z${i}`}
              points={pts.map(([u, v]) => `${p.px(u).toFixed(1)},${p.py(v).toFixed(1)}`).join(' ')}
              fill="none"
              stroke={CURVE}
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          ))}
          {P.zeroLabels?.map(([x, y, deg]) => (
            <g key={`zl${x},${y}`} transform={`translate(${p.px(x)} ${p.py(y)}) rotate(${deg})`}>
              <rect x={-labelSize * 0.45} y={-labelSize * 0.6} width={labelSize * 0.9} height={labelSize * 1.2} fill="#fff" />
              <text y={labelSize * 0.36} textAnchor="middle" fontSize={labelSize} fontWeight="600" fill={CURVE}>
                0
              </text>
            </g>
          ))}
          <g fill="#6b7280" fontSize={tickSize} fontFamily="KaTeX_Main, Georgia, serif">
            {P.ticks.map((t) => (
              <text key={`x${t}`} x={p.px(t)} y={p.py(P.y[0]) + 6 + tickSize} textAnchor="middle">
                {fmt(t)}
              </text>
            ))}
            {P.ticks.map((t) => (
              <text key={`y${t}`} x={p.px(P.x[0]) - 7} y={p.py(t) + tickSize / 3} textAnchor="end">
                {fmt(t)}
              </text>
            ))}
          </g>
          {children?.(p)}
        </g>
      )}
    </ContourPlot>
  );
}
