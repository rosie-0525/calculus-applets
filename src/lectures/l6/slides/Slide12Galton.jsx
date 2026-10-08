import Fragment from '../components/Fragment.jsx';
import { GaltonChart, FitLine, CLASS_MEANS, CARDINAL, TEAL } from '../components/Charts.jsx';
import { GALTON_PAIRS } from '../data/galton.js';
import { bestFit } from '../components/regression.js';

export const FIT = bestFit(GALTON_PAIRS);

/**
 * Galton's family heights: are children as tall as their parents? Key press 1: Galton's data;
 * 2: the averages of the columns and the line of best fit, slope 0.65 (not 1); 3: what 0.65 means;
 * 4: Galton's name for it.
 */
export default function Slide12Galton() {
  return (
    <section className="dense">
      <h2>Why is it called regression?</h2>

      <div className="motiv">
        <GaltonChart width={640} height={520}>
          {(p) => (
            <Fragment as="g" index={2}>
              <FitLine p={p} m={FIT.m} b={FIT.b} color={TEAL} width={3.5} />
              {CLASS_MEANS.map((c) => (
                <circle key={c.x} cx={p.px(c.x)} cy={p.py(c.mean)} r={6} fill={CARDINAL} stroke="#fff" strokeWidth="1.5" />
              ))}
            </Fragment>
          )}
        </GaltonChart>

        <div className="motiv-side">
          <p className="motiv-question galton-question">Are children as tall as their parents?</p>
          <Fragment index={1} as="p">
            Galton (1886) measured the heights of 928 adult children and their parents.
          </Fragment>
          <Fragment index={2} as="p">
            Slope of the best fit line = <strong className="teal">{FIT.m.toFixed(2)}</strong> (not 1).
          </Fragment>
          {/* y − ȳ = 0.65 (x − x̄): the line is y ≈ 0.65x + 23.9, so not "0.65 × the parents' height" */}
          <Fragment index={3} as="p">
            On average, parents 1 inch above (or below) the average height have children only{' '}
            {FIT.m.toFixed(2)} inch above (or below) it.
          </Fragment>
          <Fragment index={4} as="p">
            Galton called this “<strong>regression</strong> towards mediocrity”, which is why fitting a
            line to data is called <strong>linear regression</strong>.
          </Fragment>
        </div>
      </div>
    </section>
  );
}
