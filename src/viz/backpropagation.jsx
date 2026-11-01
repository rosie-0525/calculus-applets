import '../lectures/l17/styles/deck.css';
import Tex, { r } from '../lectures/l17/components/Tex.jsx';
import { FxMarker } from '../lectures/l17/components/Fragment.jsx';
import NeuralNet from '../lectures/l17/components/NeuralNet.jsx';
import { CHAIN } from '../lectures/l17/slides/Slide12cAI.jsx';

export const lecture = 17;

/*
 * Training an AI model, without its title: Lecture 15's cartoon network, a photo of a cat in, "97%
 * cat" out, f₁, f₂, f₃ over its steps and the spaces under its layers, the prediction running
 * forward and the backpropagation back (CSS, on a loop); the model as a composition; the chain
 * rule, its factors lighting up from the left in time with the wave going back (the marker
 * `backprop`, shown on the page as every fragment is); backpropagation; Griffiths's words. On the
 * slide the parts come one per key press.
 */
export default function Backpropagation() {
  return (
    <div className="l17-ai-slide ai-col">
      <NeuralNet labels={1} back={1} />

      <p>
        An AI model is a composition of functions: <Tex className="nowrap" tex={r`f_3\circ f_2\circ f_1:\mathbb R^{1000}\to\mathbb R`} />.
      </p>
      <p>Training it (gradient descent) needs the chain rule:</p>
      <FxMarker index={1} id="backprop" />
      <div className="fx-host">
        <Tex display tex={CHAIN} />
      </div>
      <p>
        <strong>Backpropagation</strong>: multiply from the left, a row times a matrix{' '}
        <span className="nowrap">
          (<Tex tex={r`10^6`} /> multiplications, not <Tex tex={r`10^9`} />).
        </span>
      </p>
      <blockquote className="l17-quote l17-ai-quote">
        “…research on neural networks was held up for 20 years until somebody remembered the chain rule!”
        <span className="l17-quote-by">— T. Griffiths, Princeton</span>
      </blockquote>
    </div>
  );
}
