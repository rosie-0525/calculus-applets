import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { Arrow } from '../components/Plane.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import Space, { Dot3, Label3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import SlicedGraph, { along } from '../components/Slices.jsx';
import { lineColor } from '../components/levels.js';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const CARDINAL = '#8c1515'; // the walk north
export const GREEN = '#175e54'; // the walk east
export const INK = '#14213d';
export const PLANE_INK = '#3b5f91'; // the planes' labels, as on Computing partial derivatives
export const GRAY = '#6b7280'; // the axes
export const axisLabel = { fill: GRAY, fontSize: 17, fontStyle: 'italic', fontFamily: 'KaTeX_Math, Georgia, serif' };

export const f = (x, y) => Math.cos(x + y * y);
export const R = [0, Math.PI];
export const LEVELS = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];
export const tone = (c) => lineColor((c + 0.75) / 1.5);
export const X0 = Math.PI / 2; // the walk north, along x = π/2
export const Y0 = Math.PI / 2; // the walk east, along y = π/2
export const CROSS = 8; // seconds for the dot to walk across, always north (or east)
export const REST = 1.2; // seconds it stands at the end before it starts again
export const WALK = [0.05, Math.PI - 0.12]; // the dot's walk, short of the arrow heads
export const STILL = { north: 2.0, east: 2.3 }; // where the dot stands in print

// the contour plot: the square [0, π]² of SIDE pixels, with room around it for the levels
export const SIDE = 360;
export const PAD = [44, 56, 20, 2]; // top (room for the y-axis), right, bottom, left
export const AX = 0.27; // the axes go on that far past the square
export const UNIT = SIDE / Math.PI;
export const GAP = 12.5; // the least distance, in pixels, between two levels written on the right

/** Each level's number, minus sign and all. */
export const name = (c) => (c < 0 ? `−${-c}` : `${c}`);

/** The levels on the right edge, sorted, each with `at`, its height in pixels, spread GAP apart. */
export function spread(items) {
  const out = items.map((it) => ({ ...it, at: it.y * UNIT })).sort((a, b) => a.at - b.at);
  for (let pass = 0; pass < 300; pass += 1) {
    for (let i = 1; i < out.length; i += 1) {
      const d = out[i].at - out[i - 1].at;
      if (d < GAP) {
        out[i].at += (GAP - d) / 2;
        out[i - 1].at -= (GAP - d) / 2;
      }
    }
  }
  return out;
}

// the level curves are the arcs x + y² = s with cos s = c: 28 of them for s in [0, π + π²]. Each
// gets its number where it leaves the square: s = arccos c at the bottom (x = s), s = 4π − arccos c
// at the top (x = s − π²), and the fourteen between at the right edge (y = √(s − π)), where they
// crowd, spread out and joined to their curves
export const BOTTOM = LEVELS.map((c) => ({ c, x: Math.acos(c) }));
export const TOP = LEVELS.map((c) => ({ c, x: 4 * Math.PI - Math.acos(c) - Math.PI ** 2 }));
export const RIGHT = spread(
  LEVELS.flatMap((c) => [2 * Math.PI - Math.acos(c), 2 * Math.PI + Math.acos(c)].map((s) => ({ c, y: Math.sqrt(s - Math.PI) }))),
);

/** The x- and y-axes of the contour plot, along the bottom and left sides of the square. */
export function Axes2({ p }) {
  return (
    <g>
      <Arrow p={p} from={[0, 0]} to={[R[1] + AX, 0]} color={GRAY} width={1.6} head={10} />
      <Arrow p={p} from={[0, 0]} to={[0, R[1] + AX]} color={GRAY} width={1.6} head={10} />
      <text x={p.px(R[1] + AX) + 4} y={p.py(0) + 5} {...axisLabel}>
        x
      </text>
      <text x={p.px(0) + 9} y={p.py(R[1] + AX) + 9} {...axisLabel}>
        y
      </text>
    </g>
  );
}

