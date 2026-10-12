import '../lectures/l9/styles/deck.css';
import Space, { PlanePatch } from '../lectures/l9/components/Space.jsx';
import Surface from '../lectures/l9/components/Surface.jsx';
import { hills as f, HILLS_R as R } from '../lectures/l9/components/hills.js';
import { Tangents, FloorAxes, Which, Z, Z_TOP, ONLY_X, TOP, PASS, GRAY, MATH } from '../lectures/l9/slides/Slide04Critical.jsx';

export const lecture = 9;

/* The slide's picture with everything showing, without the definition beside it (the caption says
   it): the two hills over the xy-plane, with the x-, y- and z-axes; at the top of the big hill and
   at the pass between the hills both tangent lines are horizontal, and at a point on the small
   hill's slope only the one in the x direction. */
export default function CriticalTangents() {
  return (
    <Space width={640} height={400} unit={70} center={[0.5, 0.56]} axes={false} az={45} el={28} swing={8} title="The graph of a function with two hills over the xy-plane, seen across the valley between them, with the x-, y- and z-axes; at a point on a slope only the tangent line in the x direction is horizontal; at the top of the big hill and at the pass between the hills both tangent lines are horizontal">
      {(s) => {
        const zLab = s.P([0, 0, Z_TOP + 0.25]);
        return (
          <g>
            <PlanePatch s={s} P={[0, 0, 0]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
            <FloorAxes s={s} />
            {/* the z-axis is painted with the graph, so that the graph hides the part under it */}
            <Surface s={s} f={f} x={R} y={R} n={36} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" lines={[{ pts: [[0, 0, 0], [0, 0, Z_TOP]], color: GRAY, width: 2 }]} />
            <text x={zLab[0]} y={zLab[1] + 6} textAnchor="middle" fill={GRAY} fontSize="22" fontStyle="italic" fontFamily={MATH}>
              z
            </text>
            <Tangents s={s} at={ONLY_X} />
            <Which s={s} at={ONLY_X} x dx={-12} dy={74} anchor="middle" />
            <Tangents s={s} at={TOP} />
            <Which s={s} at={TOP} x y dx={24} dy={-26} anchor="middle" />
            <Tangents s={s} at={PASS} />
            <Which s={s} at={PASS} x y dy={44} anchor="middle" />
          </g>
        );
      }}
    </Space>
  );
}
