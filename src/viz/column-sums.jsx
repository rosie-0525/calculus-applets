import { useState } from 'react';
import '../lectures/l16/styles/deck.css';
import { r } from '../lectures/l16/components/Tex.jsx';
import FromTo, { ISLAND_STATES, M_BIRDS_TEX } from '../lectures/l16/components/FromTo.jsx';
import IslandMap from '../lectures/l16/components/IslandMap.jsx';
import { redrawAt } from './transition-diagram.jsx';

export const lecture = 16;

/*
 * Which sums of M must be 1?, the poll's why: Example 1's M beside the transition diagram, the
 * states over the columns and beside the rows. On the slide each column is highlighted in turn on
 * a key press, its island's flights drawn again; here a click on a column does that. (The poll
 * itself is the caption.)
 */
export default function ColumnSums() {
  const [pick, setPick] = useState(null);
  const [run, setRun] = useState(0);
  // the column clicked: FromTo places its cells by grid column, the entries from column 4 on
  const onClick = (e) => {
    const cell = e.target.closest('.l16-ft-entry, .l16-ft-band, .l16-ft-from');
    const j = cell ? parseInt(cell.style.gridColumnStart, 10) - 4 : -1;
    if (j < 0 || j > 2) return;
    setPick(j);
    setRun((n) => n + 1);
  };
  const states = ISLAND_STATES.map((s, j) => ({ ...s, tint: j === pick ? `color-mix(in srgb, ${s.color} 15%, transparent)` : 'transparent' }));
  return (
    <div className="l16-sums-why">
      <div className="sums-pick" onClick={onClick}>
        <FromTo rows={M_BIRDS_TEX} states={states} name={r`M=`} className="l16-sums-m" />
      </div>
      <div className="redraw-pick">
        <IslandMap width={400} redrawAt={redrawAt(pick, run)} />
      </div>
    </div>
  );
}
