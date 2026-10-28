import Plane, { Arrow, Dot } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { r } from './Tex.jsx';
import { INK, RED, BLUE, AMBER, apply, plus, pts, svgPoint } from './la.js';

// What A + B does (the title and What A + B and cA do): a shear and a rotation by 90°
export const A = [
  [1, 1],
  [0, 1],
];
export const B = [
  [0, -1],
  [1, 0],
];
export const X0 = [1, 0.6]; // x on arrival

/** A label just beyond the tip of the arrow to v (px), nudged by dx, dy. */
export function TipLabel({ p, v, tex, color, gap = 22, dx = 0, dy = 0, size = 22 }) {
  const sx = p.px(v[0]) - p.px(0);
  const sy = p.py(v[1]) - p.py(0);
  const len = Math.hypot(sx, sy) || 1;
  return <TexSvg x={p.px(v[0]) + (sx / len) * gap + dx} y={p.py(v[1]) + (sy / len) * gap + dy} tex={tex} size={size} color={color} />;
}

/** The faint grid and the axes of a panel. */
export function Backdrop({ p, xRange, yRange }) {
  const xs = [];
  for (let k = Math.ceil(xRange[0]); k <= xRange[1]; k += 1) xs.push(k);
  const ys = [];
  for (let k = Math.ceil(yRange[0]); k <= yRange[1]; k += 1) ys.push(k);
  return (
    <g>
      <g stroke="#eef0f3" strokeWidth="1">
        {xs.map((k) => (
          <line key={`v${k}`} x1={p.px(k)} y1={p.py(yRange[0])} x2={p.px(k)} y2={p.py(yRange[1])} />
        ))}
        {ys.map((k) => (
          <line key={`h${k}`} x1={p.px(xRange[0])} y1={p.py(k)} x2={p.px(xRange[1])} y2={p.py(k)} />
        ))}
      </g>
      <g stroke="#c4c9d1" strokeWidth="1.4">
        <line x1={p.px(xRange[0])} y1={p.py(0)} x2={p.px(xRange[1])} y2={p.py(0)} />
        <line x1={p.px(0)} y1={p.py(yRange[0])} x2={p.px(0)} y2={p.py(yRange[1])} />
      </g>
    </g>
  );
}

/** Inverse of a Plane's px, py: the point of the plane under (X, Y) in viewBox px. */
export const toPlane = (p, [X, Y]) => [(X - p.px(0)) / (p.px(1) - p.px(0)), (Y - p.py(0)) / (p.py(1) - p.py(0))];

/** A transparent rect over the panel: dragging on it moves x (`onDrag`), when `ok(x)` allows it. */
export function DragTarget({ p, onDrag, ok = () => true }) {
  const move = (e) => {
    const q = toPlane(p, svgPoint(e.currentTarget.ownerSVGElement, e));
    if (ok(q)) onDrag(q);
  };
  return (
    <rect
      x={0}
      y={0}
      width={p.W}
      height={p.H}
      fill="transparent"
      className="drag-target"
      data-prevent-swipe
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => e.buttons && move(e)}
    />
  );
}

/** A part of a picture: a fragment shown on key press `index`, or always there (no `index`). */
export function Stage({ index, children, ...rest }) {
  return index == null ? (
    <g {...rest}>{children}</g>
  ) : (
    <Fragment as="g" index={index} {...rest}>
      {children}
    </Fragment>
  );
}

const inside = (v, xr, yr, m = 0.12) => v[0] > xr[0] + m && v[0] < xr[1] - m && v[1] > yr[0] + m && v[1] < yr[1] - m;
const lerp = (u, v, k) => u.map((a, i) => a + (v[i] - a) * k);

/** The point farthest along the way from `from` (where `ok` holds) to `to` where `ok` still holds. */
export function farthest(ok, from, to) {
  if (ok(to)) return to;
  let [lo, hi] = [0, 1];
  for (let k = 0; k < 20; k += 1) {
    const mid = (lo + hi) / 2;
    if (ok(lerp(from, to, mid))) lo = mid;
    else hi = mid;
  }
  return lerp(from, to, lo);
}

/**
 * Where a drag from `from` toward `to` (2-D) ends: as far as `ok` allows, then sliding along the
 * edge it met, horizontally and vertically, so that x doesn't stick there.
 */
export function dragTowards(ok, from, to) {
  const a = farthest(ok, from, to);
  const b = farthest(ok, a, [to[0], a[1]]);
  return farthest(ok, b, [b[0], to[1]]);
}

