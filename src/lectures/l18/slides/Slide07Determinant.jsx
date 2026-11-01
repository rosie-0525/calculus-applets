import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import { BLUE, RED } from '../components/inv.js';

/**
 * Determinant: Mark's box, split into the definition and the criterion (the textbook's Definition
 * 18.2.4, Example 18.2.1, Remark 18.2.3), the boxes without titles of their own. Under them the
 * textbook's recipe for A⁻¹, done on [a b; c d] in place (CSS, switched by FxMarkers): key press 1:
 * a and d swap places (blue); 2: b and c change sign (red); 3: divided by ad − bc, and A becomes
 * A⁻¹. (The check, A times [d −b; −c a] is (ad − bc)I₂, removed by the user.)
 */
export default function Slide07Determinant() {
  const cell = (name, tex) => (
    <span className={`l18-cell ${name}`}>
      {(name === 'b' || name === 'c') && <span className="l18-minus">−</span>}
      <Tex tex={tex} />
    </span>
  );
  return (
    <section className="dense">
      <h2>Determinant</h2>

      <div className="block definition">
        <p>
          The <strong>determinant</strong> of a <Tex tex={r`2\times 2`} /> matrix <Tex tex={r`A=\begin{bmatrix}a&b\\c&d\end{bmatrix}`} /> is defined as{' '}
          <span className="l15-nowrap">
            <Tex tex={r`\det(A)=ad-bc`} />.
          </span>
        </p>
      </div>
      <div className="block theorem">
        <p>
          If <Tex tex={r`\det(A)\neq 0`} />, then <Tex tex="A" /> is invertible and <Tex tex={r`A^{-1}=\dfrac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}`} />.
        </p>
        <p>
          If <Tex tex={r`\det(A)=0`} />, then <Tex tex="A" /> is not invertible.
        </p>
        <p className="pointer corner">(→ Remark 18.2.3)</p>
      </div>

      <FxMarker index={1} id="swap" />
      <FxMarker index={2} id="sign" />
      <FxMarker index={3} id="divide" />
      <div className="l18-recipe fx-host">
        <div className="l18-recipe-name">
          <span className="l18-name-a">
            <Tex tex="A=" />
          </span>
          <span className="l18-name-inv">
            <Tex tex="A^{-1}=" />
          </span>
        </div>
        <span className="l18-recipe-factor">
          <Tex tex={r`\dfrac{1}{ad-bc}`} />
        </span>
        <span className="l18-mat">
          {cell('a', 'a')}
          {cell('b', 'b')}
          {cell('c', 'c')}
          {cell('d', 'd')}
        </span>
        <ol className="l18-recipe-steps">
          <Fragment index={1} as="li">
            swap <Tex tex={r`\textcolor{${BLUE}}{a}`} /> and <Tex tex={r`\textcolor{${BLUE}}{d}`} />
          </Fragment>
          <Fragment index={2} as="li">
            change the signs of <Tex tex={r`\textcolor{${RED}}{b}`} /> and <Tex tex={r`\textcolor{${RED}}{c}`} />
          </Fragment>
          <Fragment index={3} as="li">
            divide by <Tex tex={r`\det(A)=ad-bc`} />
          </Fragment>
        </ol>
      </div>
    </section>
  );
}
