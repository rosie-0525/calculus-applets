import { useState } from 'react';
import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import { Arrow } from './Plane.jsx';
import Space, { Arrow3, Dot3, Patch3 } from './Space.jsx';
import { RankNullity } from './ImageCards.jsx';
import { fmt } from './Slider.jsx';
import { MAIN, MATH } from './svgmath.jsx';
import { PRINT } from './print.js';
import { INK, GREEN, BLUE, TEAL, LEAF, GRAY, dot, minus, times, norm } from './ls.js';

/**
 * Back to linear systems, the examples (the user's request: a better class of examples, showing all
 * that can happen, with b varying). Four systems, one for each kind of matrix:
 *
 *                      N(A) = {0}                       N(A) ≠ {0}
 *   C(A) = ℝᵐ    [1 1; 0 1]: always one solution   [1 1 1]: always a plane of solutions
 *   C(A) ≠ ℝᵐ    [2; 1]: none, or one              [2 4; 1 2]: none, or a line
 *
 * Each example (`SolveDuo`) is a system Ax = b whose right-hand sides are b's coordinates, over ONE
 * picture (the user's request: first two, the inputs beside the outputs): N(A) green, C(A) teal,
 * each equation's solutions thin and gray, and b on top, an arrow to drag (the user explores: nothing
 * moves on a key press). As b moves, the right-hand sides and the gray lines follow. Off C(A): "No
 * solution". Once b is in C(A) (close to a line C(A), it lands on it), a small button, "All
 * solutions": a click shows them, blue, N(A) moved to a solution x₀, and what they are; they then
 * follow b; another click hides them.
 * Print: b at a place with solutions (`still`), the solutions shown.
 */

const W = 540;
const H = 280;
const U = 32; // pixels per unit, in all the pictures of ℝ²
const PAD = 7;
const SNAP = 0.16; // within this distance of a line C(A), b lands on it

const HALO = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4.5, strokeLinejoin: 'round' };
const NAME = { fontSize: 21, fontFamily: MATH, fontStyle: 'italic', ...HALO };
const WORD = { fontSize: 18, fontFamily: 'inherit', fontWeight: 600, ...HALO };

/** A picture's coordinates: `unit` pixels per unit, the origin at `O` (pixels). */
const geo = ({ unit = U, O = [W / 2, H / 2] }) => ({ U: unit, O, px: (x) => O[0] + unit * x, py: (y) => O[1] - unit * y });
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const round1 = (x) => Math.round(x * 10) / 10;

/** The part inside the picture of the line through `at` along `d`, as [x1, y1, x2, y2] in pixels (x1 ≤ x2), or null. */
function clip(g, at, d) {
  let lo = -Infinity;
  let hi = Infinity;
  const a = [g.px(at[0]), g.py(at[1])];
  const v = [g.U * d[0], -g.U * d[1]];
  for (const [size, i] of [
    [W, 0],
    [H, 1],
  ]) {
    if (Math.abs(v[i]) < 1e-9) {
      if (a[i] < PAD || a[i] > size - PAD) return null;
    } else {
      const t1 = (PAD - a[i]) / v[i];
      const t2 = (size - PAD - a[i]) / v[i];
      lo = Math.max(lo, Math.min(t1, t2));
      hi = Math.min(hi, Math.max(t1, t2));
    }
  }
  if (lo >= hi) return null;
  const ends = [a[0] + lo * v[0], a[1] + lo * v[1], a[0] + hi * v[0], a[1] + hi * v[1]];
  return ends[0] <= ends[2] ? ends : [ends[2], ends[3], ends[0], ends[1]];
}

function Line({ g, at = [0, 0], d, color, width = 3, ...rest }) {
  const seg = clip(g, at, d);
  if (!seg) return null;
  return <line x1={seg[0]} y1={seg[1]} x2={seg[2]} y2={seg[3]} stroke={color} strokeWidth={width} strokeLinecap="round" {...rest} />;
}

/** The axes of a picture of ℝ² (`y` false: of ℝ¹, the number line), with a tick at each whole number. */
function Axes({ g, y = true }) {
  const whole = (lo, hi) => Array.from({ length: Math.floor(hi) - Math.ceil(lo) + 1 }, (_, i) => Math.ceil(lo) + i).filter((k) => k !== 0);
  const xs = whole((PAD + 4 - g.O[0]) / g.U, (W - PAD - 4 - g.O[0]) / g.U);
  const ys = y ? whole((g.O[1] - H + PAD + 4) / g.U, (g.O[1] - PAD - 4) / g.U) : [];
  const t = y ? 3 : 5;
  return (
    <g stroke={GRAY} strokeWidth="1">
      <line x1={PAD} y1={g.O[1]} x2={W - PAD} y2={g.O[1]} />
      {y && <line x1={g.O[0]} y1={PAD} x2={g.O[0]} y2={H - PAD} />}
      {xs.map((k) => (
        <line key={`x${k}`} x1={g.px(k)} y1={g.O[1] - t} x2={g.px(k)} y2={g.O[1] + t} />
      ))}
      {ys.map((k) => (
        <line key={`y${k}`} x1={g.O[0] - t} y1={g.py(k)} x2={g.O[0] + t} y2={g.py(k)} />
      ))}
    </g>
  );
}

