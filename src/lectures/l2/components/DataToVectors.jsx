import { useEffect, useRef, useState } from 'react';
import Tex, { r } from './Tex.jsx';
import { Arrow } from './Plane.jsx';
import Fragment from './Fragment.jsx';

/**
 * Slide 16's figure, two linked graphs:
 *   left   three data points (x_k, y_k) in the plane, with the best-fit line
 *   right  the vectors X = (x_1, x_2, x_3) and Y = (y_1, y_2, y_3) in ℝ³,
 *          one axis per data point; it rocks slowly, and dragging it turns it
 * Under the graphs, X and Y as columns. The fragment `angleIndex` adds the
 * angle θ between X and Y, r = cos θ, and a guided tour: a slider with one
 * level per stop of STOPS moves the points smoothly to that stop.
 *
 * The tour keeps the x's fixed and moves only the y's, along
 *   Y(φ, s) = s (cos φ X + sin φ W/√3),   W = (1, −5, 4),
 * where X and W both add up to 0, X ⟂ W and ‖W‖/√3 = ‖X‖. So the data is
 * centred all the way, the angle between X and Y is exactly φ, and r = cos φ
 * whatever the stretch s > 0.
 */

const TEAL = '#0e7490'; // x-coordinates and X
const CARDINAL = '#8c1515'; // y-coordinates and Y
const INK = '#14213d';
const GRAY = '#6b7280';
const GREEN = '#175e54';

const X = [-3, 1, 2];
const W = [1, -5, 4];
const deg = (d) => (d * Math.PI) / 180;
const yOf = ({ phi, s }) =>
  X.map((x, k) => s * (Math.cos(deg(phi)) * x + (Math.sin(deg(phi)) * W[k]) / Math.sqrt(3)));

const STOPS = [
  { phi: 60, s: 1 }, // r = 0.5
  { phi: 60, s: 0.5 }, // every y halved: θ and r do not change
  { phi: 0, s: 1 }, // Y = X, r = 1
  { phi: 90, s: 1 }, // X ⟂ Y, r = 0
  { phi: 180, s: 1 }, // Y = −X, r = −1
];

const SIZE = 290;
const LIM = 3.5; // the data stays in [-3.1, 3.1]

// ---- left: the plane ----
const P_PAD = 14;
const P_UNIT = (SIZE - 2 * P_PAD) / (2 * LIM);
const plane = ([x, y]) => [SIZE / 2 + x * P_UNIT, SIZE / 2 - y * P_UNIT];

// ---- right: ℝ³ ----
const S_UNIT = 34;
const S_O = [SIZE / 2 - 4, SIZE / 2 + 20];
const AXIS_LEN = 3.4;
const AZ0 = deg(-40);
const EL0 = deg(24);
const AZ_SWING = deg(16);
const AZ_PERIOD = 10; // seconds

function project([x, y, z], az, el) {
  const xr = x * Math.cos(az) - y * Math.sin(az);
  const yr = x * Math.sin(az) + y * Math.cos(az);
  return [S_O[0] + S_UNIT * yr, S_O[1] - S_UNIT * (z * Math.cos(el) - xr * Math.sin(el))];
}

const dot = (a, b) => a.reduce((acc, c, i) => acc + c * b[i], 0);
const norm = (a) => Math.sqrt(dot(a, a));
const texNum = (c) => {
  const q = Math.round(c * 10) / 10 || 0; // no "−0"
  return Number.isInteger(q) ? `${q}` : q.toFixed(1);
};
const fmt = (c) => texNum(c).replace('-', '−');

const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const isShowing = (el) => el?.closest('section')?.classList.contains('present');

/** Mouse/touch position in the coordinates of the svg's viewBox. */
function svgPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [q.x, q.y];
}

/**
 * Azimuth of the 3-D view: rocks slowly on its own (only while the slide is
 * showing) until the viewer turns it by hand.
 */
