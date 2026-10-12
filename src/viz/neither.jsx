import '../lectures/l9/styles/deck.css';
import Space, { PlanePatch, Dot3 } from '../lectures/l9/components/Space.jsx';
import Surface from '../lectures/l9/components/Surface.jsx';
import { f, XR, YR, Z, FLOOR, LINES, INK } from '../lectures/l9/slides/Slide08bNeither.jsx';

export const lecture = 9;

/* The last picture of Preview, a little larger: the graph of x³ + y², with the curves over the
   x-axis (x³, red) and the y-axis (y², green) through its critical point at the origin. */
export default function Neither() {
  return (
    <Space width={440} height={420} unit={100} center={[0.5, 0.52]} axes={false} az={120} el={34} swing={8} title="The graph of x³ + y², with the curves over the x-axis (x³, neither) and over the y-axis (y², a minimum) through the critical point at the origin">
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={XR} range2={YR} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <Surface s={s} f={f} x={XR} y={YR} n={[32, 24]} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" lines={LINES} />
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={6.5} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </Space>
  );
}
