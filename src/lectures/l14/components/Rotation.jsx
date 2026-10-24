import Plane, { Arrow } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import { I, B, Sub, MAIN } from './svgmath.jsx';

export const INK = '#14213d';
export const BLUE = '#3b6ea8';
export const RED = '#8c1515';
const GRAY = '#9ca3af';

const rad = (d) => (d * Math.PI) / 180;
export const rotate = (deg, [x, y]) => {
  const [c, s] = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  return [c * x - s * y, s * x + c * y];
};
const pts = (p, qs) => qs.map((q) => `${p.px(q[0]).toFixed(1)},${p.py(q[1]).toFixed(1)}`).join(' ');

/**
 * The arc at the origin from the direction `from` (radians) counterclockwise by `sweep` radians,
 * `radius` px out, with an arrowhead at its end (as long as there is room for one).
 */
export function CcwArc({ p, from = 0, sweep, radius = 40, color = '#6b7280', width = 2 }) {
  if (Math.abs(sweep) < 0.02) return null;
  const cx = p.px(0);
  const cy = p.py(0);
  const at = (t) => [cx + radius * Math.cos(t), cy - radius * Math.sin(t)];
  const [x1, y1] = at(from);
  const [x2, y2] = at(from + sweep);
  const large = Math.abs(sweep) > Math.PI ? 1 : 0;
  const dir = sweep > 0 ? 0 : 1;
  // the arrowhead: along the tangent at the end, pointing on round the circle
  const t = from + sweep;
  const s = Math.sign(sweep);
  const tx = -Math.sin(t) * s;
  const ty = -Math.cos(t) * s;
  const h = 9;
  const head = Math.abs(sweep) * radius > 18;
  return (
    <g>
      <path d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${large} ${dir} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={width} />
      {head && (
        <polygon
          points={`${x2 + tx * 2},${y2 + ty * 2} ${x2 - tx * h + ty * h * 0.45},${y2 - ty * h - tx * h * 0.45} ${x2 - tx * h - ty * h * 0.45},${y2 - ty * h + tx * h * 0.45}`}
          fill={color}
        />
      )}
    </g>
  );
}

/** A label in KaTeX's fonts just past the tip of the vector `to`, out along its direction. */
function TipLabel({ p, to, color, out = 16, children }) {
  const len = Math.hypot(...to) || 1;
  const [ux, uy] = [to[0] / len, to[1] / len];
  const anchor = ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle';
  return (
    <text
      x={p.px(to[0]) + out * ux}
      y={p.py(to[1]) - out * uy + 7 + (uy < -0.5 ? 10 : 0)}
      textAnchor={anchor}
      fontSize="21"
      fontFamily={MAIN}
      fill={color}
    >
      {children}
    </text>
  );
}

const Rt = () => (
  <>
    <I>R</I>
    <Sub>
      <I>θ</I>
    </Sub>
  </>
);

// the parallelogram of v and w (the textbook's Figure 14.4.1)
const V = [1.1, -0.25];
const W = [0.2, 0.6];
const VW = [V[0] + W[0], V[1] + W[1]];

