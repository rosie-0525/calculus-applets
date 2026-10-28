import '../lectures/l15/styles/deck.css';
import Tex, { r } from '../lectures/l15/components/Tex.jsx';
import VoxelIsland from '../lectures/l15/components/VoxelIsland.jsx';
import { NeuralNet, Then } from '../lectures/l15/slides/Slide08cRace.jsx';

export const lecture = 15;

/*
 * How much faster?, its two uses, each a card: neural networks, the prediction running forward
 * through a cartoon network and the backpropagation back (CSS, on a loop), Method II; video games,
 * a floating island of blocks turning on a game screen (redrawn while the applet is on screen),
 * Method I. On the slide each card comes on a key press, under the table that the network's
 * "products like this" point to; here, without the table, they are products like ABC.
 */
export default function OrderUses() {
  return (
    <div className="race-col l15-race-uses">
      <div className="l15-race-use">
        <NeuralNet />
        <p>
          <strong>Neural network</strong> training involves products like <Tex tex="ABC" /> for very large <Tex tex="n" />
        </p>
        <Then method="Method II" tex="A(BC)" />
      </div>
      <div className="l15-race-use">
        <VoxelIsland on width={520} height={160} />
        <p>
          <strong>Video games</strong> apply the same <Tex tex={r`4\times 4`} /> matrices <Tex tex="A,B,C" /> to a million points{' '}
          <Tex tex={r`\vv x`} />
        </p>
        <Then method="Method I" tex="(AB)C" />
      </div>
    </div>
  );
}