/** "x₀", bold with its subscript. */
const X0 = ({ x, y, anchor = 'start' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize="20" fontFamily={MAIN} fontWeight="700" fill={INK} {...HALO}>
    x
    <tspan baselineShift="sub" fontSize="0.7em">
      0
    </tspan>
  </text>
);

const NLabel = ({ x, y, anchor = 'start' }) => (
  <text {...NAME} x={x} y={y} textAnchor={anchor} fill={GREEN}>
    N(A)
  </text>
);

/** "C(A)", or "C(A) = ℝᵐ" when it is all of ℝᵐ (`all` = m). */
const CLabel = ({ x, y, anchor = 'start', all }) => (
  <text {...NAME} x={x} y={y} textAnchor={anchor} fill={TEAL}>
    C(A)
    {all && (
      <tspan fontStyle="normal" fontFamily={MAIN}>
        {' = '}
        <tspan fontFamily="KaTeX_AMS, KaTeX_Main, serif">R</tspan>
        {all > 1 && (
          <tspan dy="-7" fontSize="13">
            {all}
          </tspan>
        )}
      </tspan>
    )}
  </text>
);

/** "b", beside b's tip. */
const BLabel = ({ x, y }) => (
  <text x={x} y={y} textAnchor="middle" fill={LEAF} fontSize="21" fontFamily={MATH} fontWeight="700" fontStyle="italic" {...HALO}>
    b
  </text>
);

/**
 * A drag: `onB(toB(x, y))` for the pointer at (x, y), in the picture's pixels (kept inside it, with
 * room for b's label). It starts anywhere on the element that carries these handlers.
 */
function dragging(onB, toB) {
  if (!onB) return {};
  const put = (e) => {
    const box = (e.currentTarget.ownerSVGElement ?? e.currentTarget).getBoundingClientRect();
    const x = clamp(((e.clientX - box.left) / box.width) * W, 26, W - 26);
    const y = clamp(((e.clientY - box.top) / box.height) * H, 30, H - 22);
    onB(toB(x, y));
  };
  return {
    'data-prevent-swipe': '',
    onPointerDown: (e) => {
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* not a live pointer (a test) */
      }
      put(e);
    },
    onPointerMove: (e) => e.currentTarget.hasPointerCapture(e.pointerId) && put(e),
  };
}

/**
 * A system in ℝ², the unknowns and the right-hand side b in one plane: C(A) (teal: a line through 0,
 * or all of the plane, tinted), N(A) (green: a line through 0, or the point 0), each equation's
 * solutions (a thin gray line), and b on top, to drag. With `shown` and b ∈ C(A) (`on`): the
 * solutions, blue (N(A) moved to a solution x₀).
 * With one unknown (a matrix of one column), the unknown's number line is the horizontal axis: N(A)
 * the point 0, each equation's solution a gray tick, the solution a blue point on it.
 */
