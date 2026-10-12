import { useState } from 'react';
import '../lectures/l9/styles/deck.css';
import Tex, { r } from '../lectures/l9/components/Tex.jsx';
import ContourPlot from '../lectures/l9/components/ContourPlot.jsx';
import { f, LEVELS, tone, INTERIOR, EDGES, CORNERS, MAX, MIN, RED, BLUE, GREEN, INK, SANS } from '../lectures/l9/slides/Slide16Method.jsx';

export const lecture = 9;

// how far the picture goes: the slide's key presses 2 to 4 (key press 1, sketching D, is the square)
const STEPS = [
  [2, 'Interior points'],
  [3, 'Boundary points'],
  [4, 'Compare the values'],
];

/** The candidates of one kind, as the slide's Points draws them, with their values if `values`. */
function Candidates({ p, pts, color, values }) {
  return pts.map(([x, y, v]) => {
    const right = x < 0.9;
    const up = y > -0.9;
    return (
      <g key={`${x},${y}`}>
        <circle cx={p.px(x)} cy={p.py(y)} r="7" fill={color} stroke="#fff" strokeWidth="2" />
        {values && (
          <text x={p.px(x) + (right ? 11 : -11)} y={p.py(y) + (up ? -10 : 22)} textAnchor={right ? 'start' : 'end'} fill={color} fontSize="17" fontWeight="700" fontFamily={SANS} className="map-label">
            {v}
          </text>
        )}
      </g>
    );
  });
}

/*
 * Finding global extrema: the slide's steps beside the contour plot of the textbook's Example
 * 10.4.8 on the square. On the slide each step comes on a key press; here the buttons pick how far
 * the picture goes, and the steps not reached yet are faded: the critical point inside (red); the
 * critical points of f on the edges (blue) and the corners (green); their values, and the largest
 * and the smallest ringed.
 */
export default function GlobalSteps() {
  const [step, setStep] = useState(2);
  const later = (k) => ({ opacity: step < k ? 0.35 : 1, transition: 'opacity 0.3s' });
  return (
    <div className="viz-col">
      <div className="viz-toggle" role="group" aria-label="How far the steps go">
        {STEPS.map(([k, name]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={step === k} onClick={() => setStep(k)}>
            {name}
          </button>
        ))}
      </div>

      <div className="stage method-stage">
        <div className="stage-text">
          <p>
            To find the global max/min of <Tex tex={r`f:D\to\mathbb{R}`} />:
          </p>
          <ol className="method-steps">
            <li>
              Sketch the region <Tex tex="D" />
            </li>
            <li>
              <strong style={{ color: RED }}>Interior points:</strong> Find critical points of <Tex tex="f" />
            </li>
            <li style={later(3)}>
              <strong style={{ color: BLUE }}>Boundary points:</strong> Compute the extrema of each of the functions defined by{' '}
              <Tex tex="f" /> on the boundary curves (using your knowledge of single-variable calculus)
            </li>
            <li style={later(4)}>
              Compare the values of <Tex tex="f" /> at these points to find global max/min
            </li>
          </ol>
        </div>

        <div className="method-fig">
          <p className="method-label">
            <Tex tex={r`f(x,y)=3x^2-2y^2+2x+2y-1`} />
            <br />
            on <Tex tex={r`[-1,1]\times[-1,1]`} />
          </p>
          <ContourPlot f={f} x={[-1, 1]} y={[-1, 1]} size={360} n={120} levels={LEVELS} color={tone} width={1.4} pad={34} title="Contour plot of f on the square, with the candidates for its extrema">
            {(p) => (
              <g>
                <rect x={p.px(-1)} y={p.py(1)} width={p.px(1) - p.px(-1)} height={p.py(-1) - p.py(1)} fill="none" stroke={INK} strokeWidth="2.5" />
                <Candidates p={p} pts={INTERIOR} color={RED} values={step >= 4} />
                {step >= 3 && (
                  <g>
                    <Candidates p={p} pts={EDGES} color={BLUE} values={step >= 4} />
                    <Candidates p={p} pts={CORNERS} color={GREEN} values={step >= 4} />
                  </g>
                )}
                {step >= 4 && (
                  <g>
                    {[MAX, MIN].map(([x, y]) => (
                      <circle key={x} cx={p.px(x)} cy={p.py(y)} r="15" fill="none" stroke={INK} strokeWidth="2.5" />
                    ))}
                    <text x={p.px(MAX[0]) - 22} y={p.py(MAX[1]) + 6} textAnchor="end" fill={INK} fontSize="16" fontWeight="700" fontFamily={SANS} className="map-label">
                      max
                    </text>
                    <text x={p.px(MIN[0])} y={p.py(MIN[1]) - 22} textAnchor="middle" fill={INK} fontSize="16" fontWeight="700" fontFamily={SANS} className="map-label">
                      min
                    </text>
                  </g>
                )}
              </g>
            )}
          </ContourPlot>
        </div>
      </div>
    </div>
  );
}
