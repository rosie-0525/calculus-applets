import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import NeuralNet from '../components/NeuralNet.jsx';

// a factor of the chain rule, lit with the backward wave (deck.css), its size under it
export const factor = (k, size) => r`\underbrace{\vphantom{\big(}\htmlClass{l17-df l17-df-${k}}{(Df_${k})}}_{${size}}`;
export const CHAIN = r`D(f_3\circ f_2\circ f_1)=${factor(3, r`1\times 1000`)}\,${factor(2, r`1000\times 1000`)}\,${factor(1, r`1000\times 1000`)}`;

/**
 * Training an AI model (after Example 5, the user's request; the textbook's Appendix G): Lecture 15's
 * cartoon network, a photo in, "97% cat" out, the prediction running forward (NeuralNet.jsx). Key
 * press 1: the model is a composition f₃ ∘ f₂ ∘ f₁: ℝ¹⁰⁰⁰ → ℝ, the spaces and the f's on the
 * picture; 2: training it needs the chain rule, D(f₃ ∘ f₂ ∘ f₁) = (Df₃)(Df₂)(Df₁), the sizes under
 * the factors; 3: backpropagation, the wave running back in the picture while the factors light up
 * from the left: a row times a matrix each time, 10⁶ multiplications against 10⁹ for
 * (Df₂)(Df₁); 4: Griffiths's words (the textbook's epigraph to Appendix G) and → Appendix G.
 */
export default function Slide12cAI() {
  return (
    <section className="dense l17-ai-slide">
      <h2>Training an AI model</h2>

      <NeuralNet labels={1} back={3} />

      <Fragment index={1} as="p">
        An AI model is a composition of functions: <Tex tex={r`f_3\circ f_2\circ f_1:\mathbb R^{1000}\to\mathbb R`} />.
      </Fragment>
      <Fragment index={2}>
        <p>Training it (gradient descent) needs the chain rule:</p>
        <FxMarker index={3} id="backprop" />
        <div className="fx-host">
          <Tex display tex={CHAIN} />
        </div>
      </Fragment>
      <Fragment index={3} as="p">
        <strong>Backpropagation</strong>: multiply from the left, a row times a matrix (<Tex tex={r`10^6`} /> multiplications, not{' '}
        <Tex tex={r`10^9`} />).{' '}
        <Fragment index={4} as="span" className="pointer">
          → Appendix G
        </Fragment>
      </Fragment>
      <Fragment index={4} as="blockquote" className="l17-quote l17-ai-quote">
        “…research on neural networks was held up for 20 years until somebody remembered the chain rule!”
        <span className="l17-quote-by">— T. Griffiths, Princeton</span>
      </Fragment>
    </section>
  );
}
