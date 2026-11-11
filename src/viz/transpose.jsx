import { useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import FlipMatrix from '../lectures/l21/components/FlipMatrix.jsx';
import { useGlide } from '../lectures/l21/components/useFragmentTween.js';
import { A, CELL, LEFT } from '../lectures/l21/slides/Slide02Transpose.jsx';
import { A1 } from '../lectures/l21/slides/Slide03Poll.jsx';

export const lecture = 21;

/** The width of an SVG box for a matrix `k` entries wide, its name left of it (as on the slide). */
const box = (k) => LEFT[0] + k * CELL + 36;

const MATRICES = [
  { name: '2 × 3', rows: A },
  { name: '3 × 4', rows: A1 },
];

/*
 * Matrix transpose, without its title and its definition (the caption has it): the textbook's
 * example A = [1 2 3; 4 5 6] and a copy of it flipping across its diagonal into Aᵀ, each row in its
 * colour turning into a column, the sizes under them; beside them, the (i, j)-th entry of Aᵀ = the
 * (j, i)-th entry of A. On the slide the copy flips once, on a key press; here a button flips it and
 * back, and another picks the matrix: the slide's, or the 3 × 4 of the title slide (and of
 * Properties of the transpose). A and the copy are two pictures, side by side (one under the other in
 * a narrow box, see site.css).
 */
export default function Transpose() {
  const [pick, setPick] = useState(0);
  const [flip, setFlip] = useState(false);
  const [t, setT] = useGlide(flip ? 1 : 0, 1500);
  const { rows } = MATRICES[pick];
  const cols = rows[0].length;
  const side = Math.max(rows.length, cols); // the copy's room: m × n, then n × m, and its diagonal
  const height = side * CELL + 82;
  return (
    <div className="viz-col tp">
      <div className="viz-toggle" role="group" aria-label="The matrix">
        {MATRICES.map((m, k) => (
          <button
            key={m.name}
            type="button"
            className="viz-button"
            aria-pressed={pick === k}
            onClick={() => {
              setPick(k);
              setFlip(false);
              setT(0);
            }}
          >
            A {m.name} matrix
          </button>
        ))}
      </div>
      <div className="l21-flip-row tp-row">
        <div className="tp-pair" key={pick}>
          <svg viewBox={`0 0 ${box(cols)} ${height}`} width={box(cols)} height={height} role="img" aria-label="A matrix">
            <FlipMatrix rows={rows} t={0} x={LEFT[0]} y={LEFT[1]} cell={CELL} font={36} size label="A" />
          </svg>
          <svg viewBox={`0 0 ${box(side)} ${height}`} width={box(side)} height={height} role="img" aria-label="A copy of it, flipping across its diagonal into its transpose">
            <FlipMatrix rows={rows} t={t} x={LEFT[0]} y={LEFT[1]} cell={CELL} font={36} diag size label="A" />
          </svg>
        </div>
        <div className="l21-entry-rule">
          <span className="nowrap">
            <Tex tex="(i,j)" />-th entry of <Tex tex={r`A^{\top}`} />
          </span>
          <span className="nowrap">
            <Tex tex="=" /> <Tex tex="(j,i)" />-th entry of <Tex tex="A" />
          </span>
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={flip} onClick={() => setFlip((f) => !f)}>
          {flip ? 'Flip back' : 'Transpose the copy'}
        </button>
      </div>
    </div>
  );
}
