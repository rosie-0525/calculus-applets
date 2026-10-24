import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import SquareMap from '../components/SquareMap.jsx';

/**
 * Tiling Principle (Mark's, in Section 1; the slide's title names it, so its box has none): a linear
 * f: ℝ² → ℝ², f(x) = Ax, with f(e₁), f(e₂) not scalar multiples of each other; Mark's picture, e₁, e₂
 * and Ae₁, Ae₂ on arrival (SquareMap). Key press 1: the unit square S, and its definition under it;
 * 2: its image f(S), and its definition; 3: a point s = a e₁ + b e₂ of S and f(s) = a Ae₁ + b Ae₂,
 * with dotted lines to the arrows, for the presenter to drag (the user's request); 4: the Tiling
 * Principle, and the tilings on the picture (S, S′, S″ and their images in the textbook's colors).
 */
export default function Slide02bTiling() {
  return (
    <section className="dense">
      <h2>Tiling Principle</h2>

      <p>
        Let <Tex tex={r`f:\mathbb R^2\to\mathbb R^2`} /> be a linear function given by <Tex tex={r`f(\vv x)=A\vv x`} />.
        Suppose <Tex tex={r`f(\vv e_1)`} /> and <Tex tex={r`f(\vv e_2)`} /> are not scalar multiples of each other.
      </p>
      <div className="l14-lt-row">
        <div className="l14-lt-map">
          <SquareMap
            squareIndex={1}
            imageIndex={2}
            pointIndex={3}
            tilesIndex={4}
            captions={[
              <>
                <span>
                  The <strong>unit square</strong>
                </span>
                <Tex tex={r`S=\{(x,y):0\le x,y\le1\}`} />
              </>,
              <>
                <span>
                  Its <strong>image</strong>
                </span>
                <Tex tex={r`f(S)=\{f(\vv s):\vv s\in S\}`} />
              </>,
            ]}
          />
        </div>
      </div>

      <Fragment index={4} className="block theorem">
        <p>
          <Tex tex="f" /> transforms the tiling of <Tex tex={r`\mathbb R^2`} /> by copies of <Tex tex="S" /> into a
          tiling of <Tex tex={r`\mathbb R^2`} /> by copies of <Tex tex="f(S)" />.
        </p>
      </Fragment>
    </section>
  );
}
