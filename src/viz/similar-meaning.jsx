import '../lectures/l2/styles/deck.css';
import { Fan, CARDINAL, TEAL, GRAY } from '../lectures/l2/slides/Slide03Motivation.jsx';

export const lecture = 2;
export const zoom = 1.3;

/* The slide's second example, search engines and AI chatbots, without its title (the applet's
   title says it). */
export default function SimilarMeaning() {
  return (
    <div className="dims-card sim-card">
      <Fan
        title="The arrows for cat and kitten point in nearly the same direction; tax return points elsewhere"
        arrows={[
          { deg: 70, len: 92, color: CARDINAL, label: '“cat”', lx: -14 },
          { deg: 58, len: 98, color: TEAL, label: '“kitten”', lx: 14 },
          { deg: 158, len: 110, color: GRAY, label: '“tax return”', ly: -12 },
        ]}
      />
      <p className="aside">
        <strong>similar vectors</strong> ⟷ words of <strong>similar meaning</strong>
      </p>
    </div>
  );
}
