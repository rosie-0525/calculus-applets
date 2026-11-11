import { useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import Space from '../lectures/l21/components/Space.jsx';
import Surface from '../lectures/l21/components/Surface.jsx';
import { GRAPHS, R, Z } from '../lectures/l21/slides/Slide13aTwoVariables.jsx';
import { from } from './redundancies.jsx';

export const lecture = 21;

/** One example: its matrix M, its form q_M(x, y), its graph (drag to turn it) and, on a button, its tag. */
function Graph({ g }) {
  const [on, setOn] = useState(false);
  return (
    <div className="l21-graph qg-card">
      <p className="l21-graph-m">
        <Tex tex={r`M=${g.M}`} />
      </p>
      <p className="l21-graph-q">
        <Tex tex={r`q_M(x,y)=${g.q}`} />
      </p>
      <div className="l21-graph-pic">
        <Space width={330} height={165} unit={52} center={[0.5, g.c]} el={22} axes={false} rock={false} title={`The graph of ${g.q}`}>
          {(s) => <Surface s={s} f={g.f} x={R} y={R} n={26} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />}
        </Space>
        <p className="l21-graph-tag" style={from(on ? 1 : 0, 1)}>
          {g.tag}
        </p>
      </div>
      <div className="viz-toggle">
        <button type="button" className="viz-button" aria-pressed={on} onClick={() => setOn((v) => !v)}>
          {on ? 'Hide' : 'What happens at 0?'}
        </button>
      </div>
    </div>
  );
}

/*
 * Quadratic forms in two variables, without its title and its pointer to Chapter 26 (the caption has
 * it): three examples, each its matrix M, q_M(x, y) and its graph: I₂, x² + y², a bowl; −I₂,
 * −x² − y²; diag(1, −1), x² − y², a saddle. On the slide each comes on a key press with its tag
 * under it (local minimum, local maximum, saddle); here the tag comes on the card's button, and each
 * graph turns when dragged.
 */
export default function QuadraticGraphs() {
  return (
    <div className="l21-graphs">
      {GRAPHS.map((g) => (
        <Graph key={g.tag} g={g} />
      ))}
    </div>
  );
}
