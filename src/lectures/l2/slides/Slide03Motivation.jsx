import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const GRAY = '#6b7280';

/**
 * A fan of labelled arrows from one point, drawn by angle (degrees) and
 * length in pixels -- a cartoon of "vectors pointing in similar directions".
 */
export function Fan({ arrows, title }) {
  const O = [170, 118];
  return (
    <svg
      className="figure-svg"
      viewBox="0 0 340 230"
      width="340"
      height="230"
      role="img"
      aria-label={title}
    >
      <circle cx={O[0]} cy={O[1]} r="4" fill={GRAY} />
      {arrows.map(({ deg, len, color, label, lx = 0, ly = 0 }) => {
        const t = (deg * Math.PI) / 180;
        const x = O[0] + len * Math.cos(t);
        const y = O[1] - len * Math.sin(t);
        const ux = Math.cos(t);
        const uy = -Math.sin(t);
        const h = 13;
        const w = 5.5;
        const head = `${x},${y} ${x - ux * h - uy * w},${y - uy * h + ux * w} ${x - ux * h + uy * w},${y - uy * h - ux * w}`;
        return (
          <g key={label}>
            <line
              x1={O[0]}
              y1={O[1]}
              x2={x - ux * h * 0.9}
              y2={y - uy * h * 0.9}
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon points={head} fill={color} />
            <text
              x={x + ux * 14 + lx}
              y={y + uy * 14 + ly + 5}
              fill={color}
              fontSize="17"
              fontWeight="700"
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Slide03Motivation() {
  return (
    <section>
      <h2>Motivation</h2>

      <Fragment index={1}>
        <p>
          Many applications need to measure how <strong>similar</strong> two vectors are.
        </p>
      </Fragment>

      <div className="dims-cards">
        <Fragment index={2} className="dims-card">
          <h3 className="card-title">Netflix and Spotify</h3>
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
        </Fragment>

        <Fragment index={3} className="dims-card">
          <h3 className="card-title">Search engines and AI chatbots</h3>
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
        </Fragment>
      </div>

      <Notes time="1:30 · running total 2:45">
        <p>
          <em>[Key press]</em> Last time we saw that almost anything can be stored as a vector.
          Today's question: given two vectors, how <strong>similar</strong> are they?
        </p>
        <p>
          <em>[Key press]</em> Netflix and Spotify store each user as a vector of numbers — roughly,
          your tastes. If your vector and someone else's point in about the same direction, you
          probably like the same things, so you get recommended what they liked.
        </p>
        <p>
          <em>[Key press]</em> Search engines and chatbots do the same with text. Every document —
          or every word — becomes a vector, and “similar meaning” becomes “pointing in nearly the
          same direction”. These arrows are cartoons, of course: the real vectors have thousands of
          entries, as we saw on Wednesday.
        </p>
        <p>
          So the thing we need is a way to measure direction, or angle. That is the dot product.
        </p>
      </Notes>
    </section>
  );
}
