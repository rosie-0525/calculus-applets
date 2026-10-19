import ContourPlot from './ContourPlot.jsx';
import Ticks from './Ticks.jsx';
import Tex, { r } from './Tex.jsx';
import { lineColor } from './levels.js';
import { MAIN } from './svgmath.jsx';
import { PURPLE } from './Example1.jsx';

/**
 * f(x, y) = x² + 2y² + x − 1, on the unit disk x² + y² ≤ 1 (Recall: finding global extrema; Example
 * 2 (ii)) and on the unit circle (Constrained optimization; Example 2 (i)). It replaced the
 * textbook's Example 10.4.8's f, 3x² − 2y² + 2x + 2y − 1, at the user's request, for nice numbers
 * and an extremum inside D: on the circle, the max 5/4 at (1/2, ±√3/2) and the min −1 at (−1, 0)
 * (and 1 at (1, 0)); inside, the critical point (−1/2, 0), the minimum on D, −5/4.
 */
export const f = (x, y) => x * x + 2 * y * y + x - 1;

const BOX = [-1.5, 1.5];
// every 1 over the whole square (f runs from −1.25 to 7.25 on it), each labelled: −1 to 1 inside D
// (every 0.5, unlabelled, until the user asked for more space between them)
const LEVELS = Array.from({ length: 9 }, (_, k) => k - 1);
const label = (c) => String(c).replace('-', '−');
const tone = (c) => lineColor((c + 1.35) / 8.7);
const S3 = Math.sqrt(3) / 2;
// what the levels' labels keep clear of, the same on all three slides so that they stay put: the
// label D, the circle (points every 5° on it), and the candidates of the recall and Example 2,
// with their rings, values and max/min (Slide01bRecallGlobal.jsx, Slide08bDisk.jsx); each box
// [left, top, right, bottom] in pixels from its point
const avoid = (p) => {
  const box = ([x, y], l, t, r, b) => [p.px(x) + l, p.py(y) + t, p.px(x) + r, p.py(y) + b];
  return [
    box([0.2, -0.5], -11, -18, 11, 6), // D
    ...Array.from({ length: 72 }, (_, k) => box([Math.cos((k * Math.PI) / 36), Math.sin((k * Math.PI) / 36)], -2, -2, 2, 2)),
    ...[[-1 / 2, 0], [1, 0], [-1, 0], [1 / 2, S3], [1 / 2, -S3]].map((q) => box(q, -16, -16, 16, 16)),
    box([-1 / 2, 0], -22, 20, 22, 40), // −5/4
    box([-1 / 2, 0], -18, -38, 18, -18), // min
    box([1, 0], 18, -10, 52, 10), // 1, and room after it, so that no label reads on from it
    box([-1, 0], -46, -10, -18, 10), // −1
    box([-1, 0], -52, -32, -18, -10), // min, above it (Example 2 (i))
    box([1 / 2, S3], 16, -27, 50, -5), // 5/4
    box([1 / 2, -S3], 16, 5, 50, 27), // 5/4
    box([1 / 2, S3], -58, -10, -20, 10), // max
    box([1 / 2, -S3], -58, -10, -20, 10), // max
  ];
};

/**
 * The contour plot of f on the square [−1.5, 1.5]², its levels labelled, with ticks and the axes
 * named x and y, and the level `highlight` (if given) on top in red; `children(p)` draws more.
 */
export function DiskPlot({ size, title, highlight, children }) {
  return (
    <ContourPlot
      f={f}
      x={BOX}
      y={BOX}
      size={size}
      n={180}
      levels={LEVELS}
      color={tone}
      width={1.3}
      pad={[8, 10, 50, 48]}
      highlight={highlight}
      highlightWidth={2.6}
      labels={label}
      labelSize={14}
      labelAvoid={avoid}
      title={title}
    >
      {(p) => (
        <g>
          <Ticks p={p} box={[BOX, BOX]} x={[-1, 0, 1]} y={[-1, 0, 1]} names={['x', 'y']} />
          {children?.(p)}
        </g>
      )}
    </ContourPlot>
  );
}

/**
 * The picture of Recall: finding global extrema and Constrained optimization (and Example 2), the same on both and
 * shown from the start, so that it stays put from one slide to the next (the two slides share
 * their layout: `stage l12-disk-stage`, of the same height, and no `dense`; and no fade between
 * them: `data-transition="none"` on both): the formula of f above its contour plot and
 * D = {(x, y) : x² + y² ≤ 1} below it; on the plot, the disk D faintly shaded and its boundary
 * circle solid in purple (no longer labelled "constraint x² + y² = 1", at the user's request);
 * `children(p)` draws more on top (the recall's candidates, on its key presses).
 */
export function DiskFigure({ children }) {
  return (
    <div className="stage-fig l12-disk-fig">
      <p className="l12-disk-label">
        <Tex tex={r`f(x,y)=x^2+2y^2+x-1`} />
      </p>
      <DiskPlot size={460} title="Contour plot of f(x, y) = x² + 2y² + x − 1 on the square [−1.5, 1.5]², the levels −1 to 7 labelled, the disk D: x² + y² ≤ 1 shaded, and its boundary circle x² + y² = 1">
        {(p) => (
          <g>
            <circle
              cx={p.px(0)}
              cy={p.py(0)}
              r={p.px(1) - p.px(0)}
              fill={PURPLE}
              fillOpacity="0.07"
              stroke={PURPLE}
              strokeWidth="2.6"
            />
            <text x={p.px(0.2)} y={p.py(-0.5)} textAnchor="middle" fontSize="24" fontFamily={MAIN} fontStyle="italic" fill={PURPLE} className="map-label">
              D
            </text>
            {children?.(p)}
          </g>
        )}
      </DiskPlot>
      <p className="l12-disk-label l12-disk-region">
        <Tex tex={r`D=\{(x,y):x^2+y^2\le 1\}`} />
      </p>
    </div>
  );
}
