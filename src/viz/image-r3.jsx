import '../lectures/l22/styles/deck.css';
import { ImageExamples } from './image-r1.jsx';

export const lecture = 22;

/* Image, continued, without its title: ℝ³ → ℝ³, two by two, the zero matrix, the projection onto
   the z-axis, the projection onto the xy-plane and a shear, a cube round the origin moving onto its
   outputs. As in image-r1.jsx, a click on a picture plays it again and says what its image is. */
export default function ImageR3() {
  return <ImageExamples groups={['r33']} />;
}
