import { useMemo } from 'react';
import ContourPlot from '../../lectures/l26/components/ContourPlot.jsx';

/*
 * What the pictures of the story Contour plots of ax² + by² (../contour-ab.jsx) share: the colours,
 * numbers as text, the contour plot of ax² + by², and the activities' ticks and pointer.
 */

export const CURVE = '#5f6b7a'; // the level sets (DiagCard.jsx's)
export const GRAY = '#9ca3af'; // the asymptotes, dotted
export const RED = '#8c1515'; // the level set of the slider, and the vertices
export const INK = '#14213d'; // the semi-axes
export const LEVELS = [0.4, 1.2, 2.4, 4, 6].flatMap((c) => [c, -c]); // DiagCard.jsx's
export const R = [-2, 2]; // the window, [−2, 2]², as on the slide

const round = (v, d) => {
  const t = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);
  const s = t.includes('.') ? t.replace(/\.?0+$/, '') : t;
  return s === '-0' ? '0' : s;
};

/** A number in TeX, to at most `d` decimal places. */
export const texNum = (v, d = 2) => round(v, d);

/** A number as text, to at most `d` decimal places, with a minus sign (not a hyphen). */
export const num = (v, d = 2) => round(v, d).replace('-', '−');

/** ax² + by² in TeX with the numbers in: a zero term left out, a coefficient ±1 shown as a sign. */
export function formula(a, b) {
  const terms = [
    [a, 'x^2'],
    [b, 'y^2'],
  ].filter(([k]) => texNum(k) !== '0');
  if (!terms.length) return '0';
  return terms
    .map(([k, v], i) => {
      const m = texNum(Math.abs(k));
      return `${k < 0 ? '-' : i ? '+' : ''}${m === '1' ? '' : m}${v}`;
    })
    .join('');
}

/** The same as plain text (x² + 4y²), for a screen reader. */
export const formulaText = (a, b) =>
  formula(a, b)
    .replace(/\^2/g, '²')
    .replace(/([+-])/g, ' $1 ')
    .replace(/^ - /, '−')
    .replace(/ - /g, ' − ')
    .trim();

/** x and y at the ends of the axes of a contour plot over [−end, end]² (R² by default), on a white halo (DiagCard.jsx's). */
export function AxisNames({ p, x = 'x', y = 'y', size = 21, end = R[1] }) {
  return (
    <g fill="#374151" fontSize={size} fontStyle="italic" fontFamily="KaTeX_Math, KaTeX_Main, Georgia, serif" stroke="#fff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
      <text x={p.px(end) - 5} y={p.py(0) - 0.3 * size} textAnchor="end">
        {x}
      </text>
      <text x={p.px(0) + 0.3 * size} y={p.py(end) + 0.8 * size} textAnchor="start">
        {y}
      </text>
    </g>
  );
}

/**
 * The contour plot of ax² + by² over [−2, 2]², with the axes (DiagCard.jsx, drawn again here to take
 * a highlighted level and more drawing): the levels ±0.4, ±1.2, ±2.4, ±4, ±6, and when a and b have
 * opposite signs the level set 0, the two asymptotes y = ±√|a/b| x, dotted. `highlight`: a level in
 * red, the others then faint. `children(p)`: more drawing. `title`: what a screen reader calls it (the
 * formula by default); `nameSize`: the size of x and y.
 */
export function AbPlot({ a, b, size = 270, highlight, title, nameSize = 21, children }) {
  const f = useMemo(() => (x, y) => a * x * x + b * y * y, [a, b]);
  const opposite = a * b < 0;
  const m = opposite ? Math.sqrt(Math.abs(a / b)) : 0;
  return (
    <ContourPlot
      f={f}
      x={R}
      y={R}
      size={size}
      n={90}
      levels={LEVELS}
      color={() => (highlight === undefined ? CURVE : '#b4bbc5')}
      width={highlight === undefined ? 1.4 : 1.25}
      highlight={highlight}
      highlightColor={RED}
      axes
      title={title ?? `The contour plot of ${formulaText(a, b)}`}
    >
      {(p) => (
        <g>
          {opposite ? (
            <g stroke={GRAY} strokeWidth="1.6" strokeDasharray="0.1 5" strokeLinecap="round">
              {[m, -m].map((k) => {
                const x1 = Math.min(2, 2 / Math.abs(k));
                return <line key={k} x1={p.px(-x1)} y1={p.py(-k * x1)} x2={p.px(x1)} y2={p.py(k * x1)} />;
              })}
            </g>
          ) : null}
          {children?.(p)}
          <AxisNames p={p} size={nameSize} />
        </g>
      )}
    </ContourPlot>
  );
}

/** Ticks on the axes of a plot at `ticks`, the whole numbers among them labelled (the activities'). */
export function Ticks({ p, ticks }) {
  const [ox, oy] = [p.px(0), p.py(0)];
  const label = (t) => String(t).replace('-', '−');
  return (
    <g>
      <g stroke="#9ca3af" strokeWidth="1.2">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={p.px(t)} y1={oy - 4} x2={p.px(t)} y2={oy + 4} />
            <line x1={ox - 4} y1={p.py(t)} x2={ox + 4} y2={p.py(t)} />
          </g>
        ))}
      </g>
      <g fill="#6b7280" fontSize="12" fontFamily="KaTeX_Main, Georgia, serif">
        {ticks.filter(Number.isInteger).map((t) => (
          <g key={t}>
            <text x={p.px(t)} y={oy + 17} textAnchor="middle">
              {label(t)}
            </text>
            <text x={ox - 8} y={p.py(t) + 4} textAnchor="end">
              {label(t)}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

/** The point [x, y] of the plane under a pointer event, in a plot (p: its px, py) that draws `el`. */
export function planePoint(e, el, p) {
  const svg = el.ownerSVGElement;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [(q.x - p.px(0)) / (p.px(1) - p.px(0)), (q.y - p.py(0)) / (p.py(1) - p.py(0))];
}
