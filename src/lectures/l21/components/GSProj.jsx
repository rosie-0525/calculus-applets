import Space, { Arrow3, Seg3, Dot3, RightAngle3 } from './Space.jsx';
import { MATH } from './svgmath.jsx';
import { Floor, Lbl, Vn, Sp, Drop, PaleArrow, ProjName, fx } from './GS3D.jsx';
import { svgPoint, BLUE } from './la.js';
import { PRINT } from './print.js';
import { INK, RED, TEAL, GREEN, GRAY, V1, V2, V3, W1, W2, P3, unit, dot, plus, minus, times, norm, proj, fit, floorPoint, FLOOR, FLOOR_LABEL } from './gs.js';

const TRACK = '#6b7280'; // the dashed track from a v to its w (as in GS3D)
const U1 = unit(W1); // the floor's unit vectors: u₁ along v₁ = w₁, u₂ along w₂
const U2 = unit(W2);
/** a u₁ + b u₂, a point of the floor V₂. */
const onFloor = (a, b) => plus(times(a, U1), times(b, U2));

/** Proj_{w_i} v, with a vector as the subscript (ProjName in GS3D has a subspace). */
function ProjVec({ sub, subI, arg, argI }) {
  return (
    <>
      <tspan>Proj</tspan>
      <tspan baselineShift="-0.35em" fontSize="0.68em">
        <Vn n={sub} i={subI} />
      </tspan>
      <tspan>{'\u2009'}</tspan>
      <Vn n={arg} i={argI} />
    </>
  );
}

/**
 * Where to put an arrow's label (as dx, dy from the origin, for a Lbl at the origin, anchored in the
 * middle): beside the arrow from the origin to `a`, 60% of the way along, on the side away from the
 * arrow to `other`, far enough that the label (about 64 × 16 px) clears the arrow.
 */
function besideArrow(s, a, other) {
  const [Ox, Oy] = s.P([0, 0, 0]);
  const [Ax, Ay] = s.P(a);
  const [Bx, By] = s.P(other);
  const len = Math.hypot(Ax - Ox, Ay - Oy) || 1;
  let [nx, ny] = [-(Ay - Oy) / len, (Ax - Ox) / len];
  if (nx * (Bx - Ox) + ny * (By - Oy) > 0) [nx, ny] = [-nx, -ny];
  const r = Math.abs(nx) * 34 + Math.abs(ny) * 10 + 4;
  return { dx: 0.6 * (Ax - Ox) + r * nx, dy: 0.6 * (Ay - Oy) + r * ny + 5 };
}

