import { useRef, useState } from 'react';
import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import { Arrow } from './Plane.jsx';
import Space, { Arrow3, Dot3, Patch3 } from './Space.jsx';
import { useOnce, phaseOnce } from './ImageCards.jsx';
import { useFragmentShown } from './useFragmentTween.js';
import { fmt } from './Slider.jsx';
import { MAIN, MATH, I } from './svgmath.jsx';
import { PRINT } from './print.js';
import { INK, GREEN, BLUE, TEAL, LEAF, GRAY, dot, minus, times, norm, mul, lerp, clamp01 } from './ls.js';

/**
 * How many solutions?, the examples (the user's request: a better class of examples, showing all
 * that can happen, with b varying). Four systems, one for each kind of matrix:
 *
 *                      N(A) = {0}                       N(A) ≠ {0}
 *   C(A) = ℝᵐ    [1 1; 0 1]: always one solution   [1 1 1]: always a plane of solutions
 *   C(A) ≠ ℝᵐ    [2; 1]: none, or one              [2 4; 1 2]: none, or a line
 *
 * Each example (`SolveDuo`) is a system Ax = b whose right-hand sides are b's coordinates, over ONE
 * picture (the user's request: first two, the inputs beside the outputs): N(A) green, C(A) teal,
 * and b on top, an arrow to drag (the user explores: nothing moves on a key press). As b moves, the
 * right-hand sides follow. (Each equation's solutions, a thin gray line that followed b, were in the
 * picture too: removed at the user's request, who asked what they meant.) Off C(A): "No
 * solution". Once b is in C(A) (close to a line C(A), it lands on it), a small button, "All
 * solutions": a click shows them, blue, N(A) moved to a solution x₀, and what they are; they then
 * follow b; another click hides them.
 * The picture is built up on key presses (the user's request: "let animation of T_A, C(A), rank = ?,
 * N(A), nullity = ?, then b appear one by one"), STEP, counted from the one the example's column
 * comes on: the picture, with T_A played once as on Image (the inputs, a grid, a number line or a
 * cube, move onto their outputs); C(A), as the moved inputs fade; rank = …; b, and, under the
 * picture, "No solution" or the button (the user's request: "show b after C(A)
 * and rank 1"; first last); N(A), and with it what the solutions are, if they are shown (it names
 * N(A)); nullity = …. Each is a fragment (those in the picture: groups of its SVG), so that print
 * shows a still per key press.
 * Print: the inputs moved, b at a place with solutions (`still`), the solutions shown.
 * [2 4; 1 2] alone (`lines`) has a second picture beside the first, `LinesPic` (the user's request:
 * "the solution is a bit confusing here, maybe separate it to another applet besides the current one;
 * in that applet draw two lines labelled 2x+4y=* and x+2y=? that moves with b"): the plane of the
 * unknowns, each equation's line labelled with the equation; it comes on a key press of its own,
 * right after b's (the user's request; first with b), and follows b; the solutions are drawn there,
 * not in the first picture, and the system is over it. This example has no button
 * (the user's request: "remove the "All solutions" button; put the No solution/solution! on the
 * left, it should appear when b appears"): under the first picture, with b, "No solution" or
 * "Solution!"; in the second, the solutions are drawn whenever b is in C(A), and what they are is
 * under it once N(A) has come. A last key press (the user's request: "add another key press, that
 * displays x_0 + n on the right applet, where n can be moved") shows a solution as x₀ + n in the
 * second picture: n, green, from x₀'s tip along the solutions, and x₀ + n, blue, from 0; n is
 * dragged: 8 key presses.
 * No circle at b's arrowhead (the user's request; first a breathing ring, as on Solving Ax = b).
 * [1 1; 0 1] (`any`) has no button either (the user's request: "remove the "All solutions" button.
 * Simply say "There is a solution for any b"; then along with nullity = 0, "There is a unique
 * solution for any b""): under its picture, with b, the first sentence; with the nullity, the
 * second in its place. Its solution is not drawn, and b goes anywhere in the picture.
 * [2; 1] (`verdict`) has no button either (the user's request: "do the Solution!/No solution instead
 * of "All solution""): under its picture, with b, "No solution" or "Solution!", as under [2 4; 1 2]'s
 * first picture. Its solution is not drawn, and b goes anywhere in the picture.
 * [1 1 1] (`space`) has no button either (the user's request: "instead of "All solutions" say
 * "2-dimensional space of solutions", which appear on key press after N(A) along with the solution
 * space"): a key press of its own, right after N(A)'s, brings the solutions (the plane through x₀)
 * and, under the picture, "2-dimensional space of solutions" (the number: the nullity, which comes
 * on the next key press): 7 key presses.
 * (So no example has the button any more; it is kept, for an example with none of `lines`, `any`,
 * `verdict`, `space`.)
 */

