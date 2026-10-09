import { useEffect, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { usePhoto, photoUrl, PW, PH, floodLayers, paintRemoved, removedUrl } from '../components/photo.js';
import { PRINT } from '../components/print.js';

export const INK = '#14213d';
export const IMG_W = 250;
export const IMG_H = (IMG_W * PH) / PW;
export const START = [163, 250]; // on the tower's left edge: the change going east is 52, going north 2
export const T0 = 10; // the tolerance at first: the sky goes, the tower stays
export const T_LEAK = 16; // a tolerance too large: the flood leaks into the stone (the PDF's last page)
export const FLOOD_MS = 3200; // the flood's spreading, after key press 3

/**
 * One picture, with a ring at the pixel `at` (none if null) and, under it, what it shows
 * (`children`); pointing at it moves `at`. Shown from key press `index` (from the start if 0).
 */
export function Pane({ src, at, onPoint, alt, index = 0, picture, children }) {
  const point = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - box.left) / box.width) * PW);
    const y = Math.floor(((e.clientY - box.top) / box.height) * PH);
    if (x >= 0 && x < PW && y >= 0 && y < PH) onPoint([x, y]);
  };
  const Tag = index ? Fragment : 'figure';
  const props = index ? { index, as: 'figure', className: 'edge-pane' } : { className: 'edge-pane' };
  return (
    <Tag {...props}>
      <div
        className="photo-frame"
        style={{ width: IMG_W, height: IMG_H }}
        onPointerMove={PRINT || !onPoint ? undefined : point}
      >
        {picture ?? (src && <img src={src} alt={alt} width={IMG_W} height={IMG_H} />)}
        {at && (
          <svg className="photo-cross" viewBox={`0 0 ${PW} ${PH}`} width={IMG_W} height={IMG_H}>
            <circle cx={at[0] + 0.5} cy={at[1] + 0.5} r="20" fill="none" stroke="#fff" strokeWidth="10" />
            <circle cx={at[0] + 0.5} cy={at[1] + 0.5} r="20" fill="none" stroke={INK} strokeWidth="5" />
          </svg>
        )}
      </div>
      <figcaption>{children}</figcaption>
    </Tag>
  );
}

/**
 * The flood, live: a canvas that spreads the checkerboard from the top corners once key press 3
 * is shown (`on`), the front in blue, and redraws at once when the tolerance T changes.
 */
export function FloodCanvas({ photo, T, on }) {
  const canvasRef = useRef(null);
  const progress = useRef(0); // 0 to 1: how far the flood has spread
  const flood = useMemo(() => photo && floodLayers(photo, T), [photo, T]);

  const draw = useRef(null);
  draw.current = () => {
    const canvas = canvasRef.current;
    if (!canvas || !flood) return;
    const ctx = canvas.getContext('2d');
    const out = ctx.createImageData(PW, PH);
    const p = progress.current;
    paintRemoved(photo, flood, p >= 1 ? Infinity : p * flood.max, out.data, p < 1);
    ctx.putImageData(out, 0, 0);
  };

  useEffect(() => draw.current(), [flood]);

  useEffect(() => {
    if (!on) {
      progress.current = 0;
      draw.current();
      return undefined;
    }
    let frame;
    let t0;
    const step = (now) => {
      if (t0 === undefined) t0 = now;
      progress.current = Math.min(1, (now - t0) / FLOOD_MS);
      draw.current();
      if (progress.current < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, 300);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [on]);

  return <canvas ref={canvasRef} width={PW} height={PH} aria-label="The photo, its background removed" />;
}

/** In the PDF, a value that changes on key press 4: `before`, then `after` in its place. */
export function Then({ before, after, as = 'span', className = '' }) {
  return (
    <span className={`bg-then ${className}`}>
      <Fragment index={4} as={as} effect="fade-out">
        {before}
      </Fragment>
      <Fragment index={4} as={as} className="bg-then-after">
        {after}
      </Fragment>
    </span>
  );
}

/**
 * Remove the background, the motivation explained (at the end of the lecture; the opener is the
 * tiny Photoshop of Slide01dPhotoshop.jsx): how to remove the sky from the photo? The photo of Hoover Tower as f(x, y) = colour at (x, y), a
 * vector (R, G, B), with its value at the ringed pixel (pointing at the photo or a change moves the
 * ring). Key press 1: the length of the change going east one pixel, ‖f(x + 1, y) − f(x, y)‖, as an
 * image (dark where it is large); 2: the change going north; 3: the background removed: a flood
 * from the two top corners that takes a step only where the change is below the tolerance (10),
 * spreading over 3 s; 4: the tolerance slider (16 makes the flood leak into the stone; the PDF shows
 * 16). The photo's credit (CC BY-SA 3.0) is under the slide from the start.
 */
export default function Slide01cBackground() {
  const [at, setAt] = useState(START);
  const [T, setT] = useState(T0);
  const photo = usePhoto();
  const flooding = useRef(null);
  const on = useFragmentShown(flooding);
  const k = at[1] * PW + at[0];
  const rgb = photo ? [0, 1, 2].map((i) => photo.rgba[4 * k + i]).join(',') : '';
  const val = (arr) => (photo ? Math.round(arr[k]) : 0);

  return (
    <section className="dense edges-slide bg-slide">
      <span ref={flooding} className="fragment fx-marker" data-fragment-index={3} aria-hidden="true" />
      <h2>Remove the background</h2>
      <p className="motiv-question edges-q">
        How to remove the sky from the photo?
      </p>

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
        <Pane index={1} src={photo?.urls.eastC} at={at} onPoint={setAt} alt="The length of the change of colour going east, as an image, dark where it is large">
          <span className="edge-name">Change going east</span>
          <Tex tex={r`\|f(x+1,\,y)-f(x,y)\|`} />
          <span className="edge-val">{val(photo?.eastC ?? [])}</span>
        </Pane>
        <Pane index={2} src={photo?.urls.northC} at={at} onPoint={setAt} alt="The length of the change of colour going north, as an image, dark where it is large">
          <span className="edge-name">Change going north</span>
          <Tex tex={r`\|f(x,\,y+1)-f(x,y)\|`} />
          <span className="edge-val">{val(photo?.northC ?? [])}</span>
        </Pane>
        <Pane
          index={3}
          at={null}
          picture={
            PRINT ? (
              photo && (
                <>
                  <Fragment index={4} as="img" effect="fade-out" src={removedUrl(photo, T0)} alt="The photo, its sky removed" width={IMG_W} height={IMG_H} />
                  <Fragment index={4} as="img" src={removedUrl(photo, T_LEAK)} alt="The photo, the flood leaking into the stone" width={IMG_W} height={IMG_H} />
                </>
              )
            ) : (
              <FloodCanvas photo={photo} T={T} on={on} />
            )
          }
        >
          <span className="edge-name">Background removed</span>
          <span className="edge-what">spread from the top corners</span>
          <span className="edge-what">
            while the change is &lt; {PRINT ? <Then before={T0} after={T_LEAK} /> : T}
          </span>
          <Fragment index={4} className="bg-tol">
            <Slider name="tolerance" value={PRINT ? T_LEAK : T} onChange={setT} min={2} max={30} step={1} format={(v) => v} />
          </Fragment>
        </Pane>
      </div>

      <p className="pfn-credit">Photo: King of Hearts, Wikimedia Commons, CC BY-SA 3.0 (cropped)</p>
    </section>
  );
}
