import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import SpacesChart from '../components/SpacesChart.jsx';

/**
 * Eigenspace (the user's request: Sums of eigenvectors turned into this slide; the file keeps its
 * name). The definition in the user's words: the space of all eigenvectors with eigenvalue λ (the
 * user's words; before, all eigenvectors (and zero)), {v ∈ ℝⁿ : Av = λv} = N(A − λIₙ), is a linear
 * subspace, the λ-eigenspace (Lecture 22's test for
 * linear subspaces and its conclusion, ⟹ V = {v : Av = λv}, removed by the user; the check, 0 ∈ V and
 * A(av + bw) = λ(av + bw), Mark's remark with λ = μ, is on the board). Its applet and sentence, a sum of
 * eigenvectors with the same eigenvalue is an eigenvector, T = 2I moving v, w and v + w, are now on the
 * Poll after Eigenspace (Slide10cPollSums; the picture in SumScene.jsx), the user's request. Under
 * the definition, Examples 1 and 2 (SpacesChart.jsx; once Eigenspaces in Examples 1 and 2, the slide
 * after this one: the user's request), key presses 1–14, each eigenspace lighting up in its picture
 * with its name (13: "0-eigenspace = N(B)"); the definition a little smaller, to make room. 15: at the
 * end of the definition's last line, in particular, the 0-eigenspace of A is N(A) (the user's request:
 * Example 2's case first, then the general fact).
 */
export default function Slide10Sums() {
  return (
    <section>
      <h2>Eigenspace</h2>

      <div className="block definition l24-space-def">
        <p className="block-title">Definition</p>
        <p>
          The space of all eigenvectors with eigenvalue <Tex tex={r`\lambda`} />
        </p>
        <Tex display tex={r`\{\vv v\in\mathbb R^n: A\vv v=\lambda\vv v\}=N(A-\lambda I_n)`} />
        <p>
          is a linear subspace, and it is called the{' '}
          <strong>
            <Tex tex={r`\lambda`} />
            -eigenspace
          </strong>
          .{' '}
          <Fragment index={15} as="span">
            In particular, the <Tex tex="0" />
            -eigenspace of <Tex tex="A" /> is <Tex tex="N(A)" />.
          </Fragment>
        </p>
      </div>
      <SpacesChart />
    </section>
  );
}
