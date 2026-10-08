import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { AngleArc, Arrow, Dot, PlaneLabel, RightAngle } from '../components/Plane.jsx';
import { ProjText, Sub } from '../components/Space.jsx';
import Slider from '../components/Slider.jsx';
import { dot, norm, plus, proj, times } from '../components/vec.js';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import WarningSign from '../components/WarningSign.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GRAY = '#6b7280';

export const X_RANGE = [-2.0, 5.4];
export const Y_RANGE = [-1.0, 4.0];

export const dir = (deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];

// v1 is fixed and v2 makes the angle theta with it (90°: an orthogonal basis). The vector u is
// fixed too: u = 3 e1 + 2 e2 when theta = 90°, where e1, e2 are the unit vectors along v1, v2.
export const A1 = 10;
export const LEN = 1.2;
export const V1 = times(LEN, dir(A1));
export const U = plus(times(3, dir(A1)), times(2, dir(A1 + 90)));
export const P1 = proj(U, V1);

/** The ends of the line span(d) inside the picture. */
export function lineEnds(d) {
  let lo = -Infinity;
  let hi = Infinity;
  [X_RANGE, Y_RANGE].forEach(([a, b], i) => {
    if (Math.abs(d[i]) < 1e-9) return;
    lo = Math.max(lo, Math.min(a / d[i], b / d[i]));
    hi = Math.min(hi, Math.max(a / d[i], b / d[i]));
  });
  return [times(lo, d), times(hi, d)];
}

/**
 * Where to put the label of a point of the line span(e): beside the line, on the side away
 * from u, `gap` units out. Returns the point and the text anchor.
 */
export function beside(at, e, gap) {
  let n = [-e[1], e[0]];
  if (dot(n, U) > 0) n = times(-1, n);
  const anchor = n[0] < -0.3 ? 'end' : n[0] > 0.3 ? 'start' : 'middle';
  return { at: plus(at, times(gap, n)), anchor, below: n[1] < 0 };
}

export function Label({ p, spot, color, size, children }) {
  return (
    <PlaneLabel
      p={p}
      at={spot.at}
      dy={spot.below ? size * 0.75 : 0}
      color={color}
      size={size}
      textAnchor={spot.anchor}
    >
      {children}
    </PlaneLabel>
  );
}

/**
 * u, the orthogonal basis v1, v2 and the projections of u onto the two lines: the sides of a
 * rectangle with diagonal u. The slider tilts v2 towards v1; the projections then add up to the teal dot,
 * not to u.
 */
export function SumOfProjections() {
  const [theta, setTheta] = useState(90);
  const onTheta = (t) => setTheta(t >= 88 ? 90 : t);
  const square = theta === 90;

  const e2 = dir(A1 + theta);
  const V2 = times(LEN, e2);
  const P2 = proj(U, V2);
  const S = plus(P1, P2);
  const e1 = dir(A1);
  // the θ label goes inside the angle, on the side away from u
  const uDeg = (Math.atan2(U[1], U[0]) * 180) / Math.PI;
  const thetaDeg = [A1 + theta / 4, A1 + (3 * theta) / 4].sort(
    (a, b) => Math.abs(b - uDeg) - Math.abs(a - uDeg)
  )[0];

  return (
    <div className="angle-explorer">
      <Plane
        xRange={X_RANGE}
        yRange={Y_RANGE}
        unit={64}
        grid={false}
        axes={false}
        title="A vector u, two basis vectors v1 and v2, and the projections of u onto the lines they span"
      >
        {(p) => (
          <g>
            {[e1, e2].map((e, i) => {
              const [a, b] = lineEnds(e);
              return (
                <line
                  key={i}
                  x1={p.px(a[0])}
                  y1={p.py(a[1])}
                  x2={p.px(b[0])}
                  y2={p.py(b[1])}
                  stroke="#d1d5db"
                  strokeWidth="1.8"
                />
              );
            })}

            {!square && (
              <g>
                {[P1, P2].map((q, i) => (
                  <line
                    key={i}
                    x1={p.px(q[0])}
                    y1={p.py(q[1])}
                    x2={p.px(S[0])}
                    y2={p.py(S[1])}
                    stroke={TEAL}
                    strokeWidth="1.6"
                    strokeDasharray="6 5"
                  />
                ))}
              </g>
            )}

            {[P1, P2].map((q, i) => (
              <line
                key={i}
                x1={p.px(U[0])}
                y1={p.py(U[1])}
                x2={p.px(q[0])}
                y2={p.py(q[1])}
                stroke={GRAY}
                strokeWidth="1.6"
                strokeDasharray="8 6"
              />
            ))}

            <Fragment as="g" index={1}>
              <RightAngle p={p} at={P1} a={U} b={[0, 0]} size={12} color={GRAY} />
              {norm(P2) > 0.25 && <RightAngle p={p} at={P2} a={U} b={[0, 0]} size={12} color={GRAY} />}
              <Label p={p} spot={beside(P1, e1, 0.3)} color={TEAL} size={19}>
                <ProjText sub="v1" arg="u" />
              </Label>
              <Label p={p} spot={beside(P2, e2, 0.3)} color={TEAL} size={19}>
                <ProjText sub="v2" arg="u" />
              </Label>
            </Fragment>

            <Arrow p={p} to={P1} color={TEAL} width={4} />
            <Arrow p={p} to={P2} color={TEAL} width={4} />
            {!square && <Dot p={p} at={S} color={TEAL} r={6.5} />}

            <Arrow p={p} to={V1} color={CARDINAL} width={3} head={12} />
            <Arrow p={p} to={V2} color={CARDINAL} width={3} head={12} />
            {square ? (
              <RightAngle p={p} at={[0, 0]} a={V1} b={V2} size={13} color={GRAY} />
            ) : (
              <g>
                <AngleArc p={p} a={V1} b={V2} radius={30} color={GRAY} />
                <PlaneLabel p={p} at={times(0.68, dir(thetaDeg))} dx={-5} dy={6} color={GRAY} size={18}>
                  θ
                </PlaneLabel>
              </g>
            )}
            <Label p={p} spot={beside(V1, e1, 0.3)} color={CARDINAL} size={22}>
              v<Sub>1</Sub>
            </Label>
            <Label p={p} spot={beside(V2, e2, 0.3)} color={CARDINAL} size={22}>
              v<Sub>2</Sub>
            </Label>

            <Arrow p={p} to={U} color={INK} width={3.5} />
            <PlaneLabel p={p} at={U} dx={8} dy={-8} color={INK} size={22}>
              u
            </PlaneLabel>
            <Dot p={p} at={[0, 0]} color={INK} r={4} />
          </g>
        )}
      </Plane>

      <Fragment index={3}>
        <div className="lc-sliders">
          <Slider
            name="angle between v1 and v2"
            label={<Tex tex={r`\theta`} />}
            value={theta}
            onChange={onTheta}
            color={CARDINAL}
            min={45}
            max={90}
            step={1}
            format={(t) => `${Math.round(t)}°`}
          />
        </div>
        <div className="angle-readout">
          <div className="row">
            <Tex tex={r`\operatorname{Proj}_{\vv{v}_1}(\vv{u})+\operatorname{Proj}_{\vv{v}_2}(\vv{u})`} />
            <span className={square ? 'sign-zero' : 'sign-neg'}>
              {square ? (
                <>
                  = <Tex tex={r`\vv{u}`} />
                </>
              ) : (
                <>
                  ≠ <Tex tex={r`\vv{u}`} />
                </>
              )}
            </span>
          </div>
        </div>
      </Fragment>
    </div>
  );
}