// An example's key presses, counted from the one its column comes on
const STEP = { map: 1, col: 2, rank: 3, b: 4, nul: 5, nullity: 6 };
/** How many key presses an example (of one picture) takes after its column has come. */
export const DUO_STEPS = STEP.nullity;

/**
 * The key presses (fragment indexes) of the example `ex`, whose column comes on `at`: STEP after it.
 * With a second picture (`ex.lines`), that picture has a key press of its own, `lines`, right after
 * b's (the user's request: "let the two lines applet show on key press, after b"), and N(A) and the
 * nullity come one later; then `sum`, a last key press: x₀ + n in the second picture.
 * With `ex.space`, the solutions have a key press of their own, `space`, right after N(A)'s (the
 * user's request), and the nullity comes one later. `sol`: the key press the solutions can be drawn
 * from in the picture: `space`, or b's (with the button).
 */
function keys(ex, at) {
  const step = {};
  for (const [name, n] of Object.entries(STEP)) step[name] = at + n + (ex.lines && n > STEP.b ? 1 : 0) + (ex.space && n > STEP.nul ? 1 : 0);
  step.lines = step.b + 1;
  step.sum = step.nullity + 1;
  step.space = step.nul + 1;
  step.sol = ex.space ? step.space : step.b;
  return step;
}

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

