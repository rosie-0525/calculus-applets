import { useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import Slider, { fmt } from '../lectures/l15/components/Slider.jsx';
import { A, X0, farthest } from '../lectures/l15/components/SumPicture.jsx';
import { RED, BLUE } from '../lectures/l15/components/la.js';
import { ScalarPicture, ok, texM } from '../lectures/l15/slides/Slide04bScalarMaps.jsx';

export const lecture = 15;

/*
 * What cA does without the theorem (the caption says it): A and cA named in their arrows' colours,
 * beside x, Ax and (cA)x = c(Ax), with the slider for c (from −1.5 to 2; it stops where (cA)x or
 * its label would leave the picture). On the slide cA comes on a key press; here it is there from
 * the start. x can be dragged anywhere on the picture.
 */
export default function ScalarMaps() {
  const [x, setX] = useState(X0);
  const [c, setC] = useState(2);
  // toward c′, as far as (cA)x and its label stay on the picture
  const slide = (to) => setC(Math.round(farthest(([k]) => ok(x, k), [c], [to])[0] * 100) / 100);
  return (
    <div className="l15-summap">
      <div className="l15-summap-ms l15-scalarmap-ms">
        <Tex tex={r`\textcolor{${BLUE}}{A}=${texM(A)}`} />
        <Tex tex={r`\textcolor{${RED}}{cA}=\begin{bmatrix}${fmt(c)}&${fmt(c)}\\ 0&${fmt(c)}\end{bmatrix}`} />
      </div>
      <div className="l15-summap-pic">
        <ScalarPicture x={x} c={c} onDrag={setX} />
        <div className="lc-sliders l15-c-slider">
          <Slider name="c" value={Math.round(c * 10) / 10} onChange={slide} min={-1.5} max={2} step={0.1} color={RED} />
        </div>
      </div>
    </div>
  );
}
