import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, Dot, PlaneLabel, RightAngle } from '../components/Plane.jsx';
import Fragment from '../components/Fragment.jsx';
import { minus, plus, times, proj } from '../components/vec.js';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';

export const CARDINAL = '#8c1515';
export const GREEN = '#175e54';
export const INK = '#14213d';
export const GRAY = '#6b7280';

export const U = [4, 1];
export const V = [2, 3];
export const PV = proj(V, U); // Proj_u(v)
export const VP = minus(V, PV); // v' = v − Proj_u(v)

export const X_RANGE = [-1.3, 4.9];

/** The bare canvas of both pictures: the line of u, u itself, and the origin. */
export function Canvas({ title, children }) {
  return (
    <Plane xRange={X_RANGE} yRange={[-0.6, 3.6]} unit={68} grid={false} axes={false} title={title}>
      {(p) => (
        <g>
          <line
            x1={p.px(X_RANGE[0])}
            y1={p.py(X_RANGE[0] / 4)}
            x2={p.px(X_RANGE[1])}
            y2={p.py(X_RANGE[1] / 4)}
            stroke={GRAY}
            strokeWidth="1"
            opacity="0.6"
          />
          {children(p)}
          <Arrow p={p} to={U} color={CARDINAL} width={3.5} />
          <PlaneLabel p={p} at={U} dx={4} dy={22} color={CARDINAL}>
            u
          </PlaneLabel>
          <Dot p={p} at={[0, 0]} color={INK} r={4} />
        </g>
      )}
    </Plane>
  );
}

/**
 * The second picture: v slides, its tip moving parallel to u (along the dashed track), until it is
 * at a right angle to u: that is v'. `t` runs from 0 (v) to 1 (v'). A PDF of the deck cannot run
 * the animation, so it shows the end (`.anim-print`) instead of the moving arrow (`.anim-live`).
 */
export function SlideFigure({ t }) {
  const tip = minus(V, times(t, PV));
  const done = t > 0.999;
  const a = plus(V, times(0.25, PV));
  const b = minus(V, times(1.25, PV));
  return (
    <Canvas title="u and v; the tip of v slides parallel to u until v is perpendicular to u: that is v prime">
      {(p) => (
        <g>
          {/* the track of the tip, parallel to u, and where v was */}
          <line x1={p.px(a[0])} y1={p.py(a[1])} x2={p.px(b[0])} y2={p.py(b[1])} stroke={GRAY} strokeWidth="1.5" strokeDasharray="6 6" />
          <Arrow p={p} to={V} color="#9ca3af" width={2.2} head={11} dashed />

          <g className="anim-live">
            {/* the label of where v was comes in as v moves away from it */}
            <PlaneLabel p={p} at={V} dx={6} dy={22} color="#9ca3af" opacity={Math.min(1, 5 * t)}>
              v
            </PlaneLabel>
            <RightAngle p={p} at={[0, 0]} a={VP} b={U} size={12} color={GREEN} opacity={done ? 1 : 0} />
            <Arrow p={p} to={tip} color={done ? GREEN : INK} width={3.5} />
            <PlaneLabel p={p} at={tip} dx={-30} dy={0} color={done ? GREEN : INK}>
              {done ? 'v′' : 'v'}
            </PlaneLabel>
          </g>
          <g className="anim-print">
            <PlaneLabel p={p} at={V} dx={6} dy={22} color="#9ca3af">
              v
            </PlaneLabel>
            <RightAngle p={p} at={[0, 0]} a={VP} b={U} size={12} color={GREEN} />
            <Arrow p={p} to={VP} color={GREEN} width={3.5} />
            <PlaneLabel p={p} at={VP} dx={-30} dy={0} color={GREEN}>
              v′
            </PlaneLabel>
          </g>
        </g>
      )}
    </Canvas>
  );
}

/**
 * u and v are not orthogonal (left). Key press 1: the second picture, where v turns into v',
 * orthogonal to u, by sliding its tip parallel to u (an animation); 2: how do we write v'?
 */
export default function Slide05OrthogonalBasis() {
  const second = useRef(null);
  const t = useTween(useFragmentShown(second));

  return (
    <section className="dense">
      <h2>An orthogonal basis for a plane</h2>

      <p className="compact">
        We know a basis <Tex tex={r`\vv{u},\vv{v}`} /> of a plane in <Tex tex={r`\mathbb{R}^n`} />, but{' '}
        <Tex tex={r`\vv{u}`} /> and <Tex tex={r`\vv{v}`} /> are not orthogonal. Let’s replace{' '}
        <Tex tex={r`\vv{v}`} /> by a vector <Tex tex={r`\vv{v}'`} /> of the plane at a right angle to{' '}
        <Tex tex={r`\vv{u}`} />.
      </p>

      <div className="ortho-pair">
        <figure>
          <Canvas title="u and v, which are not orthogonal">
            {(p) => (
              <g>
                <Arrow p={p} to={V} color={INK} width={3.5} />
                <PlaneLabel p={p} at={V} dx={8} dy={0} color={INK}>
                  v
                </PlaneLabel>
              </g>
            )}
          </Canvas>
          <figcaption>
            <Tex tex={r`\vv{u},\vv{v}`} />: not orthogonal
          </figcaption>
        </figure>

        <figure ref={second} className="fragment" data-fragment-index={1}>
          <SlideFigure t={t} />
          <figcaption>
            <Tex tex={r`\vv{u},\vv{v}'`} />: orthogonal
          </figcaption>
        </figure>
      </div>

      <Fragment index={2} className="motiv-question ortho-question">
        How can we write <Tex tex={r`\vv{v}'`} /> in terms of <Tex tex={r`\vv{u}`} /> and{' '}
        <Tex tex={r`\vv{v}`} />?
      </Fragment>
    </section>
  );
}
