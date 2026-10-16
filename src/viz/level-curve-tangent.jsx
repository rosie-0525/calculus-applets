import { useEffect, useRef, useState } from 'react';
import '../lectures/l11/styles/deck.css';
import { Arrow, RightAngle } from '../lectures/l11/components/Plane.jsx';
import { CubicContour, NamedPoint } from '../lectures/l11/components/Cubic.jsx';
import { B, I, MAIN } from '../lectures/l11/components/svgmath.jsx';
import { MovingX, A, G, TIP, TDIR, RED, TEAL, INK } from '../lectures/l11/slides/Slide09Normal2D.jsx';

export const lecture = 11;

const GLIDE = 2.2; // s: x glides along the level curve to a (as on the slide), then back
const HOLD = 1.2; // s: it waits at each end
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

/** Where x is after `s` seconds: 0 far from a, 1 close to it, there and back again. */
function glide(s) {
  const k = s % (2 * (GLIDE + HOLD));
  if (k < GLIDE) return ease(k / GLIDE);
  if (k < GLIDE + HOLD) return 1;
  if (k < 2 * GLIDE + HOLD) return 1 - ease((k - GLIDE - HOLD) / GLIDE);
  return 0;
}

const still = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Seconds counted while the applet is on screen (its section `present`), from 0 (x far from a);
 * under prefers-reduced-motion, a still with x close to a.
 */
function useClock(ref) {
  const [s, setS] = useState(() => (still() ? GLIDE : 0));
  useEffect(() => {
    if (still()) return undefined;
    let id;
    let last;
    const tick = (now) => {
      if (ref.current?.closest('section')?.classList.contains('present') && last !== undefined) setS((v) => v + (now - last) / 1000);
      last = now;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [ref]);
  return s;
}

/*
 * Gradient and level curves with every step showing, without the theorem and the why (the caption
 * says them): Example 2's contour plot with a = (1, 0) and the direction of ∇f(a); a point x of the
 * level curve through a, which glides along it close to a (on the slide once, on a key press;
 * here again and again, while on screen), the segment from a to x turning perpendicular to ∇f(a);
 * and the tangent line ∇f(a) · (x − a) = 0 with its right angle.
 */
export default function LevelCurveTangent() {
  const ref = useRef(null);
  const t = glide(useClock(ref));
  return (
    <div ref={ref}>
      <CubicContour title="Contour plot of f(x, y) = x³ + xy + y² with the point a = (1, 0), the gradient there, the tangent line to the level curve through a, and a point x of that level curve gliding towards a">
        {(p) => (
          <g>
            <line
              x1={p.px(A[0] - 1.6 * TDIR[0])}
              y1={p.py(A[1] - 1.6 * TDIR[1])}
              x2={p.px(A[0] + 1.6 * TDIR[0])}
              y2={p.py(A[1] + 1.6 * TDIR[1])}
              stroke={TEAL}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <RightAngle p={p} at={A} a={[A[0] + TDIR[0], A[1] + TDIR[1]]} b={[A[0] + G[0], A[1] + G[1]]} color={TEAL} size={12} />
            <MovingX p={p} t={t} />
            <Arrow p={p} from={A} to={TIP} color={RED} width={3} head={12} />
            <text x={p.px(TIP[0]) + 4} y={p.py(TIP[1]) - 10} textAnchor="middle" fontSize="18" fontFamily={MAIN} fill={RED} className="map-label">
              ∇<I>f</I>(<B>a</B>)
            </text>
            <NamedPoint p={p} at={A} />
            <text x={p.px(A[0]) - 10} y={p.py(A[1]) + 18} textAnchor="end" fontSize="19" fontFamily={MAIN} fill={INK} className="map-label">
              <B>a</B>
            </text>
          </g>
        )}
      </CubicContour>
    </div>
  );
}
