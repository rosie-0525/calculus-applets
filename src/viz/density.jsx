import { useRef, useState } from 'react';
import '../lectures/l8/styles/deck.css';
import Tex, { r } from '../lectures/l8/components/Tex.jsx';
import { Arrow } from '../lectures/l8/components/Plane.jsx';
import ContourPlot from '../lectures/l8/components/ContourPlot.jsx';
import Space from '../lectures/l8/components/Space.jsx';
import { Graph3D, Levels, Axes2, flatDot, walkAt, useClock, f, R, LEVELS, tone, X0, Y0, SIDE, PAD, CARDINAL, GREEN } from '../lectures/l8/slides/Slide13Density.jsx';

export const lecture = 8;

// the walks: the dot north along x = π/2, the graph cut by the plane x = π/2 (Graph3D's state 2); or
// east along y = π/2, the graph cut by the plane y = π/2 (state 3)
const WALKS = { north: { state: 2, button: 'Walk north' }, east: { state: 3, button: 'Walk east' } };

/* The slide with both arrows showing, without the conclusion (the caption says it): the contour
   plot of cos(x + y²), each level curve numbered, and the graph; the dot walks north or east (the
   buttons), again and again, on both. */
export default function Density() {
  const [walk, setWalk] = useState('north');
  const ref = useRef(null);
  const at = walkAt(walk, useClock(walk, ref));
  return (
    <div ref={ref} className="viz-col">
      <div className="viz-toggle" role="group" aria-label="Which way the dot walks">
        {Object.entries(WALKS).map(([k, { button }]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={walk === k} onClick={() => setWalk(k)}>
            {button}
          </button>
        ))}
      </div>
      <div className="density-row">
        <figure>
          <ContourPlot f={f} x={R} y={R} size={[PAD[3] + SIDE + PAD[1], PAD[0] + SIDE + PAD[2]]} pad={PAD} levels={LEVELS} color={tone} width={1.8} title="The contour plot of cos(x + y squared) over the square from 0 to pi, each level curve numbered with its level, with a dot walking north along x = pi over 2, or east along y = pi over 2">
            {(p) => (
              <g>
                <Levels p={p} />
                <Axes2 p={p} />
                <Arrow p={p} from={[X0, 0]} to={[X0, R[1] - 0.04]} color={CARDINAL} width={3} head={13} />
                <Arrow p={p} from={[0, Y0]} to={[R[1] - 0.04, Y0]} color={GREEN} width={3} head={13} />
                {flatDot(p, at)}
              </g>
            )}
          </ContourPlot>
          <figcaption>Contour plot, levels every 0.25</figcaption>
        </figure>

        <figure>
          <Space width={500} height={370} unit={92} center={[0.5, 0.5]} axes={false} az={60} el={50} swing={6} title="The graph of cos(x + y squared) over the square from 0 to pi, with its level curves, a dot walking north along x = pi over 2, or east along y = pi over 2, and the plane it walks in">
            {(s) => <Graph3D s={s} state={WALKS[walk].state} at={at} />}
          </Space>
          <figcaption>
            Graph of <Tex tex={r`f(x,y)=\cos(x+y^2)`} />
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
