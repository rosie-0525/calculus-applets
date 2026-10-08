import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, Dot, PlaneLabel, RightAngle } from '../components/Plane.jsx';
import Space, { Arrow3, Dot3, Label3, PlanePatch, PlaneGrid, RightAngle3, at } from '../components/Space.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';

// ℝ²: n = (1, 2), the line x + 2y = 0 through 0, and x = (−2, 1) on it
export const N2 = [1, 2];
export const X2 = [-2, 1];
export const X_RANGE = [-3, 3];
export const lineAt = (x) => [x, -x / 2];

/** n in ℝ²; on key press `at`, the line of the vectors perpendicular to it, and one of them. */
export function PerpLine({ at: key }) {
  return (
    <Plane
      xRange={X_RANGE}
      yRange={[-2, 2.5]}
      unit={50}
      title="In R2, the vectors perpendicular to a nonzero vector n form a line through the origin"
    >
      {(p) => (
        <g>
          <Fragment as="g" index={key}>
            <line
              x1={p.px(X_RANGE[0])}
              y1={p.py(lineAt(X_RANGE[0])[1])}
              x2={p.px(X_RANGE[1])}
              y2={p.py(lineAt(X_RANGE[1])[1])}
              stroke={TEAL}
              strokeWidth="3"
              strokeOpacity="0.7"
            />
            <RightAngle p={p} at={[0, 0]} a={N2} b={X2} />
            <Arrow p={p} to={X2} color={INK} width={3} head={12} />
            <PlaneLabel p={p} at={X2} dx={-8} dy={-10} color={INK}>
              x
            </PlaneLabel>
          </Fragment>
          <Arrow p={p} to={N2} color={CARDINAL} />
          <PlaneLabel p={p} at={N2} dx={10} dy={4} color={CARDINAL}>
            n
          </PlaneLabel>
          <Dot p={p} at={[0, 0]} color={INK} r={4} />
        </g>
      )}
    </Plane>
  );
}

// ℝ³: n = (0.6, −0.3, 1), scaled to length 1.5, and the plane 0.6x − 0.3y + z = 0 through 0,
// spanned by E and E2. n leans left on screen, clear of the z-axis, and the plane is seen
// at a slant, so n stands out of it. x is the direction in the plane that looks
// perpendicular to n on screen.
export const O = [0, 0, 0];
export const E = [1, 0, -0.6];
export const E2 = [0, 1, 0.3];
export const N3 = [0.75, -0.37, 1.25];
export const X3 = at(O, E, E2, -0.95, 0.7);

/** n in ℝ³; on key press `at`, the plane of the vectors perpendicular to it, and one of them. */
export function PerpPlane({ at: key }) {
  return (
    <Space
      width={400}
      height={310}
      unit={70}
      center={[0.5, 0.6]}
      axisLen={1.8}
      negAxes={false}
      az={-38}
      el={22}
      swing={10}
      title="In R3, the vectors perpendicular to a nonzero vector n form a plane through the origin"
    >
      {(s) => (
        <g>
          <Fragment as="g" index={key}>
            <PlanePatch s={s} P={O} e={E} e2={E2} range={[-1.4, 1.4]} />
            <PlaneGrid s={s} P={O} e={E} e2={E2} range={[-1.4, 1.4]} color="#b6d5dc" width={0.6} />
            <RightAngle3 s={s} corner={O} a={N3} b={X3} size={0.22} />
            <Arrow3 s={s} to={X3} color={INK} width={2.6} head={11} />
            <Label3 s={s} at={X3} dx={6} dy={-4} color={INK} size={16}>
              x
            </Label3>
          </Fragment>
          <Arrow3 s={s} to={N3} color={CARDINAL} />
          <Label3 s={s} at={N3} dx={-18} dy={-4} color={CARDINAL} size={16}>
            n
          </Label3>
          <Dot3 s={s} at={O} color={INK} r={4} />
        </g>
      )}
    </Space>
  );
}

export default function Slide06aOrthogonality() {
  return (
    <section className="dense">
      <h2>Orthogonality gives subspaces</h2>

      <p className="compact">
        Which vectors <Tex tex={r`\vv{x}`} /> are perpendicular to a given nonzero vector{' '}
        <Tex tex={r`\vv{n}`} />, i.e. satisfy <Tex tex={r`\vv{n}\cdot\vv{x}=0`} />?
      </p>

      <div className="perp-figs">
        <figure>
          <PerpLine at={1} />
          <figcaption>
            in <Tex tex={r`\mathbb{R}^2`} />
            <Fragment as="span" index={1} className="verdict yes">
              a line through <Tex tex={r`\mathbf{0}`} />: dimension 1
            </Fragment>
          </figcaption>
        </figure>
        <Fragment as="figure" index={2}>
          <PerpPlane at={3} />
          <figcaption>
            in <Tex tex={r`\mathbb{R}^3`} />
            <Fragment as="span" index={3} className="verdict yes">
              a plane through <Tex tex={r`\mathbf{0}`} />: dimension 2
            </Fragment>
          </figcaption>
        </Fragment>
      </div>

      <Fragment index={4} className="block theorem">
        <p className="compact">
          For a nonzero vector <Tex tex={r`\vv{n}`} /> in <Tex tex={r`\mathbb{R}^k`} />, the vectors
          perpendicular to <Tex tex={r`\vv{n}`} />,{' '}
          <Tex tex={r`\{\vv{x}\in\mathbb{R}^k:\vv{n}\cdot\vv{x}=0\}`} />, form a linear subspace of{' '}
          <Tex tex={r`\mathbb{R}^k`} /> of dimension <Tex tex="k-1" />.
        </p>
      </Fragment>

      <Notes time="2:00 · running total 15:30">
        <p>
          So far, every linear subspace we have met was handed to us as a span. Here is another
          way they come up all the time: from <strong>orthogonality</strong>. Fix a nonzero vector
          n, and collect every vector perpendicular to it. That collection is always a linear
          subspace. (Nonzero, because every vector is perpendicular to 0.)
        </p>
        <p>
          Start in ℝ², with n = (1, 2). Which vectors are perpendicular to it?{' '}
          <em>[ask the room]</em> <em>[Key press]</em> (−2, 1), and every multiple of it: they fill
          the line through 0 perpendicular to n. Written out, n · x = 0 is x + 2y = 0: the entries
          of n are the coefficients. A line through 0: one-dimensional.
        </p>
        <p>
          <em>[Key press]</em> Now n in ℝ³. <em>[ask the room]</em> <em>[Key press]</em> A whole
          plane through 0: Monday's plane n · x = d with d = 0, so it passes through the origin.
          Two-dimensional. You can drag the picture to turn it.
        </p>
        <p>
          <em>[Key press]</em> The pattern: in ℝᵏ, the vectors perpendicular to one nonzero
          vector form a linear subspace of dimension k − 1, one less than the whole space. One
          condition takes away one dimension. We'll make "dimension" precise in a few minutes;
          for now, a line has dimension 1 and a plane dimension 2.
        </p>
        <p>
          Why a subspace? It passes the test from the last slide: n · 0 = 0, and if n · x = 0 and
          n · y = 0, then n · (c₁x + c₂y) = c₁ n · x + c₂ n · y = 0. To see that it really is a span,
          solve the equation. That is the next example, in ℝ⁴, where we can't draw.
        </p>
        <p>
          <em>[If asked why k − 1]</em> n has a nonzero entry, so n · x = 0 can be solved for that
          variable. The other k − 1 variables are free, and splitting by them gives k − 1 spanning
          vectors.
        </p>
      </Notes>
    </section>
  );
}
