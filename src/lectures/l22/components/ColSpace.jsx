import Space, { Arrow3, Seg3, Dot3, Patch3, RightAngle3 } from './Space.jsx';
import { Lbl, Vn } from './GS3D.jsx';
import { fit } from './gs.js';
import { INK, TEAL, VIEW, V1, V2, plus, times, minus } from './ls.js';

/**
 * Example 1's pictures in ℝ³, drawn in world coordinates and shown through VIEW (ls.js), which
 * turns C(A) into a horizontal floor. `points` (world) are fitted into the picture over the view's
 * rocking; `children(s)` draws, with `s` the Space's helpers, in world coordinates through the
 * components below. `drag={false}` keeps the view from turning when dragged (for a point dragged in it).
 */
export default function ColSpace({ width = 520, height = 380, points, pad = 30, el = 32, swing = 12, rock = true, drag = true, title, children }) {
  const pts = points.map(VIEW);
  const { unit, center } = fit(pts, width, height, { pad, el, swing });
  return (
    <Space width={width} height={height} unit={unit} center={center} el={el} swing={swing} rock={rock} drag={drag} axes={false} title={title}>
      {(s) => children(s)}
    </Space>
  );
}

const at = (sv, tv) => plus(times(sv, V1), times(tv, V2));

/**
 * The plane C(A) = span{v₁, v₂}: the patch s v₁ + t v₂ for s in `sr`, t in `tr`, faintly teal, with
 * grid lines at the whole multiples of v₁ and v₂, and its name in a corner.
 */
export function CPlane({ s, sr = [-0.6, 2.6], tr = [-0.6, 1.6], label = 'C(A)', labelAt, grid = true, color = TEAL }) {
  const corners = [at(sr[0], tr[0]), at(sr[1], tr[0]), at(sr[1], tr[1]), at(sr[0], tr[1])].map(VIEW);
  const lines = [];
  if (grid) {
    for (let k = Math.ceil(sr[0]); k <= Math.floor(sr[1]); k += 1) lines.push([at(k, tr[0]), at(k, tr[1])]);
    for (let k = Math.ceil(tr[0]); k <= Math.floor(tr[1]); k += 1) lines.push([at(sr[0], k), at(sr[1], k)]);
  }
  return (
    <g>
      <Patch3 s={s} corners={corners} fill={color} opacity={0.1} stroke={color} strokeOpacity={0.45} />
      {lines.map(([a, b], k) => (
        <Seg3 key={k} s={s} from={VIEW(a)} to={VIEW(b)} color="#cfdbe0" width={0.9} />
      ))}
      {label && (
        <Lbl s={s} at={VIEW(labelAt ?? at(sr[1], tr[0]))} dx={-6} dy={26} color={color} anchor="end" size={22}>
          <tspan fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic">
            {label[0]}
          </tspan>
          {label.slice(1, 2)}
          <tspan fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic">
            {label.slice(2, 3)}
          </tspan>
          {label.slice(3)}
        </Lbl>
      )}
    </g>
  );
}

/** An arrow of world coordinates. */
export function W3({ s, from = [0, 0, 0], to, ...rest }) {
  return <Arrow3 s={s} from={VIEW(from)} to={VIEW(to)} {...rest} />;
}

/** A segment of world coordinates. */
export function WSeg({ s, from, to, ...rest }) {
  return <Seg3 s={s} from={VIEW(from)} to={VIEW(to)} {...rest} />;
}

/** A dot at a world point. */
export function WDot({ s, at: p, ...rest }) {
  return <Dot3 s={s} at={VIEW(p)} {...rest} />;
}

/** A label at a world point (halo, as Lbl). */
export function WLbl({ s, at: p, ...rest }) {
  return <Lbl s={s} at={VIEW(p)} {...rest} />;
}

/**
 * The dotted perpendicular from the world point `from` down to its foot on the floor C(A), with
 * the right-angle mark (rule 17), in ink.
 */
export function Drop({ s, from, to, color = INK }) {
  const f = VIEW(from);
  const t = VIEW(to);
  const along = VIEW(V1);
  return (
    <g>
      <Seg3 s={s} from={f} to={t} color={color} width={2.6} strokeDasharray="0.1 6.5" />
      <RightAngle3 s={s} corner={t} a={minus(f, t)} b={along} size={0.26} color={color} />
    </g>
  );
}

export { Vn, Lbl };
