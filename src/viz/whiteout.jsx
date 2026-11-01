import '../lectures/l17/styles/deck.css';
import Tex, { r } from '../lectures/l17/components/Tex.jsx';
import Whiteout from '../lectures/l17/components/Whiteout.jsx';

export const lecture = 17;

/*
 * Example 4: Climber in a whiteout, without its title and its two questions (the caption asks
 * them): the story, his GPS position p(t) and the height h(x, y) of the mountain, and in a blue
 * box the altitude a(t) = h(p(t)) as a composition ℝ → ℝ² → ℝ; beside them his watch's contour
 * map with his track, and the side view in the fog, clear only round him, as he climbs on a loop
 * (while the applet is on screen), the time t in its corner. On the slide the box and the time
 * come on a key press.
 */
export default function WhiteoutApplet() {
  return (
    <div className="stage l17-climb-stage">
      <div className="stage-text">
        <p>
          A world-class climber is training for the LA Olympics. Today he climbs in a whiteout: he cannot see the summit. His watch tracks
          his GPS position <Tex tex={r`\mathbf p(t)=(t-20,\ 3t-60)`} /> at time <Tex tex="t" />, and he has a contour map with the height of
          the mountain given by
        </p>
        <Tex display className="l17-center" tex={r`h(x,y)=200-3x^2-xy-y^2.`} />

        <div className="l17-compose l17-blue">
          <p>
            Altitude at time <Tex tex="t" /> is the composition <Tex tex={r`{\mathbb R\xrightarrow{\mathbf p}\mathbb R^2\xrightarrow{h}\mathbb R}`} />
          </p>
          <Tex display tex={r`a(t)=h(\mathbf p(t))=(h\circ\mathbf p)(t)`} />
        </div>
      </div>
      <div className="stage-fig">
        <Whiteout />
      </div>
    </div>
  );
}
