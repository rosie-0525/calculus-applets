import { useState } from 'react';
import '../lectures/l21/styles/deck.css';
import FlipMatrix from '../lectures/l21/components/FlipMatrix.jsx';
import { useGlide } from '../lectures/l21/components/useFragmentTween.js';
import { RED } from '../lectures/l21/components/tr.js';
import { M, N, N2, CELL, X0, ink, hlAt } from '../lectures/l21/slides/Slide09Symmetric.jsx';
import { from } from './redundancies.jsx';

export const lecture = 21;

const MATRICES = [
  { rows: M, name: 'M', ok: true },
  { rows: N, name: 'N', ok: true },
  { rows: N2, name: 'N′', ok: false },
];

/**
 * One matrix, every entry in ink, as on the slide. Clicked, it flips across its diagonal into its
 * transpose (each entry gliding to its mirror place: the same matrix exactly when it is symmetric;
 * N′'s 3 and 2 change places), then its verdict, symmetric (green) or not symmetric (red), and for
 * N′ the pair that differs, its (2, 3)- and (3, 2)-entries, highlighted in pale red. The next click
 * flips it back and hides them.
 */
function Mirror({ rows, name, ok }) {
  const [on, setOn] = useState(false);
  const [t] = useGlide(on ? 1 : 0, 1400);
  const n = rows.length;
  const side = n * CELL + 60;
  // the verdict once the flip is done
  const done = on && t > 0.97 ? 1 : 0;
  return (
    <figure className="l21-mirror sym-card">
      <button type="button" className="inv-pick sym-pick" aria-pressed={on} aria-label={`${name}: symmetric or not?`} onClick={() => setOn((v) => !v)}>
        <svg viewBox={`0 0 ${side} ${side}`} width={side} height={side} role="img" aria-label={`The matrix ${name}`}>
          <FlipMatrix rows={rows} t={t} x={X0} y={30} cell={CELL} font={27} colorAt={ink} />
          {!ok && (
            <g fill={RED} fillOpacity={0.2} style={from(done, 1)}>
              {hlAt(1, 2)}
              {hlAt(2, 1)}
            </g>
          )}
        </svg>
      </button>
      <p className={!on ? 'inv-ask sym-ask' : ok ? 'l21-ok' : 'l21-not'} style={on ? from(done, 1) : undefined}>
        {!on ? 'symmetric or not?' : ok ? 'symmetric' : 'not symmetric'}
      </p>
    </figure>
  );
}

/*
 * Symmetric matrices, without its title and its definition (the caption has it): the textbook's
 * Example 20.3.4, M and N symmetric, N′ not. On the slide each comes on a key press with its
 * verdict, and a last one highlights the (2, 3)- and (3, 2)-entries of N′; here each is checked by a
 * click, which also flips it across its diagonal into its transpose, as on Matrix transpose.
 */
export default function Symmetric() {
  return (
    <div className="l21-mirrors">
      {MATRICES.map((m) => (
        <Mirror key={m.name} {...m} />
      ))}
    </div>
  );
}
