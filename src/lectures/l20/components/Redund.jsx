import { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import Space, { Arrow3, Seg3, Dot3 } from './Space.jsx';
import { Floor, Lbl, Vn } from './GS3D.jsx';
import { INK, GRAY, AMBER, V1, V2, plus, times, fit, floorCorners } from './gs.js';

/**
 * The three examples of redundancies (Examples of redundancies; again on Linear independence): two
 * vectors, v₂ = −2v₁; three, v₃ = a v₁ + b v₂ in their plane; and the zero vector. The redundant
 * vector is amber, in the pictures and in the equations.
 */

/** A redundant vector in an equation: `hl(r\`\vv v_2\`)`. */
export const hl = (tex) => String.raw`\textcolor{${AMBER}}{${tex}}`;

const V_2 = hl(r`\vv v_2`);
const V_3 = hl(r`\vv v_3`);
const ZERO = hl(r`\vv 0`);

// Two vectors: u and −2u on a line through 0
const U = [0.18, 1.0, 0.82];
const U2 = times(-2, U);
const LINE = [times(1.55, U), times(-2.45, U)];

// Three vectors: v₃ = a v₁ + b v₂ in the plane of v₁, v₂
const A = 0.45;
const B = 0.55;
const FLAT = plus(times(A, V1), times(B, V2));
const PLANE_POINTS = [[0, 0, 0], V1, V2, FLAT, ...floorCorners()];

/**
 * `children` drawn in ink until key press `at`, then in amber: the vector that turns out to be
 * redundant (`children` is a function of the colour). Without `at`, amber from the start.
 */
function Turns({ at, children }) {
  if (at === undefined) return children(AMBER);
  return (
    <>
      <Fragment as="g" index={at} effect="fade-out">
        {children(INK)}
      </Fragment>
      <Fragment as="g" index={at}>
        {children(AMBER)}
      </Fragment>
    </>
  );
}

// The two vectors on a line do not rock (the user: rocking a line looks like the vectors scaling); the
// view can still be turned with the mouse.
function TwoVectors({ at, width, height }) {
  return (
    <Space width={width} height={height} {...fit([[0, 0, 0], ...LINE], width, height, { pad: 30, swing: 0 })} rock={false} axes={false} title="v1 and v2 = −2 v1 on a line through the origin">
      {(s) => (
        <g>
          <Seg3 s={s} from={LINE[1]} to={LINE[0]} color={GRAY} width={1.6} dashed />
          <Turns at={at}>{(c) => <Arrow3 s={s} to={U2} color={c} width={3.4} />}</Turns>
          <Arrow3 s={s} to={U} color={INK} width={3.4} />
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
          <Lbl s={s} at={U} dx={12} dy={20}>
            <Vn n="v" i={1} />
          </Lbl>
          <Turns at={at}>
            {(c) => (
              <Lbl s={s} at={U2} dx={14} dy={10} color={c}>
                <Vn n="v" i={2} />
              </Lbl>
            )}
          </Turns>
        </g>
      )}
    </Space>
  );
}

function ThreeVectors({ at, width, height }) {
  return (
    <Space width={width} height={height} {...fit(PLANE_POINTS, width, height, { pad: 24 })} axes={false} title="v3 = a v1 + b v2 in the plane of v1 and v2">
      {(s) => (
        <g>
          <Floor s={s} />
          <Seg3 s={s} from={times(A, V1)} to={FLAT} color={GRAY} width={1.6} dashed />
          <Seg3 s={s} from={times(B, V2)} to={FLAT} color={GRAY} width={1.6} dashed />
          <Arrow3 s={s} to={V1} color={INK} width={3.4} />
          <Arrow3 s={s} to={V2} color={INK} width={3.4} />
          <Turns at={at}>{(c) => <Arrow3 s={s} to={FLAT} color={c} width={3.4} />}</Turns>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
          <Lbl s={s} at={V1} dx={6} dy={-8}>
            <Vn n="v" i={1} />
          </Lbl>
          <Lbl s={s} at={V2} dx={10} dy={14}>
            <Vn n="v" i={2} />
          </Lbl>
          <Turns at={at}>
            {(c) => (
              <Lbl s={s} at={FLAT} dx={8} dy={22} color={c}>
                <Vn n="v" i={3} />
              </Lbl>
            )}
          </Turns>
        </g>
      )}
    </Space>
  );
}

function ZeroVector({ at, width, height }) {
  return (
    <Space width={width} height={height} {...fit(PLANE_POINTS, width, height, { pad: 24 })} axes={false} title="v1, v2 and the zero vector">
      {(s) => (
        <g>
          <Floor s={s} />
          <Arrow3 s={s} to={V1} color={INK} width={3.4} />
          <Arrow3 s={s} to={V2} color={INK} width={3.4} />
          <Lbl s={s} at={V1} dx={6} dy={-8}>
            <Vn n="v" i={1} />
          </Lbl>
          <Lbl s={s} at={V2} dx={10} dy={14}>
            <Vn n="v" i={2} />
          </Lbl>
          <Turns at={at}>
            {(c) => (
              <g>
                <Dot3 s={s} at={[0, 0, 0]} color={c} r={6} />
                <Lbl s={s} at={[0, 0, 0]} dx={-12} dy={24} color={c} anchor="end">
                  <Vn n="0" />
                </Lbl>
              </g>
            )}
          </Turns>
        </g>
      )}
    </Space>
  );
}

/**
 * Each example: its name, its picture (`<Pic at width height />`), the relation that makes the amber
 * vector redundant, the span that stays the same, and the relation as a vanishing combination.
 */
export const REDUNDANCIES = [
  {
    name: 'Two vectors',
    Pic: TwoVectors,
    relation: String.raw`${V_2}=-2\,\vv v_1`,
    span: String.raw`\operatorname{span}\{\vv v_1,${V_2}\}=\operatorname{span}\{\vv v_1\}`,
    zero: String.raw`2\,\vv v_1+${V_2}=\vv 0`,
  },
  {
    name: 'Three vectors',
    Pic: ThreeVectors,
    relation: String.raw`${V_3}=a\,\vv v_1+b\,\vv v_2`,
    span: String.raw`\operatorname{span}\{\vv v_1,\vv v_2,${V_3}\}=\operatorname{span}\{\vv v_1,\vv v_2\}`,
    zero: String.raw`a\,\vv v_1+b\,\vv v_2-${V_3}=\vv 0`,
  },
  {
    name: 'The zero vector',
    Pic: ZeroVector,
    relation: String.raw`${ZERO}=0\,\vv v_1+0\,\vv v_2`,
    span: String.raw`\operatorname{span}\{\vv v_1,\vv v_2,${ZERO}\}=\operatorname{span}\{\vv v_1,\vv v_2\}`,
    zero: String.raw`0\,\vv v_1+0\,\vv v_2-${ZERO}=\vv 0`,
  },
];
