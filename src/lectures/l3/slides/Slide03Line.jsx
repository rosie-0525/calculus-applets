import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, Dot, PlaneLabel } from '../components/Plane.jsx';
import Space, { Arrow3, Seg3, Dot3, Label3 } from '../components/Space.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GRAY = '#6b7280';

// The line through p in the direction of v, in the plane and in space
export const P2 = [-0.8, 0.4];
export const V2 = [0.8, 0.4];
export const lineAt2 = (t) => P2.map((c, i) => c + t * V2[i]);

export const P0 = [0.3, -0.8, 0.6];
export const V = [0.3, 0.7, 0.55];
export const lineAt = (t) => P0.map((c, i) => c + t * V[i]);

export const fmt = (c) => {
  const q = Math.round(c * 100) / 100 || 0; // no "−0"
  return `${q}`.replace('-', '−');
};
export const coords = (x) => `(${x.map(fmt).join(', ')})`;

/** The line in ℝ², p, v, and the point x = p + t v. */
export function LineInR2({ t }) {
  const x = lineAt2(t);
  return (
    <Plane
      xRange={[-2.7, 2.7]}
      yRange={[-1.4, 2.6]}
      unit={56}
      xTicks={[-1, 1, 2]}
      yTicks={[-1, 1, 2]}
      title="A line in the plane through p in the direction of v, and the point p + t v"
    >
      {(p) => {
        const [a, b] = [lineAt2(-2.3), lineAt2(4)];
        return (
          <g>
            <line
              x1={p.px(a[0])}
              y1={p.py(a[1])}
              x2={p.px(b[0])}
              y2={p.py(b[1])}
              stroke={GRAY}
              strokeWidth="2"
            />
            <PlaneLabel p={p} at={b} dx={-16} dy={-10} color={GRAY} size={16}>
              L
            </PlaneLabel>

            {/* the displacement x − p = t v */}
            <Fragment as="g" index={1}>
              <Arrow p={p} from={P2} to={x} color={CARDINAL} width={9} head={0} opacity={0.22} />
            </Fragment>

            {/* v, drawn at p */}
            <Arrow p={p} from={P2} to={lineAt2(1)} color={CARDINAL} width={3} head={12} />
            <PlaneLabel p={p} at={lineAt2(0.5)} dx={4} dy={22} color={CARDINAL} size={18}>
              v
            </PlaneLabel>

            <Dot p={p} at={P2} color={TEAL} r={5} />
            <PlaneLabel p={p} at={P2} dx={-22} dy={-6} color={TEAL} size={18}>
              p
            </PlaneLabel>

            <Fragment as="g" index={1}>
              <Dot p={p} at={x} color={INK} r={5.5} />
              <PlaneLabel p={p} at={x} dx={-20} dy={-10} color={INK} size={18}>
                x
              </PlaneLabel>
            </Fragment>
          </g>
        );
      }}
    </Plane>
  );
}

/** The line in ℝ³, p, v, and the point x = p + t v. */
export function LineInR3({ t }) {
  const x = lineAt(t);
  return (
    <Space
      width={360}
      height={268}
      unit={62}
      center={[0.5, 0.62]}
      axisLen={[2, 2.2, 2.4]}
      title="A line in space through p in the direction of v, and the point p + t v"
    >
      {(s) => (
        <g>
          <Seg3 s={s} from={lineAt(-2.6)} to={lineAt(3.5)} color={GRAY} width={2} />
          <Label3 s={s} at={lineAt(3.5)} dx={8} dy={-2} color={GRAY} size={16}>
            L
          </Label3>

          {/* p */}
          <Dot3 s={s} at={P0} color={TEAL} r={5} />
          <Label3 s={s} at={P0} dx={-24} dy={6} color={TEAL}>
            p
          </Label3>

          {/* v, drawn at p */}
          <Arrow3 s={s} from={P0} to={lineAt(1)} color={CARDINAL} />
          <Label3 s={s} at={lineAt(0.5)} dx={8} dy={22} color={CARDINAL}>
            v
          </Label3>

          {/* x, and the displacement x − p = t v */}
          <Fragment as="g" index={1}>
            <Arrow3 s={s} from={P0} to={x} color={CARDINAL} width={9} head={0} opacity={0.22} />
            <Dot3 s={s} at={x} color={INK} r={5.5} />
            <Label3 s={s} at={x} dx={-20} dy={-10} color={INK}>
              x
            </Label3>
          </Fragment>
        </g>
      )}
    </Space>
  );
}

