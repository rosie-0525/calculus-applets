import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Matrix, { Vec } from '../components/Matrix.jsx';
import { FilterDefs, Filtered, CREDIT, usePhotoPixels, pixelAt } from '../components/PhotoEditor.jsx';
import { SEPIA, apply } from '../components/filters.js';
import { PRINT } from '../components/print.js';
import Notes from '../components/Notes.jsx';

export const P = 'l13-fb'; // the ids of this slide's SVG filters
export const W = 720; // the photo's pixels
export const H = 420;
// the probe starts in the sky, at this pixel, whose color (read with PIL from memchu.jpg) is shown
// until the photo is decoded (and in print mode); shared with Photo filters as linear functions
export const START = [90, 50];
export const START_COLOR = [98, 145, 191];
// the names of a color's entries and their inks, shared with Photo filters as linear functions
export const NAMES = ['red', 'green', 'blue'];
export const INK = ['#c0262d', '#2e7d4f', '#1d4ed8'];

export const hex = (c) => `#${c.map((v) => Math.round(255 * v).toString(16).padStart(2, '0')).join('')}`;
export const unhex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) / 255);
export const rgb = (c) => `rgb(${c.map((v) => Math.max(0, Math.min(255, Math.round(v)))).join(',')})`;
export const columnsOf = (A) => [0, 1, 2].map((j) => A.map((row) => row[j]));
export const dark = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 0.45; // a color (0–1) white text shows on
export const fromColumns = (cols) => [0, 1, 2].map((i) => cols.map((c) => c[i]));

/** A small square of the color c (0–255). */
export function Swatch({ c }) {
  return <span className="l13-swatch" style={{ background: rgb(c) }} />;
}

/** The arrow f from the photo to its filtered copy, as on Linear and affine functions (`down`: down, f on its right). */
export function MapArrow({ down = false }) {
  if (down)
    return (
      <svg className="l13-fx-arrow down" width="60" height="46" viewBox="0 0 60 46" aria-hidden="true">
        <line x1="30" y1="4" x2="30" y2="32" stroke="#14213d" strokeWidth="2.6" />
        <polygon points="30,42 24,30 36,30" fill="#14213d" />
        <text x="43" y="29" fontFamily="KaTeX_Math, 'Times New Roman', serif" fontStyle="italic" fontSize="26" fill="#14213d">
          f
        </text>
      </svg>
    );
  return (
    <svg className="l13-fx-arrow" width="84" height="54" viewBox="0 0 84 54" aria-hidden="true">
      <line x1="6" y1="36" x2="68" y2="36" stroke="#14213d" strokeWidth="2.6" />
      <polygon points="78,36 66,30 66,42" fill="#14213d" />
      <text x="40" y="24" textAnchor="middle" fontFamily="KaTeX_Math, 'Times New Roman', serif" fontStyle="italic" fontSize="26" fill="#14213d">
        f
      </text>
    </svg>
  );
}

/**
 * Back to Photo filters (right after The columns of A; Invert left out: the slide is about Sepia):
 * Photo filters as linear functions again, all of it shown from the start, laid out anew (at the
 * user's request, for room): the photos one over the other on the left, an arrow f down between
 * them, the ring, which the mouse drags across either photo; on the right, in the panel, f's
 * matrix-vector product with the colors' squares. Key press 1: each of the matrix's columns in the color it stands for,
 * the color that pure red, green, blue becomes (its entries in white if it is dark), a square under
 * each (why, column j = Aeⱼ, is left to the lecture; removed at the user's request). Key press 2:
 * the product's second line, by columns, = red × the first column + green × the second + blue ×
 * the third, each column on its color (the sentence before it, and the panel's box, removed at the
 * user's request). Key press 3: to its right, a box, Make your own filter: red ↦ its square,
 * green ↦ its square, blue ↦ its square, one under the other; these squares are color pickers
 * (those under the columns are not): a click on one sets that column, a filter of one's own (the
 * matrix, the right photo, its caption and the product follow; the "Back to Sepia" button by the
 * caption brings Sepia back). The math is flush left, the box, the note and the credit flush
 * right. Under the panel, in gray: values above 255 are shown as 255 (always there,
 * over the credit). Print mode shows Sepia, the ring in the sky.
 */
