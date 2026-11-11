import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import ProductSteps from '../components/ProductSteps.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { RED, BLUE, AMBER } from '../components/tr.js';

export const c = (col, tex) => r`\textcolor{${col}}{${tex}}`;
export const rowA = c(BLUE, r`\text{row }j\text{ of }A`);
export const colB = c(AMBER, r`\text{column }i\text{ of }B`);
export const colAt = c(BLUE, r`\text{column }j\text{ of }A^{\top}`);
export const rowBt = c(AMBER, r`\text{row }i\text{ of }B^{\top}`);
/**
 * The derivation (the first line without "="), a key press per part: one part per line, except the
 * fourth, whose two factors come on two key presses, Bᵀ's then Aᵀ's, in one row (the user's request).
 * (A line (column j of Aᵀ) · (row i of Bᵀ) before it was removed at the user's request.)
 */
export const LINES = [
  [r`${c(RED, r`(i,j)\text{-th entry}`)}\text{ of }(AB)^{\top}`],
  [r`${c(RED, r`(j,i)\text{-th entry}`)}\text{ of }AB`],
  [r`(${rowA})\cdot(${colB})`],
  [r`(${rowBt})`, r`{}\cdot(${colAt})`],
  [r`${c(RED, r`(i,j)\text{-th entry}`)}\text{ of }B^{\top}A^{\top}`],
];
export const STEPS = LINES.flat().length;
export let part = 0;
export const INDEX = LINES.map((parts) => parts.map(() => (part += 1))); // the key press of each part

/** A marker for key press `index` and a number gliding from 0 to 1 once it is reached. */
export function useStep(index) {
  const ref = useRef(null);
  const t = useTween(useFragmentShown(ref), { ms: 1300, delay: 250 });
  return [t, <span key={index} ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />];
}

/** In print, the picture at step k, shown from key press k until the next. */
export function Still({ k }) {
  const still = <ProductSteps p={k} />;
  if (k === 0) return <Fragment index={1} effect="fade-out">{still}</Fragment>;
  if (k === STEPS) return <Fragment index={k}>{still}</Fragment>;
  return (
    <Fragment index={k}>
      <Fragment index={k + 1} effect="fade-out">
        {still}
      </Fragment>
    </Fragment>
  );
}

/**
 * Transpose of a product: (AB)ᵀ = BᵀAᵀ (Mark's box), derived slowly (the user's request), a line per
 * key press, 1–6: the (i, j)-th entry of (AB)ᵀ = the (j, i)-th entry of AB = (row j of A) · (column i
 * of B) = (row i of Bᵀ) · (column j of Aᵀ) (one row, its factors on two key presses, Bᵀ's then Aᵀ's:
 * the user's request) = the (i, j)-th entry of BᵀAᵀ. Beside it, ProductSteps moves in step, with
 * i = 3, j = 2, in two rows (the user's request):
 * (AB)ᵀ and its entry (3, 2) on the top row; AB, its entry (2, 3), coming down under it (not (AB)ᵀ
 * turning into AB); A and B on the bottom row, row 2 of A (blue) and column 3 of B (amber): A B = AB;
 * copies of B, then A, rising and flipping into Bᵀ, Aᵀ, each with its factor and straight to its
 * place on the top row,
 * Bᵀ Aᵀ = (AB)ᵀ (so that no product that makes no sense, AᵀBᵀ or BA, is ever shown); the top row's "="
 * last. The colours of the rows, columns and entries match the derivation's. ((A⁻¹)ᵀ = (Aᵀ)⁻¹ moved to
 * More properties of the transpose, at the user's request.) The box at the top of the left column, half
 * the width, to leave room for the picture (the user's request); "Why?" in green comes with the first
 * line, the derivation indented under it. Print: a still per key press.
 */
export default function Slide05ProductTranspose() {
  const steps = Array.from({ length: STEPS }, (_, k) => k + 1);
  const tweens = steps.map((k) => useStep(k)); // eslint-disable-line react-hooks/rules-of-hooks -- a fixed number of steps
  const p = tweens.reduce((sum, [t]) => sum + t, 0);
  return (
    <section>
      <h2>Transpose of a product</h2>

      <div className="l21-pt-body">
        <div className="l21-pt-left">
          <div className="block theorem l21-pt-box">
            <Tex display tex={r`(AB)^{\top}=B^{\top}A^{\top}`} />
          </div>
          <Fragment index={1} as="p" className="l21-pt-why">
            Why?
          </Fragment>
          <div className="l21-pt-lines">
            {LINES.map((parts, k) => (
              <Fragment key={parts[0]} index={INDEX[k][0]} className="l21-pt-line">
                <span>{k > 0 && <Tex tex="=" />}</span>
                <span>
                  <Tex tex={parts[0]} />
                  {parts.slice(1).map((tex, m) => (
                    <Fragment key={tex} index={INDEX[k][m + 1]} as="span">
                      <Tex tex={tex} />
                    </Fragment>
                  ))}
                </span>
              </Fragment>
            ))}
          </div>
        </div>

        <div className="l21-pt-fig">
          {tweens.map(([, marker]) => marker)}
          {PRINT ? (
            <div className="l21-stack">
              {[0, ...steps].map((k) => (
                <Still key={k} k={k} />
              ))}
            </div>
          ) : (
            <ProductSteps p={p} />
          )}
        </div>
      </div>
    </section>
  );
}
