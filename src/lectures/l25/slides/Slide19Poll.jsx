import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Space from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';
import { qA } from '../components/spec.js';

export const R = [-1.4, 1.4];
export const saddle = (x, y) => x * x + 4 * x * y + y * y;
export const CARDS = [
  { m: r`\begin{bmatrix}1&2\\2&1\end{bmatrix}`, why: [r`q_A(1,-1)=-2`], verdict: 'indefinite', f: saddle, z: 0.085, c: 0.66, title: 'The graph of x² + 4xy + y², a saddle' },
  { m: r`\begin{bmatrix}13&-3\\-3&5\end{bmatrix}`, why: [], verdict: 'positive-definite', f: qA, z: 0.03, c: 0.84, title: 'The graph of 13x² − 6xy + 5y², a bowl' },
];

/**
 * Poll, by show of hands, right after Definiteness (the user's request: so that the students see that
 * it is not obvious how to tell if a quadratic form is positive-definite, which leads to the
 * Diagonalization formula, the next slide; it was after Definiteness and eigenvalues, its reasons the
 * eigenvalues 3, −1 and 14, 4, and its last line the slogan "Definiteness: the signs of the
 * eigenvalues, not of the entries"). The textbook's Remark 24.2.11, a chapter highlight: definiteness
 * can't be read off the signs of the entries. True or false, if all entries of a symmetric matrix are
 * positive, then it is positive-definite. Key press 1: False is outlined; 2: why, for [1 2; 2 1],
 * q_A(1, −1) = −2, so it is indefinite, beside the graph of its quadratic form, a saddle; 3: the other
 * way round, Example 1's [13 −3; −3 5] has negative entries and is positive-definite, beside its bowl
 * (its reason, q_A(c₁w₁ + c₂w₂) = 140c₁² + 40c₂², removed: the poll now comes before Example 1, the
 * user's order, Recall: quadratic forms, Definiteness, Poll, Example 1); 4: the owl's question, how to
 * tell if a quadratic form is positive-definite?, which Example 1 answers.
 */
export default function Slide19Poll() {
  return (
    <section>
      <h2>Poll</h2>

      <FxMarker index={1} id="poll-answer" />
      <div className="block poll fx-host">
        <p>
          <strong>True or false?</strong> If all entries of a symmetric matrix are positive, then it is positive-definite.
        </p>
        <ul className="poll-options two">
          <li>
            <span className="opt">a)</span> True
          </li>
          <li className="correct">
            <span className="opt">b)</span> False
          </li>
        </ul>
      </div>

      <div className="l25-signs">
        {CARDS.map((c, k) => (
          <Fragment key={c.verdict} index={k + 2} className="l25-sign">
            <div className="l25-sign-text">
              <p>
                <Tex tex={c.m} />
              </p>
              {c.why.map((tex) => (
                <p key={tex}>
                  <Tex tex={tex} />
                </p>
              ))}
              <p className="l25-sign-verdict">{c.verdict}</p>
            </div>
            <Space width={300} height={190} unit={50} center={[0.5, c.c]} el={22} axes={false} rock={false} title={c.title}>
              {(s) => <Surface s={s} f={c.f} x={R} y={R} n={26} zScale={c.z} mesh="rgba(15, 40, 50, 0.16)" />}
            </Space>
          </Fragment>
        ))}
      </div>

      <Fragment index={4} as="p" className="question l25-signs-q">
        How to tell if a quadratic form is positive-definite?
      </Fragment>
    </section>
  );
}
