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
 * `crop`: [i0, j0, i1, j1], the part of the grid to show (all of it by default).
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
  children,
}) {
  const { W, H } = t;
  const [i0, j0, i1, j1] = crop ?? [0, 0, W, H];
  const k = width / (i1 - i0);
  const height = (j1 - j0) * k;
  const px = (i) => (i + 0.5 - i0) * k;
  const py = (j) => (j + 0.5 - j0) * k;
  const p = { px, py, k, W: width, H: height };
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
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={title}
      {...svgProps}
    >
      <image href={url} x={-i0 * k} y={-j0 * k} width={W * k} height={H * k} preserveAspectRatio="none" />
      <g fill="none" stroke={contour} strokeLinecap="round" strokeLinejoin="round">
        <path d={lines.thin} strokeWidth="0.6" strokeOpacity="0.45" />
        <path d={lines.thick} strokeWidth="1.2" strokeOpacity="0.7" />
      </g>
      {hl.map((h) => (
        <path key={h.c} d={h.d} fill="none" stroke={h.color} strokeWidth={h.width ?? 2.5} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <rect x="0.5" y="0.5" width={width - 1} height={height - 1} fill="none" stroke="#9ca3af" strokeWidth="1" />
      {typeof children === 'function' ? children(p) : children}
    </svg>
  );
}
