import { Fragment as Keyed, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { Arrow3, Seg3, Dot3, Patch3, RightAngle3 } from '../components/Space.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { Lbl, Vn } from '../components/GS3D.jsx';
import { PRINT } from '../components/print.js';
import { clipIn } from '../components/clip.js';
import { INK, BLUE, TEAL, GRAY } from '../components/ls.js';

export const PROJ_COLOR = BLUE; // the projection, blue (the user's request; first red, then green, then black)

export const L = 1.35;
export const PATCH = [
  [-L, -L, 0],
  [L, -L, 0],
  [L, L, 0],
  [-L, L, 0],
];
// b in C(A) on key press 2; the presenter drags it from there (a second stage, b jumping above the
// plane on the next key press, was removed at the user's request: "I'll move b around to explain")
export const STAGES = [{ at: 2, b: [-0.45, 1.15, 0] }];
export const W = 640;
export const H = 330;
export const SNAP = 0.08; // within this height of the plane, b lands on it
export const EDGE = { left: 22, right: 46, top: 42, bottom: 22 }; // where b's tip may go (pixels)
export const PROJ = r`\operatorname{Proj}_{C(A)}(\vv b)`;
export const clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
export const scale = (k, p) => p.map((c) => k * c);

/** b as drawn: on the plane C(A) (z = 0) within SNAP of it; its height h; on the plane or not. */
export function settle(raw) {
  const inside = Math.abs(raw[2]) < SNAP;
  return { b: inside ? [raw[0], raw[1], 0] : raw, h: inside ? 0 : raw[2], inside };
}

export function Floor({ s }) {
  return (
    <g>
      <Patch3 s={s} corners={PATCH} fill={TEAL} opacity={0.12} stroke={TEAL} strokeOpacity={0.5} />
      <Lbl s={s} at={[L, -L, 0]} dx={14} dy={8} color={TEAL} size={22}>
        <tspan fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic">
          C
        </tspan>
        (
        <tspan fontFamily="KaTeX_Math, Georgia, serif" fontStyle="italic">
          A
        </tspan>
        )
      </Lbl>
    </g>
  );
}

/**
 * b (`raw`, before it lands on the plane) and Proj_C(A)(b): in the plane, b is its own projection
 * (pale red under b); off it, the projection in red with the dotted perpendicular (rule 17); below
 * the plane, the parts of b and of the perpendicular behind the plane gray. `handlers`: the drag on
 * b's tip (live mode).
 */
export function BProj({ s, raw, handlers }) {
  const { b, h, inside } = settle(raw);
  const foot = [b[0], b[1], 0];
  const O = s.P([0, 0, 0]);
  const T = s.P(b);
  const F = s.P(foot);
  const poly = PATCH.map(s.P);
  const below = h < 0;
  const cut = below ? clipIn(O, T, poly) : null; // b's part behind the plane: [0, cut[1]]
  const hidden = cut ? cut[1] : 0;
  const tipHidden = below && hidden > 1 - 1e-6;
  const d = below ? clipIn(T, F, poly) : null; // the perpendicular's part behind the plane
  const along = (t) => b.map((c, i) => c + t * (foot[i] - c));
  const dotted = (from, to, color) => <Seg3 s={s} from={from} to={to} color={color} width={2.6} strokeDasharray="0.1 6.5" />;
  const mid = s.P(scale(0.5, foot));
  const proj = inside ? (
    <Arrow3 s={s} to={b} color={PROJ_COLOR} width={11} head={24} opacity={0.35} />
  ) : (
    <Arrow3 s={s} to={foot} color={PROJ_COLOR} width={3.6} />
  );
  const bArrow = (
    <g>
      <Arrow3 s={s} to={b} color={tipHidden ? GRAY : INK} width={3.6} />
      {below && !tipHidden && hidden > 0 && <Seg3 s={s} from={[0, 0, 0]} to={scale(hidden, b)} color={GRAY} width={3.6} />}
    </g>
  );
  return (
    <g>
      {!inside && (
        <g>
          {d && d[0] > 0 && dotted(b, along(d[0]), INK)}
          {d && dotted(along(d[0]), along(d[1]), GRAY)}
          {dotted(d ? along(d[1]) : b, foot, INK)}
          <RightAngle3 s={s} corner={foot} a={[0, 0, Math.sign(h)]} b={[1, 0, 0]} size={0.18} color={below && d && d[1] > 1 - 1e-6 ? GRAY : INK} />
        </g>
      )}
      {/* b below the plane is behind the projection, which lies in the plane */}
      {below ? bArrow : proj}
      {below ? proj : bArrow}
      <Dot3 s={s} at={[0, 0, 0]} color={INK} r={4} />
      <Lbl s={s} at={b} dx={inside ? -2 : 10} dy={inside ? -14 : -4} color={tipHidden ? GRAY : INK} size={24} anchor={inside ? 'middle' : 'start'}>
        <Vn n="b" />
      </Lbl>
      <TexSvg x={mid[0] + 6} y={mid[1] + 34} anchor="middle" color={PROJ_COLOR} size={24} tex={PROJ} />
      {/* b is dragged from anywhere on the picture (the user's request; rule 17b), a breathing ring
          round its tip */}
      {handlers && <circle cx={T[0]} cy={T[1]} r={15} className="l15-grab" />}
      {handlers && (
        <g className="l22-grab" data-prevent-swipe {...handlers}>
          <rect x="0" y="0" width={W} height={H} fill="transparent" />
        </g>
      )}
    </g>
  );
}

/** "b ∈ C(A)" (green) or "b ∉ C(A)" (red). */
export function Verdict({ yes }) {
  return (
    <span className={`l22-verdict ${yes ? 'yes' : 'no'}`}>
      <Tex tex={yes ? r`\vv b\in C(A)` : r`\vv b\notin C(A)`} />
    </span>
  );
}

/**
 * Existence of solutions (titled Is b in C(A)? before; the user's request): the box says Ax = b has
 * a solution ⟺ b ∈ C(A); key press 1 adds ⟺ Proj_{C(A)}(b) = b, Mark's criterion (the textbook's
 * Remark 21.2.8). Then one picture (the two of the
 * old T-chart combined, at the user's request): key press 2, b in the plane C(A), its own
 * projection (pale red under b), "b ∈ C(A)" under the picture; off the
 * plane: the dotted perpendicular, Proj_{C(A)}(b) red (rule 17), "b ∉ C(A)". The presenter can drag
 * b anywhere, from anywhere on the picture (the user's request; first by its tip only, the rest of
 * the picture turning the view), a breathing ring round its tip (sideways and up and down): within SNAP of the plane it lands on it; below it, the parts behind
 * the plane gray. (A key press that made b jump above the plane, "b ∉ C(A)", was removed at the user's request: the presenter moves b.) The picture is on the left (the user's request);
 * on the right, the recall of how to check the condition: key press 3, "To check this condition, we:"
 * and step 1, find an orthogonal basis {w₁, …, w_k} for C(A) using Gram–Schmidt (Lecture 20); 4, step
 * 2, compute Proj_{C(A)}(b) using the orthogonal projection formula, written under it (Lecture 5's). Print:
 * b in the plane.
 */
export default function Slide08ProjTest() {
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

  // print: a still per stage, each until the next one's key press
  const still = (i, child, as) => {
    const next = STAGES[i + 1]?.at;
    const inner = next ? (
      <Fragment as={as} index={next} effect="fade-out">
        {child}
      </Fragment>
    ) : (
      child
    );
    return i === 0 ? (
      inner
    ) : (
      <Fragment as={as} index={STAGES[i].at}>
        {inner}
      </Fragment>
    );
  };

  return (
    <section>
      <h2>Existence of solutions</h2>

      <div className="block theorem l22-proj-box">
        <p>
          <Tex tex={r`A\vv x=\vv b`} /> has a solution <Tex tex={r`\iff\vv b\in C(A)`} />
          <Fragment index={1} as="span">
            {' '}
            <Tex tex={r`\iff \operatorname{Proj}_{C(A)}(\vv b)=\vv b`} />
          </Fragment>
        </p>
      </div>

      <div className="l22-proj-row">
      <Fragment index={2} className="l22-proj-pic">
        <Space width={W} height={H} unit={122} center={[0.47, 0.6]} el={26} swing={10} rock={false} axes={false} title="b and its projection onto C(A); drag b">
          {(s) => {
            geo.current = s;
            return (
              <g>
                <Floor s={s} />
                {PRINT ? (
                  STAGES.map((st, i) => <Keyed key={i}>{still(i, <BProj s={s} raw={st.b} />, 'g')}</Keyed>)
                ) : (
                  <BProj s={s} raw={raw} handlers={handlers} />
                )}
              </g>
            );
          }}
        </Space>
        <p className="l22-verdict-row">
          {PRINT ? (
            <span className="l22-verdict-stack">
              {STAGES.map((st, i) => (
                <Keyed key={i}>{still(i, <Verdict yes={settle(st.b).inside} />, 'span')}</Keyed>
              ))}
            </span>
          ) : (
            <Verdict yes={inside} />
          )}
        </p>
      </Fragment>

      {/* on the right (the user's request): the recall of how to check the condition, a step per key press */}
      <div className="l22-proj-how">
        <Fragment index={3} as="p">
          To check this condition, we:
        </Fragment>
        <ol className="steps">
          <Fragment index={3} as="li">
            Find an orthogonal basis <Tex tex={r`\{\vv w_1,\dots,\vv w_k\}`} /> for <Tex tex="C(A)" /> using Gram–Schmidt.
          </Fragment>
          <Fragment index={4} as="li">
            Compute <Tex tex={r`\operatorname{Proj}_{C(A)}(\vv b)`} /> using the orthogonal projection formula:
            <Tex display tex={r`\operatorname{Proj}_{C(A)}(\vv b)=\frac{\vv b\cdot\vv w_1}{\vv w_1\cdot\vv w_1}\vv w_1+\dots+\frac{\vv b\cdot\vv w_k}{\vv w_k\cdot\vv w_k}\vv w_k`} />
          </Fragment>
        </ol>
      </div>
      </div>
    </section>
  );
}
