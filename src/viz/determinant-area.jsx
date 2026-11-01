import { useRef, useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex, { r } from '../lectures/l18/components/Tex.jsx';
import { useTween } from '../lectures/l18/components/useFragmentTween.js';
import { BLUE, AMBER, det2 } from '../lectures/l18/components/inv.js';
import { EXAMPLES, Picture, XR, YR, UNIT, num } from '../lectures/l18/slides/Slide08Area.jsx';
import { useReplay } from './zoom-in.jsx';

export const lecture = 18;
export const zoom = 1.4;

// Picture's frame: its Plane's pad, and the margin (units) that keeps a dragged tip inside it
const PAD = 8;
const H = (YR[1] - YR[0]) * UNIT + 2 * PAD;
const MARGIN = 0.12;
const NAMES = ['Stretch', 'Shear', 'Rank 1'];

const clampTo = ([a, b], x) => Math.min(b - MARGIN, Math.max(a + MARGIN, x));
const snap = (x) => Math.round(x * 10) / 10;

/** Where "area = …" goes: the middle of the parallelogram, or beside the line it is squashed onto. */
function areaAt(A) {
  const [[a, b], [c, d]] = A;
  const mid = [(a + b) / 2, (c + d) / 2];
  if (Math.abs(det2(A)) >= 0.005) return mid;
  const v = Math.hypot(a, c) > 0.05 ? [a, c] : [b, d];
  const n = Math.hypot(...v) || 1;
  return [mid[0] + (0.32 * v[1]) / n, mid[1] - (0.32 * v[0]) / n];
}

/** Picture as on the slide: the unit square turning into A's parallelogram, from when it mounts. */
function Glide({ A, at }) {
  const t = useTween(true, { ms: 1800, delay: 400 });
  return <Picture A={A} at={at} t={t} />;
}

/*
 * Determinant and area, without its title, its sentence and its box (the caption has them): one of
 * the slide's pictures at a time, the unit square (dashed) and its image under A (orange), the grid
 * moving with it, Ae₁ and Ae₂, and "area = |det(A)|" in the parallelogram; under it A and det(A),
 * and "not invertible" when det(A) = 0. On the slide the stretch, the shear and the rank 1 matrix
 * come side by side, one a key press; here a button picks one, and the square turns into its
 * parallelogram (the first the first time the applet is on screen). Dragging moves the nearer tip of
 * Ae₁ or Ae₂ (to tenths), and A with it.
 */
export default function DeterminantArea() {
  const ref = useRef(null);
  const [run] = useReplay(ref);
  const [pick, setPick] = useState({ k: 0, n: 0 }); // the example, and how many times it was picked
  const [dragged, setDragged] = useState(null); // A as dragged, or null for the example
  const pic = useRef(null);
  const grab = useRef(0); // the column being dragged
  const A = dragged ?? EXAMPLES[pick.k].A;

  const toPlane = (e) => {
    const svg = pic.current.querySelector('svg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [XR[0] + (q.x - PAD) / UNIT, YR[0] + (H - PAD - q.y) / UNIT];
  };
  const move = (e, k = grab.current) => {
    const [x, y] = toPlane(e);
    const tip = [snap(clampTo(XR, x)), snap(clampTo(YR, y))];
    setDragged((M) => {
      const B = (M ?? A).map((row) => [...row]);
      B[0][k] = tip[0];
      B[1][k] = tip[1];
      return B;
    });
  };
  const down = (e) => {
    const q = toPlane(e);
    const far = (k) => Math.hypot(A[0][k] - q[0], A[1][k] - q[1]);
    grab.current = far(0) <= far(1) ? 0 : 1;
    e.currentTarget.setPointerCapture(e.pointerId);
    move(e, grab.current);
  };

  const [[a, b], [c, d]] = A;
  const det = det2(A);
  const flat = Math.abs(det) < 0.005;
  const matrix = r`A=\begin{bmatrix}\textcolor{${BLUE}}{${num(a)}}&\textcolor{${AMBER}}{${num(b)}}\\ \textcolor{${BLUE}}{${num(c)}}&\textcolor{${AMBER}}{${num(d)}}\end{bmatrix}`;
  return (
    <div className="viz-col area-col" ref={ref}>
      <div className="viz-toggle" role="group" aria-label="The matrix A">
        {EXAMPLES.map((ex, k) => (
          <button
            key={ex.name}
            type="button"
            className="viz-button"
            aria-pressed={!dragged && pick.k === k}
            onClick={() => {
              setDragged(null);
              setPick(({ n }) => ({ k, n: n + 1 }));
            }}
          >
            {NAMES[k]}
          </button>
        ))}
      </div>
      <div className="l18-area-ex">
        <div className="area-drag" ref={pic} onPointerDown={down} onPointerMove={(e) => e.buttons && move(e)} data-prevent-swipe>
          {dragged ? <Picture A={A} at={areaAt(A)} t={1} /> : <Glide key={`${run}-${pick.n}`} A={A} at={EXAMPLES[pick.k].at} />}
        </div>
        <div className="l18-area-readout">
          <Tex tex={`${matrix},\\quad \\det(A)=${num(det)}`} />
        </div>
        <p className="l18-area-note l18-not" style={{ visibility: flat ? 'visible' : 'hidden' }}>
          not invertible
        </p>
      </div>
    </div>
  );
}
