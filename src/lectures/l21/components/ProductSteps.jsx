import { MAIN, MATH } from './svgmath.jsx';
import { INK, RED, BLUE, AMBER, lerp } from './tr.js';

const C = 44; // the side of a cell (px)
const GAP = 20; // between the two factors
const EQ = 56; // the room for "="
export const W = 600;
export const H = 466;
const TOP = 130; // the top row, (AB)ᵀ and the transposes, is centred on this line
const BOT = 360; // the bottom row, A B = AB
const clamp01 = (x) => Math.max(0, Math.min(1, x));
// the two rows' "=" line up: the factors end at XF, the products start at XP
const XE = 20 + 7 * C + GAP + EQ / 2; // room for A (3 wide) and B (4 wide) on the bottom row
const XF = XE - EQ / 2;
const XP = XE + EQ / 2;

// A is 2 × 3, B 3 × 4, AB 2 × 4; row 2 of A (blue) times column 3 of B (amber) gives entry (2, 3)
// of AB (red): the derivation's j = 2, i = 3
const MATS = {
  A: { m: 2, n: 3, tone: (i) => (i === 1 ? BLUE : null) },
  B: { m: 3, n: 4, tone: (i, j) => (j === 2 ? AMBER : null) },
  P: { m: 2, n: 4, tone: (i, j) => (i === 1 && j === 2 ? RED : null) },
};
/** The width and height of `mat` flipped by t (t = 1: its transpose). */
const dims = (mat, t) => [lerp(mat.n, mat.m, t) * C, lerp(mat.m, mat.n, t) * C];
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
/** A name or a size shows up only once its matrix has arrived (the last third of its move). */
const arrived = (k) => clamp01(3 * k - 2);

/** One matrix as a grid of cells, flipped by t across its diagonal, its top-left corner at (x, y). */
function Cells({ mat, t, x, y, opacity = 1 }) {
  const { m, n, tone } = mat;
  const out = [];
  for (let i = 0; i < m; i += 1) {
    for (let j = 0; j < n; j += 1) {
      const c = tone(i, j);
      out.push(
        <rect
          key={`${i}-${j}`}
          x={x + lerp(j, i, t) * C}
          y={y + lerp(i, j, t) * C}
          width={C}
          height={C}
          fill={c ? c : '#fff'}
          fillOpacity={c ? (c === RED ? 0.85 : 0.32) : 1}
          stroke={c ?? '#9ca3af'}
          strokeWidth={c ? 2 : 1.2}
        />,
      );
    }
  }
  return <g opacity={opacity}>{out}</g>;
}

/** A name over a matrix, in KaTeX's italic: `parts` are [text, transposed?] pieces; `paren` wraps them as (AB)ᵀ. */
function Name({ x, y, parts, paren, opacity }) {
  const T = (k) => (
    <tspan key={`t${k}`} fontFamily={MAIN} fontStyle="normal" fontSize="18" dy="-12">
      ⊤
    </tspan>
  );
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize="29" fill={INK} opacity={opacity}>
      {paren ? (
        <>
          <tspan fontFamily={MAIN} fontStyle="normal">(</tspan>
          {parts.map(([s]) => s).join('')}
          <tspan fontFamily={MAIN} fontStyle="normal">)</tspan>
          {T('p')}
        </>
      ) : (
        parts.flatMap(([s, t], k) => [
          <tspan key={`s${k}`} dy={k > 0 && parts[k - 1][1] ? 12 : undefined}>
            {s}
          </tspan>,
          ...(t ? [T(k)] : []),
        ])
      )}
    </text>
  );
}

/**
 * (AB)ᵀ = BᵀAᵀ as a picture in two rows, in step with the derivation of the slide Transpose of a
 * product (the user's design): the bottom row becomes A B = AB, and the transposes of A and B go
 * straight to their places in the top row, Bᵀ Aᵀ = (AB)ᵀ, so that no product that makes no sense is
 * ever shown. `p` runs from 0 to 6, a unit per key press (in between, the picture moves):
 * 1. (AB)ᵀ alone, 4 × 2, its entry (3, 2) red: the (i, j)-th entry, i = 3, j = 2;
 * 2. a copy of it comes down under it, flipping into AB, 2 × 4: the entry is AB's (2, 3), the (j, i)-th;
 * 3. A and B come in on the bottom row, row 2 of A blue, column 3 of B amber, and the two products
 *    move right to make room: A B = AB, row j of A times column i of B;
 * 4. a copy of B rises to the left end of the top row, flipping into Bᵀ: row 3 of Bᵀ (amber), with
 *    the derivation's (row i of Bᵀ);
 * 5. a copy of A rises to the top row, just left of (AB)ᵀ, flipping into Aᵀ: column 2 of Aᵀ (blue),
 *    with · (column j of Aᵀ);
 * 6. the top row's "=": Bᵀ Aᵀ = (AB)ᵀ, its red entry the (3, 2)-th of BᵀAᵀ.
 * Each matrix has its name over it and its size under it; a moving copy gets them when it arrives.
 */
