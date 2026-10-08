import { useId, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const INK = '#14213d';

/* ---------- Screens: every color is r R + g G + b B ---------- */

export const LIGHTS = [
  { key: 'r', name: 'red', letter: 'R', pure: '#ff2a2a', ink: '#c81e1e' },
  { key: 'g', name: 'green', letter: 'G', pure: '#2aff3c', ink: '#15803d' },
  { key: 'b', name: 'blue', letter: 'B', pure: '#2a55ff', ink: '#1d4ed8' },
];

export const NAMED = {
  '140,21,21': 'Stanford cardinal',
  '0,0,0': 'black',
  '255,255,255': 'white',
  '255,0,0': 'red',
  '0,255,0': 'green',
  '0,0,255': 'blue',
  '255,255,0': 'yellow',
  '255,0,255': 'magenta',
  '0,255,255': 'cyan',
};

export const hex = (rgb) => `#${rgb.map((x) => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase();

export const column = (xs) => r`\begin{bmatrix}${xs.join('\\\\')}\end{bmatrix}`;

/**
 * One pixel under a magnifying glass (three sub-pixel lights, each as bright
 * as its slider says, labelled with its basis vector) next to the color you
 * see from a distance.
 */
export function PixelPicture({ rgb }) {
  return (
    <svg
      className="figure-svg"
      viewBox="0 0 330 172"
      width="330"
      height="172"
      role="img"
      aria-label="A pixel is three small lights, red, green and blue; from a distance you see their mix"
    >
      <rect x="14" y="12" width="126" height="126" rx="8" fill="#0b0b0f" />
      {LIGHTS.map((l, i) => (
        <g key={l.key}>
          <rect
            x={22 + i * 38}
            y="20"
            width="34"
            height="110"
            rx="5"
            fill={l.pure}
            fillOpacity={rgb[i] / 255}
            stroke={l.pure}
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          <text
            x={39 + i * 38}
            y="162"
            textAnchor="middle"
            fontSize="20"
            fontWeight="700"
            fontFamily="KaTeX_Main, serif"
            fill={l.ink}
          >
            {l.letter}
          </text>
        </g>
      ))}
      <text x="165" y="80" textAnchor="middle" fontSize="26" fill="#6b7280">
        →
      </text>
      <rect x="190" y="12" width="126" height="126" rx="8" fill={`rgb(${rgb.join(',')})`} stroke="#d1d5db" />
    </svg>
  );
}

/** The pixel and its sliders; the equation (r, g, b) = r R + g G + b B below appears at `eqIndex`. */
export function ColorMixer({ eqIndex }) {
  const [rgb, setRgb] = useState([140, 21, 21]);
  const set = (i) => (x) => setRgb((c) => c.map((y, j) => (j === i ? x : y)));
  const name = NAMED[rgb.join(',')];
  // (r, g, b) = r R + g G + b B, with R, G, B written out as the columns of the identity
  const terms = LIGHTS.map((l, i) => {
    const unit = column([0, 1, 2].map((j) => (j === i ? 1 : 0)));
    return r`${rgb[i]}\underbrace{\textcolor{${l.ink}}{${unit}}}_{\textstyle\textcolor{${l.ink}}{\mathbf{${l.letter}}}}`;
  });
  const tex = `${column(rgb)} = ${terms.join('+')}`;

  return (
    <div className="color-mixer">
      <div className="mix-fig">
        <PixelPicture rgb={rgb} />
        <p className="mix-readout">
          {hex(rgb)}
          {name && <span className="mix-name"> · {name}</span>}
        </p>
      </div>
      <div className="lc-sliders" data-prevent-swipe>
        {LIGHTS.map((l, i) => (
          <Slider
            key={l.key}
            name={`${l.name} light`}
            label={<Tex tex={`\\textcolor{${l.ink}}{${l.key}}`} />}
            value={rgb[i]}
            onChange={set(i)}
            color={l.ink}
            min={0}
            max={255}
            step={1}
            format={(x) => `${x}`}
          />
        ))}
      </div>
      <Fragment index={eqIndex} className="mix-math">
        <Tex display className="mix-eq" tex={tex} />
        <p className="mix-basis">
          <strong>Basis vectors</strong>{' '}
          <Tex tex={LIGHTS.map((l) => r`\textcolor{${l.ink}}{\mathbf{${l.letter}}}`).join(',\\,')} />
        </p>
      </Fragment>
    </div>
  );
}

/* ---------- Eyes: one number per kind of color cell ---------- */

// A small deterministic random generator, so the mosaics look the same every time
export function mulberry32(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The kinds of color cells, as a glowing dot on the dark retina and as a word in the text
// (also used by the closing slide, Back to colors)
export const CELL = {
  uv: { name: 'ultraviolet', dot: '#b57bff', ink: '#7c3aed' },
  blue: { name: 'blue', dot: LIGHTS[2].pure, ink: LIGHTS[2].ink },
  green: { name: 'green', dot: LIGHTS[1].pure, ink: LIGHTS[1].ink },
  yellow: { name: 'yellow', dot: '#ffd23b', ink: '#a16207' },
  red: { name: 'red', dot: LIGHTS[0].pure, ink: LIGHTS[0].ink },
};

// Who, which cells in what (roughly realistic) proportions, and the text
export const EYES = [
  { key: 'human', who: 'Humans', cells: { red: 0.58, green: 0.32, blue: 0.1 }, order: ['red', 'green', 'blue'], seed: 7 },
  { key: 'dog', who: 'Most dogs', cells: { blue: 0.25, yellow: 0.75 }, order: ['blue', 'yellow'], seed: 11 },
  { key: 'bird', who: 'Many birds', cells: { uv: 0.13, blue: 0.2, green: 0.3, red: 0.37 }, order: ['uv', 'blue', 'green', 'red'], seed: 5 },
];

export const RETINA_R = 40;

/** The dots of a retina: a jittered hexagonal grid inside a circle, each dot a random kind of cell. */
export function mosaic({ cells, seed }) {
  const rand = mulberry32(seed);
  const kinds = Object.entries(cells);
  const pick = () => {
    let u = rand();
    for (const [kind, share] of kinds) {
      if ((u -= share) < 0) return kind;
    }
    return kinds[kinds.length - 1][0];
  };
  const step = 8.6;
  const dots = [];
  for (let row = -6; row <= 6; row += 1) {
    for (let col = -6; col <= 6; col += 1) {
      const x = (col + (row % 2 ? 0.5 : 0)) * step + (rand() - 0.5) * 2.4;
      const y = row * step * 0.866 + (rand() - 0.5) * 2.4;
      if (Math.hypot(x, y) < RETINA_R - 5) dots.push({ x, y, kind: pick() });
    }
  }
  return dots;
}

/**
 * A magnified patch of retina: the color cells glowing on a dark disc. The
 * shading gets an id of its own per copy, since the same eye is drawn again on
 * the closing slide.
 */
export function Retina({ eye }) {
  const dots = mosaic(eye);
  const shade = `retina-shade-${eye.key}-${useId().replace(/:/g, '')}`;
  return (
    <svg
      className="retina"
      viewBox={`${-RETINA_R - 2} ${-RETINA_R - 2} ${2 * RETINA_R + 4} ${2 * RETINA_R + 4}`}
      width={2 * RETINA_R + 4}
      height={2 * RETINA_R + 4}
      role="img"
      aria-label={`Color cells of ${eye.who.toLowerCase()}: ${eye.order.map((k) => CELL[k].name).join(', ')}`}
    >
      <defs>
        <radialGradient id={shade}>
          <stop offset="0.55" stopColor="#0b0b0f" stopOpacity="0" />
          <stop offset="1" stopColor="#0b0b0f" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <circle r={RETINA_R} fill="#0b0b0f" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="3.3" fill={CELL[d.kind].dot} />
      ))}
      <circle r={RETINA_R} fill={`url(#${shade})`} />
    </svg>
  );
}

