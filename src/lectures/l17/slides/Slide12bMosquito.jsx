import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Mosquito from '../components/Mosquito.jsx';

/**
 * Example 5 (board; the math of Christine's Example 3, the textbook's Example 17.2.2 with T = xy + yz
 * and t = π, in a new story, in place of the ladybug, Slide12Example5.jsx): a mosquito, which finds
 * people by their warmth, spirals up from the floor of a bedroom; at t = π, how fast is the
 * temperature it feels changing, and is it on the right track? The problem beside the room, the
 * sleeper and the spiral; key press 1, in a blue box: the temperature at time t is the composition
 * ℝ → ℝ³ → ℝ, T(p(t)) = (T ∘ p)(t), centred; then
 * the board (the answer commented out).
 */
export default function Slide12bMosquito() {
  return (
    <section>
      <h2>
        Example 5: Mosquito in the hunt <span className="board-pill">board</span>
      </h2>

      <div className="stage l17-bug-stage">
        <div className="stage-text">
          <p>
            Mosquitoes find us by our warmth. In a bedroom, the temperature is <Tex tex={r`T(x,y,z)=xy+yz`} />. A mosquito takes off from the floor
            at <Tex tex="(4,2,0)" /> and flies in a spiral
          </p>
          <Tex display className="l17-center" tex={r`\mathbf p(t)=(3+\cos t,\ 2+\sin t,\ t),`} />
          <p>
            where <Tex tex="t" /> is time (in seconds). At <Tex tex={r`t=\pi`} />, how fast is the temperature it feels changing? Is it on the
            right track?
          </p>

          <Fragment index={1} className="l17-compose l17-blue">
            <p>
              Temperature at time <Tex tex="t" /> is the composition <Tex tex={r`{\mathbb R\xrightarrow{\mathbf p}\mathbb R^3\xrightarrow{T}\mathbb R}`} />
            </p>
            <Tex display tex={r`T(\mathbf p(t))=(T\circ\mathbf p)(t)`} />
          </Fragment>
          {/* (T ∘ p)′(t) = ∇T(p(t)) · p′(t), ∇T = (y, x + z, y), p′(t) = (−sin t, cos t, 1); at t = π,
              p(π) = (2, 2, π), ∇T(2, 2, π) = (2, 2 + π, 2), p′(π) = (0, −1, 1), so (T ∘ p)′(π) = −(2 + π) + 2 = −π:
              it is getting colder, so it is going the wrong way. Going up warms it at the rate 2, but going
              round, away from the bed (y decreasing), cools it at the rate 2 + π. */}
        </div>
        <div className="stage-fig">
          <Mosquito />
        </div>
      </div>
    </section>
  );
}