/** The parallelogram 0, v, v + w, w, and its rotation by θ: R_θ(v + w) = R_θ(v) + R_θ(w). */
function Parallelograms({ p, theta, arc = true }) {
  const R = (q) => rotate(theta, q);
  const a0 = Math.atan2(V[1], V[0]);
  return (
    <g>
      <polygon points={pts(p, [[0, 0], V, VW, W])} fill="rgba(59, 110, 168, 0.12)" stroke={BLUE} strokeWidth="1.4" strokeDasharray="5 4" />
      <polygon points={pts(p, [[0, 0], R(V), R(VW), R(W)])} fill="rgba(140, 21, 21, 0.1)" stroke={RED} strokeWidth="1.4" strokeDasharray="5 4" />
      {arc && <CcwArc p={p} from={a0} sweep={rad(theta)} radius={62} color={GRAY} />}
      {arc && (
        <text
          x={p.px(0) + 80 * Math.cos(a0 + rad(theta) / 2)}
          y={p.py(0) - 80 * Math.sin(a0 + rad(theta) / 2) + 7}
          textAnchor="middle"
          fontSize="21"
          fontFamily={MAIN}
          fill="#6b7280"
        >
          <I>θ</I>
        </text>
      )}
      <Arrow p={p} to={V} color={BLUE} width={3.2} />
      <Arrow p={p} to={W} color={BLUE} width={3.2} />
      <Arrow p={p} to={VW} color={BLUE} width={3.2} />
      <Arrow p={p} to={R(V)} color={RED} width={3.2} />
      <Arrow p={p} to={R(W)} color={RED} width={3.2} />
      <Arrow p={p} to={R(VW)} color={RED} width={3.2} />
      <TipLabel p={p} to={V} color={BLUE}>
        <B>v</B>
      </TipLabel>
      <TipLabel p={p} to={W} color={BLUE}>
        <B>w</B>
      </TipLabel>
      <TipLabel p={p} to={VW} color={BLUE}>
        <B>v</B> + <B>w</B>
      </TipLabel>
      <TipLabel p={p} to={R(V)} color={RED}>
        <Rt />(<B>v</B>)
      </TipLabel>
      <TipLabel p={p} to={R(W)} color={RED}>
        <Rt />(<B>w</B>)
      </TipLabel>
      <TipLabel p={p} to={R(VW)} color={RED}>
        <Rt />(<B>v</B> + <B>w</B>)
      </TipLabel>
    </g>
  );
}

/**
 * The textbook's Figure 14.4.1 built both ways, each stage's progress from 0 to 1: v + w, the diagonal
 * of the parallelogram of v and w (`sum`), then R_θ(v + w) (v + w's copy turns by θ, `turn`); and, on
 * key press `splitIndex`, R_θ(v) and R_θ(w) (copies of v and w turn by θ, `turnParts`), then their
 * parallelogram, whose diagonal is R_θ(v + w) (`add`).
 */
function StagedPair({ p, theta, sum, turn, splitIndex, turnParts, add }) {
  const R = (q, t = 1) => rotate(theta * t, q);
  const a0 = Math.atan2(VW[1], VW[0]);
  const rv = R(V, turnParts);
  const rw = R(W, turnParts);
  return (
    <g>
      <polygon points={pts(p, [[0, 0], V, VW, W])} fill="rgba(59, 110, 168, 0.12)" stroke={BLUE} strokeWidth="1.4" strokeDasharray="5 4" opacity={sum} />
      <Fragment as="g" index={splitIndex}>
        <polygon points={pts(p, [[0, 0], R(V), R(VW), R(W)])} fill="rgba(140, 21, 21, 0.1)" stroke={RED} strokeWidth="1.4" strokeDasharray="5 4" opacity={add} />
      </Fragment>
      <g opacity={turn > 0 ? 1 : 0}>
        <CcwArc p={p} from={a0} sweep={rad(theta * turn)} radius={62} color={GRAY} />
        <text
          x={p.px(0) + 80 * Math.cos(a0 + rad(theta * turn) / 2)}
          y={p.py(0) - 80 * Math.sin(a0 + rad(theta * turn) / 2) + 7}
          textAnchor="middle"
          fontSize="21"
          fontFamily={MAIN}
          fill="#6b7280"
          opacity={turn}
        >
          <I>θ</I>
        </text>
      </g>
      <Arrow p={p} to={V} color={BLUE} width={3.2} />
      <Arrow p={p} to={W} color={BLUE} width={3.2} />
      <Arrow p={p} to={VW} color={BLUE} width={3.2} opacity={sum} />
      <Arrow p={p} to={R(VW, turn)} color={RED} width={3.2} opacity={turn > 0 ? 1 : 0} />
      <TipLabel p={p} to={V} color={BLUE}>
        <B>v</B>
      </TipLabel>
      <TipLabel p={p} to={W} color={BLUE}>
        <B>w</B>
      </TipLabel>
      <g opacity={sum}>
        <TipLabel p={p} to={VW} color={BLUE}>
          <B>v</B> + <B>w</B>
        </TipLabel>
      </g>
      <g opacity={turn}>
        <TipLabel p={p} to={R(VW, turn)} color={RED}>
          <Rt />(<B>v</B> + <B>w</B>)
        </TipLabel>
      </g>
      <Fragment as="g" index={splitIndex}>
        <Arrow p={p} to={rv} color={RED} width={3.2} />
        <Arrow p={p} to={rw} color={RED} width={3.2} />
        <g opacity={turnParts}>
          <TipLabel p={p} to={rv} color={RED}>
            <Rt />(<B>v</B>)
          </TipLabel>
          <TipLabel p={p} to={rw} color={RED}>
            <Rt />(<B>w</B>)
          </TipLabel>
        </g>
      </Fragment>
    </g>
  );
}

