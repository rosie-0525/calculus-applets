import Space, { Arrow3, Label3, Sub } from './Space.jsx';
import Fragment from './Fragment.jsx';

const INK = '#14213d';
const RED = '#8c1515';
const AXIS = '#0e7490';
const GRAY = '#9ca3af';

const rad = (d) => (d * Math.PI) / 180;

/** The 3 × 3 matrix of the rotation by θ (degrees) counterclockwise around axis k (0: x, 1: y, 2: z). */
export function axisRotation(k, deg) {
  const [c, s] = [Math.cos(rad(deg)), Math.sin(rad(deg))];
  if (k === 0) {
    return [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c],
    ];
  }
  if (k === 1) {
    return [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c],
    ];
  }
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}
const apply = (M, v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const unit = (k) => [0, 1, 2].map((i) => (i === k ? 1 : 0));

/** A polyline through points of space. */
function Path3({ s, points, ...rest }) {
  return <polyline points={points.map((q) => s.P(q).map((v) => v.toFixed(1)).join(',')).join(' ')} fill="none" {...rest} />;
}

/**
 * The circle around axis k of radius `r` at height `h` along it, from angle 0 to `sweep` (radians),
 * counterclockwise by the right-hand rule, with an arrowhead at its end.
 */
function Curl({ s, k, r = 0.32, h = 1.25, sweep = 1.6 * Math.PI, color = AXIS }) {
  const i = (k + 1) % 3;
  const j = (k + 2) % 3;
  const at = (t) => {
    const q = [0, 0, 0];
    q[k] = h;
    q[i] = r * Math.cos(t);
    q[j] = r * Math.sin(t);
    return q;
  };
  const n = 40;
  const points = Array.from({ length: n + 1 }, (_, m) => at((sweep * m) / n));
  const [x2, y2] = s.P(at(sweep));
  const [x1, y1] = s.P(at(sweep - 0.25));
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const hd = 10;
  return (
    <g>
      <Path3 s={s} points={points} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <polygon
        points={`${x2 + ux * 3},${y2 + uy * 3} ${x2 - ux * hd - uy * hd * 0.5},${y2 - uy * hd + ux * hd * 0.5} ${x2 - ux * hd + uy * hd * 0.5},${y2 - uy * hd - ux * hd * 0.5}`}
        fill={color}
      />
    </g>
  );
}

const E = ({ n }) => (
  <>
    e<Sub>{n}</Sub>
  </>
);

/**
 * Rotation by θ (degrees) counterclockwise around the coordinate axis k (0: x, 1: y, 2: z): the axis
 * (teal) with a curled arrow round it, the unit circle in the plane perpendicular to it (dashed), the
 * other two standard basis vectors (ink) and their images (red), each with the arc from one to the
 * other; e_k stays put. `imageLabels`: name the images g(eᵢ) (with `name`). `steps`: the key press of
 * each image, [e₁'s, e₂'s, e₃'s]; e_k's image is then e_k itself, drawn red over it. `turns`: the
 * angle each image has turned so far, [e₁'s, e₂'s, e₃'s] (θ if not given), so that eᵢ can turn to
 * its image, the arc growing behind it. `el`: the elevation of the view (Space's default if not
 * given).
 */
export default function AxisRotation({ k = 2, theta, width = 360, height = 300, unit: u = 92, name = 'g', imageLabels = true, rock = false, steps, turns, el }) {
  const turn = (m) => turns?.[m] ?? theta;
  const image = (m) => apply(axisRotation(k, turn(m)), unit(m));
  const stage = (m, content) => (steps ? <Fragment as="g" index={steps[m]}>{content}</Fragment> : content);
  const imageLabel = (s, m, props) => (
    <Label3 s={s} at={image(m)} color={RED} {...props}>
      {name}
      <tspan fontStyle="normal">(</tspan>
      <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
        e
      </tspan>
      <Sub>{m + 1}</Sub>
      <tspan fontStyle="normal">)</tspan>
    </Label3>
  );
  const others = [0, 1, 2].filter((m) => m !== k);
  const circle = (t) => {
    const q = [0, 0, 0];
    q[(k + 1) % 3] = Math.cos(t);
    q[(k + 2) % 3] = Math.sin(t);
    return q;
  };
  const ring = Array.from({ length: 73 }, (_, m) => circle((2 * Math.PI * m) / 72));
  const arcPts = (m0) => {
    const n = 24;
    return Array.from({ length: n + 1 }, (_, m) => apply(axisRotation(k, (turn(m0) * m) / n), unit(m0)).map((c) => c * 0.42));
  };
  return (
    <Space width={width} height={height} unit={u} axisLen={1.55} rock={rock} el={el} center={[0.5, 0.6]} title={`Rotation by ${theta} degrees around the ${'xyz'[k]}-axis`}>
      {(s) => (
        <g>
          <Path3 s={s} points={ring} stroke={GRAY} strokeWidth="1.3" strokeDasharray="4 5" />
          <Arrow3 s={s} to={unit(k)} color={AXIS} width={3.6} />
          <Label3 s={s} at={unit(k)} dx={k === 2 ? 10 : -6} dy={k === 2 ? 4 : 24} color={AXIS} italic={false}>
            <E n={k + 1} />
          </Label3>
          <Curl s={s} k={k} h={1.25} />
          {others.map((m) => (
            <g key={m}>
              <Arrow3 s={s} to={unit(m)} color={INK} width={3.2} />
              <Label3 s={s} at={unit(m)} dx={m === 0 ? -22 : 8} dy={m === 0 ? 20 : -8} italic={false}>
                <E n={m + 1} />
              </Label3>
              {stage(
                m,
                <>
                  <Path3 s={s} points={arcPts(m)} stroke={GRAY} strokeWidth="1.8" />
                  <Arrow3 s={s} to={image(m)} color={RED} width={3.4} />
                  {imageLabels && imageLabel(s, m, { dx: 6, dy: -8 })}
                </>,
              )}
            </g>
          ))}
          {steps &&
            stage(
              k,
              <>
                <Arrow3 s={s} to={unit(k)} color={RED} width={3.6} />
                {imageLabels && imageLabel(s, k, { at: unit(k).map((v) => 0.62 * v), dx: -10, dy: 6, textAnchor: 'end' })}
              </>,
            )}
        </g>
      )}
    </Space>
  );
}
