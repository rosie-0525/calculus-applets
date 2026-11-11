import { Examples } from '../components/ImageCards.jsx';

/**
 * Image, continued (a bullet for each case, the examples under it; bullets, no owl's questions: the
 * user's request): Image of a linear transformation ℝ² → ℝ² on arrival; key presses 1–6, the zero
 * matrix, [1 2; 1 2] and the shear [1 1; 0 1], two key presses each: the matrix beside its picture,
 * played once (ImageCards.jsx: the grid of ℝ² and e₁, e₂ move onto the outputs, then the image
 * lights up in teal), then under the matrix what the image is (image = {0}, line through 0, ℝ²); 7,
 * Image of a linear transformation ℝ² → ℝ³ (ℝ² drawn as the floor z = 0); 8–13, the zero matrix,
 * [0 0; 1 −1; 1 −1] and [1 0; 0 1; 1 1] (image = {0}, line through 0, plane through 0). Print: each
 * picture's image.
 */
export default function Slide05dImageR2() {
  return (
    <section>
      <h2>Image</h2>

      <Examples run="image" groups={['r22', 'r23']} />
    </section>
  );
}
