import { useMemo } from 'react';
import { levelSegments, segmentsPath } from './levels.js';
import { levelGrid, reliefUrl } from './terrain.js';

const BROWN = '#7a5a3a';

/**
 * A map of an elevation grid (terrain.js): the shaded relief, its level curves every `step`
 * metres (every `index`-th one thicker, as on a topographic map), the curves of `highlight`
 * ([{ c, color, width }]) on top, then `children(p)`, with p.px(i), p.py(j) mapping pixels of the
 * grid to the picture and p.k its scale (picture pixels per grid pixel). `relief` goes to
 * reliefUrl (lo, hi, tints, relief, below). `svgProps` go to the <svg> (pointer handlers).
 * `crop`: [i0, j0, i1, j1], the part of the grid to show (all of it by default). `rotate`: true turns
 * the map a quarter turn clockwise (north to the right), `width` still the picture's width; then
 * p.pt([i, j]) gives a grid pixel's point on the picture (px, py are those of the unturned map).
 */
export default function TerrainMap({
  t,
  width,
  step = 50,
  index = 5,
  relief,
  highlight = [],
  contour = BROWN,
  title = 'A map',
  className = '',
  svgProps = {},
  crop,
  rotate = false,
  children,
}) {
  const { W, H } = t;
  const [i0, j0, i1, j1] = crop ?? [0, 0, W, H];
  const k = width / (rotate ? j1 - j0 : i1 - i0);
  const [uw, uh] = [(i1 - i0) * k, (j1 - j0) * k]; // the unturned map's size
  const [sw, sh] = rotate ? [uh, uw] : [uw, uh]; // the picture's
  const px = (i) => (i + 0.5 - i0) * k;
  const py = (j) => (j + 0.5 - j0) * k;
  const pt = ([i, j]) => (rotate ? [uh - py(j), px(i)] : [px(i), py(j)]);
  const p = { px, py, pt, k, W: sw, H: sh };
  const url = useMemo(() => reliefUrl(t, relief), [t, relief]);

  const lines = useMemo(() => {
    const g = levelGrid(t);
    let lo = Infinity;
    let hi = -Infinity;
    for (const e of t.E) {
      if (e < lo) lo = e;
      if (e > hi) hi = e;
    }
    const map = ([x, y]) => [px(x), py(y)];
    const out = { thin: '', thick: '' };
    for (let c = Math.ceil(lo / step) * step; c <= hi; c += step) {
      out[Math.round(c / step) % index === 0 ? 'thick' : 'thin'] += segmentsPath(levelSegments(g, c), map);
    }
    return out;
  }, [t, step, index, k, i0, j0]); // px, py follow from k, i0, j0

  const hl = useMemo(() => {
    const g = levelGrid(t);
    const map = ([x, y]) => [px(x), py(y)];
    return highlight.map((h) => ({ ...h, d: segmentsPath(levelSegments(g, h.c), map) }));
  }, [t, highlight, k, i0, j0]);

  return (
    <svg
      className={`figure-svg terrain-map ${className}`.trim()}
      viewBox={`0 0 ${sw} ${sh}`}
      width={sw}
      height={sh}
      role="img"
      aria-label={title}
      {...svgProps}
    >
      <g transform={rotate ? `translate(${uh} 0) rotate(90)` : undefined}>
        <image href={url} x={-i0 * k} y={-j0 * k} width={W * k} height={H * k} preserveAspectRatio="none" />
        <g fill="none" stroke={contour} strokeLinecap="round" strokeLinejoin="round">
          <path d={lines.thin} strokeWidth="0.6" strokeOpacity="0.45" />
          <path d={lines.thick} strokeWidth="1.2" strokeOpacity="0.7" />
        </g>
        {hl.map((h) => (
          <path key={h.c} d={h.d} fill="none" stroke={h.color} strokeWidth={h.width ?? 2.5} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </g>
      <rect x="0.5" y="0.5" width={sw - 1} height={sh - 1} fill="none" stroke="#9ca3af" strokeWidth="1" />
      {typeof children === 'function' ? children(p) : children}
    </svg>
  );
}
