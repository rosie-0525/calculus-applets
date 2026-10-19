const W = 380;
const H = 320;
const INK = '#221d3d'; // the silhouettes against the dusk
const LIT = '#fde68a'; // lit windows

const pt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;

/** A sagging wire from a to b. */
const wire = (a, b) => `M${pt(a)}Q${pt([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.22 * Math.abs(b[0] - a[0])])} ${pt(b)}`;

/** A lattice pylon h px tall standing at (x, base); `tips` gives the ends of its crossarm, where the wires hang. */
const tips = (x, base, h) => [
  [x - 0.3 * h, base - 0.74 * h],
  [x + 0.3 * h, base - 0.74 * h],
];
function Pylon({ x, base, h }) {
  const leg = (s) => `M${pt([x + s * 0.2 * h, base])}L${pt([x + s * 0.05 * h, base - 0.82 * h])}L${pt([x, base - h])}`;
  // the lattice: a zigzag between the legs
  const zig = [];
  for (let k = 0; k <= 6; k += 1) {
    const t = k / 6;
    const y = base - 0.82 * h * t;
    const half = 0.2 * h - 0.15 * h * t;
    zig.push(pt([x + (k % 2 ? half : -half), y]));
  }
  const yArm = base - 0.78 * h;
  return (
    <g fill="none" stroke={INK} strokeWidth={Math.max(1, 0.025 * h)} strokeLinejoin="round">
      <path d={`${leg(-1)}${leg(1)}M${zig.join('L')}`} />
      <path d={`M${pt([x - 0.32 * h, yArm])}L${pt([x + 0.32 * h, yArm])}M${pt([x - 0.12 * h, yArm])}L${pt([x, yArm - 0.1 * h])}L${pt([x + 0.12 * h, yArm])}`} />
      {tips(x, base, h).map(([tx, ty]) => (
        <line key={tx} x1={tx} y1={yArm} x2={tx} y2={ty} />
      ))}
    </g>
  );
}

const PYLON_A = [112, 213, 46];
const PYLON_B = [146, 244, 84];
// the house is drawn at its own size, then enlarged 1.2 times about its bottom right corner
const BIG = 1.2;
const big = ([x, y]) => [372 + BIG * (x - 372), 300 + BIG * (y - 300)];
const [A1, A2] = tips(...PYLON_A);
const [B1, B2] = tips(...PYLON_B);
const PLANT = [
  [91, 185],
  [94, 189],
];
const HOUSE = [big([215, 203]), big([215, 209])];
// from the plant to the house, span by span
const WIRES = [wire(PLANT[0], A1), wire(PLANT[1], A2), wire(A1, B1), wire(A2, B2), wire(B1, HOUSE[0]), wire(B2, HOUSE[1])];
// the far houses on the hills, each with a lit window
const FAR = [
  [128, 209],
  [163, 212],
  [175, 208],
];
const STARS = [
  [150, 22], [196, 48], [232, 18], [262, 64], [288, 30], [356, 76], [372, 18], [214, 86], [120, 58], [304, 96],
];

/**
 * The electricity card of Constrained optimization problems, the user's picture: at dusk, a power
 * plant on the horizon (a cooling tower and a gas plant, the sun set behind them), pylons carrying
 * the wires, the current flowing along them (`l12-power-flow` in deck.css), to a house in front,
 * through whose window a family watches TV (from behind, on a sofa; on the TV, a little rainbow);
 * lit windows in the far houses. Everybody is home in the evening.
 */
