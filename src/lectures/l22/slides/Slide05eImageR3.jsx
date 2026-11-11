import { Examples } from '../components/ImageCards.jsx';

/**
 * Image, continued (a bullet, the examples under it; bullets, no owl's questions: the user's
 * request): Image of a linear transformation ℝ³ → ℝ³ on arrival; key presses 1–8, the zero matrix,
 * a matrix of rank 1 (columns c, 2c, −c), one of rank 2 (onto the floor z = 0) and a shear, two by
 * two, two key presses each: the matrix beside its picture, played once (ImageCards.jsx: a cube and
 * e₁, e₂, e₃ move onto the outputs, then the image lights up in teal), then under the matrix what the
 * image is (image = {0}, line through 0, plane through 0, ℝ³). Print: each picture's image.
 */
export default function Slide05eImageR3() {
  return (
    <section>
      <h2>Image</h2>

      <Examples run="image" groups={['r33']} />
    </section>
  );
}