/** The arc of the angle θ (degrees) from u₁ towards u₂ in the floor, `r` units out, and its label. */
function Arc3({ s, theta, r = 0.72, color = GRAY }) {
  const n = 24;
  const T = (theta * Math.PI) / 180;
  const pts = [];
  for (let k = 0; k <= n; k += 1) {
    const phi = (T * k) / n;
    pts.push(s.P(onFloor(r * Math.cos(phi), r * Math.sin(phi))));
  }
  return <polyline points={pts.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={color} strokeWidth={1.6} />;
}

/** The point of the floor (z = 0) under the viewBox point [X, Y] of a Space (the inverse of s.P there). */
function floorUnder(s, [X, Y]) {
  const A = (s.az * Math.PI) / 180;
  const E = (s.el * Math.PI) / 180;
  const [Ox, Oy] = s.P([0, 0, 0]);
  const a = (X - Ox) / s.unit;
  const b = (Y - Oy) / (s.unit * Math.sin(E));
  return [a * Math.sin(A) + b * Math.cos(A), a * Math.cos(A) - b * Math.sin(A), 0];
}

/** The fit of a picture whose floor spans `range` along u₁ and `range2` along u₂. */
const fitFloor = (W, H, range, range2, el = 24) =>
  fit(
    [[0, 0, 0], V1, V2, V3, times(1.1, V3), ...[[range[0], range2[0]], [range[1], range2[0]], [range[1], range2[1]], [range[0], range2[1]]].map(([a, b]) => onFloor(a, b))],
    W,
    H,
    { pad: 20, el },
  );

const NARROW = 38; // below this θ (Proj_V v is at about 45° from w₁), Proj_{w₂} v lies between w₁ and Proj_V v
const EL = 32; // the pictures' elevation: higher than the Gram–Schmidt pictures' 24°, so that the parallelograms in the floor read
export const THETA_MIN = 10;
export const THETA_MAX = 120;
const RANGE1 = [-1.5, 2.75]; // the floor along u₁, wide enough for w₂ (or v₂) at θ = 120°
const RANGE2 = FLOOR;

/** w₂ at the angle θ (degrees) from w₁ in the floor, as long as the Gram–Schmidt picture's w₂. */
export const w2At = (theta) => {
  const T = (theta * Math.PI) / 180;
  return onFloor(norm(W2) * Math.cos(T), norm(W2) * Math.sin(T));
};

/**
 * The projection at each step, in general: a plane V with w₁ and w₂ (green) at the angle θ (`theta`,
 * degrees; no arc or label for it, at the user's request; their right angle at 90°), a vector v above it (ink) and Proj_V v
 * (teal) with its dotted perpendicular. From key press `sumAt`, the two projections Proj_{w₁} v and
 * Proj_{w₂} v (blue arrows, labelled) and their dashed parallelogram, whose far corner is their sum: on Proj_V v
 * at θ = 90°, and off it (a blue dot) otherwise. Dragging anywhere on the picture turns w₂ towards
 * the pointer (`onTheta`; the user's request: move w₂ to see that the two arrows do not add up to
 * Proj_V v; no θ label and no ring round w₂'s tip, at the user's request). The vectors are the Gram–Schmidt picture's w₁, w₂
 * (at 90°) and v₃.
 */
export function GSBasisPicture({ theta = 90, onTheta, sumAt, width = 560, height = 420, rock = true }) {
  const { unit: u, center } = fitFloor(width, height, RANGE1, RANGE2, EL);
  const w2 = w2At(theta);
  const a1 = proj(V3, W1); // Proj_{w₁} v
  const a2 = proj(V3, w2); // Proj_{w₂} v
  const sum = plus(a1, a2);
  const right = Math.abs(theta - 90) < 0.5;
  const narrow = theta < NARROW; // Proj_{w₂} v between w₁ and Proj_V v: their labels move out of each other's way
  const move = (s, e) => {
    const q = floorUnder(s, svgPoint(e.currentTarget.ownerSVGElement, e));
    const deg = (Math.atan2(dot(q, U2), dot(q, U1)) * 180) / Math.PI;
    onTheta(Math.max(THETA_MIN, Math.min(THETA_MAX, Math.round(deg))));
  };
  return (
    <Space width={width} height={height} unit={u} center={center} el={EL} axes={false} rock={rock} drag={false} title="A plane V spanned by w1 and w2 at an angle theta; a vector v above it, its projection onto V, and its projections onto w1 and onto w2, whose sum is the projection only when theta is 90 degrees">
      {(s) => (
        <g>
          <Floor s={s} range={RANGE1} range2={RANGE2} />
          {right && <RightAngle3 s={s} corner={[0, 0, 0]} a={W1} b={w2} size={0.26} color={GREEN} />}
          <Arrow3 s={s} to={W1} color={GREEN} width={4} />
          <Arrow3 s={s} to={w2} color={GREEN} width={4} />
          <Arrow3 s={s} to={V3} color={INK} width={3.4} />
          <Arrow3 s={s} to={P3} color={TEAL} width={3.2} />
          <Drop s={s} from={V3} to={P3} along={P3} color={TRACK} />

          {/* the two projections and their sum */}
          {fx(
            sumAt,
            <>
              <Seg3 s={s} from={a1} to={sum} color={BLUE} width={1.6} dashed opacity={0.85} />
              <Seg3 s={s} from={a2} to={sum} color={BLUE} width={1.6} dashed opacity={0.85} />
              <Arrow3 s={s} to={a1} color={BLUE} width={3.2} />
              <Arrow3 s={s} to={a2} color={BLUE} width={3.2} />
              {!right && <Dot3 s={s} at={sum} color={BLUE} r={4} />}
            </>,
          )}
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />

          {/* labels last */}
          <Lbl s={s} at={floorPoint(...FLOOR_LABEL)} dx={-14} dy={6} color={TEAL} anchor="end">
            <Sp />
          </Lbl>
          <Lbl s={s} at={W1} dx={-30} dy={-14} color={GREEN}>
            <Vn n="w" i={1} />
          </Lbl>
          <Lbl s={s} at={w2} dx={theta < 18 ? 10 : -12} dy={theta < 18 ? 16 : 22} color={GREEN} anchor={theta < 18 ? 'start' : 'end'}>
            <Vn n="w" i={2} />
          </Lbl>
          <Lbl s={s} at={V3} dx={10} dy={0}>
            <Vn n="v" />
          </Lbl>
          <Lbl s={s} at={P3} dx={narrow ? -10 : 12} dy={narrow ? 16 : -12} color={TEAL} size={19} anchor={narrow ? 'end' : 'start'}>
            <ProjName arg="v" />
          </Lbl>
          {fx(
            sumAt,
            <>
              <Lbl s={s} at={[0, 0, 0]} {...besideArrow(s, a1, a2)} color={BLUE} size={16} anchor="middle">
                <ProjVec sub="w" subI={1} arg="v" />
              </Lbl>
              <Lbl s={s} {...(narrow ? { at: a2, dx: 4, dy: 20, anchor: 'start' } : { at: [0, 0, 0], ...besideArrow(s, a2, a1), anchor: 'middle' })} color={BLUE} size={16}>
                <ProjVec sub="w" subI={2} arg="v" />
              </Lbl>
            </>,
          )}

          {/* dragging anywhere turns w₂ towards the pointer */}
          {!PRINT && onTheta && (
            <rect
              x={0}
              y={0}
              width={s.W}
              height={s.H}
              fill="transparent"
              className="drag-target"
              data-prevent-swipe
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // a synthetic pointer (no capture to take)
                }
                move(s, e);
              }}
              onPointerMove={(e) => e.buttons && move(s, e)}
            />
          )}
        </g>
      )}
    </Space>
  );
}

