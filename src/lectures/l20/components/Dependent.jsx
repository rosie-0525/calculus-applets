import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import Plane, { Arrow, Dot } from './Plane.jsx';
import Space, { Arrow3, Seg3, Dot3 } from './Space.jsx';
import { Floor, Lbl, Vn } from './GS3D.jsx';
import { hl } from './Redund.jsx';
import { MAIN } from './svgmath.jsx';
import { INK, GRAY, GREEN, AMBER, plus, times, fit, floorCorners, floorPoint } from './gs.js';

/**
 * The examples of linear dependence (Examples of linear dependence in ℝ² and in ℝ³), each a picture
 * with its vanishing combination, then how its redundant vector is removed to leave a basis of the
 * span: the redundant vector turns amber at key press `amber` (with the relation that puts it in the
 * span of the others), and at `drop` it is removed (a dashed grey ghost, as on From a spanning set
 * to a basis) while the vectors that stay turn green, a basis.
 */

const PW = 360; // a 3-D picture's size; the plane's comes out the same from its ranges
const PH = 236;
const PLANE = { xRange: [-3, 3], yRange: [-1.9, 1.9], unit: 52, axisLabels: ['', ''] };
const G = (tex) => String.raw`\textcolor{${GREEN}}{${tex}}`;

/** `children` from key press `from` (from the start if undefined) until `to` (to the end if undefined). */
function During({ from, to, children }) {
  let out = children;
  if (from !== undefined) {
    out = (
      <Fragment as="g" index={from}>
        {out}
      </Fragment>
    );
  }
  if (to !== undefined) {
    out = (
      <Fragment as="g" index={to} effect="fade-out">
        {out}
      </Fragment>
    );
  }
  return out;
}

/** A vector that stays: `children(color)` in ink, then green (a basis) from key press `drop`. */
function Keep({ drop, children }) {
  return (
    <>
      <During to={drop}>{children(INK)}</During>
      <During from={drop}>{children(GREEN)}</During>
    </>
  );
}

/** The redundant vector: `children(color)` in ink, amber from `amber`, gone at `drop` (then `ghost`). */
function Red({ amber, drop, ghost, children }) {
  return (
    <>
      <During to={amber}>{children(INK)}</During>
      <During from={amber} to={drop}>
        {children(AMBER)}
      </During>
      {ghost && <During from={drop}>{ghost}</During>}
    </>
  );
}

/** A label in the plane with a white halo, so no arrow crosses it. */
function L({ p, at, dx = 0, dy = 0, color = INK, anchor = 'start', children }) {
  return (
    <text x={p.px(at[0]) + dx} y={p.py(at[1]) + dy} fill={color} fontSize="22" fontFamily={MAIN} textAnchor={anchor} stroke="#fff" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke">
      {children}
    </text>
  );
}

const ghost2 = (p, to) => <Arrow p={p} to={to} color={GRAY} width={2.2} dashed head={11} />;
const ghost3 = (s, to) => <Arrow3 s={s} to={to} color={GRAY} width={2.2} dashed head={11} />;

// ℝ²: two vectors on a line, v₂ = −(3/2)v₁
const A1 = [1.6, 0.8];
const A2 = [-2.4, -1.2];

function OnALine({ amber, drop }) {
  return (
    <Plane {...PLANE} title="v1 and v2 = −3/2 v1 on a line; v2 removed, v1 a basis of the line">
      {(p) => (
        <g>
          <Red amber={amber} drop={drop} ghost={ghost2(p, A2)}>
            {(c) => <Arrow p={p} to={A2} color={c} width={3.2} />}
          </Red>
          <Keep drop={drop}>{(c) => <Arrow p={p} to={A1} color={c} width={3.2} />}</Keep>
          <Dot p={p} at={[0, 0]} color={INK} r={4} />
          <Keep drop={drop}>
            {(c) => (
              <L p={p} at={A1} dx={8} dy={-4} color={c}>
                <Vn n="v" i={1} />
              </L>
            )}
          </Keep>
          <Red amber={amber} drop={drop}>
            {(c) => (
              <L p={p} at={A2} dx={-4} dy={26} color={c}>
                <Vn n="v" i={2} />
              </L>
            )}
          </Red>
        </g>
      )}
    </Plane>
  );
}

