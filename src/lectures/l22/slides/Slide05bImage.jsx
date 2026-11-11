import Tex, { r } from '../components/Tex.jsx';
import { Examples } from '../components/ImageCards.jsx';

/**
 * Image (the textbook's Definition 21.2.9, a highlight): the image of a linear transformation is the
 * collection of its outputs. Then the examples (ImageCards.jsx, run 'image': the first of the three
 * runs of the same examples, the others on Null space and The rank–nullity theorem), a bullet for each case (bullets, no owl's questions:
 * the user's request), the examples under it, the first two of five (the rest on the next two
 * slides): key press 1, Image of a linear transformation ℝ¹ → ℝ¹; 2, A = [0] beside its picture,
 * played once (the user's request; ImageCards.jsx: the number line and e₁ move onto the outputs,
 * then the image lights up in teal); 3, after the word "image" in the picture, = {0} (no list of answers on the
 * right: the user's request); 4–5, A = [2], image = ℝ; 6, Image of a linear transformation ℝ¹ → ℝ²
 * (the number line drawn as the x₁-axis); 7–8, A = [0; 0], image = {0}; 9–10, [2; 1], image = line
 * through 0. Print: each picture's image.
 */
export default function Slide05bImage() {
  return (
    <section>
      <h2>Image</h2>

      <div className="block definition">
        <p className="block-title">Definition</p>
        <p>
          The <strong>image</strong> of a linear transformation <Tex tex={r`f:\mathbb R^n\to\mathbb R^m`} /> is the collection of its outputs <Tex tex={r`f(\vv x)`} />,{' '}
          <Tex tex={r`\vv x\in\mathbb R^n`} />.
        </p>
      </div>

      <Examples run="image" groups={['r11', 'r12']} from={1} />
    </section>
  );
}
