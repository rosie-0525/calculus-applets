import { useState } from 'react';
import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import CrowdMap from '../lectures/l11/components/CrowdMap.jsx';

export const lecture = 11;

/*
 * How do 300 units find their way?, without its two lines (the caption says them): the game's map
 * with the goal set, where a click sends the army to a new goal. On the slide the level curves of
 * D and the arrows of −∇D come on key presses; here they are both shown, and the buttons hide
 * them.
 */
export default function Crowd() {
  const [levels, setLevels] = useState(true);
  const [arrows, setArrows] = useState(true);
  return (
    <div className="viz-col">
      <div className="viz-toggle" role="group" aria-label="What the map shows">
        <button type="button" className="viz-button" aria-pressed={levels} onClick={() => setLevels((v) => !v)}>
          Level curves of <Tex tex="D" />
        </button>
        <button type="button" className="viz-button" aria-pressed={arrows} onClick={() => setArrows((v) => !v)}>
          Arrows of <Tex tex={r`-\nabla D`} />
        </button>
      </div>
      <CrowdMap width={1100} preset levels={levels ? 1 : undefined} arrows={arrows ? 2 : undefined} />
    </div>
  );
}
