import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import ProjPicture from '../lectures/l14/components/ProjPicture.jsx';

export const lecture = 14;

/*
 * Projections without the claim and Example 2 (the caption says and asks them): its matrix, by its
 * columns, beside the picture for w = (1, 2), e₁ and e₂ with their projections onto the line
 * through w (dotted perpendiculars, right angles), which the slide shows on a key press.
 */
export default function ProjectionMatrix() {
  return (
    <div className="stage l14-proj-stage">
      <div className="stage-text">
        <p className="proj-matrix">
          The matrix of <Tex tex={r`\operatorname{Proj}_{\vv w}`} /> is
        </p>
        <Tex display tex={r`\left[\,\operatorname{Proj}_{\vv w}(\vv e_1)\;\;\cdots\;\;\operatorname{Proj}_{\vv w}(\vv e_n)\,\right].`} />
      </div>

      <div className="stage-fig">
        <ProjPicture index={2} unit={128} />
      </div>
    </div>
  );
}
