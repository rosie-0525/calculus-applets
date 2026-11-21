import { useRef, useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex, { r } from '../lectures/l26/components/Tex.jsx';
import Fragment from '../lectures/l26/components/Fragment.jsx';
import DiagCard from '../lectures/l26/components/DiagCard.jsx';
import Slider from '../lectures/l26/components/Slider.jsx';
import { form, signed, START } from '../lectures/l26/slides/Slide12Diagonal.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 26;

/*
 * Contour plots of ax² + by², without its title: the slide's applet, sliders for a and b (−4 to 4,
 * x² + 4y² to start), beside the contour plot of ax² + by² (DiagCard: the asymptotes dotted when a and
 * b have opposite signs), its formula over it with the numbers in. On the slide the conclusion comes
 * under the sliders a bullet per key press (ellipses, hyperbolas), then each one's second line (if
 * |a| < |b|, …); here it all comes on a button (useFragmentSteps: key press 4), its place kept until
 * then. In a narrow box the plot is under the sliders, and the conclusion under the plot, taking no
 * room until it is shown (`cab-on`).
 */
export default function ContourAB() {
  const ref = useRef(null);
  const [[a, b], set] = useState(START);
  const [rules, setRules] = useState(false);
  useFragmentSteps(ref, rules ? 4 : 0);
  return (
    <div className={`viz-col cab${rules ? ' cab-on' : ''}`} ref={ref}>
      <div className="l26-ab">
        <div className="l26-ab-text">
          <div className="lc-sliders l26-ab-sliders">
            <Slider name="a" label={<Tex tex="a" />} value={a} onChange={(v) => set(([, y]) => [v, y])} min={-4} max={4} format={signed} />
            <Slider name="b" label={<Tex tex="b" />} value={b} onChange={(v) => set(([x]) => [x, v])} min={-4} max={4} format={signed} />
          </div>
          <ul className="bullets l26-ab-rules">
            <Fragment index={1} as="li">
              <Tex tex="a,b" /> have the same sign <Tex tex={r`\Rightarrow`} /> the level sets of <Tex tex="ax^2+by^2" /> are <strong>ellipses</strong>;
              <br />
              <Fragment index={3} as="span">
                if <Tex tex="|a|<|b|" />, the ellipse is longer along the <Tex tex="x" />-axis
              </Fragment>
            </Fragment>
            <Fragment index={2} as="li">
              <Tex tex="a,b" /> have opposite signs <Tex tex={r`\Rightarrow`} /> the level sets of <Tex tex="ax^2+by^2" /> are <strong>hyperbolas</strong>;
              <br />
              <Fragment index={4} as="span">
                if <Tex tex="|a|<|b|" />, their asymptotes are closer to the <Tex tex="x" />-axis
              </Fragment>
            </Fragment>
          </ul>
        </div>
        <figure className="l26-ab-fig">
          <figcaption>
            <Tex tex={form(a, b)} />
          </figcaption>
          <DiagCard l1={a} l2={b} size={270} title={`The contour plot of ${form(a, b).replace(/\^2/g, '²')}`} axisLabels />
        </figure>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={rules} onClick={() => setRules((v) => !v)}>
          {rules ? 'Hide the answers' : 'Show the answers'}
        </button>
      </div>
    </div>
  );
}
