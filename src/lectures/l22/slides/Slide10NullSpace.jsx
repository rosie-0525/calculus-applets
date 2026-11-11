import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { Picked, COLLAPSE_2, COLLAPSE_3 } from '../components/ImageCards.jsx';

/**
 * Null space: Mark's definition, in set notation (the user's request): N(A) = {x ∈ ℝⁿ : Ax = 0}; key
 * press 1, under it, the = signs aligned (the user's request): = {x ∈ ℝⁿ : T_A(x) = 0}. Then, from
 * key press 2, three of Image's examples that show the collapsing (the user's request, in place of
 * all 14 on three slides; ImageCards.jsx, Picked and COLLAPSE): [1 2; 1 2], the projection onto
 * the xy-plane and the projection onto the z-axis (the user's requests), each on a key press, its animation first, without N(A) (the user's request); on the next key press,
 * N(A) in the picture, green among the inputs, shrinking into 0 as they move, and, under it, N(A) = line through 0, line through 0, plane
 * through 0. In two stages (the user's request): key presses 2–7, the 2 × 2 examples, [1 2; 1 2] and
 * one where nothing collapses, the shear [1 1; 0 1] (N(A) = {0}), three key presses each (the
 * animation once; N(A) dashed on the collapsed picture and its caption; the animation once more with
 * N(A) solid, collapsing); on key press 8 they disappear and the two 3 × 3 ones come in their place,
 * key presses 8–13. Before:
 * Image's examples again (ImageCards.jsx, run 'null': the second of the three runs, the user's
 * request), on this slide and the next two, in the same cards and order: each picture now shows N(A)
 * in green among the inputs, shrinking into 0 as they move (a dashed copy stays), and the image
 * labelled C(A); each answer says what N(A) is. Key press 2, Null space of a linear transformation
 * ℝ¹ → ℝ¹; 3–4, A = [0] and [2]; 5, the answers (all of ℝ, the point 0); 6, ℝ¹ → ℝ²; 7–8, its two
 * examples; 9, the answers. (Six examples of their own, NullCards.jsx, were replaced by the run, and
 * with them Proj_V onto a plane, the textbook's Example 21.3.3.) Print: each picture's outputs.
 */
export default function Slide10NullSpace() {
  return (
    <section>
      <h2>Null space</h2>

      <div className="block definition">
        <p className="block-title">Definition</p>
        {/* the two = signs one under the other: a grid, the sentence up to N(A) in its first column */}
        <div className="l22-null-def">
          <span>
            The <strong>null space</strong> of an <Tex tex={r`m\times n`} /> matrix <Tex tex="A" /> is <Tex tex="N(A)" />
          </span>
          <span>
            <Tex tex={r`{}=\{\vv x\in\mathbb R^n:A\vv x=\vv 0\}`} />
          </span>
          <Fragment index={1} as="span" className="l22-null-def-2">
            <Tex tex={r`{}=\{\vv x\in\mathbb R^n:T_A(\vv x)=\vv 0\}`} />.
          </Fragment>
        </div>
      </div>

      {/* the 2 × 2 examples (three key presses each: the animation, N(A) dashed on the collapsed picture,
          the animation again with N(A) solid), then (key press 8) the 3 × 3 ones in their place */}
      <div className="l22-pick-stack">
        <Fragment index={8} effect="fade-out">
          <Picked run="null" examples={COLLAPSE_2} from={2} />
        </Fragment>
        <Picked run="null" examples={COLLAPSE_3} from={8} />
      </div>
    </section>
  );
}