function useRocking(hostRef, stopped) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (stopped || reducedMotion()) return undefined;
    let id;
    const start = performance.now();
    const tick = (now) => {
      if (isShowing(hostRef.current)) setT((now - start) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [hostRef, stopped]);
  return AZ0 + AZ_SWING * Math.sin((2 * Math.PI * t) / AZ_PERIOD);
}

/**
 * The tour: `stop` is the stop reached (or being moved to), `pos` the current
 * { phi, s }, and `go(k)` moves smoothly to stop k.
 */
function useTour() {
  const [stop, setStop] = useState(0);
  const [pos, setPos] = useState({ phi: STOPS[0].phi, s: STOPS[0].s });
  const posRef = useRef(pos);
  posRef.current = pos;
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const go = (k) => {
    cancelAnimationFrame(frame.current);
    const from = posRef.current;
    const to = STOPS[k];
    setStop(k);
    if (reducedMotion()) {
      setPos({ phi: to.phi, s: to.s });
      return;
    }
    const dur = 700 + 11 * Math.abs(to.phi - from.phi) + 1200 * Math.abs(to.s - from.s);
    const start = performance.now();
    const tick = (now) => {
      const u = Math.min(1, (now - start) / dur);
      const e = ease(u);
      setPos({ phi: from.phi + (to.phi - from.phi) * e, s: from.s + (to.s - from.s) * e });
      if (u < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  return { stop, pos, go };
}

function DataPlane({ points, angleIndex }) {
  // best-fit line through the origin (centred data): slope X · Y / ‖X‖²
  const Y = points.map((pt) => pt[1]);
  const m = dot(X, Y) / dot(X, X);
  const [ax, ay] = plane([-LIM, -LIM * m]);
  const [bx, by] = plane([LIM, LIM * m]);

  return (
    <svg
      className="figure-svg"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      role="img"
      aria-label="The three data points in the plane, with their best-fit line"
    >
      <defs>
        <clipPath id="dtv-plane-clip">
          <rect x={P_PAD} y={P_PAD} width={SIZE - 2 * P_PAD} height={SIZE - 2 * P_PAD} />
        </clipPath>
      </defs>
      <g stroke="#eef0f3">
        {[-3, -2, -1, 1, 2, 3].map((k) => (
          <g key={k}>
            <line x1={plane([k, 0])[0]} y1={P_PAD} x2={plane([k, 0])[0]} y2={SIZE - P_PAD} />
            <line x1={P_PAD} y1={plane([0, k])[1]} x2={SIZE - P_PAD} y2={plane([0, k])[1]} />
          </g>
        ))}
      </g>
      <g stroke={GRAY} strokeWidth="1.5">
        <line x1={P_PAD} y1={SIZE / 2} x2={SIZE - P_PAD} y2={SIZE / 2} />
        <line x1={SIZE / 2} y1={P_PAD} x2={SIZE / 2} y2={SIZE - P_PAD} />
      </g>
      <g fill={GRAY} fontSize="12">
        <text x={plane([2, 0])[0]} y={SIZE / 2 + 15} textAnchor="middle">
          2
        </text>
        <text x={SIZE / 2 - 6} y={plane([0, 2])[1] + 4} textAnchor="end">
          2
        </text>
        <text x={SIZE - P_PAD - 2} y={SIZE / 2 - 7} textAnchor="end" fontSize="14" fontStyle="italic">
          x
        </text>
        <text x={SIZE / 2 + 7} y={P_PAD + 11} fontSize="14" fontStyle="italic">
          y
        </text>
      </g>

      <Fragment as="g" index={angleIndex}>
        <line
          x1={ax}
          y1={ay}
          x2={bx}
          y2={by}
          stroke={GREEN}
          strokeWidth="2"
          strokeDasharray="7 6"
          opacity="0.7"
          clipPath="url(#dtv-plane-clip)"
        />
      </Fragment>

      {points.map((pt, k) => {
        const [cx, cy] = plane(pt);
        // point 1 (far left) is labelled to its right, the others above
        const side = pt[0] < 0;
        return (
          <g key={k}>
            <text
              x={cx + (side ? 12 : 0)}
              y={cy - (side ? 9 : 14)}
              textAnchor={side ? 'start' : 'middle'}
              fontSize="15"
              fontFamily="KaTeX_Main, Georgia, serif"
              fill={INK}
            >
              (<tspan fill={TEAL}>{fmt(pt[0])}</tspan>, <tspan fill={CARDINAL}>{fmt(pt[1])}</tspan>)
            </text>
            <circle cx={cx} cy={cy} r="8.5" fill={INK} stroke="#fff" strokeWidth="2" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
              {k + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function VectorSpace({ Y, angleIndex }) {
  const svgRef = useRef(null);
  const [turn, setTurn] = useState(null); // { az, el } once turned by hand
  const [grab, setGrab] = useState(null);
  const rockAz = useRocking(svgRef, turn !== null);
  const az = turn ? turn.az : rockAz;
  const el = turn ? turn.el : EL0;

  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setGrab({ at: svgPoint(svgRef.current, e), az, el });
  };
  const onMove = (e) => {
    if (!grab) return;
    const [x, y] = svgPoint(svgRef.current, e);
    setTurn({
      az: grab.az - (x - grab.at[0]) / 120,
      el: Math.max(0.05, Math.min(1.35, grab.el + (y - grab.at[1]) / 120)),
    });
  };
  const onUp = () => setGrab(null);

  const P = (v) => project(v, az, el);
  const o = P([0, 0, 0]);
  const axes = [0, 1, 2].map((k) => {
    const e = [0, 0, 0];
    e[k] = AXIS_LEN;
    return { k, pos: P(e), neg: P(e.map((c) => -c)), lab: P(e.map((c) => c * 1.13)) };
  });

  // the arc for θ, in the plane of X and Y
  const nX = norm(X);
  const nY = norm(Y);
  let arc = null;
  let thetaAt = null;
  if (nX > 0 && nY > 0) {
    const u = X.map((c) => c / nX);
    const perp = Y.map((c, i) => c - dot(Y, u) * u[i]);
    const nPerp = norm(perp);
    const theta = Math.acos(Math.max(-1, Math.min(1, dot(X, Y) / (nX * nY))));
    if (nPerp > 1e-6 && theta > 0.05) {
      const w = perp.map((c) => c / nPerp);
      const R = Math.min(1.1, 0.45 * Math.min(nX, nY));
      const at = (f, rr) =>
        P(u.map((c, i) => rr * (Math.cos(f * theta) * c + Math.sin(f * theta) * w[i])));
      arc = Array.from({ length: 33 }, (_, i) => at(i / 32, R))
        .map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`)
        .join(' ');
      thetaAt = at(0.5, R + 0.5);
    }
  }

  const ID = { px: (x) => x, py: (y) => y };
  const vectors = [
    [X, TEAL, 'X'],
    [Y, CARDINAL, 'Y'],
  ];

  return (
    <svg
      ref={svgRef}
      className="figure-svg dtv-space"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      role="img"
      aria-label="The vectors X and Y in three-dimensional space, one axis per data point; drag to turn the view"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <g stroke={GRAY}>
        {axes.map(({ k, pos, neg }) => (
          <g key={k}>
            <line x1={o[0]} y1={o[1]} x2={pos[0]} y2={pos[1]} strokeWidth="1.5" />
            <line x1={o[0]} y1={o[1]} x2={neg[0]} y2={neg[1]} strokeWidth="1" strokeDasharray="3 4" />
          </g>
        ))}
      </g>
      <g fill={GRAY} fontSize="12" textAnchor="middle">
        {axes.map(({ k, lab }) => (
          <text key={k} x={lab[0]} y={lab[1] + 4}>
            point {k + 1}
          </text>
        ))}
      </g>

      {/* dashed drop lines to the floor, as a depth cue */}
      {vectors.map(([v, color]) => {
        const foot = P([v[0], v[1], 0]);
        const tip = P(v);
        return (
          <g key={color} stroke={color} strokeWidth="1.2" strokeDasharray="4 4" opacity="0.45">
            <line x1={o[0]} y1={o[1]} x2={foot[0]} y2={foot[1]} />
            <line x1={foot[0]} y1={foot[1]} x2={tip[0]} y2={tip[1]} />
          </g>
        );
      })}

      {/* always mounted, so reveal keeps counting this fragment */}
      <Fragment as="g" index={angleIndex}>
        {arc && (
          <>
            <path d={arc} fill="none" stroke={GREEN} strokeWidth="2.5" />
            <text
              x={thetaAt[0]}
              y={thetaAt[1] + 6}
              textAnchor="middle"
              fill={GREEN}
              fontSize="17"
              fontWeight="700"
              fontStyle="italic"
              fontFamily="KaTeX_Math, Georgia, serif"
            >
              θ
            </text>
          </>
        )}
      </Fragment>

      {vectors.map(([v, color, name]) => {
        const tip = P(v);
        const len = Math.hypot(tip[0] - o[0], tip[1] - o[1]);
        if (len < 2) return null;
        return (
          <g key={name}>
            <Arrow p={ID} from={o} to={tip} color={color} width={3} head={12} />
            <text
              x={tip[0] + ((tip[0] - o[0]) / len) * 14 + (name === 'X' ? 9 : -9)}
              y={tip[1] + ((tip[1] - o[1]) / len) * 14 + 6}
              textAnchor="middle"
              fill={color}
              fontSize="19"
              fontWeight="700"
              fontFamily="KaTeX_Main, Georgia, serif"
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DataToVectors({ index = 1, angleIndex = 2 }) {
  const { stop, pos, go } = useTour();
  const Y = yOf(pos);
  const points = X.map((x, k) => [x, Y[k]]);
  const col = (v) => r`\begin{bmatrix}${v.map(texNum).join(r`\\`)}\end{bmatrix}`;
  const cos = dot(X, Y) / (norm(X) * norm(Y));
  const theta = Math.round(pos.phi);
  const cosText = (Math.round(cos * 100) / 100 || 0).toFixed(2); // no "−0.00"

  return (
    <Fragment index={index} className="data-to-vectors">
      <div className="dtv-pair">
        <figure>
          <DataPlane points={points} angleIndex={angleIndex} />
          <figcaption>
            data points in <Tex tex={r`\mathbb{R}^2`} />
          </figcaption>
        </figure>
        <figure>
          <VectorSpace Y={Y} angleIndex={angleIndex} />
          <figcaption>
            <Tex tex={r`\vv{X},\vv{Y}\in\mathbb{R}^3`} /> (drag to turn)
          </figcaption>
        </figure>
      </div>

      <div className="dtv-readout">
        <Tex
          tex={r`\color{${TEAL}}{\vv{X}=${col(X)}}\qquad\color{${CARDINAL}}{\vv{Y}=${col(Y)}}`}
        />
        <Fragment index={angleIndex} className="dtv-cos">
          <Tex tex={r`\theta=${theta}^\circ,\quad r=\cos\theta=${cosText}`} />
        </Fragment>
      </div>

      <Fragment index={angleIndex} className="dtv-tour" data-prevent-swipe>
        <input
          type="range"
          min={0}
          max={STOPS.length - 1}
          step={1}
          value={stop}
          onChange={(e) => go(Number(e.target.value))}
          // let go of focus, so the arrow keys go back to reveal.js
          onPointerUp={(e) => e.currentTarget.blur()}
          aria-label="Stop of the tour"
        />
        <div className="dtv-ticks" aria-hidden="true">
          {STOPS.map((_, k) => (
            <span key={k} className={k === stop ? 'on' : ''} />
          ))}
        </div>
      </Fragment>
    </Fragment>
  );
}
