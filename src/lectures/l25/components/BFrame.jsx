import Space, { Arrow3, Seg3, Dot3, Patch3, RightAngle3 } from './Space.jsx';
import TexSvg from './TexSvg.jsx';
import Name from './SpaceName.jsx';
import { INK, BLUE, AMBER, PURPLE } from './eig.js';

// Lecture 24's Example 2: the eigenvectors of B = (1/14)[13 −2 −3; −2 10 −6; −3 −6 5] (eigenvalues
// 1, 1, 0), the columns of W: two in the plane P (amber) and its normal vector (purple), the colours
// of Lecture 24's picture
export const VS = [
  { v: [2, -1, 0], color: AMBER },
  { v: [3, 0, -1], color: AMBER },
  { v: [1, 2, 3], color: PURPLE },
];
export const vec3 = (v) => String.raw`\begin{bmatrix}${v.join(String.raw`\\ `)}\end{bmatrix}`;

// A point is kept by its coordinates c in the basis of eigenvectors, and drawn at c₁f₁ + c₂f₂ + c₃f₃,
// where f₁, f₂, f₃ are the three eigenvectors on their way (`m` from 0 to 1) to Z e₁, Z e₂, Z e₃: W⁻¹,
// drawn Z times larger so that the picture keeps its size (W⁻¹ shrinks: the eigenvectors are 2 to 4
// units long).
const Z = 3;
const AXES = [0, 1, 2].map((i) => [0, 1, 2].map((k) => (i === k ? Z : 0)));
const frame = (m) => VS.map((e, i) => e.v.map((a, k) => a + (AXES[i][k] - a) * m));
const put = (F, c) => [0, 1, 2].map((k) => c[0] * F[0][k] + c[1] * F[1][k] + c[2] * F[2][k]);
// x = −0.8 (2, −1, 0) + 0.8 (3, 0, −1) + 0.85 (1, 2, 3), chosen so that x, W⁻¹x and what D and W make
// of them stay clear of the eigenvectors and of the axes in the picture
const C = [-0.8, 0.8, 0.85];
// the piece of the plane P: the points c₁(2, −1, 0) + c₂(3, 0, −1) with c₁ and c₂ in these ranges, a
// rectangle of the xy-plane after W⁻¹
const R1 = [-1, 1.15];
const R2 = [-0.25, 1.15];
const CORNERS = [
  [R1[0], R2[0], 0],
  [R1[1], R2[0], 0],
  [R1[1], R2[1], 0],
  [R1[0], R2[1], 0],
];
// the view: from where (1, 2, 3) leans well off the z-axis, and the two eigenvectors in P are off
// the x- and y-axes
export const VIEW = { width: 580, height: 470, unit: 60, center: [0.436, 0.472], az: -20, el: 26, swing: 6, axisLen: [4.3, 4.5, 3.4] };

/**
 * A projection onto a plane through 0, in the real axes: a piece of the plane (`corners`, amber) with
 * two vectors in it (`F[0]`, `F[1]`, amber; `ab`, their opacity and the plane's), a third vector off
 * it (`F[2]`, purple; `n`) and a vector x (ink; `xo`), with `foot`, where x lands on the plane.
 * `d` from 0 to 1: the third vector shrinks into 0 (a dashed copy stays) and x drops onto the plane
 * (blue), with the dotted line from x and its right angle.
 * `names`: the labels, { vs: [three], x, bx }, each [TeX, dx, dy, size] from its arrow's tip (none:
 * no label; a vs label may add its width, px, for a long label); `tag`: the opacity of the vs labels. `view`: Space's props. `plane`: the plane's colour.
 * For Lecture 25's Last time (its eigenspaces, as on Lecture 24's Eigenspace): `glow`, the plane lit
 * up; `lineN`, `haloN`, the line of the third vector and a soft band round it; `squash` (0 → 1), that
 * line shrinking into 0 (with `d`); `spaces`, names in the picture: [{ at, dx, dy, color, opacity,
 * name }], centred dx, dy px from the point `at`.
 * For Basis of eigenvectors's last key press: `className` (the svg's), and `over`, (sp) => more to draw on
 * top, in the same view (ProjContent: B's picture moving onto D's).
 */
export function ProjFrame({ view = VIEW, title = 'A vector x dropping onto a plane', className = '', over = null, ...rest }) {
  return (
    <Space {...view} className={className} title={title}>
      {(sp) => (
        <g>
          <ProjContent sp={sp} {...rest} />
          {over && over(sp)}
        </g>
      )}
    </Space>
  );
}

