import { useEffect, useRef, useState } from 'react';
import { ISLES, clamp } from './markov.js';
import { PRINT } from './print.js';

// Cartoons for Markov chains' four processes, each 200 × 140: what the next step depends on (for a
// Markov chain, the current state only: the bird's trail from its island, Monopoly's next square
// from this square and the dice; for the others, red arcs from the past). The wings, the flames
// and the cursor move (CSS), and Monopoly is played, turn after turn (a clock); all still in print.
const VW = 200;
const VH = 140;
const MEMORY = '#a51c30';

function Frame({ width, svgRef, children }) {
  return (
    <svg ref={svgRef} className="l16-cartoon" viewBox={`0 0 ${VW} ${VH}`} width={width} height={(width * VH) / VW} aria-hidden="true">
      {children}
    </svg>
  );
}

/** An island as in the opener (beach and green hill), small, with its letter under it. */
function Islet({ x, y, i, side = false }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse rx="34" ry="9" fill="#c4f1ef" />
      <ellipse rx="28" ry="6.5" fill="#f3dfab" />
      <path d="M-20,-1 C-14,-12 -7,-16 0,-16 C7,-16 14,-12 20,-1 Q0,4 -20,-1 Z" fill="#6aa84f" />
      <text x={side ? 44 : 0} y={side ? -2 : 24} textAnchor="middle" className="l16-cartoon-isle" fill={ISLES[i].color}>
        {ISLES[i].name}
      </text>
    </g>
  );
}

/** Example 1: a bird leaving island A for C, its dashed trail behind it. */
export function BirdCartoon({ width = 240 }) {
  return (
    <Frame width={width}>
      <Islet x={38} y={104} i={0} />
      <Islet x={162} y={104} i={1} />
      <Islet x={112} y={30} i={2} side />
      <path d="M40,92 Q38,72 54,68" fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      {/* the bird, flying up to C */}
      <g transform="translate(74,56) rotate(-30) scale(1.25)">
        <path d="M-12,-1 L-24,-8 L-21,3 Z" fill="#2d5686" />
        <ellipse rx="14" ry="9" fill="#3b6ea8" />
        <circle cx="11" cy="-6" r="7.5" fill="#3b6ea8" />
        <circle cx="13.5" cy="-7.5" r="2.8" fill="#fff" />
        <circle cx="14.4" cy="-7.4" r="1.4" fill="#1f2937" />
        <path d="M17.5,-8 L26,-5 L17.5,-2.5 Z" fill="#f2a93b" />
        <path className="l16-cartoon-wing" d="M-8,-2 Q-6,-22 9,-17 Q5,-7 -8,-2 Z" fill="#2d5686" />
      </g>
    </Frame>
  );
}

