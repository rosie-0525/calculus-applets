import '../lectures/l22/styles/deck.css';
import { ImageExamples } from './image-r1.jsx';

export const lecture = 22;

/* Image, continued, without its title: ℝ² → ℝ², the zero matrix, [1 2; 1 2] and the shear
   [1 1; 0 1], the grid of ℝ² moving onto its outputs; ℝ² → ℝ³, the zero matrix, [0 0; 1 −1; 1 −1]
   and [1 0; 0 1; 1 1], ℝ² drawn as the floor. As in image-r1.jsx, a click on a picture plays it
   again and says what its image is. */
export default function ImageR2() {
  return <ImageExamples groups={['r22', 'r23']} />;
}
