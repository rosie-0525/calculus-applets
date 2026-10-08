import '../lectures/l4/styles/deck.css';
import Tex, { r } from '../lectures/l4/components/Tex.jsx';
import { PerpLine, PerpPlane } from '../lectures/l4/slides/Slide06aOrthogonality.jsx';

export const lecture = 4;

export default function Perpendicular() {
  return (
    <div className="perp-figs">
      <figure>
        <PerpLine at={1} />
        <figcaption>
          in <Tex tex={r`\mathbb{R}^2`} />: a line through <Tex tex={r`\mathbf{0}`} />
        </figcaption>
      </figure>
      <figure>
        <PerpPlane at={3} />
        <figcaption>
          in <Tex tex={r`\mathbb{R}^3`} />: a plane through <Tex tex={r`\mathbf{0}`} />
        </figcaption>
      </figure>
    </div>
  );
}
