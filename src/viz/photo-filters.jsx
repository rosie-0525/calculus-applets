import { useMemo, useState } from 'react';
import '../lectures/l13/styles/deck.css';
import Tex, { r } from '../lectures/l13/components/Tex.jsx';
import PhotoEditor, { FilterDefs, usePhotoPixels, pixelAt, PHOTO_W, PHOTO_H } from '../lectures/l13/components/PhotoEditor.jsx';
import { byId } from '../lectures/l13/components/filters.js';
import {
  P,
  ACCENT,
  EDITOR_W,
  BAR_H,
  GAP,
  SENTENCE_H,
  BW,
  BH,
  BLOCK,
  squareAt,
  START,
  START_PICK,
  CROSS_PIXELS,
  clamp,
  through,
  ROWS,
  Swatch,
  PixelBlock,
} from '../lectures/l13/slides/Slide01aFilters.jsx';

export const lecture = 13;

/*
 * Photo filters with every step showing, without its title: the small photo editor (a click on a
 * filter in the strip applies it), and beside it the block of pixels around the cross on top of
 * Memorial Church, magnified, with its square on the photo, the pixel x = (R, G, B), and Mono, Sepia
 * and Invert as functions on these 3-vectors, x ↦ its color through each. A click on the block
 * picks x, and a click on the photo moves the block there. On the slide the key presses switch the
 * editor to Mono, Sepia and Invert, one by one; here it starts with the original, and the filters
 * are the reader's to click.
 */
export default function PhotoFilters() {
  const [selected, setSelected] = useState('original');
  const data = usePhotoPixels();
  const [origin, setOrigin] = useState(START);
  const [pick, setPick] = useState(START_PICK);
  const pixels = useMemo(() => {
    if (!data || (origin[0] === START[0] && origin[1] === START[1])) return CROSS_PIXELS;
    return Array.from({ length: BW * BH }, (_, k) => pixelAt(data, origin[0] + (k % BW), origin[1] + Math.floor(k / BW)));
  }, [data, origin]);
  const X = pixels[pick[1] * BW + pick[0]];
  const SQUARE = squareAt(origin);

  // a click on the photo: the block around that pixel (inside the photo), and that pixel as x
  const zoomTo = ([x, y]) => {
    if (!data) return;
    const o = [clamp(x - Math.floor(BW / 2), 0, PHOTO_W - BW), clamp(y - Math.floor(BH / 2), 0, PHOTO_H - BH)];
    setOrigin(o);
    setPick([x - o[0], y - o[1]]);
  };

  return (
    <>
      <FilterDefs prefix={P} />
      <div className="stage l13-filters-stage" style={{ gap: GAP, '--editor-w': `${EDITOR_W}px`, '--bar-h': `${BAR_H}px` }}>
        <PhotoEditor prefix={P} selected={selected} onSelect={setSelected} onPixel={zoomTo} />

        <div className="stage-text l13-pixel-side">
          <p className="l13-pixel-sentence" style={{ height: SENTENCE_H }}>
            A color photo consists of many pixels; each pixel is a 3‑vector:
          </p>
          <div className="l13-pixel-row">
            <div className="l13-grow">
              <PixelBlock id={selected} pixels={pixels} pick={pick} onPick={setPick} />
            </div>
            <div className="l13-pixel-vec">
              <Tex
                tex={r`\vv x=\begin{bmatrix}\textcolor{#c0262d}{R}\\ \textcolor{#2e7d4f}{G}\\ \textcolor{#1d4ed8}{B}\end{bmatrix}=\begin{bmatrix}${X.join('\\\\ ')}\end{bmatrix}`}
              />
              <Swatch c={X} />
            </div>
          </div>

          <div className="l13-filter-rows">
            <p className="l13-filters-lead">Photo filters are functions on these 3‑vectors:</p>
            {ROWS.map((row) => (
              <p key={row.id} className="l13-filter-row">
                <span className="l13-filter-says">
                  {byId[row.id].name} is {row.kind === 'affine' ? 'an' : 'a'} <strong>{row.kind}</strong> function <Tex tex={row.sig} />:
                </span>
                <Swatch c={X} />
                <Tex tex={r`\mapsto`} />
                <Swatch c={through(row.id, X)} />
              </p>
            ))}
          </div>
        </div>

        {/* the block's square on the photo and its two lines to the block */}
        <svg className="l13-zoom-lines" width={BLOCK.x + BLOCK.w} height={BLOCK.y + BLOCK.h} aria-hidden="true">
          <rect x={SQUARE.x} y={SQUARE.y} width={SQUARE.w} height={SQUARE.h} fill="none" stroke={ACCENT} strokeWidth="2" />
          <g className="l13-zoom-rays">
            <line x1={SQUARE.x + SQUARE.w} y1={SQUARE.y} x2={BLOCK.x} y2={BLOCK.y} stroke={ACCENT} strokeWidth="1.5" />
            <line x1={SQUARE.x + SQUARE.w} y1={SQUARE.y + SQUARE.h} x2={BLOCK.x} y2={BLOCK.y + BLOCK.h} stroke={ACCENT} strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </>
  );
}
