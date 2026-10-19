import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import { CurvePicture, AtPoint, useDragOnC } from '../components/CurveMap.jsx';
import portrait from '../assets/lagrange.jpg';

// Engraved portrait of Joseph-Louis Lagrange, artist and date unknown; public domain (Wikimedia
// Commons, File:Joseph_Louis_Lagrange.jpg, scaled down to 400 px high)

// the maximum of f on C in Example 1's picture (its top, the fraction 0.073 of the way round C;
// f ≈ 11.93), where ∇f(a) and ∇g(a) point the same way: ∇f(a) ≈ 1.8 ∇g(a)
export const S_MAX = 0.073;
// the red level curve is labelled with its value f(a) at its point nearest here: at the maximum,
// to the left of a, clear of the arrows and of C
export const LABEL_AT = [-0.35, 0.64];
// while a is at the maximum (as on arrival), the red level curve is the worksheet's f = 12, which
// touches C there (the f recovered from the picture gives 11.93, from the tracing)
export const LEVEL_MAX = 12;

/**
 * Lagrange multipliers: Mark's theorem (with g(x) = c, for n variables; → Theorem 12.2.1: the
 * slides only show why for n = 2, on Finding constrained max/min, before it), its two cases on two lines. Key press 1: an
 * arrow up to λ, "Lagrange multiplier" (they keep their space until then). The picture, Example
 * 1's (at the user's request), is there from the start, with a at the maximum of f on C (the level
 * curve f = 12), ∇f(a), ∇g(a) and the level curve of
 * f through a, labelled with its value (the user's request); the mouse drags a round C, and the level curve with it, as on Finding constrained
 * max/min (but with no u; the PDF shows a at the maximum). The
 * equations to solve and Mark's remark were removed at the user's request. A portrait of Lagrange
 * (the user's request) at the right of the title row, above the picture, comes with "Lagrange
 * multiplier".
 */
export default function Slide05Lagrange() {
  const [s, move] = useDragOnC(S_MAX);
  return (
    <section>
      <div className="l12-lagr-head">
        <h2>Lagrange multipliers</h2>
        <Fragment index={1} as="figure" className="l12-portrait">
          <figcaption>
            Joseph-Louis Lagrange
            <br />
            (1736–1813)
          </figcaption>
          <img src={portrait} alt="Engraved portrait of Joseph-Louis Lagrange" />
        </Fragment>
      </div>

      <div className="stage">
        <div className="stage-text">
          <div className="block theorem">
            <p>
              Let <Tex tex={r`f:\mathbb R^n\to\mathbb R`} /> and <Tex tex={r`g:\mathbb R^n\to\mathbb R`} /> be two functions.
              If <Tex tex="f" /> has a local extremum on the region defined by <Tex tex={r`g(\vv x)=c`} /> at a point{' '}
              <Tex tex={r`\vv a`} />, then
            </p>
            <FxMarker index={1} id="lagr" />
            <Tex
              display
              className="l12-lagr-formula"
              tex={r`\begin{aligned}\text{either}\quad &\nabla g(\vv a)=\vv 0\\ \text{or}\quad &\nabla f(\vv a)=\underset{\htmlClass{l12-lagr-note}{\mathclap{\substack{\Big\uparrow\\[2pt] \text{Lagrange multiplier}}}}}{\lambda}\,\nabla g(\vv a)\ \text{ for some }\lambda\in\mathbb R.\end{aligned}`}
            />
            <p className="pointer right">(→ Theorem 12.2.1)</p>
          </div>
        </div>

        <div className="stage-fig l12-drag" onPointerDown={move} onPointerMove={move} data-prevent-swipe>
          <CurvePicture>
            {(p) => <AtPoint p={p} s={s} tangent={false} anchor={LABEL_AT} level={s === S_MAX ? LEVEL_MAX : undefined} />}
          </CurvePicture>
        </div>
      </div>
    </section>
  );
}