export default function Slide17ProjFourier() {
  return (
    <section className="dense">
      <h2>Projections and the Fourier formula</h2>

      <div className="stage">
        <div className="stage-text">
          <p className="compact">
            Let <Tex tex={r`\{\vv{v}_1,\vv{v}_2\}`} /> be an orthogonal basis of a plane and{' '}
            <Tex tex={r`\vv{u}`} /> a vector in the plane. By the Fourier formula:
          </p>
          <FxMarker index={1} id="pf-brace" />
          <Tex
            display
            className="centered pf-formula"
            tex={r`\vv{u}={\htmlClass{fx-pf}{\underbrace{\textcolor{#0e7490}{\left(\frac{\vv{u}\cdot\vv{v}_1}{\vv{v}_1\cdot\vv{v}_1}\right)\vv{v}_1}}_{\htmlClass{fx-pf-label}{\textcolor{#0e7490}{\operatorname{Proj}_{\vv{v}_1}(\vv{u})}}}}}
                   +{\htmlClass{fx-pf}{\underbrace{\textcolor{#0e7490}{\left(\frac{\vv{u}\cdot\vv{v}_2}{\vv{v}_2\cdot\vv{v}_2}\right)\vv{v}_2}}_{\htmlClass{fx-pf-label}{\textcolor{#0e7490}{\operatorname{Proj}_{\vv{v}_2}(\vv{u})}}}}}.`}
          />

          <Fragment index={2} className="key-box pf-box compact">
            <p>A vector is the sum of its projections onto the vectors of an orthogonal basis:</p>
            <Tex
              display
              className="centered"
              tex={r`\vv{u}=\textcolor{#0e7490}{\operatorname{Proj}_{\vv{v}_1}(\vv{u})}
                     +\textcolor{#0e7490}{\operatorname{Proj}_{\vv{v}_2}(\vv{u})}.`}
            />
          </Fragment>

          <Fragment index={3}>
            <p className="warning compact">
              <WarningSign /> <strong>Careful!</strong> Only for an <strong>orthogonal</strong> basis.
            </p>
          </Fragment>
        </div>

        <div className="stage-fig">
          <SumOfProjections />
        </div>
      </div>

      <Notes time="2:30 · running total 30:30">
        <p>
          Back to the Fourier formula, with two vectors. v₁ and v₂ are orthogonal, and u is in their
          plane. The Fourier formula writes u as the sum of two teal terms: in the picture, the sides
          of a rectangle whose diagonal is u.
        </p>
        <p>
          <em>[Key press]</em> Look at the first coefficient: u · v₁ over v₁ · v₁. That is exactly the
          coefficient in the projection formula, so the first term is Proj_v₁(u), and the second is
          Proj_v₂(u). In the picture, the dashed sides of the rectangle meet the two lines at right
          angles: the corners are the closest points to u on each line.
        </p>
        <p>
          <em>[Key press]</em> So u is the sum of its projections onto v₁ and v₂. With k orthogonal
          vectors it is the same: u = Proj_v₁(u) + ⋯ + Proj_v_k(u).
        </p>
        <p>
          <em>[Key press]</em> This needs the right angle between v₁ and v₂. <em>[drag θ to about 60°]</em>{' '}
          The projections are still the closest points on the two lines, but they add up to the teal
          dot, not to u. <em>[drag θ towards 45°]</em> The closer v₂ gets to v₁, the closer the sum
          gets to twice Proj_v₁(u). <em>[back to 90°]</em> Only at 90° does the sum land on u. This is
          the warning of Example 2, in a picture.
        </p>
      </Notes>
    </section>
  );
}
