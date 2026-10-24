import { useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import Matrix from '../lectures/l14/components/Matrix.jsx';
import { A, B, STEPS } from '../lectures/l14/slides/Slide14Computing.jsx';

export const lecture = 14;

/*
 * Computing AB, the textbook's Example 14.3.9 in its layout (B raised above AB, A to its left, each
 * with its size), with the dot product of each entry in the list on the right. On the slide each
 * entry comes on a key press, its row of A and column of B tinted for that key press only; here
 * every entry is there, and clicking one (in AB or in the list) tints its row, its column and
 * itself (`pick-<k>`, the entry's step, tells which was clicked).
 */
export default function ComputingProduct() {
  const [k, setK] = useState(0);
  const { i, j } = STEPS[k];
  const ab = [0, 1].map((a) => [0, 1].map((b) => {
    const m = STEPS.findIndex((s) => s.i === a && s.j === b);
    return { tex: STEPS[m].value, className: `prod-pick pick-${m}` };
  }));
  const pick = (e) => {
    const m = e.target.closest('.prod-pick')?.className.match(/pick-(\d)/);
    if (m) setK(Number(m[1]));
  };
  return (
    <div className="viz-col">
      <p className="prod-rule">
        The <Tex tex="(i,j)" />
        -entry of <Tex tex="AB" /> is (row <Tex tex="i" /> of <Tex tex="A" />) <Tex tex={r`\cdot`} /> (column <Tex tex="j" /> of{' '}
        <Tex tex="B" />).
      </p>

      <div className="l14-compute">
        <div className="l14-compute-grid">
          <div className="l14-cg-b">
            <Matrix rows={B} bands={[{ col: j, tone: 'col' }]} />
            <span className="l14-size">
              <Tex tex={r`B\ \ (3\times2)`} />
            </span>
          </div>
          <div className="l14-cg-a">
            <Matrix rows={A} bands={[{ row: i, tone: 'row' }]} />
            <span className="l14-size">
              <Tex tex={r`A\ \ (2\times3)`} />
            </span>
          </div>
          {/* by mouse; the list's buttons pick an entry by keyboard */}
          <div className="l14-cg-ab" onClick={pick}>
            <Matrix rows={ab} bands={[{ row: i, col: j, tone: 'cell' }]} />
            <span className="l14-size">
              <Tex tex={r`AB\ \ (2\times2)`} />
            </span>
          </div>
        </div>

        <ul className="l14-compute-steps">
          {STEPS.map((s, m) => (
            <li key={s.value}>
              <button type="button" className="prod-step" aria-pressed={m === k} onClick={() => setK(m)}>
                <Tex tex={r`(${s.i + 1},${s.j + 1})\text{-entry: }${s.sum}=${s.value}`} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
