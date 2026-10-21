import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Matrix, { Vec } from '../components/Matrix.jsx';
import { FilterDefs, Filtered, CREDIT, usePhotoPixels, pixelAt, photoPixel, PHOTO_W, PHOTO_H } from '../components/PhotoEditor.jsx';
import { colorMatrix } from '../components/filters.js';
import { PRINT } from '../components/print.js';
import { MapArrow, INK, START, START_COLOR, Swatch } from './Slide09bFiltersExplained.jsx';
import Notes from '../components/Notes.jsx';

export const P = 'l13-fv'; // the ids of this slide's SVG filters

// Vivid, our own filter: more color, then more contrast. For a color x with entries from 0 to 1,
// f(x) = c(Sx) entry by entry, where S is the W3C's saturate(1.5) matrix and c the S-curve
// (1 − k)t + k(3t² − 2t³) on each entry of Sx cut to [0, 1]; c is steeper than 1 in the middle and
// flatter at the ends, so f is not affine.
export const SAT = 1.5;
export const K = 0.8;
export const LUM = [0.213, 0.715, 0.072];
export const S = [0, 1, 2].map((i) => LUM.map((l, j) => (1 - SAT) * l + (i === j ? SAT : 0)));
export const curve = (t) => (1 - K) * t + K * t * t * (3 - 2 * t);
export const slope = (t) => 1 - K + 6 * K * t * (1 - t);
export const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
// c as an feComponentTransfer table: 256 values, between which the browser interpolates linearly
export const TABLE = Array.from({ length: 256 }, (_, k) => curve(k / 255).toFixed(4)).join(' ');

/** f(x) for a color x (0–255). */
export const vivid = (x) => S.map((row) => 255 * curve(Math.min(1, Math.max(0, dot(row, x) / 255))));
/** (Df)(a): row i is c′ at the i-th entry of Sa times the i-th row of S (0 where that entry is cut). */
export const derivative = (a) =>
  S.map((row) => {
    const t = dot(row, a) / 255;
    const d = t > 0 && t < 1 ? slope(t) : 0;
    return row.map((v) => d * v);
  });
export const fmt = (v) => (Math.abs(v) < 0.005 ? '0' : v.toFixed(2));

/**
 * Nonlinear photo filters (after Example 5; the end of the photo-filter story, at the user's
 * request): the photo, an arrow f, the photo through Vivid (above), side by side; under
 * them, f: ℝ³ → ℝ³ is not affine. Key press 1: the ring round a pixel, labelled a, which the mouse
 * drags across any of the photos (the same pixel on all), and "For colors x near a:" f(x) ≈ f(a) +
 * ((Df)(a))(x − a) = the numbers, the squares of a's and f(a)'s colors under their vectors; 2: ≈
 * and a third photo, the photo through that affine filter, the linear approximation of f at a: it
 * agrees with Vivid on the colors near a (for a in the sky, the sky), not elsewhere. All three are
 * SVG filters (Vivid an feColorMatrix, then c as a table; the approximation an feColorMatrix), so
 * print mode shows them too, the ring in the sky.
 */
