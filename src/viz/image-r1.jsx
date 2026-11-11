import { useEffect, useRef } from 'react';
import '../lectures/l22/styles/deck.css';
import { Examples } from '../lectures/l22/components/ImageCards.jsx';

export const lecture = 22;

/**
 * Click to check, on cards the deck draws: a click on a `trigger` inside `ref` marks the `card` round
 * it `data-checked`, and site.css shows a card's answer only once it is marked. (The cards are the
 * deck's, so the mark is set on them by hand; it stays until the applet is drawn afresh.)
 */
export function useClickToCheck(ref, trigger, card = trigger) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const click = (e) => {
      const t = e.target.closest?.(trigger);
      const c = t && root.contains(t) ? t.closest(card) : null;
      if (c) c.dataset.checked = '';
    };
    root.addEventListener('click', click);
    return () => root.removeEventListener('click', click);
  }, [ref, trigger, card]);
}

/**
 * The examples of Image for the groups `groups` (ImageCards.jsx, run 'image'), a bullet for each
 * ℝⁿ → ℝᵐ and its examples under it, each matrix beside its picture: the inputs move onto their
 * outputs, then the image lights up in teal, labelled "image". Each picture plays once when the
 * applet comes on screen; on the slide what each image is comes on the key press after it, here
 * when its picture is clicked (which plays it again): "image = …" after the word.
 */
export function ImageExamples({ groups }) {
  const ref = useRef(null);
  useClickToCheck(ref, '.l22-img-replay', '.l22-img-card');
  return (
    <div ref={ref} className="img-ask">
      <Examples run="image" groups={groups} />
    </div>
  );
}

/* Image, its first slide, without its title and its definition (the caption has it): ℝ¹ → ℝ¹,
   A = [0] and [2], the number line moving onto its outputs; ℝ¹ → ℝ², A = [0; 0] and [2; 1], the
   number line as the x₁-axis. */
export default function ImageR1() {
  return <ImageExamples groups={['r11', 'r12']} />;
}
