import { Fragment as Keyed, useEffect, useRef, useState } from 'react';
import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import ColSpace, { CPlane, W3, WSeg, WDot, WLbl, Drop, Vn } from './ColSpace.jsx';
import { RightAngle3 } from './Space.jsx';
import { PRINT } from './print.js';
import { clipIn } from './clip.js';
import { INK, TEAL, GRAY, COLS, AMBER, V1, V2, V3, W1, W2, VIEW, dot, plus, minus, times, unit, cross } from './ls.js';

// the floor: s w₁ + t w₂ for s in SR, t in TR, in the plane's orthogonal basis w₁, w₂ (ls.js; the
// columns v₁, v₂ are not orthogonal since the user's change), out to b = (5, 4, −4) = 3w₁ + w₂
const SR = [-0.6, 3.4];
const TR = [-0.6, 1.5];
const onPlane = (a, c) => plus(times(a, W1), times(c, W2));
const CORNERS = [SR[0], SR[1]].flatMap((a) => [TR[0], TR[1]].map((c) => onPlane(a, c)));
const PATCH = [onPlane(SR[0], TR[0]), onPlane(SR[1], TR[0]), onPlane(SR[1], TR[1]), onPlane(SR[0], TR[1])]; // round the patch

// N: the plane's unit normal (b · N is b's height above the plane)
const N = unit(cross(W1, W2));
const AZ = (-40 * Math.PI) / 180; // Space's default view: this floor direction runs to the right
const RIGHT = [Math.sin(AZ), Math.cos(AZ)];
const FA = VIEW(unit(W1));
const FB = VIEW(unit(W2));
const R = plus(times(RIGHT[0] * FA[0] + RIGHT[1] * FA[1], unit(W1)), times(RIGHT[0] * FB[0] + RIGHT[1] * FB[1], unit(W2)));
const BASE = plus(times(2, W1), times(0.25, W2));
// b's start: off the plane, up and to the left of the columns (from over BASE it ran along v₂ once
// v₂ = (1, 2, −2)); FIT stays round BASE
const START = plus(plus(times(0.4, W1), times(1.2, W2)), times(1.3, N));
// the picture is fitted round the plane and these points (b's room)
const FIT = [-2.6, 0.55].flatMap((u) => [-1.4, 2.4].map((h) => plus(plus(BASE, times(u, R)), times(h, N))));
const SNAP = 0.13; // within this height of the plane, b lands on it
// where b's tip may go: inside the picture, with room for its arrowhead and label (pixels)
const EDGE = { left: 22, right: 46, top: 42, bottom: 22 };

// VIEW is a rotation, so its inverse is its transpose
const VCOLS = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
].map(VIEW);
const unview = (q) => VCOLS.map((c) => dot(c, q));

const clamp = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));

/** b as drawn: on the plane (its height set to 0) within SNAP of it; its height h; on the plane or not. */
function settle(raw) {
  const hRaw = dot(raw, N);
  const inside = Math.abs(hRaw) < SNAP;
  return { b: inside ? minus(raw, times(hRaw, N)) : raw, h: inside ? 0 : hRaw, inside };
}

/** `child` from stages[i]'s key press until the next one's (print's stills), as an `as` element. */
function still(stages, i, child, as = 'g') {
  const from = stages[i].at;
  const to = stages[i + 1]?.at;
  let el = child;
  if (to)
    el = (
      <Fragment as={as} index={to} effect="fade-out">
        {el}
      </Fragment>
    );
  if (from)
    el = (
      <Fragment as={as} index={from}>
        {el}
      </Fragment>
    );
  return el;
}

/** span{v₁, v₂, v₃}, as a label in the picture. */
function SpanName() {
  return (
    <>
      span{'{'}
      <Vn n="v" i={1} />, <Vn n="v" i={2} />, <Vn n="v" i={3} />
      {'}'}
    </>
  );
}

/**
 * The vector b (`raw`, before it lands on the plane), with its shadow and the dotted perpendicular
 * to the plane when it is off it. Below the plane, the part of b (and of the perpendicular) behind the plane, as seen, is gray, the rest ink. `handlers`:
 * the drag on its tip (live mode).
 */
