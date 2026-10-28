// Colour emoji as SVG text make Chrome's printToPDF fail once a deck has about a hundred of them
// (Lecture 16: "Printing failed"), so the pictures draw each emoji as an image instead: the emoji
// painted once on a canvas, as a PNG.
const cache = new Map();
const PX = 128;

/** A PNG data URL of the emoji `ch`. */
function emojiUrl(ch) {
  if (cache.has(ch)) return cache.get(ch);
  const canvas = document.createElement('canvas');
  canvas.width = PX;
  canvas.height = PX;
  const g = canvas.getContext('2d');
  g.font = `${Math.round(PX * 0.84)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(ch, PX / 2, PX / 2 + PX * 0.05);
  const url = canvas.toDataURL('image/png');
  cache.set(ch, url);
  return url;
}

/** The emoji `ch` in an SVG picture, centred on (x, y), `size` px across. */
export default function Emoji({ ch, x, y, size, opacity }) {
  return <image href={emojiUrl(ch)} x={x - size / 2} y={y - size / 2} width={size} height={size} opacity={opacity} />;
}
