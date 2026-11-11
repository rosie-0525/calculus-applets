import { useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import ProductSteps from '../lectures/l21/components/ProductSteps.jsx';
import { useGlide } from '../lectures/l21/components/useFragmentTween.js';
import { LINES, INDEX, STEPS } from '../lectures/l21/slides/Slide05ProductTranspose.jsx';
import { from } from './redundancies.jsx';

export const lecture = 21;

/*
 * Transpose of a product, without its title: Mark's box, (AB)ᵀ = BᵀAᵀ, then "Why?" and the
 * derivation, a part per step: the (i, j)-th entry of (AB)ᵀ = the (j, i)-th entry of AB = (row j of
 * A) · (column i of B) = (row i of Bᵀ) · (column j of Aᵀ) (its two factors on two steps) = the
 * (i, j)-th entry of BᵀAᵀ. Beside it, ProductSteps moves in step, with i = 3, j = 2: (AB)ᵀ and its
 * entry (3, 2); AB, its entry (2, 3), coming down under it; A and B on the bottom row, row 2 of A and
 * column 3 of B: A B = AB; copies of B, then A, rising and flipping into Bᵀ, Aᵀ, straight to their
 * places on the top row; the top row's "=" last, Bᵀ Aᵀ = (AB)ᵀ. On the slide the steps come one key
 * press at a time; here it starts at the first, "Why?" and (AB)ᵀ with its entry (3, 2), a button
 * takes the next step (the picture glides there), another starts again.
 */
export default function ProductTranspose() {
  const [n, setN] = useState(1);
  const [p] = useGlide(n, 1300);
  return (
    <div className="viz-col ptr">
      <div className="l21-pt-body">
        <div className="l21-pt-left">
          <div className="block theorem l21-pt-box">
            <Tex display tex={r`(AB)^{\top}=B^{\top}A^{\top}`} />
          </div>
          <p className="l21-pt-why" style={from(n, 1)}>
            Why?
          </p>
          <div className="l21-pt-lines">
            {LINES.map((parts, k) => (
              <div key={parts[0]} className="l21-pt-line" style={from(n, INDEX[k][0])}>
                <span>{k > 0 && <Tex tex="=" />}</span>
                <span>
                  <Tex tex={parts[0]} />
                  {parts.slice(1).map((tex, m) => (
                    <span key={tex} style={from(n, INDEX[k][m + 1])}>
                      <Tex tex={tex} />
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="l21-pt-fig">
          <ProductSteps p={p} />
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" disabled={n >= STEPS} onClick={() => setN((k) => Math.min(STEPS, k + 1))}>
          Next step
        </button>
        <button type="button" className="viz-button" disabled={n <= 1} onClick={() => setN(1)}>
          Start again
        </button>
      </div>
    </div>
  );
}
