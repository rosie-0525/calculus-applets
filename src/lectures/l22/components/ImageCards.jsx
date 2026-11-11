import { useEffect, useRef, useState } from 'react';
import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import { Arrow } from './Plane.jsx';
import Space, { Arrow3, Seg3, Dot3, Patch3 } from './Space.jsx';
import CubeMap from './CubeMap.jsx';
import { useFragmentShown } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { MAIN, MATH } from './svgmath.jsx';
import { INK, LEAF, TEAL, GREEN, COLS, mul, cross, dot, minus, lerp, ease, clamp01, times, plus, unit } from './ls.js';

/**
 * The examples of Image, Null space and The rank–nullity theorem: one set of linear transformations
 * T_A, by ℝⁿ → ℝᵐ from ℝ¹ → ℝ¹ up to ℝ³ → ℝ³, played three times, once after each topic (the user's
 * request), in the same cards and the same order, each time with one thing more. A card is a matrix
 * beside its picture on a loop: the inputs move onto their outputs, each point p to (1 − t)p + tAp,
 * then the image lights up in teal. `run`:
 *  - 'image' (Image): the picture plays once, not on a loop (the user's request; a click on it plays
 *    it again): the inputs move, more slowly, then the image lights up with one pulse, labelled
 *    "image", and stays; on the next key press, after that word in the picture, what the image is
 *    ("image = {0}", "image = line through 0", "image = ℝ²"; the label at `img.said` if `img.label`
 *    has no room for it), and no list of answers beside the cards;
 *  - 'null' (Null space): the image, now labelled C(A), and N(A) in green among the inputs, which
 *    shrinks into 0 as they move (a dashed copy stays where it was, with its label); the answer: what
 *    N(A) is (the list of Image's answers backwards);
 *  - 'rn' (The rank–nullity theorem): the pictures of 'null'; the cards spread over the slide's width
 *    as in 'image' (ℝ³ → ℝ³: two by two), and on the key press after each card, under it,
 *    "rank = …, nullity = …" (the user's request; first a list of the answers beside the cards, on one
 *    key press after them all).
 * And a preview, before any of this is defined (Linear system in matrix form, its second slide;
 * LoopPic and SYSTEM_MAPS, run 'map'): the pictures alone, for the four systems' matrices, the image
 * lit up but not labelled, the arrows black (no colours for A's columns: the user's request) and
 * labelled e₁, e₂, …, which become Ae₁, Ae₂, … as they move, then the system's b, a green arrow (LEAF),
 * once the inputs have moved (`late`).
 */

// One loop of a card (seconds): the inputs fade in, wait, move onto their outputs, the image lights
// up and stays, then everything fades out and the loop starts again.
const IN = 0.4;
const WAIT = 1.1;
const MORPH = 1.9;
const HOLD = 3.2;
const OUT = 0.45;
const START = IN + WAIT;
const END = START + MORPH;
const LEAVE = END + HOLD;
const CYCLE = LEAVE + OUT;

/** t (0: the inputs, 1: the outputs), the moving parts' opacity, and the image's. */
export function phase(sec) {
  if (PRINT) return { t: 1, op: 1, glow: 1, late: 1 };
  const c = sec % CYCLE;
  const t = c < START ? 0 : c < END ? ease((c - START) / MORPH) : 1;
  const op = c < IN ? c / IN : c < LEAVE ? 1 : 1 - (c - LEAVE) / OUT;
  const glow = c < LEAVE ? clamp01((c - END + 0.15) / 0.5) : op;
  const late = c < LEAVE ? clamp01((c - END - 0.75) / 0.5) : op; // the system's b, after the image
  return { t, op, glow, late };
}

// Played once (run 'image'): the inputs wait, move onto their outputs more slowly than on a loop,
// then the image lights up with one pulse; nothing moves after DONE1.
const WAIT1 = 0.9;
const MORPH1 = 2.6;
const END1 = WAIT1 + MORPH1;
const PULSE1 = 1.1;
const DONE1 = END1 + PULSE1 + 0.3;
const smooth = (k) => k * k * k * (k * (6 * k - 15) + 10); // no jerk at either end

/** The same as `phase`, for a picture played once; `pulse` (0 → 1 → 0): the image's flash as it lights up. */
export function phaseOnce(sec) {
  if (PRINT) return { t: 1, op: 1, glow: 1, late: 1, pulse: 0 };
  const t = smooth(clamp01((sec - WAIT1) / MORPH1));
  const glow = clamp01((sec - END1 + 0.15) / 0.5);
  const pulse = Math.sin(Math.PI * clamp01((sec - END1) / PULSE1)) ** 2;
  return { t, op: 1, glow, late: glow, pulse };
}

/**
 * Seconds of a picture played once, counted from when `on` (the card shown) and only while the slide
 * is on screen, up to DONE1; and a function that plays it again.
 */
export function useOnce(on, ref, extra = 0) {
  const [sec, setSec] = useState(0);
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    if (!on || PRINT) {
      setSec(0);
      return undefined;
    }
    let frame;
    let last;
    let acc = 0;
    const step = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present')) {
        if (last !== undefined) acc += Math.min(0.1, (now - last) / 1000);
        last = now;
        setSec(acc);
      } else last = undefined;
      if (acc < DONE1 + extra) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [on, ref, turn, extra]);
  return [sec, () => setTurn((k) => k + 1)];
}

/**
 * Seconds of the loop, counted from when `on` (the card shown) and only while the slide is on
 * screen; the first loop starts with the inputs already in (no fade in after the fragment's).
 */
export function useCycle(on, ref) {
  const [sec, setSec] = useState(IN);
  useEffect(() => {
    if (!on || PRINT) {
      setSec(IN);
      return undefined;
    }
    let frame;
    let last;
    let acc = IN;
    const step = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present')) {
        if (last !== undefined) acc += Math.min(0.1, (now - last) / 1000);
        last = now;
        setSec(acc);
      } else last = undefined;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [on, ref]);
  return sec;
}

/** A matrix in TeX, column j in the colour of its arrow (COLS[j]). */
const matTex = (M) =>
  r`\begin{bmatrix}${M.map((row) => row.map((a, j) => r`\textcolor{${COLS[j]}}{${a}}`).join('&')).join(r`\\`)}\end{bmatrix}`;

const HALO = { stroke: '#fff', strokeWidth: 5, strokeLinejoin: 'round', paintOrder: 'stroke' };