/** v₂ at the angle θ (degrees) from v₁ in the floor, as long as the Gram–Schmidt picture's v₂. */
export const v2At = (theta) => {
  const T = (theta * Math.PI) / 180;
  return onFloor(norm(V2) * Math.cos(T), norm(V2) * Math.sin(T));
};

/**
 * Why not v₁ and v₂?: the floor V₂ with v₁ and v₂ at the angle θ (`theta`, degrees; the arc and its
 * label), v₃ above it and Proj_{V₂} v₃ (teal) with its dotted perpendicular; the attempt in red,
 * Proj_{v₁} v₃ + Proj_{v₂} v₃: the two pale summands along v₁ and v₂, the dashed parallelogram and
 * the sum, which lands on Proj_{V₂} v₃ only at θ = 90° (the sums are unlabelled: the verdict under
 * the picture names them, in their colours). Dragging anywhere on the picture turns v₂
 * towards the pointer (`onTheta`), with a breathing ring round its tip. From key press `fixAt`, the
 * attempt fades out and Gram–Schmidt's fix comes in green: w₂ = v₂ − Proj_{v₁} v₂ (its dashed track
 * from v₂), at a right angle to w₁ = v₁, and Proj_{w₁} v₃ + Proj_{w₂} v₃, whose parallelogram closes
 * on Proj_{V₂} v₃ at every θ.
 */