export default function ProductSteps({ p }) {
  const { A, B, P } = MATS;
  const k2 = clamp01(p - 1); // AB coming down out of (AB)ᵀ
  const fa = clamp01(p - 2); // A and B in, the products moved right
  const kB = clamp01(p - 3); // Bᵀ up
  const kA = clamp01(p - 4); // Aᵀ up
  const kE = clamp01(p - 5); // the top row's "="
  // centres: the products start in the middle and move right as A and B come in
  const [wPt, hPt] = dims(P, 1);
  const [wP, hP] = dims(P, 0);
  const top = [lerp(W / 2, XP + wPt / 2, fa), TOP];
  const bot = [lerp(W / 2, XP + wP / 2, fa), BOT];
  const [wA, hA] = dims(A, 0);
  const [wB, hB] = dims(B, 0);
  const atA = [XF - wB - GAP - wA / 2, BOT];
  const atB = [XF - wB / 2, BOT];
  const [wAt, hAt] = dims(A, 1);
  const [wBt, hBt] = dims(B, 1);
  const atAt = [XF - wAt / 2, TOP];
  const atBt = [XF - wAt - GAP - wBt / 2, TOP];
  const ab = [bot[0], lerp(TOP, BOT, k2)];
  const a = mix(atA, atAt, kA);
  const b = mix(atB, atBt, kB);
  /** `mat` flipped by t, centred at c. */
  const grid = (mat, t, c, opacity = 1) => {
    const [w, h] = dims(mat, t);
    return <Cells mat={mat} t={t} x={c[0] - w / 2} y={c[1] - h / 2} opacity={opacity} />;
  };
  const name = (c, h, parts, opacity, paren) => <Name x={c[0]} y={c[1] - h / 2 - 14} parts={parts} paren={paren} opacity={opacity} />;
  const size = (c, h, text, opacity) => (
    <text x={c[0]} y={c[1] + h / 2 + 22} textAnchor="middle" fontFamily={MAIN} fontSize="16" fill="#6b7280" opacity={opacity}>
      {text}
    </text>
  );
  const eq = (y, opacity) => (
    <text x={XE} y={y} dy="0.35em" textAnchor="middle" fontFamily={MAIN} fontSize="27" fill={INK} opacity={opacity}>
      =
    </text>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="The transpose of AB, entry by entry: it is B transpose times A transpose" opacity={clamp01(p)}>
      {grid(P, 1, top)}
      {grid(A, 0, atA, fa)}
      {grid(B, 0, atB, fa)}
      {eq(BOT, fa)}
      {eq(TOP, kE)}
      {name(top, hPt, [['A'], ['B']], 1, true)}
      {size(top, hPt, '4 × 2', 1)}
      {name(atA, hA, [['A']], fa)}
      {size(atA, hA, '2 × 3', fa)}
      {name(atB, hB, [['B']], fa)}
      {size(atB, hB, '3 × 4', fa)}
      {grid(P, 1 - k2, ab, k2 > 0 ? 1 : 0)}
      {name(bot, hP, [['AB']], arrived(k2))}
      {size(bot, hP, '2 × 4', arrived(k2))}
      {grid(A, kA, a, kA > 0 ? 1 : 0)}
      {name(atAt, hAt, [['A', true]], arrived(kA))}
      {size(atAt, hAt, '3 × 2', arrived(kA))}
      {grid(B, kB, b, kB > 0 ? 1 : 0)}
      {name(atBt, hBt, [['B', true]], arrived(kB))}
      {size(atBt, hBt, '4 × 3', arrived(kB))}
    </svg>
  );
}