/** The same picture in ℝ² and in ℝ³, with one slider for t driving both. */
export function LineExplorer() {
  const [t, setT] = useState(1.5);

  return (
    <div className="angle-explorer line-explorer">
      <div className="pictures-pair">
        <figure>
          <LineInR2 t={t} />
          <figcaption>
            in <Tex tex={r`\mathbb{R}^2`} />
            <Fragment as="span" index={1}>
              : <Tex tex={r`\vv{x}`} /> = {coords(lineAt2(t))}
            </Fragment>
          </figcaption>
        </figure>
        <figure>
          <LineInR3 t={t} />
          <figcaption>
            in <Tex tex={r`\mathbb{R}^3`} />
            <Fragment as="span" index={1}>
              : <Tex tex={r`\vv{x}`} /> = {coords(lineAt(t))}
            </Fragment>
          </figcaption>
        </figure>
      </div>

      <Fragment index={1} className="lc-sliders">
        <Slider
          name="t"
          label={<Tex tex="t" />}
          value={t}
          onChange={setT}
          color={INK}
          min={-2}
          max={3}
          step={0.1}
        />
      </Fragment>
    </div>
  );
}

export default function Slide03Line() {
  return (
    <section className="dense">
      <h2>How to describe a line</h2>

      <div className="stage">
        <div className="stage-text">
          <p className="compact">
            A line <Tex tex="L" /> is determined by a point <Tex tex={r`\vv{p}`} /> on it, and a
            direction <Tex tex={r`\vv{v}`} />.
          </p>

          <Fragment index={1} className="block definition">
            <p className="block-title">Parametric form of a line</p>
            <p className="compact">
              <Tex tex="L" /> is the collection of points
            </p>
            <Tex display tex={r`\vv{x}=\vv{p}+t\vv{v},\qquad t\in\mathbb{R}.`} />
            <p className="compact">
              The number <Tex tex="t" /> is called a <strong>parameter</strong>.
            </p>
          </Fragment>
        </div>

        <div className="stage-fig">
          <LineExplorer />
        </div>
      </div>

      <Notes time="4:00 · running total 6:00">
        <p>
          Lines first. A line L, in the plane or in space, is pinned down by a point p it passes
          through and a direction v. On the left a line in the plane, on the right a line in space:
          p is the teal point and v is the cardinal arrow drawn starting at p.
        </p>
        <p>
          <em>[Key press]</em> Take any point x on the line. Go from p to x: the displacement
          x − p points along the line, so it is a multiple of v, say t v. Move p to the other
          side: x = p + t v. This is the{' '}
          <strong>parametric form</strong> of the line, and t is the <strong>parameter</strong>.
          Every value of t gives a point on L, and every point on L comes from exactly one t. It is
          the bullet from the motivation: p is the muzzle, v is the direction the gun points, t says
          how far it has flown.
        </p>
        <p>
          <em>[drag the slider]</em> Watch x move, in both pictures at once. t = 1 puts you at p + v, the tip of the
          arrow; t = 2 twice as far; t = 0 is p itself.
        </p>
        <p>
          And negative t? <em>[drag to −1]</em> You walk backwards from p, in
          the direction of −v. So one number, t, keeps track of where you are on the line, measured
          from the starting point p. Remember this "one parameter": a plane is going to need two.
        </p>
      </Notes>
    </section>
  );
}
