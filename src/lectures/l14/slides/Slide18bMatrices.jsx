import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { R1, R2, Step, Turning } from './Slide18Order.jsx';

export const PANELS = [
  { s: R1, tex: r`A=\begin{bmatrix}0&-1&0\\ 1&0&0\\ 0&0&1\end{bmatrix}` },
  { s: R2, tex: r`B=\begin{bmatrix}0&0&1\\ 0&1&0\\ -1&0&0\end{bmatrix}` },
];

// R₁ and R₂ in BA and AB, in their colours
export const C1 = r`\textcolor{${R1.color}}{R_1}`;
export const C2 = r`\textcolor{${R2.color}}{R_2}`;

/**
 * The algebra behind (Order matters' matrices). Key presses 1, 2: R₁, then R₂, each a ball that turns
 * on a loop from the start (Slide18Order.jsx's Turning), its label and its matrix, A, then B;
 * 3: R₂ ∘ R₁ = BA = …; 4: and R₁ ∘ R₂ = AB = … (R₁ and R₂ in their colours).
 */
export default function Slide18bMatrices() {
  return (
    <section className="dense">
      <h2>The algebra behind</h2>

      <div className="l14-alg-panels">
        {PANELS.map(({ s, tex }, m) => (
          <Fragment key={s.name} index={m + 1} as="figure" className="l14-alg-panel">
            <Turning index={m + 1} s={s} loop />
            <Step s={s} index={m + 1} />
            <Tex tex={tex} />
          </Fragment>
        ))}
      </div>

      <Fragment index={3} as="p" className="l14-alg-check">
        <Tex tex={r`${C2}\circ ${C1}=BA=\begin{bmatrix}0&0&1\\ 1&0&0\\ 0&1&0\end{bmatrix}`} />
        <Fragment index={4} as="span">
          {' '}
          and <Tex tex={r`${C1}\circ ${C2}=AB=\begin{bmatrix}0&-1&0\\ 0&0&1\\ -1&0&0\end{bmatrix}`} />.
        </Fragment>
      </Fragment>
    </section>
  );
}
