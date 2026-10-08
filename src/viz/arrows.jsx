import { useRef, useState } from 'react';
import '../lectures/l1/styles/deck.css';
import Tex from '../lectures/l1/components/Tex.jsx';
import Plane, { Arrow } from '../lectures/l1/components/Plane.jsx';
import { CARDINAL, SOFT, GUIDE, PIX, VecLabel } from '../lectures/l1/slides/Slide09Pictures.jsx';

export const lecture = 1;

/*
 * The slide's two pictures of a vector as an arrow, (3, 2) in the plane and (2, 3, 2) in space, to
 * drag (on whole numbers). Dragging the arrow moves it: its length, its direction and its entries,
 * the dashed steps from its tail, stay the same. Dragging its tip (unmarked: the cursor turns into
 * a cross near it) changes it. In space the arrow and its tip move in the picture (left and right
 * is y, up and down is z), and the arrow's shadow on the floor and the end of the shadow move along
 * the floor (x and y). The arrow and the tip take the arrow keys too, once they have focus: with
 * Shift, up and down is x.
 */

const X2 = [-4, 4];
const Y2 = [-4, 4];
const PAD2 = 32; // room around the grid for the label
const BOX3 = [4, 5, 6]; // in space the arrow stays between 0 and these

const clamp = (t, [lo, hi]) => Math.min(hi, Math.max(lo, t));
const num = (t) => (t < 0 ? `−${-t}` : `${t}`);
const ticks = ([lo, hi]) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((t) => t !== 0);
const KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
// text with a white edge, so that it reads over lines; it is not in the way of a drag
const HALO = { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 5, strokeLinejoin: 'round', pointerEvents: 'none' };
const FOCUS_FILL = 'rgba(140, 21, 21, 0.2)';

/** The tail t, on whole numbers, such that the arrow from t to t + v stays between lo and hi. */
const fit = (t, v, lo, hi) => t.map((c, i) => clamp(Math.round(c), [lo[i] - Math.min(0, v[i]), hi[i] - Math.max(0, v[i])]));
/** The point h on whole numbers, between lo and hi. */
const snap = (h, lo, hi) => h.map((c, i) => clamp(Math.round(c), [lo[i], hi[i]]));

/** The pointer's position in the coordinates of its <svg>'s viewBox. */
function svgPoint(e) {
  const svg = e.currentTarget.ownerSVGElement ?? e.currentTarget;
  const q = svg.createSVGPoint();
  q.x = e.clientX;
  q.y = e.clientY;
  return q.matrixTransform(svg.getScreenCTM().inverse());
}

/** The box [x0, y0, x1, y1] of a text `w` wide in a font of `size`, written at (x, y). */
const textBox = (x, y, w, size, anchor = 'middle') => {
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return [x0, y - 0.75 * size, x0 + w, y + 0.25 * size];
};
const disc = ([x, y], r) => [x - r, y - r, x + r, y + r];

/** Points along the line from a to b (pixels), as boxes [x, y, x, y], for a label to keep off. */
const along = (a, b, n = 10) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const [x, y] = [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n];
    return [x, y, x, y];
  });

/**
 * The label "v = (3, 2)" of the arrow from `from` to `tip` (in pixels), inside a figure of `size`,
 * near the tip and never on the arrow. Of the spots around the tip it takes the one that covers
 * least of the boxes in `keepOff`: a list of two lists, what it must keep off (ten times as
 * costly to cover) and what it had better keep off. Beyond the tip and close to it is best.
 */