export default function Slide13dVivid() {
  const [at, setAt] = useState(START);
  const [a, setA] = useState(START_COLOR);
  const pixels = usePhotoPixels(); // to read the color under the ring

  const probe = (e) => {
    if (PRINT || (!(e.buttons & 1) && e.type !== 'pointerdown')) return;
    const [x, y] = photoPixel(e);
    setAt([x, y]);
    if (pixels) setA(pixelAt(pixels, x, y));
  };

  const fa = vivid(a);
  const J = derivative(a);
  // the linear approximation x ↦ f(a) + J(x − a) = Jx + (f(a) − Ja), for colors from 0 to 1
  const approx = { id: 'approx', A: J, b: [0, 1, 2].map((i) => (fa[i] - dot(J[i], a)) / 255) };
  const rgbVec = a.map((v, i) => r`\textcolor{${INK[i]}}{${v}}`);

  // the fragment's class stays the same: React rewriting it would drop reveal's `visible` and hide
  // the ring, so the label's flip (to the ring's left, near the photo's right edge) is on the label
  const ring = (
    <Fragment index={1} as="span" className="l13-fv-ring" style={{ left: `${(100 * at[0]) / PHOTO_W}%`, top: `${(100 * at[1]) / PHOTO_H}%` }}>
      <span className="l13-probe" />
      <span className={`l13-fv-a${at[0] > 0.85 * PHOTO_W ? ' flip' : ''}`}>
        <Tex tex={r`\vv a`} />
      </span>
    </Fragment>
  );
  const photo = (id, alt) => (
    <div className="l13-fx-photo" onPointerDown={probe} onPointerMove={probe} data-prevent-swipe>
      <Filtered prefix={P} id={id} alt={alt} />
      {ring}
    </div>
  );

  return (
    <section className="dense l13-fv">
      <h2>Nonlinear photo filters</h2>
      <FilterDefs prefix={P} extra={[approx]} />
      <svg width="0" height="0" className="l13-filter-defs" aria-hidden="true">
        <defs>
          <filter id={`${P}-vivid`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={colorMatrix(S)} />
            <feComponentTransfer>
              <feFuncR type="table" tableValues={TABLE} />
              <feFuncG type="table" tableValues={TABLE} />
              <feFuncB type="table" tableValues={TABLE} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <div className="l13-fx-pair">
        <figure>
          {photo('original')}
          <figcaption>
            <span>Original</span>
          </figcaption>
        </figure>
        <MapArrow />
        <figure>
          {photo('vivid', 'Stanford Memorial Church, through Vivid')}
          <figcaption>
            <span>Vivid</span>
          </figcaption>
        </figure>
        <Fragment index={2} as="span" className="l13-fv-approx">
          <Tex tex={r`\approx`} />
        </Fragment>
        <Fragment index={2} as="figure">
          {photo('approx', 'Stanford Memorial Church, through the linear approximation of Vivid')}
          <figcaption>
            <span>
              Linear approximation of <Tex tex="f" /> at <Tex tex={r`\vv a`} />
            </span>
          </figcaption>
        </Fragment>
      </div>

      <div className="l13-fv-math">
        <p>
          <Tex tex={r`f:\mathbb R^3\to\mathbb R^3`} /> is not affine.{' '}
          <Fragment index={1} as="span">
            For colors <Tex tex={r`\vv x`} /> near <Tex tex={r`\vv a`} />:
          </Fragment>
        </p>
        <Fragment index={1} className="l13-display">
          <Tex tex={r`f(\vv x)\approx f(\vv a)+\big((Df)(\vv a)\big)(\vv x-\vv a)=`} />
          <span className="l13-fx-under">
            <Vec entries={fa.map((v) => v.toFixed(1))} />
            <Swatch c={fa} />
          </span>
          <Tex tex="+" />
          <Matrix rows={J.map((row) => row.map(fmt))} />
          <Tex tex={r`\Bigg(\vv x-{}`} />
          <span className="l13-fx-under">
            <Vec entries={rgbVec} />
            <Swatch c={a} />
          </span>
          <Tex tex={r`\Bigg)`} />
        </Fragment>
      </div>
      <p className="l13-credit l13-credit-corner">{CREDIT}</p>

      <Notes time="2:00 · running total 44:00">
        <p>
          One last filter, Vivid: more color, then more contrast, darks darker and brights brighter. The contrast curve
          bends, so Vivid is not affine: no Ax + b gives it.
        </p>
        <p>
          <em>[Key press]</em> But near any one color a it is nearly affine: its linear approximation f(a) + (Df)(a)(x −
          a). Here a is a pixel of sky; the numbers follow the ring. <em>[drag the ring]</em>
        </p>
        <p>
          <em>[Key press]</em> That affine filter on the whole photo: right on the sky, whose colors are near a, and
          wrong elsewhere. <em>[drag the ring onto the stone: now the stone is right and the sky is off]</em> No single
          matrix gives Vivid, but near each color one does.
        </p>
      </Notes>
    </section>
  );
}
