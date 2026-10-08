import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import { CELL, EYES, Retina } from './Slide02Motivation.jsx';

// One light per kind of color cell: the basis vector's letter and its coefficient
export const LIGHT = {
  uv: { letter: 'U', coef: 'u' },
  blue: { letter: 'B', coef: 'b' },
  green: { letter: 'G', coef: 'g' },
  yellow: { letter: 'Y', coef: 'y' },
  red: { letter: 'R', coef: 'r' },
};

export const vec = (k) => r`\textcolor{${CELL[k].ink}}{\mathbf{${LIGHT[k].letter}}}`;

/** A pixel of a screen made for this eye: one light per kind of color cell, labelled with its basis vector. */
export function Pixel({ order }) {
  const W = 24;
  const GAP = 6;
  const PAD = 8;
  const H = 80;
  const width = 2 * PAD + order.length * W + (order.length - 1) * GAP;
  const height = H + 2 * PAD + 26;
  return (
    <svg
      className="end-pixel"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`A pixel with ${order.length} lights: ${order.map((k) => CELL[k].name).join(', ')}`}
    >
      <rect width={width} height={H + 2 * PAD} rx="7" fill="#0b0b0f" />
      {order.map((k, i) => {
        const x = PAD + i * (W + GAP);
        return (
          <g key={k}>
            <rect x={x} y={PAD} width={W} height={H} rx="4" fill={CELL[k].dot} />
            <text
              x={x + W / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fontFamily="KaTeX_Main, serif"
              fill={CELL[k].ink}
            >
              {LIGHT[k].letter}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** One eye: its retina, the pixel it needs, the combination and the basis. */
export function EyeBasis({ eye, index }) {
  const combo = eye.order.map((k) => r`${LIGHT[k].coef}\,${vec(k)}`).join('+');
  return (
    <Fragment index={index} className="end-eye">
      <p className="end-who">{eye.who}</p>
      <div className="end-pics">
        <Retina eye={eye} />
        <span className="end-arrow">→</span>
        <Pixel order={eye.order} />
      </div>
      <Tex display tex={r`\text{color}=${combo}`} />
      <p className="end-basis">
        basis <Tex tex={eye.order.map(vec).join(r`,\,`)} /> →{' '}
        <strong>{eye.order.length}-dimensional</strong>
      </p>
    </Fragment>
  );
}

export default function Slide15aBackToColors() {
  return (
    <section className="dense">
      <h2>Back to colors</h2>

      <p className="compact">
        The natural basis for the colors an eye sees: one light for each kind of color cell.
      </p>

      <div className="end-eyes">
        {EYES.map((eye, i) => (
          <EyeBasis key={eye.key} eye={eye} index={i + 1} />
        ))}
      </div>

      <Fragment index={4} as="p" className="compact end-punchline">
        The number of basis vectors is the dimension:
        <br />a screen for dogs would need only 2 lights per pixel, and a screen for birds 4.
      </Fragment>

      <Notes time="2:30 · running total 42:30">
        <p>
          Back to where we started, with today's words. For each eye, the natural basis is one light
          for each kind of color cell.
        </p>
        <p>
          <em>[Key press]</em> Us: three kinds of cells, so our colors form a 3-dimensional space,
          and R, G, B is a basis. Every color is r R + g G + b B, and nothing is extra: take away
          one light and you lose colors. That is why a screen has three lights per pixel. It is one
          basis among many, as on the last slide: any three lights would do, as long as none of them
          is a mix of the other two.
        </p>
        <p>
          <em>[Key press]</em> Most dogs: two kinds of cells, roughly blue and yellow. A
          2-dimensional color space, so a basis has two vectors: a blue light B and a yellow light
          Y, and every color a dog sees is b B + y Y.
        </p>
        <p>
          <em>[Key press]</em> Many birds: four kinds, one of them ultraviolet. A basis has four
          vectors, U, B, G, R, and every color is u U + b B + g G + r R. Our screens cannot show a
          bird all its colors: three vectors can never span a 4-dimensional space.
        </p>
        <p>
          <em>[Key press]</em> So the number of basis vectors is the dimension, and here the eye
          decides it. A screen made for dogs would need only two lights per pixel; one made for
          birds, four.
        </p>
      </Notes>
    </section>
  );
}
