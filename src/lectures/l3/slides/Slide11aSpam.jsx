import Space, { PlaneGrid, PlanePatch, at } from '../components/Space.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const GRAY = '#6b7280';

/* ---------- A plane that separates two kinds of data ---------- */

// Seeded, so the picture is the same on every run
export const rand = (() => {
  let seed = 11;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
})();
export const between = (a, b) => a + (b - a) * rand();

export const SP = [0, 0, 0];
export const SE = [1, 0, -0.25];
export const SE2 = [0, 1, -0.2];
export const SN = [0.25, 0.2, 1]; // perpendicular to SE and SE2
export const MAIL = Array.from({ length: 16 }, (_, i) => {
  const above = i % 2 === 0;
  const h = above ? between(0.35, 0.95) : -between(0.35, 0.95);
  const q = at(SP, SE, SE2, between(-1.4, 1.4), between(-1.4, 1.4)).map((c, k) => c + h * SN[k]);
  return { id: i, at: q, above };
});

export function Envelope({ x, y, color, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) translate(-8 -6)`}>
      <rect width="16" height="12" rx="2" fill="#fff" stroke={color} strokeWidth="1.6" />
      <path d="M 1 2 L 8 7.5 L 15 2" fill="none" stroke={color} strokeWidth="1.4" />
    </g>
  );
}

/** An email at its point of space, a little larger the nearer it is. */
export function Email({ s, m }) {
  const [x, y] = s.P(m.at);
  return <Envelope x={x} y={y} color={m.above ? TEAL : CARDINAL} scale={1 + 0.1 * s.depth(m.at)} />;
}

export function SpamFigure() {
  return (
    <Space
      className="spam-figure"
      width={400}
      height={288}
      unit={70}
      center={[0.5, 0.52]}
      axes={false}
      az={-35}
      el={22}
      swing={20}
      period={14}
      title="Emails as points in space, with a plane separating spam from the rest; the picture turns slowly and can be dragged"
    >
      {(s) => {
        // far to near, and below the plane before the plane before above it
        const sorted = (list) => [...list].sort((a, b) => s.depth(a.at) - s.depth(b.at));
        return (
          <g>
            {sorted(MAIL.filter((m) => !m.above)).map((m) => (
              <Email key={m.id} s={s} m={m} />
            ))}
            <PlanePatch s={s} P={SP} e={SE} e2={SE2} range={[-1.7, 1.7]} fill={GRAY} stroke={GRAY} opacity={0.22} />
            <PlaneGrid s={s} P={SP} e={SE} e2={SE2} range={[-1.7, 1.7]} />
            {sorted(MAIL.filter((m) => m.above)).map((m) => (
              <Email key={m.id} s={s} m={m} />
            ))}
            {/* in the empty corners: above the plane on the upper left, below it on the lower right */}
            <text x="16" y="36" fontSize="19" fontWeight="700" fill={TEAL}>
              not spam
            </text>
            <text x={s.W - 16} y={s.H - 18} textAnchor="end" fontSize="19" fontWeight="700" fill={CARDINAL}>
              spam
            </text>
          </g>
        );
      }}
    </Space>
  );
}

export default function Slide11aSpam() {
  return (
    <section>
      <h2>Machine learning: spam or not?</h2>

      <SpamFigure />

      <Notes time="0:30 · running total 21:30">
        <p>
          That ℝ¹⁰⁰⁰ is not a joke. Turn every email into a vector, as on Wednesday. A spam filter
          is, in its simplest form, a <strong>plane</strong> through that cloud of points: spam on
          one side, everything else on the other. To sort a new email, plug its vector into the
          equation of the plane and look at the sign, exactly as we just did for A, B and C. (In ℝⁿ
          with big n these are called hyperplanes and this is a support vector machine, Chapter 19.)
        </p>
      </Notes>
    </section>
  );
}
