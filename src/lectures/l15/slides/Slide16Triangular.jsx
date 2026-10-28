import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Matrix from '../components/Matrix.jsx';
import FPanel from '../components/FPanel.jsx';
import { useFragmentShown, useLoopTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';

export const parse = (s) => s.split(';').map((row) => row.trim().split(/\s+/));
// the textbook's Example 15.1.7
export const UPPER = ['1 5 0; 0 1 0; 0 0 1', '-2 -1 7 4; 0 1 2 0; 0 0 -5 3', '3 0 4; 0 -6 2; 0 0 -5; 0 0 0'].map(parse);
export const LOWER = ['2 0 0; 5 1 0; 0 4 -3', '-2 0 0 0; 6 1 0 0; 4 -3 5 0', '3 0 0; 2 -6 0; 4 7 -5; 9 -2 -1'].map(parse);
export const STAR = (lower) => [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => ((lower ? i >= j : i <= j) ? '*' : '0')));

/** Gray bands on the part that must be zero: below the diagonal (upper triangular) or above it. */
export const zeroZone = (rows, lower = false) =>
  rows.flatMap((row, i) => row.map((_, j) => ((lower ? j > i : i > j) ? { row: i, col: j, tone: 'l15-zero' } : null)).filter(Boolean));

/**
 * The shear [1 1; 0 1] (upper triangular), or [1 0; 1 1] (`lower`), on a loop from key press `index`,
 * the unit square and F gliding to their images. The two panels are the same size: the lower one's
 * plane is moved up, for its image reaches y = 2.
 */
export function Shear({ index, lower = false }) {
  const ref = useRef(null);
  const live = () => Boolean(ref.current?.closest('section')?.classList.contains('present'));
  const t = useLoopTween(useFragmentShown(ref), { ms: 1600, delay: 500, hold: 1800, live });
  const k = PRINT ? 1 : t;
  return (
    <>
      <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      {lower ? (
        <FPanel
          M={[
            [1, 0],
            [k, 1],
          ]}
          unit={56}
          xRange={[-1.3, 2.3]}
          yRange={[-0.4, 2.2]}
          title="The shear [1 0; 1 1]"
        />
      ) : (
        <FPanel
          M={[
            [1, k],
            [0, 1],
          ]}
          unit={56}
          title="The shear [1 1; 0 1]"
        />
      )}
    </>
  );
}

/**
 * Triangular matrices: Mark's definition (Example 15.1.7), its second sentence on key press 2. Key
 * press 1: an upper triangular 4 × 4 pattern, the part below the diagonal gray (all zeros); 2: the
 * lower one; 3, 4: the textbook's upper and lower triangular matrices, likewise; 5: a shear is
 * multiplication by a triangular matrix (Mark's remark), on a loop: [1 1; 0 1]; 6: [1 0; 1 1], the
 * lower one (the user's request), beside it. The labels say "upper triangular", "lower triangular"
 * in full (the user's request).
 */
export default function Slide16Triangular() {
  return (
    <section>
      <h2>Triangular matrices</h2>

      <div className="l15-tri-top">
        <div className="block definition">
          <p>
            A matrix is <strong>upper triangular</strong> when its only nonzero entries are on or above its diagonal.{' '}
            <Fragment index={2} as="span">
              It is <strong>lower triangular</strong> when its only nonzero entries are on or below the diagonal.
            </Fragment>
          </p>
        </div>
        <div className="l15-tri-shapes">
          <Fragment index={1}>
            <Matrix rows={STAR(false)} bands={zeroZone(STAR(false))} />
            <p className="l15-tri-name">upper triangular</p>
          </Fragment>
          <Fragment index={2}>
            <Matrix rows={STAR(true)} bands={zeroZone(STAR(true), true)} />
            <p className="l15-tri-name">lower triangular</p>
          </Fragment>
        </div>
      </div>

      <div className="l15-tri-bottom">
        <div className="l15-tri-examples">
          <Fragment index={3} className="l15-diag-row">
            <p className="l15-diag-label">Upper triangular:</p>
            {UPPER.map((rows, k) => (
              <Matrix key={k} rows={rows} bands={zeroZone(rows)} />
            ))}
          </Fragment>
          <Fragment index={4} className="l15-diag-row">
            <p className="l15-diag-label">Lower triangular:</p>
            {LOWER.map((rows, k) => (
              <Matrix key={k} rows={rows} bands={zeroZone(rows, true)} />
            ))}
          </Fragment>
        </div>
        <div className="l15-tri-shears">
          <Fragment index={5} className="l15-tri-shear">
            <Shear index={5} />
            <p>
              <Tex tex={r`\begin{bmatrix}1&1\\ 0&1\end{bmatrix}`} />: shear
            </p>
          </Fragment>
          <Fragment index={6} className="l15-tri-shear">
            <Shear index={6} lower />
            <p>
              <Tex tex={r`\begin{bmatrix}1&0\\ 1&1\end{bmatrix}`} />: shear
            </p>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
