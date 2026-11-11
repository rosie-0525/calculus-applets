import { Examples } from '../components/ImageCards.jsx';

/**
 * The rank–nullity theorem, continued (the third run of Image's examples, ImageCards.jsx, run 'rn';
 * a slide of its own, the user's request: the examples were crammed): Rank and nullity of a linear
 * transformation ℝ² → ℝ³ on arrival; key presses 1–6, its three examples, each then its rank and
 * nullity under it (rank = 0, nullity = 2; 1, 1; 2, 0). Print: each picture's outputs.
 */
export default function Slide14eRankNullityR23() {
  return (
    <section>
      <h2>The rank–nullity theorem</h2>

      <Examples run="rn" groups={['r23']} />
    </section>
  );
}
