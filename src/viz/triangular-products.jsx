import { useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex from '../lectures/l15/components/Tex.jsx';
import Matrix from '../lectures/l15/components/Matrix.jsx';
import { zeroZone } from '../lectures/l15/slides/Slide16Triangular.jsx';
import { U, V, UV, STAR } from '../lectures/l15/slides/Slide17TriangularProducts.jsx';

export const lecture = 15;

/*
 * Products of triangular matrices without the theorem (the caption says it): the textbook's product
 * of two upper triangular matrices, the zeros below each diagonal gray; and why, on 4 × 4 patterns
 * laid out as for computing AB (V above, U to its left): the (3, 2)-entry of UV, row 3 of U and
 * column 2 of V tinted. Pointing at (or clicking) an entry of UV tints its row of U and column of V
 * instead. On the slide the two parts come on a key press each.
 */
export default function TriangularProducts() {
  const [[I, J], setEntry] = useState([2, 1]);
  const pick = (e) => {
    const el = e.target.closest('.l13-entry');
    if (el?.dataset.i != null) setEntry([Number(el.dataset.i), Number(el.dataset.j)]);
  };
  return (
    <div className="l15-triprod">
      <div className="l15-eq-row">
        <Matrix rows={U} bands={zeroZone(U)} />
        <Matrix rows={V} bands={zeroZone(V)} />
        <Tex tex="=" />
        <Matrix rows={UV} bands={zeroZone(UV)} />
      </div>

      <div className="l15-triprod-why">
        <p className="l15-why-label">Why?</p>
        <div className="l15-triprod-grid">
          <div className="l15-tg-v">
            <Matrix rows={STAR} bands={[...zeroZone(STAR), { col: J, tone: 'col' }]} />
            <Tex tex="V" />
          </div>
          <div className="l15-tg-u">
            <Matrix rows={STAR} bands={[...zeroZone(STAR), { row: I, tone: 'row' }]} />
            <Tex tex="U" />
          </div>
          <div className="l15-tg-uv" onMouseOver={pick} onClick={pick}>
            <Matrix rows={STAR} bands={[...zeroZone(STAR), { row: I, col: J, tone: 'cell' }]} />
            <Tex tex="UV" />
          </div>
        </div>
      </div>
    </div>
  );
}
