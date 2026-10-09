import { useState } from 'react';
import '../lectures/l8/styles/deck.css';
import Tex, { r } from '../lectures/l8/components/Tex.jsx';
import Slider from '../lectures/l8/components/Slider.jsx';
import { usePhoto, photoUrl, PW } from '../lectures/l8/components/photo.js';
import { Pane, FloodCanvas, START, T0 } from '../lectures/l8/slides/Slide01cBackground.jsx';

export const lecture = 8;

// the colour's red, green and blue amounts, each in its colour, as in Lecture 7's photo (Slide17cPhoto.jsx)
const RGB = ['#c0262d', '#1f8a3b', '#2457c5'];

/*
 * The slide "Remove the background" (the motivation explained) with everything showing, without its
 * title and question: the photo, f(x, y) = colour at (x, y), and the lengths of its changes going
 * right and up one pixel (east and north on the slide), the same pixel ringed on each (pointing at
 * a picture moves the ring); then the flood from the top corners that steps only where the change is
 * below the tolerance. On the slide the flood starts on a key press; here, on the button, and again
 * on each press.
 */
export default function Edges() {
  const [at, setAt] = useState(START);
  const [T, setT] = useState(T0);
  const [runs, setRuns] = useState(0); // the presses of the button: each one starts the flood afresh
  const photo = usePhoto();
  const k = at[1] * PW + at[0];
  const rgb = photo ? RGB.map((color, i) => r`\textcolor{${color}}{${photo.rgba[4 * k + i]}}`).join(',') : '';
  const val = (arr) => (photo ? Math.round(arr[k]) : 0);

  return (
    <div className="edges-slide bg-slide">
      <div className="edges-row">
        <Pane src={photoUrl} at={at} onPoint={setAt} alt="Hoover Tower and the arcade of the Main Quad against a blue sky">
          <span className="edge-name">The photo</span>
          <span>
            <Tex tex="f(x,y)" /> = colour at <Tex tex="(x,y)" />
          </span>
          <span className="edge-val">
            <Tex tex={`f=(${rgb})`} />
          </span>
        </Pane>
        <Pane src={photo?.urls.eastC} at={at} onPoint={setAt} alt="The length of the change of colour going right, as an image, dark where it is large">
          <span className="edge-name">Change going right</span>
          <Tex tex={r`\|f(x+1,\,y)-f(x,y)\|`} />
          <span className="edge-val">{val(photo?.eastC ?? [])}</span>
        </Pane>
        <Pane src={photo?.urls.northC} at={at} onPoint={setAt} alt="The length of the change of colour going up, as an image, dark where it is large">
          <span className="edge-name">Change going up</span>
          <Tex tex={r`\|f(x,\,y+1)-f(x,y)\|`} />
          <span className="edge-val">{val(photo?.northC ?? [])}</span>
        </Pane>
        <Pane at={null} picture={<FloodCanvas key={runs} photo={photo} T={T} on={runs > 0} />}>
          <span className="edge-name">Background removed</span>
          <span className="edge-what">spread from the top corners</span>
          <span className="edge-what">while the change is &lt; {T}</span>
          <div className="bg-tol">
            <Slider name="tolerance" value={T} onChange={setT} min={2} max={30} step={1} format={(v) => v} />
          </div>
          <button type="button" className="viz-button" onClick={() => setRuns((n) => n + 1)}>
            {runs ? 'Spread again' : 'Remove the background'}
          </button>
        </Pane>
      </div>

      <p className="pfn-credit">Photo: King of Hearts, Wikimedia Commons, CC BY-SA 3.0 (cropped)</p>
    </div>
  );
}