/** A label in KaTeX's fonts `out` px to the left of the direction `dir` (on screen), centred on `at`. */
function SideLabel({ p, at, dir, color, out = 18, children }) {
  const len = Math.hypot(...dir) || 1;
  const [nx, ny] = [-dir[1] / len, -dir[0] / len]; // the screen normal to the left of dir
  return (
    <text x={p.px(at[0]) + out * nx} y={p.py(at[1]) + out * ny + 7} textAnchor="middle" fontSize="21" fontFamily={MAIN} fill={color}>
      {children}
    </text>
  );
}

/** The angle θ, an arc at the origin from the direction of `from` (a vector), labelled. */
function Theta({ p, from, theta, radius }) {
  const a0 = Math.atan2(from[1], from[0]);
  const mid = a0 + rad(theta) / 2;
  return (
    <g>
      <CcwArc p={p} from={a0} sweep={rad(theta)} radius={radius} color={GRAY} />
      {theta > 12 && (
        <text x={p.px(0) + (radius + 18) * Math.cos(mid)} y={p.py(0) - (radius + 18) * Math.sin(mid) + 7} textAnchor="middle" fontSize="21" fontFamily={MAIN} fill="#6b7280">
          <I>θ</I>
        </text>
      )}
    </g>
  );
}

// a vector v and its rotation, for the definition of R_θ
const U = [1.2, 0.35];

/** v and its rotation R_θ(v). */
function Single({ p, theta }) {
  const R = rotate(theta, U);
  return (
    <g>
      <Theta p={p} from={U} theta={theta} radius={70} />
      <Arrow p={p} to={U} color={BLUE} width={3.2} />
      <Arrow p={p} to={R} color={RED} width={3.2} />
      <TipLabel p={p} to={U} color={BLUE}>
        <B>v</B>
      </TipLabel>
      <TipLabel p={p} to={R} color={RED}>
        <Rt />(<B>v</B>)
      </TipLabel>
    </g>
  );
}

// v and cv (c = 2.2), for R_θ(cv) = c R_θ(v)
const SV = [0.45, 0.3];
const C = 2.2;

/**
 * R_θ(cv) = c R_θ(v) built both ways, each stage's progress from 0 to 1: cv (v stretching by c,
 * `grow`), then R_θ(cv) (cv's copy turns by θ, `turn`); and, on key press `splitIndex`, R_θ(v) (v's
 * copy turns by θ, `turnV`), then c R_θ(v) (R_θ(v) stretching by c onto R_θ(cv), `stretch`).
 */
function StagedScaled({ p, theta, grow, turn, splitIndex, turnV, stretch }) {
  const times = (q, k) => [q[0] * k, q[1] * k];
  const cv = times(SV, C);
  const Rcv = rotate(theta * turn, cv);
  const Rv = rotate(theta * turnV, SV);
  const half = (q) => [q[0] / 2, q[1] / 2];
  return (
    <g>
      <g opacity={turn > 0 ? 1 : 0}>
        <Theta p={p} from={SV} theta={theta * turn} radius={62} />
      </g>
      <Arrow p={p} to={times(SV, 1 + (C - 1) * grow)} color={BLUE} width={3.2} opacity={0.55} />
      <Arrow p={p} to={SV} color={BLUE} width={3.6} />
      <Arrow p={p} to={Rcv} color={RED} width={3.2} opacity={turn > 0 ? 0.55 : 0} />
      <SideLabel p={p} at={half(SV)} dir={SV} color={BLUE} out={-18}>
        <B>v</B>
      </SideLabel>
      <g opacity={grow}>
        <TipLabel p={p} to={cv} color={BLUE}>
          <I>c</I>
          <B>v</B>
        </TipLabel>
      </g>
      <g opacity={turn}>
        <TipLabel p={p} to={Rcv} color={RED}>
          <Rt />(<I>c</I>
          <B>v</B>)
        </TipLabel>
      </g>
      <Fragment as="g" index={splitIndex}>
        <Arrow p={p} to={times(Rv, 1 + (C - 1) * stretch)} color={RED} width={3.2} opacity={stretch > 0 ? 0.85 : 0} />
        <Arrow p={p} to={Rv} color={RED} width={3.6} />
        <g opacity={turnV}>
          <SideLabel p={p} at={half(Rv)} dir={Rv} color={RED} out={34}>
            <Rt />(<B>v</B>)
          </SideLabel>
        </g>
      </Fragment>
    </g>
  );
}

