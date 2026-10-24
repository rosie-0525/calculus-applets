import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Matrix from '../components/Matrix.jsx';

// the textbook's Example 14.3.9
export const A = [
  ['1', '2', '3'],
  ['4', '5', '6'],
];
export const B = [
  ['1', '2'],
  ['3', '4'],
  ['5', '6'],
];
export const STEPS = [
  { i: 0, j: 0, sum: '1\\cdot1+2\\cdot3+3\\cdot5', value: '22' },
  { i: 0, j: 1, sum: '1\\cdot2+2\\cdot4+3\\cdot6', value: '28' },
  { i: 1, j: 0, sum: '4\\cdot1+5\\cdot3+6\\cdot5', value: '49' },
  { i: 1, j: 1, sum: '4\\cdot2+5\\cdot4+6\\cdot6', value: '64' },
];
export const FLASH = 'fade-in-then-out';

/**
 * Computing AB (the textbook's diagram, with Example 14.3.9): B raised above AB, A to its left, each
 * matrix with its size (under A and AB, beside B). Key presses 1–4: one entry each, (1, 1), (1, 2), (2, 1), (2, 2): its row of
 * A and column of B tinted (for that key press only), the entry in AB, and its dot product in the
 * list on the right.
 */
export default function Slide14Computing() {
  const ab = [0, 1].map((i) => [0, 1].map((j) => {
    const k = STEPS.findIndex((s) => s.i === i && s.j === j);
    return { tex: STEPS[k].value, index: k + 1 };
  }));
  return (
    <section>
      <h2>
        Computing <Tex tex="AB" />
      </h2>

      <p>
        The <Tex tex="(i,j)" />
        -entry of <Tex tex="AB" /> is (row <Tex tex="i" /> of <Tex tex="A" />) <Tex tex={r`\cdot`} /> (column <Tex tex="j" /> of{' '}
        <Tex tex="B" />).
      </p>

      <div className="l14-compute">
        <div className="l14-compute-grid">
          <div className="l14-cg-b">
            <Matrix rows={B} bands={STEPS.map((s, k) => ({ col: s.j, tone: 'col', index: k + 1, effect: FLASH }))} />
            <span className="l14-size">
              <Tex tex={r`B\ \ (3\times2)`} />
            </span>
          </div>
          <div className="l14-cg-a">
            <Matrix rows={A} bands={STEPS.map((s, k) => ({ row: s.i, tone: 'row', index: k + 1, effect: FLASH }))} />
            <span className="l14-size">
              <Tex tex={r`A\ \ (2\times3)`} />
            </span>
          </div>
          <div className="l14-cg-ab">
            <Matrix rows={ab} bands={STEPS.map((s, k) => ({ row: s.i, col: s.j, tone: 'cell', index: k + 1, effect: FLASH }))} />
            <span className="l14-size">
              <Tex tex={r`AB\ \ (2\times2)`} />
            </span>
          </div>
        </div>

        <ul className="l14-compute-steps">
          {STEPS.map((s, k) => (
            <Fragment key={s.value} index={k + 1} as="li">
              <Tex tex={r`(${s.i + 1},${s.j + 1})\text{-entry: }${s.sum}=${s.value}`} />
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}
