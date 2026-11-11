import { useRef, useState } from 'react';
import '../lectures/l22/styles/deck.css';
import Space from '../lectures/l22/components/Space.jsx';
import { STAGES, W, H, EDGE, clamp, settle, Floor, BProj, Verdict } from '../lectures/l22/slides/Slide08ProjTest.jsx';

export const lecture = 22;

/*
 * Existence of solutions, without its title, its box and its recall of how to check the condition
 * (the caption has them): the plane C(A) as a floor and a vector b, which the mouse drags from
 * anywhere on the picture (sideways along the floor, up and down), a ring round its tip. Within a
 * little of the plane b lands on it and is its own projection (pale blue under b): "b ∈ C(A)"; off
 * it, the dotted perpendicular and Proj_C(A)(b) in blue: "b ∉ C(A)"; below the plane, the parts
 * behind it gray. As on the slide's key press 2, b starts in the plane. (The slide's drag, copied.)
 */
export default function Existence() {
  const [raw, setRaw] = useState(STAGES[0].b);
  const grab = useRef(null);
  const geo = useRef(null);
  const { inside } = settle(raw);

  const down = (e) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not a live pointer (a test) */
    }
    const ctm = e.currentTarget.ownerSVGElement.getScreenCTM();
    grab.current = { x: e.clientX, y: e.clientY, scale: ctm ? ctm.a : 1, from: raw, tip: geo.current.P(raw) };
  };
  const move = (e) => {
    const g = grab.current;
    if (!g) return;
    const { unit: u, el, az } = geo.current;
    const tx = clamp(g.tip[0] + (e.clientX - g.x) / g.scale, [EDGE.left, W - EDGE.right]);
    const ty = clamp(g.tip[1] + (e.clientY - g.y) / g.scale, [EDGE.top, H - EDGE.bottom]);
    const side = (tx - g.tip[0]) / u;
    const up = -(ty - g.tip[1]) / (u * Math.cos((el * Math.PI) / 180));
    const a = (az * Math.PI) / 180;
    setRaw([g.from[0] + side * Math.sin(a), g.from[1] + side * Math.cos(a), g.from[2] + up]);
  };
  const release = () => {
    grab.current = null;
  };
  const handlers = { onPointerDown: down, onPointerMove: move, onPointerUp: release, onPointerCancel: release };

  return (
    <div className="l22-proj-pic">
      <Space width={W} height={H} unit={122} center={[0.47, 0.6]} el={26} swing={10} rock={false} axes={false} title="b and its projection onto C(A); drag b">
        {(s) => {
          geo.current = s;
          return (
            <g>
              <Floor s={s} />
              <BProj s={s} raw={raw} handlers={handlers} />
            </g>
          );
        }}
      </Space>
      <p className="l22-verdict-row">
        <Verdict yes={inside} />
      </p>
    </div>
  );
}
