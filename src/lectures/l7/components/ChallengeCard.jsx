import { QRCodeSVG } from 'qrcode.react';

const CHALLENGE = 'longevity.stanford.edu/design-challenge';

const NAME = 'Longevity Design Challenge 2026–27';
const THEME = 'Human-Centered Robotics for Longevity';

/** The challenge's name, a link to its page (slide 19b, at the bottom). */
export function ChallengeLink() {
  return (
    <a className="arm-link" href={`https://${CHALLENGE}/`} target="_blank" rel="noreferrer">
      {NAME}: {THEME}
    </a>
  );
}

/**
 * The Longevity Design Challenge's name next to a QR code for its page (as the poll QR codes of
 * lectures 2–3), large on its own slide (21b).
 */
export default function ChallengeCard({ size = 132, className = '' }) {
  const slash = CHALLENGE.indexOf('/');
  return (
    <div className={`arm-challenge ${className}`.trim()}>
      <QRCodeSVG
        className="arm-qr"
        value={`https://${CHALLENGE}/`}
        size={size}
        level="L" // a projected code is never damaged: the lowest level gives fewer, bigger squares
        marginSize={2}
        title={`QR code for ${CHALLENGE}`}
      />
      <div className="arm-challenge-text">
        <span className="arm-challenge-label">{NAME}</span>
        <span className="arm-challenge-name">{THEME}</span>
        <span className="arm-challenge-url">
          {CHALLENGE.slice(0, slash + 1)}
          <br />
          {CHALLENGE.slice(slash + 1)}
        </span>
      </div>
    </div>
  );
}
