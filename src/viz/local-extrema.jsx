import '../lectures/l9/styles/deck.css';
import Space, { PlanePatch } from '../lectures/l9/components/Space.jsx';
import Surface from '../lectures/l9/components/Surface.jsx';
import { Near, f, R, Z, FLOOR, RED, TEAL } from '../lectures/l9/slides/Slide05Local.jsx';

export const lecture = 9;

/* The slide's picture with everything showing, without the definition beside it (the caption says
   it): the graph of 3x e^(−(x² + y²)/2), its pit at (−1, 0) and its peak at (1, 0). */
export default function LocalExtrema() {
  return (
    <Space width={565} height={480} unit={66} center={[0.5, 0.5]} axes={false} az={-62} el={24} swing={8} title="The graph of a function with a pit and a peak">
      {(s) => (
        <g>
          <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
          <Surface s={s} f={f} x={R} y={R} n={36} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
          <Near s={s} c={[-1, 0]} color={TEAL} label="local minimum" dy={34} />
          <Near s={s} c={[1, 0]} color={RED} label="local maximum" dy={-18} />
        </g>
      )}
    </Space>
  );
}
