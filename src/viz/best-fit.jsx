import { useState } from 'react';
import '../lectures/l6/styles/deck.css';
import Tex, { r } from '../lectures/l6/components/Tex.jsx';
import { errors } from '../lectures/l6/components/regression.js';
import { LineApplet, EX2, HX, num } from '../lectures/l6/slides/Slide07BestFit.jsx';

export const lecture = 6;

/* The slide's example with everything showing: the line to drag, its errors, and the sum of their
   squares (the best line, y = 3x + 9, has 4). */
export default function BestFit() {
  const [h, setH] = useState([-2.5, 0.5]); // the line's heights above HX: y = x + 2
  const m = (h[1] - h[0]) / (HX[1] - HX[0]);
  const b = h[0] - m * HX[0];
  const e = errors(EX2, m, b);
  const total = e.reduce((s, t) => s + t * t, 0);
  const line = `y=${num(m, 2)}x${b < 0 ? '-' : '+'}${num(Math.abs(b), 2)}`;

  return (
    <div className="stage-fig bf-example">
      <p className="bf-example-head">
        <strong>Example.</strong> Five data points, and a line: drag its two handles.
      </p>
      <LineApplet h={h} setH={setH} />
      <div className="bf-readout">
        <Tex tex={line} />
        <p className="red">
          <Tex tex={r`e_1,\dots,e_5:\ ${e.map((t) => num(t)).join(r`,\ `)}`} />
        </p>
        <p className="bf-total">
          <Tex tex={r`e_1^2+\cdots+e_5^2=${num(total, 2)}`} />
        </p>
      </div>
    </div>
  );
}
