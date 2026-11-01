import { useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { det2 } from '../lectures/l18/components/inv.js';
import { CASES, Lines } from '../lectures/l18/slides/Slide12Systems.jsx';

export const lecture = 18;

/** A system's matrix A, from the coefficients of its two equations. */
const matrixOf = ({ e }) => e.map(([a, b]) => [a, b]);
const tex = (A) => r`A=\begin{bmatrix}${A.map((row) => row.join('&')).join('\\\\')}\end{bmatrix}`;

/*
 * Solving systems of linear equations, without its title and its box (the caption has it): Example
 * 4's three 2 × 2 systems as pairs of lines (the system in the picture's corner): crossing at one
 * point, parallel, the same line. On the slide each comes on a key press with its number of
 * solutions; here a picture shows its A, and its det(A) and number of solutions once it is clicked
 * (the next click hides them).
 */
export default function Systems() {
  const [checked, setChecked] = useState([]);
  const toggle = (k) => setChecked((v) => (v.includes(k) ? v.filter((n) => n !== k) : [...v, k]));
  return (
    <div className="l18-systems">
      {CASES.map((c, k) => {
        const on = checked.includes(k);
        const A = matrixOf(c);
        return (
          <div key={k} className="l18-system">
            <button type="button" className="inv-pick" aria-pressed={on} aria-label={`${c.title}: how many solutions?`} onClick={() => toggle(k)}>
              <Lines e1={c.e[0]} e2={c.e[1]} sys={c.sys} point={c.point} same={c.same} title={c.title} />
            </button>
            <p className="sys-matrix">
              <Tex tex={`${tex(A)},\\quad\\det(A)=${on ? det2(A) : '?'}`} />
            </p>
            {on ? (
              <p className={k === 0 ? 'l18-system-label' : 'l18-system-label l18-not'}>{c.label}</p>
            ) : (
              <p className="l18-system-label inv-ask">how many solutions?</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
