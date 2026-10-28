import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

// the textbook's matrices (Section G.5), without its row vector, C cut to its first two columns (the user's
// request: just A, B and C, with C 3 × 2)
// with a `name`, the entry (i, j) gets the class l15-<name>-i-j, which the counts shade
export const M = (rows, name) =>
  r`\begin{bmatrix}${rows
    .map((row, i) => row.map((v, j) => (name ? r`\htmlClass{l15-${name}-${i}-${j}}{${v}}` : v)).join('&'))
    .join(r`\\ `)}\end{bmatrix}`;
export const A = [
  [1, 0, -1],
  [2, 1, 4],
  [3, 1, 1],
];
export const B = [
  [0, 2, 1],
  [3, -1, 0],
  [-2, 0, -1],
];
export const C = [
  [2, 1],
  [1, 1],
  [0, -1],
];
export const AB = [
  [2, 2, 2],
  [-5, 3, -2],
  [1, 5, 2],
];
export const BC = [
  [2, 1],
  [5, 2],
  [-4, -1],
];
export const ABC = [
  [6, 2],
  [-7, 0],
  [7, 4],
];

// the count of a product's multiplications (ms): it starts once the row is in, takes the first
// entry's q slowly, the others faster, and holds the last one before the shading goes
export const COUNT_START = 900;
export const COUNT_SLOW = 600;
export const COUNT_FAST = 220;
export const COUNT_HOLD = 600;
export const countAt = (m, q) => COUNT_START + Math.min(m - 1, q) * COUNT_SLOW + Math.max(m - 1 - q, 0) * COUNT_FAST;

// each step, on its own key press: what it computes, its value (its entries' class: `name`), and its
// factors X (p × q) and Y (q × s), by their entries' classes (A, B, C above; AB, BC in the table)
export const LEFT = [
  { what: 'AB', rows: AB, name: 'ab', x: 'a', y: 'b', q: 3, s: 3, index: 1 },
  { what: '(AB)C', rows: ABC, name: 'abc', x: 'ab', y: 'c', q: 3, s: 2, index: 2 },
];
export const RIGHT = [
  { what: 'BC', rows: BC, name: 'bc', x: 'b', y: 'c', q: 3, s: 2, index: 3 },
  { what: 'A(BC)', rows: ABC, name: 'abc2', x: 'a', y: 'bc', q: 3, s: 2, index: 4 },
];

/**
 * A step XY on its key press: XY = its value, and its multiplications counted from 1, each x_ik y_kj
 * shaded with the entry (i, j) it goes into.
 */
export function Step({ step }) {
  const { what, rows, name, x, y, q, s, index } = step;
  const n = rows.length * s * q;
  const marker = useRef(null);
  const shown = useFragmentShown(marker);
  // multiplications counted so far: 0 before the count, n + 1 once it is over (nothing shaded)
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shown) {
      setCount(0);
      return undefined;
    }
    const timers = Array.from({ length: n }, (_, k) => setTimeout(() => setCount(k + 1), countAt(k + 1, q)));
    timers.push(setTimeout(() => setCount(n + 1), countAt(n, q) + COUNT_HOLD));
    return () => timers.forEach(clearTimeout);
  }, [shown, n, q]);
  const m = PRINT ? n + 1 : count;

  // shade the m-th multiplication, x_ik y_kj, for the entry (i, j), in classes of this step's own
  // (l15-hot-<name>, l15-sum-<name>), so that two counts at once do not clear each other's
  const hot = useRef([]);
  useEffect(() => {
    hot.current.forEach((e) => e.classList.remove(`l15-hot-${name}`, `l15-sum-${name}`));
    hot.current = [];
    const section = marker.current?.closest('section');
    if (m < 1 || m > n || !section) return;
    const [i, j, k] = [Math.floor((m - 1) / (s * q)), Math.floor((m - 1) / q) % s, (m - 1) % q];
    [
      [`.l15-${x}-${i}-${k}`, `l15-hot-${name}`],
      [`.l15-${y}-${k}-${j}`, `l15-hot-${name}`],
      [`.l15-${name}-${i}-${j}`, `l15-sum-${name}`],
    ].forEach(([sel, cls]) => {
      const e = section.querySelector(sel);
      if (e) {
        e.classList.add(cls);
        hot.current.push(e);
      }
    });
  }, [m, n, q, s, x, y, name]);

  return (
    <Fragment index={index} className="l15-order-row l15-order-step">
      <span ref={marker} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <Tex tex={`${what}=${M(rows, name)}`} />
      <span className="l15-order-count">{m === 0 ? '' : Math.min(m, n)}</span>
    </Fragment>
  );
}

/** One way of computing ABC, a column of the table: its heading, its steps and (on `totalAt`) the total. */
export function Way({ tex, steps, total, totalAt, best }) {
  return (
    <div className="l15-order-side">
      <div className="l15-order-head">
        <Tex className="l15-order-tex" tex={tex} />
        <span className="l15-order-count-head">multiplications</span>
      </div>
      {steps.map((step) => (
        <Step key={step.what} step={step} />
      ))}
      <Fragment index={totalAt} className={`l15-order-row l15-order-total${best ? ' l15-order-best' : ''}`}>
        <span className="l15-order-what">total</span>
        <span className="l15-order-count">{total}</span>
      </Fragment>
    </div>
  );
}

/**
 * Which order is faster? (after Associativity; the textbook's Section G.5, without its vector, C
 * 3 × 2): ABC, two ways, the columns of a table headed (AB)C and A(BC). Key presses 1–4: AB, (AB)C,
 * BC, A(BC), one product per key press (the user's request), each with its multiplications counted,
 * the two entries each multiplies shaded (in A, B, C above, or in AB, BC in the table) with the entry
 * it goes into; 5: the totals, 45 and 36. The same answer, by associativity. (The ='s are not lined
 * up, and the counts have a column of their own, as wide as its heading: the user's request.)
 */
export default function Slide08bOrder() {
  return (
    <section className="dense">
      <h2>Which order is faster?</h2>

      <div className="l15-order-product">
        <Tex display tex={r`\underset{A}{${M(A, 'a')}}\underset{B}{${M(B, 'b')}}\underset{C}{${M(C, 'c')}}`} />
      </div>

      <div className="l15-order">
        <Way tex="(AB)C" steps={LEFT} total={45} totalAt={5} />
        <Way tex="A(BC)" steps={RIGHT} total={36} totalAt={5} best />
      </div>
    </section>
  );
}