/** The numbers s for which `at` + s `d` is in the picture, `mx` and `my` pixels inside its edges: [lo, hi] (none if lo > hi). */
function reach(g, at, d, mx, my) {
  let lo = -Infinity;
  let hi = Infinity;
  const a = [g.px(at[0]), g.py(at[1])];
  const v = [g.U * d[0], -g.U * d[1]];
  for (const [size, m, i] of [
    [W, mx, 0],
    [H, my, 1],
  ]) {
    if (Math.abs(v[i]) > 1e-9) {
      const t1 = (m - a[i]) / v[i];
      const t2 = (size - m - a[i]) / v[i];
      lo = Math.max(lo, Math.min(t1, t2));
      hi = Math.min(hi, Math.max(t1, t2));
    }
  }
  return [lo, hi];
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

const GRID = '#9fb2c8'; // the inputs' grid, as on Image (ImageCards.jsx)
const INPUT = '#7d8ea3'; // the inputs' number line and its whole numbers, the cube
const KX = 14; // the inputs' grid runs over [−KX, KX] × [−KY, KY], beyond the picture, so that its outputs fill it too
const KY = 6;

/**
 * T_A's inputs in a picture of ℝ², each point p at (1 − t)p + tAp (t = 1: the outputs): for two
 * unknowns the square grid; for one, the number line (the horizontal axis) with its whole numbers.
 */
function Inputs({ g, M, t }) {
  const n = M[0].length;
  const go = (p) => lerp(n === 1 ? [p[0], 0] : p, mul(M, p), t);
  const seg = (a, b, key, props) => {
    const [x1, y1] = go(a);
    const [x2, y2] = go(b);
    return <line key={key} x1={g.px(x1).toFixed(1)} y1={g.py(y1).toFixed(1)} x2={g.px(x2).toFixed(1)} y2={g.py(y2).toFixed(1)} {...props} />;
  };
  if (n === 1) {
    return (
      <g>
        {seg([-KX], [KX], 'line', { stroke: INPUT, strokeWidth: 2.4 })}
        {Array.from({ length: 2 * KX + 1 }, (_, i) => {
          const [x, y] = go([i - KX]);
          return <circle key={i} cx={g.px(x).toFixed(1)} cy={g.py(y).toFixed(1)} r="3.2" fill={INPUT} />;
        })}
      </g>
    );
  }
  const lines = [];
  for (let k = -KX; k <= KX; k += 1) lines.push(seg([k, -KY], [k, KY], `v${k}`));
  for (let k = -KY; k <= KY; k += 1) lines.push(seg([-KX, k], [KX, k], `h${k}`));
  return (
    <g stroke={GRID} strokeWidth="1.2">
      {lines}
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
 * or all of the plane, tinted), N(A) (green: a line through 0, or the point 0), and b on top, to
 * drag. With `shown` and b ∈ C(A) (`on`): the solutions, blue (N(A) moved to a solution x₀).
 * With one unknown (a matrix of one column), the unknown's number line is the horizontal axis: N(A)
 * the point 0, the solution a blue point on it.
 * `step`: the key presses the picture's parts come on (`keys`); `t`: T_A's animation, the inputs at
 * (1 − t)p + tAp.
 */
function PlaneDuo({ ex, b, on, shown, onB, step, t }) {
  const g = geo(ex.pic);
  const n = ex.rows[0].length;
  const all = ex.col.kind === 'all';
  const line = ex.nul.kind === 'line';
  const x0 = on && shown ? ex.solve(b) : null;
  const tip = x0 && [g.px(x0[0]), g.py(n === 1 ? 0 : x0[1])];
  const sols = x0 && line ? clip(g, x0, ex.nul.dir) : null;
  // "solutions", over the left end of their line (not above the picture)
  const word = sols && (sols[1] >= 30 ? [sols[0], sols[1]] : [sols[0] + ((30 - sols[1]) * (sols[2] - sols[0])) / (sols[3] - sols[1]), 30]);
  const [nx, ny, na] = ex.pic.nulLabel;
  const [cx, cy, ca] = ex.pic.colLabel;
  const bt = [g.px(b[0]), g.py(b[1])];
  const len = Math.hypot(bt[0] - g.O[0], bt[1] - g.O[1]);
  const u = len > 6 ? [(bt[0] - g.O[0]) / len, (bt[1] - g.O[1]) / len] : [0.7, -0.7];
  return (
    <svg className="figure-svg l22-duo-pic" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="N(A), C(A) and the vector b, to drag">
      {/* (a fragment's own opacity is reveal's: hence fillOpacity) */}
      {all && <Fragment as="rect" index={step.col} x="0" y="0" width={W} height={H} fill={TEAL} fillOpacity="0.13" />}
      <Axes g={g} />
      {/* T_A: the inputs move onto their outputs; they fade as C(A) comes */}
      <Fragment as="g" index={step.col} effect="fade-out">
        <Inputs g={g} M={ex.rows} t={t} />
      </Fragment>
      {!all && (
        <Fragment as="g" index={step.col}>
          <Line g={g} d={ex.col.dir} color={TEAL} width={6} opacity={0.6} />
        </Fragment>
      )}
      <Fragment as="g" index={step.nul}>
        {line ? <Line g={g} d={ex.nul.dir} color={GREEN} width={3.5} /> : <circle cx={g.O[0]} cy={g.O[1]} r="6.5" fill={GREEN} />}
      </Fragment>
      <circle cx={g.O[0]} cy={g.O[1]} r="2.6" fill={INK} />
      {/* b, on top, with, once asked for, the solutions; b is dragged from anywhere on the picture (the
          clear rectangle), once it is there. (Each equation's solutions were drawn here too, thin and
          gray: for two unknowns the line through (b[i] / row·row) row along (−row[1], row[0]); for
          one, a tick at b[i] / row[0] on the axis. Removed at the user's request.) */}
      <Fragment as="g" index={step.b} className={onB ? 'l22-grab' : ''} {...dragging(onB, (x, y) => [(x - g.O[0]) / g.U, (g.O[1] - y) / g.U])}>
        <rect x="0" y="0" width={W} height={H} fill="transparent" />
        {x0 && (
          <g>
            {line && <Line g={g} at={x0} d={ex.nul.dir} color={BLUE} width={3.5} />}
            <Arrow p={g} to={n === 1 ? [x0[0], 0] : x0} color={INK} width={2.6} head={11} />
            <circle cx={tip[0]} cy={tip[1]} r={line ? 4.5 : 6.5} fill={line ? INK : BLUE} />
          </g>
        )}
        <circle cx={g.O[0]} cy={g.O[1]} r="2.6" fill={INK} />
        <Arrow p={g} to={b} color={LEAF} width={3.2} head={12} />
      </Fragment>
      {/* the labels last, their halos over the lines (a drag goes through them) */}
      <g pointerEvents="none">
        <Fragment as="g" index={step.nul}>
          <NLabel x={nx} y={ny} anchor={na} />
        </Fragment>
        <Fragment as="g" index={step.col}>
          <CLabel x={cx} y={cy} anchor={ca} all={all ? 2 : undefined} />
        </Fragment>
        <Fragment as="g" index={step.b}>
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
                  word && (
                    <text {...WORD} x={word[0] + 6} y={word[1] - 9} fill={BLUE}>
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
        </Fragment>
      </g>
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

const EQ = '#55627a'; // each equation's line, in the second picture

/** An equation as an SVG label: its left-hand side (the coefficients `row`) = `value`, in b's colour. */
const EqLabel = ({ row, value, x, y, anchor }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize="20" fontFamily={MAIN} fill={INK} {...HALO}>
    {row.map((c, j) => (
      <tspan key={j}>
        {j > 0 && ' + '}
        {c !== 1 && c}
        <I>{'xyz'[j]}</I>
      </tspan>
    ))}
    {' = '}
    <tspan fill={LEAF}>{fmt(value).replace('-', '−')}</tspan>
  </text>
);

/** The point of the segment `s` ([x1, y1, x2, y2], pixels) at the height `y`, or its nearer end. */
const along = (s, y) => {
  const k = Math.abs(s[3] - s[1]) < 1e-6 ? 0 : clamp01((y - s[1]) / (s[3] - s[1]));
  return [s[0] + k * (s[2] - s[0]), s[1] + k * (s[3] - s[1])];
};

/**
 * The second picture of an example of two equations in two unknowns (`ex.lines`; the user's request:
 * the solutions in another applet beside the first): the plane of the unknowns, at the first
 * picture's scale, with each equation's solutions, a line labelled with the equation. The lines
 * follow b, dragged in the first picture (its coordinates are the right-hand sides): off C(A) they
 * are parallel; with b ∈ C(A) (`on`) they are one line, drawn blue, the solutions, through a
 * solution x₀ (no button to ask for them: the user's request).
 * On the key press `step.sum` (the user's request), a solution as x₀ + n: n = s · (N(A)'s direction),
 * a green arrow from x₀'s tip along the solutions, and x₀ + n, a blue arrow from 0. n is dragged
 * from anywhere on the picture (x₀ + n goes to the point of the line nearest the pointer, and stays
 * in the picture with room for its label); it starts at `ex.n` · (N(A)'s direction).
 * x₀'s and n's labels are on the side of the line away from 0, clear of the three arrows; x₀ + n's is
 * past its tip, away from x₀.
 * The labels (for lines going down to the right): the upper line's over it near its left end, the
 * lower line's under it near its right end, so that neither is between the lines, where the other
 * line would cross it, and they stay apart when the lines are one (then the first equation's is over).
 */
function LinesPic({ ex, b, on, step }) {
  const g = geo(ex.pic);
  const d = ex.nul.dir;
  const [raw, setRaw] = useState(ex.n); // n = raw · d
  const x0 = on ? ex.solve(b) : null;
  const tip = x0 && [g.px(x0[0]), g.py(x0[1])];
  // x₀ + n stays in the picture, with room for its label
  const [lo, hi] = x0 ? reach(g, x0, d, 70, 36) : [0, -1];
  const s = lo > hi ? 0 : clamp(raw, lo, hi);
  const sum = x0 && [x0[0] + s * d[0], x0[1] + s * d[1]];
  const end = sum && [g.px(sum[0]), g.py(sum[1])];
  // (always there, and its group's class always the same: a class that changed would lose reveal's
  // `visible`, and the group would hide)
  const onN = PRINT ? undefined : (p) => x0 && setRaw(clamp(round1(dot(minus(p, x0), d) / dot(d, d)), lo, hi));
  // the side of the solutions' line away from 0, a unit vector in pixels: along the first row, or against it
  const row = ex.rows[0];
  const side = x0 && dot(x0, row) < 0 ? -1 : 1;
  const out = [(side * row[0]) / norm(row), (-side * row[1]) / norm(row)];
  const long = end && Math.hypot(end[0] - tip[0], end[1] - tip[1]) > 44; // room for n's label
  // x₀ + n's label: past its tip, away from x₀; with n short, beside x₀'s label, not on it
  const past = end && (s < 0 ? end[0] - 9 : end[0] + 9);
  const sumX = end && (s < 0 ? (side < 0 ? Math.min(past, tip[0] - 36) : past) : side > 0 ? Math.max(past, tip[0] + 36) : past);
  const segs = ex.rows.map((row, i) => clip(g, times(b[i] / dot(row, row), row), [-row[1], row[0]]));
  // which line is the upper one: how far each is from 0 along the first row
  const far = ex.rows.map((row, i) => (b[i] / dot(row, row)) * dot(row, ex.rows[0]));
  const up = far[1] > far[0] ? 1 : 0;
  const over = segs[up] && along(segs[up], Math.max(segs[up][1], 31));
  const under = segs[1 - up] && along(segs[1 - up], Math.min(segs[1 - up][3], H - 34));
  return (
    <svg className="figure-svg l22-duo-pic" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Each equation's line in the plane of the unknowns; the lines follow b">
      <Axes g={g} />
      {segs.map((sg, i) => sg && <line key={i} x1={sg[0]} y1={sg[1]} x2={sg[2]} y2={sg[3]} stroke={EQ} strokeWidth="2.4" strokeLinecap="round" />)}
      {x0 && (
        <g>
          <Line g={g} at={x0} d={ex.nul.dir} color={BLUE} width={3.8} />
          <Arrow p={g} to={x0} color={INK} width={2.6} head={11} />
          <circle cx={tip[0]} cy={tip[1]} r="4.5" fill={INK} />
        </g>
      )}
      <circle cx={g.O[0]} cy={g.O[1]} r="2.6" fill={INK} />
      {over && <EqLabel row={ex.rows[up]} value={b[up]} x={over[0] + 10} y={over[1] - 9} anchor="start" />}
      {under && <EqLabel row={ex.rows[1 - up]} value={b[1 - up]} x={under[0] - 10} y={under[1] + 25} anchor="end" />}
      {x0 && (side > 0 ? <X0 x={tip[0] + 7} y={tip[1] - 10} /> : <X0 x={tip[0] - 7} y={tip[1] + 22} anchor="end" />)}
      {/* x₀ + n, the last key press: n is dragged from anywhere on the picture (the clear rectangle),
          once it is there */}
      <Fragment as="g" index={step.sum} className={onN ? 'l22-grab' : ''} style={x0 ? undefined : { cursor: 'default' }} {...dragging(onN, (x, y) => [(x - g.O[0]) / g.U, (g.O[1] - y) / g.U])}>
        <rect x="0" y="0" width={W} height={H} fill="transparent" />
        {x0 && (
          <g>
            <Arrow p={g} to={sum} color={BLUE} width={3} head={12} />
            <Arrow p={g} from={x0} to={sum} color={GREEN} width={3.4} head={12} />
            <circle cx={tip[0]} cy={tip[1]} r="4.5" fill={INK} />
            {long && (
              <text x={(tip[0] + end[0]) / 2 + 15 * out[0]} y={(tip[1] + end[1]) / 2 + 15 * out[1] + 6} textAnchor="middle" fontSize="20" fontFamily={MAIN} fontWeight="700" fill={GREEN} {...HALO}>
                n
              </text>
            )}
            <text x={sumX} y={end[1] + (s < 0 ? 23 : -9)} textAnchor={s < 0 ? 'end' : 'start'} fontSize="20" fontFamily={MAIN} fontWeight="700" fill={INK} {...HALO}>
              x
              <tspan baselineShift="sub" fontSize="0.7em">
                0
              </tspan>
              <tspan fontWeight="400">{' + '}</tspan>
              <tspan fill={GREEN}>n</tspan>
            </text>
          </g>
        )}
      </Fragment>
    </svg>
  );
}

const Q = 2.2; // the planes' patches: squares of side 2Q
const square = (z, q = Q) => [
  [-q, -q, z],
  [q, -q, z],
  [q, q, z],
  [-q, q, z],
];
const STRIP = 84; // the height of b's number line, across the top
// T_A's inputs: a cube of half side C3, level with N(A); its slices at the heights k/√3 go to the
// whole numbers k = −2, …, 2
const C3 = 2 / Math.sqrt(3);
const SLICES = [-2, -1, 0, 1, 2].map((k) => k / Math.sqrt(3));

/** The inputs' cube: its upright edges and its level slices (at the heights `slices`), each point p drawn at `move(p)` (pixels). */
function Cube({ move, slices, fill = 'none', width = 1.6 }) {
  const foot = square(-C3, C3).map(move);
  const top = square(C3, C3).map(move);
  return (
    <g stroke={INPUT} strokeLinecap="round" strokeLinejoin="round">
      {foot.map((a, i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={top[i][0]} y2={top[i][1]} strokeWidth={width} />
      ))}
      {slices.map((z) => (
        <polygon
          key={z}
          points={square(z, C3)
            .map((p) => move(p).map((v) => v.toFixed(1)).join(','))
            .join(' ')}
          fill={fill}
          fillOpacity="0.3"
          strokeWidth="1.4"
        />
      ))}
    </g>
  );
}

/**
 * One equation in ℝ³, N(A) a plane: drawn as a floor through 0 (the picture is turned so that it is
 * level: no axes); with `shown`, the solutions, the parallel plane through x₀, at height
 * b / `ex.scale` above it. On top, b's number line, all of it C(A): b is dragged along it (dragging
 * the planes turns the view).
 * T_A (`t`): a cube of inputs, level with N(A), moves up onto the number line, each point at height
 * z to the number `ex.scale` · z, so that each level slice ends as one point; a faint copy stays
 * where it was until N(A) comes. `step`: as in PlaneDuo.
 */
function PlanesDuo({ ex, b, shown, onB, step, t }) {
  const h = b[0] / ex.scale;
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
        // T_A: a point at height z over N(A) goes to the number scale · z, on the line across the top
        const go = (p) => lerp(s.P(p), [g.px(ex.scale * p[2]), y], t);
        return (
          <g>
            {/* where the inputs were, faint, until N(A) comes */}
            <Fragment as="g" index={step.nul} effect="fade-out">
              <g opacity={0.45 * clamp01(4 * t)}>
                <Cube move={s.P} slices={[-C3, C3]} />
              </g>
            </Fragment>
            <Fragment as="g" index={step.nul}>
              <Patch3 s={s} corners={square(0)} fill={GREEN} opacity={0.22} stroke={GREEN} strokeOpacity={0.8} />
            </Fragment>
            <Dot3 s={s} at={[0, 0, 0]} color={INK} r={3} />
            <Fragment as="g" index={step.sol}>
              {shown && (
                <g>
                  <Patch3 s={s} corners={square(h)} fill={BLUE} opacity={0.22} stroke={BLUE} strokeOpacity={0.8} />
                  <Arrow3 s={s} to={[0, 0, h]} color={INK} width={2.6} head={11} />
                  <Dot3 s={s} at={[0, 0, h]} color={INK} r={4.5} />
                </g>
              )}
            </Fragment>
            <Fragment as="g" index={step.nul}>
              <NLabel x={left[0] - 5} y={left[1] + 7} anchor="end" />
            </Fragment>
            <Fragment as="g" index={step.sol}>
              {shown && (
                <g>
                  <X0 x={tip[0] + 10} y={tip[1] + (h < 0 ? 22 : -10)} />
                  <text {...WORD} x={corner[0]} y={sy} textAnchor="middle" fill={BLUE}>
                    solutions
                  </text>
                </g>
              )}
            </Fragment>
            {/* on top, the outputs' number line: all of it C(A) */}
            <Fragment as="g" index={step.col}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={TEAL} strokeWidth="8" strokeLinecap="round" opacity="0.5" />
            </Fragment>
            <Axes g={g} y={false} />
            <circle cx={g.O[0]} cy={y} r="2.6" fill={INK} />
            {/* T_A: the cube moves onto it, each slice to one number; it fades as C(A) comes */}
            <Fragment as="g" index={step.col} effect="fade-out">
              <Cube move={go} slices={SLICES} fill="#b9c7dc" width={1.6 + 0.8 * t} />
              {SLICES.map((z) => {
                const [cx, cy] = go([0, 0, z]);
                return <circle key={z} cx={cx} cy={cy} r="3.2" fill={INPUT} opacity={t} />;
              })}
            </Fragment>
            <Fragment as="g" index={step.col}>
              <CLabel x={W - 12} y={y + 30} anchor="end" all={1} />
            </Fragment>
            {/* b, dragged along its line, once it is there */}
            <Fragment as="g" index={step.b} className={onB ? 'l22-grab' : ''} {...dragging(onB, (x) => [(x - g.O[0]) / g.U])}>
              <rect x="0" y="0" width={W} height={STRIP} fill="transparent" />
              <Arrow p={g} to={[b[0], 0]} color={LEAF} width={3.2} head={12} />
              <BLabel x={bx} y={y - 19} />
            </Fragment>
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
 * C(A) ('zero', 'line' along `dir`, 'plane', 'all'); `solve(b)`, a solution x₀ for b ∈ C(A) (PlanesDuo:
 * `scale`, T_A of a point at height 1 over N(A)); `start`,
 * where b is at first, and `still`, where it is in print (in C(A)); `Pic`, its picture, with its
 * origin and labels' places (`pic`); `lines`: it has a second picture, LinesPic (the equations' lines
 * and the solutions), and `n`: x₀ + n's n there, at first (times N(A)'s direction); `any`: no button
 * and no solution drawn: under the picture, "There is a solution for any b", then "a unique solution";
 * `verdict`: no button and no solution drawn: under the picture, "No solution" or "Solution!";
 * `space`: no button: the solutions come on a key press of their own after N(A)'s, with, under the
 * picture, "2-dimensional space of solutions" (the nullity).
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
    lines: true, // the user's request, for this example only
    n: 2, // the last key press's n, at first: 2 · (2, −1)
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
    any: true, // the user's request, for this example
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
    verdict: true, // the user's request, for this example
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
    scale: Math.sqrt(3), // x₀ = (b/3)(1, 1, 1), at height b/√3 over N(A)
    start: [2],
    space: true, // the user's request, for this example
    Pic: PlanesDuo,
    pic: { strip: { unit: 78, O: [W / 2, 44] } },
  },
};

const NA = <Tex tex={r`\textcolor{${GREEN}}{N(A)}`} />;
const ANY_B = <Tex tex={r`\textcolor{${LEAF}}{\vv b}`} />;
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
 * of equations and unknowns, A and the system; then, a key press each (STEP): the picture, T_A
 * played once in it; C(A); rank; b, to drag, and under the picture "No solution" or the button "All
 * solutions"; N(A), and, once the button is clicked, what the solutions are; nullity.
 * With `ex.lines`, two columns: A, rank, nullity, the picture and, under it, with b, "No solution" or
 * "Solution!" (no button); beside them the system, the second picture (LinesPic, on a key press of
 * its own after b's), where the solutions are drawn whenever b is in C(A), and, under it, with N(A),
 * what they are; on a last key press, x₀ + n in the second picture, n to drag.
 * With `ex.any`, no button: under the picture, with b, "There is a solution for any b", and, with the
 * nullity, "There is a unique solution for any b" in its place.
 * With `ex.verdict`, no button: under the picture, with b, "No solution" or "Solution!".
 * With `ex.space`, no button: a key press after N(A)'s brings the solutions in the picture and, under
 * it, "2-dimensional space of solutions"; then the nullity.
 */
export function SolveDuo({ ex, at = 0 }) {
  const [raw, setRaw] = useState(PRINT ? ex.still ?? ex.start : ex.start);
  const [shown, setShown] = useState(PRINT);
  // T_A's animation: once, from the key press that brings the picture (again if it is undone and redone)
  const mark = useRef(null);
  const [sec] = useOnce(useFragmentShown(mark), mark);
  const { t } = phaseOnce(sec);
  const { b, on } = settle(ex.col, raw, false);
  const { Pic } = ex;
  const step = keys(ex, at);

  // a drag: b goes where its solution stays in the picture; at the edge of that, it slides along it
  // (one coordinate at a time); anywhere, if the solution is not drawn (`any`, `verdict`)
  const fits = (p) => {
    const st = settle(ex.col, p, true);
    return !st.on || !ex.solve || ex.any || ex.verdict || Pic.fits(ex, ex.solve(st.b));
  };
  const onB = (p) =>
    setRaw((was) => {
      const q = [p, ...(p.length === 2 ? [[p[0], was[1]], [was[0], p[1]]] : [])].find(fits);
      return q ? settle(ex.col, q, true).b : was;
    });

  const head = (
    <p className="l22-sys-head l22-duo-head">
      {count(ex.rows.length, 'equation', 'equations', 'l22-sys-m')}, {count(ex.rows[0].length, 'unknown', 'unknowns', 'l22-sys-n')}
    </p>
  );
  const matrix = <Tex tex={`A=${mat(ex.rows)}`} />;
  const system = (
    <span className="l22-duo-sys">
      <Tex tex={systemTex(ex, b)} />
    </span>
  );
  const rn = (
    <p className="l22-duo-rn">
      <Fragment as="span" index={step.rank} className="l22-rn-rank">
        rank = <Tex tex={String(ex.rank)} />
      </Fragment>
      <Fragment as="span" index={step.nullity}>
        ,{' '}
        <span className="l22-rn-null">
          nullity = <Tex tex={String(ex.nullity)} />
        </span>
      </Fragment>
    </p>
  );
  // the picture with b (with `ex.lines`, the solutions are not in it: they are in the second picture)
  const pic = (
    <>
      <span ref={mark} className="fragment fx-marker" data-fragment-index={step.map} aria-hidden="true" />
      <Fragment index={step.map}>
        <Pic ex={ex} b={b} on={on} shown={ex.space || (shown && !ex.lines && !ex.any && !ex.verdict)} onB={PRINT ? undefined : onB} step={step} t={t} />
      </Fragment>
    </>
  );
  // what the solutions are names N(A): it waits for N(A) (the span is always there: a fragment that
  // came after its key press would stay hidden); with a second picture they are always shown
  const what = (
    <Fragment as="span" index={step.nul} className="l22-duo-what">
      {on && (shown || ex.lines) && SAYS[ex.nul.kind]}
    </Fragment>
  );
  const says = ex.lines || ex.verdict ? (
    // no button (the user's request): with b, under its picture, "No solution" or "Solution!"
    <Fragment as="p" index={step.b} className="l22-duo-says">
      {on ? <span className="l22-duo-yes">Solution!</span> : <span className="l18-not">No solution</span>}
    </Fragment>
  ) : ex.space ? (
    // no button (the user's request): on the solutions' key press, after N(A)'s, how many there are
    <Fragment as="p" index={step.space} className="l22-duo-says">
      <span className="l22-duo-what">{ex.nullity}-dimensional space of solutions</span>
    </Fragment>
  ) : ex.any ? (
    // no button (the user's request): with b, "There is a solution for any b"; with the nullity, "a
    // unique solution", in its place (two sentences in one cell: a hidden word would leave a gap)
    <Fragment as="p" index={step.b} className="l22-duo-says">
      <span className="l22-duo-swap">
        <Fragment as="span" index={step.nullity} effect="fade-out">
          There is a solution for any {ANY_B}
        </Fragment>
        <Fragment as="span" index={step.nullity}>
          There is a <b>unique</b> solution for any {ANY_B}
        </Fragment>
      </span>
    </Fragment>
  ) : (
    <Fragment as="p" index={step.b} className="l22-duo-says">
      {on ? (
        // it lets go of the focus, so that the presenter's keys go back to reveal.js
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
      ) : (
        <span className="l18-not">No solution</span>
      )}
      {what}
    </Fragment>
  );
  const body = ex.lines ? (
    // two pictures side by side: a grid of 5 rows filled a column at a time, so that the pictures line
    // up: A, rank and nullity over the first, "No solution" or "Solution!" under it; the system over
    // the second, what the solutions are under it
    <div className="l22-duo-wide">
      {head}
      <div className="l22-duo-top">{matrix}</div>
      {rn}
      <div>{pic}</div>
      {says}
      <span />
      <div className="l22-duo-top">{system}</div>
      <span />
      <Fragment index={step.lines}>
        <LinesPic ex={ex} b={b} on={on} step={step} />
      </Fragment>
      <p className="l22-duo-says">{what}</p>
    </div>
  ) : (
    <div className="l22-duo-body">
      {head}
      <div className="l22-duo-top">
        {matrix}
        {system}
      </div>
      {rn}
      {pic}
      {says}
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
