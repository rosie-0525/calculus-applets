import '../lectures/l9/styles/deck.css';
import Tex, { r } from '../lectures/l9/components/Tex.jsx';
import Surface from '../lectures/l9/components/Surface.jsx';
import { Example, Floor, Mark, EX, SQ, polar, ring, RED, TEAL, GRAY } from '../lectures/l9/slides/Slide15bTheoremExamples.jsx';

export const lecture = 9;

/* The slide's three examples of the theorem with everything showing (the caption states the
   theorem): x + y on the square [−1, 1]², local extrema at two corners; x² + y² on the unit disk,
   a local minimum at the critical point and a local maximum all along the rim; x² − y² on the
   unit disk, a saddle point at the critical point and the local extrema on the rim. */
export default function BoundaryExamples() {
  const { plane, bowl, saddle } = EX;
  return (
    <div className="thm-exs">
      <Example fn={r`f(x,y)=x+y`} region={r`[-1,1]^2`} crit="No critical points" view={plane.view} title="The graph of x + y over the square: a tilted plane, lowest and highest at two opposite corners">
        {(s) => (
          <g>
            <Floor s={s} z={plane.floor} at={[0.55, -0.95]} />
            <Surface s={s} f={plane.f} x={SQ} y={SQ} n={12} zScale={plane.Z} mesh="rgba(15, 40, 50, 0.16)" />
            <Mark s={s} ex={plane} at={[1, 1]} color={RED} label="local max" />
            <Mark s={s} ex={plane} at={[-1, -1]} color={TEAL} label="local min" anchor="start" dx={12} dy={6} />
          </g>
        )}
      </Example>

      <Example
        fn={r`f(x,y)=x^2+y^2`}
        region={r`x^2+y^2\le 1`}
        crit={
          <>
            Critical point: <Tex tex="(0,0)" />
          </>
        }
        view={bowl.view}
        title="The graph of x² + y² over the unit disk: a bowl, lowest at the center, highest all along the rim"
      >
        {(s) => (
          <g>
            <Floor s={s} z={bowl.floor} disk at={[0.35, -1.05]} />
            <Surface s={s} f={bowl.f} x={[0, 1]} y={[0, 2 * Math.PI]} n={[12, 48]} param={polar} zScale={bowl.Z} mesh="rgba(15, 40, 50, 0.16)" lines={[{ pts: ring(bowl.Z), color: RED, width: 4 }]} />
            <Mark s={s} ex={bowl} at={[0, 0]} color={TEAL} label="local min" dy={28} />
            <Mark s={s} ex={bowl} at={polar(1, 2.1)} label="local max" color={RED} dy={5} dx={12} anchor="start" />
          </g>
        )}
      </Example>

      <Example
        fn={r`f(x,y)=x^2-y^2`}
        region={r`x^2+y^2\le 1`}
        crit={
          <>
            Critical point: <Tex tex="(0,0)" />
          </>
        }
        view={saddle.view}
        title="The graph of x² − y² over the unit disk: a saddle, highest at (±1, 0) and lowest at (0, ±1) on the rim"
      >
        {(s) => (
          <g>
            <Floor s={s} z={saddle.floor} disk at={[1.2, -0.25]} />
            <Surface s={s} f={saddle.f} x={[0, 1]} y={[0, 2 * Math.PI]} n={[12, 48]} param={polar} zScale={saddle.Z} mesh="rgba(15, 40, 50, 0.16)" />
            <Mark s={s} ex={saddle} at={[0, 0]} color={GRAY} label="saddle point" dy={28} />
            <Mark s={s} ex={saddle} at={[1, 0]} color={RED} label="local max" />
            <Mark s={s} ex={saddle} at={[-1, 0]} color={RED} />
            <Mark s={s} ex={saddle} at={[0, 1]} color={TEAL} label="local min" dy={28} />
            <Mark s={s} ex={saddle} at={[0, -1]} color={TEAL} />
          </g>
        )}
      </Example>
    </div>
  );
}
