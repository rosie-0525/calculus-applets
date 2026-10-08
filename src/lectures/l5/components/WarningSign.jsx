/** A warning sign: an exclamation mark in a rounded triangle, in the warning's colour. */
export default function WarningSign() {
  return (
    <svg className="warning-sign" viewBox="0 0 24 22" aria-hidden="true">
      <path
        d="M12 2 L22.5 20 H1.5 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="10.9" y="7.6" width="2.2" height="7" rx="1.1" fill="#fde8e8" />
      <circle cx="12" cy="17.2" r="1.3" fill="#fde8e8" />
    </svg>
  );
}