function BVector({ s, raw, handlers }) {
  const { b, h, inside } = settle(raw);
  const foot = minus(b, times(h, N));
  const O = s.P(VIEW([0, 0, 0]));
  const T = s.P(VIEW(b));
  const F = s.P(VIEW(foot));
  const poly = PATCH.map((p) => s.P(VIEW(p)));
  const below = h < 0;
  const cut = below ? clipIn(O, T, poly) : null; // b's part behind the plane: [0, cut[1]]
  const hidden = cut ? cut[1] : 0;
  const tipHidden = below && hidden > 1 - 1e-6;
  // the perpendicular from b's tip up to the plane: the part [d₀, d₁] is behind the plane
  const d = below ? clipIn(T, F, poly) : null;
  const dotted = (from, to, color, key) => <WSeg key={key} s={s} from={from} to={to} color={color} width={2.6} strokeDasharray="0.1 6.5" />;
  const along = (t) => plus(b, times(t, minus(foot, b)));
  return (
    <g>
      {!inside && <ellipse cx={F[0]} cy={F[1]} rx={17} ry={17 * Math.sin((s.el * Math.PI) / 180)} fill={INK} opacity={0.16} />}
      {!inside && !below && <Drop s={s} from={b} to={foot} />}
      {below &&
        (d ? (
          <g>
            {d[0] > 0 && dotted(b, along(d[0]), INK, 'a')}
            {dotted(along(d[0]), along(d[1]), GRAY, 'b')}
            {d[1] < 1 && dotted(along(d[1]), foot, INK, 'c')}
            <RightAngle3 s={s} corner={VIEW(foot)} a={VIEW(minus(b, foot))} b={VIEW(W1)} size={0.26} color={d[1] > 1 - 1e-6 ? GRAY : INK} />
          </g>
        ) : (
          <Drop s={s} from={b} to={foot} />
        ))}
      {!inside && <WDot s={s} at={foot} color={INK} r={3} />}
      <W3 s={s} to={b} color={tipHidden ? GRAY : INK} width={3.6} />
      {below && !tipHidden && hidden > 0 && <WSeg s={s} from={[0, 0, 0]} to={times(hidden, b)} color={GRAY} width={3.6} />}
      <WLbl s={s} at={b} dx={14} dy={-12} color={tipHidden ? GRAY : INK} size={24}>
        <Vn n="b" />
      </WLbl>
      <g className="l22-grab" data-prevent-swipe {...handlers}>
        <circle cx={T[0]} cy={T[1]} r={24} fill="transparent" />
      </g>
    </g>
  );
}

/** "Ax = b has a solution!" or "Ax = b has no solution!". */
function Verdict({ yes }) {
  return (
    <>
      <Tex tex={r`A\vv x=\vv b`} /> has {yes ? 'a solution!' : 'no solution!'}
    </>
  );
}

/**
 * The picture of Solving Ax = b (Slide04Columns, commented out for now), as a card of its own, moved to
 * Example 1 (Slide09Example2) at the user's request: the plane span{v₁, v₂, v₃} of the columns of
 * Mark's A as a floor (v₂ dashed from v₁'s tip to v₃'s), and a vector b, which the presenter drags by
 * its tip anywhere in the picture (sideways along the floor direction that runs to the right on the
 * screen, up and down along the plane's normal; dragging the picture elsewhere turns the view).
 * Within SNAP of the plane b lands on it; off it, its shadow on the plane under it and the dotted
 * perpendicular to the plane (its foot is Proj_{C(A)}(b)). Under the picture, "Ax = b has a
 * solution!" while b is in the plane, "Ax = b has no solution!" while it is off it.
 * The card comes on key press `first`; `stages`: [{ at, b }, …], b's place from each key press on (the
 * first one, at: 0, is where it starts), and back when going back; `head`: a line over the picture.
 * Print: b and the verdict at each stage. (Copied from Slide04Columns, which keeps its own.)
 */
export const B_START = START;