/** X(A) in an SVG label, the letters italic. */
const ofA = (X) => (
  <>
    <tspan fontFamily={MATH} fontStyle="italic">
      {X}
    </tspan>
    (
    <tspan fontFamily={MATH} fontStyle="italic">
      A
    </tspan>
    )
  </>
);

/**
 * The image's label, teal: "image" (run 'image') or C(A); `at` [x, y, anchor] in pixels. Run 'image',
 * with `say` = { index, kind, m }: on key press `index`, what the image is, written after the word
 * (the user's request, in place of a line under the matrix): image = {0}, = line through 0, = plane
 * through 0, = ℝᵐ (a tspan fragment, so that print shows it too).
 */
function ImageLabel({ at: [x, y, anchor = 'start'], opacity, run, say }) {
  if (run === 'map') return null;
  const plain = { fontWeight: 400 };
  const long = say && (say.kind === 'line' || say.kind === 'plane'); // "image = line through 0": smaller, to fit a narrow picture
  const zero = <tspan fontWeight="700">0</tspan>;
  return run === 'image' ? (
    <text x={x} y={y} textAnchor={anchor} fill={TEAL} fontSize={long ? 16 : 19} fontFamily={MAIN} fontWeight="700" {...HALO} opacity={opacity}>
      image
      {say && (
        <Fragment as="tspan" index={say.index} {...plain}>
          {' = '}
          {say.kind === 'zero' ? (
            <>
              {'{'}
              {zero}
              {'}'}
            </>
          ) : say.kind === 'all' ? (
            <>
              <tspan fontFamily="KaTeX_AMS, KaTeX_Main, serif">R</tspan>
              {say.m > 1 && (
                <tspan dy="-7" fontSize="13">
                  {say.m}
                </tspan>
              )}
            </>
          ) : (
            <>
              {say.kind} through {zero}
            </>
          )}
        </Fragment>
      )}
    </text>
  ) : (
    <text x={x} y={y} textAnchor={anchor} fill={TEAL} fontSize="20" fontFamily={MAIN} {...HALO} opacity={opacity}>
      {ofA('C')}
    </text>
  );
}

/** The label N(A), green. */
function NullLabel({ at: [x, y, anchor = 'start'] }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={GREEN} fontSize="20" fontFamily={MAIN} {...HALO}>
      {ofA('N')}
    </text>
  );
}

/** The label b of a system's right-hand side, green as its arrow. */
function BLabel({ at: [x, y, anchor = 'start'] }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={LEAF} fontSize="20" fontFamily={MATH} fontWeight="700" {...HALO}>
      b
    </text>
  );
}

/**
 * Run 'map': the label of the arrow of eⱼ, beside its tip (`from`, `tip` in pixels; beside the arrow,
 * so not on a line it runs along, and on the side away from b, where `end` is the tip of Aeⱼ and `b`
 * that of b): eⱼ, which becomes Aeⱼ as the arrow moves (t from 0 to 1).
 */
function ELabel({ from, tip, end, b, j, t }) {
  const d = [tip[0] - from[0], tip[1] - from[1]];
  const len = Math.hypot(...d) || 1;
  // b on the arrow's left (as seen on the screen, at the end of the move): the label goes on its right
  // (b along the arrow's line, as −v₂ in Example 1: the product is 0 up to rounding, and its sign
  // flipped from frame to frame as the view rocked, so the label flashed from side to side; hence the −1)
  const side = b && (end[0] - from[0]) * (b[1] - from[1]) - (end[1] - from[1]) * (b[0] - from[0]) < -1 ? -1 : 1;
  const x = tip[0] + (side * 14 * d[1]) / len;
  const y = tip[1] - (side * 14 * d[0]) / len + 5;
  const e = (
    <>
      <tspan fontWeight="700">e</tspan>
      <tspan dy="4" fontSize="12">
        {j + 1}
      </tspan>
    </>
  );
  const props = { x, y, textAnchor: 'middle', fill: INK, fontSize: 18, fontFamily: MATH, ...HALO, strokeWidth: 4 };
  return (
    <>
      <text {...props} opacity={1 - t}>
        {e}
      </text>
      <text {...props} opacity={t}>
        <tspan fontStyle="italic">A</tspan>
        {e}
      </text>
    </>
  );
}

const GRID = '#9fb2c8'; // the inputs' grid
const LINE = '#7d8ea3'; // the inputs' line, its whole numbers, the cube
const AXIS = '#c9ced6';
const TINT = '#e3efec'; // N(A) the whole space: the green of the whole picture
const DASH = { stroke: GREEN, strokeWidth: 1.8, strokeDasharray: '5 5', opacity: 0.7 }; // where N(A) was

/** The columns' arrows, the longer drawn first, so that a shorter one on the same line shows. */
const byLength = (tips) => tips.map((to, j) => ({ j, to })).sort((a, b) => Math.hypot(...b.to) - Math.hypot(...a.to));

// ——— ℝ¹ → ℝ¹: the number line ———

const W1 = 250;
const U1 = 25;
const K1 = 12;

/**
 * T_A for A = [a], on the number line: the line, its whole numbers and e₁ (in its column's colour),
 * each point x at (1 − t)x + tax; then the image in teal, `img.kind` 'all' (the whole line) or 'zero'
 * (the origin). `nul` (runs 'null' and 'rn'): N(A), `kind` 'all' (the inputs green, shrinking into 0;
 * the line dashed green) or 'zero' (the origin green); its label under the line.
 */
