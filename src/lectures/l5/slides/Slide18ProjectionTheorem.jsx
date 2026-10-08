import Tex, { r } from '../components/Tex.jsx';
import Space, { Arrow3, Seg3, Dot3, Label3, PlanePatch, PlaneGrid, RightAngle3, Sub, ProjText } from '../components/Space.jsx';
import { plus, times } from '../components/vec.js';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';

// The plane V seen as a floor, an orthogonal basis V1, V2 of it, and x above V
// (the grid is drawn in steps of the unit vectors U1, U2; the basis is shorter, so its
// labels stay clear of the dashed drop from x). Slide 19 draws the same scene.
export const O = [0, 0, 0];
export const U1 = [1, 0.1, 0];
export const U2 = [-0.1, 1, 0];
export const V1 = times(0.7, U1);
export const V2 = times(0.7, U2);
export const UP = [0, 0, 1];
export const P1 = times(1.55, U1); // Proj_v1(x)
export const P2 = times(2.3, U2); // Proj_v2(x)
export const P = plus(P1, P2); // Proj_V(x)
export const X = plus(P, times(2.3, UP));

/**
 * Figure 6.2.1, one piece per key press: x above the plane V; then Proj_V(x), with a dotted
 * perpendicular from x down to V; then an orthogonal basis v1, v2; then Proj_v1(x); then
 * Proj_v2(x), and the two add up to Proj_V(x). (x − Proj_V(x) is on slide 19.)
 */
export function TheoremFigure() {
  return (
    <Space
      width={440}
      height={330}
      unit={76}
      center={[0.42, 0.5]}
      axes={false}
      az={-36}
      el={24}
      swing={8}
      title="The projection of x onto a plane V is the sum of its projections onto an orthogonal basis v1, v2 of V"
    >
      {(s) => (
        <g>
          <PlanePatch s={s} P={O} e={U1} e2={U2} range={[-0.9, 2.1]} range2={[-1, 2.9]} />
          <PlaneGrid s={s} P={O} e={U1} e2={U2} range={[-0.9, 2.1]} range2={[-1, 2.9]} color="#b6d5dc" width={0.7} />
          <Label3 s={s} at={plus(times(-0.9, U1), times(-1, U2))} dx={-26} dy={6} color={TEAL} size={20}>
            V
          </Label3>

          <Fragment as="g" index={3}>
            <Seg3 s={s} from={X} to={P1} color="#6b7280" width={1.4} dashed />
            <Arrow3 s={s} to={P1} color={TEAL} width={3} head={12} />
            <Label3 s={s} at={P1} dx={-70} dy={22} color={TEAL} size={15}>
              <ProjText sub="v1" />
            </Label3>
          </Fragment>
          <Fragment as="g" index={4}>
            <Seg3 s={s} from={X} to={P2} color="#6b7280" width={1.4} dashed />
            <Seg3 s={s} from={P1} to={P} color={TEAL} width={1.4} dashed />
            <Seg3 s={s} from={P2} to={P} color={TEAL} width={1.4} dashed />
            <Arrow3 s={s} to={P2} color={TEAL} width={3} head={12} />
            <Label3 s={s} at={P2} dx={-14} dy={26} color={TEAL} size={15}>
              <ProjText sub="v2" />
            </Label3>
          </Fragment>

          <Fragment as="g" index={1}>
            <Arrow3 s={s} to={P} color={TEAL} width={4} />
            {/* the dotted perpendicular from x down to V. The right angle lies in the plane of x
                and Proj_V(x), drawn over the arrowhead. */}
            <Seg3 s={s} from={X} to={P} color={INK} width={2.4} strokeDasharray="0.1 6.5" />
            <RightAngle3 s={s} corner={P} a={UP} b={times(-1, P)} size={0.3} color={INK} />
            <Label3 s={s} at={P} dx={-20} dy={28} color={TEAL} size={16}>
              <ProjText sub="V" />
            </Label3>
          </Fragment>

          <Fragment as="g" index={2}>
            <Arrow3 s={s} to={V1} color={CARDINAL} width={3} head={12} />
            <Arrow3 s={s} to={V2} color={CARDINAL} width={3} head={12} />
            <RightAngle3 s={s} corner={O} a={V1} b={V2} size={0.16} />
            <Label3 s={s} at={V1} dx={-28} dy={2} color={CARDINAL}>
              v<Sub>1</Sub>
            </Label3>
            <Label3 s={s} at={V2} dx={-10} dy={-10} color={CARDINAL}>
              v<Sub>2</Sub>
            </Label3>
          </Fragment>

          <Arrow3 s={s} to={X} color={INK} width={3.5} />
          <Dot3 s={s} at={O} color={INK} r={4} />
          <Label3 s={s} at={X} dx={8} dy={-4} color={INK}>
            x
          </Label3>
        </g>
      )}
    </Space>
  );
}

