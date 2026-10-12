import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import ContourPlot from '../components/ContourPlot.jsx';
import { lineColor } from '../components/levels.js';

export const RED = '#8c1515';
export const BLUE = '#1d4ed8';
export const GREEN = '#15803d';
export const INK = '#14213d';
export const SANS = 'Source Sans Pro, Helvetica, sans-serif';

// the textbook's Example 10.4.8, on the square [−1, 1] × [−1, 1]
export const f = (x, y) => 3 * x * x - 2 * y * y + 2 * x + 2 * y - 1;
export const LEVELS = Array.from({ length: 20 }, (_, k) => -5 + 0.5 * k);
export const tone = (c) => lineColor((c + 5.4) / 10);
// the candidates: the critical point inside (red), the critical points of f on the edges (blue),
// the corners (green), each with its value
export const INTERIOR = [[-1 / 3, 1 / 2, '−5/6']];
export const EDGES = [
  [-1 / 3, -1, '−16/3'],
  [-1 / 3, 1, '−4/3'],
  [-1, 1 / 2, '1/2'],
  [1, 1 / 2, '9/2'],
];
export const CORNERS = [
  [-1, -1, '−4'],
  [-1, 1, '0'],
  [1, -1, '0'],
  [1, 1, '4'],
];
export const MAX = [1, 1 / 2];
export const MIN = [-1 / 3, -1];

/** The candidates of one kind, with their values (from key press `valuesAt`). */
export function Points({ p, pts, color, valuesAt }) {
  return pts.map(([x, y, v]) => {
    const right = x < 0.9;
    const up = y > -0.9;
    return (
      <g key={`${x},${y}`}>
        <circle cx={p.px(x)} cy={p.py(y)} r="7" fill={color} stroke="#fff" strokeWidth="2" />
        <Fragment as="g" index={valuesAt}>
          <text
            x={p.px(x) + (right ? 11 : -11)}
            y={p.py(y) + (up ? -10 : 22)}
            textAnchor={right ? 'start' : 'end'}
            fill={color}
            fontSize="17"
            fontWeight="700"
            fontFamily={SANS}
            className="map-label"
          >
            {v}
          </text>
        </Fragment>
      </g>
    );
  });
}

/**
 * Finding global extrema: Mark's three steps, simplified, after a first one, sketch the region D;
 * one per key press, beside the contour plot of the textbook's Example 10.4.8 on the square
 * [−1, 1]²: key press 1, (i) sketch D, and the picture comes in; 2, (ii) the critical point inside
 * (red); 3, (iii) the critical points of f on the four edges (blue) and the corners, the ends of
 * the edges (green); 4, (iv) the values, and the largest (9/2, the global maximum) and the
 * smallest (−16/3, the global minimum) ringed.
 */
export default function Slide16Method() {
  return (
    <section className="dense">
      <h2>Finding global extrema</h2>

      <div className="stage method-stage">
        <div className="stage-text">
          <p>
            To find the global max/min of <Tex tex={r`f:D\to\mathbb{R}`} />:
          </p>
          <ol className="method-steps">
            <Fragment index={1} as="li">
              Sketch the region <Tex tex="D" />
            </Fragment>
            <Fragment index={2} as="li">
              <strong style={{ color: RED }}>Interior points:</strong> Find critical points of <Tex tex="f" />
            </Fragment>
            <Fragment index={3} as="li">
              <strong style={{ color: BLUE }}>Boundary points:</strong> Compute the extrema of each of the functions defined by{' '}
              <Tex tex="f" /> on the boundary curves (using your knowledge of single-variable calculus)
            </Fragment>
            <Fragment index={4} as="li">
              Compare the values of <Tex tex="f" /> at these points to find global max/min
            </Fragment>
          </ol>
        </div>

        <Fragment index={1} className="method-fig">
          <p className="method-label">
            <Tex tex={r`f(x,y)=3x^2-2y^2+2x+2y-1`} />
            <br />
            on <Tex tex={r`[-1,1]\times[-1,1]`} />
          </p>
          <ContourPlot f={f} x={[-1, 1]} y={[-1, 1]} size={360} n={120} levels={LEVELS} color={tone} width={1.4} pad={34} title="Contour plot of f on the square, with the candidates for its extrema">
            {(p) => (
              <g>
                <rect x={p.px(-1)} y={p.py(1)} width={p.px(1) - p.px(-1)} height={p.py(-1) - p.py(1)} fill="none" stroke={INK} strokeWidth="2.5" />
                <Fragment as="g" index={2}>
                  <Points p={p} pts={INTERIOR} color={RED} valuesAt={4} />
                </Fragment>
                <Fragment as="g" index={3}>
                  <Points p={p} pts={EDGES} color={BLUE} valuesAt={4} />
                  <Points p={p} pts={CORNERS} color={GREEN} valuesAt={4} />
                </Fragment>
                <Fragment as="g" index={4}>
                  {[MAX, MIN].map(([x, y]) => (
                    <circle key={x} cx={p.px(x)} cy={p.py(y)} r="15" fill="none" stroke={INK} strokeWidth="2.5" />
                  ))}
                  <text x={p.px(MAX[0]) - 22} y={p.py(MAX[1]) + 6} textAnchor="end" fill={INK} fontSize="16" fontWeight="700" fontFamily={SANS} className="map-label">
                    max
                  </text>
                  <text x={p.px(MIN[0])} y={p.py(MIN[1]) - 22} textAnchor="middle" fill={INK} fontSize="16" fontWeight="700" fontFamily={SANS} className="map-label">
                    min
                  </text>
                </Fragment>
              </g>
            )}
          </ContourPlot>
        </Fragment>
      </div>
    </section>
  );
}