function Pic1({ M, img, nul, ph, run, say }) {
  const { t, op, glow, pulse = 0 } = ph;
  const a = M[0][0];
  const k = 1 - t + t * a; // where 1 goes
  const H1 = nul ? 74 : 56;
  const y = nul ? 34 : H1 / 2 + 8;
  const P1 = { px: (x) => W1 / 2 + U1 * x, py: () => y };
  const green = nul?.kind === 'all';
  const ink = green ? GREEN : LINE;
  return (
    <svg className="figure-svg l22-img-pic" viewBox={`0 0 ${W1} ${H1}`} width={W1} height={H1} role="img" aria-label="The number line moving onto its outputs, then the image">
      <line x1="0" y1={y} x2={W1} y2={y} stroke={AXIS} strokeWidth="1.2" />
      {img.kind === 'all' && <line x1="0" y1={y} x2={W1} y2={y} stroke={TEAL} strokeWidth={5 + 4 * pulse} opacity={0.6 * glow} />}
      {green && <line x1="0" y1={y} x2={W1} y2={y} {...DASH} />}
      <g opacity={op}>
        <line x1={P1.px(-K1 * k)} y1={y} x2={P1.px(K1 * k)} y2={y} stroke={ink} strokeWidth={green ? 3 : 2} />
        {Array.from({ length: 2 * K1 + 1 }, (_, i) => (
          <circle key={i} cx={P1.px(k * (i - K1)).toFixed(1)} cy={y} r="2.8" fill={ink} />
        ))}
        <Arrow p={P1} to={[k, 0]} color={COLS[0]} width={3} head={11} />
      </g>
      {img.kind === 'zero' && <circle cx={P1.px(0)} cy={y} r={6.5 + 4 * pulse} fill={TEAL} opacity={glow} />}
      {nul?.kind === 'zero' && <circle cx={P1.px(0)} cy={y} r="6" fill={GREEN} />}
      <circle cx={P1.px(0)} cy={y} r="2.6" fill={INK} />
      <ImageLabel at={img.kind === 'all' ? [W1 - 8, y - 14, 'end'] : [P1.px(0) + 10, y - 14]} opacity={glow} run={run} say={say} />
      {nul && <NullLabel at={nul.kind === 'all' ? [8, y + 30] : [P1.px(0) + 10, y + 30]} />}
    </svg>
  );
}

// ——— pictures in ℝ² ———

const W = 196;
const H = 164;
const U = 26;
const P2 = { px: (x) => W / 2 + U * x, py: (y) => H / 2 - U * y };
const K = 9; // the inputs' grid runs over [−K, K]², beyond the picture, so that its outputs fill it too

/**
 * T_A for a 2 × n matrix (n = 1, 2), in ℝ²: the inputs (n = 2: the square grid of ℝ²; n = 1: the
 * number line, as the x₁-axis, with its whole numbers) and e₁, e₂ in their columns' colours, each
 * point p at (1 − t)p + tAp, so that at t = 1 they are the outputs and Ae₁, Ae₂ (the columns of A);
 * then the image in teal: `img.kind` 'all' (the whole picture), 'line' (along `img.dir`) or 'zero'
 * (the origin), its label at `img.label` [x, y, anchor] (pixels). `nul` (runs 'null' and 'rn'): N(A)
 * in green, `kind` 'all' (the inputs themselves), 'line' (along `nul.dir`, a thick line among the
 * inputs) or 'zero' (the origin); the dashed copy where it was, and its label at `nul.label`.
 */
function Pic2({ M, img, nul, unit: u = U, b, bLabel = [0, 0, 'start'], onB, ph, run, say, arrows = true }) {
  const { t, op, glow, late, pulse = 0 } = ph;
  // `onB` (Going back to linear systems, the user's request): b can be dragged by its tip; it stays in
  // the picture, and close to a line image it snaps onto it (so that b can be put in C(A))
  const dragB = (e) => {
    const box = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const mx = W / 2 / u - 0.3;
    const my = H / 2 / u - 0.3;
    let p = [
      Math.max(-mx, Math.min(mx, (((e.clientX - box.left) / box.width) * W - W / 2) / u)),
      Math.max(-my, Math.min(my, (H / 2 - ((e.clientY - box.top) / box.height) * H) / u)),
    ];
    if (img.kind === 'line') {
      const k = p[0] * img.dir[0] + p[1] * img.dir[1];
      const f = [k * img.dir[0], k * img.dir[1]];
      if (Math.hypot(p[0] - f[0], p[1] - f[1]) < 0.13) p = f;
    }
    onB(p);
  };
  const P = u === U ? P2 : { px: (x) => W / 2 + u * x, py: (y) => H / 2 - u * y };
  const n = M[0].length;
  const go = (p) => lerp(n === 1 ? [p[0], 0] : p, mul(M, p), t);
  const seg = (a, b, key, props) => {
    const [x1, y1] = go(a);
    const [x2, y2] = go(b);
    return <line key={key} x1={P.px(x1).toFixed(1)} y1={P.py(y1).toFixed(1)} x2={P.px(x2).toFixed(1)} y2={P.py(y2).toFixed(1)} {...props} />;
  };
  const green = nul?.kind === 'all';
  const lines = [];
  if (n === 2) {
    for (let k = -K; k <= K; k += 1) {
      lines.push(seg([k, -K], [k, K], `v${k}`, { stroke: green ? GREEN : GRID, strokeWidth: 1.1 }));
      lines.push(seg([-K, k], [K, k], `h${k}`, { stroke: green ? GREEN : GRID, strokeWidth: 1.1 }));
    }
  } else {
    lines.push(seg([-K], [K], 'line', { stroke: green ? GREEN : LINE, strokeWidth: green ? 3 : 2 }));
  }
  if (nul?.kind === 'line') lines.push(seg(times(-K, nul.dir), times(K, nul.dir), 'null', { stroke: GREEN, strokeWidth: 4.5, strokeLinecap: 'round' }));
  const whole = n === 1 ? Array.from({ length: 2 * K + 1 }, (_, k) => go([k - K])) : [];
  const far = (dir) => times(20, dir);
  const full = (dir, props) => <line x1={P.px(-far(dir)[0])} y1={P.py(-far(dir)[1])} x2={P.px(far(dir)[0])} y2={P.py(far(dir)[1])} {...props} />;
  const units = n === 1 ? [[1]] : [[1, 0], [0, 1]];
  const pt = (p) => [P.px(p[0]), P.py(p[1])];
  return (
    <svg className="figure-svg l22-img-pic" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="The inputs moving onto their outputs, then the image">
      {img.kind === 'all' && <rect x="0" y="0" width={W} height={H} fill={TEAL} opacity={0.13 * glow * (1 + pulse)} />}
      {green && n === 2 && <rect x="0" y="0" width={W} height={H} fill={TINT} />}
      <line x1="0" y1={P.py(0)} x2={W} y2={P.py(0)} stroke={AXIS} strokeWidth="1.2" />
      <line x1={P.px(0)} y1="0" x2={P.px(0)} y2={H} stroke={AXIS} strokeWidth="1.2" />
      {green && n === 1 && full([1, 0], DASH)}
      <g opacity={op}>
        {lines}
        {whole.map(([x, y], k) => (
          <circle key={k} cx={P.px(x).toFixed(1)} cy={P.py(y).toFixed(1)} r="2.6" fill={green ? GREEN : LINE} />
        ))}
      </g>
      {img.kind === 'line' && full(img.dir, { stroke: TEAL, strokeWidth: 5 + 4 * pulse, strokeLinecap: 'round', opacity: 0.6 * glow })}
      {/* where N(A) was, dashed, on top of the image (the user's request) */}
      {nul?.kind === 'line' && full(nul.dir, DASH)}
      <g opacity={op}>
        {/* `arrows` false: no e₁, e₂, just the grid (Null space's examples: the user's request) */}
        {arrows &&
          byLength(units.map(go)).map(({ j, to }) => <Arrow key={j} p={P} to={to} color={run === 'map' ? INK : COLS[j]} width={3} head={11} />)}
        {run === 'map' && units.map(go).map((to, j) => <ELabel key={j} from={pt([0, 0])} tip={pt(to)} end={pt(mul(M, units[j]))} b={b && pt(b)} j={j} t={t} />)}
      </g>
      {img.kind === 'zero' && <circle cx={P.px(0)} cy={P.py(0)} r={6.5 + 4 * pulse} fill={TEAL} opacity={glow} />}
      {nul?.kind === 'zero' && <circle cx={P.px(0)} cy={P.py(0)} r="6" fill={GREEN} />}
      <circle cx={P.px(0)} cy={P.py(0)} r="2.6" fill={INK} />
      <ImageLabel at={(say && img.said) || img.label} opacity={glow} run={run} say={say} />
      {nul && <NullLabel at={nul.label} />}
      {b && (
        <g opacity={late}>
          <Arrow p={P} to={b} color={LEAF} width={3} head={11} />
          <BLabel at={[P.px(b[0]) + bLabel[0], P.py(b[1]) + bLabel[1], bLabel[2]]} />
          {onB && (
            <circle
              className="l22-b-grab"
              cx={P.px(b[0])}
              cy={P.py(b[1])}
              r="13"
              fill="transparent"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                e.stopPropagation();
              }}
              onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && dragB(e)}
            />
          )}
        </g>
      )}
    </svg>
  );
}