export default function Slide18ProjectionTheorem() {
  return (
    <section className="dense">
      <h2>Projection onto a subspace</h2>

      <div className="stage">
        <div className="stage-text">
          <p className="compact">
            Let <Tex tex="V" /> be a subspace of <Tex tex={r`\mathbb{R}^n`} /> and let{' '}
            <Tex tex={r`\vv{x}`} /> be any point of <Tex tex={r`\mathbb{R}^n`} />.
          </p>
          <Fragment index={1} as="p" className="compact">
            The <strong>projection of </strong>
            <Tex tex={r`\vv{x}`} />
            <strong> onto </strong>
            <Tex tex="V" />, <Tex tex={r`\operatorname{Proj}_V(\vv{x})`} />, is the point in{' '}
            <Tex tex="V" />{' '}
            <span className="nowrap">
              closest to <Tex tex={r`\vv{x}`} />.
            </span>
          </Fragment>

          <Fragment index={2} className="block theorem below-text">
            <p className="block-title">Orthogonal projection theorem</p>
            <p className="compact">
              If <Tex tex={r`\vv{v}_1,\dots,\vv{v}_k`} /> is an orthogonal basis of <Tex tex="V" /> then:
            </p>
            <Tex
              display
              tex={r`\operatorname{Proj}_V(\vv{x})=\operatorname{Proj}_{\vv{v}_1}(\vv{x})+\operatorname{Proj}_{\vv{v}_2}(\vv{x})+\cdots+\operatorname{Proj}_{\vv{v}_k}(\vv{x}).`}
            />
            <p className="pointer right">(→ Theorem 6.2.1)</p>
          </Fragment>
        </div>

        <div className="stage-fig">
          <TheoremFigure />
        </div>
      </div>

      <Notes time="2:30 · running total 33:00">
        <p>
          Now any subspace V, not just a line, and any point x of ℝⁿ. In the picture V is a plane
          and x is above it.
        </p>
        <p>
          <em>[Key press]</em> The closest point of V to x is again called the projection, Proj_V(x).
          The dotted line drops from x to V perpendicular to the plane, and lands at Proj_V(x).
        </p>
        <p>
          <em>[Key press]</em> To compute it, take an orthogonal basis of V: here v₁, v₂. Then Proj_V(x)
          is the sum of the projections onto the basis vectors, one line at a time.
        </p>
        <p>
          <em>[Key press]</em> Project x onto the line of v₁: the gray segment is perpendicular to v₁…
        </p>
        <p>
          <em>[Key press]</em> …and onto the line of v₂. <em>[drag the picture]</em> Neither gray
          segment is perpendicular to the plane: each is tilted. Yet the two projections add up
          (parallelogram law, here a rectangle) to Proj_V(x). If x were in V, this would be the
          Fourier formula of the previous slide.
        </p>
        <p>
          Why does this need an orthogonal basis? Proj_V(x) is in V, so it is some combination c₁v₁ + c₂v₂;
          and x − Proj_V(x) is perpendicular to v₁ and v₂. Dot with v_i and you get exactly the Fourier
          coefficients, c_i = x · v_i / v_i · v_i. With a non-orthogonal basis the sum of projections
          is simply the wrong vector.
        </p>
      </Notes>
    </section>
  );
}