/** The frame of the square and the number of every level curve, outside it. */
export function Levels({ p }) {
  const text = (key, c, x, y, anchor) => (
    <text key={key} x={x} y={y} textAnchor={anchor} fontSize="11.5" fontWeight="700" fill={tone(c)}>
      {name(c)}
    </text>
  );
  const right = p.px(R[1]);
  return (
    <g>
      <rect x={p.px(R[0])} y={p.py(R[1])} width={SIDE} height={SIDE} fill="none" stroke="#c7ccd3" />
      {BOTTOM.map(({ c, x }) => text(`b${c}`, c, p.px(x), p.py(R[0]) + 14, 'middle'))}
      {TOP.map(({ c, x }) => text(`t${c}`, c, p.px(x), p.py(R[1]) - 6, 'middle'))}
      {RIGHT.map(({ c, y, at }) => {
        const ly = p.py(R[0]) - at;
        return (
          <g key={`r${y}`}>
            <polyline points={`${right},${p.py(y)} ${right + 4},${p.py(y)} ${right + 17},${ly} ${right + 20},${ly}`} fill="none" stroke={tone(c)} strokeWidth="1" />
            {text('t', c, right + 22, ly + 4, 'start')}
          </g>
        );
      })}
    </g>
  );
}

// the graph over [0, π]², drawn around the origin, (u, v) = (x − π/2, y − π/2), as in Example 3
export const H = Math.PI / 2;
export const fc = (u, v) => f(u + H, v + H);
export const RC = [-H, H];
export const Z = 0.8; // heights drawn at 0.8 × f

/**
 * Whether the graph hides the point q from the viewer: walk from q toward the viewer, see if it goes
 * under the graph (q may lie outside the square, e.g. on an axis).
 */
export function hidden(s, [u, v, z]) {
  const A = (s.az * Math.PI) / 180;
  const E = (s.el * Math.PI) / 180;
  const d = [Math.cos(E) * Math.cos(A), -Math.cos(E) * Math.sin(A), Math.sin(E)]; // toward the viewer
  for (let t = 0.04; t < 5; t += 0.02) {
    const [a, b, c] = [u + t * d[0], v + t * d[1], z + t * d[2]];
    if (c > Z + 0.01) return false; // above the whole graph
    if (Math.abs(a) <= H && Math.abs(b) <= H && Z * fc(a, b) > c + 0.01) return true;
  }
  return false;
}

/**
 * The x-, y- and z-axes through the origin (x, y) = (0, 0), the corner (u, v) = (−π/2, −π/2): x
 * along the side y = 0, y along the side x = 0, at height 0; each drawn where the graph does not hide
 * it.
 */