/** v, cv and their rotations: R_θ(cv) = c R_θ(v). */
function Scaled({ p, theta }) {
  const cv = [C * SV[0], C * SV[1]];
  const Rv = rotate(theta, SV);
  const Rcv = rotate(theta, cv);
  const half = (q) => [q[0] / 2, q[1] / 2];
  return (
    <g>
      <Theta p={p} from={SV} theta={theta} radius={62} />
      <Arrow p={p} to={cv} color={BLUE} width={3.2} opacity={0.55} />
      <Arrow p={p} to={SV} color={BLUE} width={3.6} />
      <Arrow p={p} to={Rcv} color={RED} width={3.2} opacity={0.55} />
      <Arrow p={p} to={Rv} color={RED} width={3.6} />
      <SideLabel p={p} at={half(SV)} dir={SV} color={BLUE} out={-18}>
        <B>v</B>
      </SideLabel>
      <TipLabel p={p} to={cv} color={BLUE}>
        <I>c</I>
        <B>v</B>
      </TipLabel>
      <SideLabel p={p} at={half(Rv)} dir={Rv} color={RED} out={34}>
        <Rt />(<B>v</B>)
      </SideLabel>
      <TipLabel p={p} to={Rcv} color={RED}>
        <Rt />(<I>c</I>
        <B>v</B>)
      </TipLabel>
    </g>
  );
}

/**
 * R_θ(eₖ) on the unit circle, k = 1 or 2, with its coordinates: R_θ(e₁) = (cos θ, sin θ), R_θ(e₂) =
 * (−sin θ, cos θ), the x-coordinate along the x-axis and the y-coordinate up a dashed leg.
 */
function BasisImage({ p, k, theta }) {
  const e = rotate(theta, k === 1 ? [1, 0] : [0, 1]);
  const [xl, yl] = k === 1 ? [<>cos <I>θ</I></>, <>sin <I>θ</I></>] : [<>−sin <I>θ</I></>, <>cos <I>θ</I></>];
  return (
    <g>
      <polyline points={pts(p, [[e[0], 0], e])} fill="none" stroke={RED} strokeWidth="1.6" strokeDasharray="5 4" opacity="0.7" />
      <CcwArc p={p} from={k === 1 ? 0 : Math.PI / 2} sweep={rad(theta)} radius={k === 1 ? 44 : 60} color={GRAY} />
      <Arrow p={p} to={e} color={RED} width={3.6} />
      <TipLabel p={p} to={e} color={RED}>
        <Rt />(<B>e</B>
        <Sub>{k}</Sub>)
      </TipLabel>
      {Math.abs(e[0]) > 0.25 && (
        <text x={p.px(e[0] / 2)} y={p.py(0) + (e[1] >= 0 ? 24 : -12)} textAnchor="middle" fontSize="19" fontFamily={MAIN} fill={RED}>
          {xl}
        </text>
      )}
      {Math.abs(e[1]) > 0.25 && (
        <text x={p.px(e[0]) + (e[0] >= 0 ? 8 : -8)} y={p.py(e[1] / 2) + 6} textAnchor={e[0] >= 0 ? 'start' : 'end'} fontSize="19" fontFamily={MAIN} fill={RED}>
          {yl}
        </text>
      )}
    </g>
  );
}

/**
 * e₁, e₂ on the unit circle, and their images (each through `wrap`, as `e1` and `e2` say). The labels
 * of e₁ and e₂ keep clear of the images' (θ at its final value, so they stay put while the images
 * turn): e₁'s below the axis, far enough for an image's label on e₁ itself (θ = 0 or 3π/2), or above
 * it when an image is in the fourth quadrant near e₁, whose leg is labelled there; e₂'s beside its
 * shaft, below an image's label on e₂ itself (θ = 0 or π/2).
 */
