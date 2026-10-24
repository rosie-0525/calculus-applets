import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import SquareMap from '../lectures/l14/components/SquareMap.jsx';

export const lecture = 14;

/*
 * Tiling Principle's picture with every step showing, without the setup and the principle (the
 * caption says them): Mark's picture of f(x) = Ax, the unit square S and its image f(S), each with
 * its definition under it, the point s = a e₁ + b e₂ and f(s) = a Ae₁ + b Ae₂ to drag, and the
 * tilings by copies of S and of f(S) (S′ to the right of S green, S″ above it purple).
 */
export default function Tiling() {
  return (
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
  );
}
