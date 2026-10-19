import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Prices from '../components/Electricity.jsx';

/**
 * What does λ mean? (after Electricity prices, which poses the problem; moved here from it at the
 * user's request; the same picture, which glides here from its place there): the box, λ = M′(c) at
 * the min (→ Remark 12.2.14, (12.2.10): the proof uses the chain rule of Chapter 17); key press 1:
 * one more MWh of demand raises the least cost by M(c + 1) − M(c) ≈ M′(c) = λ; 2: the price for
 * electricity is λ = M′(c) when the demand is c (the user's words), and the fitted curve
 * λ = M′(c) on the picture; 3: λ, the
 * shadow price, and Samuelson's sentence, as the textbook quotes it (Remark 12.2.14, [Sam,
 * p. 231]).
 */
export default function Slide12cLambdaMeaning() {
  return (
    <section data-transition="none" data-auto-animate="" data-auto-animate-duration="0.6">
      <h2 className="l12-lambda-h2">
        What does <Tex tex={r`\lambda`} /> mean?
      </h2>

      <div className="l12-meaning">
        <div className="block theorem l12-meaning-box">
          <p>
            At the minimum <Tex tex={r`\vv a`} />, the Lagrange multiplier <Tex tex={r`\lambda=M'(c)`} />.
          </p>
          <p className="pointer corner">(→ Remark 12.2.14)</p>
        </div>

        <div className="stage l12-meaning-stage">
          <div className="stage-text">
            {/* the least cost M(c), not the price, goes up by λ (the user asked whether the price
                does): at 6 pm, by the fit, M(c) ≈ $1.6 million for the hour above M(0), one more
                MWh adds $82 to it, and the price is $82/MWh; the price itself rises by M″(c) */}
            <Fragment index={1} as="p" className="l12-meaning-step">
              If the demand <Tex tex="c" /> goes up by 1 MWh, the least cost
              <br />
              goes up by <Tex tex={r`M(c+1)-M(c)\approx M'(c)=\lambda`} />.
            </Fragment>
            {/* and ∇g = (1, …, 1), so ∂f/∂xᵢ = λ for each plant i: one more MWh costs λ at every
                plant; λ = M′(c) in the red of its curve on the picture */}
            <Fragment index={2} as="p" className="l12-meaning-price">
              Price for electricity is{' '}
              <span className="l12-meaning-red">
                <Tex tex={r`\lambda=M'(c)`} />
              </span>{' '}
              when the demand is <Tex tex="c" />.
            </Fragment>

            <Fragment index={3} className="l12-meaning-shadow">
              <p>
                <Tex tex={r`\lambda`} /> is the <strong>shadow price</strong> of the constraint <Tex tex="g=c" />.
              </p>
              {/* a pull quote: its opening quotation mark, large, in the margin (deck.css); the
                  source: Foundations of Economic Analysis (1947), p. 231, in the README */}
              <blockquote className="quote l12-meaning-quote">
                <p>
                  Market prices, regarded as parameters by perfect competitors, are nothing more nor less than Lagrange multipliers.
                </p>
                <footer>— Paul Samuelson, 1947</footer>
              </blockquote>
            </Fragment>
          </div>

          {/* data-id: the picture glides here from its place on Electricity prices (auto-animate) */}
          <div className="stage-fig" data-id="l12-prices">
            <Prices curveAt={2} />
          </div>
        </div>
      </div>
    </section>
  );
}
