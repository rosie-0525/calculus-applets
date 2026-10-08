import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Space, { Arrow3, Dot3, Label3, PlanePatch, PlaneGrid, at } from '../components/Space.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';
export const GRAY = '#6b7280';

// The plane P + t v + t' v'
export const P0 = [1, 1, 2];
export const E = [2, 1, -1];
export const E2 = [0, 2, 1];

export const fmt = (c) => `${Math.round(c * 100) / 100 || 0}`.replace('-', '−');

/** The plane with its grid of t- and t'-lines, and the point P + t v + t' v' set by two sliders. */
export function PlaneExplorer() {
  const [t, setT] = useState(0);
  const [u, setU] = useState(0);
  const X = at(P0, E, E2, t, u);
  const mid = at(P0, E, E2, t, 0); // P + t v, the corner of the path
  return (
    <div className="angle-explorer">
      <Space
        width={470}
        height={330}
        unit={29}
        center={[0.42, 0.66]}
        axisLen={[3.2, 5.2, 4.6]}
        az={-36}
        el={22}
        swing={10}
        title="The plane P + t v + t' v' with its grid, and the point given by the sliders"
      >
        {(s) => (
          <g>
            <PlanePatch s={s} P={P0} e={E} e2={E2} range={[-2.3, 2.3]} />
            <PlaneGrid s={s} P={P0} e={E} e2={E2} range={[-2, 2]} color="#8fc0cb" />

            {/* P, v, v' */}
            <Arrow3 s={s} from={P0} to={at(P0, E, E2, 1, 0)} color={CARDINAL} />
            <Arrow3 s={s} from={P0} to={at(P0, E, E2, 0, 1)} color={CARDINAL} />
            <Label3 s={s} at={at(P0, E, E2, 0.8, 0)} dx={10} dy={12} color={CARDINAL}>
              v
            </Label3>
            <Label3 s={s} at={at(P0, E, E2, 0, 0.5)} dx={-24} dy={0} color={CARDINAL}>
              v′
            </Label3>
            <Dot3 s={s} at={P0} color={INK} r={5} />
            <Label3 s={s} at={P0} dx={-22} dy={18} color={INK}>
              P
            </Label3>

            {/* the path P → P + t v → P + t v + t' v', the arrow from P, and the point */}
            <Arrow3 s={s} from={P0} to={mid} color={TEAL} width={8} head={0} opacity={0.3} />
            <Arrow3 s={s} from={mid} to={X} color={TEAL} width={8} head={0} opacity={0.3} />
            <Arrow3 s={s} from={P0} to={X} color={TEAL} width={2.5} head={12} />
            <Dot3 s={s} at={X} color={TEAL} r={6} />
          </g>
        )}
      </Space>

      <div className="lc-sliders slider-pair">
        <Slider name="t" label={<Tex tex="t" />} value={t} onChange={setT} color={INK} min={-2} max={2} step={0.5} />
        <Slider name="t prime" label={<Tex tex="t'" />} value={u} onChange={setU} color={INK} min={-2} max={2} step={0.5} />
      </div>
      <div className="angle-readout">
        <div className="row">
          <span className="what" style={{ width: '8em' }}>
            <Tex tex={r`P+t\vv{v}+t'\vv{v}'`} />
          </span>
          <span className="sign-pos">
            ({fmt(X[0])}, {fmt(X[1])}, {fmt(X[2])})
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Slide09Parametric() {
  return (
    <section className="dense">
      <h2>Adding a parameter</h2>

      <div className="stage">
        <div className="stage-text">
          <div className="block definition">
            <p className="block-title">Parametric form of a plane</p>
            <p className="compact">
              Given a point <Tex tex="P" /> and two vectors{' '}
              <Tex tex={r`\vv{v}`} /> and <Tex tex={r`\vv{v}'`} /> that are <em>not scalar multiples
              of each other</em>, the points
            </p>
            <Tex display tex={r`P+t\vv{v}+t'\vv{v}',\qquad t,t'\in\mathbb{R},`} />
            <p className="compact">
              form a plane. The <Tex tex="t" /> and <Tex tex="t'" /> are called{' '}
              <strong>parameters</strong>.
            </p>
          </div>

          <p className="compact" style={{ marginTop: '0.5em' }}>
            e.g. a plane passing through <Tex tex={r`P=(1,1,2)`} /> and parallel to the vectors{' '}
            <Tex tex={r`\vv{v}=(2,1,-1)`} /> and <Tex tex={r`\vv{v}'=(0,2,1)`} /> is described by
          </p>
          <Fragment index={1}>
            <Tex display tex={r`P+t\vv{v}+t'\vv{v}'=(1+2t,\ 1+t+2t',\ 2-t+t').`} />
          </Fragment>

          <Fragment index={2} as="p" className="aside">
            Why not scalar multiples?
          </Fragment>
        </div>

        <div className="stage-fig">
          <PlaneExplorer />
        </div>
      </div>

      <Notes time="3:00 · running total 14:30">
        <p>
          Now planes, starting from what we just did for lines: the parametric form. Start at a point P in the plane, and take two directions v and v′ along the
          plane. Walk t units along v, then t′ units along v′, and you land at P + tv + t′v′. As t
          and t′ run over all real numbers, you reach every point of the plane, each one exactly
          once. Two parameters, because a plane is two-dimensional.
        </p>
        <p>
          <em>[drag the sliders]</em> Watch the teal point: the first slider slides it along v, the
          second along v′.
        </p>
        <p>
          <em>[Key press]</em> Its coordinates come out as three formulas in t and t′: (1 + 2t,
          1 + t + 2t′, 2 − t + t′). Note what we did not do: solve anything. Plug in numbers, get a point. That is why computer graphics loves
          this form: to draw a path on a surface, just vary t and t′.
        </p>
        <p>
          <em>[Key press]</em> Why do v and v′ have to point in different directions? If v′ were a
          multiple of v, the second walk would just be more of the first: P + (t + ct′)v, which only
          traces out a line. That is the one thing to check when you build a parametric form.
        </p>
      </Notes>
    </section>
  );
}
