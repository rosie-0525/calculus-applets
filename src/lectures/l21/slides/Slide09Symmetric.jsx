import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import FlipMatrix from '../components/FlipMatrix.jsx';
import { INK, RED } from '../components/tr.js';

// the textbook's Example 20.3.4: M and N are symmetric, N′ is not (its (2, 3)- and (3, 2)-entries)
export const M = [
  ['2', '−3'],
  ['−3', '1'],
];
export const N = [
  ['1', '0', '7'],
  ['0', '−2', '3'],
  ['7', '3', '−1'],
];
export const N2 = [
  ['1', '0', '7'],
  ['0', '−2', '3'],
  ['7', '2', '−1'],
];
export const CELL = 52;
export const X0 = 30; // the matrix's left edge (its name, once left of it, removed: the user's request)
// every entry in ink, no dashed diagonal (the user: the colours of the mirror pairs were confusing);
// `bad`: the pair that differs, highlighted in pale red on key press `hl` (the user's request, in place
// of a red ring round each), drawn over the entries, translucent, so that their white halo doesn't show
export const ink = () => INK;
export const HL = { w: 0.86 * CELL, h: 0.74 * CELL };
export const hlAt = (i, j) => (
  <rect x={X0 + (j + 0.5) * CELL - HL.w / 2} y={30 + (i + 0.5) * CELL - HL.h / 2} width={HL.w} height={HL.h} rx={9} />
);

export function Mirror({ rows, name, bad, ok, index, hl }) {
  const n = rows.length;
  const side = n * CELL + 60;
  return (
    <Fragment index={index} className="l21-mirror">
      <svg viewBox={`0 0 ${side} ${side}`} width={side} height={side} role="img" aria-label={`The matrix ${name}`}>
        <FlipMatrix rows={rows} t={0} x={X0} y={30} cell={CELL} font={27} colorAt={ink} />
        {bad && (
          <Fragment index={hl} as="g" fill={RED} fillOpacity={0.2}>
            {hlAt(1, 2)}
            {hlAt(2, 1)}
          </Fragment>
        )}
      </svg>
      <p className={ok ? 'l21-ok' : 'l21-not'}>{ok ? 'symmetric' : 'not symmetric'}</p>
    </Fragment>
  );
}

/**
 * Symmetric matrices: the definition in the user's words, a matrix M is symmetric if M = Mᵀ (in place of
 * Mark's "If M is a matrix satisfying Mᵀ = M (so M is square), we call M a symmetric matrix"). Key presses 1–3: the textbook's
 * Example 20.3.4, recognized by inspection, every entry in ink and no dashed diagonal (the user's
 * request: the colours of the mirror pairs were confusing); M and N symmetric (green), N′ not (red);
 * key press 4: its (2, 3)- and (3, 2)-entries, 3 and 2, highlighted in pale red (the user's requests); the
 * matrices alone, without "M =", "N =", "N′ =" (the user's request);
 * (The user removed x · (My) = (Mx) · y for symmetric M, Mark's, and moved "so are its powers and
 * its inverse" to Properties of symmetric matrices.)
 */
export default function Slide09Symmetric() {
  return (
    <section>
      <h2>Symmetric matrices</h2>

      <div className="block definition">
        <p className="block-title">Definition</p>
        <p>
          A matrix <Tex tex="M" /> is <strong>symmetric</strong> if <Tex tex={r`M=M^{\top}`} />.
        </p>
      </div>

      <div className="l21-mirrors">
        <Mirror rows={M} name="M" ok index={1} />
        <Mirror rows={N} name="N" ok index={2} />
        <Mirror rows={N2} name="N′" bad="12" index={3} hl={4} />
      </div>
    </section>
  );
}
