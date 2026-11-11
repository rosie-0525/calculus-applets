import Tex, { r } from '../components/Tex.jsx';
import { Examples } from '../components/ImageCards.jsx';
import { TEAL, GREEN } from '../components/ls.js';

export const c = (color, tex) => r`\textcolor{${color}}{${tex}}`;

/**
 * The rank–nullity theorem: Mark's box, on one line (the user's request; proved in the textbook's
 * Section 21.5: a pointer), rank teal (C(A)) and nullity green (N(A)). Then Image's examples a third time (ImageCards.jsx, run 'rn': the
 * last of the three runs, the user's request), on this slide and the next two (a slide for each ℝⁿ → ℝᵐ, from ℝ² → ℝ²: the user removed ℝ¹ → ℝ¹ and ℝ¹ → ℝ² from this run), the pictures of Null
 * space, each answer now "rank = …, nullity = …" (the textbook's "conservation law" for dimension,
 * Example 21.3.15), the cards spread over the slide's width, each one's rank and nullity under it on
 * the key press after its animation (the user's request; first a list beside the cards): key press 1,
 * Rank and nullity of a linear transformation ℝ² → ℝ²; 2–7, its three examples, each then its rank and
 * nullity (rank = 0, nullity = 2; 1, 1; 2, 0). (Three cards of their own,
 * a cube under a rotation and two projections, Crush.jsx, were replaced by the run; Example 1's rank
 * and nullity moved to the run's last slide.) Print: each picture's outputs.
 */
export default function Slide14RankNullity() {
  return (
    <section>
      <h2>The rank–nullity theorem</h2>

      <div className="block theorem l22-rn-box">
        <p>
          If <Tex tex="A" /> is an <Tex tex={r`m\times n`} /> matrix, then <Tex tex={r`${c(TEAL, r`\dim C(A)`)}+${c(GREEN, r`\dim N(A)`)}=n.`} />
        </p>
        <p className="pointer corner">(→ Theorem 21.3.16)</p>
      </div>

      <Examples run="rn" groups={['r22']} from={1} />
    </section>
  );
}
