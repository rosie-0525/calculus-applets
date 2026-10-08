import { useEffect, useState } from 'react';
import '../lectures/l6/styles/deck.css';
import Tex, { r } from '../lectures/l6/components/Tex.jsx';
import { Arrow, PlaneLabel, RightAngle } from '../lectures/l6/components/Plane.jsx';
import { ProjText } from '../lectures/l6/components/Space.jsx';
import { minus, plus, times } from '../lectures/l6/components/vec.js';
import { useTween } from '../lectures/l6/components/useFragmentTween.js';
import { Canvas, U, V, PV, VP, GREEN, INK, GRAY } from '../lectures/l6/slides/Slide05OrthogonalBasis.jsx';

export const lecture = 6;

/*
 * The slide's two pictures. On the slide v turns into v′ once, on a key press; here over and over:
 * v for a moment, then its tip slides parallel to u (the slide's tween: 0.6 s wait, 1.8 s glide),
 * then v′ for a while, with Proj_u(v), the vector its tip slid by, and back to v. Without motion,
 * the end stays.
 */
const SHOW_V = 1200; // ms of v before the tween is switched on
const SHOW_REST = 600 + 1800 + 3400; // ms from switching it on until v comes back
const TEAL = '#0e7490';
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The slide's second picture (SlideFigure in the slide), with Proj_u(v) as on the next slide: wide
 * and pale along u, fading in once v has become v′.
 */
function SlidingFigure({ t }) {
  const tip = minus(V, times(t, PV));
  const done = t > 0.999;
  const a = plus(V, times(0.25, PV));
  const b = minus(V, times(1.25, PV));
  return (
    <Canvas title="u and v; the tip of v slides parallel to u until v is perpendicular to u: that is v prime, and v minus v prime is the projection of v onto u">
      {(p) => (
        <g>
          {/* the track of the tip, parallel to u, and where v was */}
          <line x1={p.px(a[0])} y1={p.py(a[1])} x2={p.px(b[0])} y2={p.py(b[1])} stroke={GRAY} strokeWidth="1.5" strokeDasharray="6 6" />
          <Arrow p={p} to={V} color="#9ca3af" width={2.2} head={11} dashed />
          <PlaneLabel p={p} at={V} dx={6} dy={22} color="#9ca3af" opacity={Math.min(1, 5 * t)}>
            v
          </PlaneLabel>

          <g style={{ opacity: done ? 1 : 0, transition: done ? 'opacity 0.6s' : 'none' }}>
            <Arrow p={p} to={PV} color={TEAL} width={10} head={22} opacity={0.4} />
            <PlaneLabel p={p} at={PV} dx={-44} dy={36} color={TEAL} size={18}>
              <ProjText sub="u" arg="v" />
            </PlaneLabel>
          </g>

          <RightAngle p={p} at={[0, 0]} a={VP} b={U} size={12} color={GREEN} opacity={done ? 1 : 0} />
          <Arrow p={p} to={tip} color={done ? GREEN : INK} width={3.5} />
          <PlaneLabel p={p} at={tip} dx={-30} dy={0} color={done ? GREEN : INK}>
            {done ? 'v′' : 'v'}
          </PlaneLabel>
        </g>
      )}
    </Canvas>
  );
}

export default function OrthogonalBasis() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (still()) return undefined;
    const timer = setTimeout(() => setOn(!on), on ? SHOW_REST : SHOW_V);
    return () => clearTimeout(timer);
  }, [on]);
  const t = useTween(on);

  return (
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
      <figure>
        <SlidingFigure t={still() ? 1 : t} />
        <figcaption>
          <Tex tex={r`\vv{u},\ \vv{v}'=\vv{v}-\operatorname{Proj}_{\vv{u}}(\vv{v})`} />: orthogonal
        </figcaption>
      </figure>
    </div>
  );
}
