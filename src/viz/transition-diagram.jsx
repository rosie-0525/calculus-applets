import { useState } from 'react';
import '../lectures/l16/styles/deck.css';
import IslandMap from '../lectures/l16/components/IslandMap.jsx';
import { RULES, tint } from '../lectures/l16/slides/Slide02bDiagram.jsx';
import { Isle } from '../lectures/l16/slides/Slide01bBirds.jsx';

export const lecture = 16;

/**
 * IslandMap's `redrawAt`: island `pick`'s flights drawn again (site.css, a fragment index of its
 * own, 10 or 11 by turns, so that each click restarts the drawing), the others still.
 */
export const redrawAt = (pick, run) => [0, 1, 2].map((i) => (i === pick ? 10 + (run % 2) : 1));

/*
 * Transition diagram: the opener's rules beside the three islands. On the slide each island's
 * flights come on a key press, its rule highlighted; here they are all drawn, and a click on a rule
 * highlights it and draws its island's flights again.
 */
export default function TransitionDiagram() {
  const [pick, setPick] = useState(null);
  const [run, setRun] = useState(0);
  const choose = (i) => {
    setPick(i);
    setRun((n) => n + 1);
  };
  return (
    <div className="l16-ex1 l16-diag">
      <div className="l16-diag-rules">
        <p>Every year:</p>
        <ul>
          {RULES.map((rule, i) => (
            <li key={i}>
              <button type="button" className="diag-pick" aria-pressed={pick === i} onClick={() => choose(i)}>
                {pick === i && (
                  <span className="l16-diag-hi">
                    <span style={tint(i)} />
                  </span>
                )}
                <Isle i={i} />: {rule}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="l16-isles-wrap redraw-pick">
        <IslandMap width={580} redrawAt={redrawAt(pick, run)} />
      </div>
    </div>
  );
}