/** One eye: its retina, how many kinds of color cells, and the dimension of its colors. */
export function Eye({ eye, index }) {
  const n = eye.order.length;
  return (
    <Fragment index={index} className="eye">
      <Retina eye={eye} />
      <div className="eye-text">
        <p className="eye-who">{eye.who}</p>
        <p>
          {n} kinds:{' '}
          {eye.order.map((k, i) => (
            <span key={k}>
              {i > 0 && ', '}
              <span style={{ color: CELL[k].ink }}>{CELL[k].name}</span>
            </span>
          ))}
        </p>
        <p className="eye-dim">
          → colors lie in a <strong>{n}-dimensional</strong> space
        </p>
      </div>
    </Fragment>
  );
}

export default function Slide02Motivation() {
  return (
    <section className="dense motivation">
      <h2>Motivation</h2>

      <Fragment index={1}>
        <p>
          Every color on a screen is a <strong>mix</strong> of three lights. Why are three enough?
        </p>
      </Fragment>

      <div className="motivation-cols">
        <Fragment index={2} className="mix-band">
          <p className="band-label">Color of a pixel</p>
          <ColorMixer eqIndex={3} />
        </Fragment>

        <div className="eye-band">
          <Fragment index={4} as="p" className="band-label">
            Color cells in the eye
          </Fragment>
          <div className="eyes">
            {EYES.map((eye, i) => (
              <Eye key={eye.key} eye={eye} index={4 + i} />
            ))}
          </div>
        </div>
      </div>

      <Notes time="2:30 · running total 3:00">
        <p>Today, let's start by talking about colors! There are a lot of colors that we see in this world, but turns out almost all of them
  can be made by mixing just three primary colors: red, green and blue. For example, we get Stanford's cardinal red by mixing a bit of green and blue...
        </p>
        <p>
          Because of this, it's convienient to represent colors as a combination of 3 basic vectors R, G, B.
        </p>
        <p>
          However, the reason that there are 3 primary colors, not 2 or 4, is not because of the natural of light, but because of the way human's eyes work.
          For example, ...
          So if we were to make a television for birds, we will need to add in one more light that emits colors that appeal to the bird's fourth sense.
        </p>
        <p>Today we make precise this idea of representing colors, or more general things in terms of basic building blocks, which are called basis vectors.</p>
        <p>
          <em>[Key press]</em> Every color on your screen is a mix of just three lights. Today's
          question in one sentence: why are three enough?
        </p>
        <p>
          <em>[Key press]</em> Under a magnifying glass, every pixel is three tiny lights: red, green
          and blue. Each is turned up to a brightness between 0 and 255, and from a distance your eye
          sees the mix. <em>[drag the sliders: red + green = yellow; all three at 255 = white]</em>
        </p>
        <p>
          Notice: there is no yellow light in your screen. The yellow you just saw is red + green.
          <em>[drag green to 0]</em> And without the green light you only get reds, blues and purples:
          fewer colors.
        </p>
        <p>
          <em>[Key press]</em> The three lights are our building blocks, and they are vectors, not
          numbers. Write a light as the vector of its three brightnesses: R, red light at brightness
          1, is (1, 0, 0); G is (0, 1, 0); B is (0, 0, 1). <em>[point at the equation]</em> A color is
          the linear combination r R + g G + b B, and the familiar color code (r, g, b) is the list of
          coefficients. <em>[drag a slider: its coefficient in the equation changes with it]</em> The
          sliders started at this deck's Stanford cardinal, 140 R + 21 G + 21 B, hex 8C1515. In
          today's language R, G, B are a <strong>basis</strong>, and we come back to them at the end.
        </p>
        <p>
          <em>[Key press]</em> So why are three lights enough? Because of your eye. Under a
          microscope, the back of your eye is a mosaic of color cells, called cones, of three kinds,
          roughly red, green and blue, and each kind reports a single number. So everything you see
          about color is three numbers: the colors we see lie in a 3-dimensional space. Two lights
          with the same three numbers look identical, even if they are physically different: the
          light from a lemon and the red + green of your screen are different lights, but they look
          exactly the same to you, which is how the screen fooled you a minute ago. The three is
          about you, not about light.
        </p>
        <p>
          <em>[Key press]</em> Most dogs have only two kinds of cones, roughly blue and yellow, as do
          people with the strongest forms of colorblindness: to them red and green look like one
          color at different brightness, and two lights would be enough. Their colors lie in a
          2-dimensional space. (If asked: a dog's colors are not a plane inside ours. Roughly, the
          dog's eye squashes our three numbers down to two, so colors we tell apart, like red and
          green, can look the same to a dog.)
        </p>
        <p>
          <em>[Key press]</em> Many birds have four kinds of cones, one of them for
          ultraviolet light, which we cannot see at all: a 4-dimensional space, and three lights
          cannot make every color a bird sees. The fewest lights you need is the number of numbers
          your eye measures, and that is exactly what dimension will mean. Fun fact: the laws of
          color mixing were written down in 1853 by Hermann Grassmann, who also laid the
          foundations of linear algebra.
        </p>
        <p>
          Today we make these words precise. A mix is a linear combination, which
          you know from the first lecture. Everything you can mix is the <strong>span</strong>. The
          fewest ingredients you need is the <strong>dimension</strong>. And a list of ingredients
          with nothing extra is a <strong>basis</strong>. (Strictly, a light cannot be turned below
          0 or above 255, so no screen shows every color you can see; in math we allow any real
          numbers as coefficients.)
        </p>
      </Notes>
    </section>
  );
}
