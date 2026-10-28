import { useRef, useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import { useLoopTween } from '../lectures/l15/components/useFragmentTween.js';
import { BLUE, AMBER } from '../lectures/l15/components/la.js';
import { SCALINGS, ScalePanel, tint, term } from '../lectures/l15/slides/Slide02dScaling.jsx';

export const lecture = 15;

/**
 * One scaling: its picture, the unit square, F and the grid gliding to their images on a loop
 * (while the applet is on screen), its formula below and, once the picture is clicked, its matrix
 * on the right and its columns S(e₁), S(e₂) on the picture (ScalePanel's fragment, hidden until
 * then: site.css); a matrix of ?s before.
 */
function Scaling({ d, index, open, onClick }) {
  const ref = useRef(null);
  const live = () => Boolean(ref.current?.closest('section')?.classList.contains('present'));
  const t = useLoopTween(true, { ms: 1600, delay: 500, hold: 2200, live });
  const q = r`\textcolor{#9ca3af}{?}`;
  return (
    <div className={`l15-scale${open ? '' : ' scale-closed'}`} ref={ref}>
      <button type="button" className="l15-scale-plot scale-pick" aria-pressed={open} aria-label={`The matrix of the scaling by ${d[0]} and ${d[1]}`} onClick={onClick}>
        <ScalePanel d={d} t={t} index={index} />
      </button>
      <div className="l15-scale-mat">
        <Tex tex={open ? r`\begin{bmatrix}${tint(BLUE, d[0])}&0\\ 0&${tint(AMBER, d[1])}\end{bmatrix}` : r`\begin{bmatrix}${q}&${q}\\ ${q}&${q}\end{bmatrix}`} />
      </div>
      <div className="l15-scale-formula">
        <Tex tex={r`S(x_1,x_2)=\begin{bmatrix}${term(BLUE, d[0], 1)}\\ ${term(AMBER, d[1], 2)}\end{bmatrix}`} />
      </div>
    </div>
  );
}

/*
 * Scaling: the four scalings in a 2 × 2 grid, each picture looping, with its formula below. On the
 * slide each matrix comes on the key press after its picture; here clicking a picture shows its
 * matrix and its columns, and hides them on the next click.
 */
export default function ScalingApplet() {
  const [open, setOpen] = useState([]);
  const toggle = (k) => setOpen((v) => (v.includes(k) ? v.filter((n) => n !== k) : [...v, k]));
  return (
    <div className="l15-scales">
      {SCALINGS.map((d, k) => (
        <Scaling key={k} d={d} index={2 * k + 2} open={open.includes(k)} onClick={() => toggle(k)} />
      ))}
    </div>
  );
}
