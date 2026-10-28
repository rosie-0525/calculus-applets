/**
 * A yellow road sign with "!" on a short post, a warning light blinking on top (the cautions, next
 * to their titles). In CSS: it drops in and wobbles on its post each time its slide comes up; still
 * in print mode.
 */
export default function CautionSign() {
  const INK = '#111827';
  return (
    <svg className="l15-caution-sign" viewBox="0 0 100 132" width="80" height="106" role="img" aria-label="Caution sign">
      <g className="l15-caution-body">
        <rect x="47" y="100" width="6" height="32" rx="1.5" fill="#9ca3af" />
        <circle className="l15-caution-glow" cx="50" cy="9" r="12" fill="#f97316" />
        <circle className="l15-caution-light" cx="50" cy="9" r="6.5" fill="#f97316" />
        <rect x="43" y="14" width="14" height="6" rx="1.5" fill="#374151" />
        <polygon points="50,20 92,62 50,104 8,62" fill="#facc15" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <polygon points="50,28 84,62 50,96 16,62" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="45.5" y="41" width="9" height="28" rx="4.5" fill={INK} />
        <circle cx="50" cy="79" r="5" fill={INK} />
      </g>
    </svg>
  );
}
