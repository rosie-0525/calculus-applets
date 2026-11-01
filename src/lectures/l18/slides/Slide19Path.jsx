import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import TexSvg from '../components/TexSvg.jsx';
import NewtonPicture, { Point, XR, YR } from '../components/NewtonPicture.jsx';
import { sample, levelSegments, segmentsPath } from '../components/levels.js';
import { INK, RED, f, Df, det2, newtonPath, newtonStep } from '../components/inv.js';
import basins from '../assets/basin-path.png';

// the curve where (Df)(x, y) is not invertible, det (Df)(x, y) = 0 (the black curves of the user's
// picture of the basins)
export const SEG_DET = levelSegments(sample((x, y) => det2(Df([x, y])), XR, YR, 200), 0);

/**
 * Under NewtonPicture's curves: key press 2, the curve det (Df) = 0 (ink); key press 3, over it the
 * part of the basins in NewtonPicture's window (scripts/basins.mjs, basin-path.png: the starting
 * points from which a₁, a₂, … converge to (∛3, 0) orange, to the zero Example 5 finds blue, to the
 * third zero green; colours of the user's picture), see-through, so that the curves and the grid
 * still show (the user's request: the relevant part of the basins overlaid on the picture, the
 * curve first, then the regions).
 */
export function under(p) {
  const w = (XR[1] - XR[0]) * p.unit;
  const h = (YR[1] - YR[0]) * p.unit;
  return (
    <g>
      <Fragment as="g" index={3}>
        <image href={basins} x={p.px(XR[0])} y={p.py(YR[1])} width={w} height={h} preserveAspectRatio="none" opacity="0.55" />
      </Fragment>
      <Fragment as="g" index={2}>
        <path d={segmentsPath(SEG_DET, ([x, y]) => [p.px(x), p.py(y)])} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        <TexSvg x={p.px(1.63)} y={p.py(1.31)} tex={r`\det(Df)=0`} size={22} color={INK} anchor="end" w={150} h={34} className="l18-halo" />
      </Fragment>
    </g>
  );
}

/**
 * The path on the picture `p`: the points a₂, a₃, … (red) one after the other, a₂ named, and a₁
 * (ink); over the basins (`ring`), each on a white disc.
 */
export function marks(p, path, key, ring = false) {
  const disc = (at) => ring && <circle cx={p.px(at[0])} cy={p.py(at[1])} r={8} fill="#fff" />;
  return (
    <g key={key}>
      {/* the dots alone, not joined (the user's request) */}
      {path.slice(1).map((b, k) => (
        <g key={k} className="l18-path-step" style={{ '--k': k + 1 }}>
          {disc(b)}
          <circle cx={p.px(b[0])} cy={p.py(b[1])} r={5.5} fill={RED} />
          {k === 0 && <Point p={p} at={b} k={2} color={RED} dx={p.px(b[0]) > p.W - 50 ? -36 : 10} dy={p.py(b[1]) < 30 ? 28 : -12} />}
        </g>
      ))}
      {disc(path[0])}
      <Point p={p} at={path[0]} k={1} color={INK} dx={-34} dy={-12} />
    </g>
  );
}

export const START = [0, 1];
export const ROWS = 6;
export const norm = (v) => Math.hypot(...v);
/** A small number as TeX: 0.0169, 3.4·10⁻⁵, … */
export const sci = (x) => {
  if (x === 0) return '0';
  if (x >= 0.001) return x >= 0.1 ? x.toFixed(3) : x.toPrecision(3);
  const e = Math.floor(Math.log10(x));
  return `${(x / 10 ** e).toFixed(1)}\\cdot 10^{${e}}`;
};
export const coord = (v) => (Number.isInteger(v) ? `${v}` : (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6)).replace('-', '−'); // no −0.000000

/**
 * More steps (first Newton's method at work, renamed by the user), on Example 5's f: on arrival a₁ = (0, 1) and its row; key press 1:
 * the points a₂, a₃, … one after the other, not joined by lines (the user's request) (CSS, `.l18-path-step`), and the rows of the table,
 * ‖f(a_k)‖ shrinking fast (its exponent about doubling each step), a₃ already near a. A click on the
 * picture starts Newton's method from there instead (a gray note under the table says so; not in print) (its path drawn again, step by step; where
 * (Df)(a_k) is not invertible, the table says so); it may converge to the other zero, or run away.
 * The numerics on the left, the picture on a card on the right (the user's request). Key press 2:
 * the curve det (Df) = 0; key press 3: the regions of the zeros over the picture (`under`; the
 * user's request, in place of a cross-fade into the user's picture of the basins). The path's dots
 * sit on white discs, to show over the regions.
 */
export default function Slide19Path() {
  const [start, setStart] = useState(START);
  const path = newtonPath(start, ROWS);
  const stuck = path.length < ROWS && !newtonStep(path[path.length - 1]);
  const key = start.join(',');
  const pick = (q) => setStart(q.map((c) => Math.round(c * 100) / 100));
  return (
    <section>
      <h2>More steps</h2>

      {/* the path and the rows after the first come on key press 1 (.l18-path-step, in deck.css) */}
      <FxMarker index={1} id="path" />
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

        {/* key presses 2 and 3: the curve det (Df) = 0, then the regions (`under`) */}
        <div className="l18-path-pic">
          <NewtonPicture name onPick={pick} under={under}>
            {(p) => marks(p, path, key, true)}
          </NewtonPicture>
        </div>
      </div>
    </section>
  );
}
