import { useState } from 'react';
import '../lectures/l25/styles/deck.css';
import Tex from '../lectures/l25/components/Tex.jsx';
import Space from '../lectures/l25/components/Space.jsx';
import Surface from '../lectures/l25/components/Surface.jsx';
import TexSvg from '../lectures/l25/components/TexSvg.jsx';
import { AMBER } from '../lectures/l25/components/eig.js';
import { CARDS, R, Z, ZERO } from '../lectures/l25/slides/Slide16bSemidefinite.jsx';
import { from } from './redundancies.jsx';

export const lecture = 25;

/** One column: its clause over its example's graph (drag to turn it), A and q_A under it, and on its
 *  button, the line where q_A = 0 on the graph, its label and not … under it. */
function Column({ c }) {
  const [on, setOn] = useState(false);
  return (
    <div className="l25-def">
      <p className="l25-def-clause">
        <strong>{c.name}</strong>
        <span>{c.def}</span>
      </p>
      <div className="l25-def-pic">
        <Space width={330} height={187} unit={52} center={[0.5, c.c]} el={34} axes={false} rock={false} title={`The graph of ${c.q}, zero along the ${c.zero}-axis`}>
          {(s) => {
            // the line where q_A = 0, and its label beyond its right-hand end, not … under it (as on
            // the slide: the ridge's label raised by dy, so that not … clears the ridge)
            const line = ZERO(c.zero).map((q) => s.P(q));
            const end = line[0][0] > line[line.length - 1][0] ? line[0] : line[line.length - 1];
            return (
              <g>
                <Surface s={s} f={c.f} x={R} y={R} n={26} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
                <g style={from(on ? 1 : 0, 1)}>
                  <polyline points={line.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} fill="none" stroke={AMBER} strokeWidth="3" strokeLinecap="round" />
                  <TexSvg x={end[0] + 8} y={end[1] + c.dy} tex={c.label} color={AMBER} size={22} anchor="start" w={140} h={32} />
                  <text className="l25-semi-not" x={end[0] + 11} y={end[1] + c.dy + 25} fill={AMBER}>
                    {c.not}
                  </text>
                </g>
              </g>
            );
          }}
        </Space>
        <p className="l25-def-q">
          <Tex tex={`A=${c.m}`} />
          <br />
          <Tex tex={`q_A(x,y)=${c.q}${c.sign}`} />
        </p>
      </div>
      <div className="viz-toggle sd-toggle">
        <button type="button" className="viz-button" aria-pressed={on} onClick={() => setOn((v) => !v)}>
          {on ? (
            'Hide'
          ) : (
            <>
              Where is <Tex tex="q_A=0" />?
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/*
 * Semidefinite, without its box (the caption has the definitions): two columns in Definiteness's
 * style, positive-semidefinite and negative-semidefinite, each its clause over its example: [1 0; 0 0],
 * q_A = x² ≥ 0, a trough, and [0 0; 0 −1], q_A = −y² ≤ 0, a ridge. On the slide each column comes on a
 * key press, its graph on the next, then on its graph the line where q_A = 0 (the y-axis, the x-axis),
 * amber, with its label and "not positive-definite" ("not negative-definite"); here the clauses and
 * graphs are there at once, and each column's line comes on its button. Each graph turns when
 * dragged. In a narrow box the columns are one under the other.
 */
export default function Semidefinite() {
  return (
    <div className="l25-defs l25-semis sd-cards">
      {CARDS.map((c) => (
        <Column key={c.name} c={c} />
      ))}
    </div>
  );
}