function TipLabel({ from, tip, entries, size: [W, H], keepOff: [must = [], rather = []] }) {
  const [bw, bh] = [9 * (entries.length + 5), 18]; // about the size of the text
  const d = [tip[0] - from[0], tip[1] - from[1]];
  const len = Math.hypot(d[0], d[1]);
  const u = len < 1 ? [0, -1] : [d[0] / len, d[1] / len];
  const shaft = Array.from({ length: 11 }, (_, i) => [from[0] + (d[0] * i) / 10, from[1] + (d[1] * i) / 10]);
  // how much of a box [x0, y0, x1, y1] the label at (cx, cy) covers, with a pixel to spare
  const covers = ([cx, cy], [x0, y0, x1, y1]) =>
    Math.max(0, Math.min(cx + bw / 2, x1 + 1) - Math.max(cx - bw / 2, x0 - 1)) *
    Math.max(0, Math.min(cy + bh / 2, y1 + 1) - Math.max(cy - bh / 2, y0 - 1));
  let best = { spot: [tip[0], tip[1] - 24], cost: Infinity };
  for (let deg = -180; deg < 180; deg += 15) {
    const [c, s] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
    const [ux, uy] = [u[0] * c - u[1] * s, u[0] * s + u[1] * c];
    for (const extra of [0, 14, 28, 42]) {
      const reach = 18 + extra + (Math.abs(ux) * bw + Math.abs(uy) * bh) / 2;
      const spot = [
        clamp(tip[0] + ux * reach, [bw / 2 + 8, W - bw / 2 - 8]),
        clamp(tip[1] + uy * reach, [bh / 2 + 8, H - bh / 2 - 8]),
      ];
      if (shaft.some(([x, y]) => Math.abs(x - spot[0]) < bw / 2 + 6 && Math.abs(y - spot[1]) < bh / 2 + 6)) continue;
      const cost =
        10 * must.reduce((sum, b) => sum + covers(spot, b), 0) +
        rather.reduce((sum, b) => sum + covers(spot, b), 0) +
        Math.hypot(spot[0] - tip[0], spot[1] - tip[1]) +
        0.2 * Math.abs(deg);
      if (cost < best.cost) best = { spot, cost };
    }
  }
  return (
    <g style={HALO}>
      <VecLabel x={best.spot[0]} y={best.spot[1] + 5} entries={entries} anchor="middle" />
    </g>
  );
}

/** An entry, written on its dashed step. */
function StepLabel({ at: [x, y], children }) {
  return (
    <text x={x} y={y + 4.5} fill={CARDINAL} fontSize="13" fontWeight="700" textAnchor="middle" style={HALO}>
      {children}
    </text>
  );
}
const stepBox = ([x, y], n) => textBox(x, y + 4.5, 2 + 8 * num(n).length, 13);

/**
 * A part of a figure to drag. While it is dragged, `onDrag` gets how far the pointer has moved, in
 * pixels, and an object for this drag on which it may note things. With `onKey` it can have focus
 * and takes the arrow keys: `onKey` gets the step [right, up] and the key event. `children` is a
 * function of whether it shows that it has focus (from the keyboard; from a pointer it does not).
 */
function Drag({ label, cursor, onDrag, onKey, children }) {
  const drag = useRef(null);
  const [grabbing, setGrabbing] = useState(false);
  const [ring, setRing] = useState(false);
  const end = () => {
    drag.current = null;
    setGrabbing(false);
  };
  return (
    <g
      tabIndex={onKey ? 0 : undefined}
      aria-label={label}
      style={{ cursor: grabbing ? 'grabbing' : cursor, touchAction: 'none', outline: 'none' }}
      onFocus={() => setRing(!drag.current)}
      onBlur={() => setRing(false)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const s = svgPoint(e);
        drag.current = { start: [s.x, s.y] };
        setGrabbing(true);
        setRing(false);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const s = svgPoint(e);
        onDrag([s.x - drag.current.start[0], s.y - drag.current.start[1]], drag.current);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        const k = KEYS[e.key];
        if (!k || !onKey) return;
        e.preventDefault();
        onKey(k, e);
        setRing(true);
      }}
    >
      {children(ring)}
    </g>
  );
}

/** The arrow from `from` to `to` (pixels), with a wide band to grab it by, shown when it has focus. */
function Body({ from, to, ring }) {
  return (
    <>
      <line
        x1={from[0]}
        y1={from[1]}
        x2={to[0]}
        y2={to[1]}
        stroke={ring ? FOCUS_FILL : 'transparent'}
        strokeWidth="24"
        strokeLinecap="round"
      />
      <Arrow p={PIX} from={from} to={to} color={CARDINAL} width={4} />
      <circle cx={from[0]} cy={from[1]} r="4.5" fill={CARDINAL} />
    </>
  );
}