// ℝ²: three vectors adding up to 0; head to tail they close up a triangle
const B1 = [2.2, -0.6];
const B2 = [-0.6, 1.8];
const B3 = [-1.6, -1.2];
const B12 = plus(B1, B2);

function Triangle({ amber, drop }) {
  return (
    <Plane {...PLANE} title="v1 + v2 + v3 = 0: head to tail, a triangle; v3 removed, v1, v2 a basis of the plane">
      {(p) => (
        <g>
          <Arrow p={p} from={B1} to={B12} color={GRAY} width={2.2} dashed head={11} />
          <Arrow p={p} from={B12} to={[0, 0]} color={GRAY} width={2.2} dashed head={11} />
          <Red amber={amber} drop={drop} ghost={ghost2(p, B3)}>
            {(c) => <Arrow p={p} to={B3} color={c} width={3.2} />}
          </Red>
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Arrow p={p} to={B1} color={c} width={3.2} />
                <Arrow p={p} to={B2} color={c} width={3.2} />
              </g>
            )}
          </Keep>
          <Dot p={p} at={[0, 0]} color={INK} r={4} />
          <Keep drop={drop}>
            {(c) => (
              <g>
                <L p={p} at={B1} dx={-6} dy={28} color={c}>
                  <Vn n="v" i={1} />
                </L>
                <L p={p} at={B2} dx={-30} dy={4} color={c}>
                  <Vn n="v" i={2} />
                </L>
              </g>
            )}
          </Keep>
          <Red amber={amber} drop={drop}>
            {(c) => (
              <L p={p} at={B3} dx={-30} dy={8} color={c}>
                <Vn n="v" i={3} />
              </L>
            )}
          </Red>
        </g>
      )}
    </Plane>
  );
}

// ℝ²: the zero vector among others
const C1 = [2.1, 0.7];
const C2 = [-1.1, 1.4];

function WithZero({ amber, drop }) {
  return (
    <Plane {...PLANE} title="v1, v2 and the zero vector; 0 removed, v1, v2 a basis of the plane">
      {(p) => (
        <g>
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Arrow p={p} to={C1} color={c} width={3.2} />
                <Arrow p={p} to={C2} color={c} width={3.2} />
              </g>
            )}
          </Keep>
          <Dot p={p} at={[0, 0]} color={INK} r={4} />
          <Red amber={amber} drop={drop}>
            {(c) => <Dot p={p} at={[0, 0]} color={c} r={6} />}
          </Red>
          <Keep drop={drop}>
            {(c) => (
              <g>
                <L p={p} at={C1} dx={2} dy={-10} color={c}>
                  <Vn n="v" i={1} />
                </L>
                <L p={p} at={C2} dx={-30} dy={4} color={c}>
                  <Vn n="v" i={2} />
                </L>
              </g>
            )}
          </Keep>
          <Red amber={amber} drop={drop}>
            {(c) => (
              <L p={p} at={[0, 0]} dx={-8} dy={28} color={c}>
                <Vn n="0" />
              </L>
            )}
          </Red>
        </g>
      )}
    </Plane>
  );
}

// ℝ³: v₃ = v₁ + v₂ in the plane of v₁, v₂
const D1 = floorPoint(1.75, 0.05);
const D2 = floorPoint(0.15, 1.45);
const D3 = plus(D1, D2);
const D_FLOOR = [-0.3, 2.2];

function InAPlane({ amber, drop }) {
  const box = fit([[0, 0, 0], D1, D2, D3, ...floorCorners(D_FLOOR)], PW, PH, { pad: 20, swing: 0 });
  return (
    <Space width={PW} height={PH} {...box} rock={false} axes={false} title="v3 = v1 + v2 in the plane of v1 and v2; v3 removed, v1, v2 a basis of the plane">
      {(s) => (
        <g>
          <Floor s={s} range={D_FLOOR} />
          <Seg3 s={s} from={D1} to={D3} color={GRAY} width={1.6} dashed />
          <Seg3 s={s} from={D2} to={D3} color={GRAY} width={1.6} dashed />
          <Red amber={amber} drop={drop} ghost={ghost3(s, D3)}>
            {(c) => <Arrow3 s={s} to={D3} color={c} width={3.2} />}
          </Red>
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Arrow3 s={s} to={D1} color={c} width={3.2} />
                <Arrow3 s={s} to={D2} color={c} width={3.2} />
              </g>
            )}
          </Keep>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Lbl s={s} at={D1} dx={6} dy={-8} color={c}>
                  <Vn n="v" i={1} />
                </Lbl>
                <Lbl s={s} at={D2} dx={-30} dy={10} color={c}>
                  <Vn n="v" i={2} />
                </Lbl>
              </g>
            )}
          </Keep>
          <Red amber={amber} drop={drop}>
            {(c) => (
              <Lbl s={s} at={D3} dx={8} dy={16} color={c}>
                <Vn n="v" i={3} />
              </Lbl>
            )}
          </Red>
        </g>
      )}
    </Space>
  );
}

