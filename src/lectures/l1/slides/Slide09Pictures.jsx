import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, PlaneLabel } from '../components/Plane.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const SOFT = '#6b7280';
export const GUIDE = '#94a3b8';

/** Text in the figures' math font, e.g. the label "v = (3, 2)". */
export function VecLabel({ x, y, entries, anchor = 'start' }) {
  return (
    <text x={x} y={y} fontSize="18" fill={CARDINAL} textAnchor={anchor} fontFamily="KaTeX_Main, Georgia, serif">
      <tspan fontWeight="700">v</tspan> = ({entries})
    </text>
  );
}

/**
 * n = 2: the arrow from the origin to the point (3, 2), with dashed guides
 * reading the two entries off the axes.
 */
export function TwoDFigure() {
  return (
    <Plane xRange={[-0.5, 4.5]} yRange={[-0.5, 3.5]} unit={62} title="The 2-vector (3, 2) drawn as an arrow from the origin">
      {(p) => (
        <g>
          <g stroke={GUIDE} strokeWidth="1.5" strokeDasharray="5 4">
            <line x1={p.px(3)} y1={p.py(2)} x2={p.px(3)} y2={p.py(0)} />
            <line x1={p.px(3)} y1={p.py(2)} x2={p.px(0)} y2={p.py(2)} />
          </g>
          <g fill={CARDINAL} fontSize="13" fontWeight="700" textAnchor="middle">
            <rect x={p.px(3) - 9} y={p.py(0) + 4} width="18" height="17" fill="#fcfcfa" />
            <text x={p.px(3)} y={p.py(0) + 17}>3</text>
            <rect x={p.px(0) - 20} y={p.py(2) - 9} width="14" height="17" fill="#fcfcfa" />
            <text x={p.px(0) - 13} y={p.py(2) + 4}>2</text>
          </g>
          <Arrow p={p} to={[3, 2]} color={CARDINAL} width={4} />
          <circle cx={p.px(3)} cy={p.py(2)} r="4" fill={CARDINAL} />
          <VecLabel x={p.px(3) + 8} y={p.py(2) - 10} entries="3, 2" anchor="middle" />
        </g>
      )}
    </Plane>
  );
}

/*
 * n = 3: a standard right-handed picture -- x comes out of the page toward the
 * lower left, y goes right, z goes up. The floor (the xy-plane) is shaded with
 * a light grid so the depth reads.
 */
export const O3 = [124, 206];
export const UNIT3 = 52;
export const P3 = ([x, y, z]) => [
  O3[0] + UNIT3 * (-0.6 * x + y),
  O3[1] + UNIT3 * (0.5 * x - z),
];
export const PIX = { px: (x) => x, py: (y) => y }; // lets <Arrow> draw in pixel coordinates

export function ThreeDFigure() {
  const v = [2, 3, 2];
  const floor = [v[0], v[1], 0];
  const line = (a, b, props) => {
    const [p, q] = [P3(a), P3(b)];
    return <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} {...props} />;
  };
  const tip = P3(v);
  const X = [2.8, 0, 0];
  const Y = [0, 4.0, 0];
  const Z = [0, 0, 3.6];
  const label = (pt, dx, dy, text, props = {}) => {
    const [x, y] = P3(pt);
    return (
      <text x={x + dx} y={y + dy} {...props}>
        {text}
      </text>
    );
  };

  return (
    <svg className="figure-svg" viewBox="0 0 354 292" width="354" height="292" role="img" aria-label="The 3-vector (2, 3, 2) drawn as an arrow from the origin, with its shadow on the floor">
      {/* the floor, x from 0 to 2.5 and y from 0 to 4 */}
      <polygon
        points={[[0, 0, 0], [2.5, 0, 0], [2.5, 4, 0], [0, 4, 0]].map((q) => P3(q).join(',')).join(' ')}
        fill="#f3f5f8"
      />
      <g stroke="#e2e6ec" strokeWidth="1">
        {[1, 2].map((k) => line([k, 0, 0], [k, 4, 0], { key: `gx${k}` }))}
        {[1, 2, 3, 4].map((k) => line([0, k, 0], [2.5, k, 0], { key: `gy${k}` }))}
      </g>

      {/* axes */}
      <g stroke={SOFT} strokeWidth="1.5">
        {line([0, 0, 0], X)}
        {line([0, 0, 0], Y)}
        {line([0, 0, 0], Z)}
      </g>
      <g fill={SOFT} fontSize="15" fontStyle="italic">
        {label(X, -12, 4, 'x')}
        {label(Y, 6, 5, 'y')}
        {label(Z, 8, 6, 'z')}
      </g>

      {/* the arrow's shadow on the floor, and the upright triangle it spans with v */}
      <polygon points={[[0, 0, 0], floor, v].map((q) => P3(q).join(',')).join(' ')} fill="#8c151512" />
      {line([0, 0, 0], floor, { stroke: GUIDE, strokeWidth: 2 })}

      {/* go 2 along x, 3 along y, then up 2 */}
      <g stroke={GUIDE} strokeWidth="1.5" strokeDasharray="5 4">
        {line([2, 0, 0], floor)}
        {line([0, 3, 0], floor)}
        {line(floor, v)}
        {line([0, 0, 2], v)}
      </g>
      <circle cx={P3(floor)[0]} cy={P3(floor)[1]} r="3" fill={GUIDE} />
      <g fill={CARDINAL} fontSize="13" fontWeight="700" textAnchor="middle">
        {label([2, 0, 0], -10, 4, '2')}
        {label([0, 3, 0], 0, -8, '3')}
        {label([0, 0, 2], -10, 4, '2')}
      </g>

      <Arrow p={PIX} from={P3([0, 0, 0])} to={tip} color={CARDINAL} width={4} />
      <circle cx={tip[0]} cy={tip[1]} r="4" fill={CARDINAL} />
      <VecLabel x={tip[0] + 10} y={tip[1] - 8} entries="2, 3, 2" />
    </svg>
  );
}

export default function Slide09Pictures() {
  return (
    <section>
      <h2>
        Pictures for <Tex tex="n=2" /> and <Tex tex="n=3" />
      </h2>

      <p className="compact">
        For <Tex tex="n=2,3" />, an <Tex tex="n" />-vector can be drawn as an <strong>arrow</strong>,
        with a <strong>length</strong> and a <strong>direction</strong>.
      </p>

      <div className="pictures-pair">
        <Fragment index={1} as="figure">
          <TwoDFigure />
          <figcaption>
            <Tex tex="n=2" />: in the plane
          </figcaption>
        </Fragment>

        <Fragment index={2} as="figure">
          <ThreeDFigure />
          <figcaption>
            <Tex tex="n=3" />: in space
          </figcaption>
        </Fragment>
      </div>

      <Notes time="1:15 · running total 8:30">
        <p>
          For n = 2 or 3 we can <strong>draw</strong> a vector: an arrow from the origin to the
          point whose coordinates are the entries. The arrow has a <strong>length</strong> and a{' '}
          <strong>direction</strong>, and those are equivalent to the entries.
        </p>
        <p>
          <em>[Key press]</em> In the plane: v = (3, 2) is the arrow to the point (3, 2) — go 3 to
          the right, 2 up. The dashed lines read the entries back off the axes.
        </p>
        <p>
          <em>[Key press]</em> In space: v = (2, 3, 2). Go 2 along x — toward you — then 3 along y,
          and you are at the grey dot on the floor. Then go up 2. The arrow runs straight from the
          origin to that tip; the grey line on the floor is its shadow.
        </p>
      </Notes>
    </section>
  );
}
