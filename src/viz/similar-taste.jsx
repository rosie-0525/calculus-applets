import '../lectures/l2/styles/deck.css';
import { Fan, CARDINAL, TEAL, GRAY } from '../lectures/l2/slides/Slide03Motivation.jsx';

export const lecture = 2;
export const zoom = 1.3;

/* The slide's first example, Netflix and Spotify, without its title (the applet's title says it). */
export default function SimilarTaste() {
  return (
    <div className="dims-card sim-card">
      <Fan
        title="Arrows for you and Ana point in nearly the same direction; Ben's points the opposite way"
        arrows={[
          { deg: 38, len: 120, color: CARDINAL, label: 'you', lx: 6 },
          { deg: 52, len: 95, color: TEAL, label: 'Ana', lx: -4 },
          { deg: 214, len: 115, color: GRAY, label: 'Ben' },
        ]}
      />
      <p className="aside">
        <strong>similar vectors</strong> ⟷ users with <strong>similar taste</strong>
      </p>
    </div>
  );
}
