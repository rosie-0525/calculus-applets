import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import SodaCan from '../components/SodaCan.jsx';

/**
 * Example 3 (board; the opener's Coke can, in place of Mark's Example 2 at the user's request): the
 * radius r and height h of a cylindrical can holding 128π cm³ (≈ 402 mL, so that r = 4 and h = 8: at
 * the user's request, simpler numbers than a Coke can's 355 cm³, for the same shape) that uses the least amount of aluminum, a word
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
            <Tex tex={r`128\pi\text{ cm}^3`} /> that uses the least amount of aluminum.
          </p>
          <Fragment index={1} className="l12-lambda-problem l12-can-math">
            <span className="l12-kw">Minimize</span>
            <span>
              <Tex tex={r`f(r,h)=2\pi r^2+2\pi rh`} />
            </span>
            <span className="l12-kw">subject to</span>
            <span>
              <Tex tex={r`g(r,h)=\pi r^2h=128\pi.`} />
            </span>
          </Fragment>
          {/* f is the aluminum (the lid and the bottom, πr² each, and the side, 2πr by h), g the
              volume; r, h > 0. ∇f = (4πr + 2πh, 2πr), ∇g = (2πrh, πr²): ∇g = 0 only where r = 0,
              not on g = 128π. ∇f = λ∇g: 4πr + 2πh = 2πλrh and 2πr = πλr², so λ = 2/r (as r > 0);
              then 4πr + 2πh = 4πh, so h = 2r: the height is the diameter. πr² · 2r = 128π: r³ = 64,
              r = 4 cm, h = 8 cm (λ = 1/2), and f = 6πr² = 96π ≈ 301.6 cm². It is the
              minimum: on the curve, f > 2πrh = 256π/r → ∞ as r → 0 and f > 2πr² → ∞ as r → ∞ (and
              there is no maximum). A real can, h/d ≈ 1.85, is taller (289 cm² of aluminum for
              355 cm³): its lid is thicker than its side. */}
        </div>

        <Fragment index={2} className="stage-fig l12-can-fig">
          <SodaCan names volume={128 * Math.PI} />
        </Fragment>
      </div>
    </section>
  );
}