/** A die's face, `n` pips, centred at (x, y), `s` wide, turned `a` degrees. */
function Die({ x, y, n, a = 0, s = 22 }) {
  const q = s * 0.26;
  const P = {
    1: [[0, 0]],
    2: [[-q, -q], [q, q]],
    3: [[-q, -q], [0, 0], [q, q]],
    4: [[-q, -q], [q, -q], [-q, q], [q, q]],
    5: [[-q, -q], [q, -q], [0, 0], [-q, q], [q, q]],
    6: [[-q, -q], [q, -q], [-q, 0], [q, 0], [-q, q], [q, q]],
  }[n];
  return (
    <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)})`}>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.2} fill="#fff" stroke="#374151" strokeWidth="1.5" />
      {P.map(([u, v], k) => (
        <circle key={k} cx={u} cy={v} r={s * 0.09} fill="#1f2937" />
      ))}
    </g>
  );
}

// the board: 20 squares round a square, GO (bottom right) first and on clockwise, the way the pawn
// moves; the corners C wide, the others W, each side in two colours, on the band facing the middle
const B0 = [32, 2];
const BS = 136;
const C = 26;
const W = (BS - 2 * C) / 4;
const BAND = 6;
const SIDES = [
  ['#955436', '#aae0fa'],
  ['#d93a96', '#f7941d'],
  ['#ed1b24', '#fde047'],
  ['#1fb25a', '#0072bb'],
];
const MIDDLE = [B0[0] + BS / 2, B0[1] + BS / 2];

/** Square k: its rectangle [x, y, w, h] and its band's (none on a corner). */
function square(k) {
  const [x0, y0] = B0;
  const far = BS - C;
  const side = Math.floor(k / 5) % 4;
  const q = k % 5;
  if (q === 0) {
    const [x, y] = [[x0 + far, y0 + far], [x0, y0 + far], [x0, y0], [x0 + far, y0]][side];
    return { r: [x, y, C, C] };
  }
  const fill = SIDES[side][q <= 2 ? 0 : 1];
  if (side === 0) {
    const x = x0 + far - q * W;
    return { r: [x, y0 + far, W, C], band: [x, y0 + far, W, BAND], fill };
  }
  if (side === 1) {
    const y = y0 + far - q * W;
    return { r: [x0, y, C, W], band: [x0 + C - BAND, y, BAND, W], fill };
  }
  if (side === 2) {
    const x = x0 + C + (q - 1) * W;
    return { r: [x, y0, W, C], band: [x, y0 + C - BAND, W, BAND], fill };
  }
  const y = y0 + C + (q - 1) * W;
  return { r: [x0 + far, y, C, W], band: [x0 + far, y, BAND, W], fill };
}

const SQUARES = Array.from({ length: 20 }, (_, k) => square(k));
// where the pawn stands on square k: a little below its centre, and on a corner to the bottom
// right, clear of the corner's name
const stand = (k) => {
  const [x, y, w, h] = SQUARES[k % 20].r;
  return k % 5 === 0 ? [x + w / 2 + 4, y + h / 2 + 1.5] : [x + w / 2, y + h / 2];
};

// the game: each turn a pause, the dice rolling, the dice still (the move is known), the hops; the
// four rolls make one lap (4 + 7 + 4 + 5 = 20), so the game loops
const TURNS = [
  [1, 3],
  [2, 5],
  [3, 1],
  [2, 3],
];
const [REST, ROLL, SETTLE, HOP] = [0.7, 0.9, 0.45, 0.22];
const turnLength = ([a, b]) => REST + ROLL + SETTLE + (a + b) * HOP;
const LAP = TURNS.reduce((sum, d) => sum + turnLength(d), 0);
// the print still: the first roll just landed, its square marked
const STILL = REST + ROLL + 0.1;

/** The game at t seconds: the turn, the time into it, the square the pawn started it on. */
function game(t) {
  let u = t % LAP;
  let from = 0;
  for (let k = 0; k < TURNS.length; k += 1) {
    const len = turnLength(TURNS[k]);
    if (u < len) return { k, u, from };
    u -= len;
    from = (from + TURNS[k][0] + TURNS[k][1]) % 20;
  }
  return { k: 0, u: 0, from: 0 };
}

/** A face for die `i` while rolling: a new one every 80 ms. */
function tumble(t, i) {
  const x = Math.sin(Math.floor(t / 0.08) * 12.9898 + i * 78.233) * 43758.5453;
  return 1 + Math.floor((x - Math.floor(x)) * 6);
}

/**
 * Seconds since the picture holding `ref` came into view (its slide on screen, its fragment shown),
 * every frame; back to 0 when it leaves; `still` in print.
 */
function useShownClock(ref, still) {
  const [t, setT] = useState(PRINT ? still : 0);
  useEffect(() => {
    if (PRINT) return undefined;
    let frame;
    let t0 = null;
    const step = (now) => {
      const el = ref.current;
      const shown = el?.closest('section')?.classList.contains('present') && !el.closest('.fragment:not(.visible)');
      if (shown) {
        if (t0 === null) t0 = now;
        setT((now - t0) / 1000);
      } else if (t0 !== null) {
        t0 = null;
        setT(0);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [ref]);
  return t;
}

/** A pawn standing on (x, y) (its middle there, its foot a little below). */
function Pawn({ x, y }) {
  return (
    <g transform={`translate(${x.toFixed(1)},${(y + 3.5).toFixed(1)}) scale(0.9)`}>
      <ellipse cy="6.5" rx="6.5" ry="2.4" fill="#1e3a8a" stroke="#fff" strokeWidth="1" />
      <path d="M-4.6,6.5 Q-4,-1 -2,-3.5 L2,-3.5 Q4,-1 4.6,6.5 Z" fill="#2563eb" stroke="#fff" strokeWidth="1" />
      <circle cy="-6.5" r="4.3" fill="#2563eb" stroke="#fff" strokeWidth="1" />
      <circle cx="-1.4" cy="-7.8" r="1.2" fill="#fff" opacity="0.7" />
    </g>
  );
}

/**
 * Monopoly: a board of 20 squares, the dice in the middle; turn after turn the dice roll, the
 * square they send the pawn to (from this square only) lights up, and the pawn hops there square by
 * square.
 */
export function MonopolyCartoon({ width = 240 }) {
  const ref = useRef(null);
  const t = useShownClock(ref, STILL);
  const { k, u, from } = game(t);
  const [d1, d2] = TURNS[k];
  const n = d1 + d2;
  const rolling = u >= REST && u < REST + ROLL;
  // before the roll, the dice still show the last turn's
  const faces = u < REST ? TURNS[(k + TURNS.length - 1) % TURNS.length] : rolling ? [tumble(t, 0), tumble(t, 1)] : [d1, d2];
  const shake = rolling ? Math.sin(t * 9) : 0;
  const hops = clamp((u - REST - ROLL - SETTLE) / HOP, 0, n);
  const whole = Math.min(Math.floor(hops), n - 1);
  const part = hops - whole;
  const [a, b] = [stand(from + whole), stand(from + whole + 1)];
  const pawn = [a[0] + (b[0] - a[0]) * part, a[1] + (b[1] - a[1]) * part - 10 * Math.sin(Math.PI * part)];
  // the square the dice send it to, from the dice landing until the pawn lands
  const target = u >= REST + ROLL && hops < n ? SQUARES[(from + n) % 20].r : null;
  return (
    <Frame width={width} svgRef={ref}>
      <rect x={B0[0]} y={B0[1]} width={BS} height={BS} fill="#d9ecd9" stroke="#374151" strokeWidth="1.6" />
      {SQUARES.map(({ r: [x, y, w, h], band, fill }, q) => (
        <g key={q}>
          <rect x={x} y={y} width={w} height={h} fill="#fbfaf5" stroke="#374151" strokeWidth="1.1" />
          {band && <rect x={band[0]} y={band[1]} width={band[2]} height={band[3]} fill={fill} stroke="#374151" strokeWidth="1.1" />}
        </g>
      ))}
      <text x={SQUARES[0].r[0] + 8} y={SQUARES[0].r[1] + 9} textAnchor="middle" className="l16-cartoon-go">
        GO
      </text>
      {/* the jail, bars on its window */}
      <g transform={`translate(${B0[0] + C - 13},${B0[1] + BS - C + 1})`}>
        <rect width="12" height="12" fill="#f7941d" stroke="#374151" strokeWidth="1" />
        <path d="M3,0 V12 M6,0 V12 M9,0 V12" stroke="#374151" strokeWidth="1" />
      </g>
      <Die x={MIDDLE[0] - 13} y={MIDDLE[1] - 2 * Math.abs(shake)} n={faces[0]} a={-8 + 30 * shake} />
      <Die x={MIDDLE[0] + 13} y={MIDDLE[1] + 4 - 2 * Math.abs(shake)} n={faces[1]} a={6 - 26 * shake} />
      {target && (
        <rect x={target[0]} y={target[1]} width={target[2]} height={target[3]} className="l16-cartoon-target" />
      )}
      <Pawn x={pawn[0]} y={pawn[1]} />
    </Frame>
  );
}

/**
 * Hot hand: a ball on fire on its way to the hoop; three hits, and the next shot, which they decide.
 * (Not used: Markov chains has Spotify shuffle instead, the hot hand being debated.)
 */
export function HotHandCartoon({ width = 240 }) {
  const hits = [30, 66, 102];
  return (
    <Frame width={width}>
      {/* the hoop: backboard, net, rim */}
      <rect x="186" y="2" width="7" height="54" rx="1.5" fill="#9ca3af" />
      <path d="M146,40 L152,64 M157,40 L160,64 M168,40 L168,64 M179,40 L176,64 M184,40 L184,64 M149,52 L182,52" stroke="#9ca3af" strokeWidth="1.5" fill="none" />
      <path d="M144,40 L186,40" stroke="#d9480f" strokeWidth="4" strokeLinecap="round" />
      <path d="M8,76 Q76,-8 146,34" fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      {/* the ball, its flames behind it */}
      <g transform="translate(92,24) scale(1.3)">
        <path className="l16-cartoon-flame" d="M-6,-12 C-22,-14 -30,-6 -40,-10 C-34,-2 -38,4 -46,6 C-34,10 -24,14 -6,12 Z" fill="#f7941d" />
        <path className="l16-cartoon-flame" d="M-6,-8 C-16,-9 -22,-4 -28,-5 C-24,0 -26,3 -31,5 C-22,7 -16,9 -6,8 Z" fill="#fcd34d" />
        <circle r="12" fill="#e8742c" stroke="#7c2d12" strokeWidth="1.4" />
        <path d="M-12,0 L12,0 M0,-12 L0,12 M-8,-9 Q-3,0 -8,9 M8,-9 Q3,0 8,9" stroke="#7c2d12" strokeWidth="1.2" fill="none" />
      </g>
      {/* the last three shots, all hits, each pointing at the next */}
      {hits.map((x) => (
        <path key={x} d={`M${x},100 Q${(x + 150) / 2},${100 - (150 - x) * 0.32} 145,100`} fill="none" stroke={MEMORY} strokeWidth="1.8" opacity="0.75" />
      ))}
      {hits.map((x) => (
        <g key={x} transform={`translate(${x},116)`}>
          <circle r="13" fill="#e6f2ea" stroke="#2f7d4f" strokeWidth="2" />
          <path d="M-6,0 L-2,5 L6,-5" fill="none" stroke="#2f7d4f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <g transform="translate(150,116)">
        <circle r="13" fill="#fff" stroke={MEMORY} strokeWidth="2" strokeDasharray="3 3" />
        <text y="6" textAnchor="middle" className="l16-cartoon-q" fill={MEMORY}>
          ?
        </text>
      </g>
    </Frame>
  );
}

// the last three songs, each its artist's colour (never the same artist twice in a row)
const SONGS = [
  [30, '#f97316'],
  [66, '#0ea5e9'],
  [102, '#8b5cf6'],
];
const EQ = [0, 1, 2, 3];

/** A music note, white, its head at (x, y). */
function Note({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} fill="#fff">
      <ellipse rx="4.2" ry="3.1" transform="rotate(-20)" />
      <rect x="2.6" y="-15" width="1.8" height="15" />
      <path d="M4.4,-15 Q11,-12 9,-5 Q8.6,-9.5 4.4,-10.5 Z" />
    </g>
  );
}

/**
 * Spotify shuffle: a music player (not Spotify's logo) playing the last of three songs, shuffle on,
 * its equalizer bouncing; the three songs, each pointing at the next one, which they decide.
 */
export function ShuffleCartoon({ width = 240 }) {
  return (
    <Frame width={width}>
      {/* the player: now playing (the last song's cover), its title, shuffle on, the equalizer */}
      <rect x="34" y="4" width="132" height="70" rx="10" fill="#1f2937" />
      <rect x="44" y="14" width="48" height="48" rx="5" fill={SONGS[2][1]} />
      <Note x={64} y={46} s={1.5} />
      <rect x="102" y="18" width="52" height="6" rx="3" fill="#e5e7eb" />
      <rect x="102" y="29" width="34" height="5" rx="2.5" fill="#9ca3af" />
      <g transform="translate(102,44)" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0,0 C7,0 9,10 16,10 M0,10 C7,10 9,0 16,0" />
        <path d="M13,-2.5 L16,0 L13,2.5 M13,7.5 L16,10 L13,12.5" />
      </g>
      <circle cx="110" cy="58" r="1.6" fill="#4ade80" />
      {EQ.map((q) => (
        <rect key={q} x={132 + 6 * q} y="46" width="4" height="16" rx="1" fill="#4ade80" className="l16-cartoon-eq" style={{ animationDelay: `${-0.17 * q}s` }} />
      ))}
      {/* the last three songs, each pointing at the next */}
      {SONGS.map(([x]) => (
        <path key={x} d={`M${x},102 Q${(x + 150) / 2},${102 - (150 - x) * 0.3} 145,102`} fill="none" stroke={MEMORY} strokeWidth="1.8" opacity="0.75" />
      ))}
      {SONGS.map(([x, c]) => (
        <g key={x}>
          <rect x={x - 13} y="103" width="26" height="26" rx="4" fill={c} />
          <Note x={x - 1} y={121} />
        </g>
      ))}
      <rect x="137" y="103" width="26" height="26" rx="4" fill="#fff" stroke={MEMORY} strokeWidth="2" strokeDasharray="3 3" />
      <text x="150" y="122" textAnchor="middle" className="l16-cartoon-q" fill={MEMORY}>
        ?
      </text>
    </Frame>
  );
}

// the answer so far, word by word: each word's centre
const WORDS = [
  ['The', 28],
  ['cat', 60],
  ['sat', 90],
  ['on', 117],
  ['the', 143],
];
const NEXT = 174;

/** ChatGPT: a robot answering in a speech bubble; every word so far points at the next one. */
export function ChatCartoon({ width = 240 }) {
  return (
    <Frame width={width}>
      {/* the bubble, its tail down to the robot */}
      <path d="M14,8 H186 Q194,8 194,16 V62 Q194,70 186,70 H112 L96,84 L94,70 H14 Q6,70 6,62 V16 Q6,8 14,8 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.6" />
      {WORDS.map(([, x]) => (
        <path key={x} d={`M${x},40 Q${(x + NEXT) / 2},${40 - (NEXT - x) * 0.17} ${NEXT},40`} fill="none" stroke={MEMORY} strokeWidth="1.6" opacity="0.75" />
      ))}
      {WORDS.map(([w, x]) => (
        <text key={x} x={x} y="58" textAnchor="middle" className="l16-cartoon-word">
          {w}
        </text>
      ))}
      <rect x={NEXT - 9} y="42" width="18" height="20" rx="3" fill="#fff" stroke={MEMORY} strokeWidth="1.8" strokeDasharray="3 2.5" />
      <rect className="l16-cartoon-cursor" x={NEXT - 1} y="46" width="2.4" height="12" fill={MEMORY} />
      {/* the robot */}
      <g transform="translate(70,114) scale(1.1)">
        <path d="M0,-22 V-31" stroke="#4a6fa5" strokeWidth="2.4" strokeLinecap="round" />
        <circle cy="-33" r="4" fill="#a51c30" />
        <rect x="-21" y="-22" width="42" height="34" rx="9" fill="#dbe4f0" stroke="#4a6fa5" strokeWidth="2.2" />
        <rect x="-25" y="-10" width="4" height="10" rx="2" fill="#4a6fa5" />
        <rect x="21" y="-10" width="4" height="10" rx="2" fill="#4a6fa5" />
        <circle cx="-8" cy="-7" r="4.2" fill="#1f2937" />
        <circle cx="8" cy="-7" r="4.2" fill="#1f2937" />
        <circle cx="-6.8" cy="-8.4" r="1.4" fill="#fff" />
        <circle cx="9.2" cy="-8.4" r="1.4" fill="#fff" />
        <path d="M-8,3 Q0,9 8,3" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      </g>
    </Frame>
  );
}
