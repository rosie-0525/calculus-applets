import '../lectures/l6/styles/deck.css';
import { GaltonChart, FitLine, CLASS_MEANS, CARDINAL, TEAL } from '../lectures/l6/components/Charts.jsx';
import { FIT } from '../lectures/l6/slides/Slide12Galton.jsx';

export const lecture = 6;

/* The slide without its title (the applet's title asks it), everything showing. */
export default function Regression() {
  return (
    <div className="motiv">
      <GaltonChart width={640} height={520}>
        {(p) => (
          <g>
            <FitLine p={p} m={FIT.m} b={FIT.b} color={TEAL} width={3.5} />
            {CLASS_MEANS.map((c) => (
              <circle key={c.x} cx={p.px(c.x)} cy={p.py(c.mean)} r={6} fill={CARDINAL} stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>
        )}
      </GaltonChart>

      <div className="motiv-side">
        <p className="motiv-question galton-question">Are children as tall as their parents?</p>
        <p>Galton (1886) measured the heights of 928 adult children and their parents.</p>
        <p>
          Slope of the best fit line = <strong className="teal">{FIT.m.toFixed(2)}</strong> (not 1).
        </p>
        <p>
          On average, parents 1 inch above (or below) the average height have children only {FIT.m.toFixed(2)} inch above (or
          below) it.
        </p>
        <p>
          Galton called this “<strong>regression</strong> towards mediocrity”, which is why fitting a line to data is called{' '}
          <strong>linear regression</strong>.
        </p>
      </div>
    </div>
  );
}
