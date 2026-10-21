import { useEffect, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import PhotoEditor, { FilterDefs, usePhotoPixels, pixelAt, PHOTO_W, PHOTO_H } from '../components/PhotoEditor.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { byId, apply } from '../components/filters.js';
import { CROSS } from '../data/cross.js';
import Notes from '../components/Notes.jsx';

export const P = 'l13-fa'; // the ids of this slide's SVG filters
export const ACCENT = '#8c1515';

// The layout, in px of the slide, fixed so that the zoom's square on the photo and its lines to the
// magnified block can be drawn from these numbers: the editor (its 1px border, its title bar, the
// photo across it), the gap, the sentence above the block, and the block's cells.
export const EDITOR_W = 560;
export const BAR_H = 32;
export const GAP = 40;
export const SENTENCE_H = 78;
export const CELL = 14;
export const K = (EDITOR_W - 2) / PHOTO_W; // px of the slide per pixel of the photo
export const { w: BW, h: BH } = CROSS; // the block's size, in pixels of the photo
export const BLOCK = { x: EDITOR_W + GAP, y: SENTENCE_H, w: BW * CELL, h: BH * CELL };
/** The block's square on the photo, its corner at the pixel [x0, y0], in px of the stage. */
export const squareAt = ([x0, y0]) => ({ x: 1 + x0 * K, y: 1 + BAR_H + y0 * K, w: BW * K, h: BH * K });

// On arrival, the block around the cross, from cross.js (the same in print mode), and in it the
// pixel x, of sky. A click on the photo moves the block there (its pixels then read from the
// photo itself), and a click on the block picks the pixel x.
export const START = [CROSS.x0, CROSS.y0];
export const START_PICK = [2, 11];
export const CROSS_PIXELS = Array.from({ length: BW * BH }, (_, k) => [0, 2, 4].map((d) => parseInt(CROSS.hex.slice(6 * k + d, 6 * k + d + 2), 16)));
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** The color c (0–255) through the filter `id`: Ac + b, cut to [0, 255], as the screen shows it. */
export const through = (id, c) => {
  const f = byId[id];
  return apply(f.A, c.map((v) => v / 255), f.b).map((v) => Math.max(0, Math.min(255, Math.round(255 * v))));
};
export const rgb = (c) => `rgb(${c.join(',')})`;

export const ROWS = [
  { id: 'mono', index: 2, kind: 'linear', sig: r`\mathbb R^3\to\mathbb R` },
  { id: 'sepia', index: 3, kind: 'linear', sig: r`\mathbb R^3\to\mathbb R^3` },
  { id: 'invert', index: 4, kind: 'affine', sig: r`\mathbb R^3\to\mathbb R^3` },
];
export const STEP_FILTER = ['original', 'original', 'mono', 'sepia', 'invert'];

export function Swatch({ c }) {
  return <span className="l13-swatch" style={{ background: rgb(c) }} />;
}

/**
 * The block of pixels, magnified, through the filter `id`; the pixel `pick` ringed, with its label x
 * above it (below it in the top two rows). With `onPick`, a click on a pixel (or a drag across the
 * block) calls onPick([i, j]), its column and row in the block.
 */
export function PixelBlock({ id, pixels, pick, onPick }) {
  const [pi, pj] = pick;
  const at = (e) => {
    if (e.type !== 'pointerdown' && !(e.buttons & 1)) return;
    const box = e.currentTarget.getBoundingClientRect();
    onPick([
      clamp(Math.floor(((e.clientX - box.left) / box.width) * BW), 0, BW - 1),
      clamp(Math.floor(((e.clientY - box.top) / box.height) * BH), 0, BH - 1),
    ]);
  };
  return (
    <svg
      className={`l13-pixels${onPick ? ' pickable' : ''}`}
      viewBox={`0 0 ${BLOCK.w} ${BLOCK.h}`}
      width={BLOCK.w}
      height={BLOCK.h}
      aria-label="Pixels of the photo, magnified"
      data-prevent-swipe
      onPointerDown={onPick && at}
      onPointerMove={onPick && at}
    >
      {pixels.map((c, k) => (
        <rect key={k} x={(k % BW) * CELL} y={Math.floor(k / BW) * CELL} width={CELL} height={CELL} style={{ fill: rgb(through(id, c)) }} />
      ))}
      <rect x={pi * CELL - 1} y={pj * CELL - 1} width={CELL + 2} height={CELL + 2} fill="none" stroke="#fff" strokeWidth="3" />
      <rect x={pi * CELL - 2.5} y={pj * CELL - 2.5} width={CELL + 5} height={CELL + 5} fill="none" stroke="#14213d" strokeWidth="1.2" />
      <text x={pi * CELL + CELL / 2} y={pj < 2 ? (pj + 1) * CELL + 18 : pj * CELL - 7} textAnchor="middle" className="l13-pixels-x">
        x
      </text>
    </svg>
  );
}

/** In print mode, where the state does not change, one copy per filter, each on its key presses. */
export function PerStep({ render }) {
  return (
    <div className="stack">
      <Fragment index={2} effect="fade-out">
        {render('original')}
      </Fragment>
      <Fragment index={2} effect="fade-in-then-out">
        {render('mono')}
      </Fragment>
      <Fragment index={3} effect="fade-in-then-out">
        {render('sepia')}
      </Fragment>
      <Fragment index={4}>{render('invert')}</Fragment>
    </div>
  );
}

/**
 * Photo filters (the motivation): a small photo editor, the photo of Memorial Church and its strip
 * of filters (Original, Mono, Sepia, Invert), which a click applies, with no text (the demo asks the
 * question). Key press 1: the photo zooms into the cross on its top: the block grows out of a
 * square on the photo, its pixels magnified; a color photo is many pixels, each a 3-vector, and one
 * pixel of sky as x = (R, G, B); a click on the block picks another pixel as x, and a click on the
 * photo zooms there instead. 2–4: photo filters are functions on these 3-vectors (with 2); the
 * editor and the block switch to Mono, Sepia, Invert, each with its line: Mono is a linear function
 * ℝ³ → ℝ, Sepia a linear function ℝ³ → ℝ³, Invert an affine one, the next slide's two words (the
 * user's: a recall, stated rather than explained), and the pixel x ↦ that pixel through the
 * filter, as two colored boxes (no numbers). Print mode shows each step with stacked copies, at the
 * cross.
 */
export default function Slide01aFilters() {
  const [selected, setSelected] = useState('original');
  const m2 = useRef(null);
  const m3 = useRef(null);
  const m4 = useRef(null);
  const s2 = useFragmentShown(m2);
  const s3 = useFragmentShown(m3);
  const s4 = useFragmentShown(m4);
  const step = s4 ? 4 : s3 ? 3 : s2 ? 2 : 0;
  useEffect(() => {
    setSelected(STEP_FILTER[step]);
  }, [step]);

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

  const editor = PRINT ? (
    <PerStep render={(id) => <PhotoEditor prefix={P} selected={id} onSelect={() => {}} />} />
  ) : (
    <PhotoEditor prefix={P} selected={selected} onSelect={setSelected} onPixel={zoomTo} />
  );
  const block = PRINT ? (
    <PerStep render={(id) => <PixelBlock id={id} pixels={CROSS_PIXELS} pick={START_PICK} />} />
  ) : (
    <PixelBlock id={selected} pixels={pixels} pick={pick} onPick={setPick} />
  );

  return (
    <section>
      <h2>Photo filters</h2>
      <FilterDefs prefix={P} />
      {[m2, m3, m4].map((m, k) => (
        <span key={k} ref={m} className="fragment fx-marker" data-fragment-index={k + 2} aria-hidden="true" />
      ))}

      <div className="stage l13-filters-stage" style={{ gap: GAP, '--editor-w': `${EDITOR_W}px`, '--bar-h': `${BAR_H}px` }}>
        {editor}

        <div className="stage-text l13-pixel-side">
          <Fragment index={1} as="p" className="l13-after-zoom l13-pixel-sentence" style={{ height: SENTENCE_H }}>
            A color photo consists of many pixels; each pixel is a 3‑vector:
          </Fragment>
          <div className="l13-pixel-row">
            <Fragment
              index={1}
              className="l13-grow"
              style={{ '--from': `translate(${SQUARE.x - BLOCK.x}px, ${SQUARE.y - BLOCK.y}px) scale(${SQUARE.w / BLOCK.w})` }}
            >
              {block}
            </Fragment>
            <Fragment index={1} className="l13-after-zoom l13-pixel-vec">
              <Tex
                tex={r`\vv x=\begin{bmatrix}\textcolor{#c0262d}{R}\\ \textcolor{#2e7d4f}{G}\\ \textcolor{#1d4ed8}{B}\end{bmatrix}=\begin{bmatrix}${X.join('\\\\ ')}\end{bmatrix}`}
              />
              <Swatch c={X} />
            </Fragment>
          </div>

          <div className="l13-filter-rows">
            <Fragment index={2} as="p" className="l13-filters-lead">
              Photo filters are functions on these 3‑vectors:
            </Fragment>
            {ROWS.map((row) => (
              <Fragment key={row.id} index={row.index} as="p" className="l13-filter-row">
                <span className="l13-filter-says">
                  {byId[row.id].name} is {row.kind === 'affine' ? 'an' : 'a'} <strong>{row.kind}</strong> function <Tex tex={row.sig} />:
                </span>
                {/* the pixel x, and the same pixel through the filter, without their numbers */}
                <Swatch c={X} />
                <Tex tex={r`\mapsto`} />
                <Swatch c={through(row.id, X)} />
              </Fragment>
            ))}
          </div>
        </div>

        {/* the square on the photo and its two lines to the block, after the block has grown */}
        <svg className="l13-zoom-lines" width={BLOCK.x + BLOCK.w} height={BLOCK.y + BLOCK.h} aria-hidden="true">
          <Fragment as="g" index={1} className="l13-after-zoom">
            <rect x={SQUARE.x} y={SQUARE.y} width={SQUARE.w} height={SQUARE.h} fill="none" stroke={ACCENT} strokeWidth="2" />
            <line x1={SQUARE.x + SQUARE.w} y1={SQUARE.y} x2={BLOCK.x} y2={BLOCK.y} stroke={ACCENT} strokeWidth="1.5" />
            <line x1={SQUARE.x + SQUARE.w} y1={SQUARE.y + SQUARE.h} x2={BLOCK.x} y2={BLOCK.y + BLOCK.h} stroke={ACCENT} strokeWidth="1.5" />
          </Fragment>
        </svg>
      </div>

      <Notes time="3:00 · running total 3:30">
        <p>
          Have you ever played around with these photo filters, such as "Mono", which converts a photo to gray-scale,
          and "Sepia", which adds a warm, vintage feel, like an old photograph? <em>[click Mono, Sepia, Invert, then
          Original]</em> How does the editor do it, to a million pixels at once?
        </p>
        <p>
          <em>[Key press]</em> Zoom in on the cross on top of Memorial Church. A color photo is a grid of pixels, and
          each pixel is three numbers: how much red, green and blue, each from 0 to 255. So each pixel is a 3-vector x =
          (R, G, B). <em>[click a pixel in the block to make it x; a click on the photo zooms in there]</em>
        </p>
        <p>
          <em>[Key press]</em> A filter does the same thing to every pixel: it takes the pixel's color and returns a new
          one. So photo filters are functions on these 3-vectors. Mono returns one number, the gray level 0.2126R +
          0.7152G + 0.0722B, a weighted average (green counts most: our eyes are most sensitive to green). That is a
          linear function ℝ³ → ℝ.
        </p>
        <p>
          <em>[Key press]</em> Sepia returns a color, three numbers, each a combination of R, G and B: a linear function
          ℝ³ → ℝ³.
        </p>
        <p>
          <em>[Key press]</em> Invert returns (255 − R, 255 − G, 255 − B): black becomes white. The constant 255 makes
          it affine rather than linear. Linear and affine are today's first two words; the next slide makes them
          precise.
        </p>
      </Notes>
    </section>
  );
}
