import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import PowerPlants from '../components/PowerPlants.jsx';
import Prices, { MEAN_PRICE, NOON, SIX } from '../components/Electricity.jsx';

/**
 * Electricity prices (the problem of What does λ mean?, on a slide of its own at the user's
 * request; the same picture as What does λ mean?, which glides to its place there, as both slides
 * auto-animate): why is electricity 3 times pricier at 6 pm than at noon? (CAISO's average prices,
 * 1–15 October 2026); key press 1: "The power plants [their cartoons] provide power x₁, …, xₙ."
 * (the user's wording) across the slide; 2: c, the demand for power, = x₁ + ⋯ + xₙ (solar and
 * wind left out, at the user's request: the data's c is the demand minus solar and wind, what
 * these plants must make), and the picture, the price against c, one dot per hour, at the bottom
 * right; 3: CAISO, and its problem on two rows, lined up (minimizes the total cost f(x) subject
 * to x₁ + ⋯ + xₙ = c); 4: M(c), the least cost (the squiggly arrow "Solve using Lagrange multiplier
 * method" to it removed at the user's request: CAISO's f is a sum of step functions, its bids, and
 * CAISO solves the problem by linear programming, not with Lagrange's equations).
 */
export default function Slide12bLambda() {
  const noon = MEAN_PRICE(NOON).toFixed(0);
  const six = MEAN_PRICE(SIX).toFixed(0);
  return (
    <section data-transition="none" data-auto-animate="" data-auto-animate-duration="0.6">
      <h2 className="l12-lambda-h2">Electricity prices</h2>

      <div className="stage l12-lambda-stage l12-elec-stage">
        <div className="stage-text">
          <p className="l12-lambda-q">Why is electricity 3 times pricier at 6 pm than at noon?</p>
          <p className="l12-lambda-src">
            California, 1–15 October 2026, on average: ${noon}/MWh at noon, ${six}/MWh at 6 pm.
          </p>

          <Fragment index={1} as="p" className="l12-elec-plants">
            The power plants <PowerPlants height={64} /> provide power <Tex tex={r`x_1,\dots,x_n`} />.
          </Fragment>
          <Fragment index={2} as="p" className="l12-elec-c">
            Let <Tex tex="c=" /> demand for power <Tex tex={r`=x_1+\dots+x_n`} />.
          </Fragment>

          <Fragment index={3}>
            <p className="l12-lambda-who">CAISO (California's grid operator)</p>
            <div className="l12-lambda-problem">
              <span className="l12-kw">minimizes</span>
              <span>
                <Tex tex={r`f(\vv x)=`} /> total cost
              </span>
              <span className="l12-kw">subject to</span>
              <span>
                <Tex tex={r`g(\vv x)=x_1+\dots+x_n=c.`} />
              </span>
            </div>
          </Fragment>

          <Fragment index={4} as="p" className="l12-lambda-least">
            <strong>Solution:</strong> <Tex tex={r`M(c)=`} /> the least cost.
          </Fragment>
        </div>

        <Fragment index={2} className="stage-fig" data-id="l12-prices">
          <Prices />
        </Fragment>
      </div>
    </section>
  );
}
