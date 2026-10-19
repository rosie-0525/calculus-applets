import '../lectures/l12/styles/deck.css';
import Tex, { r } from '../lectures/l12/components/Tex.jsx';
import PowerPlants from '../lectures/l12/components/PowerPlants.jsx';
import Prices, { MEAN_PRICE, NOON, SIX } from '../lectures/l12/components/Electricity.jsx';

export const lecture = 12;

/*
 * Electricity prices and What does λ mean? in one, with every step showing, without the question
 * (the title asks it) and the textbook's pointer: the average prices at noon and 6 pm; beside the
 * picture (the price against c, one dot per hour, and the curve λ = M′(c)), the plants, the demand
 * c, CAISO's problem and its least cost M(c), the box λ = M′(c), the price, and the shadow price
 * with Samuelson's sentence. On the slides the picture glides from one to the other.
 */
export default function Electricity() {
  const noon = MEAN_PRICE(NOON).toFixed(0);
  const six = MEAN_PRICE(SIX).toFixed(0);
  return (
    <div className="stage elec-stage">
      <div className="stage-text">
        <p className="l12-lambda-src">
          California, 1–15 October 2026, on average: ${noon}/MWh at noon, ${six}/MWh at 6 pm.
        </p>
        <p className="l12-elec-plants">
          The power plants <PowerPlants height={48} /> provide power <Tex tex={r`x_1,\dots,x_n`} />.
        </p>
        <p className="l12-elec-c">
          Let <Tex tex="c=" /> demand for power <Tex tex={r`=x_1+\dots+x_n`} />.
        </p>

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
        <p className="l12-lambda-least">
          <strong>Solution:</strong> <Tex tex={r`M(c)=`} /> the least cost.
        </p>

        <div className="block theorem elec-box">
          <p>
            At the minimum <Tex tex={r`\vv a`} />, the Lagrange multiplier <Tex tex={r`\lambda=M'(c)`} />.
          </p>
        </div>
        <p className="l12-meaning-step">
          If the demand <Tex tex="c" /> goes up by 1 MWh, the least cost goes up by <Tex tex={r`M(c+1)-M(c)\approx M'(c)=\lambda`} />.
        </p>
        <p className="l12-meaning-price">
          Price for electricity is{' '}
          <span className="l12-meaning-red">
            <Tex tex={r`\lambda=M'(c)`} />
          </span>{' '}
          when the demand is <Tex tex="c" />.
        </p>

        <div className="l12-meaning-shadow">
          <p>
            <Tex tex={r`\lambda`} /> is the <strong>shadow price</strong> of the constraint <Tex tex="g=c" />.
          </p>
          <blockquote className="quote l12-meaning-quote">
            <p>Market prices, regarded as parameters by perfect competitors, are nothing more nor less than Lagrange multipliers.</p>
            <footer>— Paul Samuelson, 1947</footer>
          </blockquote>
        </div>
      </div>

      <div className="stage-fig">
        <Prices curveAt={0} />
      </div>
    </div>
  );
}
