import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import SodaCan from '../components/SodaCan.jsx';

/**
 * Example 3 (board; the opener's Coke can, in place of Mark's Example 2 at the user's request): the
 * radius r and height h of a cylindrical can holding 355 cm³ that uses the least amount of aluminum, a word
 * problem (Mark's first goal). Key press 1: the problem in math, in blue (the user's request), on
 * two rows as CAISO's on Electricity prices; 2: the opener's can (SodaCan.jsx, its radius on a
 * slider), its lengths and slider named r and h, in a white card with its slider. The answer is commented out.
 */
export default function Slide09bCan() {
  return (
    <section>
      <h2>
        Example 3 <span className="board-pill">board</span>
      </h2>

      <div className="stage">
        <div className="stage-text">
          <p>
            Find the radius <Tex tex="r" /> and height <Tex tex="h" /> of a cylindrical can holding{' '}
            <Tex tex={r`355\text{ cm}^3`} /> that uses the least amount of aluminum.
          </p>
          <Fragment index={1} className="l12-lambda-problem l12-can-math">
            <span className="l12-kw">Minimize</span>
            <span>
              <Tex tex={r`f(r,h)=2\pi r^2+2\pi rh`} />
            </span>
            <span className="l12-kw">subject to</span>
            <span>
              <Tex tex={r`g(r,h)=\pi r^2h=355.`} />
            </span>
          </Fragment>
          {/* f is the aluminum (the lid and the bottom, πr² each, and the side, 2πr by h), g the
              volume; r, h > 0. ∇f = (4πr + 2πh, 2πr), ∇g = (2πrh, πr²): ∇g = 0 only where r = 0,
              not on g = 355. ∇f = λ∇g: 4πr + 2πh = 2πλrh and 2πr = πλr², so λ = 2/r (as r > 0);
              then 4πr + 2πh = 4πh, so h = 2r: the height is the diameter. πr² · 2r = 355:
              r = (355/(2π))^(1/3) ≈ 3.84 cm, h ≈ 7.67 cm, and f = 6πr² ≈ 277.5 cm². It is the
              minimum: on the curve, f > 2πrh = 710/r → ∞ as r → 0 and f > 2πr² → ∞ as r → ∞ (and
              there is no maximum). A real can, h/d ≈ 1.85, is taller (289 cm² of aluminum for
              355 cm³): its lid is thicker than its side. */}
        </div>

        <Fragment index={2} className="stage-fig l12-can-fig">
          <SodaCan names />
        </Fragment>
      </div>
    </section>
  );
}