export default function SolveCard({ first = 1, stages, head }) {
  const [raw, setRaw] = useState(stages[0].b);
  const grab = useRef(null);
  const geo = useRef(null);
  const { inside } = settle(raw);

  // b jumps to each stage's on its key press, and back when going back
  const host = useRef(null);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const marks = [...host.current.querySelectorAll('.l22-stage-mark')];
    const update = () => setStage(marks.map((m) => m.classList.contains('visible')).lastIndexOf(true) + 1);
    update();
    const observer = new MutationObserver(update);
    marks.forEach((m) => observer.observe(m, { attributes: true, attributeFilter: ['class'] }));
    return () => observer.disconnect();
  }, []);
  const started = useRef(true);
  useEffect(() => {
    if (started.current) started.current = false;
    else setRaw(stages[stage].b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const down = (e) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not a live pointer (a test) */
    }
    const ctm = e.currentTarget.ownerSVGElement.getScreenCTM();
    grab.current = { x: e.clientX, y: e.clientY, scale: ctm ? ctm.a : 1, from: raw, tip: geo.current.P(VIEW(raw)) };
  };
  const move = (e) => {
    const g = grab.current;
    if (!g) return;
    const { unit: u, el, az, W, H } = geo.current;
    const tx = clamp(g.tip[0] + (e.clientX - g.x) / g.scale, [EDGE.left, W - EDGE.right]);
    const ty = clamp(g.tip[1] + (e.clientY - g.y) / g.scale, [EDGE.top, H - EDGE.bottom]);
    const side = (tx - g.tip[0]) / u;
    const up = -(ty - g.tip[1]) / (u * Math.cos((el * Math.PI) / 180));
    const a = (az * Math.PI) / 180;
    setRaw(plus(g.from, unview([side * Math.sin(a), side * Math.cos(a), up])));
  };
  const release = () => {
    grab.current = null;
  };
  const handlers = { onPointerDown: down, onPointerMove: move, onPointerUp: release, onPointerCancel: release };

  return (
    <div ref={host} className="l22-solve-host">
      {stages.slice(1).map((st, k) => (
        <span key={k} className="fragment fx-marker l22-stage-mark" data-fragment-index={st.at} aria-hidden="true" />
      ))}
      <Fragment index={first} className="l22-solve-card">
        {head && <p className="l22-v3">{head}</p>}
        <ColSpace width={540} height={392} points={[[0, 0, 0], ...CORNERS, ...FIT]} pad={14} rock={false} title="The plane span{v1, v2, v3} of the columns, and a vector b to drag">
          {(s) => {
            geo.current = s;
            return (
              <g>
                <CPlane s={s} sr={SR} tr={TR} label="" />
                <W3 s={s} from={V1} to={V3} color={AMBER} width={2} dashed />
                {[V1, V2, V3].map((v, k) => (
                  <W3 key={k} s={s} to={v} color={COLS[k]} width={3.4} />
                ))}
                <WDot s={s} at={[0, 0, 0]} color={INK} r={4} />
                <Fragment as="g" index={first}>
                  {PRINT ? (
                    stages.map((st, i) => <Keyed key={i}>{still(stages, i, <BVector s={s} raw={st.b} />)}</Keyed>)
                  ) : (
                    <BVector s={s} raw={raw} handlers={handlers} />
                  )}
                </Fragment>
                {/* the labels last, their halos over b (rule 17b) */}
                <WLbl s={s} at={onPlane(SR[1], TR[0])} dx={-6} dy={28} color={TEAL} anchor="end" size={22}>
                  <SpanName />
                </WLbl>
                {[V1, V2, V3].map((v, k) => (
                  <WLbl key={k} s={s} at={v} dx={[4, 4, 10][k]} dy={[26, -14, 4][k]} color={COLS[k]} size={23} anchor="start">
                    <Vn n="v" i={k + 1} />
                  </WLbl>
                ))}
              </g>
            );
          }}
        </ColSpace>
        {/* the fragment's class stays fixed (reveal adds "visible" to it); the verdict's is inside */}
        <Fragment index={first} as="p" className="l22-verdict-row">
          {PRINT ? (
            <span className="l22-verdict-stack">
              {stages.map((st, i) => {
                const yes = settle(st.b).inside;
                return (
                  <Keyed key={i}>
                    {still(
                      stages,
                      i,
                      <span className={`l22-verdict ${yes ? 'yes' : 'no'}`}>
                        <Verdict yes={yes} />
                      </span>,
                      'span',
                    )}
                  </Keyed>
                );
              })}
            </span>
          ) : (
            <span className={`l22-verdict ${inside ? 'yes' : 'no'}`}>
              <Verdict yes={inside} />
            </span>
          )}
        </Fragment>
      </Fragment>
    </div>
  );
}
