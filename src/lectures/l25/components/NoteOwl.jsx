import { INK, AMBER } from './eig.js';

const WING = '#a85d1f';
const CREAM = '#f5dfc0';
const GOLD = '#f6c445';

/**
 * The owl before a note (Orthogonal eigenvectors' first line; Option G — minimal wing-gesture owl,
 * the user's pick): the deck's amber owl extending an open right wing towards the sentence, its eyes
 * on it. Inline, not a CSS image, so that its parts can move: as the slide arrives (deck.css,
 * .l25-note) it waddles in from the left on alternating feet (rocking gently from side to side with
 * both wings tucked, no jump), opens its right wing towards the sentence, glances at the class and
 * back, and blinks twice; once, not on a loop, settling on the owl as drawn (print).
 */
export default function NoteOwl() {
  return (
    <svg className="l25-note-owl" viewBox="2 2 69 63" aria-hidden="true">
      <g stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <g className="l25-note-walk">
          <g className="l25-note-body">
            <path
              className="l25-note-wing"
              d="M48 41.5C53.2 34.2 60.8 30.2 65 32.5C65.6 35.6 61.8 39 58.2 40.2C61.2 41.2 59.6 44.5 55 44.8C53.5 46.8 50 47 47.5 45.5Z"
              fill={WING}
            />
            <path d="M13 38.5C8.5 41.5 8.8 49.5 13.8 52.5Z" fill={WING} />
            <path
              d="M12 40C12 25 14 13 16 8L24.5 16.5C29 15 35 15 39.5 16.5L48 8C50 13 52 25 52 40C52 54 44 61 32 61C20 61 12 54 12 40Z"
              fill={AMBER}
            />
            <ellipse cx="32" cy="47.2" rx="11.5" ry="11" fill={CREAM} stroke="none" />
            <path d="M26 44q2 2.4 4 0M34 44q2 2.4 4 0M30 50q2 2.4 4 0" fill="none" stroke={AMBER} strokeWidth="1.5" />
            <g className="l25-note-eyes">
              <circle cx="24" cy="29" r="8.1" fill="#fff" />
              <circle cx="40" cy="29" r="8.1" fill="#fff" />
              <g className="l25-note-pupils" stroke="none">
                <circle cx="26.3" cy="28.8" r="4" fill={INK} />
                <circle cx="42.3" cy="28.8" r="4" fill={INK} />
                <circle cx="27.6" cy="27.5" r="1.3" fill="#fff" />
                <circle cx="43.6" cy="27.5" r="1.3" fill="#fff" />
              </g>
            </g>
            <path d="M29.5 35.8H34.5L32 40.8Z" fill={GOLD} strokeWidth="1.5" />
          </g>
          <path className="l25-note-foot-l" d="M23 62v-2.5M26 62v-2.5" fill="none" />
          <path className="l25-note-foot-r" d="M38 62v-2.5M41 62v-2.5" fill="none" />
        </g>
      </g>
    </svg>
  );
}
