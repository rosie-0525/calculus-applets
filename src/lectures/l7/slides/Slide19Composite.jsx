import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Seg3, Dot3, Label3, PlanePatch } from '../components/Space.jsx';
import { PRINT } from '../components/bay.js';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';

export const T_MAX = 4 * Math.PI;
export const helix = (t) => [Math.cos(t), Math.sin(t), t / 4];

/** The time t of the moving point: it runs along the helix while the slide is showing. */
export function useRunningT(ref) {
  const [t, setT] = useState(2.6 * Math.PI);
  useEffect(() => {
    if (PRINT) return undefined;
    let frame;
    let t0;
    const tick = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present')) {
        if (t0 === undefined) t0 = now;
        setT((((now - t0) / 1000) * 1.1) % T_MAX);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ref]);
  return t;
}

/**
 * The curve f(t) = (cos t, sin t, t/4) with the point f(t) running along it (red), shown with the
 * figure; at the key press `shadowAt`, the point (g ∘ f)(t) = (cos t, sin t, 0) below it (teal) and
 * the circle it goes around.
 */
export function HelixFigure({ shadowAt }) {
  const ref = useRef(null);
  const t = useRunningT(ref);
  const P = helix(t);
  const shadow = [P[0], P[1], 0];
  const N = 240;
  const pts = (s, map) =>
    Array.from({ length: N + 1 }, (_, k) => s.P(map((T_MAX * k) / N)).map((v) => v.toFixed(1)).join(',')).join(' ');
  const halo = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 4 };
  return (
    <div ref={ref}>
      <Space
        width={380}
        height={420}
        unit={78}
        center={[0.5, 0.78]}
        axisLen={[1.9, 1.9, 3.7]}
        az={-30}
        el={20}
        swing={10}
        title="The curve f(t) = (cos t, sin t, t/4) with the point f(t), and below it the point (g ∘ f)(t) on a circle in the xy-plane"
      >
        {(s) => (
          <g>
            <PlanePatch s={s} P={[0, 0, 0]} e={[1, 0, 0]} e2={[0, 1, 0]} range={[-1.6, 1.6]} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
            <Fragment as="g" index={shadowAt}>
              <polyline points={pts(s, (u) => [Math.cos(u), Math.sin(u), 0])} fill="none" stroke={TEAL} strokeWidth="3" />
            </Fragment>
            <polyline points={pts(s, helix)} fill="none" stroke={INK} strokeWidth="2.6" />
            <Fragment as="g" index={shadowAt}>
              <Seg3 s={s} from={P} to={shadow} color={INK} width={2} strokeDasharray="0.1 6" />
              <Dot3 s={s} at={shadow} color={TEAL} r={6} />
              <Label3 s={s} at={shadow} dx={-12} dy={22} color={TEAL} size={17} textAnchor="end" {...halo}>
                g(f(t))
              </Label3>
            </Fragment>
            <Dot3 s={s} at={P} color={CARDINAL} r={6.5} />
            <Label3 s={s} at={P} dx={12} dy={-8} color={CARDINAL} size={17} {...halo}>
              f(t)
            </Label3>
          </g>
        )}
      </Space>
    </div>
  );
}

/**
 * Composite functions (Mark's box). Key press 1: the question, the composition g ∘ f of
 * f(t) = (cos t, sin t, t/4) and g(x, y, z) = (x, y); 2: the answer, (g ∘ f)(t) = (cos t, sin t);
 * 3: the curve f with the point f(t) running along it (red); 4: the point g(f(t)) below it and the
 * circle it goes around (teal); 5: f ∘ g makes no sense.
 */
export default function Slide19Composite() {
  return (
    <section>
      <h2>Composite functions</h2>

      <div className="stage composite">
        <div className="stage-text">
          <div className="block definition">
            <p>
              If <Tex tex={r`\vv{f}:\mathbb{R}^n\to\mathbb{R}^m`} /> and{' '}
              <Tex tex={r`\vv{g}:\mathbb{R}^m\to\mathbb{R}^p`} />, we can form the <strong>composite</strong>{' '}
              function <Tex tex={r`\vv{g}\circ\vv{f}:\mathbb{R}^n\to\mathbb{R}^p`} />, defined as
            </p>
            <Tex display tex={r`(\vv{g}\circ\vv{f})(\vv{x})=\vv{g}\bigl(\vv{f}(\vv{x})\bigr).`} />
          </div>

          <Fragment index={1} className="composite-example">
            <p>
              What is the composition <Tex tex={r`\vv{g}\circ\vv{f}`} /> of{' '}
              <Tex tex={r`\vv{f}(t)=(\cos t,\sin t,t/4)`} /> and <Tex tex={r`\vv{g}(x,y,z)=(x,y)`} />?
            </p>
          </Fragment>

          <Fragment index={2} className="worked-answer composite-answer">
            <p>
              <Tex tex={r`\vv{f}:\mathbb{R}\to\mathbb{R}^3`} /> and <Tex tex={r`\vv{g}:\mathbb{R}^3\to\mathbb{R}^2`} />,
              so <Tex tex={r`\vv{g}\circ\vv{f}:\mathbb{R}\to\mathbb{R}^2`} />, and
            </p>
            <Tex display className="tex-left" tex={r`(\vv{g}\circ\vv{f})(t)=\vv{g}(\cos t,\sin t,t/4)=(\cos t,\sin t).`} />
          </Fragment>

          <Fragment index={5} className="composite-warning">
            <p>
              But <Tex tex={r`\vv{f}\circ\vv{g}`} /> makes no sense: the outputs of <Tex tex={r`\vv{g}`} /> are
              in <Tex tex={r`\mathbb{R}^2`} />, while the inputs of <Tex tex={r`\vv{f}`} /> are numbers.
            </p>
          </Fragment>
        </div>

        <Fragment index={3} className="stage-fig">
          <HelixFigure shadowAt={4} />
        </Fragment>
      </div>
    </section>
  );
}
