import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import { Step, Turning } from '../lectures/l14/slides/Slide18Order.jsx';
import { PANELS, C1, C2 } from '../lectures/l14/slides/Slide18bMatrices.jsx';

export const lecture = 14;

/*
 * The algebra behind with every step showing: R₁ and R₂ side by side, each a pumpkin ball turning on
 * a loop (while the applet is on screen), its label and its matrix, A, then B; under them,
 * R₂ ∘ R₁ = BA and R₁ ∘ R₂ = AB.
 */
export default function OrderAlgebra() {
  return (
    <div className="viz-col alg-col">
      <div className="l14-alg-panels">
        {PANELS.map(({ s, tex }, m) => (
          <figure key={s.name} className="l14-alg-panel">
            <Turning index={m + 1} s={s} loop />
            <Step s={s} index={m + 1} />
            <Tex tex={tex} />
          </figure>
        ))}
      </div>

      <p className="l14-alg-check">
        <Tex tex={r`${C2}\circ ${C1}=BA=\begin{bmatrix}0&0&1\\ 1&0&0\\ 0&1&0\end{bmatrix}`} /> and{' '}
        <Tex tex={r`${C1}\circ ${C2}=AB=\begin{bmatrix}0&-1&0\\ 0&0&1\\ -1&0&0\end{bmatrix}`} />.
      </p>
    </div>
  );
}