// ℝ³: v₂ = −2v₁ on a line, and v₃ off it
const E1 = [0.16, 0.9, 0.74];
const E2 = times(-2, E1);
const E3 = [0.6, -0.6, 1.3];
const E_LINE = [times(1.5, E1), times(-2.4, E1)];

function LineAndOne({ amber, drop }) {
  const box = fit([[0, 0, 0], ...E_LINE, E3], PW, PH, { pad: 24, swing: 0 });
  return (
    <Space width={PW} height={PH} {...box} rock={false} axes={false} title="v2 = −2 v1 on a line, and v3 off it; v2 removed, v1, v3 a basis of their plane">
      {(s) => (
        <g>
          <Seg3 s={s} from={E_LINE[1]} to={E_LINE[0]} color={GRAY} width={1.6} dashed />
          <Red amber={amber} drop={drop} ghost={ghost3(s, E2)}>
            {(c) => <Arrow3 s={s} to={E2} color={c} width={3.2} />}
          </Red>
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Arrow3 s={s} to={E1} color={c} width={3.2} />
                <Arrow3 s={s} to={E3} color={c} width={3.2} />
              </g>
            )}
          </Keep>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Lbl s={s} at={E1} dx={12} dy={18} color={c}>
                  <Vn n="v" i={1} />
                </Lbl>
                <Lbl s={s} at={E3} dx={-30} dy={4} color={c}>
                  <Vn n="v" i={3} />
                </Lbl>
              </g>
            )}
          </Keep>
          <Red amber={amber} drop={drop}>
            {(c) => (
              <Lbl s={s} at={E2} dx={14} dy={10} color={c}>
                <Vn n="v" i={2} />
              </Lbl>
            )}
          </Red>
        </g>
      )}
    </Space>
  );
}

// ℝ³: three edges of a box and its diagonal, v₄ = v₁ + v₂ + v₃. The box is turned 25° in the floor so
// that no two of the four arrows line up on the screen. Like the other ℝ³ pictures it does not rock
// (the user: rocking looked like the vectors scaling), but it can still be turned with the mouse
const F1 = [1.63, 0.76, 0];
const F2 = [-0.63, 1.36, 0];
const F3 = [0, 0, 1.3];
const F4 = plus(plus(F1, F2), F3);
const EDGES = [
  [plus(F1, F2), F1],
  [plus(F1, F2), F2],
  [plus(F1, F2), F4],
  [plus(F1, F3), F1],
  [plus(F1, F3), F3],
  [plus(F1, F3), F4],
  [plus(F2, F3), F2],
  [plus(F2, F3), F3],
  [plus(F2, F3), F4],
];

function Box({ amber, drop }) {
  const box = fit([[0, 0, 0], F1, F2, F3, F4, plus(F1, F2), plus(F1, F3), plus(F2, F3)], PW, PH, { pad: 24, swing: 0 });
  return (
    <Space width={PW} height={PH} {...box} rock={false} axes={false} title="Three edges v1, v2, v3 of a box and its diagonal v4 = v1 + v2 + v3; v4 removed, v1, v2, v3 a basis of R3">
      {(s) => (
        <g>
          {EDGES.map(([a, b], i) => (
            <Seg3 key={i} s={s} from={a} to={b} color={GRAY} width={1.4} dashed />
          ))}
          <Red amber={amber} drop={drop} ghost={ghost3(s, F4)}>
            {(c) => <Arrow3 s={s} to={F4} color={c} width={3.2} />}
          </Red>
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Arrow3 s={s} to={F1} color={c} width={3.2} />
                <Arrow3 s={s} to={F2} color={c} width={3.2} />
                <Arrow3 s={s} to={F3} color={c} width={3.2} />
              </g>
            )}
          </Keep>
          <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
          <Keep drop={drop}>
            {(c) => (
              <g>
                <Lbl s={s} at={F1} dx={-32} dy={12} color={c}>
                  <Vn n="v" i={1} />
                </Lbl>
                <Lbl s={s} at={F2} dx={6} dy={22} color={c}>
                  <Vn n="v" i={2} />
                </Lbl>
                <Lbl s={s} at={F3} dx={-30} dy={4} color={c}>
                  <Vn n="v" i={3} />
                </Lbl>
              </g>
            )}
          </Keep>
          <Red amber={amber} drop={drop}>
            {(c) => (
              <Lbl s={s} at={F4} dx={8} dy={-6} color={c}>
                <Vn n="v" i={4} />
              </Lbl>
            )}
          </Red>
        </g>
      )}
    </Space>
  );
}

