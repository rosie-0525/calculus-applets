import { useState } from 'react';
import '../lectures/l13/styles/deck.css';
import Tex, { r } from '../lectures/l13/components/Tex.jsx';
import Matrix, { Vec } from '../lectures/l13/components/Matrix.jsx';
import { FilterDefs, Filtered, CREDIT, usePhotoPixels, pixelAt, photoPixel, PHOTO_W, PHOTO_H } from '../lectures/l13/components/PhotoEditor.jsx';
import { colorMatrix } from '../lectures/l13/components/filters.js';
import { MapArrow, INK, START, START_COLOR, Swatch } from '../lectures/l13/slides/Slide09bFiltersExplained.jsx';
import { P, S, TABLE, vivid, derivative, dot, fmt } from '../lectures/l13/slides/Slide13dVivid.jsx';

export const lecture = 13;

/*
 * Nonlinear photo filters with every step showing, without its title: the photo, an arrow f, the
 * photo through Vivid, ≈ the photo through its linear approximation at a, the color of the pixel in
 * the ring, which the mouse drags across any of the photos (the same pixel on all); under them,
 * f(x) ≈ f(a) + ((Df)(a))(x − a) in numbers, with the squares of a's and f(a)'s colors. The slide's
 * component, less its key presses. In a narrow box the photos are one under the other, the arrow f
 * pointing down, and the approximation wraps after its "=".
 */
export default function Vivid() {
  const [at, setAt] = useState(START);
  const [a, setA] = useState(START_COLOR);
  const pixels = usePhotoPixels(); // to read the color under the ring

  const probe = (e) => {
    if (!(e.buttons & 1) && e.type !== 'pointerdown') return;
    const [x, y] = photoPixel(e);
    setAt([x, y]);
    if (pixels) setA(pixelAt(pixels, x, y));
  };

  const fa = vivid(a);
  const J = derivative(a);
  // the linear approximation x ↦ f(a) + J(x − a) = Jx + (f(a) − Ja), for colors from 0 to 1
  const approx = { id: 'approx', A: J, b: [0, 1, 2].map((i) => (fa[i] - dot(J[i], a)) / 255) };
  const rgbVec = a.map((v, i) => r`\textcolor{${INK[i]}}{${v}}`);

  const ring = (
    <span className="l13-fv-ring" style={{ left: `${(100 * at[0]) / PHOTO_W}%`, top: `${(100 * at[1]) / PHOTO_H}%` }}>
      <span className="l13-probe" />
      <span className={`l13-fv-a${at[0] > 0.85 * PHOTO_W ? ' flip' : ''}`}>
        <Tex tex={r`\vv a`} />
      </span>
    </span>
  );
  const photo = (id, alt) => (
    <div className="l13-fx-photo" onPointerDown={probe} onPointerMove={probe}>
      <Filtered prefix={P} id={id} alt={alt} />
      {ring}
    </div>
  );

  return (
    <div className="l13-fv">
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
        {/* in a narrow box, where the photos are one under the other (see site.css) */}
        <MapArrow down />
        <figure>
          {photo('vivid', 'Stanford Memorial Church, through Vivid')}
          <figcaption>
            <span>Vivid</span>
          </figcaption>
        </figure>
        <span className="l13-fv-approx">
          <Tex tex={r`\approx`} />
        </span>
        <figure>
          {photo('approx', 'Stanford Memorial Church, through the linear approximation of Vivid')}
          <figcaption>
            <span>
              Linear approximation of <Tex tex="f" /> at <Tex tex={r`\vv a`} />
            </span>
          </figcaption>
        </figure>
      </div>

      <div className="l13-fv-math">
        <p>
          <Tex tex={r`f:\mathbb R^3\to\mathbb R^3`} /> is not affine. For colors <Tex tex={r`\vv x`} /> near <Tex tex={r`\vv a`} />:
        </p>
        <div className="l13-display">
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
        </div>
      </div>
      <p className="l13-credit l13-credit-corner">{CREDIT}</p>
    </div>
  );
}
