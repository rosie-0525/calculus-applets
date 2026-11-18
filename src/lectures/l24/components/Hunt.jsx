import Plane, { Arrow, Dot, AngleArc } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import { Backdrop, DragTarget, Stage, TipLabel, dragTowards, fits } from './SumPicture.jsx';
import TexSvg from './TexSvg.jsx';
import { r } from './Tex.jsx';
import { INK, BLUE, GREEN, GRAY, apply, cross, dot, len, times, coords, pts, texScaled } from './eig.js';

/** Whether Ax (`ax`) lies on the line of x (x nonzero). */
export const aligned = (x, ax) => len(x) > 1e-9 && Math.abs(cross(x, ax)) < 1e-6 * (1 + len(x) * len(ax));

/**
 * A snap for a dragged x: onto an eigenline when within `deg` degrees of it (then to multiples of
 * `step` of its eigenvector), otherwise to the grid of side `step`, so that the numbers stay clean.
 */
export const snapper = (eigs, step = 0.25, deg = 5) => (q) => {
  for (const e of eigs) {
    const sin = Math.abs(cross(e.v, q)) / (len(e.v) * len(q) || 1);
    if (sin < Math.sin((deg * Math.PI) / 180)) {
      const c = Math.round(dot(q, e.v) / dot(e.v, e.v) / step) * step;
      return times(c, e.v);
    }
  }
  return q.map((c) => Math.round(c / step) * step);
};

/**
 * The hunt for eigenvectors: x (ink; dragged from anywhere on the picture, no ring round its tip: the
 * user, Lecture 24) and
 * Ax (blue), with the line of x, dotted; when Ax lands on that line, the line lights up (in the colour
 * of that eigenvector in `eigs`, [{ v, color }], or green) and Ax's label reads Ax = λx.
 *
 * `index`: the key presses of { ax, line, frame } (none: there from the start). `snap`: where a drag may put x
 * (see `snapper`). `frame`: two eigenvectors [{ v, lam, color, name }]: their lines and arrows, and the
 * parallelograms of x and of Ax along them (the component along each is multiplied by its λ). `arc`:
 * the angle from x to Ax. x stops where an arrow or its label would leave the picture, or where `allow`
 * says no (a second picture that shares x). `index.x`: the key press of x itself (its arrow, label and
 * drag). `index.gone`: the key press on which x, Ax, the line of x and their labels fade out (and x can no
 * longer be dragged; Eigenlines' replay of T_A). `under`: a render prop (p) => … drawn first, in place of the faint grid (a picture the hunt
 * sits on, e.g. a square and F moved by M). `scaled`: (λ, x) => the TeX of λx in that label (default
 * texScaled: 1.5 as a decimal); `hitH`: that label's half-height in px (taller for a \dfrac).
 * `plain`: as few colours and lines as can be (the user, Sums of eigenvectors): of the frame only its
 * arrows and labels (no eigenlines, no parallelograms), and the line of x stays gray and dotted even
 * when Ax is on it (x's label always below that line). `xName`: the TeX of x's label (e.g. v + w), `xArg`: x as it reads after A (e.g.
 * (v + w)).
 */