export default function Slide09bFiltersExplained() {
  const [cols, setCols] = useState(() => columnsOf(SEPIA));
  const [mine, setMine] = useState(false);
  const [at, setAt] = useState(START);
  const [color, setColor] = useState(START_COLOR);
  const pixels = usePhotoPixels(); // to read the color under the ring
  const A = mine ? fromColumns(cols) : SEPIA;

  const probe = (e) => {
    if (PRINT || (!(e.buttons & 1) && e.type !== 'pointerdown')) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(W - 1, Math.round(((e.clientX - box.left) / box.width) * W)));
    const y = Math.max(0, Math.min(H - 1, Math.round(((e.clientY - box.top) / box.height) * H)));
    setAt([x, y]);
    if (pixels) setColor(pixelAt(pixels, x, y));
  };
  const pick = (j, value) => {
    const next = cols.slice();
    next[j] = unhex(value);
    setCols(next);
    setMine(true);
  };

  const out = apply(A, color);
  const n = (v) => (mine ? v.toFixed(2) : String(v));
  // each column's entries in white over a dark column color (once the colors come)
  const onDark = (j) => (dark(cols[j]) ? 'l13-on-dark' : undefined);
  const entries = A.map((row) => row.map((v, j) => ({ tex: n(v), className: onDark(j) })));
  const fill = (j) => ({ background: rgb(cols[j].map((v) => 255 * v)) }); // column j's color
  const rgbVec = color.map((v, i) => r`\textcolor{${INK[i]}}{${v}}`);
  const ring = <span className="l13-probe" style={{ left: `${(100 * at[0]) / W}%`, top: `${(100 * at[1]) / H}%` }} />;

  return (
    <section className="dense l13-fx-back">
      <h2>Back to Photo filters</h2>
      <FilterDefs prefix={P} extra={[{ id: 'mine', A: fromColumns(cols) }]} />

      <div className="l13-fx-back-grid">
        <div className="l13-fx-pair l13-fx-stack">
          <figure>
            <div className="l13-fx-photo" onPointerDown={probe} onPointerMove={probe} data-prevent-swipe>
              <Filtered prefix={P} id="original" />
              {ring}
            </div>
            <figcaption>
              <span>Original</span>
            </figcaption>
          </figure>
          <MapArrow down />
          <figure>
            <div className="l13-fx-photo" onPointerDown={probe} onPointerMove={probe} data-prevent-swipe>
              <Filtered prefix={P} id={mine ? 'mine' : 'sepia'} alt="Stanford Memorial Church, through the filter" />
              {ring}
            </div>
            <figcaption>
              <span>{mine ? 'Your filter' : 'Sepia'}</span>
              {mine && (
                <button
                  type="button"
                  className="l13-fx-reset"
                  title="Back to the Sepia filter"
                  onClick={() => {
                    setCols(columnsOf(SEPIA));
                    setMine(false);
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Back to Sepia
                </button>
              )}
            </figcaption>
          </figure>
        </div>

        <div className="l13-fx-back-side">
          <div className="l13-fx-panel">
            <p>
              <Tex tex="f" /> maps each pixel to a matrix-vector product:
            </p>
            <div className="l13-display">
              <span className="l13-fx-under">
                <Vec entries={rgbVec} />
                <Swatch c={color} />
              </span>
              <Tex tex={r`\mapsto`} />
              <Matrix
                rows={entries}
                bands={[0, 1, 2].map((j) => ({ col: j, tone: `c${j + 1}`, index: 1, style: fill(j) }))}
                labels={[0, 1, 2].map((j) => ({ col: j, index: 1, tone: 'pick', text: <Swatch c={cols[j].map((v) => 255 * v)} /> }))}
              />
              <Vec entries={rgbVec} />
              <Tex tex="=" />
              <span className="l13-fx-under">
                <Vec entries={out.map((v) => v.toFixed(1))} />
                <Swatch c={out} />
              </span>
            </div>
            <div className="l13-fx-bottom">
              <Fragment index={2} className="l13-fx-cols">
                <div className="l13-display">
                  <Tex tex="=" />
                  {[0, 1, 2].map((j) => (
                    <span key={j} className="l13-fx-term">
                      {j > 0 && <Tex tex="+" />}
                      <Tex tex={rgbVec[j]} />
                      <Vec entries={A.map((row) => ({ tex: n(row[j]), className: onDark(j) }))} bands={[{ col: 0, tone: `c${j + 1}`, style: fill(j) }]} />
                    </span>
                  ))}
                </div>
              </Fragment>
              {/* what f turns pure red, green and blue into: the columns' colors, each a color picker */}
              <Fragment index={3} className="l13-fx-own">
                <div className="l13-fx-own-title">Make your own filter</div>
                <div className="l13-fx-turns">
                  {[0, 1, 2].map((j) => (
                    <span key={j} className="l13-fx-turn">
                      <span className="l13-ink" style={{ color: INK[j] }}>
                        {NAMES[j]}
                      </span>
                      <Tex tex={r`\mapsto`} />
                      <input
                        type="color"
                        className="l13-colpick"
                        value={hex(cols[j])}
                        title={`The color that pure ${NAMES[j]} becomes: click to choose another`}
                        aria-label={`The color that pure ${NAMES[j]} becomes`}
                        onChange={(e) => pick(j, e.target.value)}
                        data-prevent-swipe
                      />
                    </span>
                  ))}
                </div>
              </Fragment>
            </div>
          </div>
          <p className="l13-fx-note">Values above 255 are shown as 255.</p>
          <p className="l13-credit l13-credit-corner">{CREDIT}</p>
        </div>
      </div>

      <Notes time="2:30 · running total 29:30">
        <p>
          Back to Sepia, with the columns in mind: its columns are what Sepia does to pure red, pure green and pure
          blue.
        </p>
        <p>
          <em>[Key press]</em> Here they are, each column in the color it stands for: red becomes a dark brown, green a
          light tan, blue a very dark brown. The three are nearly the same hue, so whatever you mix from them is a shade
          of brown: that is sepia.
        </p>
        <p>
          <em>[Key press]</em> By columns: the new color is R times the first column, plus G times the second, plus B
          times the third. Mix the three browns in the amounts R, G, B. <em>[drag the ring]</em>
        </p>
        <p>
          <em>[Key press]</em> So a filter comes down to three choices: what red, green and blue become. Make your own:
          click a square to pick its color. <em>[e.g. red ↦ pure blue and blue ↦ pure red: the sky turns orange; Back to
          Sepia undoes it]</em>
        </p>
      </Notes>
    </section>
  );
}
