import { useEffect, useState } from 'react';
import photo from '../assets/memchu.jpg';
import { FILTERS, colorMatrix } from './filters.js';
import { PRINT } from './print.js';

export { photo };
export const CREDIT = 'Photo: King of Hearts, Wikimedia Commons, CC BY-SA 3.0 (cropped)';
export const PHOTO_W = 720; // the photo's pixels
export const PHOTO_H = 420;

/** The photo's pixels (RGBA, row by row), once decoded; null until then, and in print mode. */
export function usePhotoPixels() {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (PRINT) return undefined;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = PHOTO_W;
      c.height = PHOTO_H;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      setData(g.getImageData(0, 0, PHOTO_W, PHOTO_H).data);
    };
    img.src = photo;
    return () => {
      img.onload = null;
    };
  }, []);
  return data;
}

/** The color (0–255) of the pixel (x, y) in the data of usePhotoPixels. */
export const pixelAt = (data, x, y) => [0, 1, 2].map((d) => data[4 * (y * PHOTO_W + x) + d]);

/** The pixel (x, y) of the photo under a pointer event on an element that shows the whole photo. */
export function photoPixel(e) {
  const box = e.currentTarget.getBoundingClientRect();
  const x = Math.floor(((e.clientX - box.left) / box.width) * PHOTO_W);
  const y = Math.floor(((e.clientY - box.top) / box.height) * PHOTO_H);
  return [Math.max(0, Math.min(PHOTO_W - 1, x)), Math.max(0, Math.min(PHOTO_H - 1, y))];
}

/**
 * The SVG filters, one per entry of FILTERS (and of `extra`), as feColorMatrix primitives with
 * their matrices, under the ids `${prefix}-${id}`; an <img> uses one with
 * `style={{ filter: 'url(#…)' }}`, so the browser applies exactly that matrix to every pixel.
 */
export function FilterDefs({ prefix, extra = [] }) {
  return (
    <svg width="0" height="0" className="l13-filter-defs" aria-hidden="true">
      <defs>
        {[...FILTERS, ...extra].map((f) => (
          <filter key={f.id} id={`${prefix}-${f.id}`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={colorMatrix(f.A, f.b)} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

/** The photo through the filter `id` (of FilterDefs with the same prefix). */
export function Filtered({ prefix, id, className = '', alt = 'Stanford Memorial Church' }) {
  return <img src={photo} alt={alt} className={className} style={{ filter: `url(#${prefix}-${id})` }} draggable="false" />;
}

/**
 * A small photo editor: the photo through the selected filter, and the strip of filters under it,
 * each a thumbnail of the photo through it; a click on one selects it. With `onPixel`, a click on
 * the photo (or a drag across it) calls onPixel([x, y]), the pixel under the pointer.
 */
export default function PhotoEditor({ prefix, selected, onSelect, onPixel }) {
  const pick = (e) => {
    if (e.type === 'pointerdown' || e.buttons & 1) onPixel(photoPixel(e));
  };
  return (
    <div className="l13-editor" data-prevent-swipe>
      <div className="l13-editor-bar">
        <span className="l13-editor-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        memchu.jpg — 720 × 420 pixels
      </div>
      <div
        className={`l13-editor-photo${onPixel ? ' pickable' : ''}`}
        onPointerDown={onPixel && pick}
        onPointerMove={onPixel && pick}
      >
        <Filtered prefix={prefix} id={selected} />
      </div>
      <div className="l13-editor-strip">
        {FILTERS.map((f) => (
          <button type="button" key={f.id} className={f.id === selected ? 'on' : undefined} onClick={() => onSelect(f.id)}>
            {/* the outline of the selected one is on this wrapper, outside the filter */}
            <span className="l13-thumb">
              <Filtered prefix={prefix} id={f.id} alt={`The photo through the filter ${f.name}`} />
            </span>
            <span>{f.name}</span>
          </button>
        ))}
      </div>
      <p className="l13-credit">{CREDIT}</p>
    </div>
  );
}