// ——— pictures in ℝ³ ———

/** A label's place in pixels: { at, dx, dy, anchor } (at a point of space) or { px: [x, y], anchor }. */
const place = (s, label) => [...(label.px ?? plus(s.P(label.at), [label.dx ?? 0, label.dy ?? 0])), label.anchor];

/**
 * T_A for a 3 × n matrix (n = 2, 3), in ℝ³: the inputs (n = 2: the square grid of ℝ² as the floor
 * z = 0; n = 3: a cube round the origin) and e₁, e₂, e₃ in their columns' colours, each point p at
 * (1 − t)p + tAp; then the image in teal: `img.kind` 'all' (the whole picture), 'plane' (the patch
 * ±1.5u ± 1.5w of `img.plane` = [u, w]), 'line' (along `img.dir`) or 'zero' (the origin), its label
 * at `img.label` (see `place`). `nul` (runs 'null' and 'rn'): N(A) in green among the inputs, `kind`
 * 'all' (the whole grid or cube), 'plane' (a square of the plane of `nul.plane`, in ℝ³), 'line'
 * (along `nul.dir`, a vector of ℝⁿ) or 'zero' (the origin), shrinking into 0; the dashed copy where
 * it was, and its label at `nul.label`.
 */
function Pic3({ M, img, nul, unit: u = 36, width = W, height = H, center = [0.5, 0.52], range = [-1, 1], cube = 0.45, b, bLabel = {}, ph, run, say, arrows = true }) {
  const { t, op, glow, late, pulse = 0 } = ph;
  const n = M[0].length;
  const put = (p) => (n === 2 ? [p[0], p[1], 0] : p); // an input, in the picture
  const go = (p) => lerp(put(p), mul(M, p), t);
  // the floor's grid (n = 2) runs over `range`² (the preview's: [−1, 2]², so that b = Ax lies on it)
  const [lo, hi] = range;
  const ks = Array.from({ length: 2 * (hi - lo) + 1 }, (_, i) => lo + i / 2);
  const wide = lo !== -1 || hi !== 1; // the larger grid: its whole-number lines heavier
  const Q = 1.5;
  const units = n === 2 ? [[1, 0], [0, 1]] : [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const green = nul?.kind === 'all';
  const sq = (a, b, q) => [[-q, -q], [q, -q], [q, q], [-q, q]].map(([i, j]) => plus(times(i, a), times(j, b)));
  // the image's patch over [lo, hi]² of its plane's vectors (`img.span`), not round the origin
  const quad = (a, b, l, h) => [[l, l], [h, l], [h, h], [l, h]].map(([i, j]) => plus(times(i, a), times(j, b)));
  const nsq = nul?.kind === 'plane' ? sq(...nul.plane, Q) : null;
  const floor = sq([1, 0, 0], [0, 1, 0], 1);
  // The preview's ℝ³ → ℝ³ (the user's request: a clearer collapse): the inputs are the unit cube on
  // e₁, e₂, e₃ (the arrows are its edges), which flattens into the plane while a faint copy stays where
  // it was until the plane lights up; the plane then shows its grid (the lines along Ae₁ and Ae₂, as
  // the grid of ℝ² → ℝ³ ends on it). The preview's plane is a patch with an edge, over `img.span`²
  // of its vectors (the user's request: with no edge, filling the card, one could not see whether b is
  // on it), its grid over the half-integers inside.
  const solid = run === 'map' && n === 3;
  const ID3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const [sl, sh] = img.span ?? [-Q, Q];
  const ml = Math.ceil(2 * sl) / 2;
  const mh = Math.floor(2 * sh) / 2;
  const mesh = solid && img.kind === 'plane' ? Array.from({ length: 2 * (mh - ml) + 1 }, (_, i) => ml + i / 2) : [];
  const [pu, pv] = img.plane ?? [];
  const onto = (i, j) => plus(times(i, pu), times(j, pv));
  // The preview's b off the plane (the systems' right-hand sides can be edited): a dotted line from its
  // tip straight down to the plane, and a dot there, so that it reads as off the plane
  let foot = null;
  if (run === 'map' && b && img.kind === 'plane') {
    const nrm = cross(pu, pv);
    const d = dot(b, nrm) / dot(nrm, nrm);
    if (Math.abs(d) * Math.sqrt(dot(nrm, nrm)) > 0.03) foot = minus(b, times(d, nrm));
  }
  return (
    <Space width={width} height={height} unit={u} center={center} el={24} swing={10} axisLen={[2, 2.1, 1.6]} axisLabels={['', '', '']} className="l22-img-pic" title="The inputs moving onto their outputs, then the image">
      {(s) => (
        <g>
          {img.kind === 'all' && <rect x="0" y="0" width={width} height={height} fill={TEAL} opacity={0.13 * glow * (1 + pulse)} />}
          {green && n === 3 && <rect x="0" y="0" width={width} height={height} fill={TINT} />}
          {green && n === 2 && <Patch3 s={s} corners={floor} fill={GREEN} opacity={0.1} stroke={GREEN} strokeOpacity={0.7} strokeDasharray="5 5" />}
          {img.kind === 'line' && <Seg3 s={s} from={times(-6, img.dir)} to={times(6, img.dir)} color={TEAL} width={5 + 4 * pulse} opacity={0.6 * glow} />}
          {img.kind === 'plane' &&
            (run === 'map' ? (
              // the preview: a patch of the plane, with an edge (see above)
              <>
                <Patch3 s={s} corners={quad(...img.plane, sl, sh)} fill={TEAL} opacity={0.16 * glow * (1 + pulse)} stroke={TEAL} strokeOpacity={0.7 * glow} strokeWidth={1.6} />
                {mesh.map((k) => (
                  <g key={k}>
                    <Seg3 s={s} from={onto(k, ml)} to={onto(k, mh)} color={GRID} width={Number.isInteger(k) ? 1.4 : 0.7} opacity={glow} />
                    <Seg3 s={s} from={onto(ml, k)} to={onto(mh, k)} color={GRID} width={Number.isInteger(k) ? 1.4 : 0.7} opacity={glow} />
                  </g>
                ))}
              </>
            ) : (
              <Patch3 s={s} corners={img.span ? quad(...img.plane, ...img.span) : sq(...img.plane, Q)} fill={TEAL} opacity={0.16 * glow * (1 + pulse)} stroke={TEAL} strokeOpacity={0.7 * glow} strokeWidth={1.6} />
            ))}
          <g opacity={op}>
            {n === 2 ? (
              ks.map((k) => (
                <g key={k}>
                  <Seg3 s={s} from={go([k, lo])} to={go([k, hi])} color={green ? GREEN : GRID} width={wide ? (Number.isInteger(k) ? 1.4 : 0.7) : 1.1} />
                  <Seg3 s={s} from={go([lo, k])} to={go([hi, k])} color={green ? GREEN : GRID} width={wide ? (Number.isInteger(k) ? 1.4 : 0.7) : 1.1} />
                </g>
              ))
            ) : solid ? (
              <>
                <g opacity={0.4 * clamp01(4 * t) * (1 - glow)}>
                  <CubeMap s={s} M={ID3} t={0} corner={1} color={LINE} opacity={0} />
                </g>
                <CubeMap s={s} M={M} t={t} corner={1} color={LINE} fill="#b9c7dc" opacity={0.3} />
              </>
            ) : (
              <CubeMap s={s} M={M} t={t} half={cube} color={green ? GREEN : LINE} fill={green ? '#a9cfc6' : '#b9c7dc'} opacity={0.3} />
            )}
            {/* N(A) on top of the inputs (the user's request; its plane was under the cube) */}
            {nsq && <Patch3 s={s} corners={nsq.map((p) => lerp(p, [0, 0, 0], t))} fill={GREEN} opacity={0.3} stroke={GREEN} strokeOpacity={0.8} strokeWidth={1.6} />}
            {nul?.kind === 'line' && <Seg3 s={s} from={go(times(-1.3, nul.dir))} to={go(times(1.3, nul.dir))} color={GREEN} width={4} />}
            {arrows &&
              byLength(units.map(go)).map(({ j, to }) => <Arrow3 key={j} s={s} to={to} color={run === 'map' ? INK : COLS[j]} width={3} head={11} />)}
            {run === 'map' && units.map(go).map((to, j) => <ELabel key={j} from={s.P([0, 0, 0])} tip={s.P(to)} end={s.P(mul(M, units[j]))} b={b && s.P(b)} j={j} t={t} />)}
          </g>
          {/* where N(A) was, dashed, on top of the image and the outputs (the user's request) */}
          {nul?.kind === 'plane' && <Patch3 s={s} corners={nsq} fill="none" stroke={GREEN} strokeOpacity={0.7} strokeDasharray="5 5" />}
          {nul?.kind === 'line' && <Seg3 s={s} from={put(times(-1.3, nul.dir))} to={put(times(1.3, nul.dir))} color={GREEN} width={1.8} strokeDasharray="5 5" opacity={0.7} />}
          {img.kind === 'zero' && <Dot3 s={s} at={[0, 0, 0]} color={TEAL} r={6.5 + 4 * pulse} opacity={glow} />}
          {nul?.kind === 'zero' && <Dot3 s={s} at={[0, 0, 0]} color={GREEN} r={6} />}
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={2.6} />
          <ImageLabel at={place(s, (say && img.said) || img.label)} opacity={glow} run={run} say={say} />
          {nul && <NullLabel at={place(s, nul.label)} />}
          {b && (
            <g opacity={late}>
              {foot && <Seg3 s={s} from={b} to={foot} color={LEAF} width={1.8} strokeDasharray="1 5" strokeLinecap="round" />}
              {foot && <Dot3 s={s} at={foot} color={LEAF} r={3.2} />}
              <Arrow3 s={s} to={b} color={LEAF} width={3} head={11} />
              <BLabel at={place(s, { at: b, ...bLabel })} />
            </g>
          )}
        </g>
      )}
    </Space>
  );
}

// ——— the examples, by ℝⁿ → ℝᵐ, each group from the smallest image to the largest ———
// Each: its matrix M, its picture `Pic` (and `size`: its unit, width, height), the image `img` and the
// null space `nul` (`kind`: 'zero', 'line', 'plane' or 'all'; the answers and the rank and nullity
// follow from the kinds).

const s2 = Math.sqrt(2);
const s3 = Math.sqrt(3);
const s5 = Math.sqrt(5);
const ZERO_LABEL = [W / 2 + 12, H / 2 - 12, 'start'];
// run 'image', where the label grows into "image = …" (`img.said`): places with room for all of it
const ZERO_SAID = [W / 2 - 44, H / 2 - 14, 'start']; // over the origin
const TOP_LEFT = [6, 20]; // a line's, in the corner it leaves free
const UNDER0 = [W / 2 + 10, H / 2 + 26, 'start']; // N(A) = {0}, under the origin
const W3 = 264; // the pictures of ℝ³ → ℝ³
const H3 = 196;
const NEAR0 = { at: [0, 0, 0], dx: 12, dy: -12, anchor: 'start' };
const UNDER0_3 = { at: [0, 0, 0], dx: 10, dy: 26, anchor: 'start' };

const R11 = [
  { M: [[0]], Pic: Pic1, img: { kind: 'zero' }, nul: { kind: 'all' } },
  { M: [[2]], Pic: Pic1, img: { kind: 'all' }, nul: { kind: 'zero' } },
];

const R12 = [
  { M: [[0], [0]], Pic: Pic2, img: { kind: 'zero', label: ZERO_LABEL, said: ZERO_SAID }, nul: { kind: 'all', label: [W - 8, H / 2 + 26, 'end'] } },
  { M: [[2], [1]], Pic: Pic2, img: { kind: 'line', dir: [2 / s5, 1 / s5], label: [W - 10, 48, 'end'], said: TOP_LEFT }, nul: { kind: 'zero', label: UNDER0 } },
];

const R22 = [
  {
    M: [
      [0, 0],
      [0, 0],
    ],
    Pic: Pic2,
    img: { kind: 'zero', label: ZERO_LABEL, said: ZERO_SAID },
    nul: { kind: 'all', label: [10, 24, 'start'] },
  },
  {
    M: [
      [1, 2],
      [1, 2],
    ],
    Pic: Pic2,
    img: { kind: 'line', dir: [1 / s2, 1 / s2], label: [W - 14, 30, 'end'], said: TOP_LEFT },
    nul: { kind: 'line', dir: unit([2, -1]), label: [W - 12, H - 14, 'end'] },
  },
  {
    M: [
      [1, 1],
      [0, 1],
    ],
    Pic: Pic2,
    img: { kind: 'all', label: [10, 24, 'start'] },
    nul: { kind: 'zero', label: UNDER0 },
  },
];

const R23 = [
  {
    M: [
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    Pic: Pic3,
    size: { unit: 40 },
    img: { kind: 'zero', label: NEAR0, said: { at: [0, 0, 0], dx: -44, dy: -14, anchor: 'start' } },
    nul: { kind: 'all', label: { at: [1, 1, 0], dx: 8, dy: 20, anchor: 'start' } }, // under the floor's front corner
  },
  {
    M: [
      [0, 0],
      [1, -1],
      [1, -1],
    ],
    Pic: Pic3,
    size: { unit: 40 },
    img: { kind: 'line', dir: [0, 1 / s2, 1 / s2], label: { at: [0, 0.9, 0.9], dx: -12, dy: -4, anchor: 'end' }, said: { px: TOP_LEFT, anchor: 'start' } },
    nul: { kind: 'line', dir: [1 / s2, 1 / s2], label: { at: [0.92, 0.92, 0], dx: 8, dy: 18, anchor: 'start' } },
  },
  {
    M: [
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    Pic: Pic3,
    size: { unit: 34 },
    img: {
      kind: 'plane',
      plane: [
        [0.87, 0, 0.87],
        [0, 0.87, 0.87],
      ],
      label: { at: [1.3, -1.3, 0], dx: 4, dy: 18, anchor: 'start' },
      said: { px: [6, H - 8], anchor: 'start' },
    },
    nul: { kind: 'zero', label: UNDER0_3 },
  },
];

const R33 = [
  {
    M: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    Pic: Pic3,
    size: { unit: 40, width: W3, height: H3 },
    img: { kind: 'zero', label: NEAR0 },
    nul: { kind: 'all', label: { px: [10, 24], anchor: 'start' } },
  },
  {
    // the projection onto the z-axis (the user's request; first the rank-1 matrix [1 2 −1; −1 −2 1; 1 2 −1]):
    // N(A) is the xy-plane, the other way round from the projection onto the xy-plane after it
    M: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ],
    Pic: Pic3,
    size: { unit: 40, width: W3, height: H3, cube: 0.85 }, // a larger cube (`cube`, its half side: the user's request)
    img: { kind: 'line', dir: [0, 0, 1], label: { at: [0, 0, 1.25], dx: 12, dy: 4, anchor: 'start' }, said: { px: [10, H3 - 12], anchor: 'start' } },
    nul: {
      kind: 'plane',
      plane: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      label: { at: [1.5, -1.5, 0], dx: 6, dy: 16, anchor: 'start' },
    },
  },
  {
    // the projection onto the xy-plane (the user's request; first [1 0 1; 0 1 1; 0 0 0]): N(A) is the z-axis
    M: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    Pic: Pic3,
    size: { unit: 48, width: W3, height: H3, cube: 0.85 },
    img: {
      kind: 'plane',
      plane: [
        [1, 0, 0],
        [0, 1, 0],
      ],
      label: { at: [1.5, -1.5, 0], dx: 4, dy: 18, anchor: 'start' },
      said: { px: [10, H3 - 10], anchor: 'start' },
    },
    nul: { kind: 'line', dir: [0, 0, 1], label: { at: [0, 0, 1.3], dx: 8, dy: 4, anchor: 'start' } },
  },
  {
    M: [
      [1, 0, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    Pic: Pic3,
    size: { unit: 56, width: W3, height: H3 },
    img: { kind: 'all', label: { px: [10, 24], anchor: 'start' } },
    nul: { kind: 'zero', label: { at: [0, 0, 0], dx: 14, dy: 46, anchor: 'start' } }, // under the arrows
  },
];

/**
 * The four systems of Linear system in matrix form (the first three matrices are among the examples above, the fourth is the third's with a column v₃ = v₁ + v₂ more), for
 * its preview (run 'map'): each with its right-hand side `b` and where b's label goes (`bLabel`), at a
 * scale that keeps b in the picture.
 */
/** Going back to linear systems, dim C(A) < m: a 2 × 2 matrix of rank 1 (the user's request), b off its line. */
export const RANK1_MAP = { ...R22[1], nul: null, b: [2.5, 0.5], bLabel: [6, -6, 'start'] };

export const SYSTEM_MAPS = [
  { ...R12[1], size: { unit: 18 }, b: [4, 3], bLabel: [-12, 2, 'end'] },
  { ...R22[2], b: [3, 1], bLabel: [-2, -12, 'end'] },
  {
    ...R23[2],
    // the image a patch of the plane with an edge, whole in the card (the user's request: with no edge
    // one could not see whether b is on it), and e₁, e₂ as large as that allows (unit 53; 66 with no
    // edge); the inputs' grid over [−1, 2]², so that it moves onto the part of the plane where
    // b = A(1, 2) is, a crossing of its lines
    size: { unit: 53, width: 280, height: 250, center: [0.497, 0.633], range: [-1, 2] },
    img: {
      kind: 'plane',
      plane: [
        [1, 0, 1],
        [0, 1, 1],
      ],
      span: [-1.15, 2.15],
      label: { px: [0, 0] },
    },
    b: [1, 2, 3],
    bLabel: { dx: 10, dy: 4, anchor: 'start' },
  },
  {
    // the third system's matrix with a third column v₃ = v₁ + v₂: ℝ³ collapses gently into the same
    // plane z = x + y, e₁, e₂, e₃ each tilting onto it (the user's request, in place of Example 1's
    // matrix, whose e₃ turned over); the same b, plane, scale and origin as the third picture, so the
    // two end alike: the plane with its grid, b at a crossing
    M: [
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 2],
    ],
    Pic: Pic3,
    size: { unit: 53, width: 280, height: 250, center: [0.497, 0.633] },
    img: {
      kind: 'plane',
      plane: [
        [1, 0, 1],
        [0, 1, 1],
      ],
      span: [-1.15, 2.15],
      label: { px: [0, 0] },
    },
    b: [1, 2, 3],
    bLabel: { dx: 10, dy: 4, anchor: 'start' },
  },
];

/**
 * One of the pictures alone, looping from key press `index` (print: the outputs, the image and b).
 * With `once`, it plays once and stays at its end (the outputs, the image and b); it plays again
 * when its key press is undone and redone. With `drag` (the 2-D pictures), b can be dragged by its tip.
 */
export function LoopPic({ index, ex, run = 'map', once = false, drag = false }) {
  const [moved, setMoved] = useState(null); // b, once dragged
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const sec = useCycle(on, ref);
  const { M, Pic, size, img, b, bLabel } = ex;
  return (
    <>
      <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <Fragment index={index} className="l22-map-pic">
        <Pic M={M} img={img} nul={null} ph={phase(once ? Math.min(sec, LEAVE - 0.01) : sec)} run={run} b={moved ?? b} bLabel={bLabel} onB={drag ? setMoved : undefined} {...size} />
      </Fragment>
    </>
  );
}

/** The groups of examples, a bullet each: T_A: ℝⁿ → ℝᵐ; `grid`: the examples two by two. */
const GROUPS = {
  r11: { n: 1, m: 1, examples: R11 },
  r12: { n: 1, m: 2, examples: R12 },
  r22: { n: 2, m: 2, examples: R22 },
  r23: { n: 2, m: 3, examples: R23 },
  r33: { n: 3, m: 3, examples: R33, grid: true },
};

/** Each bullet's words, before ℝⁿ → ℝᵐ. */
const HEAD = {
  image: 'Image of a linear transformation',
  null: 'Null space of a linear transformation',
  rn: 'Rank and nullity of a linear transformation',
};

const R = (d) => (d === 1 ? r`\mathbb R` : r`\mathbb R^${d}`);
const dim = (kind, d) => (kind === 'all' ? d : { zero: 0, line: 1, plane: 2 }[kind]);
const z = <Tex tex={r`\vv 0`} />;
/** A subspace of ℝᵈ in words, from its kind. */
const say = (kind, d) => (kind === 'zero' ? <>the point {z}</> : kind === 'all' ? <>all of <Tex tex={R(d)} /></> : <>a {kind} through {z}</>);

/** "rank = r, nullity = k", rank teal and nullity green (as in the theorem's box). */
export function RankNullity({ rank, nullity }) {
  return (
    <>
      <span className="l22-rn-rank">
        rank = <Tex tex={String(rank)} />
      </span>
      ,{' '}
      <span className="l22-rn-null">
        nullity = <Tex tex={String(nullity)} />
      </span>
    </>
  );
}

/** The answer for one example in a run: its image, its null space, or its rank and nullity. */
function answer(run, { M, img, nul }) {
  const m = M.length;
  const n = M[0].length;
  if (run === 'image') return say(img.kind, m);
  if (run === 'null') return say(nul.kind, n);
  return <RankNullity rank={dim(img.kind, m)} nullity={dim(nul.kind, n)} />;
}

/**
 * One example on key press `index`: its matrix A (each column in its arrow's colour), beside the
 * picture, which loops from when the card comes in (print: the outputs and the image). Run 'image':
 * the picture plays once (a click on it plays it again), and the key press after it, `index` + 1,
 * writes what the image is after the word "image" in the picture (ImageLabel).
 */
function ImageCard({ index, run, ex }) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const once = run === 'image';
  const loop = useCycle(on && !once, ref);
  const [sec, replay] = useOnce(on && once, ref);
  const { M, Pic, size, img, nul } = ex;
  const matrix = (
    <div className="l22-img-text">
      <Tex tex={r`A=${matTex(M)}`} />
    </div>
  );
  return (
    <>
      <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <Fragment index={index} className="l22-img-card">
        {once ? (
          <>
            {matrix}
            <span className="l22-img-replay" onClick={replay} title="Play again">
              <Pic M={M} img={img} nul={null} ph={phaseOnce(sec)} run={run} say={{ index: index + 1, kind: img.kind, m: M.length }} {...size} />
            </span>
          </>
        ) : (
          <>
            {matrix}
            <Pic M={M} img={img} nul={nul} ph={phase(loop)} run={run} {...size} />
          </>
        )}
      </Fragment>
    </>
  );
}

/**
 * Key presses per example: 2 in runs 'image' (the card, then what its image is) and 'rn' (the card,
 * then its rank and nullity under it), 1 in run 'null'.
 */
const per = (run) => (run === 'null' ? 1 : 2);

/**
 * A group's examples, one per key press from `from`, then the answers (a line for each) beside them
 * on the next key press. Run 'image': each example on two key presses (ImageCard), and no answers
 * beside them. Run 'rn': likewise, the examples in equal columns (ℝ³ → ℝ³: two by two), each card centred in its
 * own with its rank and nullity under it.
 */
function ImageRow({ from, run, group }) {
  if (run === 'rn') {
    // the cards enlarged to fill the slide's width (two or three in a row), or a little smaller (two by two, to fit its height)
    const zoom = group.grid ? 0.88 : group.examples.length === 2 ? 1.35 : 1.12;
    return (
      <div className={`l22-img-row l22-img-spread l22-rn-spread${group.grid ? ' l22-rn-grid' : ''}`} style={{ '--n': group.grid ? 2 : group.examples.length, '--rn-zoom': zoom }}>
        {group.examples.map((ex, k) => (
          <div key={k} className="l22-rn-cell">
            <ImageCard index={from + 2 * k} run={run} ex={ex} />
            <Fragment index={from + 2 * k + 1} as="p" className="l22-rn-says">
              {answer(run, ex)}
            </Fragment>
          </div>
        ))}
      </div>
    );
  }
  const cards = group.examples.map((ex, k) => <ImageCard key={k} index={from + per(run) * k} run={run} ex={ex} />);
  return (
    <div className={`l22-img-row${run === 'image' ? ' l22-img-spread' : ''}`} style={{ '--n': group.grid ? 2 : group.examples.length }}>
      {group.grid ? <div className="l22-img-grid2">{cards}</div> : cards}
      {run !== 'image' && (
        <Fragment index={from + group.examples.length} as="ul" className={`l22-img-answer l22-ans-${run}`}>
          {group.examples.map((ex, k) => (
            <li key={k}>{answer(run, ex)}</li>
          ))}
        </Fragment>
      )}
    </div>
  );
}

/** How many key presses a group takes: its bullet, its cards, and its answer (runs 'image' and 'rn': each card's). */
const groupPresses = (run, group) => 1 + (run === 'null' ? group.examples.length + 1 : 2 * group.examples.length);

/** How many key presses `examples` takes for these groups in run `run`. */
export const pressesOf = (groups, run) => groups.reduce((s, key) => s + groupPresses(run, GROUPS[key]), 0);

/**
 * Null space's three examples (the user's request: among all the examples, just three that show the
 * collapsing): a line of ℝ² collapsing into 0 (ℝ² onto a line), a line of ℝ³ (the projection onto the
 * xy-plane: the z-axis), a plane of ℝ³ (the projection onto the z-axis: the xy-plane).
 */
export const COLLAPSE = [R22[1], R33[2], R33[1]];
// the same in two stages (the user's request): the 2 × 2 one beside a 2 × 2 example where nothing
// collapses (the shear, N(A) = {0}); then, in their place, the two 3 × 3 ones
export const COLLAPSE_2 = [R22[1], R22[2]];
export const COLLAPSE_3 = [R33[2], R33[1]];

/**
 * One picked example: on key press `index`, its matrix beside the picture, played once (the user's
 * request; first on a loop) and stopping at its end, the inputs moved
 * onto their outputs, C(A) lit, without N(A) (the user's request: the animation first), the matrix black and
 * no arrows e₁, e₂, e₃ in the picture, just the grid or the cube collapsing (the user's request); on the next key press,
 * N(A) dashed on top of the collapsed picture (the user's request); on the key press after that (its
 * own: the user's request), the picture plays once more,
 * N(A) solid green among the inputs and shrinking into 0
 * with them, and stops with C(A) and N(A) (its dashed copy and label) (print: N(A) from the start, the
 * copies run no state).
 */
// Null space's examples, their second play (with N(A) solid among the inputs): the inputs fade in over
// FADE seconds, then the picture plays as the first time.
const FADE = 0.35;
const STILL = { t: 1, op: 1, glow: 1, late: 1, pulse: 0 }; // the picture as a play leaves it

function PickedCard({ index, run, ex }) {
  const ref = useRef(null);
  const next = useRef(null);
  const third = useRef(null);
  const on = useFragmentShown(ref);
  const named = useFragmentShown(next); // key press index + 1: N(A) dashed on the collapsed picture
  const again = useFragmentShown(third); // key press index + 2: the second play, N(A) solid
  const [sec, replay] = useOnce(on, ref);
  // the second play starts on its own key press (the user's request), not after a pause
  const was = useRef(again);
  useEffect(() => {
    if (was.current === again) return;
    was.current = again;
    if (on && again) replay();
  }, [again]); // eslint-disable-line react-hooks/exhaustive-deps
  const ph = again ? { ...phaseOnce(sec), op: PRINT ? 1 : clamp01(sec / FADE) } : named ? STILL : phaseOnce(sec);
  const { M, Pic, size, img, nul } = ex;
  return (
    <>
      <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <span ref={next} className="fragment fx-marker" data-fragment-index={index + 1} aria-hidden="true" />
      <span ref={third} className="fragment fx-marker" data-fragment-index={index + 2} aria-hidden="true" />
      <Fragment index={index} className="l22-img-card">
        <div className="l22-img-text">
          <Tex tex={r`A=\begin{bmatrix}${M.map((row) => row.join('&')).join(r`\\`)}\end{bmatrix}`} />
        </div>
        <Pic M={M} img={img} nul={PRINT || named ? nul : null} ph={ph} run={run} arrows={false} {...size} />
      </Fragment>
    </>
  );
}

/**
 * A few examples picked from the groups, in a row of equal columns, with no bullets: each card on a
 * key press (from `from`), its animation first; on the next one, N(A) dashed in its picture
 * (PickedCard) and, under it, what N(A) is ("N(A) = line through 0"); on the third, its second play.
 * Three key presses an example.
 */
export function Picked({ run = 'null', examples, from = 0 }) {
  return (
    <div className="l22-pick-row" style={{ '--n': examples.length }}>
      {examples.map((ex, k) => {
        const { kind } = ex.nul;
        return (
          <div key={k} className="l22-pick">
            <PickedCard index={from + 3 * k} run={run} ex={ex} />
            <Fragment index={from + 3 * k + 1} as="p" className="l22-pick-says">
              <Tex tex="N(A)" /> = {kind === 'zero' ? <Tex tex={r`\{\vv 0\}`} /> : kind === 'all' ? <Tex tex={R(ex.M[0].length)} /> : <>{kind} through {z}</>}
            </Fragment>
          </div>
        );
      })}
    </div>
  );
}

/**
 * A slide's bullets, one per group of `groups` (e.g. ['r11', 'r12']), in run `run`: "Image of a
 * linear transformation ℝⁿ → ℝᵐ" (or Null space, Rank and nullity), then its examples and answer. The
 * first bullet comes on key press `from` (0: on arrival), each later one on the key press after the
 * last answer before it.
 */
export function Examples({ run, groups, from = 0 }) {
  let at = from;
  return (
    <ul className="bullets l22-img-list">
      {groups.map((key) => {
        const group = GROUPS[key];
        const index = at;
        at += groupPresses(run, group);
        const body = (
          <>
            {HEAD[run]} <Tex tex={r`\mathbb R^${group.n}\to\mathbb R^${group.m}`} />
            <ImageRow from={index + 1} run={run} group={group} />
          </>
        );
        return index === 0 ? (
          <li key={key}>{body}</li>
        ) : (
          <Fragment key={key} index={index} as="li">
            {body}
          </Fragment>
        );
      })}
    </ul>
  );
}