export default function Hunt({
  M,
  x,
  onDrag,
  snap = (q) => q,
  xRange = [-4.2, 4.2],
  yRange = [-3.4, 3.4],
  unit = 62,
  pad = 8,
  index = {},
  eigs = [],
  frame,
  arc = false,
  minLen = 0.45,
  allow = () => true,
  labelSize = 22,
  axLabel = [22, 0, 0, 58],
  name = 'A',
  under = null,
  scaled = texScaled,
  hitH = 15,
  plain = false,
  xName = r`\mathbf x`,
  xArg = xName,
  title = 'x and Ax',
}) {
  const ax = apply(M, x);
  const hit = aligned(x, ax);
  const lam = dot(ax, x) / dot(x, x);
  const eig = eigs.find((e) => Math.abs(cross(e.v, x)) < 1e-6 * (1 + len(x)));
  const hitColor = eig?.color ?? GREEN;
  const far = xRange[1] - xRange[0] + yRange[1] - yRange[0];
  const d = times(far / (len(x) || 1), x);
  // x's label when the line is lit: beside x's tip, below the line
  const xAt = (p) => {
    const d = [p.px(x[0]) - p.px(0), p.py(x[1]) - p.py(0)];
    const L = Math.hypot(d[0], d[1]) || 1;
    const n = d[0] > 0 ? [-d[1] / L, d[0] / L] : [d[1] / L, -d[0] / L]; // the normal that points down
    return [p.px(x[0]) + 20 * n[0], p.py(x[1]) + 20 * n[1]];
  };
  const within = (v, m = 0.12) => v[0] > xRange[0] + m && v[0] < xRange[1] - m && v[1] > yRange[0] + m && v[1] < yRange[1] - m;
  const ok = (q) => {
    const aq = apply(M, q);
    if (len(q) < minLen || !fits(q, unit, xRange, yRange, [16, 0, 4, 9]) || !allow(q)) return false;
    // on an eigenline Ax's label goes beside the line (hitAt), so only its arrow has to fit
    return aligned(q, aq) ? within(aq) : fits(aq, unit, xRange, yRange, axLabel);
  };
  // where "Ax = λx" goes (px): beside the lit line and clear of it, near Ax's tip; above the line if
  // the label fits there, else below
  const hitAt = (p) => {
    const o = [p.px(0), p.py(0)];
    const tip = [p.px(ax[0]), p.py(ax[1])];
    const far2 = len(ax) > 1e-9 ? tip : [p.px(x[0]), p.py(x[1])];
    const L = Math.hypot(far2[0] - o[0], far2[1] - o[1]) || 1;
    const u = [(far2[0] - o[0]) / L, (far2[1] - o[1]) / L];
    const n = u[0] > 0 ? [u[1], -u[0]] : [-u[1], u[0]]; // the normal that points up
    const [hw, hh] = [axLabel[3], hitH];
    const dist = hw * Math.abs(n[0]) + hh * Math.abs(n[1]) + 7;
    const back = Math.min(26, len(ax) > 1e-9 ? L : 0);
    const at = (sgn) => [tip[0] - u[0] * back + sgn * dist * n[0], tip[1] - u[1] * back + sgn * dist * n[1]];
    const inside = ([X, Y]) => X - hw > 0 && X + hw < p.W && Y - hh > 0 && Y + hh < p.H;
    return inside(at(1)) || !inside(at(-1)) ? at(1) : at(-1);
  };
  const drag = (q) => {
    const target = snap(q);
    if (ok(target)) {
      onDrag(target);
      return;
    }
    const z = snap(dragTowards(ok, x, target));
    if (ok(z)) onDrag(z);
  };
  // x, Ax, the line of x and their labels, faded out on index.gone (a call, not a component, so that
  // the drag target is not remounted on every render)
  const gone = (children) =>
    index.gone == null ? (
      children
    ) : (
      <Fragment as="g" index={index.gone} effect="fade-out">
        {children}
      </Fragment>
    );
  // the components of x and of Ax along the frame's eigenvectors
  const parts = frame && coords([frame[0].v, frame[1].v], x).map((c, i) => [times(c, frame[i].v), times(c * frame[i].lam, frame[i].v)]);
  return (
    <Plane xRange={xRange} yRange={yRange} unit={unit} pad={pad} grid={false} axes={false} title={title}>
      {(p) => (
        <g>
          {under ? under(p) : <Backdrop p={p} xRange={xRange} yRange={yRange} />}
          {frame && (
            <Stage index={index.frame}>
              {!plain && (
                <>
                  {frame.map((e, i) => {
                    const f = times(far / len(e.v), e.v);
                    return <polyline key={i} points={pts(p, [times(-1, f), f])} stroke={e.color} strokeWidth="2" opacity="0.35" fill="none" />;
                  })}
                  <polygon points={pts(p, [[0, 0], parts[0][0], x, parts[1][0]])} fill="none" stroke={GRAY} strokeWidth="1.6" strokeDasharray="5 5" />
                  <Stage index={index.ax}>
                    <polygon points={pts(p, [[0, 0], parts[0][1], ax, parts[1][1]])} fill="rgba(59, 110, 168, 0.07)" stroke={BLUE} strokeWidth="1.6" strokeDasharray="5 5" />
                  </Stage>
                </>
              )}
              {frame.map((e, i) => (
                <Arrow key={i} p={p} to={e.v} color={e.color} width={3} head={12} />
              ))}
            </Stage>
          )}
          {gone(
            <>
              <Stage index={index.line}>
                {hit && !plain ? (
                  <polyline points={pts(p, [times(-1, d), d])} stroke={hitColor} strokeWidth="3.2" opacity="0.55" fill="none" />
                ) : (
                  <polyline points={pts(p, [times(-1, d), d])} stroke="#6b7280" strokeWidth="2" strokeDasharray="0.1 7" strokeLinecap="round" fill="none" />
                )}
              </Stage>
              <Stage index={index.ax}>
                <Arrow p={p} to={ax} color={BLUE} width={4.4} />
                {arc && <AngleArc p={p} a={x} b={ax} radius={30} color={BLUE} width={1.8} />}
              </Stage>
              <Stage index={index.x}>
                <Arrow p={p} to={x} color={INK} width={3} />
              </Stage>
            </>,
          )}
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
          <g className="l15-sum-labels">
            {frame && (
              <Stage index={index.frame}>
                {frame.map((e, i) => (
                  <TipLabel key={i} p={p} v={e.v} tex={e.name} color={e.color} size={labelSize - 2} gap={16} dx={e.dx ?? 0} dy={e.dy ?? 0} />
                ))}
              </Stage>
            )}
            {gone(
              <>
                <Stage index={index.x}>
                  {hit || plain ? (
                    <TexSvg x={xAt(p)[0]} y={xAt(p)[1]} tex={xName} color={INK} size={labelSize} w={30} h={30} />
                  ) : (
                    <TipLabel p={p} v={x} tex={xName} color={INK} size={labelSize} gap={16} dy={4} />
                  )}
                </Stage>
                <Stage index={index.ax}>
                  {hit ? (
                    <TexSvg x={hitAt(p)[0]} y={hitAt(p)[1]} tex={`${name}${xArg}=${scaled(lam, xArg)}`} color={BLUE} size={labelSize} w={2 * axLabel[3]} h={34} />
                  ) : (
                    <TipLabel p={p} v={ax} tex={`${name}${xArg}`} color={BLUE} size={labelSize} gap={axLabel[0]} />
                  )}
                </Stage>
              </>,
            )}
          </g>
          {onDrag &&
            gone(
              <Stage index={index.x}>
                <DragTarget p={p} onDrag={drag} />
              </Stage>,
            )}
        </g>
      )}
    </Plane>
  );
}
