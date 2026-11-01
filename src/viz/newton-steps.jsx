import { useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import TexSvg from '../lectures/l18/components/TexSvg.jsx';
import NewtonPicture, { XR, YR } from '../lectures/l18/components/NewtonPicture.jsx';
import { segmentsPath } from '../lectures/l18/components/levels.js';
import { INK, f, newtonPath, newtonStep } from '../lectures/l18/components/inv.js';
import { SEG_DET, marks, START, ROWS, norm, sci, coord } from '../lectures/l18/slides/Slide19Path.jsx';
import basins from '../lectures/l18/assets/basin-path.png';

export const lecture = 18;

/**
 * Under the curves, as the slide's `under` draws on its key presses 2 and 3: the curve det (Df) = 0
 * (`det`), and the regions of the zeros in this window (`regions`), see-through.
 */
const under = (det, regions) =>
  function Under(p) {
    const w = (XR[1] - XR[0]) * p.unit;
    const h = (YR[1] - YR[0]) * p.unit;
    return (
      <g>
        {regions && <image href={basins} x={p.px(XR[0])} y={p.py(YR[1])} width={w} height={h} preserveAspectRatio="none" opacity="0.55" />}
        {det && (
          <g>
            <path d={segmentsPath(SEG_DET, ([x, y]) => [p.px(x), p.py(y)])} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
            <TexSvg x={p.px(1.63)} y={p.py(1.31)} tex={r`\det(Df)=0`} size={22} color={INK} anchor="end" w={150} h={34} className="l18-halo" />
          </g>
        )}
      </g>
    );
  };

/*
 * More steps, without its title, on Example 5's f: on the left, f and the table of a_k and
 * ‖f(a_k)‖; on the right, on a card, the curves f₁ = 0 and f₂ = 0, and the points a₁, a₂, …
 * appearing one after another (the deck's CSS, on the page's own marker, not a fragment). A click on
 * the picture starts Newton's method from there; the table says when (Df)(a_k) is not invertible.
 * On the slide the curve det (Df) = 0 and the regions of the zeros come on key presses 2 and 3; here
 * two buttons show and hide them.
 */
export default function NewtonSteps() {
  const [start, setStart] = useState(START);
  const [det, setDet] = useState(false);
  const [regions, setRegions] = useState(false);
  const path = newtonPath(start, ROWS);
  const stuck = path.length < ROWS && !newtonStep(path[path.length - 1]);
  const key = start.join(',');
  const pick = (q) => setStart(q.map((c) => Math.round(c * 100) / 100));
  return (
    <div className="viz-col">
      <span className="fx-marker visible" data-fx="path" aria-hidden="true" />
      <div className="l18-path fx-host">
        <div className="l18-path-text">
          <p className="l18-path-lead">
            <Tex tex={r`f(x,y)=(x^3+xy+2y^3-3,\ x^2y+xy^2-y)`} />
          </p>
          <table className="l18-table l18-path-table">
            <thead>
              <tr>
                <th>
                  <Tex tex="k" />
                </th>
                <th>
                  <Tex tex={r`\vv a_k`} />
                </th>
                <th>
                  <Tex tex={r`\norm{f(\vv a_k)}`} />
                </th>
              </tr>
            </thead>
            <tbody key={key}>
              {path.map((a, k) => (
                <tr key={k} className={k === 0 ? '' : 'l18-path-step'} style={{ '--k': k }}>
                  <td>
                    <Tex tex={`${k + 1}`} />
                  </td>
                  <td className="l18-digits">
                    ({coord(a[0])}, {coord(a[1])})
                  </td>
                  <td>
                    <Tex tex={sci(norm(f(a)))} />
                  </td>
                </tr>
              ))}
              {stuck && (
                <tr className="l18-path-step" style={{ '--k': path.length }}>
                  <td colSpan={3} className="l18-not">
                    <Tex tex={r`(Df)(\vv a_{${path.length}})`} /> is not invertible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="l18-path-hint">Click the picture to start from another point.</p>
        </div>

        <div className="l18-path-pic">
          <NewtonPicture name onPick={pick} under={under(det, regions)}>
            {(p) => marks(p, path, key, regions)}
          </NewtonPicture>
        </div>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={det} onClick={() => setDet((v) => !v)}>
          Where (Df) is not invertible
        </button>
        <button type="button" className="viz-button" aria-pressed={regions} onClick={() => setRegions((v) => !v)}>
          Which zero, from where?
        </button>
      </div>
    </div>
  );
}
