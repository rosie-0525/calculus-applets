import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Whiteout from '../components/Whiteout.jsx';

/**
 * Example 4 (board; Christine's Example 2, the textbook's Example 17.1.7 with her path, Janja's climb
 * told as a climb in a whiteout, in place of the drone, Slide11bDrone.jsx, and of the plain climb,
 * Slide11Example4.jsx), with a nameless climber (he): he cannot see the summit; his watch tracks his
 * GPS position p(t), and he has a contour map of the height h(x, y) of the mountain; how fast is he climbing, and when does he reach
 * the summit? The problem beside the map and the side view in the fog; key press 1, in a blue box,
 * with the time t in the side view: the altitude at time t is the composition ℝ → ℝ² → ℝ (Mark's
 * first goal), a(t) = h(p(t)) = (h ∘ p)(t), centred; then the board (the answer commented out).
 */
export default function Slide11cWhiteout() {
  return (
    <section>
      <h2>
        Example 4: Climber in a whiteout <span className="board-pill">board</span>
      </h2>

      <div className="stage l17-climb-stage">
        <div className="stage-text">
          <p>
            A world-class climber is training for the LA Olympics. Today he climbs in a whiteout: he cannot see the summit. His watch
            tracks his GPS position <Tex tex={r`\mathbf p(t)=(t-20,\ 3t-60)`} /> at time <Tex tex="t" />, and he has a contour map with the
            height of the mountain given by
          </p>
          <Tex display className="l17-center" tex={r`h(x,y)=200-3x^2-xy-y^2.`} />
          <p>How fast is he climbing at time <Tex tex="t" />? When does he reach the summit?</p>

          <Fragment index={1} className="l17-compose l17-blue">
            <p>
              Altitude at time <Tex tex="t" /> is the composition <Tex tex={r`{\mathbb R\xrightarrow{\mathbf p}\mathbb R^2\xrightarrow{h}\mathbb R}`} />
            </p>
            <Tex display tex={r`a(t)=h(\mathbf p(t))=(h\circ\mathbf p)(t)`} />
          </Fragment>
          {/* a′(t) = ∇h(p(t)) · p′(t) = (−6x − y)(1) + (−x − 2y)(3) = −9x − 7y, with (x, y) = p(t):
              a′(t) = −9(t − 20) − 7(3t − 60) = −30t + 600 = −30(t − 20). He climbs until a′(t) = 0, at
              t = 20: the watch tells him he is at the summit when his climbing rate drops to 0 (and
              turns negative after). (Check: a(t) = 200 − 15(t − 20)², and p(20) = (0, 0), the summit.) */}
        </div>
        <div className="stage-fig">
          <Whiteout tAt={1} />
        </div>
      </div>
    </section>
  );
}
