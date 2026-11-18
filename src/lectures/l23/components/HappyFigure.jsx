/**
 * The owl up the stairs, for Back substitution (Slide03BackSub; the user's pick, in place of a very happy
 * stick figure, first on Example 2): the deck's question owl (amber, a cream belly, ear tufts; see
 * `.question` in deck.css), celebrating, its wings up and its eyes shut with joy, pink cheeks, its
 * beak open, on the top step of three steps labelled z, y, x from the bottom (back substitution, from
 * the bottom up); around it, confetti of little upper triangles in the deck's amber, blue, yellow and
 * green. As the slide arrives (or, in a fragment, as it appears) the owl jumps for joy three times
 * (squashing as it lands, its shadow shrinking under it), and the confetti twinkles (`.l23-happy` in
 * `deck.css`; none in print, where it stands still).
 */
const INK = '#14213d';
const AMBER = '#c2702a';
const WING = '#a85d1f';
const CREAM = '#f5dfc0';
const YELLOW = '#f6c445';
const PINK = '#f4a6a6';
const STEP = '#e3e8f0';
const LABEL = '#6b7a90';

// confetti: an upper triangle (◥) at (x, y), turned by `turn` degrees, of side `s`
const CONFETTI = [
  { x: 14, y: 60, s: 12, turn: -15, fill: AMBER },
  { x: 46, y: 34, s: 10, turn: 20, fill: '#3b6ea8' },
  { x: 62, y: 76, s: 9, turn: -35, fill: YELLOW },
  { x: 26, y: 94, s: 9, turn: 30, fill: '#3f8f5a' },
  { x: 76, y: 10, s: 9, turn: 50, fill: YELLOW },
  { x: 145, y: 12, s: 10, turn: -40, fill: '#3b6ea8' },
];

// the steps, from the bottom up, and where each one's variable goes
const STAIRS = 'M4 128V112H40V96H76V80H146V128Z';
const VARS = [
  { v: 'z', x: 22, y: 124 },
  { v: 'y', x: 58, y: 110 },
  { v: 'x', x: 111, y: 108 },
];
const TOP = [111, 80]; // the middle of the top step: the owl's feet

export default function HappyFigure({ className = '' }) {
  return (
    <svg className={`l23-happy ${className}`} viewBox="0 0 150 132" aria-hidden="true">
      <path d={STAIRS} fill={STEP} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {VARS.map(({ v, x, y }) => (
        <text key={v} x={x} y={y} textAnchor="middle" fontFamily="KaTeX_Math, 'Times New Roman', serif" fontStyle="italic" fontSize="15" fill={LABEL}>
          {v}
        </text>
      ))}
      <ellipse className="l23-happy-shadow" cx={TOP[0]} cy={TOP[1] + 1} rx="26" ry="2.8" fill={INK} opacity="0.14" />
      {CONFETTI.map(({ x, y, s, turn, fill }, k) => (
        <g key={k} transform={`translate(${x} ${y}) rotate(${turn})`}>
          <path
            className="l23-happy-bit"
            style={{ animationDelay: `${(k * 0.37) % 1.4}s` }}
            d={`M${-s / 2} ${-s / 2}H${s / 2}V${s / 2}Z`}
            fill={fill}
            stroke={INK}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <g className="l23-happy-body">
        {/* the owl in its own units (the question owl's 74 × 64 box, its feet at y = 62) */}
        <g transform={`translate(${TOP[0]} ${TOP[1]}) scale(1.15) translate(-32 -62)`} stroke={INK} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
          {/* wings up, behind it */}
          <path d="M14 39C6 35 1.5 26 2.5 16.5C9.5 20.5 15 27 17.5 33.5Z" fill={WING} />
          <path d="M50 39C58 35 62.5 26 61.5 16.5C54.5 20.5 49 27 46.5 33.5Z" fill={WING} />
          {/* the body with its ear tufts, the belly and its feathers */}
          <path d="M12 40C12 25 14 13 16 8L24.5 16.5C29 15 35 15 39.5 16.5L48 8C50 13 52 25 52 40C52 54 44 61 32 61C20 61 12 54 12 40Z" fill={AMBER} />
          <ellipse cx="32" cy="47" rx="11.5" ry="11" fill={CREAM} stroke="none" />
          <path d="M26 46q2 2.4 4 0M34 46q2 2.4 4 0M30 52q2 2.4 4 0" fill="none" stroke={AMBER} strokeWidth="1.5" />
          {/* eyes shut with joy (^ ^), cheeks */}
          <circle cx="24" cy="29" r="7.6" fill="#fff" />
          <circle cx="40" cy="29" r="7.6" fill="#fff" />
          <path d="M20 30.5Q24 25.5 28 30.5M36 30.5Q40 25.5 44 30.5" fill="none" strokeWidth="2.1" />
          <circle cx="17.5" cy="37" r="2.6" fill={PINK} stroke="none" opacity="0.9" />
          <circle cx="46.5" cy="37" r="2.6" fill={PINK} stroke="none" opacity="0.9" />
          {/* the beak, open */}
          <path d="M29 34.5H35L32 37.5Z" fill={YELLOW} strokeWidth="1.4" />
          <path d="M30.2 38.6H33.8L32 41.4Z" fill={YELLOW} strokeWidth="1.4" />
          {/* toes */}
          <path d="M23 62v-2.5M26 62v-2.5M38 62v-2.5M41 62v-2.5" fill="none" />
        </g>
      </g>
    </svg>
  );
}
