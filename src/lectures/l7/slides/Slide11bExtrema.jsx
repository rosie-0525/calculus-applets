import Fragment from '../components/Fragment.jsx';
import Space, { Dot3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { lineColor } from '../components/levels.js';

export const CARDINAL = '#8c1515';
export const INK = '#14213d';
export const MESH = 'rgba(20, 33, 61, 0.2)';

export const polar = (rr, t) => [rr * Math.cos(t), rr * Math.sin(t)];
export const DISK = [0, 2]; // the graphs are drawn over the disk of radius 2
export const PLANE = [-2.2, 2.2]; // the contour plots, over a square around it
export const Z = 0.3; // heights drawn at 0.3 × f
export const FILL = '#e4edf1'; // a light graph, so that its level curves show
export const SE = [Math.SQRT1_2, -Math.SQRT1_2]; // the labels of the loops go down this ray

/**
 * The three model cases, each with its point at the origin, with levels 1 apart: a hill
 * 4 − x² − y², a bowl x² + y², and the saddle x² − y². `labels`: [x, y, text] on the contour plot.
 */
export const CASES = [
  {
    name: 'Local maximum',
    f: (x, y) => 4 - x * x - y * y,
    levels: [0, 1, 2, 3],
    labels: [
      [SE[0], SE[1], '3'],
      [2 * SE[0], 2 * SE[1], '0'],
    ],
  },
  {
    name: 'Local minimum',
    f: (x, y) => x * x + y * y,
    levels: [1, 2, 3, 4],
    labels: [
      [SE[0], SE[1], '1'],
      [2 * SE[0], 2 * SE[1], '4'],
    ],
  },
  {
    name: 'Saddle point',
    f: (x, y) => x * x - y * y,
    levels: [-3, -2, -1, 0, 1, 2, 3],
    labels: [
      [Math.sqrt(3), 0, '3'],
      [0, Math.sqrt(3), '−3'],
      [1.1, 1.1, '0'],
    ],
  },
];

export const range = (levels) => [Math.min(...levels), Math.max(...levels)];
export const toneFor = (levels) => {
  const [lo, hi] = range(levels);
  return (c) => lineColor((c - lo) / (hi - lo));
};

/** The graph over the disk, with its level curves and the point in red. */
export function Graph({ f, levels, name }) {
  const tone = toneFor(levels);
  return (
    <Space width={340} height={200} unit={49} center={[0.5, 0.55]} axes={false} az={-35} el={24} swing={8} title={`${name}: the graph, with its level curves and the point in red`}>
      {(s) => (
        <g>
          <Surface s={s} f={f} x={DISK} y={[0, 2 * Math.PI]} n={[14, 40]} param={polar} zScale={Z} color={FILL} mesh={MESH} curve={levels} curveColor={tone} curveWidth={2.2} />
          <Dot3 s={s} at={[0, 0, Z * f(0, 0)]} color={CARDINAL} r={6} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </Space>
  );
}

/** The contour plot, with a few levels written on it and the point in red. */
export function Contours({ f, levels, labels, name }) {
  const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };
  return (
    <ContourPlot f={f} x={PLANE} y={PLANE} size={186} levels={levels} color={toneFor(levels)} width={2} title={`${name}: the contour plot`}>
      {(p) => (
        <g>
          <circle cx={p.px(0)} cy={p.py(0)} r="5.5" fill={CARDINAL} stroke="#fff" strokeWidth="1.5" />
          <g fontSize="14" fontWeight="700" fill={INK} textAnchor="middle" {...halo}>
            {labels.map(([x, y, text]) => (
              <text key={text} x={p.px(x)} y={p.py(y) + 5}>
                {text}
              </text>
            ))}
          </g>
        </g>
      )}
    </ContourPlot>
  );
}

/** Its children from key press `index` on (from the start if 0). */
export function Shown({ index, as: Tag = 'div', className, children }) {
  return index === 0 ? (
    <Tag className={className}>{children}</Tag>
  ) : (
    <Fragment index={index} as={Tag} className={className}>
      {children}
    </Fragment>
  );
}

/**
 * Maximum, minimum and saddle: the three model cases side by side, each with its graph over a disk
 * (the level curves on it, the point in red) and its contour plot (levels 1 apart, a few written
 * on it, the point in red), one picture per key press: the local maximum's graph first; 1: its
 * contour plot; 2, 3: the local minimum's graph, then its contour plot (the same loops as the
 * maximum: only the values tell them apart); 4, 5: the saddle point's, and with its contour plot
 * the pointer to Section 10.2, where these are defined. After the steepness slide; the next slide
 * puts all three in one graph.
 */
export default function Slide11bExtrema() {
  return (
    <section className="dense">
      <h2>Maximum, minimum and saddle</h2>

      <div className="ext-row">
        {CASES.map((c, k) => {
          // the graph (with its name) on key press 2k (the maximum's from the start), the contour
          // plot on the next one
          return (
            <div key={c.name} className="ext-col">
              <Shown index={2 * k} as="p" className="ext-name">
                {c.name}
              </Shown>
              <Shown index={2 * k}>
                <Graph f={c.f} levels={c.levels} name={c.name} />
              </Shown>
              <Fragment index={2 * k + 1}>
                <Contours f={c.f} levels={c.levels} labels={c.labels} name={c.name} />
              </Fragment>
            </div>
          );
        })}
      </div>

      <Fragment index={5} as="p" className="pointer right">
        → Section 10.2
      </Fragment>
    </section>
  );
}
