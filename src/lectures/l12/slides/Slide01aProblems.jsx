import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import RainbowCone from '../components/RainbowCone.jsx';
import SodaCan from '../components/SodaCan.jsx';
import PowerHome from '../components/PowerHome.jsx';

/** A problem under its card, in words: maximize/minimize …, subject to … (the constraint in purple). */
export function Problem({ index, goal, f, g }) {
  return (
    <Fragment index={index} className="l12-open-problem">
      <span className="l12-open-kw">{goal}</span>
      <span>{f}</span>
      <span className="l12-open-kw">subject to</span>
      <span className="l12-open-g">{g}</span>
    </Fragment>
  );
}

/**
 * Constrained optimization problems (the opener, after the title): three cards, each a question
 * over its picture, then (on the next key press) the problem in words, in the form of Constrained
 * optimization's definition (as few formulas as possible, at the user's request). On arrival, why
 * do rainbows form arcs? (the user's question, in place of "Why is a rainbow always at 42°?": the
 * light piles up at the largest angle θ, the same 42° for every drop, so the bright drops lie on a
 * cone round the line from the sun through the eye, an arc as seen from it; RainbowCone.jsx: in
 * 3-D, parallel sunlight to a drop on the bow, dragged along it, its light to the eye at 42°; it
 * replaced a raindrop and a flat landscape at the user's request); 1: maximize the angle θ subject
 * to physics law, the user's words (θ = 4r − 2i, Snell's law sin i = 1.33 sin r; Lagrange gives
 * cos² i = (n² − 1)/3: i = 59.4°, r = 40.2°, θ = 42.1°); 2: what is the best shape for a Coke can?
 * (the user's words, first "Which 355 mL can uses the least aluminum?"; SodaCan.jsx, its radius on
 * a slider); 3: minimize aluminum used subject to the can holding 355 mL Coke (A = 2πr² + 2πrh,
 * πr²h = 355: h = 2r, r = 3.84 cm, A = 277.5 cm²); 4: why is electricity more expensive in the
 * evening than noon? (the user's words; first "pricier at 6 pm"; PowerHome.jsx,
 * the user's picture: a power plant, wires to a house, a family watching TV inside; it replaced the
 * price chart of Electricity prices);
 * 5: CAISO's problem in words (the user's: minimize the total cost subject to power supply
 * meeting the demand, that is, the power from the plants meeting the demand).
 */
export default function Slide01aProblems() {
  return (
    <section>
      <h2>Constrained optimization problems</h2>

      <div className="l12-open">
        <div className="l12-open-card">
          <p className="l12-open-q">Why do rainbows form arcs?</p>
          <div className="l12-open-fig">
            <RainbowCone />
          </div>
          <Problem
            index={1}
            goal="maximize"
            f={
              <>
                the angle <Tex tex={r`\theta`} />
              </>
            }
            g="physics law"
          />
        </div>

        <Fragment index={2} className="l12-open-card">
          <p className="l12-open-q">What is the best shape for a Coke can?</p>
          <div className="l12-open-fig">
            <SodaCan />
          </div>
          <Problem index={3} goal="minimize" f="aluminum used" g="the can holding 355 mL Coke" />
        </Fragment>

        <Fragment index={4} className="l12-open-card">
          <p className="l12-open-q">Why is electricity more expensive in the evening than noon?</p>
          <div className="l12-open-fig">
            <PowerHome />
          </div>
          <Problem index={5} goal="minimize" f="the total cost" g="power supply meeting the demand" />
        </Fragment>
      </div>
    </section>
  );
}