/** ProjFrame's drawing, in a Space's render prop `sp`; `labels`: the opacity of all its labels. */
export function ProjContent({ sp, F, corners, x, foot, d = 0, ab = 1, n = 1, xo = 1, names = null, tag = 1, labels = 1, plane = AMBER, glow = 0, lineN = 0, haloN = 0, squash = 0, spaces = [] }) {
  const bx = foot.map((c, k) => c + (x[k] - c) * (1 - d));
  const landed = Math.max(0, Math.min(1, (d - 0.85) / 0.15));
  // what is left of the third vector's line (0: collapsed into 0)
  const k = 1 - squash;
  const line = lineN > 0 || haloN > 0;
  const lab = (p, [tex, dx, dy, size = 17], color, opacity = 1, w = 60) => <TexSvg x={sp.P(p)[0] + dx} y={sp.P(p)[1] + dy} tex={tex} size={size} color={color} opacity={opacity} w={w} h={70} />;
  const nLine = (c0, c1) =>
    k > 0.01 && (
      <>
        <Seg3 s={sp} from={F[2].map((c) => c0 * k * c)} to={F[2].map((c) => c1 * k * c)} color={PURPLE} width={12} opacity={0.18 * haloN} strokeLinecap="round" />
        <Seg3 s={sp} from={F[2].map((c) => c0 * k * c)} to={F[2].map((c) => c1 * k * c)} color={PURPLE} width={2.4} opacity={0.5 * lineN} />
      </>
    );
  return (
    <g>
      {/* the line of the third vector, under the plane */}
      {line && nLine(-0.42, 0)}
      <g opacity={ab}>
        <Patch3 s={sp} corners={corners} fill={plane} opacity={0.14 + 0.14 * glow} stroke={plane} strokeOpacity={0.6 + 0.3 * glow} strokeWidth={1.4} />
        <Arrow3 s={sp} to={F[0]} color={AMBER} width={3.4} head={12} />
        <Arrow3 s={sp} to={F[1]} color={AMBER} width={3.4} head={12} />
      </g>
      <g opacity={n}>
        {line && nLine(0, 1.12)}
        {/* where the third one was, once it has been sent to 0 */}
        {d > 0.02 && <Seg3 s={sp} from={[0, 0, 0]} to={F[2]} color={PURPLE} width={2} strokeDasharray="5 5" opacity={0.75} />}
        {d < 0.985 && <Arrow3 s={sp} to={F[2].map((c) => c * (1 - d))} color={PURPLE} width={3.6} head={12} />}
      </g>
      <g opacity={xo}>
        {d > 0 && (
          <>
            <Seg3 s={sp} from={x} to={bx} color={INK} width={2} strokeDasharray="0.1 6.5" />
            <g opacity={landed}>
              <RightAngle3 s={sp} corner={foot} a={x.map((c, k) => c - foot[k])} b={foot.map((c) => -c)} size={0.3} color={INK} />
            </g>
            <Arrow3 s={sp} to={bx} color={BLUE} width={4} head={13} />
          </>
        )}
        <Arrow3 s={sp} to={x} color={INK} width={3} head={12} />
      </g>
      <Dot3 s={sp} at={[0, 0, 0]} color={INK} r={3.6} />
      {names && (
        <g className="l15-sum-labels" opacity={labels}>
          {[0, 1, 2].map((i) => names.vs?.[i] && <g key={i}>{lab(F[i], names.vs[i], i < 2 ? AMBER : PURPLE, (i < 2 ? ab : n) * tag, names.vs[i][4])}</g>)}
          {names.x && lab(x, names.x, INK, xo, 90)}
          {names.bx && lab(bx, names.bx, BLUE, xo, 170)}
        </g>
      )}
      {spaces.length > 0 && (
        <g className="l15-sum-labels">
          {spaces.map((e, i) => (
            <Name key={i} x={sp.P(e.at)[0] + (e.dx ?? 0)} y={sp.P(e.at)[1] + (e.dy ?? 0)} color={e.color} opacity={e.opacity ?? 1}>
              {e.name}
            </Name>
          ))}
        </g>
      )}
    </g>
  );
}

/**
 * Lecture 24's B in the frame of its eigenvectors (B = WDW⁻¹'s picture; ProjFrame's props): the
 * plane P with its eigenvectors (2, −1, 0) and (3, 0, −1), (1, 2, 3), and a vector x.
 * `m` from 0 to 1: the three eigenvectors move onto the axes, e₁, e₂, e₃, and P onto the xy-plane, x
 * with them (W⁻¹). `d` from 0 to 1 is then B at m = 0, and the projection onto the xy-plane (D) at
 * m = 1.
 */
export default function BFrame({ m = 0, title = 'The plane P, the three eigenvectors of B and a vector x, in the real axes', ...rest }) {
  const F = frame(m);
  const at = (c) => put(F, c);
  return <ProjFrame F={F} corners={CORNERS.map(at)} x={at(C)} foot={at([C[0], C[1], 0])} title={title} {...rest} />;
}
