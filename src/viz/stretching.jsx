import { useRef } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex from '../lectures/l21/components/Tex.jsx';
import useSwing from '../lectures/l21/components/useSwing.js';
import { Picture, texA } from '../lectures/l21/slides/Slide19bConverse.jsx';

export const lecture = 21;

/*
 * Stretching and shrinking, without its title and its text (the caption has it): for
 * A = [1 1/2; 1/2 1], on a loop (while the applet is on screen), F in the unit square stretched along
 * the diagonal and shrunk across it, the matrix under the picture, as on the slide.
 */
export default function Stretching() {
  const ref = useRef(null);
  const live = () => !!ref.current?.closest('section')?.classList.contains('present');
  const t = useSwing(true, { ms: 1800, hold: 1400, delay: 500, live });
  return (
    <div className="l21-conv-fig str" ref={ref}>
      <Picture t={t} />
      <p className="l21-conv-read">
        <Tex tex={texA} />
      </p>
    </div>
  );
}