export function GSAnglePicture({ theta, onTheta, fixAt, width = 560, height = 420, rock = true }) {
  const { unit: u, center } = fitFloor(width, height, RANGE1, RANGE2, EL);
  const v2 = v2At(theta);
  const a1 = proj(V3, W1); // Proj_{v₁} v₃ = Proj_{w₁} v₃
  const a2 = proj(V3, v2); // Proj_{v₂} v₃
  const sum = plus(a1, a2);
  const w2 = minus(v2, proj(v2, W1)); // Gram–Schmidt's w₂, along u₂
  const b2 = proj(V3, w2); // Proj_{w₂} v₃
  const right = Math.abs(theta - 90) < 0.5;
  const move = (s, e) => {
    const q = floorUnder(s, svgPoint(e.currentTarget.ownerSVGElement, e));
    const deg = (Math.atan2(dot(q, U2), dot(q, U1)) * 180) / Math.PI;
    onTheta(Math.max(THETA_MIN, Math.min(THETA_MAX, Math.round(deg))));
  };
  return (
    <Space width={width} height={height} unit={u} center={center} el={EL} axes={false} rock={rock} drag={false} title="The plane V2 spanned by v1 and v2 at an angle theta; v3 above it, its projection onto V2, and the sum of its projections onto v1 and onto v2, which differs from the projection unless theta is 90 degrees">
      {(s) => (
        <g>
          <Floor s={s} range={RANGE1} range2={RANGE2} />
          <Arc3 s={s} theta={theta} />
          {right && <RightAngle3 s={s} corner={[0, 0, 0]} a={W1} b={v2} size={0.26} color={GRAY} />}

          {/* the attempt: Proj_{v₁} v₃ + Proj_{v₂} v₃ */}
          {fx(
            fixAt,
            <>
              <PaleArrow s={s} to={a1} color={RED} />
              <PaleArrow s={s} to={a2} color={RED} />
              <Seg3 s={s} from={a1} to={sum} color={RED} width={1.6} dashed opacity={0.8} />
              <Seg3 s={s} from={a2} to={sum} color={RED} width={1.6} dashed opacity={0.8} />
              <Arrow3 s={s} to={sum} color={RED} width={4} />
            </>,
            'fade-out',
          )}

          {/* Gram–Schmidt's fix: w₂ and Proj_{w₁} v₃ + Proj_{w₂} v₃ */}
          {fx(
            fixAt,
            <>
              <Seg3 s={s} from={v2} to={w2} color={TRACK} width={1.5} dashed />
              <PaleArrow s={s} to={a1} color={GREEN} />
              <PaleArrow s={s} to={b2} color={GREEN} />
              <Seg3 s={s} from={a1} to={P3} color={GREEN} width={1.6} dashed opacity={0.8} />
              <Seg3 s={s} from={b2} to={P3} color={GREEN} width={1.6} dashed opacity={0.8} />
              <Arrow3 s={s} to={W1} color={GREEN} width={4} />
              <Arrow3 s={s} to={w2} color={GREEN} width={4} />
              <RightAngle3 s={s} corner={[0, 0, 0]} a={W1} b={w2} size={0.26} color={GREEN} />
            </>,
          )}

          <Arrow3 s={s} to={V1} color={INK} width={3.4} />
          <Arrow3 s={s} to={v2} color={INK} width={3.4} />
          <Arrow3 s={s} to={V3} color={INK} width={3.4} />
          <Arrow3 s={s} to={P3} color={TEAL} width={3.2} />
          <Drop s={s} from={V3} to={P3} along={P3} color={TRACK} />
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
          {!PRINT && onTheta && <circle cx={s.P(v2)[0]} cy={s.P(v2)[1]} r={15} className="l15-grab" />}

          {/* labels last */}
          <Lbl s={s} at={floorPoint(...FLOOR_LABEL)} dx={-14} dy={6} color={TEAL} anchor="end">
            <Sp i={2} />
          </Lbl>
          <Lbl s={s} at={onFloor(1.0 * Math.cos((theta * Math.PI) / 360), 1.0 * Math.sin((theta * Math.PI) / 360))} dx={0} dy={7} color={TRACK} size={20} anchor="middle" fontFamily={MATH} fontStyle="italic">
            θ
          </Lbl>
          {fx(
            fixAt,
            <Lbl s={s} at={V1} dx={-30} dy={-14}>
              <Vn n="v" i={1} />
            </Lbl>,
            'fade-out',
          )}
          {fx(
            fixAt,
            <>
              <Lbl s={s} at={V1} dx={-30} dy={-14} color={GREEN}>
                <Vn n="w" i={1} />
                <tspan fill={INK}> = </tspan>
                <tspan fill={INK}>
                  <Vn n="v" i={1} />
                </tspan>
              </Lbl>
              <Lbl s={s} at={w2} dx={-12} dy={22} color={GREEN} anchor="end">
                <Vn n="w" i={2} />
              </Lbl>
            </>,
          )}
          <Lbl s={s} at={v2} dx={10} dy={16}>
            <Vn n="v" i={2} />
          </Lbl>
          <Lbl s={s} at={V3} dx={10} dy={0}>
            <Vn n="v" i={3} />
          </Lbl>
          <Lbl s={s} at={P3} dx={12} dy={-12} color={TEAL} size={19}>
            <ProjName i={2} arg="v" argI={3} />
          </Lbl>

          {/* dragging anywhere turns v₂ towards the pointer */}
          {!PRINT && onTheta && (
            <rect
              x={0}
              y={0}
              width={s.W}
              height={s.H}
              fill="transparent"
              className="drag-target"
              data-prevent-swipe
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // a synthetic pointer (no capture to take)
                }
                move(s, e);
              }}
              onPointerMove={(e) => e.buttons && move(s, e)}
            />
          )}
        </g>
      )}
    </Space>
  );
}
