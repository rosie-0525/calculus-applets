import '../lectures/l16/styles/deck.css';
import Tex, { r } from '../lectures/l16/components/Tex.jsx';
import { Ladder } from '../lectures/l16/slides/Slide18Gambler.jsx';

export const lecture = 16;

/*
 * Gambler's ruin: your money, $0 to $100, as the states of a Markov chain (red, ½, up $20; black,
 * ½, down $20; $0 and $100 where you stay), its 6 × 6 Markov matrix M in p(n + 1) = M p(n), so
 * p(n) = Mⁿ p(0), and, in a card of its own, what p(n) is, with p(0) and p(1). On the slide the
 * diagram comes one state's spins per key press, then the rest one by one; here all at once.
 */
export default function GamblersRuin() {
  return (
    <div className="viz-col gr-col">
      <div className="l16-ladder-wrap">
        <Ladder width={940} />
      </div>
      <div className="l16-gr-row">
        <div className="l16-gr-m">
          <Tex
            display
            tex={r`\mathbf p(n+1)=\underbrace{\begin{bmatrix}1&\frac12&0&0&0&0\\[1pt] 0&0&\frac12&0&0&0\\[1pt] 0&\frac12&0&\frac12&0&0\\[1pt] 0&0&\frac12&0&\frac12&0\\[1pt] 0&0&0&\frac12&0&0\\[1pt] 0&0&0&0&\frac12&1\end{bmatrix}}_{M}\mathbf p(n)`}
          />
          <Tex display tex={r`\mathbf p(n)=M^n\,\mathbf p(0)`} />
        </div>
        <div className="l16-gr-p">
          <p>
            <Tex tex={r`\mathbf p(n)`} />: the probabilities that you have
            <br />
            $0, $20, …, $100 after <Tex tex="n" /> spins
          </p>
          <div className="l16-gr-eg">
            <span>e.g.</span>
            <Tex display className="tex-left" tex={r`\mathbf p(0)=(0,0,1,0,0,0)`} />
          </div>
          <div className="l16-gr-eg">
            <span className="l16-gr-eg-pad" aria-hidden="true">
              e.g.
            </span>
            <Tex display className="tex-left" tex={r`\mathbf p(1)=\left(0,\tfrac12,0,\tfrac12,0,0\right)`} />
          </div>
        </div>
      </div>
    </div>
  );
}
