import { INK, AMBER } from './eig.js';

const WING = '#a85d1f';
const CREAM = '#f5dfc0';
const GOLD = '#f6c445';
const SLATE = '#2f4a3a';
const WOOD = '#8b5e3c';
const WOOD_LT = '#c48f65';
const CHALK = '#f5f5ef';

/**
 * The owl before "board" in `.board-pill` (Option F — pull-down chalkboard unroll & point, the user's
 * pick): the deck's amber owl stands ready beside the chalkboard while the board unrolls smoothly down
 * from its top wooden bar with a tiny snap, then raises its wooden pointer and taps twice as the chalk
 * lines write themselves, glances back at the class, and blinks twice — once, not on a loop, settling
 * on the owl and board as drawn (print). See `BoardOwlPeek.jsx` for the saved Option B variant.
 */
export default function BoardOwl() {
  return (
    <svg
      className="board-owl"
      viewBox="0 0 110 64"
      fill="none"
      stroke={INK}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g transform="translate(-5.5, -3.5) scale(1.04)">
        <path d="M13 38C8.5 41 8.5 49.5 13.5 52.5" fill={WING} />
        <path d="M12 40C12 25 14 13 16 8L24.5 16.5C29 15 35 15 39.5 16.5L48 8C50 13 52 25 52 40C52 54 44 61 32 61C20 61 12 54 12 40Z" fill={AMBER} />
        <ellipse cx="32" cy="47.2" rx="11.5" ry="10.8" fill={CREAM} stroke="none" />
        <path d="M26 44.5q2 2.4 4 0M34 44.5q2 2.4 4 0M30 50.5q2 2.4 4 0" fill="none" stroke={AMBER} strokeWidth="1.6" />
        <g className="board-owl-eyes">
          <circle cx="24" cy="29" r="7.6" fill="#fff" />
          <circle cx="40" cy="29" r="7.6" fill="#fff" />
          <g className="board-owl-pupils" stroke="none">
            <circle cx="26.1" cy="28.4" r="3.7" fill={INK} />
            <circle cx="42.1" cy="28.4" r="3.7" fill={INK} />
            <circle cx="27.3" cy="27.2" r="1.25" fill="#fff" />
            <circle cx="43.3" cy="27.2" r="1.25" fill="#fff" />
          </g>
        </g>
        <path d="M29.3 35.2H34.7L32 40.4Z" fill={GOLD} strokeWidth="1.6" />
        <path d="M23 62.2v-2.6M26.2 62.2v-2.6M37.8 62.2v-2.6M41 62.2v-2.6" fill="none" />
      </g>

      <g className="board-owl-roll">
        <rect x="54" y="5" width="50" height="39" rx="3.5" fill={WOOD} />
        <rect x="58" y="9" width="42" height="31" rx="1.5" fill={SLATE} stroke="none" />
        <path className="board-owl-chalk c1" pathLength="1" d="M63 18.5c2.2-2.6 4.4 2.6 6.6 0s4.4 2.6 6.6 0" stroke={CHALK} strokeWidth="2.2" />
        <path className="board-owl-chalk c2" pathLength="1" d="M82 18.5h12" stroke={CHALK} strokeWidth="2.2" />
        <path className="board-owl-chalk c3" pathLength="1" d="M63 28.5h15M84 28.5h10" stroke={CHALK} strokeWidth="2.2" />
        <rect x="52" y="42" width="54" height="4.2" rx="1.8" fill={WOOD_LT} />
        <rect x="88" y="39.4" width="7.5" height="2.6" rx="1" fill={CHALK} stroke="none" />
      </g>
      <rect className="board-owl-bar" x="52.5" y="4.5" width="53" height="3.8" rx="1.8" fill={WOOD} opacity="0" />

      <g className="board-owl-arm">
        <path d="M50.2 35L70 21.8" stroke={INK} strokeWidth="4.2" />
        <path d="M50.2 35L70 21.8" stroke={WOOD_LT} strokeWidth="2.0" />
        <circle cx="70.5" cy="21.5" r="1.7" fill={GOLD} stroke={INK} strokeWidth="1.3" />
        <path d="M43.5 38.5C47.2 32.8 53 30.8 54.6 34.6C55.8 38 49.8 43 43.5 42.5Z" fill={WING} />
      </g>

      <circle className="board-owl-tap" cx="70.5" cy="21.5" r="4.2" stroke={GOLD} strokeWidth="1.6" fill="none" />
    </svg>
  );
}
