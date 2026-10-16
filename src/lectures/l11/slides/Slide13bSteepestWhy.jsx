import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { LombardMap, LombardPhoto } from './Slide14Lombard.jsx';

/**
 * Why does the gradient point in the direction of fastest increase? (right after Direction of
 * fastest increase, whose reasoning it was). On the left, the derivation, its formulas centred, one
 * line per key press: for a unit vector u and t small, 1: f(a + tu) ≈ f(a) + t ∇f(a) · u; 2: ∇f(a) · u
 * = ‖∇f(a)‖ cos θ; 3: largest for θ = 0, smallest for θ = π. Then the example, Lombard Street (once a
 * slide of its own, Slide14Lombard.jsx, whose map this is), on the right: 4: the photo and the map,
 * side by side and equally tall, the map turned a quarter turn clockwise so that ∇E points up as in
 * the photo, with ∇E at P; under the derivation, E = elevation and the grade going in the direction
 * of ∇E, 27%; 5: u, turned by the mouse, and the grade that way; 6: the zigzag route, on average 17%.
 */
export default function Slide13bSteepestWhy() {
  return (
    <section className="dense l10-sw">
      <h2>Why does the gradient point in the direction of fastest increase?</h2>

      <LombardMap at={4} width={330} rotate>
        {(map, read) => (
          <div className="l10-sw-stage">
            <div className="l10-sw-left">
              <p>
                For a unit vector <Tex tex={r`\vv u`} /> and <Tex tex="t" /> small:
              </p>
              <Fragment index={1}>
                <Tex display tex={r`f(\vv a+t\vv u)\approx f(\vv a)+t\,\nabla f(\vv a)\cdot\vv u`} />
              </Fragment>
              <Fragment index={2}>
                <Tex display tex={r`\nabla f(\vv a)\cdot\vv u=\norm{\nabla f(\vv a)}\cos\theta`} />
              </Fragment>
              <Fragment index={3} as="p">
                is largest for <Tex tex={r`\theta=0`} />, smallest for <Tex tex={r`\theta=\pi`} />.
              </Fragment>
              <Fragment index={4} className="l10-sw-read">
                {read}
              </Fragment>
            </div>

            <Fragment index={4} className="l10-sw-ex">
              <p className="l10-lombard-head">Lombard Street</p>
              <div className="l10-sw-pics">
                <LombardPhoto className="l10-sw-photo" />
                {map}
              </div>
            </Fragment>
          </div>
        )}
      </LombardMap>
    </section>
  );
}
