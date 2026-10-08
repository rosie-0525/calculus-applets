import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, Dot, PlaneLabel, RightAngle } from '../components/Plane.jsx';
import { ProjText } from '../components/Space.jsx';
import Slider from '../components/Slider.jsx';
import { dot, minus, norm, times } from '../components/vec.js';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GREEN = '#175e54';

// The line L = span(v) and the point x (Christine's picture)
export const V = [4, 1];
export const X = [2, 3];
export const BEST = dot(X, V) / dot(V, V); // 11/17
export const P = times(BEST, V);

export const fmt2 = (x) => (Math.round(x * 100) / 100).toFixed(2).replace('-', '−');

/**
 * A point c v of the line, moved by a slider, and its distance to x; the
 * distance is smallest where the dashed segment meets the line at a right angle.
 * On key press 2 the picture shows Proj_v(x), where the dashed segment lands.
 */
export function ClosestExplorer() {
  const [c, setC] = useState(0.2);
  const onC = (t) => setC(Math.abs(t - BEST) < 0.025 ? BEST : t);
  const q = times(c, V);
  const dist = norm(minus(X, q));
  const atBest = c === BEST;

  return (
    <div className="angle-explorer">
      <Plane
        xRange={[-1.4, 5.2]}
        yRange={[-1.1, 3.7]}
        unit={70}
        grid={false}
        xTicks={[]}
        yTicks={[]}
        title="A line through the origin, a point x, and a point on the line whose distance to x is shown"
      >
        {(p) => (
          <g>
            <line
              x1={p.px(-1.4)}
              y1={p.py(-0.35)}
              x2={p.px(5.2)}
              y2={p.py(1.3)}
              stroke={GREEN}
              strokeWidth="2"
            />
            <PlaneLabel p={p} at={[4.9, 1.225]} dx={-6} dy={24} color={GREEN} size={18}>
              L
            </PlaneLabel>
            <Arrow p={p} to={V} color={GREEN} width={3.4} />
            <PlaneLabel p={p} at={V} dx={-14} dy={26} color={GREEN}>
              v
            </PlaneLabel>

            <line
              x1={p.px(q[0])}
              y1={p.py(q[1])}
              x2={p.px(X[0])}
              y2={p.py(X[1])}
              stroke={atBest ? CARDINAL : '#6b7280'}
              strokeWidth="2.2"
              strokeDasharray="8 6"
            />
            {atBest && <RightAngle p={p} at={P} a={X} b={[0, 0]} size={13} color={CARDINAL} />}

            <Fragment as="g" index={2}>
              <Arrow p={p} to={P} color={TEAL} width={4} />
              <PlaneLabel p={p} at={P} dx={-34} dy={34} color={TEAL} size={17}>
                <ProjText sub="v" />
              </PlaneLabel>
            </Fragment>

            <Arrow p={p} to={X} color={INK} width={3.5} />
            <PlaneLabel p={p} at={X} dx={8} dy={-6} color={INK}>
              x
            </PlaneLabel>
            <Dot p={p} at={q} color={INK} r={6} />
            <Dot p={p} at={[0, 0]} color={INK} r={4} />
          </g>
        )}
      </Plane>
      <div className="lc-sliders">
        <Slider
          name="c"
          label={<Tex tex="c" />}
          value={c}
          onChange={onC}
          color={GREEN}
          min={-0.3}
          max={1.3}
          step={0.01}
          format={fmt2}
        />
      </div>
      <div className="angle-readout">
        <div className="row">
          <span className="what">
            <Tex tex={r`\lVert\vv{x}-c\,\vv{v}\rVert`} />
          </span>
          <span className={atBest ? 'sign-neg' : undefined}>
            = {fmt2(dist)}
            {atBest && ' smallest!'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Slide14ClosestPoint() {
  return (
    <section className="dense">
      <h2>Closest point on a line</h2>

      <div className="stage">
        <div className="stage-text">
          <p className="compact">
            Which point on <Tex tex={r`L=\operatorname{span}(\vv{v})`} /> is closest to <Tex tex={r`\vv{x}`} />?
          </p>

          <Fragment index={1} as="p" className="compact">
            Closest where the dashed segment is <strong>perpendicular</strong> to <Tex tex="L" />.
          </Fragment>

          <Fragment index={2} as="p" className="compact">
            The closest point is <Tex tex={r`\operatorname{Proj}_{\vv{v}}(\vv{x})`} />.
          </Fragment>
        </div>

        <div className="stage-fig">
          <ClosestExplorer />
        </div>
      </div>

      <Notes time="2:00 · running total 25:30">
        <p>
          Why is the projection the closest point? This is question III, the closest vector, for the
          simplest subspace: a line through 0, L = span(v). Given x, which point of the line is
          closest to it?
        </p>
        <p>
          <em>[drag c slowly from 0 to 1]</em> The black dot is c v, a point of the line, and the
          readout is its distance to x. It goes down, then up again. <em>[stop at the minimum]</em>{' '}
          Smallest here.
        </p>
        <p>
          <em>[Key press]</em> At the closest point, the dashed segment meets the line at a right angle.
          Any other point of the line is farther: the dashed segment would be the hypotenuse of a
          right triangle.
        </p>
        <p>
          <em>[Key press]</em> And we know that point: x − Proj_v(x) is perpendicular to v, so the
          dashed segment lands at Proj_v(x). The closest point is the projection, and the smallest
          distance is the 2.43 we computed two slides ago. This works in any ℝⁿ, because x and v
          always lie in some plane.
        </p>
      </Notes>
    </section>
  );
}