function PlaneDuo({ ex, b, on, shown, onB }) {
  const g = geo(ex.pic);
  const n = ex.rows[0].length;
  const all = ex.col.kind === 'all';
  const line = ex.nul.kind === 'line';
  const x0 = on && shown ? ex.solve(b) : null;
  const tip = x0 && [g.px(x0[0]), g.py(n === 1 ? 0 : x0[1])];
  const sols = x0 && line ? clip(g, x0, ex.nul.dir) : null;
  // "solutions", over the left end of their line (not above the picture)
  const at = sols && (sols[1] >= 30 ? [sols[0], sols[1]] : [sols[0] + ((30 - sols[1]) * (sols[2] - sols[0])) / (sols[3] - sols[1]), 30]);
  const [nx, ny, na] = ex.pic.nulLabel;
  const [cx, cy, ca] = ex.pic.colLabel;
  const bt = [g.px(b[0]), g.py(b[1])];
  const len = Math.hypot(bt[0] - g.O[0], bt[1] - g.O[1]);
  const u = len > 6 ? [(bt[0] - g.O[0]) / len, (bt[1] - g.O[1]) / len] : [0.7, -0.7];
  return (
    <svg
      className={`figure-svg l22-duo-pic${onB ? ' l22-grab' : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label="N(A), C(A), each equation's solutions and the vector b, to drag"
      {...dragging(onB, (x, y) => [(x - g.O[0]) / g.U, (g.O[1] - y) / g.U])}
    >
      {all && <rect x="0" y="0" width={W} height={H} fill={TEAL} opacity="0.13" />}
      <Axes g={g} />
      {!all && <Line g={g} d={ex.col.dir} color={TEAL} width={6} opacity={0.6} />}
      {line ? <Line g={g} d={ex.nul.dir} color={GREEN} width={3.5} /> : <circle cx={g.O[0]} cy={g.O[1]} r="6.5" fill={GREEN} />}
      {/* each equation's solutions */}
      {ex.rows.map((row, i) => {
        if (n === 2) return <Line key={i} g={g} at={times(b[i] / dot(row, row), row)} d={[-row[1], row[0]]} color={GRAY} width={1.6} />;
        const x = g.px(b[i] / row[0]);
        return x > PAD && x < W - PAD && <line key={i} x1={x} y1={g.O[1] - 15} x2={x} y2={g.O[1] + 15} stroke={GRAY} strokeWidth="2.2" strokeLinecap="round" />;
      })}
      {x0 && (
        <g>
          {line && <Line g={g} at={x0} d={ex.nul.dir} color={BLUE} width={3.5} />}
          <Arrow p={g} to={n === 1 ? [x0[0], 0] : x0} color={INK} width={2.6} head={11} />
          <circle cx={tip[0]} cy={tip[1]} r={line ? 4.5 : 6.5} fill={line ? INK : BLUE} />
        </g>
      )}
      <circle cx={g.O[0]} cy={g.O[1]} r="2.6" fill={INK} />
      {/* b, on top */}
      <Arrow p={g} to={b} color={LEAF} width={3.2} head={12} />
      {onB && <circle className="l15-grab" cx={bt[0]} cy={bt[1]} r="12" />}
      {/* the labels last, their halos over the lines */}
      <NLabel x={nx} y={ny} anchor={na} />
      <CLabel x={cx} y={cy} anchor={ca} all={all ? 2 : undefined} />
      {x0 &&
        (n === 1 ? (
          <>
            <X0 x={tip[0]} y={tip[1] + 27} anchor="middle" />
            <text {...WORD} x={tip[0]} y={tip[1] + 54} textAnchor="middle" fill={BLUE}>
              solution
            </text>
          </>
        ) : (
          <>
            <X0 x={tip[0] + 7} y={tip[1] - 10} />
            {line ? (
              at && (
                <text {...WORD} x={at[0] + 6} y={at[1] - 9} fill={BLUE}>
                  solutions
                </text>
              )
            ) : (
              // beside the point, clear of x₀'s arrow and of the equations' lines
              <text {...WORD} x={tip[0] + (x0[0] < 0 ? -12 : 26)} y={tip[1] + 22} textAnchor={x0[0] < 0 ? 'end' : 'start'} fill={BLUE}>
                solution
              </text>
            )}
          </>
        ))}
      <BLabel x={bt[0] + 18 * u[0]} y={bt[1] + 18 * u[1] + 6} />
    </svg>
  );
}

/** A solution x₀ is in the picture, with room for its labels. */
PlaneDuo.fits = (ex, x0) => {
  const g = geo(ex.pic);
  const x = g.px(x0[0]);
  if (ex.rows[0].length === 1) return x > 16 && x < W - 16;
  const y = g.py(x0[1]);
  return x > 16 && x < W - 34 && y > 30 && y < H - 30;
};

const Q = 2.2; // the planes' patches: squares of side 2Q
const square = (z) => [
  [-Q, -Q, z],
  [Q, -Q, z],
  [Q, Q, z],
  [-Q, Q, z],
];
const STRIP = 84; // the height of b's number line, across the top

/**
 * One equation in ℝ³, N(A) a plane: drawn as a floor through 0 (the picture is turned so that it is
 * level: no axes); with `shown`, the solutions, the parallel plane through x₀, at height
 * `ex.height(b)` above it. On top, b's number line, all of it C(A): b is dragged along it (dragging
 * the planes turns the view).
 */
function PlanesDuo({ ex, b, shown, onB }) {
  const h = ex.height(b);
  const g = geo(ex.pic.strip);
  const y = g.O[1];
  const bx = g.px(b[0]);
  return (
    <Space
      width={W}
      height={H}
      unit={34}
      center={[0.5, 0.65]}
      el={24}
      swing={10}
      axes={false}
      className="l22-duo-pic"
      title="N(A), a plane through 0, the solutions, the parallel plane through a solution, and on top the number b, to drag"
    >
      {(s) => {
        const left = s.P([Q, -Q, 0]);
        const tip = s.P([0, 0, h]);
        // "solutions": over the plane's far corner when it is above N(A), under its near corner when below
        const corner = s.P(h < 0 ? [Q, Q, h] : [-Q, -Q, h]);
        const sy = h < 0 ? Math.min(corner[1] + 21, H - 8) : Math.max(corner[1] - 9, STRIP + 6);
        return (
          <g>
            <Patch3 s={s} corners={square(0)} fill={GREEN} opacity={0.22} stroke={GREEN} strokeOpacity={0.8} />
            <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3} />
            {shown && (
              <g>
                <Patch3 s={s} corners={square(h)} fill={BLUE} opacity={0.22} stroke={BLUE} strokeOpacity={0.8} />
                <Arrow3 s={s} to={[0, 0, h]} color={INK} width={2.6} head={11} />
                <Dot3 s={s} at={[0, 0, h]} color={INK} r={4.5} />
              </g>
            )}
            <NLabel x={left[0] - 5} y={left[1] + 7} anchor="end" />
            {shown && (
              <g>
                <X0 x={tip[0] + 10} y={tip[1] + (h < 0 ? 22 : -10)} />
                <text {...WORD} x={corner[0]} y={sy} textAnchor="middle" fill={BLUE}>
                  solutions
                </text>
              </g>
            )}
            {/* b, on top: its number line */}
            <g className={onB ? 'l22-grab' : undefined} {...dragging(onB, (x) => [(x - g.O[0]) / g.U])}>
              <rect x="0" y="0" width={W} height={STRIP} fill="transparent" />
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={TEAL} strokeWidth="8" strokeLinecap="round" opacity="0.5" />
              <Axes g={g} y={false} />
              <circle cx={g.O[0]} cy={y} r="2.6" fill={INK} />
              <Arrow p={g} to={[b[0], 0]} color={LEAF} width={3.2} head={12} />
              {onB && <circle className="l15-grab" cx={bx} cy={y} r="12" />}
              <CLabel x={W - 12} y={y + 30} anchor="end" all={1} />
              <BLabel x={bx} y={y - 19} />
            </g>
          </g>
        );
      }}
    </Space>
  );
}

// ——— the examples ———

const mat = (M) => r`\begin{bmatrix}${M.map((row) => row.join('&')).join(r`\\`)}\end{bmatrix}`;

/**
 * Each example: `rows`, the matrix; `lhs`, its equations' left-hand sides; `nul` and `col`, N(A) and
 * C(A) ('zero', 'line' along `dir`, 'plane', 'all'); `solve(b)`, a solution x₀ for b ∈ C(A); `start`,
 * where b is at first, and `still`, where it is in print (in C(A)); `Pic`, its picture, with its
 * origin and labels' places (`pic`).
 */
export const SOLVE = {
  // none, or a line: 2x + 4y = b₁, x + 2y = b₂ (the equations different: the user's request; first x + 2y twice)
  rank1: {
    rows: [
      [2, 4],
      [1, 2],
    ],
    lhs: ['2x+4y', 'x+2y'],
    rank: 1,
    nullity: 1,
    nul: { kind: 'line', dir: [2, -1] },
    col: { kind: 'line', dir: [2, 1] },
    solve: (b) => [b[1] / 3, b[1] / 3],
    start: [6, 1],
    still: [6, 3],
    Pic: PlaneDuo,
    pic: { O: [270, 140], nulLabel: [492, 273, 'end'], colLabel: [48, 273, 'start'] },
  },
  // always one solution: x + y = b₁, y = b₂
  shear: {
    rows: [
      [1, 1],
      [0, 1],
    ],
    lhs: ['x+y', 'y'],
    rank: 2,
    nullity: 0,
    nul: { kind: 'zero' },
    col: { kind: 'all' },
    solve: (b) => [b[0] - b[1], b[1]],
    start: [1, 2],
    Pic: PlaneDuo,
    pic: { O: [270, 146], nulLabel: [258, 173, 'end'], colLabel: [14, 30, 'start'] },
  },
  // none, or one: 2x = b₁, x = b₂; it starts at the lecture's first system, 2x = 4, x = 3
  tall: {
    rows: [[2], [1]],
    lhs: ['2x', 'x'],
    rank: 1,
    nullity: 0,
    nul: { kind: 'zero' },
    col: { kind: 'line', dir: [2, 1] },
    solve: (b) => [b[1]],
    start: [4, 3],
    still: [4, 2],
    Pic: PlaneDuo,
    pic: { O: [190, 176], nulLabel: [190, 210, 'middle'], colLabel: [528, 56, 'end'] },
  },
  // always a plane: x + y + z = b
  wide: {
    rows: [[1, 1, 1]],
    lhs: ['x+y+z'],
    rank: 1,
    nullity: 2,
    nul: { kind: 'plane' },
    col: { kind: 'all' },
    height: (b) => b[0] / Math.sqrt(3), // x₀ = (b/3)(1, 1, 1)
    start: [2],
    Pic: PlanesDuo,
    pic: { strip: { unit: 78, O: [W / 2, 44] } },
  },
};

const NA = <Tex tex={r`\textcolor{${GREEN}}{N(A)}`} />;
const SAYS = {
  zero: <>one point</>,
  line: <>a line parallel to {NA}</>,
  plane: <>a plane parallel to {NA}</>,
};

const count = (k, one, many, cls) => (
  <span className={cls}>
    {k} {k === 1 ? one : many}
  </span>
);

/** The system, its right-hand sides b's coordinates (to one decimal), in b's colour. */
function systemTex(ex, b) {
  const eqs = ex.lhs.map((l, i) => r`${l}&=\textcolor{${LEAF}}{${fmt(b[i])}}`);
  const body = r`\begin{aligned}${eqs.join(r`\\ `)}\end{aligned}`;
  return eqs.length > 1 ? r`\left\{${body}\right.` : body;
}

/** b as drawn: on C(A) when within SNAP of it (a line), and whether it is in C(A); `round`: to one decimal (a drag). */
function settle(col, p, round) {
  const q = round ? p.map(round1) : p;
  if (col.kind !== 'line') return { b: q, on: true };
  const k = dot(q, col.dir) / dot(col.dir, col.dir);
  if (norm(minus(q, times(k, col.dir))) < SNAP) return { b: times(round ? round1(k) : k, col.dir), on: true };
  return { b: q, on: false };
}

/**
 * One example, a column of the slide (`at`: the key press it comes on; 0: on arrival): the numbers
 * of equations and unknowns, A and the system, rank and nullity, the picture with b to drag, and
 * under it "No solution" or the button "All solutions" and, once clicked, what they are.
 */
export function SolveDuo({ ex, at = 0 }) {
  const [raw, setRaw] = useState(PRINT ? ex.still ?? ex.start : ex.start);
  const [shown, setShown] = useState(PRINT);
  const { b, on } = settle(ex.col, raw, false);
  const { Pic } = ex;

  // a drag: b goes where its solution stays in the picture; at the edge of that, it slides along it
  // (one coordinate at a time)
  const fits = (p) => {
    const st = settle(ex.col, p, true);
    return !st.on || !ex.solve || Pic.fits(ex, ex.solve(st.b));
  };
  const onB = (p) =>
    setRaw((was) => {
      const q = [p, ...(p.length === 2 ? [[p[0], was[1]], [was[0], p[1]]] : [])].find(fits);
      return q ? settle(ex.col, q, true).b : was;
    });

  const body = (
    <div className="l22-duo-body">
      <p className="l22-sys-head l22-duo-head">
        {count(ex.rows.length, 'equation', 'equations', 'l22-sys-m')}, {count(ex.rows[0].length, 'unknown', 'unknowns', 'l22-sys-n')}
      </p>
      <div className="l22-duo-top">
        <Tex tex={`A=${mat(ex.rows)}`} />
        <span className="l22-duo-sys">
          <Tex tex={systemTex(ex, b)} />
        </span>
      </div>
      <p className="l22-duo-rn">
        <RankNullity rank={ex.rank} nullity={ex.nullity} />
      </p>
      <Pic ex={ex} b={b} on={on} shown={shown} onB={PRINT ? undefined : onB} />
      <p className="l22-duo-says">
        {on ? (
          <>
            {/* it lets go of the focus, so that the presenter's keys go back to reveal.js */}
            <button
              type="button"
              className={`l22-duo-btn${shown ? ' on' : ''}`}
              aria-pressed={shown}
              onClick={(e) => {
                setShown((v) => !v);
                e.currentTarget.blur();
              }}
            >
              All solutions
            </button>
            {shown && <span className="l22-duo-what">{SAYS[ex.nul.kind]}</span>}
          </>
        ) : (
          <span className="l18-not">No solution</span>
        )}
      </p>
    </div>
  );
  return at ? (
    <Fragment index={at} className="l22-duo-col">
      {body}
    </Fragment>
  ) : (
    <div className="l22-duo-col">{body}</div>
  );
}
