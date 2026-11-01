import Tex, { r } from '../components/Tex.jsx';
import { EXAMPLES } from '../components/UndoExamples.jsx';
import UndoCards from '../components/UndoCards.jsx';

/**
 * Invertible linear transformations: Mark's definition, in a box without a title; then the first
 * three examples of Linear transformation: Invertible or not? (the other three are on the next slide,
 * Slide03aInvertibleMore, the user's request), two key presses each (1–6), each in its card (UndoCards): first T takes
 * the plane and F to their images (blue); then (the user's request), if T is invertible, S, what
 * undoes it, brings them back (amber; its name under the card); if not, two points have landed on
 * the same point (ringed): not invertible (the textbook's Figure 18.1.1, in ℝ²). The captions name them as in the definition
 * (the user's request): "T = rotation by 90°", then "S = rotation by −90°" (the reflection: S = T).
 * (Christine's rotation by θ, turned back by −θ, and the projection onto the x-axis, as two large
 * pictures, replaced at the user's request.) The definition stays for the next slide, at its top: the
 * two slides auto-animate (reveal.js; the box, data-id inv-def, glides up as the title goes; the
 * user's request). Print: each card's end.
 */
export default function Slide03Invertible() {
  return (
    <section data-auto-animate>
      <h2>Invertible linear transformations</h2>

      <div className="block definition" data-id="inv-def">
        <p>
          A linear transformation <Tex tex={r`T:\mathbb R^n\to\mathbb R^n`} /> is <strong>invertible</strong> (think: &ldquo;reversible&rdquo;) if there exists a
          linear transformation <Tex tex={r`S:\mathbb R^n\to\mathbb R^n`} /> for which <Tex tex={r`S\circ T`} /> and <Tex tex={r`T\circ S`} /> are both the
          identity function.
        </p>
      </div>

      <UndoCards examples={EXAMPLES.slice(0, 3)} unit={88} />
    </section>
  );
}
