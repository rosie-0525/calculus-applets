import { useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex, { r } from '../lectures/l26/components/Tex.jsx';
import ExContour from '../lectures/l26/components/ExContours.jsx';
import { RED, TEAL, GRAY, INK } from '../lectures/l26/slides/Slide06bRecallTest.jsx';
import { from } from './redundancies.jsx';

export const lecture = 26;

// the answers (the slide's, commented out there): Hf(x, y) = [6y, 6x − 12y; 6x − 12y, −12x + 24y] at
// each critical point, its eigenvalues, and what the point is; the colours are Recall: second
// derivative test's (a local minimum teal, a local maximum red, gray for the others); `at` where the
// label goes, from the point (px), and how it is anchored
const POINTS = [
  { a: [1, 1], h: r`\begin{bmatrix}6&-6\\-6&12\end{bmatrix}`, lams: r`9\pm3\sqrt5`, says: 'both > 0', kind: 'local minimum', color: TEAL, at: [12, -10], anchor: 'start' },
  { a: [-1, -1], h: r`\begin{bmatrix}-6&6\\6&-12\end{bmatrix}`, lams: r`-9\pm3\sqrt5`, says: 'both < 0', kind: 'local maximum', color: RED, at: [-12, 22], anchor: 'end' },
  { a: [1, 0], h: r`\begin{bmatrix}0&6\\6&-12\end{bmatrix}`, lams: r`-6\pm6\sqrt2`, says: 'one > 0, one < 0', kind: 'saddle point', color: GRAY, at: [0, -14], anchor: 'middle' },
  { a: [-1, 0], h: r`\begin{bmatrix}0&-6\\-6&12\end{bmatrix}`, lams: r`6\pm6\sqrt2`, says: 'one > 0, one < 0', kind: 'saddle point', color: GRAY, at: [0, 26], anchor: 'middle' },
];

const HALO = { stroke: '#fff', strokeWidth: 4.5, paintOrder: 'stroke', strokeLinejoin: 'round' };
const pt = ([x, y]) => `(${x < 0 ? '−' : ''}${Math.abs(x)}, ${y < 0 ? '−' : ''}${Math.abs(y)})`;

/*
 * Example 3 (board), without its title and its two parts (the caption has them): the contour plot of
 * f(x, y) = 3x²y − 6xy² + 4y³ − 3y (ExContours.jsx), its levels on the curves. The answers are not on
 * the slide (they are worked on the board, and commented out in the slide's source); here a button
 * marks the four critical points on the plot, each with what it is, and shows beside the plot (the
 * plot alone is centred until then) each one's Hessian, its eigenvalues and what that says. In a
 * narrow box the answers are under the plot.
 */
export default function ClassifyExample() {
  const [on, setOn] = useState(false);
  return (
    <div className="viz-col cx">
      <div className="cx-row">
        <ExContour k={0} size={[520, 443]} labelSize={14} tickSize={16}>
          {(p) => (
            <g style={from(on ? 1 : 0, 1)}>
              {POINTS.map((q) => {
                const [x, y] = [p.px(q.a[0]), p.py(q.a[1])];
                return (
                  <g key={pt(q.a)}>
                    <circle cx={x} cy={y} r="6" fill={q.color} stroke="#fff" strokeWidth="1.8" />
                    <text x={x + q.at[0]} y={y + q.at[1]} textAnchor={q.anchor} fontSize="17" fontWeight="700" fill={q.color} {...HALO}>
                      {q.kind}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </ExContour>
        {on && (
          <table className="cx-answers">
            <thead>
              <tr>
                <th>
                  <Tex tex={r`\vv a`} />
                </th>
                <th>
                  <Tex tex={r`(Hf)(\vv a)`} />
                </th>
                <th>eigenvalues</th>
              </tr>
            </thead>
            <tbody>
              {POINTS.map((q) => (
                <tr key={pt(q.a)}>
                  <td style={{ color: INK }}>
                    <Tex tex={pt(q.a).replaceAll('−', '-')} />
                  </td>
                  <td>
                    <Tex tex={q.h} />
                  </td>
                  <td>
                    <Tex tex={q.lams} />
                    <br />
                    <span className="cx-says">{q.says}:</span>{' '}
                    <strong style={{ color: q.color }}>{q.kind}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={on} onClick={() => setOn((v) => !v)}>
          {on ? 'Hide the critical points' : 'Show the critical points'}
        </button>
      </div>
    </div>
  );
}
