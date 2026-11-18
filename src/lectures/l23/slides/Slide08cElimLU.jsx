import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { BLUE, AMBER, L, U, col } from '../components/lu.js';
import { ElimMatrix, OpArrow, MultiplierFlight } from '../components/Elim.jsx';

export const b = (t) => col(BLUE, t); // a multiplier, blue, as L's entries are
export const M = (rows) => r`\begin{bmatrix}${rows.map((row) => row.join('&')).join(r`\\`)}\end{bmatrix}`;
// a multiplier in L, marked for its flight from the arrows (MultiplierFlight)
export const slot = (id, t) => `\\htmlClass{l23-el-slot-${id}}{${b(t)}}`;

// A = [2 1 1; 4 3 3; 8 7 9]: R₂ − 2R₁ and R₃ − 4R₁ clear the first column, then R₃ − 3R₂ the second:
// U = [2 1 1; 0 1 1; 0 0 2], and L = [1 0 0; 2 1 0; 4 3 1] (checked: LU = A)
export const A = M([[2, 1, 1], [4, 3, 3], [8, 7, 9]]);
export const UU = M([[2, 1, 1], [0, 1, 1], [0, 0, 2]]);
export const LL = M([[1, 0, 0], [slot('21', 2), 1, 0], [slot('31', 4), slot('32', 3), 1]]);
export const named = (m, name) => r`\underbrace{${m}}_{${name}}`;

// the same matrices as numbers, for the animated steps
export const NA = [[2, 1, 1], [4, 3, 3], [8, 7, 9]];
export const NA1 = [[2, 1, 1], [0, 1, 1], [0, 3, 5]];
export const NU = [[2, 1, 1], [0, 1, 1], [0, 0, 2]];
export const SLOTS = ['21', '31', '32'];

/**
 * LU decomposition by elimination (after LU or QR?; the user's request: demonstrate how to use
 * elimination to find the LU decomposition). The textbook's method (Section 22.6: add multiples of a
 * row only to the rows below it), on an integer 3 × 3 matrix of our own (the textbook's A = [1 0 −1;
 * 2 5 1; 4 2 3] gives fractions; Example 4's A gives an L and U that differ by a sign from those on
 * LU or QR?): on arrival, the rule and A; (key press 1) R₂ − 2R₁, R₃ − 4R₁ clear the first column;
 * (2) R₃ − 3R₂ the second, giving U (amber, as U is); (3) A = LU, L's multipliers in blue. (The note
 * beside it in gray, "L: the multipliers, below 1's on the diagonal (→ Section 22.6)", removed at the
 * user's request.) Not on the slide: why L holds the multipliers
 * (each step multiplies by a lower triangular matrix, whose inverse flips the multiplier's sign; their
 * product puts the multipliers in place) and the row swaps a 0 on the diagonal would need (Remark
 * 22.6.2).
 * The row operations animated (the user's requests: "really really awesome", then simpler: highlight
 * the row, ×(−2) beside it without a background, just change the numbers, no circles or boxed numbers;
 * Elim.jsx): each step's arrow draws itself; for each operation, its label lights up, the pivot row blue
 * and the row it changes amber, ×(−2) beside the pivot row, the row's entries turn in place into the sums
 * (4−4) and then the new entries, each new zero bursting into confetti; after step 2, U's upper triangle
 * shimmers amber and "= U" pops in. At key press 3, the multipliers fly from the arrows' labels into
 * their places in L.
 */
export default function Slide08cElimLU() {
  const luShown = useRef(null);
  return (
    <section>
      <h2>LU decomposition by elimination</h2>

      {/* the user's words (once "Subtract multiples of each row from the rows below it, until upper triangular:") */}
      <p>
        Perform row operations to make <Tex tex="A" /> upper triangular:
      </p>

      <div className="l23-elim-steps">
        <Tex tex="A=" />
        <ElimMatrix before={NA} />
        <Fragment index={1} className="l23-elim-step">
          <OpArrow
            labels={[
              { pre: 'R_2', mult: '2', post: 'R_1', slot: '21' },
              { pre: 'R_3', mult: '4', post: 'R_1', slot: '31' },
            ]}
          />
          <ElimMatrix
            before={NA}
            after={NA1}
            ops={[
              { from: 0, to: 1, c: -2 },
              { from: 0, to: 2, c: -4 },
            ]}
          />
        </Fragment>
        <Fragment index={2} className="l23-elim-step">
          <OpArrow labels={[{ pre: 'R_3', mult: '3', post: 'R_2', slot: '32' }]} />
          <ElimMatrix before={NA1} after={NU} ops={[{ from: 1, to: 2, c: -3 }]} upper />
          <span className="l23-elim-isU">
            <Tex tex={`=${U}`} />
          </span>
        </Fragment>
      </div>

      <span ref={luShown} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
      <Fragment index={3} className="l23-elim-lu">
        <Tex tex={`${A}=${named(LL, L)}${named(UU, col(AMBER, 'U'))}`} />
      </Fragment>
      <MultiplierFlight trigger={luShown} slots={SLOTS} />
    </section>
  );
}
