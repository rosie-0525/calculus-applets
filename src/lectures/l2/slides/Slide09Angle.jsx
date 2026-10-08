import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, PlaneLabel, AngleArc, RightAngle } from '../components/Plane.jsx';
import Slider from '../components/Slider.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const GREEN = '#175e54';

// w is fixed; v has a fixed length and makes the angle θ with w.
export const W_DEG = 15;
export const W_LEN = 3;
export const V_LEN = 2.4;

export const polar = (len, deg) => [
  len * Math.cos((deg * Math.PI) / 180),
  len * Math.sin((deg * Math.PI) / 180),
];
export const fmt2 = (x) => {
  const t = x.toFixed(2);
  return t === '-0.00' ? '0.00' : t.replace('-', '−');
};

/** v and w with the angle θ between them set by a slider, and a live v · w. */
export function AngleExplorer() {
  const [theta, setTheta] = useState(60);
  const w = polar(W_LEN, W_DEG);
  const v = polar(V_LEN, W_DEG + theta);
  const cos = Math.cos((theta * Math.PI) / 180);
  const d = V_LEN * W_LEN * cos;
  const kind = theta === 90 ? 'zero' : theta < 90 ? 'pos' : 'neg';
  const arcColor = { pos: TEAL, zero: GREEN, neg: CARDINAL }[kind];
  const bis = polar(0.95, W_DEG + theta / 2);

  return (
    <div className="angle-explorer">
      <Plane
        xRange={[-2.8, 3.4]}
        yRange={[-1.2, 3]}
        unit={58}
        title="v and w with the angle theta between them, set by the slider"
      >
        {(p) => (
          <g>
            {kind === 'zero' ? (
              <RightAngle p={p} at={[0, 0]} a={w} b={v} size={22} color={arcColor} />
            ) : (
              <AngleArc p={p} a={w} b={v} radius={36} color={arcColor} width={2.5} />
            )}
            <PlaneLabel p={p} at={bis} dx={-6} dy={6} color={arcColor} size={17}>
              θ
            </PlaneLabel>
            <Arrow p={p} to={w} color={TEAL} />
            <PlaneLabel p={p} at={w} dx={6} dy={18} color={TEAL}>
              w
            </PlaneLabel>
            <Arrow p={p} to={v} color={CARDINAL} />
            <PlaneLabel p={p} at={v} dx={v[0] < 0 ? -20 : 6} dy={-8} color={CARDINAL}>
              v
            </PlaneLabel>
          </g>
        )}
      </Plane>

      <div className="lc-sliders">
        <Slider
          name="theta"
          label={<Tex tex={r`\theta`} />}
          value={theta}
          onChange={setTheta}
          color={arcColor}
          min={0}
          max={180}
          step={1}
        />
      </div>

      <div className="angle-readout">
        <div className="row">
          <span className="what">
            <Tex tex={r`\cos\theta`} />
          </span>
          <span>{fmt2(cos)}</span>
        </div>
        <div className="row">
          <span className="what">
            <Tex tex={r`\vv{v}\cdot\vv{w}`} />
          </span>
          <span className={`sign-${kind}`}>
            {fmt2(d)}{' '}
            {kind === 'pos' ? '(positive)' : kind === 'neg' ? '(negative)' : '(zero: orthogonal)'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Slide09Angle() {
  return (
    <section className="dense">
      <h2>Dot products measure angles</h2>

      <div className="stage">
        <div className="stage-text">
          <Fragment index={1} className="block theorem">
            <p className="block-title">Theorem</p>
            <p className="compact">
              If <Tex tex={r`\theta`} /> is the angle between nonzero vectors{' '}
              <Tex tex={r`\vv{v}`} /> and <Tex tex={r`\vv{w}`} />, then
            </p>
            <Tex display tex={r`\vv{v}\cdot\vv{w}=\norm{\vv{v}}\,\norm{\vv{w}}\cos\theta,`} />
            <p className="compact">or equivalently</p>
            <Tex
              display
              tex={r`\cos\theta=\frac{\vv{v}\cdot\vv{w}}{\norm{\vv{v}}\,\norm{\vv{w}}}.`}
            />
          </Fragment>

          <ul className="bullets compact" style={{ marginTop: '0.5em', fontSize: '0.8em' }}>
            <Fragment index={3} as="li">
              <Tex tex={r`\vv{v}\cdot\vv{w}=0`} /> exactly when <Tex tex={r`\vv{v}`} /> and{' '}
              <Tex tex={r`\vv{w}`} /> are <strong>perpendicular</strong>/<strong>orthogonal</strong>{' '}
              (or one of <Tex tex={r`\vv{v}`} />, <Tex tex={r`\vv{w}`} /> is zero).
            </Fragment>
            <Fragment index={4} as="li">
              <strong>Cauchy–Schwarz inequality:</strong>{' '}
              <Tex tex={r`|\vv{v}\cdot\vv{w}|\le\norm{\vv{v}}\,\norm{\vv{w}}`} />.
            </Fragment>
          </ul>

          <Fragment index={5} className="pointer muted">
            → derivation from the Law of Cosines: §2.5; another proof of Cauchy–Schwarz: §2.3
          </Fragment>
        </div>

        <Fragment index={2} as="div" className="stage-fig">
          <AngleExplorer />
        </Fragment>
      </div>

      <Notes time="4:00 · running total 16:15">
        <p>
          <em>[Key press]</em> Here is the key fact of the day. The dot product is the product of
          the two lengths, times the <strong>cosine of the angle</strong> between the vectors.
          Divide by the lengths and you get cos θ by itself — the lengths are exactly what we wanted
          to strip away on the last slide.
        </p>
        <p>
          <em>[Key press]</em> Let us see it move. w is fixed, v swings around. Drag θ from 0 up.
          Small angle: cos θ near 1, dot product big and positive. <em>[drag to 90]</em> At 90° the
          dot product is exactly zero. <em>[drag past 90]</em> Past 90° it goes negative, and at
          180° — pointing in opposite directions — it is as negative as it can be.
        </p>
        <p>
          <em>[Key press]</em> That zero case gets a name. v · w = 0 exactly when v and w are{' '}
          <strong>perpendicular</strong>, also called <strong>orthogonal</strong>. (Or one of them is the zero vector: then v · w = 0 automatically.) This is the
          fastest perpendicularity test there is — no angles, no pictures, just multiply and add.
          And it is how we <em>define</em> perpendicular in ℝⁿ, where we cannot draw.
        </p>
        <p>
          <em>[Key press]</em> Since cos θ is between −1 and 1, the dot product can never be bigger
          in size than the product of the lengths. That is the{' '}
          <strong>Cauchy–Schwarz inequality</strong>. It is what guarantees the fraction for cos θ
          really is between −1 and 1, so the angle makes sense in any dimension.
        </p>
        <p>
          <em>[Key press]</em> Where does the formula come from? The Law of Cosines, applied to the
          triangle with sides v, w and v − w — that is §2.5, worth reading. §2.3 has another proof
          of Cauchy–Schwarz.
        </p>
      </Notes>
    </section>
  );
}
