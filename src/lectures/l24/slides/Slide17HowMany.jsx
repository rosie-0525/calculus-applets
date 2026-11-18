import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { useMarkers } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { A0, texMh } from '../components/eig.js';
// What the three matrices do's animations (the user's request: moved here, in place of the parabolas)
import { CARDS as MOVES, Scene } from './Slide17bHowManyMoves.jsx';

export const PLAY = { ms: 2800, delay: 1000 };
export const UNIT = 56; // What the three matrices do: 62

export const CARDS = [
  {
    m: texMh(A0),
    p: r`\lambda^2-2\lambda+\tfrac34`,
    f: r`{}=(\lambda-\tfrac12)(\lambda-\tfrac32)`,
    verdict: (
      <>
        eigenvalues <Tex tex={r`\tfrac12`} /> and <Tex tex={r`\tfrac32`} />
      </>
    ),
  },
  {
    m: r`\begin{bmatrix}1&1\\0&1\end{bmatrix}`,
    p: r`\lambda^2-2\lambda+1`,
    f: r`{}=(\lambda-1)^2`,
    verdict: <>eigenvalue 1</>,
  },
  {
    m: r`\begin{bmatrix}0&-1\\1&0\end{bmatrix}`,
    p: r`\lambda^2+1`,
    f: r`{}>0`,
    verdict: <span className="l24-not">no eigenvalue</span>,
  },
];

/**
 * How many eigenvalues? (the textbook's Corollary 23.3.2 and Example 23.3.6): three matrices, each
 * with "P_A(λ)" (there on arrival). Each matrix on three key presses (the user's request; 1–3, 4–6,
 * 7–9): its polynomial after P_A(λ); on a new line under it, factored (= (λ − 1/2)(λ − 3/2),
 * = (λ − 1)²; > 0 for the rotation, no factors over ℝ), to show its eigenvalues; its picture, and a
 * moment later T_A moves the grid, the unit square and F, with its eigenlines
 * (What the three matrices do's animations, moved here in place of the parabolas, the user's request),
 * and its eigenvalues: two
 * (the running example, Stretch and shrink's A = [1 1/2; 1/2 1], the user's request, in place of
 * [2 −1; −1 2]), one (a shear), none (the rotation by 90°, of the poll). (Each one's parabola, with
 * its roots, and the sign of the discriminant tr(A)² − 4 det(A) under each, removed by the user.)
 */
export default function Slide17HowMany() {
  // each matrix on three key presses: 3k + 1 its polynomial, 3k + 2 its factors, 3k + 3 its picture
  const [markers, on] = useMarkers([3, 6, 9]);
  const ts = [useTween(on[0], PLAY), useTween(on[1], PLAY), useTween(on[2], PLAY)];
  return (
    <section>
      <h2>How many eigenvalues?</h2>
      {markers}

      <div className="l24-many">
        {CARDS.map((c, k) => (
          <div key={c.p} className="l24-many-card">
            <p className="l24-many-m">
              <Tex tex={`A=${c.m}`} />
            </p>
            <p className="l24-many-p">
              <Tex tex={r`P_A(\lambda)`} />
              <span className="l24-many-pf">
                <Fragment index={3 * k + 1} as="span">
                  <Tex tex={`{}=${c.p}`} />
                </Fragment>
                <Fragment index={3 * k + 2} as="span">
                  <Tex tex={c.f} />
                </Fragment>
              </span>
            </p>
            <Fragment index={3 * k + 3}>
              <Scene card={MOVES[k]} t={PRINT ? 1 : ts[k]} unit={UNIT} />
              <p className="l24-many-v">{c.verdict}</p>
            </Fragment>
          </div>
        ))}
      </div>
    </section>
  );
}
