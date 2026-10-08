import { useEffect, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, PlaneLabel, AngleArc } from '../components/Plane.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';

// Unit directions of v and w, 55° apart
export const dir = (deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
export const V_DIR = dir(70);
export const W_DIR = dir(15);

/**
 * A positive multiple that drifts slowly between 1/k and k (period in
 * seconds), starting from 1, for as long as the deck is open. Under
 * prefers-reduced-motion it stays at 1.
 */
export function useDrift(k, period) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let id;
    const start = performance.now();
    const tick = (now) => {
      setT((now - start) / 1000);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  return Math.exp(Math.log(k) * Math.sin((2 * Math.PI * t) / period));
}

export const fmt1 = (x) => x.toFixed(1);

/**
 * c v and d w with c and d drifting through positive values on their own:
 * the arrows stretch and shrink, but the angle between them stays put.
 */
export function ScalingPicture() {
  const c = useDrift(1.7, 5);
  const d = useDrift(1.5, 7);
  const v = [1.55 * c * V_DIR[0], 1.55 * c * V_DIR[1]];
  const w = [1.9 * d * W_DIR[0], 1.9 * d * W_DIR[1]];
  return (
    <Plane
      xRange={[-0.4, 3.2]}
      yRange={[-0.4, 2.8]}
      unit={110}
      title="c v and d w for changing positive c and d; the angle between them does not change"
    >
      {(p) => (
        <g>
          <AngleArc p={p} a={w} b={v} radius={48} color="#175e54" width={2.5} />
          <PlaneLabel
            p={p}
            at={dir(42.5).map((x) => x * 0.72)}
            dx={-4}
            dy={6}
            color="#175e54"
            size={18}
          >
            θ
          </PlaneLabel>
          <Arrow p={p} to={w} color={TEAL} />
          <PlaneLabel p={p} at={w} dx={-10} dy={26} color={TEAL} size={21}>
            {fmt1(d)} w
          </PlaneLabel>
          <Arrow p={p} to={v} color={CARDINAL} />
          <PlaneLabel p={p} at={v} dx={10} dy={4} color={CARDINAL} size={21}>
            {fmt1(c)} v
          </PlaneLabel>
        </g>
      )}
    </Plane>
  );
}

export default function Slide11Poll1() {
  return (
    <section>
      <h2>Poll</h2>

      <div className="stage">
        <div className="stage-text">
          <FxMarker index={1} id="poll-answer" />
          <div className="fx-host block poll">
            <p className="block-title">True or false?</p>
            <p>
              The angle between two nonzero vectors <Tex tex={r`\vv{v}`} /> and{' '}
              <Tex tex={r`\vv{w}`} /> remains the same if we multiply <Tex tex={r`\vv{v}`} /> or{' '}
              <Tex tex={r`\vv{w}`} /> (or both) by a <strong>positive</strong> scalar.
            </p>
            <ul className="poll-options two">
              <li className="correct">
                <span className="opt">A</span> True
              </li>
              <li>
                <span className="opt">B</span> False
              </li>
            </ul>
          </div>
        </div>

        <Fragment index={2} as="figure" className="scale-demo stage-fig">
          <ScalingPicture />
          <figcaption>
            Stretching <Tex tex={r`\vv{v}`} /> and <Tex tex={r`\vv{w}`} /> by positive scalars never
            changes <Tex tex={r`\theta`} />.
          </figcaption>
        </Fragment>
      </div>

      <Notes time="2:30 · running total 21:15">
        <p>
          Vote now. <em>[give them a minute; take the vote]</em>
        </p>
        <p>
          <em>[Key press]</em> <strong>True.</strong>
        </p>
        <p>
          <em>[Key press]</em> Picture: here v and w are being stretched and shrunk by positive
          numbers, all the time. The arrows get longer and shorter, but they never turn, so the
          angle θ between them never changes. This is exactly what happened with Dana: doubling
          Ana's ratings did not change the cosine similarity at all.
        </p>
        <p>
          (If asked: a negative scalar flips the arrow, and the angle becomes 180° − θ. In the
          formula, a c on top and a |c| on the bottom cancel only when c &gt; 0.)
        </p>
      </Notes>
    </section>
  );
}
