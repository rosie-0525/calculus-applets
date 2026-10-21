import { useState } from 'react';
import '../lectures/l13/styles/deck.css';
import Tex, { r } from '../lectures/l13/components/Tex.jsx';
import Matrix, { Vec } from '../lectures/l13/components/Matrix.jsx';
import { FilterDefs, Filtered, CREDIT, usePhotoPixels, pixelAt } from '../lectures/l13/components/PhotoEditor.jsx';
import { SEPIA, apply } from '../lectures/l13/components/filters.js';
import {
  P,
  W,
  H,
  START,
  START_COLOR,
  NAMES,
  INK,
  hex,
  unhex,
  rgb,
  columnsOf,
  dark,
  fromColumns,
  Swatch,
  MapArrow,
} from '../lectures/l13/slides/Slide09bFiltersExplained.jsx';

export const lecture = 13;

/*
 * Back to Photo filters with every step showing, without its title: the photo and the photo through
 * Sepia, one over the other, the arrow f down between them, and the ring, which the mouse drags
 * across either photo; beside them, f's matrix-vector product with the colors' squares, each column
 * of the matrix in the color it stands for (what pure red, green, blue becomes), the product by
 * columns, and the box Make your own filter, whose squares are color pickers: a click on one sets
 * that column, a filter of one's own ("Back to Sepia" brings Sepia back). The slide's component,
 * less its key presses.
 */
export default function OwnFilter() {
  const [cols, setCols] = useState(() => columnsOf(SEPIA));
  const [mine, setMine] = useState(false);
  const [at, setAt] = useState(START);
  const [color, setColor] = useState(START_COLOR);
  const pixels = usePhotoPixels(); // to read the color under the ring
  const A = mine ? fromColumns(cols) : SEPIA;

  const probe = (e) => {
    if (!(e.buttons & 1) && e.type !== 'pointerdown') return;
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
  // each column's entries in white over a dark column color
  const onDark = (j) => (dark(cols[j]) ? 'l13-on-dark' : undefined);
  const entries = A.map((row) => row.map((v, j) => ({ tex: n(v), className: onDark(j) })));
  const fill = (j) => ({ background: rgb(cols[j].map((v) => 255 * v)) }); // column j's color
  const rgbVec = color.map((v, i) => r`\textcolor{${INK[i]}}{${v}}`);
  const ring = <span className="l13-probe" style={{ left: `${(100 * at[0]) / W}%`, top: `${(100 * at[1]) / H}%` }} />;

  return (
    <div className="l13-fx-back">
      <FilterDefs prefix={P} extra={[{ id: 'mine', A: fromColumns(cols) }]} />

      <div className="l13-fx-back-grid">
        <div className="l13-fx-pair l13-fx-stack">
          <figure>
            <div className="l13-fx-photo" onPointerDown={probe} onPointerMove={probe}>
              <Filtered prefix={P} id="original" />
              {ring}
            </div>
            <figcaption>
              <span>Original</span>
            </figcaption>
          </figure>
          <MapArrow down />
          <figure>
            <div className="l13-fx-photo" onPointerDown={probe} onPointerMove={probe}>
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
                bands={[0, 1, 2].map((j) => ({ col: j, tone: `c${j + 1}`, style: fill(j) }))}
                labels={[0, 1, 2].map((j) => ({ col: j, tone: 'pick', text: <Swatch c={cols[j].map((v) => 255 * v)} /> }))}
              />
              <Vec entries={rgbVec} />
              <Tex tex="=" />
              <span className="l13-fx-under">
                <Vec entries={out.map((v) => v.toFixed(1))} />
                <Swatch c={out} />
              </span>
            </div>
            <div className="l13-fx-bottom">
              <div className="l13-fx-cols">
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
              </div>
              {/* what f turns pure red, green and blue into: the columns' colors, each a color picker */}
              <div className="l13-fx-own">
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
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="l13-fx-note">Values above 255 are shown as 255.</p>
          <p className="l13-credit l13-credit-corner">{CREDIT}</p>
        </div>
      </div>
    </div>
  );
}
