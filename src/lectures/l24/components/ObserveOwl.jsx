import { INK, AMBER } from './eig.js';

const CREAM = '#f5dfc0';
const GOLD = '#f6c445';
// a four-pointed star at (x, y), its points r from the centre
const star = (x, y, r) => {
  const k = 0.24 * r;
  return `M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z`;
};

/**
 * The owl before "Observation:" (the user's pick of ten icons): the questions' wise owl (deck.css,
 * .question), eyes wide open and looking at the sentence, a gold sparkle by its head. Inline, not a
 * CSS image, so that its parts can move: as the line appears (deck.css, .l24-observe) it hops in and
 * lands on its feet, looks at the class, glances at the sentence, blinks twice, and the sparkle
 * twinkles (the user: "animate it in a cute way").
 */
export default function ObserveOwl() {
  return (
    <svg className="l24-observe-icon" viewBox="2 2 60 62" aria-hidden="true">
      <g stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M12 40C12 25 14 13 16 8L24.5 16.5C29 15 35 15 39.5 16.5L48 8C50 13 52 25 52 40C52 54 44 61 32 61C20 61 12 54 12 40Z" fill={AMBER} />
        <ellipse cx="32" cy="47" rx="11.5" ry="11" fill={CREAM} stroke="none" />
        <path d="M26 44q2 2.4 4 0M34 44q2 2.4 4 0M30 50q2 2.4 4 0" fill="none" stroke={AMBER} strokeWidth="1.5" />
        <g className="l24-owl-eyes">
          <circle cx="24" cy="29" r="8.4" fill="#fff" />
          <circle cx="40" cy="29" r="8.4" fill="#fff" />
          <g className="l24-owl-look" stroke="none">
            <circle cx="26.5" cy="29" r="4.2" fill={INK} />
            <circle cx="42.5" cy="29" r="4.2" fill={INK} />
            <circle cx="27.8" cy="27.6" r="1.3" fill="#fff" />
            <circle cx="43.8" cy="27.6" r="1.3" fill="#fff" />
          </g>
        </g>
        <path d="M29.5 36H34.5L32 41Z" fill={GOLD} strokeWidth="1.5" />
        <path d="M23 62v-2.5M26 62v-2.5M38 62v-2.5M41 62v-2.5" fill="none" />
      </g>
      <path className="l24-owl-spark" d={star(56, 10, 5.5)} fill={GOLD} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
