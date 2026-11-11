import '../lectures/l22/styles/deck.css';
import Tex, { r } from '../lectures/l22/components/Tex.jsx';
import { LoopPic, SYSTEM_MAPS, RANK1_MAP } from '../lectures/l22/components/ImageCards.jsx';

export const lecture = 22;

/*
 * Going back to linear systems, without its title and its recall (the caption has it): the remark
 * in a T-chart, each side with its matrix beside its picture, played once (the inputs move onto
 * their outputs, the image lights up, then b, a green arrow): dim C(A) = m, every Ax = b has a
 * solution (A = [1 1; 0 1], the image all of ℝ², b in it); dim C(A) < m, "most" b are not in C(A)
 * (A = [1 2; 1 2], the image a line, b off it). In both pictures b can be dragged by its tip; close
 * to the line it lands on it. On the slide each side comes on a key press; here both at once.
 */
export default function BackToSystems() {
  return (
    <div className="l22-tchart">
      <div className="l22-tcol">
        <p className="l22-thead">
          <Tex tex={r`\dim C(A)=m`} />
        </p>
        <p>
          Every <Tex tex={r`A\vv x=\vv b`} /> has a solution
        </p>
        <div className="l22-back-pic">
          <Tex tex={r`A=\begin{bmatrix}1&1\\0&1\end{bmatrix}`} />
          <LoopPic index={0} ex={SYSTEM_MAPS[1]} once drag />
        </div>
      </div>
      <div className="l22-tcol">
        <p className="l22-thead">
          <Tex tex={r`\dim C(A)<m`} />
        </p>
        <p>
          “Most” <Tex tex={r`\vv b\in\mathbb R^m`} /> are not in <Tex tex="C(A)" />
        </p>
        <div className="l22-back-pic">
          <Tex tex={r`A=\begin{bmatrix}1&2\\1&2\end{bmatrix}`} />
          <LoopPic index={0} ex={RANK1_MAP} once drag />
        </div>
      </div>
    </div>
  );
}
