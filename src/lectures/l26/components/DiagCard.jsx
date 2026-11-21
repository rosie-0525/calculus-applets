import ContourPlot from './ContourPlot.jsx';

const CURVE = '#5f6b7a';
const GRAY = '#9ca3af';
const LEVELS = [0.4, 1.2, 2.4, 4, 6].flatMap((c) => [c, -c]);

/**
 * The contour plot of the diagonal quadratic form λ₁x² + λ₂y² over [−2, 2]², with the axes; when λ₁
 * and λ₂ have opposite signs, its level set 0 (the two asymptotes of the hyperbolas) dotted.
 * `axisLabels` (Contour plots near a critical point's poll, the user's request): x and y at the ends
 * of the axes, on a white halo over the curves. `point` (Contour plots near a critical point, the
 * user's request): a dot at the origin, the critical point, labelled with this text in bold (e.g. a).
 */
export default function DiagCard({ l1, l2, size = 190, title, axisLabels = false, point }) {
  const f = (x, y) => l1 * x * x + l2 * y * y;
  const opposite = l1 * l2 < 0;
  // the asymptotes: y = ±√(|λ₁/λ₂|) x
  const m = Math.sqrt(Math.abs(l1 / l2));
  return (
    <ContourPlot f={f} x={[-2, 2]} y={[-2, 2]} size={size} n={90} levels={LEVELS} color={() => CURVE} width={1.4} axes title={title}>
      {(p) => (
        <g>
          {opposite ? (
            <g stroke={GRAY} strokeWidth="1.6" strokeDasharray="0.1 5" strokeLinecap="round">
              {[m, -m].map((k) => {
                // the line y = kx across the square
                const x1 = Math.min(2, 2 / Math.abs(k));
                return <line key={k} x1={p.px(-x1)} y1={p.py(-k * x1)} x2={p.px(x1)} y2={p.py(k * x1)} />;
              })}
            </g>
          ) : null}
          {axisLabels ? (
            <g fill="#374151" fontSize="21" fontStyle="italic" fontFamily="KaTeX_Math, KaTeX_Main, Georgia, serif" stroke="#fff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
              <text x={p.px(2) - 5} y={p.py(0) - 6} textAnchor="end">
                x
              </text>
              <text x={p.px(0) + 6} y={p.py(2) + 17} textAnchor="start">
                y
              </text>
            </g>
          ) : null}
          {point ? (
            <g>
              <circle cx={p.px(0)} cy={p.py(0)} r="4.5" fill="#14213d" stroke="#fff" strokeWidth="1.5" />
              <text
                x={p.px(0) + 7}
                y={p.py(0) + 17}
                fill="#14213d"
                fontSize="18"
                fontWeight="700"
                fontFamily="KaTeX_Main, Georgia, serif"
                stroke="#fff"
                strokeWidth="4"
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                {point}
              </text>
            </g>
          ) : null}
        </g>
      )}
    </ContourPlot>
  );
}
