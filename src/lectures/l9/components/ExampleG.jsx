import Fragment from './Fragment.jsx';
import Space from './Space.jsx';
import Surface from './Surface.jsx';
import ContourPlot from './ContourPlot.jsx';
import { TEAL_RAMP, ramp } from './levels.js';

/**
 * The function of Example 1, g(x, y) = 3x²y + y³ − 6xy (shaped like the textbook's Example 10.2.6,
 * 3x²y + 2y³ − xy, with simpler numbers): its graph and its contour plot, shown in Example 1 (Slide04bExample.jsx) and again in Preview
 * (Slide08bNeither.jsx), both with its critical points labelled (`Classified`).
 */
export const g = (x, y) => 3 * x * x * y + y ** 3 - 6 * x * y;
// the four critical points: g_x = 6y(x − 1) = 0 and g_y = 3(x² + y² − 2x) = 0
export const CRIT = {
  P: [0, 0],
  Q: [2, 0],
  R: [1, 1],
  S: [1, -1],
};

// The graph and the contour plot show the window around the critical points, where the corners
// (|g| up to 6) don't dwarf them (the local max and min are ±2); the levels are evenly spaced,
// every 0.5, so that loops go round the max and the min, up to ±1.5 (beyond, they crowd into the
// corners, too close together to label).
const XG = [-0.3, 2.3];
const YG = [-1.45, 1.45];
const YC = [-1.45, 1.46]; // the contour plot's: no row of its grid on y = 0, so that the level 0 there is drawn
const STEP = 0.5;
const MAX = 1.5;
const LEVELS = Array.from({ length: 2 * Math.round(MAX / STEP) + 1 }, (_, k) => Math.round((k * STEP - MAX) * 1e6) / 1e6);
const RED_RAMP = ramp(['#f3d6d6', '#d98c8c', '#b84a4a', '#8c1515', '#5e0e0e']);
// darker for |g| larger: the levels near 0 light, the outer ones dark
const tone = (c) => {
  if (c === 0) return '#14213d';
  const t = 0.35 + 0.65 * (Math.abs(c) / MAX);
  return c > 0 ? TEAL_RAMP(t) : RED_RAMP(t);
};
// the labels of the levels, darker than their lines so that they read
const labelTone = (c) => {
  if (c === 0) return '#14213d';
  const t = 0.65 + 0.35 * (Math.abs(c) / MAX);
  return c > 0 ? TEAL_RAMP(t) : RED_RAMP(t);
};
const levelText = (c) => (c === 0 ? '0' : `${c < 0 ? '\u2212' : ''}${Math.abs(c)}`);
const GRAY = '#6b7280';
const INK = '#14213d';
const MATH = 'KaTeX_Math, Georgia, serif';
const Z = 0.12;
// the level curve g = 0 on the graph, drawn exactly (on the grid it would kink at the saddle
// points): the x-axis and the ellipse 3x² + y² = 6x, (x − 1)² + y²/3 = 1, cut at the edges
// y = ±1.45 of the window
const T_CUT = Math.asin(YG[1] / Math.sqrt(3));
const arc = (t0) =>
  Array.from({ length: 61 }, (_, k) => {
    const t = t0 - T_CUT + (2 * T_CUT * k) / 60;
    return [1 + Math.cos(t), Math.sqrt(3) * Math.sin(t), 0];
  });
const ZERO = [
  { pts: Array.from({ length: 61 }, (_, k) => [XG[0] + ((XG[1] - XG[0]) * k) / 60, 0, 0]), color: INK, width: 1.8 },
  { pts: arc(0), color: INK, width: 1.8 },
  { pts: arc(Math.PI), color: INK, width: 1.8 },
];

/**
 * The graph of g near its critical points, seen from the south (x to the right), with the level
 * curves of the contour plot on it; 430 × 430 pixels times `scale`. With `marks` ([i, j]), its
 * critical points are labelled as on the contour plot (`Classified`): the local maximum and the
 * local minimum on key press i, the two saddle points on j.
 */
export function GGraph({ scale = 1, marks }) {
  return (
    <Space
      width={430 * scale}
      height={430 * scale}
      unit={134 * scale}
      center={[0.19, 0.5]}
      axes={false}
      az={90}
      el={40}
      swing={8}
      title="The graph of g near its critical points, with its level curves"
    >
      {(s) => (
        <g>
          <Surface s={s} f={g} x={XG} y={YG} n={[36, 40]} zScale={Z} color="#d3dee6" mesh="rgba(15, 40, 50, 0.16)" curve={LEVELS.filter((c) => c !== 0)} curveColor={tone} curveWidth={1.8} lines={ZERO} />
          {marks && (
            <g>
              <Fragment as="g" index={marks[0]}>
                <Mark3 s={s} {...MARKS[0]} />
                <Mark3 s={s} {...MARKS[1]} />
              </Fragment>
              <Fragment as="g" index={marks[1]}>
                <Mark3 s={s} {...MARKS[2]} />
                <Mark3 s={s} {...MARKS[3]} />
              </Fragment>
            </g>
          )}
        </g>
      )}
    </Space>
  );
}