/** n = 2: drag the arrow to move it, its tip to change it. */
function PlaneFigure() {
  const [tail, setTail] = useState([0, 0]);
  const [v, setV] = useState([3, 2]);
  const head = [tail[0] + v[0], tail[1] + v[1]];
  const [lo, hi] = [[X2[0], Y2[0]], [X2[1], Y2[1]]];
  const move = (t) => setTail(fit(t, v, lo, hi));
  const aim = (h) => {
    const [x, y] = snap(h, lo, hi);
    if (x !== tail[0] || y !== tail[1]) setV([x - tail[0], y - tail[1]]);
  };
  const corner = [head[0], tail[1]];

  return (
    <Plane
      xRange={[X2[0] - 0.5, X2[1] + 0.5]}
      yRange={[Y2[0] - 0.5, Y2[1] + 0.5]}
      unit={34}
      pad={PAD2}
      title={`The vector (${num(v[0])}, ${num(v[1])}) drawn as an arrow from (${num(tail[0])}, ${num(tail[1])}) to (${num(head[0])}, ${num(head[1])})`}
    >
      {(p) => {
        const at = ([x, y]) => [p.px(x), p.py(y)];
        // across, then up: [from, to, entry]; along an axis the arrow is its own step
        const steps = [
          [tail, corner, v[0]],
          [corner, head, v[1]],
        ]
          .filter(([, , n]) => n !== 0 && v.filter((e) => e !== 0).length > 1)
          .map(([a, b, n]) => [at(a), at(b), n]);
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        return (
          <g>
            <g stroke={GUIDE} strokeWidth="1.5" strokeDasharray="5 4">
              {steps.map(([a, b], i) => (
                <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
              ))}
            </g>
            {steps.map(([a, b, n], i) => (
              <StepLabel key={i} at={mid(a, b)}>
                {num(n)}
              </StepLabel>
            ))}
            <TipLabel
              from={at(tail)}
              tip={at(head)}
              entries={`${num(v[0])}, ${num(v[1])}`}
              size={[p.W, p.H]}
              keepOff={[
                [
                  // the names of the axes, the steps with their entries, and the tip
                  textBox(p.W - PAD2 - 2, p.py(0) - 8, 9, 15, 'end'),
                  textBox(p.px(0) + 9, PAD2 + 13, 9, 15, 'start'),
                  ...steps.flatMap(([a, b, n]) => [stepBox(mid(a, b), n), ...along(a, b)]),
                  disc(at(head), 13),
                ],
                // the axes, and the numbers on them
                [
                  [PAD2, p.py(0), p.W - PAD2, p.py(0)],
                  [p.px(0), PAD2, p.px(0), p.H - PAD2],
                  ...ticks(X2).map((t) => textBox(p.px(t), p.py(0) + 17, 7 * `${t}`.length, 13)),
                  ...ticks(Y2).map((t) => textBox(p.px(0) - 8, p.py(t) + 4, 7 * `${t}`.length, 13, 'end')),
                ],
              ]}
            />

            <Drag
              label="The arrow v: drag it to move it, or use the arrow keys"
              cursor="grab"
              onDrag={([dx, dy], drag) => {
                drag.from ??= tail;
                move([drag.from[0] + dx / p.unit, drag.from[1] - dy / p.unit]);
              }}
              onKey={([right, up]) => move([tail[0] + right, tail[1] + up])}
            >
              {(ring) => <Body from={at(tail)} to={at(head)} ring={ring} />}
            </Drag>
            <Drag
              label="The tip of v: drag it to change v, or use the arrow keys"
              cursor="crosshair"
              onDrag={([dx, dy], drag) => {
                drag.from ??= head;
                aim([drag.from[0] + dx / p.unit, drag.from[1] - dy / p.unit]);
              }}
              onKey={([right, up]) => aim([head[0] + right, head[1] + up])}
            >
              {(ring) => (
                <circle cx={p.px(head[0])} cy={p.py(head[1])} r="13" fill={ring ? FOCUS_FILL : 'transparent'} />
              )}
            </Drag>
          </g>
        );
      }}
    </Plane>
  );
}

/*
 * n = 3: the slide's picture of space, x out of the page toward the lower left, y to the right
 * and z up, made larger so that the arrow has room to move, most of all upward.
 */
