import '../lectures/l12/styles/deck.css';
import Tex, { r } from '../lectures/l12/components/Tex.jsx';
import SodaCan from '../lectures/l12/components/SodaCan.jsx';

export const lecture = 12;

/*
 * Example 3 with every step showing, without the problem in words (the caption asks it): the
 * problem in math, in blue, on two rows, beside the opener's can, its radius r on a slider, its
 * height h and the aluminum it takes. It starts at a real can's shape (h ≈ 3.7r); the least
 * aluminum is at h = 2r.
 */
export default function Can() {
  return (
    <div className="stage can-stage">
      <div className="stage-text">
        <div className="l12-lambda-problem l12-can-math">
          <span className="l12-kw">Minimize</span>
          <span>
            <Tex tex={r`f(r,h)=2\pi r^2+2\pi rh`} />
          </span>
          <span className="l12-kw">subject to</span>
          <span>
            <Tex tex={r`g(r,h)=\pi r^2h=355.`} />
          </span>
        </div>
      </div>

      <div className="stage-fig l12-can-fig">
        <SodaCan names />
      </div>
    </div>
  );
}