// the labels of the critical points (`Classified`): where, which and their widths in pixels
const MARKS = [
  { at: CRIT.S, label: 'local max', below: true, w: 66 },
  { at: CRIT.R, label: 'local min', w: 64 },
  { at: CRIT.P, label: 'saddle point', w: 82 },
  { at: CRIT.Q, label: 'saddle point', w: 82 },
];
// the boxes of the dots and their labels, which the labels of the levels keep clear of
const markBoxes = (p) =>
  MARKS.flatMap(({ at: [a, b], below, w }) => {
    const x = p.px(a);
    const y = p.py(b);
    return [[x - 8, y - 8, x + 8, y + 8], below ? [x - w / 2, y + 8, x + w / 2, y + 27] : [x - w / 2, y - 26, x + w / 2, y - 6]];
  });

/** A critical point of g on its contour plot, a dot, and its label above it (or below, with `below`). */
function Mark({ p, at: [a, b], label, below = false }) {
  const x = p.px(a);
  const y = p.py(b);
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill={INK} stroke="#fff" strokeWidth="1.5" />
      <text x={x} y={below ? y + 22 : y - 11} textAnchor="middle" fill={INK} fontSize="15" className="map-label">
        {label}
      </text>
    </g>
  );
}

/** A critical point of g on its graph (`GGraph`), a dot, and its label above it (or below, with `below`). */
function Mark3({ s, at: [a, b], label, below = false }) {
  const [x, y] = s.P([a, b, Z * g(a, b)]);
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill={INK} stroke="#fff" strokeWidth="1.5" />
      <text x={x} y={below ? y + 22 : y - 11} textAnchor="middle" fill={INK} fontSize="15" className="map-label">
        {label}
      </text>
    </g>
  );
}

/**
 * The critical points of g labelled on its contour plot (in `children(p)` of GContour): the local
 * maximum and the local minimum on key press `index[0]`, the two saddle points on `index[1]`.
 */
export function Classified({ p, index: [i, j] }) {
  return (
    <g>
      <Fragment as="g" index={i}>
        <Mark p={p} {...MARKS[0]} />
        <Mark p={p} {...MARKS[1]} />
      </Fragment>
      <Fragment as="g" index={j}>
        <Mark p={p} {...MARKS[2]} />
        <Mark p={p} {...MARKS[3]} />
      </Fragment>
    </g>
  );
}

const PAD = [8, 8, 34, 44];

/**
 * The contour plot of g, `width` pixels wide (the same scale on both axes), every level labelled
 * (in `labelSize` pixels), with `children(p)` drawn over it.
 */
export function GContour({ width = 452, labelSize = 12, children }) {
  const height = Math.round(((width - PAD[1] - PAD[3]) * (YC[1] - YC[0])) / (XG[1] - XG[0])) + PAD[0] + PAD[2];
  return (
    <ContourPlot
      f={g}
      x={XG}
      y={YC}
      size={[width, height]}
      n={240}
      levels={LEVELS}
      color={tone}
      width={1.8}
      pad={PAD}
      labels={levelText}
      labelColor={labelTone}
      labelAvoid={markBoxes}
      labelSize={labelSize}
      title="Contour plot of g, every level labelled"
    >
      {(p) => (
        <g>
          <g fontSize="14" fill={GRAY}>
            {[0, 1, 2].map((x) => (
              <text key={x} x={p.px(x)} y={p.H - 12} textAnchor="middle">
                {x}
              </text>
            ))}
            {[-1, 0, 1].map((y) => (
              <text key={y} x={36} y={p.py(y) + 5} textAnchor="end">
                {y}
              </text>
            ))}
            <text x={p.W - 10} y={p.H - 12} textAnchor="end" fontStyle="italic" fontFamily={MATH} fontSize="16">
              x
            </text>
            <text x={36} y={20} textAnchor="end" fontStyle="italic" fontFamily={MATH} fontSize="16">
              y
            </text>
          </g>
          {children && children(p)}
        </g>
      )}
    </ContourPlot>
  );
}