/**
 * Each example: its picture (`<Pic amber drop />`), its vanishing combination, the relation that puts
 * the amber vector in the span of the others, and the basis left when it is removed (green) with
 * the span it is a basis of.
 */
export const DEPENDENT_R2 = [
  {
    Pic: OnALine,
    zero: r`3\,\vv v_1+2\,\vv v_2=\vv 0`,
    relation: String.raw`${hl(r`\vv v_2`)}=-\tfrac32\,\vv v_1`,
    basis: [r`\vv v_1`, r`\operatorname{span}\{\vv v_1,\vv v_2\}`],
  },
  {
    Pic: Triangle,
    zero: r`\vv v_1+\vv v_2+\vv v_3=\vv 0`,
    relation: String.raw`${hl(r`\vv v_3`)}=-\vv v_1-\vv v_2`,
    basis: [r`\vv v_1,\vv v_2`, r`\mathbb R^2`],
  },
  {
    Pic: WithZero,
    zero: r`0\,\vv v_1+0\,\vv v_2+1\cdot\vv 0=\vv 0`,
    relation: String.raw`${hl(r`\vv 0`)}=0\,\vv v_1+0\,\vv v_2`,
    basis: [r`\vv v_1,\vv v_2`, r`\mathbb R^2`],
  },
];

export const DEPENDENT_R3 = [
  {
    Pic: InAPlane,
    zero: r`\vv v_1+\vv v_2-\vv v_3=\vv 0`,
    relation: String.raw`${hl(r`\vv v_3`)}=\vv v_1+\vv v_2`,
    basis: [r`\vv v_1,\vv v_2`, r`\operatorname{span}\{\vv v_1,\vv v_2,\vv v_3\}`],
  },
  {
    Pic: LineAndOne,
    zero: r`2\,\vv v_1+\vv v_2+0\,\vv v_3=\vv 0`,
    relation: String.raw`${hl(r`\vv v_2`)}=-2\,\vv v_1`,
    basis: [r`\vv v_1,\vv v_3`, r`\operatorname{span}\{\vv v_1,\vv v_2,\vv v_3\}`],
  },
  {
    Pic: Box,
    zero: r`\vv v_1+\vv v_2+\vv v_3-\vv v_4=\vv 0`,
    relation: String.raw`${hl(r`\vv v_4`)}=\vv v_1+\vv v_2+\vv v_3`,
    basis: [r`\vv v_1,\vv v_2,\vv v_3`, r`\mathbb R^3`],
  },
];

/**
 * A row of examples, a card each, three key presses per card: the card with its vanishing combination
 * (0, 3, 6); its redundant vector turning amber, with the relation (1, 4, 7); the vector removed and
 * the basis that is left, green (2, 5, 8).
 */
export function DependentCards({ examples }) {
  return (
    <div className="l20-pair l20-redund l20-dep">
      {examples.map(({ Pic, zero, relation, basis }, i) => {
        const k = 3 * i;
        const body = (
          <>
            <Pic amber={k + 1} drop={k + 2} />
            <figcaption>
              <Tex tex={zero} />
              <Fragment index={k + 1} as="span" className="l20-cap2">
                <Tex tex={relation} />
              </Fragment>
              <Fragment index={k + 2} as="span" className="l20-cap2">
                <Tex tex={G(basis[0])} /> is a basis of <Tex tex={basis[1]} />
              </Fragment>
            </figcaption>
          </>
        );
        return i === 0 ? (
          <figure key={zero}>{body}</figure>
        ) : (
          <Fragment key={zero} index={k} as="figure">
            {body}
          </Fragment>
        );
      })}
    </div>
  );
}