/**
 * Whether the arrow to v (plane units) and its TipLabel (`gap`, `dx`, `dy` as there, about `hw` px
 * either side of its center and 14 px above and below) both lie in the picture.
 */
export function fits(v, unit, xr, yr, [gap, dx, dy, hw]) {
  const len = Math.hypot(v[0], v[1]) || 1;
  const c = [v[0] + (v[0] / len) * (gap / unit) + dx / unit, v[1] + (v[1] / len) * (gap / unit) - dy / unit];
  const [w, h] = [hw / unit, 14 / unit];
  return inside(v, xr, yr) && c[0] - w > xr[0] && c[0] + w < xr[1] && c[1] - h > yr[0] && c[1] + h < yr[1];
}

/**
 * x and Ax, then Bx, then (A + B)x = Ax + Bx and the parallelogram (copies of Bx and Ax at the tips
 * of Ax and Bx, dashed; when staged, shaded faintly too; the copy of Bx gliding to the tip of Ax
 * removed by the user). `index`: [the key press of x and Ax; of Bx; of the parallelogram and the
 * sum], or none (all shown, as on the title slide). `onDrag` makes x draggable, from
 * anywhere on the picture, a ring round its tip; x stops where an arrow or its label would leave the
 * picture, sliding along the edge.
 */
export default function SumPicture({ x = X0, unit = 90, xRange = [-1.3, 2.4], yRange = [-0.5, 2.1], index, onDrag, labelSize = 22 }) {
  const ax = apply(A, x);
  const bx = apply(B, x);
  const sum = plus(ax, bx);
  const staged = Boolean(index);
  // the labels' gap, dx, dy (as below) and half widths, for labels of size 22
  const k = labelSize / 22;
  const LABELS = [
    [16, 0, 4, 9 * k],
    [22, 0, 0, 18 * k],
    [22, 0, 0, 18 * k],
    [20, -6, -6, 40 * k],
  ];
  const ok = (q) =>
    [q, apply(A, q), apply(B, q), plus(apply(A, q), apply(B, q))].every((v, m) => fits(v, unit, xRange, yRange, LABELS[m]));
  // toward q, as far as the arrows stay on the picture
  const drag = (q) => onDrag(dragTowards(ok, x, q));
  return (
    <Plane xRange={xRange} yRange={yRange} unit={unit} pad={8} grid={false} axes={false} title="x, Ax, Bx and (A + B)x = Ax + Bx">
      {(p) => (
        <g>
          <Backdrop p={p} xRange={xRange} yRange={yRange} />
          {staged && (
            <Stage index={index[2]}>
              <polygon points={pts(p, [[0, 0], ax, sum, bx])} fill="rgba(140, 21, 21, 0.06)" />
            </Stage>
          )}
          <Stage index={index?.[0]}>
            {onDrag && <circle cx={p.px(x[0])} cy={p.py(x[1])} r={15} className="l15-grab" />}
            <Arrow p={p} to={x} color={INK} width={3} />
            <Arrow p={p} to={ax} color={BLUE} />
          </Stage>
          <Stage index={index?.[1]}>
            <Arrow p={p} to={bx} color={AMBER} />
          </Stage>
          <Stage index={index?.[2]}>
            <Arrow p={p} from={bx} to={sum} color={BLUE} width={2.2} dashed opacity={0.75} />
            <Arrow p={p} from={ax} to={sum} color={AMBER} width={2.2} dashed opacity={0.85} />
            <Arrow p={p} to={sum} color={RED} width={4} />
          </Stage>
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
          {/* the labels after all the arrows, so that no arrow crosses one (each on its arrow's key
              press, with a halo in deck.css) */}
          <g className="l15-sum-labels">
            <Stage index={index?.[0]}>
              <TipLabel p={p} v={x} tex={r`\mathbf x`} color={INK} size={labelSize} gap={16} dy={4} />
              <TipLabel p={p} v={ax} tex={r`A\mathbf x`} color={BLUE} size={labelSize} />
            </Stage>
            <Stage index={index?.[1]}>
              <TipLabel p={p} v={bx} tex={r`B\mathbf x`} color={AMBER} size={labelSize} />
            </Stage>
            <Stage index={index?.[2]}>
              <TipLabel p={p} v={sum} tex={r`(A+B)\mathbf x`} color={RED} size={labelSize} gap={20} dx={-6} dy={-6} />
            </Stage>
          </g>
          {/* on top, so that the arrows don't get in the way of a drag */}
          {onDrag && <DragTarget p={p} onDrag={drag} />}
        </g>
      )}
    </Plane>
  );
}
