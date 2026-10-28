import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import Matrix from '../lectures/l15/components/Matrix.jsx';
import { UPPER, LOWER, STAR, zeroZone, Shear } from '../lectures/l15/slides/Slide16Triangular.jsx';

export const lecture = 15;

/*
 * Triangular matrices without the definition (the caption says it): the upper and lower triangular
 * 4 × 4 patterns, the part that must be zero gray; the textbook's upper and lower triangular
 * matrices (Example 15.1.7); the shears [1 1; 0 1] and [1 0; 1 1], the unit square and F gliding
 * to their images on a loop (while the applet is on screen). On the slide each comes on a key press.
 */
export default function Triangular() {
  return (
    <div className="viz-col tri-col">
      <div className="l15-tri-shapes">
        <div>
          <Matrix rows={STAR(false)} bands={zeroZone(STAR(false))} />
          <p className="l15-tri-name">upper triangular</p>
        </div>
        <div>
          <Matrix rows={STAR(true)} bands={zeroZone(STAR(true), true)} />
          <p className="l15-tri-name">lower triangular</p>
        </div>
      </div>

      <div className="l15-tri-bottom">
        <div className="l15-tri-examples">
          <div className="l15-diag-row">
            <p className="l15-diag-label">Upper triangular:</p>
            {UPPER.map((rows, k) => (
              <Matrix key={k} rows={rows} bands={zeroZone(rows)} />
            ))}
          </div>
          <div className="l15-diag-row">
            <p className="l15-diag-label">Lower triangular:</p>
            {LOWER.map((rows, k) => (
              <Matrix key={k} rows={rows} bands={zeroZone(rows, true)} />
            ))}
          </div>
        </div>
        <div className="l15-tri-shears">
          <div className="l15-tri-shear">
            <Shear index={1} />
            <p>
              <Tex tex={r`\begin{bmatrix}1&1\\ 0&1\end{bmatrix}`} />: shear
            </p>
          </div>
          <div className="l15-tri-shear">
            <Shear index={2} lower />
            <p>
              <Tex tex={r`\begin{bmatrix}1&0\\ 1&1\end{bmatrix}`} />: shear
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
