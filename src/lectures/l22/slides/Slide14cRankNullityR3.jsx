import { Examples } from '../components/ImageCards.jsx';

/**
 * The rank–nullity theorem, continued (the third run of Image's examples, ImageCards.jsx, run 'rn'):
 * Rank and nullity of a linear transformation ℝ³ → ℝ³ on arrival; key presses 1–8, its four examples
 * two by two, each then its rank and nullity under it (rank = 0, nullity = 3; 1, 2; 2, 1; 3, 0).
 * (Example 1's line under them, rank = 2, nullity = 1, was removed at the user's request.) Print: each
 * picture's outputs.
 */
export default function Slide14cRankNullityR3() {
  return (
    <section>
      <h2>The rank–nullity theorem</h2>

      <Examples run="rn" groups={['r33']} />

    </section>
  );
}
