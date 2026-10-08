import { useState } from 'react';
import '../lectures/l7/styles/deck.css';
import Tex, { r } from '../lectures/l7/components/Tex.jsx';
import { usePhoto, PW } from '../lectures/l7/components/photo.js';
import { CHANNELS, START, Chip, Pane, Paren } from '../lectures/l7/slides/Slide17cPhoto.jsx';

export const lecture = 7;

/* The slide with everything showing: the photo in black and white, f: ℝ² → ℝ, and in color,
   f: ℝ² → ℝ³, the same pixel ringed on every picture. */
export default function Photo() {
  const [at, setAt] = useState(START);
  const photo = usePhoto();
  const k = at[1] * PW + at[0];
  const rgb = photo ? [0, 1, 2].map((m) => photo.rgba[4 * k + m]) : [0, 0, 0];
  const L = photo ? Math.round(photo.L[k]) : 0;
  const [cr, cg, cb] = CHANNELS.map((ch, m) => r`\textcolor{${ch.color}}{${rgb[m]}}`);

  return (
    <div className="pfn">
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

      <div className="pfn-row">
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
      </div>

      <p className="pfn-credit">Photo: Дмитрий Корсунов, Wikimedia Commons, CC BY-SA 4.0 (cropped)</p>
    </div>
  );
}
