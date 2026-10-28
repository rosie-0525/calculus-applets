import { useState } from 'react';
import Tex from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Matrix from '../components/Matrix.jsx';
import { zeroZone } from './Slide16Triangular.jsx';

export const parse = (s) => s.split(';').map((row) => row.trim().split(/\s+/));
// the textbook's example after Example 15.1.7
export const U = parse('2 -1 1; 0 -3 2; 0 0 4');
export const V = parse('-1 3 6 1; 0 4 5 -3; 0 0 -2 1');
export const UV = parse('-2 2 5 6; 0 -12 -19 11; 0 0 -8 4');
export const STAR = [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i <= j ? '*' : '0')));

/**
 * Products of triangular matrices (Mark's remark, Example 15.1.7). Key press 1: the textbook's
 * product of two upper triangular matrices, the zeros below each diagonal gray; 2: why, on 4 × 4
 * patterns laid out as on Computing AB (V above, U to its left): the (3, 2)-entry, below the diagonal,
 * is row 3 of U (tinted) times column 2 of V (tinted), and each of its four terms has a factor 0.
 * Hovering over an entry of UV tints its row of U and column of V instead. (The entry written out
 * below, (3, 2)-entry = 0·∗ + ∗·0 + …, removed by the user: its width changed with the entry, which
 * moved the picture; now nothing moves.)
 */
export default function Slide17TriangularProducts() {
  const [[I, J], setEntry] = useState([2, 1]);
  const hover = (e) => {
    const el = e.target.closest('.l13-entry');
    if (el?.dataset.i != null) setEntry([Number(el.dataset.i), Number(el.dataset.j)]);
  };
  return (
    <section className="dense">
      <h2>Products of triangular matrices</h2>

      <div className="block theorem">
        <p>
          The product of two upper triangular matrices is upper triangular (assuming this product is defined). Similarly, the product of two
          lower triangular matrices is lower triangular.
        </p>
      </div>

      <div className="l15-triprod">
        <Fragment index={1} className="l15-eq-row">
          <Matrix rows={U} bands={zeroZone(U)} />
          <Matrix rows={V} bands={zeroZone(V)} />
          <Tex tex="=" />
          <Matrix rows={UV} bands={zeroZone(UV)} />
        </Fragment>

        <Fragment index={2} className="l15-triprod-why">
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
            <div className="l15-tg-uv" onMouseOver={hover}>
              <Matrix rows={STAR} bands={[...zeroZone(STAR), { row: I, col: J, tone: 'cell' }]} />
              <Tex tex="UV" />
            </div>
          </div>
        </Fragment>
      </div>
    </section>
  );
}
