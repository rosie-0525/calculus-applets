import Surface from './Surface.jsx';
import { PlanePatch } from './Space.jsx';

const CARDINAL = '#8c1515';
const PLANE = '#608dc4';

/**
 * The graph z = f(x, y) over x × y cut by a vertical plane: `cut = { axis: 'y', at: b, z: [z0, z1] }`
 * for the plane y = b (or axis 'x' for x = a), drawn from z0 to z1. The part of the graph behind the
 * plane is drawn first, then the plane (translucent), then the part in front with the slice curve,
 * z = f(x, b), on it (in `curveColor`), so that the plane shows through nothing it should not. Which
 * side is in front follows from the view `s`. `lines` are more curves (or segments) on the graph,
 * each drawn with the piece where it starts, behind or in front of the plane. Level curves on the
 * graph (Surface's `curve`) take `levelColor` and `levelWidth`, since `curveColor` is the slice's.
 */
export default function SlicedGraph({
  s,
  f,
  x,
  y,
  n = 30,
  zScale = 1,
  cut,
  curveColor = CARDINAL,
  curveWidth = 3.5,
  planeColor = PLANE,
  planeOpacity = 0.4,
  lines = [],
  levelColor,
  levelWidth,
  ...surface
}) {
  const levels = { ...(levelColor ? { curveColor: levelColor } : {}), ...(levelWidth ? { curveWidth: levelWidth } : {}) };
  const { axis, at, z: [z0, z1] } = cut;
  const [nx, ny] = Array.isArray(n) ? n : [n, n];
  const range = axis === 'x' ? x : y; // the range of the cut axis
  const along = axis === 'x' ? y : x; // the plane runs along the other one
  const minus = [range[0], at];
  const plus = [at, range[1]];
  const probe = (t) => (axis === 'x' ? [t, 0, 0] : [0, t, 0]);
  const [back, front] = s.depth(probe(at + 1)) > s.depth(probe(at - 1)) ? [minus, plus] : [plus, minus];
  const inBack = (ln) => ((axis === 'x' ? ln.pts[0][0] : ln.pts[0][1]) < at ? minus : plus) === back;

  // a piece of the graph, with cells of the same size as the whole graph's
  const piece = (rg, extra) => {
    const share = (rg[1] - rg[0]) / (range[1] - range[0]);
    return axis === 'x' ? (
      <Surface s={s} f={f} x={rg} y={y} n={[Math.max(2, Math.round(nx * share)), ny]} zScale={zScale} {...surface} {...levels} {...extra} />
    ) : (
      <Surface s={s} f={f} x={x} y={rg} n={[nx, Math.max(2, Math.round(ny * share))]} zScale={zScale} {...surface} {...levels} {...extra} />
    );
  };

  // the curve where the plane cuts the graph
  const N = 90;
  const pts = Array.from({ length: N + 1 }, (_, k) => {
    const t = along[0] + ((along[1] - along[0]) * k) / N;
    return axis === 'x' ? [at, t, zScale * f(at, t)] : [t, at, zScale * f(t, at)];
  });
  const curve = { pts, color: curveColor, width: curveWidth };

  return (
    <g>
      {back[1] - back[0] > 1e-9 && piece(back, { lines: lines.filter(inBack) })}
      <PlanePatch
        s={s}
        P={axis === 'x' ? [at, 0, 0] : [0, at, 0]}
        e={axis === 'x' ? [0, 1, 0] : [1, 0, 0]}
        e2={[0, 0, 1]}
        range={along}
        range2={[z0, z1]}
        fill={planeColor}
        opacity={planeOpacity}
        stroke={planeColor}
        strokeWidth={1.2}
        strokeOpacity={0.9}
      />
      {front[1] - front[0] > 1e-9 && piece(front, { lines: [curve, ...lines.filter((ln) => !inBack(ln))] })}
    </g>
  );
}

/** The points of the curve t ↦ g(t) for t in `range`, in space. */
export function along(range, g, N = 60) {
  return Array.from({ length: N + 1 }, (_, k) => g(range[0] + ((range[1] - range[0]) * k) / N));
}
