import Space, { Seg3 } from './Space.jsx';
import { INK, cross, unit, plus, times } from './ls.js';

const N = 5; // tiles per side, for the painter's order

/**
 * Planes in ℝ³ (Lecture 18's ThreePlanes, generalized): `planes` = [{ n, at, fill, edge }], each a
 * square patch of half-side `half` around the point `at` of the plane with normal n, as opaque pastel
 * tiles drawn far to near (so that each plane hides what is behind it), the patch's edges in its
 * colour; `lines` = [[point, direction, half-length]], drawn over them in ink (where two planes
 * cross). The view rocks; drag to turn it.
 */
export default function Planes({ planes, lines = [], half = 1.4, width = 420, height = 320, unit: u = 74, az = -156, el = 13, swing = 12, center = [0.5, 0.5], title }) {
  const tiles = planes.flatMap((pl, k) => {
    const a = unit(cross(pl.n, Math.abs(pl.n[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]));
    const b = unit(cross(pl.n, a));
    const pt = (x, y) => plus(pl.at, plus(times(x, a), times(y, b)));
    const out = [];
    for (let i = 0; i < N; i += 1) {
      for (let j = 0; j < N; j += 1) {
        const [x0, x1] = [-half + (2 * half * i) / N, -half + (2 * half * (i + 1)) / N];
        const [y0, y1] = [-half + (2 * half * j) / N, -half + (2 * half * (j + 1)) / N];
        out.push({ k, corners: [pt(x0, y0), pt(x1, y0), pt(x1, y1), pt(x0, y1)], centre: pt((x0 + x1) / 2, (y0 + y1) / 2), edge: [i === 0, j === 0, i === N - 1, j === N - 1] });
      }
    }
    return out;
  });
  return (
    <Space width={width} height={height} unit={u} center={center} az={az} el={el} swing={swing} axes={false} title={title}>
      {(s) => {
        const sorted = [...tiles].sort((p, q) => s.depth(p.centre) - s.depth(q.centre));
        return (
          <g>
            {sorted.map((t, m) => {
              const q = t.corners.map((c) => s.P(c));
              const pts = q.map((c) => c.map((v) => v.toFixed(1)).join(',')).join(' ');
              const { fill, edge } = planes[t.k];
              return (
                <g key={m}>
                  <polygon points={pts} fill={fill} stroke={fill} strokeWidth="0.8" strokeLinejoin="round" />
                  {t.edge.map(
                    (on, e) =>
                      on && <line key={e} x1={q[[0, 0, 1, 2][e]][0]} y1={q[[0, 0, 1, 2][e]][1]} x2={q[[3, 1, 2, 3][e]][0]} y2={q[[3, 1, 2, 3][e]][1]} stroke={edge} strokeWidth="1.6" />,
                  )}
                </g>
              );
            })}
            {lines.map(([p, d, len], k) => (
              <Seg3 key={k} s={s} from={plus(p, times(-len, unit(d)))} to={plus(p, times(len, unit(d)))} color={INK} width={3} />
            ))}
          </g>
        );
      }}
    </Space>
  );
}

export const BLUE_PLANE = { fill: '#bcd0e8', edge: '#3b6ea8' };
export const AMBER_PLANE = { fill: '#f2d2ae', edge: '#c2702a' };