function Basis({ p, theta, e1, e2, wrap }) {
  const r = p.px(1) - p.px(0);
  const at = (opt) => (opt && opt.theta != null ? opt.theta : theta);
  const fourth = [rotate(theta, [1, 0]), rotate(theta, [0, 1])].some(([x, y]) => x > 0.6 && y < -0.1);
  return (
    <g>
      <circle cx={p.px(0)} cy={p.py(0)} r={r} fill="none" stroke={GRAY} strokeWidth="1.3" strokeDasharray="4 5" />
      <Arrow p={p} to={[1, 0]} color={INK} width={3.2} />
      <Arrow p={p} to={[0, 1]} color={INK} width={3.2} />
      <text x={p.px(1) + 6} y={p.py(0) + (fourth ? -12 : 40)} fontSize="21" fontFamily={MAIN} fill={INK}>
        <B>e</B>
        <Sub>1</Sub>
      </text>
      <text x={p.px(0) + 10} y={p.py(0.86) + 7} fontSize="21" fontFamily={MAIN} fill={INK}>
        <B>e</B>
        <Sub>2</Sub>
      </text>
      {wrap(e1, <BasisImage p={p} k={1} theta={at(e1)} />)}
      {wrap(e2, <BasisImage p={p} k={2} theta={at(e2)} />)}
    </g>
  );
}

/**
 * Rotation by θ (degrees) counterclockwise around 0. Each part is false, true, or { index, fadeAt,
 * theta }: it comes on key press `index`, fades out on `fadeAt`, and is turned by `theta` rather than
 * θ (a glide from 0 to θ). `single`: v and R_θ(v); `pair`: the parallelogram of v and w and its
 * rotation (the textbook's Figure 14.4.1), or, with `staged` (StagedPair's props), that picture built
 * both ways; `scale`: v, cv and their rotations, or, with `staged` (StagedScaled's props), built both
 * ways; `basis`: e₁, e₂ on the unit circle, true (with both
 * images) or { e1, e2 } (each image a part).
 */
export default function RotationPicture({
  theta,
  xRange = [-1.75, 1.75],
  yRange = [-1.75, 1.75],
  unit = 125,
  single = false,
  pair = true,
  scale = false,
  basis = false,
  arc = true,
}) {
  const wrap = (opt, node) => {
    if (!opt) return null;
    if (opt === true) return node;
    let out = node;
    if (opt.fadeAt != null) {
      out = (
        <Fragment as="g" index={opt.fadeAt} effect="fade-out">
          {out}
        </Fragment>
      );
    }
    if (opt.index != null) {
      out = (
        <Fragment as="g" index={opt.index}>
          {out}
        </Fragment>
      );
    }
    return out;
  };
  const at = (opt) => (opt && opt.theta != null ? opt.theta : theta);
  return (
    <Plane xRange={xRange} yRange={yRange} unit={unit} pad={12} grid={false} axes={false} title={`Rotation by ${Math.round(theta)} degrees counterclockwise around the origin`}>
      {(p) => (
        <g>
          <g stroke="#d1d5db" strokeWidth="1.3">
            <line x1={p.px(xRange[0])} y1={p.py(0)} x2={p.px(xRange[1])} y2={p.py(0)} />
            <line x1={p.px(0)} y1={p.py(yRange[0])} x2={p.px(0)} y2={p.py(yRange[1])} />
          </g>
          {wrap(single, <Single p={p} theta={at(single)} />)}
          {wrap(pair, pair?.staged ? <StagedPair p={p} theta={theta} {...pair.staged} /> : <Parallelograms p={p} theta={at(pair)} arc={arc} />)}
          {wrap(scale, scale?.staged ? <StagedScaled p={p} theta={theta} {...scale.staged} /> : <Scaled p={p} theta={at(scale)} />)}
          {basis && <Basis p={p} theta={theta} e1={basis === true || basis.e1} e2={basis === true || basis.e2} wrap={wrap} />}
          <circle cx={p.px(0)} cy={p.py(0)} r="4.5" fill={INK} />
        </g>
      )}
    </Plane>
  );
}