export function Axes3({ s }) {
  const o = [-H, -H, 0];
  const ends = [
    ['x', [H + 0.3, -H, 0], [6, 14]],
    ['y', [-H, H + 0.2, 0], [12, 8]],
    ['z', [-H, -H, 1.25], [0, -8]],
  ];
  const N = 70;
  return (
    <g>
      {ends.map(([name, e, [dx, dy]]) => {
        const pts = Array.from({ length: N + 1 }, (_, i) => o.map((c, m) => c + ((e[m] - c) * i) / N));
        const d = pts
          .slice(0, -1)
          .map((q, i) => [q, pts[i + 1]])
          .filter(([a, b]) => !hidden(s, a.map((c, m) => (c + b[m]) / 2)))
          .map(([a, b]) => `M${s.P(a).map((c) => c.toFixed(1)).join(',')}L${s.P(b).map((c) => c.toFixed(1)).join(',')}`)
          .join('');
        const tip = s.P(e);
        return (
          <g key={name}>
            <path d={d} stroke={GRAY} strokeWidth="1.6" fill="none" />
            <Arrow p={ID} from={s.P(pts[N - 4])} to={tip} color={GRAY} width={1.6} head={10} />
            <text x={tip[0] + dx} y={tip[1] + dy} textAnchor="middle" {...axisLabel}>
              {name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export const ID = { px: (c) => c, py: (c) => c };

/** A label "x = π/2" (or y) for a plane. */
export function PlaneName({ s, at, letter, ...rest }) {
  return (
    <Label3 s={s} at={at} color={PLANE_INK} size={19} fontWeight="400" {...rest}>
      {letter}
      <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
        {' = '}
      </tspan>
      π
      <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
        /2
      </tspan>
    </Label3>
  );
}

/**
 * The graph of f with its level curves on it, in one of four states: 0, the graph; 1, the path north
 * along x = π/2 on it (red); 2, cut by the plane x = π/2 along that path; 3, cut by the plane
 * y = π/2 instead, the path east along it (green), the red path still on the graph. From state 1,
 * the dot at `at` = (x, y), unless the graph hides it.
 */
export function Graph3D({ s, state, at }) {
  // a light graph, so that the level curves (in the contour plot's colours) and the paths show on it
  const base = { s, f: fc, x: RC, y: RC, n: 40, zScale: Z, color: '#e6eef1', mesh: 'rgba(15, 40, 50, 0.13)', curve: LEVELS };
  const levels = { levelColor: tone, levelWidth: 2.2 };
  const north = (v0, v1) => ({ pts: along([v0, v1], (v) => [0, v, Z * fc(0, v)], 120), color: CARDINAL, width: 3.5 });
  const q = at && [at[0] - H, at[1] - H, Z * f(...at)];
  let graph;
  if (state === 2) {
    graph = <SlicedGraph {...base} {...levels} cut={{ axis: 'x', at: 0, z: [-1.05, 1.05] }} curveColor={CARDINAL} curveWidth={3.5} />;
  } else if (state === 3) {
    // the red path in two pieces, each painted with the part of the graph it lies on
    graph = <SlicedGraph {...base} {...levels} cut={{ axis: 'y', at: 0, z: [-1.05, 1.05] }} curveColor={GREEN} curveWidth={3.5} lines={[north(RC[0], 0), north(0, RC[1])]} />;
  } else {
    graph = <Surface {...base} curveColor={tone} curveWidth={2.2} lines={state === 1 ? [north(...RC)] : []} />;
  }
  return (
    <g>
      {graph}
      <Axes3 s={s} />
      {state > 0 && q && !hidden(s, q) && <Dot3 s={s} at={q} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />}
      {state === 2 && <PlaneName s={s} at={[0, RC[0], -1.05]} dx={-8} letter="x" textAnchor="end" />}
      {state === 3 && <PlaneName s={s} at={[RC[0], 0, 1.05]} letter="y" dx={-8} dy={6} textAnchor="end" />}
    </g>
  );
}

/** Seconds since the walk `walk` began, counted while the slide is showing; 0 with no walk, and in print. */
export function useClock(walk, ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    setT(0);
    if (PRINT || !walk) return undefined;
    let id;
    let t0;
    const tick = (now) => {
      t0 ??= now;
      if (ref.current?.closest('section')?.classList.contains('present')) setT((now - t0) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [walk, ref]);
  return t;
}

/** The dot after t seconds of a walk: north (or east) across WALK at a steady pace, a rest at the end, and again. */
export function walkAt(walk, t) {
  const k = Math.min(1, (t % (CROSS + REST)) / CROSS);
  const w = WALK[0] + k * (WALK[1] - WALK[0]);
  return walk === 'north' ? [X0, w] : [w, Y0];
}

/** The dot on the contour plot. */
export const flatDot = (p, [x, y]) => <circle cx={p.px(x)} cy={p.py(y)} r="6" fill={INK} stroke="#fff" strokeWidth="1.5" />;

/**
 * Contour plot and partial derivatives (Christine's Example 2, f(x, y) = cos(x + y²) over [0, π]²):
 * its contour plot, levels every 0.25, each curve numbered, with the x- and y-axes. Key press 1:
 * the arrow north along x = π/2; 2: a dot walks north
 * along it at a steady pace, again and again, crossing the level curves faster and faster; 3: the
 * graph of f beside it, with its level curves, the x-, y- and z-axes, the path north and the dot on
 * it; 4: the plane x = π/2 cuts the graph along that path; 5: on the contour plot, the arrow east
 * along y = π/2 and the dot walking east (none on the graph); 6: on the graph, the path east, the
 * plane y = π/2 and the dot; 7: the conclusion, (1) |f_x| (resp. |f_y|) and the density of the level
 * curves; 8: (2) the sign of f_x and the labels of the level sets. In print, the dot stands still.
 */
export default function Slide13Density() {
  const m2 = useRef(null);
  const m4 = useRef(null);
  const m5 = useRef(null);
  const m6 = useRef(null);
  const s2 = useFragmentShown(m2);
  const s4 = useFragmentShown(m4);
  const s5 = useFragmentShown(m5);
  const s6 = useFragmentShown(m6);
  const state = s6 ? 3 : s4 ? 2 : 1; // the graph's, from key press 3, when it appears
  const walk = s5 ? 'east' : s2 ? 'north' : null;
  const t = useClock(walk, m2);
  const at = walk && walkAt(walk, t);
  const onGraph = s5 && !s6 ? null : at; // the walk east reaches the graph a key press later
  const still = { north: [X0, STILL.north], east: [STILL.east, Y0] };
  return (
    <section className="dense">
      <h2>Contour plot and partial derivatives</h2>
      <span ref={m2} className="fragment fx-marker" data-fragment-index={2} aria-hidden="true" />
      <span ref={m4} className="fragment fx-marker" data-fragment-index={4} aria-hidden="true" />
      <span ref={m5} className="fragment fx-marker" data-fragment-index={5} aria-hidden="true" />
      <span ref={m6} className="fragment fx-marker" data-fragment-index={6} aria-hidden="true" />

      <div className="density-row">
        <figure>
          <ContourPlot f={f} x={R} y={R} size={[PAD[3] + SIDE + PAD[1], PAD[0] + SIDE + PAD[2]]} pad={PAD} levels={LEVELS} color={tone} width={1.8} title="The contour plot of cos(x + y squared) over the square from 0 to pi, each level curve numbered with its level, with a dot walking north along x = pi over 2, then east along y = pi over 2">
            {(p) => (
              <g>
                <Levels p={p} />
                <Axes2 p={p} />
                <Fragment as="g" index={1}>
                  <Arrow p={p} from={[X0, 0]} to={[X0, R[1] - 0.04]} color={CARDINAL} width={3} head={13} />
                </Fragment>
                <Fragment as="g" index={5}>
                  <Arrow p={p} from={[0, Y0]} to={[R[1] - 0.04, Y0]} color={GREEN} width={3} head={13} />
                </Fragment>
                {PRINT ? (
                  <g>
                    <Fragment as="g" index={2}>
                      <Fragment as="g" index={5} effect="fade-out">
                        {flatDot(p, still.north)}
                      </Fragment>
                    </Fragment>
                    <Fragment as="g" index={5}>
                      {flatDot(p, still.east)}
                    </Fragment>
                  </g>
                ) : (
                  at && flatDot(p, at)
                )}
              </g>
            )}
          </ContourPlot>
          <figcaption>Contour plot, levels every 0.25</figcaption>
        </figure>

        <Fragment index={3} as="figure">
          <Space width={500} height={370} unit={92} center={[0.5, 0.5]} axes={false} az={60} el={50} swing={6} title="The graph of cos(x + y squared) over the square from 0 to pi, with its level curves, a dot walking north along x = pi over 2, then east along y = pi over 2, and the planes x = pi over 2 and y = pi over 2">
            {(s) =>
              PRINT ? (
                <g>
                  <Graph3D s={s} state={1} at={still.north} />
                  <Fragment as="g" index={4}>
                    <Fragment as="g" index={5} effect="fade-out">
                      <Graph3D s={s} state={2} at={still.north} />
                    </Fragment>
                  </Fragment>
                  <Fragment as="g" index={5}>
                    <Fragment as="g" index={6} effect="fade-out">
                      <Graph3D s={s} state={2} />
                    </Fragment>
                  </Fragment>
                  <Fragment as="g" index={6}>
                    <Graph3D s={s} state={3} at={still.east} />
                  </Fragment>
                </g>
              ) : (
                <Graph3D s={s} state={state} at={onGraph} />
              )
            }
          </Space>
          <figcaption>
            Graph of <Tex tex="f" />
          </figcaption>
        </Fragment>
      </div>

      <Fragment index={7} className="block theorem density-rule">
        <ol>
          <li>
            <Tex tex="|f_x|" /> (resp. <Tex tex="|f_y|" />) indicates the density of level curves in the <Tex tex="x" /> (resp.{' '}
            <Tex tex="y" />) direction;
          </li>
          <Fragment index={8} as="li">
            <Tex tex={r`f_x\ge 0`} /> <Tex tex={r`\,\Longleftrightarrow\,`} /> <Tex tex="f" /> increases in the <Tex tex="+x" /> direction{' '}
            <Tex tex={r`\,\Longleftrightarrow\,`} /> the labels on the level sets increase in the <Tex tex="+x" /> direction.
          </Fragment>
        </ol>
      </Fragment>
    </section>
  );
}
