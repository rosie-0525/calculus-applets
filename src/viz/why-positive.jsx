import { useState } from 'react';
import '../lectures/l16/styles/deck.css';
import Tex, { r } from '../lectures/l16/components/Tex.jsx';
import { Diagram, SWAP, STAY } from '../lectures/l16/slides/Slide12bWhyPositive.jsx';

export const lecture = 16;

/*
 * Why all positive entries?: the two ways things can go wrong, each a card with its two islands
 * and their arrows, its matrix and what goes wrong (periodic, M = [0 1; 1 0]: M^k has no limit;
 * reducible, M = I₂: the long run depends on p₀), and under them, without proof, the box: some
 * power of M has all positive entries exactly when the chain is irreducible and aperiodic. On the
 * slide the second card, the consequences and the box come one per key press; here each card's
 * consequence shows when its button is pressed.
 */
export default function WhyPositive() {
  const [open, setOpen] = useState([]);
  const show = (k, line) =>
    open.includes(k) ? (
      line
    ) : (
      <p className="l16-why-so">
        <button type="button" className="viz-button" onClick={() => setOpen((v) => [...v, k])}>
          What goes wrong?
        </button>
      </p>
    );
  return (
    <div className="why-col">
      <p className="l16-why-only">There are two ways things can go wrong:</p>

      <div className="l16-cards l16-why-cards">
        <div className="l16-card l16-why-card periodic">
          <p className="l16-why-tag">Periodic</p>
          <Diagram arrows={SWAP} />
          <div className="l16-why-row">
            <Tex tex={r`M=\begin{bmatrix}0&1\\ 1&0\end{bmatrix}`} />
            <div>
              <p>A bird is back on its island only every 2 years: period 2.</p>
              {show(
                0,
                <p className="l16-why-so">
                  <Tex tex="M^k" /> has no limit: <Tex tex={r`M,\ I_2,\ M,\ I_2,\ \ldots`} />
                </p>,
              )}
            </div>
          </div>
        </div>

        <div className="l16-card l16-why-card reducible">
          <p className="l16-why-tag">Reducible</p>
          <Diagram arrows={STAY} />
          <div className="l16-why-row">
            <Tex tex={r`M=\begin{bmatrix}1&0\\ 0&1\end{bmatrix}`} />
            <div>
              <p>The birds on island 1 can never reach island 2.</p>
              {show(
                1,
                <p className="l16-why-so">
                  <Tex tex={r`M^k\mathbf p_0=\mathbf p_0`} />: the long run depends on <Tex tex={r`\mathbf p_0`} />.
                </p>,
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="block theorem l16-why-box">
        <p>
          Some power of <Tex tex="M" /> has all positive entries exactly when the Markov chain is
        </p>
        <ul className="bullets">
          <li>
            <strong>irreducible</strong>: from every state, the chain can reach every state, and
          </li>
          <li>
            <strong>aperiodic</strong>: no state can be returned to only at multiples of some <Tex tex={r`d\ge2`} /> steps.
          </li>
        </ul>
      </div>
    </div>
  );
}
