import { useEffect, useRef, useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import { M, A, B, C, LEFT, RIGHT, COUNT_HOLD, countAt } from '../lectures/l15/slides/Slide08bOrder.jsx';

export const lecture = 15;

/**
 * A step XY of the table, a button: XY = its value and, from the `run`-th click on (0: never),
 * its multiplications counted from 1, each x_ik y_kj shaded (in `root`) with the entry (i, j) it
 * goes into, as on the slide's key press (Slide08bOrder's Step, run by a click). `onDone` once the
 * count is over.
 */
function Step({ step, run, onClick, onDone, root }) {
  const { what, rows, name, x, y, q, s } = step;
  const n = rows.length * s * q;
  // multiplications counted so far: 0 before the count, n + 1 once it is over (nothing shaded)
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    if (!run) return undefined;
    const timers = Array.from({ length: n }, (_, k) => setTimeout(() => setCount(k + 1), countAt(k + 1, q)));
    timers.push(
      setTimeout(() => {
        setCount(n + 1);
        onDone();
      }, countAt(n, q) + COUNT_HOLD),
    );
    return () => timers.forEach(clearTimeout);
  }, [run, n, q]);

  // shade the count-th multiplication, x_ik y_kj, for the entry (i, j), in classes of this step's
  // own, so that two counts at once do not clear each other's
  const hot = useRef([]);
  useEffect(() => {
    hot.current.forEach((e) => e.classList.remove(`l15-hot-${name}`, `l15-sum-${name}`));
    hot.current = [];
    if (count < 1 || count > n || !root.current) return;
    const [i, j, k] = [Math.floor((count - 1) / (s * q)), Math.floor((count - 1) / q) % s, (count - 1) % q];
    [
      [`.l15-${x}-${i}-${k}`, `l15-hot-${name}`],
      [`.l15-${y}-${k}-${j}`, `l15-hot-${name}`],
      [`.l15-${name}-${i}-${j}`, `l15-sum-${name}`],
    ].forEach(([sel, cls]) => {
      const e = root.current.querySelector(sel);
      if (e) {
        e.classList.add(cls);
        hot.current.push(e);
      }
    });
  }, [count, n, q, s, x, y, name, root]);

  return (
    <button type="button" className="l15-order-row l15-order-step order-pick" aria-label={`Count the multiplications of ${what}`} onClick={onClick}>
      <Tex tex={`${what}=${M(rows, name)}`} />
      <span className="l15-order-count">{count === 0 ? (run ? '' : '?') : Math.min(count, n)}</span>
    </button>
  );
}

/*
 * Which order is faster?, the textbook's Section G.5: A, B, C, and the table of ABC computed two
 * ways, (AB)C and A(BC). On the slide each product comes on a key press, its multiplications
 * counted; here all four are there, and clicking one counts its multiplications (again on the next
 * click); a column's total comes once both its products are counted.
 */
export default function OrderCost() {
  const root = useRef(null);
  const [runs, setRuns] = useState({});
  const [done, setDone] = useState([]);
  const way = (tex, steps, total, best) => (
    <div className="l15-order-side">
      <div className="l15-order-head">
        <Tex className="l15-order-tex" tex={tex} />
        <span className="l15-order-count-head">multiplications</span>
      </div>
      {steps.map((step) => (
        <Step
          key={step.what}
          step={step}
          run={runs[step.what] ?? 0}
          onClick={() => setRuns((v) => ({ ...v, [step.what]: (v[step.what] ?? 0) + 1 }))}
          onDone={() => setDone((v) => (v.includes(step.what) ? v : [...v, step.what]))}
          root={root}
        />
      ))}
      <div className={`l15-order-row l15-order-total${best ? ' l15-order-best' : ''}`}>
        <span className="l15-order-what">total</span>
        <span className="l15-order-count">{steps.every((s) => done.includes(s.what)) ? total : ''}</span>
      </div>
    </div>
  );
  return (
    <div className="viz-col" ref={root}>
      <div className="l15-order-product">
        <Tex display tex={r`\underset{A}{${M(A, 'a')}}\underset{B}{${M(B, 'b')}}\underset{C}{${M(C, 'c')}}`} />
      </div>
      <div className="l15-order">
        {way('(AB)C', LEFT, 45, false)}
        {way('A(BC)', RIGHT, 36, true)}
      </div>
    </div>
  );
}
