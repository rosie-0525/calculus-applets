import { useMemo } from 'react';
import ContourPlot from './ContourPlot.jsx';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { INK, len, times } from './eig.js';
import { EIGSQ, qA, rot } from './spec.js';

export const Q_RANGE = [-3.5, 3.5];
// q_A(w₂) = 4 · 10 = 40 and q_A(w₁) = 14 · 10 = 140: the tips of w₂ and w₁ lie on level curves
export const Q_LEVELS = [10, 40, 90, 140, 200];
const CURVE = '#8a94a3';
const TICKS = [-3, -2, -1, 1, 2, 3];

const apply = (M, [x, y]) => [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];

/**
 * The contour plot of q_A(x, y) = 13x² − 6xy + 5y² (Mark's Example 1 on quadratic forms; the
 * textbook's Figure 24.2.1), with the axes and their ticks, so that vectors can be drawn on it.
 * `turn`: the plane turned by that many degrees (the level curves and the eigenvectors with it; the
 * axes stay). `lines`, `arrows`: the lines of w₁ (amber) and w₂ (purple), and w₁, w₂ themselves, with
 * the right-angle mark; `names`: their labels. `labels`: the levels on the curves (not while turning:
 * they would jump). `revealAt`: the arrows and their names come on that key press (a fragment in the
 * SVG; Example 1), instead of from the start.
 */
export default function QPlot({ size = 380, turn = 0, lines = false, arrows = false, names = false, labels = true, ticks = true, levels = Q_LEVELS, title, revealAt }) {
  const f = useMemo(() => {
    const B = rot(-turn);
    return (x, y) => qA(B[0][0] * x + B[0][1] * y, B[1][0] * x + B[1][1] * y);
  }, [turn]);
  const R = rot(turn);
  const ws = EIGSQ.map((e) => apply(R, e.v));
  return (
    <ContourPlot
      f={f}
      x={Q_RANGE}
      y={Q_RANGE}
      size={size}
      n={110}
      levels={levels}
      color={() => CURVE}
      width={1.5}
      labels={labels ? (c) => String(c) : undefined}
      labelSize={12}
      axes
      title={title ?? 'The contour plot of q_A(x, y) = 13x² − 6xy + 5y²'}
    >
      {(p) => {
        const P = (q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`;
        const arrow = (to, color) => {
          const [x1, y1, x2, y2] = [p.px(0), p.py(0), p.px(to[0]), p.py(to[1])];
          const L = Math.hypot(x2 - x1, y2 - y1);
          const [ux, uy] = [(x2 - x1) / L, (y2 - y1) / L];
          const [h, hw] = [13, 5.5];
          return (
            <g>
              <line x1={x1} y1={y1} x2={x2 - ux * h * 0.9} y2={y2 - uy * h * 0.9} stroke={color} strokeWidth="3.4" strokeLinecap="round" />
              <polygon points={`${x2},${y2} ${x2 - ux * h - uy * hw},${y2 - uy * h + ux * hw} ${x2 - ux * h + uy * hw},${y2 - uy * h - ux * hw}`} fill={color} />
            </g>
          );
        };
        const corner = ws.map((w) => times(0.34 / len(w), w));
        const reveal = (node) => (revealAt == null ? node : <Fragment as="g" index={revealAt}>{node}</Fragment>);
        return (
          <g>
            {ticks && (
              <g>
                <g stroke="#c7ccd3" strokeWidth="1">
                  {TICKS.map((k) => (
                    <g key={k}>
                      <line x1={p.px(k)} y1={p.py(0) - 3} x2={p.px(k)} y2={p.py(0) + 3} />
                      <line x1={p.px(0) - 3} y1={p.py(k)} x2={p.px(0) + 3} y2={p.py(k)} />
                    </g>
                  ))}
                </g>
                <g fill="#9aa1ac" fontSize="11">
                  {TICKS.map((k) => (
                    <g key={k}>
                      <text x={p.px(k)} y={p.py(0) + 15} textAnchor="middle">
                        {k < 0 ? `−${-k}` : k}
                      </text>
                      <text x={p.px(0) - 7} y={p.py(k) + 4} textAnchor="end">
                        {k < 0 ? `−${-k}` : k}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            )}
            {lines &&
              ws.map((w, i) => {
                const d = times(12 / len(w), w);
                return <polyline key={i} points={`${P(times(-1, d))} ${P(d)}`} stroke={EIGSQ[i].color} strokeWidth="2.4" opacity="0.55" fill="none" />;
              })}
            {reveal(
              <g>
                {arrows && (
                  <g>
                    <polyline points={`${P(corner[0])} ${P([corner[0][0] + corner[1][0], corner[0][1] + corner[1][1]])} ${P(corner[1])}`} fill="none" stroke={INK} strokeWidth="1.5" />
                    {ws.map((w, i) => (
                      <g key={i}>{arrow(w, EIGSQ[i].color)}</g>
                    ))}
                    <circle cx={p.px(0)} cy={p.py(0)} r="3.5" fill={INK} />
                  </g>
                )}
                {names && (
                  <g className="l15-sum-labels">
                    {ws.map((w, i) => {
                      // 20 px to the left of the arrow, 12 px back from its tip
                      const u = times(1 / len(w), w);
                      return <TexSvg key={i} x={p.px(w[0]) - 12 * u[0] - 20 * u[1]} y={p.py(w[1]) + 12 * u[1] - 20 * u[0]} tex={EIGSQ[i].name} color={EIGSQ[i].color} size={20} w={50} h={30} />;
                    })}
                  </g>
                )}
              </g>,
            )}
          </g>
        );
      }}
    </ContourPlot>
  );
}