export default function PowerHome() {
  return (
    <svg
      className="figure-svg l12-landscape"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="At dusk, wires run on pylons from a power plant on the horizon to a house, where a family on a sofa watches TV"
    >
      <defs>
        <clipPath id="l12-ph-frame">
          <rect width={W} height={H} rx="10" />
        </clipPath>
        <linearGradient id="l12-ph-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1e46" />
          <stop offset="0.32" stopColor="#2e3474" />
          <stop offset="0.52" stopColor="#80548c" />
          <stop offset="0.66" stopColor="#f0956c" />
        </linearGradient>
        <radialGradient id="l12-ph-sunset" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fed7aa" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="l12-ph-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a4339" />
          <stop offset="1" stopColor="#14261f" />
        </linearGradient>
        <linearGradient id="l12-ph-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2ab8c" />
          <stop offset="1" stopColor="#9c8566" />
        </linearGradient>
        <linearGradient id="l12-ph-room" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7c57e" />
          <stop offset="1" stopColor="#d48a4c" />
        </linearGradient>
        <radialGradient id="l12-ph-tvglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#dbeafe" stopOpacity="0.95" />
          <stop offset="1" stopColor="#93c5fd" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="l12-ph-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fffbeb" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="l12-ph-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#bae6fd" />
        </linearGradient>
        <clipPath id="l12-ph-window">
          <rect x="232" y="208" width="120" height="70" />
        </clipPath>
        <clipPath id="l12-ph-tv">
          <rect x="257" y="217" width="46" height="26" />
        </clipPath>
        <mask id="l12-ph-moon">
          <rect width={W} height={H} fill="#fff" />
          <circle cx="336" cy="38" r="10" fill="#000" />
        </mask>
      </defs>

      <g clipPath="url(#l12-ph-frame)">
        {/* the dusk: the sun set behind the plant, a crescent moon and the first stars */}
        <rect width={W} height={H} fill="url(#l12-ph-sky)" />
        <ellipse cx="48" cy="204" rx="150" ry="62" fill="url(#l12-ph-sunset)" />
        <g fill="#fff">
          {STARS.map(([x, y], k) => (
            <circle key={x} cx={x} cy={y} r={k % 3 ? 0.9 : 1.3} opacity={k % 2 ? 0.55 : 0.85} />
          ))}
        </g>
        <circle cx="330" cy="42" r="11" fill="#fef3c7" mask="url(#l12-ph-moon)" />

        {/* the far hills, the plant on them and the far houses */}
        <path d="M0 204 Q 60 196 120 204 T 250 206 T 380 202 L380 320 L0 320 Z" fill="#2b2a55" />
        <g fill="#f9c6c9" opacity="0.85">
          <circle cx="33" cy="150" r="8" />
          <circle cx="44" cy="142" r="10" />
          <circle cx="58" cy="136" r="9" />
          <circle cx="70" cy="132" r="7" />
        </g>
        <g fill="#c4b5d8" opacity="0.7">
          <circle cx="87" cy="146" r="4" />
          <circle cx="94" cy="140" r="5" />
        </g>
        <g fill={INK}>
          <path d="M 18 205 Q 31 182 24 160 L 46 160 Q 39 182 52 205 Z" />
          <rect x="56" y="181" width="36" height="24" />
          <rect x="81" y="150" width="7" height="31" />
        </g>
        <g fill={LIT}>
          {[61, 68, 75].map((x) => (
            <rect key={x} x={x} y="187" width="3" height="3" />
          ))}
        </g>
        {FAR.map(([x, y]) => (
          <g key={x}>
            <path d={`M${x - 5} ${y}V${y - 6}L${x} ${y - 10}L${x + 5} ${y - 6}V${y}Z`} fill={INK} />
            <rect x={x - 1.5} y={y - 5} width="3" height="3" fill={LIT} />
          </g>
        ))}
        <Pylon x={PYLON_A[0]} base={PYLON_A[1]} h={PYLON_A[2]} />

        {/* the meadow and the near pylon */}
        <path d="M0 226 Q 90 216 190 222 T 380 220 L380 320 L0 320 Z" fill="url(#l12-ph-meadow)" />
        <Pylon x={PYLON_B[0]} base={PYLON_B[1]} h={PYLON_B[2]} />

        {/* the wires, and the current flowing along them to the house */}
        <g fill="none" strokeLinecap="round">
          <path d={WIRES.join('')} stroke="#0b0a1f" strokeWidth="1.2" />
          <path d={WIRES.join('')} stroke="#fde047" strokeWidth="1.8" strokeDasharray="2 10" className="l12-power-flow" />
        </g>

        {/* the house: chimney, roof, a lit round window in the gable, the walls */}
        <g transform={`translate(372 300) scale(${BIG}) translate(-372 -300)`}>
        <rect x="334" y="140" width="14" height="30" fill="#5b4a6b" />
        <ellipse cx="293" cy="292" rx="96" ry="8" fill="#000" opacity="0.18" />
        <rect x="214" y="190" width="158" height="108" fill="url(#l12-ph-wall)" />
        <rect x="214" y="294" width="158" height="6" fill="#6f5d49" />
        <polygon points="202,194 293,127 384,194" fill="#463858" stroke="#2c2340" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="293" cy="166" r="10" fill={LIT} stroke="#efe7da" strokeWidth="3" />
        <path d="M218 203h6M218 209h6" stroke="#2c2340" strokeWidth="2" />

        {/* the window: a warm room, the TV's glow, a lamp, the family on the sofa, seen from behind */}
        <g clipPath="url(#l12-ph-window)">
          <rect x="232" y="208" width="120" height="70" fill="url(#l12-ph-room)" />
          <circle cx="324" cy="222" r="34" fill="url(#l12-ph-lamp)" />
          <circle cx="280" cy="231" r="46" fill="url(#l12-ph-tvglow)" />
          <line x1="324" y1="226" x2="324" y2="272" stroke="#57402c" strokeWidth="2" />
          <polygon points="316,226 332,226 328,214 320,214" fill="#fef3c7" stroke="#d6a85c" strokeWidth="1" />
          <rect x="254" y="214" width="52" height="32" rx="2" fill="#111827" />
          <rect x="257" y="217" width="46" height="26" fill="url(#l12-ph-screen)" />
          <g clipPath="url(#l12-ph-tv)" fill="none" strokeWidth="1.8">
            <path d="M266 240a14 14 0 0 1 28 0" stroke="#ef4444" />
            <path d="M268 240a12 12 0 0 1 24 0" stroke="#facc15" />
            <path d="M270 240a10 10 0 0 1 20 0" stroke="#22c55e" />
            <path d="M272 240a8 8 0 0 1 16 0" stroke="#3b82f6" />
            <ellipse cx="280" cy="246" rx="30" ry="6" fill="#4ade80" stroke="none" />
          </g>
          <g fill="#2d2438" stroke="#bfdbfe" strokeOpacity="0.55" strokeWidth="1">
            <path d="M252 282 Q252 263 262 260 Q270 257 278 260 Q288 263 288 282 Z" />
            <circle cx="270" cy="249" r="9" />
            <path d="M296 282 Q296 265 305 262 Q312 259 319 262 Q328 265 328 282 Z" />
            <circle cx="312" cy="241" r="4" />
            <circle cx="312" cy="251" r="8.5" />
            <path d="M283 282 Q283 271 288 269 Q291 268 294 269 Q299 271 299 282 Z" />
            <circle cx="291" cy="261" r="6.5" />
          </g>
          <rect x="240" y="267" width="104" height="16" rx="6" fill="#8a2a2a" />
          <rect x="240" y="267" width="104" height="3" rx="1.5" fill="#b04a3c" />
          <rect x="235" y="263" width="11" height="20" rx="4" fill="#7a2222" />
          <rect x="338" y="263" width="11" height="20" rx="4" fill="#7a2222" />
          <path d="M232 206 L252 206 Q240 236 245 280 L232 280 Z" fill="#0f766e" />
          <path d="M352 206 L332 206 Q344 236 339 280 L352 280 Z" fill="#0f766e" />
          <path d="M240 208 Q238 240 238 278M344 208 Q346 240 346 278" fill="none" stroke="#0b5752" strokeWidth="1.2" />
        </g>
        <rect x="232" y="208" width="120" height="70" fill="none" stroke="#efe7da" strokeWidth="4" />
        <rect x="226" y="278" width="132" height="6" rx="1" fill="#e5dccb" />
        </g>

        {/* a bush by the house */}
        <g fill="#1d3a2c">
          <circle cx="178" cy="300" r="12" />
          <circle cx="166" cy="304" r="9" />
          <circle cx="188" cy="305" r="8" />
        </g>
      </g>
    </svg>
  );
}
