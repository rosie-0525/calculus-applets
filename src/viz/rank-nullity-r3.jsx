import '../lectures/l22/styles/deck.css';
import { RankNullityExamples } from './rank-nullity-r2.jsx';

export const lecture = 22;

/* The rank–nullity theorem, its last continuation, without its title: ℝ³ → ℝ³, two by two, the zero
   matrix, the projection onto the z-axis, the projection onto the xy-plane and a shear. As in
   rank-nullity-r2.jsx, a click on a card says its rank and nullity. */
export default function RankNullityR3() {
  return <RankNullityExamples groups={['r33']} />;
}
