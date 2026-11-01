import { useRef } from 'react';
import { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { INK, BLUE, AMBER, RED } from './la.js';
import { PRINT } from './print.js';
import { useClock, ease } from './clock.js';

// the lecture's colours: g (applied first) amber, f blue, the composition f ∘ g red
export const G_COLOR = AMBER;
export const F_COLOR = BLUE;
export const FG_COLOR = RED;
export const SOFT = '#6b7280';

/** An arrowhead at `tip`, pointing along `dir` (a polygon, not a marker: see the skill's print pitfalls). */
export function Head({ tip, dir, color, size = 15 }) {
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const [ux, uy] = [dir[0] / len, dir[1] / len];
  const [bx, by] = [tip[0] - ux * size, tip[1] - uy * size];
  const w = size * 0.45;
  return <polygon points={`${tip[0]},${tip[1]} ${bx - uy * w},${by + ux * w} ${bx + uy * w},${by - ux * w}`} fill={color} />;
}

/** A group that comes on key press `index`, or is simply there when `index` is undefined. */
export function Stage({ index, effect, children }) {
  return index == null ? (
    <g>{children}</g>
  ) : (
    <Fragment as="g" index={index} effect={effect}>
      {children}
    </Fragment>
  );
}

const curve = (c) => `M ${c.from[0]} ${c.from[1]} Q ${c.ctrl[0]} ${c.ctrl[1]} ${c.to[0]} ${c.to[1]}`;
/** The point of the quadratic curve `c` at parameter u ∈ [0, 1]. */
export const onCurve = (c, u) => [0, 1].map((i) => (1 - u) ** 2 * c.from[i] + 2 * (1 - u) * u * c.ctrl[i] + u * u * c.to[i]);

/**
 * A shortcut arrow (a quadratic curve) with its label. Inside a fragment it draws itself on when
 * the fragment shows (`drawn`: the `l15-draw` CSS); without one, it is simply there.
 */
export function Shortcut({ c, label, labelAt, color, size = 28, w = 170, drawn = true }) {
  return (
    <g className={drawn ? 'l15-draw' : undefined}>
      <path d={curve(c)} pathLength="1" fill="none" stroke={color} strokeWidth="3" />
      <g className={drawn ? 'l15-draw-head' : undefined}>
        <Head tip={c.to} dir={[c.to[0] - c.ctrl[0], c.to[1] - c.ctrl[1]]} color={color} />
      </g>
      {label && <TexSvg x={labelAt[0]} y={labelAt[1]} tex={label} size={size} color={color} w={w} />}
    </g>
  );
}

/**
 * A dot riding the chain, on a loop: along the first arrow, a pause, along the second, a pause, then
 * (when there is a shortcut) straight along the shortcut; in the colour of the map it rides.
 */
function Rider({ t, arrows, y, sc, colors }) {
  const legs = [
    { from: 0.4, to: 1.7, hold: 0.6, pos: (u) => [arrows[0].x1 + u * (arrows[0].x2 - arrows[0].x1), y], color: colors[0] },
    { from: 2.3, to: 3.6, hold: 0.9, pos: (u) => [arrows[1].x1 + u * (arrows[1].x2 - arrows[1].x1), y], color: colors[1] },
  ];
  if (sc) legs.push({ from: 5.0, to: 6.8, hold: 0.9, pos: (u) => onCurve(sc, u), color: colors[2] });
  const T = sc ? 8.3 : 5.0;
  const tt = t % T;
  const leg = legs.find((l) => tt >= l.from - 0.3 && tt <= l.to + l.hold);
  if (!leg) return null;
  const u = ease((tt - leg.from) / (leg.to - leg.from));
  const [x, yy] = leg.pos(u);
  const fade = Math.min(1, (tt - (leg.from - 0.3)) / 0.3, (leg.to + leg.hold - tt) / 0.3);
  return <circle cx={x} cy={yy} r={9} fill={leg.color} stroke="#fff" strokeWidth="2.5" opacity={Math.max(0, fade)} />;
}

/**
 * The chain of spaces of a composition, ℝⁿ → ℝᵖ → ℝᵐ by g then f: the spaces as discs, the maps
 * as arrows named above; optionally the points a, g(a), f(g(a)) under the discs, the derivative
 * matrices under the arrows, the shortcut f ∘ g over the top with the chain rule's product under its
 * apex, and a dot riding the chain. `index` gives the key press of each part (`chain`, `points`,
 * `under`, `shortcut`); a part without one is there from the start.
 */
export default function ChainPicture({
  spaces = [r`\mathbb R^n`, r`\mathbb R^p`, r`\mathbb R^m`],
  maps = ['g', 'f'],
  mapColors = [G_COLOR, F_COLOR],
  under = null,
  underColors = [G_COLOR, F_COLOR],
  points = null,
  shortcut = null,
  product = null,
  productColor = FG_COLOR,
  width = 1000,
  height = 330,
  xs = [120, 500, 880],
  y = 215,
  R = 42,
  rise = 215,
  sizes = {},
  index = {},
  dot = false,
  className = '',
  title = 'The spaces of a composition, with the maps between them',
}) {
  const S = { space: 30, map: 28, under: 22, point: 24, shortcut: 28, product: 24, ...sizes };
  const ref = useRef(null);
  const t = useClock(ref, { on: dot && !PRINT });
  const last = xs.length - 1;
  const arrows = maps.map((_, k) => ({ x1: xs[k] + R + 4, x2: xs[k + 1] - R - 4 }));
  const cx = (xs[0] + xs[last]) / 2;
  const sc = shortcut ? { from: [xs[0] + 24, y - R + 6], ctrl: [cx, y - rise], to: [xs[last] - 24, y - R + 6] } : null;
  const apexY = sc ? (sc.from[1] + 2 * sc.ctrl[1] + sc.to[1]) / 4 : 0;

  return (
    <svg ref={ref} className={`l17-chain ${className}`.trim()} viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={title}>
      <Stage index={index.chain}>
        {arrows.map((a, k) => (
          <g key={maps[k]}>
            <line x1={a.x1} y1={y} x2={a.x2 - 10} y2={y} stroke={INK} strokeWidth="2.6" />
            <Head tip={[a.x2, y]} dir={[1, 0]} color={INK} />
            <TexSvg x={(a.x1 + a.x2) / 2} y={y - 26} tex={maps[k]} size={S.map} color={mapColors[k]} />
          </g>
        ))}
        {xs.map((x, k) => (
          <g key={spaces[k]}>
            <circle cx={x} cy={y} r={R} fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
            <TexSvg x={x} y={y} tex={spaces[k]} size={S.space} color={INK} />
          </g>
        ))}
      </Stage>

      {points && (
        <Stage index={index.points}>
          {points.map((p, k) => (
            <TexSvg key={p} x={xs[k]} y={y + R + 26} tex={p} size={S.point} color={INK} w={220} />
          ))}
        </Stage>
      )}

      {under && (
        <Stage index={index.under}>
          {under.map(
            (u, k) =>
              u && <TexSvg key={u} x={(arrows[k].x1 + arrows[k].x2) / 2} y={y + 30} tex={u} size={S.under} color={underColors[k]} w={320} />,
          )}
        </Stage>
      )}

      {sc && (
        <Stage index={index.shortcut}>
          <Shortcut c={sc} label={shortcut.label} labelAt={[cx, apexY - 28]} color={shortcut.color ?? FG_COLOR} size={S.shortcut} w={shortcut.w} drawn={index.shortcut != null} />
          {product && <TexSvg x={cx} y={apexY + 36} tex={product} size={S.product} color={productColor} w={Math.min(width - 40, 700)} />}
        </Stage>
      )}

      {dot && !PRINT && <Rider t={t} arrows={arrows} y={y} sc={sc} colors={[mapColors[0], mapColors[1], shortcut?.color ?? FG_COLOR]} />}
    </svg>
  );
}
