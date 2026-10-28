import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import FromTo, { ISLAND_STATES, M_BIRDS_TEX } from '../components/FromTo.jsx';
import IslandMap from '../components/IslandMap.jsx';

// a column's highlight: a wash of its island's colour, as on Transition diagram
export const HIGHLIGHT = ISLAND_STATES.map((s) => ({ ...s, tint: `color-mix(in srgb, ${s.color} 15%, transparent)` }));

/**
 * Poll (Christine's, after Example 1 (iii)): which sums of M must be 1? Key press 1: the column
 * sums are outlined; 2: why, M beside the figure; 3-5: one column highlighted each, its island's
 * flights drawn again on the figure (all of an island's birds go somewhere).
 */
export default function Slide04PollSums() {
  return (
    <section>
      <h2>Poll</h2>

      <FxMarker index={1} id="poll-answer" />
      <div className="block poll fx-host">
        <p>Which of the following must be true?</p>
        <ul className="poll-options l16-poll-row">
          <li>
            <span className="opt">A</span> Each row sum of <Tex tex="M" /> is <Tex tex="1" />
          </li>
          <li className="correct">
            <span className="opt">B</span> Each column sum of <Tex tex="M" /> is <Tex tex="1" />
          </li>
          <li>
            <span className="opt">C</span> Sum of all entries in <Tex tex="M" /> is <Tex tex="1" />
          </li>
        </ul>
      </div>

      <Fragment index={2} className="l16-sums-why">
        <FromTo rows={M_BIRDS_TEX} states={HIGHLIGHT} name={r`M=`} labels={false} bandsAt={[3, 4, 5]} className="l16-sums-m" />
        <IslandMap width={400} redrawAt={[3, 4, 5]} />
      </Fragment>
    </section>
  );
}
