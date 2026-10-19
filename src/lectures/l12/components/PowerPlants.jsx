import { MAIN } from './svgmath.jsx';

// cartoon colours: walls, their outlines, water, steam and smoke, the lightning bolts
const WALL = '#94a3b8';
const DARK = '#475569';
const WATER = '#93c5fd';
const STEAM = '#e5e7eb';
const BOLT = '#f59e0b';

// each cartoon in a 70 × 52 box, the ground at y = 52
function Hydro() {
  return (
    <g stroke={DARK} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M 0 16 q 5 -3 10 0 t 10 0 t 10 0 L 30 52 L 0 52 Z" fill={WATER} stroke="none" />
      <polygon points="28,10 37,10 54,52 28,52" fill={WALL} />
      <path d="M 50 46 q 8 0 18 6 L 50 52 Z" fill={WATER} stroke="none" />
    </g>
  );
}

function Nuclear() {
  return (
    <g stroke={DARK} strokeWidth="1.5" strokeLinejoin="round">
      <g fill={STEAM} stroke="#cbd5e1">
        <circle cx="24" cy="9" r="7" />
        <circle cx="34" cy="6" r="8" />
        <circle cx="43" cy="10" r="6" />
      </g>
      <path d="M 12 52 Q 24 32 18 14 L 46 14 Q 40 32 52 52 Z" fill="#cbd5e1" />
    </g>
  );
}

function Gas() {
  return (
    <g stroke={DARK} strokeWidth="1.5" strokeLinejoin="round">
      <g fill={STEAM} stroke="#cbd5e1">
        <circle cx="47" cy="6" r="4.5" />
        <circle cx="55" cy="3" r="5" />
      </g>
      <rect x="8" y="30" width="34" height="22" fill={WALL} />
      <rect x="42" y="10" width="9" height="42" fill="#64748b" />
    </g>
  );
}

function Generic() {
  return (
    <g stroke={DARK} strokeWidth="1.5" strokeLinejoin="round">
      <rect x="40" y="12" width="7" height="20" fill="#64748b" />
      <polygon points="6,52 6,28 20,20 20,28 34,20 34,28 48,20 48,52" fill={WALL} />
    </g>
  );
}

function Bolt({ x, y }) {
  return <polygon transform={`translate(${x} ${y})`} points="7,0 0,11 5,11 3,20 12,7 7,7" fill={BOLT} stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />;
}

const STEP = 84; // from one plant to the next
const PLANTS = [
  { Cartoon: Hydro, name: 'a hydroelectric dam' },
  { Cartoon: Nuclear, name: 'a nuclear plant' },
  { Cartoon: Gas, name: 'a gas plant' },
  { Cartoon: Generic, name: 'another plant' },
];

/**
 * Cartoons of the power plants (a hydroelectric dam, a nuclear plant's cooling tower, a gas plant,
 * ⋯, plant n), each with a lightning bolt, standing on a ground line; `height` pixels tall, to
 * stand in a line of text ("The power plants … provide power x₁, …, xₙ."). No solar or wind: c is
 * the demand left after them.
 */
export default function PowerPlants({ height = 64 }) {
  const at = (k) => (k < 3 ? k * STEP : 3 * STEP + 46); // room for ⋯ before plant n
  const w = at(3) + 72;
  const top = -3; // the steam rises above the 70 × 52 boxes
  const h = 56 - top; // the ground line at y = 53.5
  return (
    <svg
      className="l12-plants"
      width={(height / h) * w}
      height={height}
      viewBox={`0 ${top} ${w} ${h}`}
      role="img"
      aria-label={`Power plants: ${PLANTS.map((p) => p.name).join(', ')}`}
    >
      <line x1="1" y1="53.5" x2={w - 1} y2="53.5" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      {PLANTS.map(({ Cartoon, name }, k) => (
        <g key={name} transform={`translate(${at(k)} 0)`}>
          <Cartoon />
          <Bolt x={k === 1 ? 52 : 58} y={k === 1 ? 26 : 22} />
        </g>
      ))}
      <text x={(2 * STEP + 70 + at(3)) / 2} y="40" textAnchor="middle" fontFamily={MAIN} fontSize="24" fill={DARK}>
        ⋯
      </text>
    </svg>
  );
}
