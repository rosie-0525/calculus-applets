import '../lectures/l17/styles/deck.css';
import Tex, { r } from '../lectures/l17/components/Tex.jsx';
import Mosquito from '../lectures/l17/components/Mosquito.jsx';

export const lecture = 17;

/*
 * Example 5: Mosquito in the hunt, without its title and its two questions (the caption asks
 * them): the story, the temperature T(x, y, z) and the spiral p(t), and in a blue box the
 * temperature it feels as a composition ℝ → ℝ³ → ℝ; beside them the bedroom in 3-D (drag to turn
 * it), a sleeper in a loft bed at its warm end, and the mosquito flying up the spiral on a loop
 * (while the applet is on screen). On the slide the box comes on a key press.
 */
export default function MosquitoApplet() {
  return (
    <div className="stage l17-bug-stage">
      <div className="stage-text">
        <p>
          Mosquitoes find us by our warmth. In a bedroom, the temperature is <Tex tex={r`T(x,y,z)=xy+yz`} />. A mosquito takes off from the floor
          at <Tex tex="(4,2,0)" /> and flies in a spiral
        </p>
        <Tex display className="l17-center" tex={r`\mathbf p(t)=(3+\cos t,\ 2+\sin t,\ t),`} />
        <p>
          where <Tex tex="t" /> is time (in seconds).
        </p>

        <div className="l17-compose l17-blue">
          <p>
            Temperature at time <Tex tex="t" /> is the composition <Tex tex={r`{\mathbb R\xrightarrow{\mathbf p}\mathbb R^3\xrightarrow{T}\mathbb R}`} />
          </p>
          <Tex display tex={r`T(\mathbf p(t))=(T\circ\mathbf p)(t)`} />
        </div>
      </div>
      <div className="stage-fig">
        <Mosquito />
      </div>
    </div>
  );
}
