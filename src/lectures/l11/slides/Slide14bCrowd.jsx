import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import CrowdMap from '../components/CrowdMap.jsx';

/**
 * How do 300 units find their way? (back to the motivation, after Direction of fastest increase):
 * the game's map, the goal set (a click sends the army there, or sets a new goal). Key press 1: the
 * Flow Field Pathfinding computes D, the walking distance to the goal, and its gradient; the level
 * curves of D. Key press 2: the units move in the direction −∇D; its arrows.
 */
export default function Slide14bCrowd() {
  return (
    <section className="l10-crowd l10-crowd-back">
      <h2>How do 300 units find their way?</h2>

      <div className="l10-crowd-text">
        <Fragment index={1} as="p">
          <strong>Flow Field Pathfinding</strong> computes <Tex tex={r`D(x,y)=`} /> walking distance to the goal, and its gradient.
        </Fragment>
        <Fragment index={2} as="p">
          Units then move in the direction <Tex tex={r`-\nabla D`} />.
        </Fragment>
      </div>

      <CrowdMap width={1100} preset levels={1} arrows={2} />
    </section>
  );
}
