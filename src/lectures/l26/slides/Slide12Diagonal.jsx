import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import DiagCard from '../components/DiagCard.jsx';
import Slider, { fmt } from '../components/Slider.jsx';

// a slider's value, with a minus sign (not a hyphen)
export const signed = (v) => fmt(v).replace('-', '\u2212');
export const START = [1, 4]; // a, b on arrival (and in print): x² + 4y², ellipses longer along the x-axis

/** ax² + by² with the numbers in: a zero term left out, a coefficient ±1 shown as a sign. */
export function form(a, b) {
  const terms = [
    [a, 'x^2'],
    [b, 'y^2'],
  ].filter(([k]) => fmt(k) !== '0');
  if (!terms.length) return '0';
  return terms
    .map(([k, v], i) => {
      const m = fmt(Math.abs(k));
      return `${k < 0 ? '-' : i ? '+' : ''}${m === '1' ? '' : m}${v}`;
    })
    .join('');
}

/**
 * Contour plots of ax² + by² (the user's request: the title was Contour plots of λ₁x² + λ₂y²; its two
 * guiding questions, with two examples each, removed: just the conclusion, with an applet). (Over the
 * applet, near a critical point a, f(a + h) ≈ f(a) + ½ q_{Hf(a)}(h), moved here from Contour plots near a
 * critical point, then removed; and Mark's box, simplified, the level sets of f near a are
 * well-approximated by those of q_{Hf(a)}, moved to the end of the Poll: the user's requests.) The
 * applet: sliders for a and b
 * (−4 to 4), beside the contour plot of ax² + by² (DiagCard: the asymptotes dotted when a and b have
 * opposite signs), its formula over it with the numbers in; key presses 1 and 2, the conclusion, a
 * bullet per case, its second line (if |a| < |b|, …) on key presses 3 and 4, after both bullets (the
 * user's request) (the user's request; in the textbook's words, Example 25.4.3 and Section 25.4's
 * summary, the level sets are ellipses, not the form): a, b have the same sign ⇒ the level sets of
 * ax² + by² are ellipses; / if |a| < |b|, the ellipse is longer along the x-axis; a, b have opposite signs ⇒
 * hyperbolas; / if |a| < |b|, their asymptotes are closer to the x-axis (the user's requests, in place of
 * "the axis of the smaller of |a|, |b|": the textbook names the axis by its variable, Example 25.4.1). The fact for any
 * 2 × 2 A, with its eigenvectors, is on the next slide. Print: a = 1, b = 4.
 */
export default function Slide12Diagonal() {
  const [[a, b], set] = useState(START);
  return (
    <section>
      <h2>
        Contour plots of <Tex tex="ax^2+by^2" />
      </h2>

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
    </section>
  );
}
