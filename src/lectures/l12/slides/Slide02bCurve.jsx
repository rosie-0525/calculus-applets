import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { CurvePicture } from '../components/CurveMap.jsx';

/**
 * Example 1 (board): Q2 of the worksheet "Hour 27 - Lagrange Multipliers" (`27 - Lagrange
 * Multipliers.pdf`), with only its right picture, the contour map of f with the curve C, redrawn
 * (CurvePicture, CurveMap.jsx);
 * its parts replaced by the user's two: mark the global max and min of f on C; what do you
 * observe? Key press 1: the picture (the user's request); then one part per key press, the
 * answers commented out; key press 4, the box of Why is ∇f(a) = λ∇g(a)? (the level curve of f
 * through a is tangent to g = c at a).
 */
export default function Slide02bCurve() {
  return (
    <section data-transition="none">
      <h2>
        Example 1 <span className="board-pill">board</span>
      </h2>

      <div className="stage l12-curve-stage">
        <div className="stage-text">
          <p>
            Here’s the contour map of a function <Tex tex="f(x,y)" />, together with a curve <Tex tex="C" />.
          </p>
          <ol className="parts">
            <Fragment index={2} as="li">
              Mark the global maximum and{' '}
              <span className="l12-nowrap">
                minimum of <Tex tex="f" /> on <Tex tex="C" />.
              </span>
            </Fragment>
            {/* Maximum, about 12: at the top of C, where C touches the level curve 12. Minimum, about 6:
                on the lower right of C, where C touches the closed level curve 6. */}
            <Fragment index={3} as="li">
              What do you observe?
            </Fragment>
            {/* At each, C is tangent to the level curve of f through it (so ∇f is perpendicular to C
                there), and neither is a critical point of f (the critical points of f are a saddle
                point where the level curve 9 crosses itself, up and to the left of the origin, and a
                local minimum inside the closed level curve 6): the idea of Lagrange multipliers. */}
          </ol>
          {/* the box of Mark's Why is ∇f(a) = λ∇g(a)? (now Finding constrained max/min), word for word, after (ii) */}
          <Fragment index={4} className="block theorem l12-curve-box">
            <p>
              The level curve of <Tex tex="f" /> through <Tex tex={r`\vv a`} /> is tangent to the curve <Tex tex="g=c" /> at{' '}
              <Tex tex={r`\vv a`} />.
            </p>
          </Fragment>
        </div>

        <Fragment index={1} className="stage-fig">
          <CurvePicture />
        </Fragment>
      </div>
    </section>
  );
}
