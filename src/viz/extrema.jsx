import '../lectures/l7/styles/deck.css';
import { CASES, Graph, Contours } from '../lectures/l7/slides/Slide11bExtrema.jsx';

export const lecture = 7;

/* The three model cases with everything showing: each one's graph, with its level curves, over its
   contour plot. */
export default function Extrema() {
  return (
    <div className="ext-row">
      {CASES.map((c) => (
        <div key={c.name} className="ext-col">
          <p className="ext-name">{c.name}</p>
          <Graph f={c.f} levels={c.levels} name={c.name} />
          <Contours f={c.f} levels={c.levels} labels={c.labels} name={c.name} />
        </div>
      ))}
    </div>
  );
}
