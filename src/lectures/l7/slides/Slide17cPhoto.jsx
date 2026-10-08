import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { usePhoto, PW, PH } from '../components/photo.js';
import { PRINT } from '../components/bay.js';

export const INK = '#14213d';

export const CHANNELS = [
  { key: 'r', name: 'R', color: '#c0262d' },
  { key: 'g', name: 'G', color: '#1f8a3b' },
  { key: 'b', name: 'B', color: '#2457c5' },
];
export const IMG_W = 176;
export const IMG_H = (IMG_W * PH) / PW;
export const START = [80, 275]; // a pixel of an orange flower, (255, 181, 0), marked at first (and in the PDF)

/** A little square of the colour `rgb`: the value of the picture at the ringed pixel. */
export function Chip({ rgb }) {
  return <span className="pfn-chip" style={{ background: `rgb(${rgb.join(',')})` }} aria-hidden="true" />;
}

/**
 * One image of the photo (`src`), with a ring at the pixel `at` and its value there under it;
 * pointing at it moves `at`.
 */
export function Pane({ src, at, onPoint, alt, children }) {
  const point = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - box.left) / box.width) * PW);
    const y = Math.floor(((e.clientY - box.top) / box.height) * PH);
    if (x >= 0 && x < PW && y >= 0 && y < PH) onPoint([x, y]);
  };
  return (
    <figure className="pfn-pane">
      <div className="photo-frame" style={{ width: IMG_W, height: IMG_H }} onPointerMove={PRINT ? undefined : point}>
        {src && <img src={src} alt={alt} width={IMG_W} height={IMG_H} />}
        <svg className="photo-cross" viewBox={`0 0 ${PW} ${PH}`} width={IMG_W} height={IMG_H}>
          <circle cx={at[0] + 0.5} cy={at[1] + 0.5} r="20" fill="none" stroke="#fff" strokeWidth="10" />
          <circle cx={at[0] + 0.5} cy={at[1] + 0.5} r="20" fill="none" stroke={INK} strokeWidth="5" />
        </svg>
      </div>
      <figcaption>{children}</figcaption>
    </figure>
  );
}

/** A tall parenthesis, as high as the pictures (a little more, like a TeX delimiter). */
export function Paren({ right }) {
  const w = 18;
  const h = IMG_H + 12;
  return (
    <svg className="pfn-paren" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <path
        d={`M17,0 Q-7,${h / 2} 17,${h} L15.4,${h} Q2.6,${h / 2} 15.4,0 Z`}
        fill={INK}
        transform={right ? `translate(${w},0) scale(-1,1)` : undefined}
      />
    </svg>
  );
}

/**
 * Digital photos (after the helix): a gray kitten among daisies, in two rows with the head and the text on the left and the
 * pictures on the right, each picture with its value at the ringed pixel under it. In black and
 * white, f: ℝ² → ℝ: f(x, y) = brightness at location (x, y), the gray photo. Key press 1: in color,
 * f: ℝ² → ℝ³: f(x, y) = amounts of red, green and blue at location (x, y); the photo = (its red,
 * green and blue images), set as a tuple with tall parentheses. The same pixel is ringed on every
 * picture, and pointing at any of them moves it. The photo's credit (CC BY-SA 4.0) is in the
 * bottom-left corner from the start.
 */
export default function Slide17cPhoto() {
  const [at, setAt] = useState(START);
  const photo = usePhoto();
  const k = at[1] * PW + at[0];
  const rgb = photo ? [0, 1, 2].map((m) => photo.rgba[4 * k + m]) : [0, 0, 0];
  const L = photo ? Math.round(photo.L[k]) : 0;
  const [cr, cg, cb] = CHANNELS.map((ch, m) => r`\textcolor{${ch.color}}{${rgb[m]}}`);

  return (
    <section className="dense">
      <h2>Digital photos</h2>

      <div className="pfn-row">
        <div className="pfn-side">
          <p className="pfn-head">
            <strong>In black and white</strong> <Tex tex={r`f:\mathbb{R}^2\to\mathbb{R}`} />
          </p>
          <p>
            <Tex tex="f(x,y)" /> = brightness at location <Tex tex="(x,y)" />
          </p>
        </div>
        <div className="pfn-pics">
          <Pane src={photo?.urls.gray} at={at} onPoint={setAt} alt="A gray kitten among daisies, in black and white">
            <Tex tex={`f=${L}`} />
            <Chip rgb={[L, L, L]} />
          </Pane>
        </div>
      </div>

      <Fragment index={1} className="pfn-row">
        <div className="pfn-side">
          <p className="pfn-head">
            <strong>In color</strong> <Tex tex={r`\vv{f}:\mathbb{R}^2\to\mathbb{R}^3`} />
          </p>
          <p>
            <Tex tex={r`\vv{f}(x,y)`} /> = amounts of red, green and blue at location <Tex tex="(x,y)" />
          </p>
        </div>
        <div className="pfn-pics">
          <Pane src={photo?.urls.color} at={at} onPoint={setAt} alt="A gray kitten among orange and white daisies">
            <Tex tex={r`\vv{f}=(${cr},${cg},${cb})`} />
            <Chip rgb={rgb} />
          </Pane>
          <span className="pfn-sym eq">
            <Tex tex="=" />
          </span>
          <Paren />
          {CHANNELS.map((ch, m) => [
            m > 0 && (
              <span key={`${ch.key},`} className="pfn-sym comma">
                <Tex tex="," />
              </span>
            ),
            <Pane key={ch.key} src={photo?.urls[ch.key]} at={at} onPoint={setAt} alt="">
              <Tex tex={r`\textcolor{${ch.color}}{${ch.name}=${rgb[m]}}`} />
            </Pane>,
          ])}
          <Paren right />
        </div>
      </Fragment>

      <p className="pfn-credit">Photo: Дмитрий Корсунов, Wikimedia Commons, CC BY-SA 4.0 (cropped)</p>
    </section>
  );
}
