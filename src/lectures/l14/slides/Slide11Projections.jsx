import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import ProjPicture from '../components/ProjPicture.jsx';

/**
 * Projections (Mark's Example 2): Proj_w is linear, in a box across the slide; under it, the rest
 * beside the picture. Key press 1: because Proj_w(av₁ + bv₂) = a Proj_w(v₁) + b Proj_w(v₂) (the
 * period moves after the formula, `l14-proj-stop` in deck.css); 2: its matrix, [Proj_w(e₁) ⋯
 * Proj_w(eₙ)], and the projections of e₁ and e₂ on the picture (w = (1, 2)); 3: Example 2 (board),
 * its matrix for that w, the answer commented out; 4: the same for Proj_V (→ Example 14.2.2, which
 * works out a 5 × 5 one).
 */
export default function Slide11Projections() {
  return (
    <section className="dense">
      <h2>Projections</h2>

      <FxMarker index={1} id="proj-why" />
      <div className="block theorem l14-proj-lead">
        <p>
          For a nonzero <Tex tex="n" />
          -vector <Tex tex={r`\vv w`} />,{' '}
          <Tex className="l14-nowrap" tex={r`\operatorname{Proj}_{\vv w}:\mathbb R^n\to\mathbb R^n`} /> is a linear function
          <span className="l14-proj-stop">.</span>
          <Fragment index={1} as="span">
            , because
          </Fragment>
        </p>
        <Fragment index={1}>
          <Tex
            display
            tex={r`\operatorname{Proj}_{\vv w}(a\vv v_1+b\vv v_2)=a\operatorname{Proj}_{\vv w}(\vv v_1)+b\operatorname{Proj}_{\vv w}(\vv v_2).`}
          />
        </Fragment>
      </div>

      <div className="stage l14-proj-stage">
        <div className="stage-text">
          <Fragment index={2} as="p" className="l14-proj-matrix">
            Its matrix is given by{' '}
            <Tex tex={r`\left[\,\operatorname{Proj}_{\vv w}(\vv e_1)\;\;\cdots\;\;\operatorname{Proj}_{\vv w}(\vv e_n)\,\right]`} />
          </Fragment>

          <Fragment index={3} as="p" className="l14-eg">
            <strong>Example 2</strong> <span className="board-pill">board</span> For{' '}
            <Tex tex={r`\vv w=\begin{bmatrix}1\\ 2\end{bmatrix}`} />, find the matrix of{' '}
            <Tex tex={r`{\operatorname{Proj}_{\vv w}}.`} />
          </Fragment>
          {/* Proj_w(e₁) = (1/5)w, Proj_w(e₂) = (2/5)w; the matrix is [1/5 2/5; 2/5 4/5] = (1/5)[1 2; 2 4] */}

          <Fragment index={4} as="p" className="l14-proj-v">
            Likewise for <Tex tex={r`\operatorname{Proj}_V`} />, where <Tex tex="V" /> is a linear subspace of{' '}
            <Tex tex={r`\mathbb R^n`} />. <span className="pointer">→ Example 14.2.2</span>
          </Fragment>
        </div>

        <div className="stage-fig">
          <ProjPicture index={2} unit={128} />
        </div>
      </div>
    </section>
  );
}
