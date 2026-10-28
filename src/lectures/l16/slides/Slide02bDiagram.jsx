import Fragment from '../components/Fragment.jsx';
import IslandMap from '../components/IslandMap.jsx';
import { Isle } from './Slide01bBirds.jsx';
import { ISLES } from '../components/markov.js';

// the opener's rules, island by island
export const RULES = ['half fly to B, half to C.', 'half fly to A, half to C.', 'a third stay, a third fly to A, a third to B.'];
// a rule's highlight: a wash of its island's colour
export const tint = (i) => ({ background: `color-mix(in srgb, ${ISLES[i].color} 15%, transparent)` });

/**
 * Transition diagram, before Example 1: the opener's rules, as a reminder, beside the three
 * islands; key presses 1-3, one island's flights each, their shares on the arrows, its rule
 * highlighted. The diagram glides to its place on Example 1 (auto-animate, the same data-id).
 */
export default function Slide02bDiagram() {
  return (
    <section data-auto-animate="">
      <h2>Transition diagram</h2>

      <div className="l16-ex1 l16-diag">
        <div className="l16-diag-rules">
          <p>Every year:</p>
          <ul>
            {RULES.map((rule, i) => (
              <li key={i}>
                {/* the highlight, from this island's key press until the next island's */}
                <Fragment as="span" index={i + 1} className="l16-diag-hi">
                  {i < 2 ? <Fragment as="span" index={i + 2} effect="fade-out" style={tint(i)} /> : <span style={tint(i)} />}
                </Fragment>
                <Isle i={i} />: {rule}
              </li>
            ))}
          </ul>
        </div>
        <div className="l16-isles-wrap" data-id="l16-diagram">
          <IslandMap width={580} steps={[1, 2, 3]} />
        </div>
      </div>
    </section>
  );
}