const W3 = 370;
const H3 = 370;
const O3 = [138, 258];
const U3 = 34;
const P3 = ([x, y, z]) => [O3[0] + U3 * (-0.6 * x + y), O3[1] + U3 * (0.5 * x - z)];
/** A drag of (dx, dy) pixels as a step in space: in the picture (y and z), or along the floor (x and y). */
const inPicture = ([dx, dy]) => [0, dx / U3, -dy / U3];
const onFloor = ([dx, dy]) => [dy / (0.5 * U3), dx / U3 + (0.6 * dy) / (0.5 * U3), 0];
const plus = (a, b) => a.map((t, i) => t + b[i]);

/** n = 3: drag the arrow or its shadow to move it, its tip or the end of its shadow to change it. */
function SpaceFigure() {
  const [tail, setTail] = useState([0, 0, 0]);
  const [v, setV] = useState([2, 3, 2]);
  const head = plus(tail, v);
  const lo = [0, 0, 0];
  const move = (t) => setTail(fit(t, v, lo, BOX3));
  const aim = (h) => {
    const s = snap(h, lo, BOX3);
    if (s.some((t, i) => t !== tail[i])) setV(s.map((t, i) => t - tail[i]));
  };
  // a key step: left and right is y, up and down is z, or with Shift x (up is away)
  const keyStep = ([right, up], e) => (e.shiftKey ? [-up, 0, 0] : [0, right, up]);
  const [x, y, z] = tail;
  // along x, then along y, then up; and the shadow on the floor
  const c1 = [x + v[0], y, z];
  const c2 = [x + v[0], y + v[1], z];
  const tailFloor = [x, y, 0];
  const headFloor = [head[0], head[1], 0];
  const steps = [
    [tail, c1, v[0]],
    [c1, c2, v[1]],
    [c2, head, v[2]],
  ]
    .filter(([, , n]) => n !== 0 && v.filter((e) => e !== 0).length > 1) // along an axis the arrow is its own step
    .map(([a, b, n]) => [P3(a), P3(b), n]);
  const drops = [
    [tailFloor, tail],
    [headFloor, head],
  ]
    .filter(([, b]) => b[2] > 0)
    .map(([a, b]) => [P3(a), P3(b)]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  const line = (a, b, { key, ...props } = {}) => {
    const [s, t] = [P3(a), P3(b)];
    return <line key={key} x1={s[0]} y1={s[1]} x2={t[0]} y2={t[1]} {...props} />;
  };
  // [x, y, name] in pixels
  const titles = [
    [[BOX3[0] + 0.8, 0, 0], -12, 4, 'x'],
    [[0, BOX3[1] + 0.6, 0], 6, 5, 'y'],
    [[0, 0, BOX3[2] + 0.6], 8, 6, 'z'],
  ].map(([pt, dx, dy, name]) => [P3(pt)[0] + dx, P3(pt)[1] + dy, name]);
  const [t3, h3, tf3, hf3] = [tail, head, tailFloor, headFloor].map(P3);

  return (
    <svg
      className="figure-svg"
      viewBox={`0 0 ${W3} ${H3}`}
      width={W3}
      height={H3}
      role="img"
      aria-label={`The vector (${v.map(num).join(', ')}) drawn as an arrow from (${tail.join(', ')}) to (${head.join(', ')}), with its shadow on the floor`}
    >
      {/* the floor, with a light grid so the depth reads */}
      <polygon
        points={[[0, 0, 0], [BOX3[0] + 0.4, 0, 0], [BOX3[0] + 0.4, BOX3[1] + 0.4, 0], [0, BOX3[1] + 0.4, 0]]
          .map((q) => P3(q).join(','))
          .join(' ')}
        fill="#f3f5f8"
      />
      <g stroke="#e2e6ec" strokeWidth="1">
        {ticks([1, BOX3[0]]).map((k) => line([k, 0, 0], [k, BOX3[1] + 0.4, 0], { key: `gx${k}` }))}
        {ticks([1, BOX3[1]]).map((k) => line([0, k, 0], [BOX3[0] + 0.4, k, 0], { key: `gy${k}` }))}
      </g>

      {/* axes */}
      <g stroke={SOFT} strokeWidth="1.5">
        {line([0, 0, 0], [BOX3[0] + 0.8, 0, 0])}
        {line([0, 0, 0], [0, BOX3[1] + 0.6, 0])}
        {line([0, 0, 0], [0, 0, BOX3[2] + 0.6])}
      </g>
      <g fill={SOFT} fontSize="15" fontStyle="italic">
        {titles.map(([tx, ty, name]) => (
          <text key={name} x={tx} y={ty}>
            {name}
          </text>
        ))}
      </g>

      {/* the upright band between the arrow and its shadow */}
      <polygon points={[tf3, hf3, h3, t3].map((q) => q.join(',')).join(' ')} fill="#8c151512" />

      <g stroke={GUIDE} strokeWidth="1.5" strokeDasharray="5 4">
        {[...steps, ...drops].map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      {steps.map(([a, b, n], i) => (
        <StepLabel key={i} at={mid(a, b)}>
          {num(n)}
        </StepLabel>
      ))}

      {/* the shadow: drag it to move the arrow along the floor, its end to change the arrow */}
      <Drag
        label="The shadow of v on the floor: drag it to move v along the floor"
        cursor="move"
        onDrag={(d, drag) => {
          drag.from ??= tail;
          move(plus(drag.from, onFloor(d)));
        }}
      >
        {() => (
          <>
            <line x1={tf3[0]} y1={tf3[1]} x2={hf3[0]} y2={hf3[1]} stroke={GUIDE} strokeWidth="2" />
            <line x1={tf3[0]} y1={tf3[1]} x2={hf3[0]} y2={hf3[1]} stroke="transparent" strokeWidth="16" strokeLinecap="round" />
          </>
        )}
      </Drag>
      <Drag
        label="The end of the shadow of v: drag it to change v along the floor"
        cursor="crosshair"
        onDrag={(d, drag) => {
          drag.from ??= head;
          aim(plus(drag.from, onFloor(d)));
        }}
      >
        {() => <circle cx={hf3[0]} cy={hf3[1]} r="8" fill="rgba(148, 163, 184, 0.25)" stroke={GUIDE} strokeWidth="1.5" />}
      </Drag>

      <TipLabel
        from={t3}
        tip={h3}
        entries={v.map(num).join(', ')}
        size={[W3, H3]}
        keepOff={[
          [
            // the names of the axes, the steps with their entries, and the tip
            ...titles.map(([tx, ty]) => textBox(tx, ty, 9, 15, 'start')),
            ...steps.flatMap(([a, b, n]) => [stepBox(mid(a, b), n), ...along(a, b)]),
            ...drops.flatMap(([a, b]) => along(a, b)),
            disc(h3, 13),
            disc(hf3, 8),
          ],
          // the axes and the shadow
          [
            ...[[BOX3[0] + 0.8, 0, 0], [0, BOX3[1] + 0.6, 0], [0, 0, BOX3[2] + 0.6]].flatMap((end) => along(P3([0, 0, 0]), P3(end), 16)),
            ...along(tf3, hf3),
          ],
        ]}
      />

      <Drag
        label="The arrow v: drag it to move it; the arrow keys move it along y and z, and with Shift along x"
        cursor="grab"
        onDrag={(d, drag) => {
          drag.from ??= tail;
          move(plus(drag.from, inPicture(d)));
        }}
        onKey={(k, e) => move(plus(tail, keyStep(k, e)))}
      >
        {(ring) => <Body from={t3} to={h3} ring={ring} />}
      </Drag>
      <Drag
        label="The tip of v: drag it to change v; the arrow keys move it along y and z, and with Shift along x"
        cursor="crosshair"
        onDrag={(d, drag) => {
          drag.from ??= head;
          aim(plus(drag.from, inPicture(d)));
        }}
        onKey={(k, e) => aim(plus(head, keyStep(k, e)))}
      >
        {(ring) => <circle cx={h3[0]} cy={h3[1]} r="13" fill={ring ? FOCUS_FILL : 'transparent'} />}
      </Drag>
    </svg>
  );
}

export default function Arrows() {
  return (
    <div className="pictures-pair">
      <figure>
        <p className="viz-hint">Drag the vectors to explore</p>
        <PlaneFigure />
        <figcaption>
          <Tex tex="n=2" />: in the plane
        </figcaption>
      </figure>
      <figure>
        <p className="viz-hint">Drag the vectors to explore</p>
        <SpaceFigure />
        <figcaption>
          <Tex tex="n=3" />: in space
        </figcaption>
      </figure>
    </div>
  );
}
