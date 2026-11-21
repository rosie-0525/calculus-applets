import { useMemo, useRef, useState } from 'react';
import Tex, { r } from '../../lectures/l26/components/Tex.jsx';
import ContourPlot from '../../lectures/l26/components/ContourPlot.jsx';
import { AxisNames, INK, RED, Ticks, formula, planePoint, texNum } from './shared.jsx';

/*
 * An activity (the user's requests: let the students find where an ellipse crosses the axes, by
 * dragging a circle into the right ellipse): a level set ax² + by² = c, not drawn, and a circle with
 * four handles where it crosses the axes. Dragging a handle (or the arrow keys, on the handles at +x
 * and +y) stretches the circle into the ellipse x²/X² + y²/Y² = 1 through the handles, X and Y beside
 * them. Check: X and Y both within TOL, and the level set is drawn in red with its four intercepts,
 * the reader's ellipse dashed under it; otherwise a hint for each axis that is off (on the x-axis
 * y = 0, so x² = 4), the level set still hidden, and Show me. Moving a handle takes the hint away.
 * Three ellipses, one after another, whose intercepts are whole numbers (the user's request): wide,
 * tall, and wide again with neither coefficient 1. The handles snap to tenths.
 */

const ROUNDS = [
  { a: 1, b: 4, c: 4, x: 2, y: 1 },
  { a: 9, b: 1, c: 9, x: 1, y: 3 },
  { a: 4, b: 9, c: 36, x: 3, y: 2 },
];
const W = [-3.5, 3.5]; // the window
const SIZE = 290;
const START = { x: 1.5, y: 1.5 }; // a circle, wrong for every round
const TOL = 0.05; // on the tenth
const NONE = [];
const MIN = 0.1;
const MAX = 3.4;
const snap = (v) => Math.max(MIN, Math.min(MAX, Math.round(v * 10) / 10));
const TICKS = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];

export default function Intercepts() {
  const [k, setK] = useState(0);
  const [pos, setPos] = useState(START);
  const [status, setStatus] = useState('idle'); // idle | wrong | right | shown
  const [drag, setDrag] = useState(null); // 'x' or 'y'
  const plot = useRef(null); // p.px, p.py
  const frame = useRef(null);
  const round = ROUNDS[k];
  const { a, b, c } = round;
  const f = useMemo(() => (x, y) => a * x * x + b * y * y, [a, b]);
  const ok = { x: Math.abs(pos.x - round.x) <= TOL, y: Math.abs(pos.y - round.y) <= TOL };
  const shown = status === 'right' || status === 'shown';
  const reduced = { x: `{${formula(a, 0)}=${c}}`, y: `{${formula(0, b)}=${c}}` }; // in braces: no line break

  const move = (axis, v) => {
    if (shown) return;
    setPos((p) => ({ ...p, [axis]: snap(v) }));
    if (status === 'wrong') setStatus('idle');
  };
  // where the pointer is, along an axis, in the plane's units (either side of the origin)
  const at = (e, axis) => {
    const [u, w] = planePoint(e, frame.current, plot.current);
    return Math.abs(axis === 'x' ? u : w);
  };
  const handlers = (axis) => ({
    onPointerDown: (e) => {
      if (shown) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag(axis);
    },
    onPointerMove: (e) => drag === axis && move(axis, at(e, axis)),
    onPointerUp: () => setDrag(null),
    onPointerCancel: () => setDrag(null),
    onKeyDown: (e) => {
      const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      move(axis, pos[axis] + d * (e.shiftKey ? 0.5 : 0.1));
    },
  });
  const next = () => {
    setK((k + 1) % ROUNDS.length);
    setPos(START);
    setStatus('idle');
  };

  const draw = (p) => {
    plot.current = p;
    const [ox, oy] = [p.px(0), p.py(0)];
    // a handle at sign·X on the x-axis, or sign·Y on the y-axis; the ones at +X and +Y take the keys
    const handle = (axis, sign) => {
      const [cx, cy] = axis === 'x' ? [p.px(sign * pos.x), oy] : [ox, p.py(sign * pos.y)];
      const main = sign > 0;
      return (
        <g key={`${axis}${sign}`}>
          <circle cx={cx} cy={cy} r={main ? 7 : 6} fill={INK} stroke="#fff" strokeWidth="2" />
          {main && !shown ? (
            <text x={axis === 'x' ? cx + 4 : cx + 12} y={axis === 'x' ? cy - 13 : cy - 9} textAnchor="start" fill={INK} fontSize="14" fontWeight="600" stroke="#fff" strokeWidth="4" paintOrder="stroke">
              {texNum(pos[axis])}
            </text>
          ) : null}
          <circle
            className={`cab-icept-hit${shown ? '' : ' live'}`}
            cx={cx}
            cy={cy}
            r="17"
            fill="transparent"
            {...(main
              ? {
                  tabIndex: shown ? -1 : 0,
                  role: 'slider',
                  'aria-label': `Where the ellipse crosses the positive ${axis}-axis`,
                  'aria-valuemin': MIN,
                  'aria-valuemax': MAX,
                  'aria-valuenow': pos[axis],
                }
              : { 'aria-hidden': true })}
            {...handlers(axis)}
          />
        </g>
      );
    };
    return (
      <g>
        <rect ref={frame} x={p.px(W[0])} y={p.py(W[1])} width={p.px(W[1]) - p.px(W[0])} height={p.py(W[0]) - p.py(W[1])} fill="none" />
        <Ticks p={p} ticks={TICKS} />
        <ellipse
          cx={ox}
          cy={oy}
          rx={p.px(pos.x) - ox}
          ry={oy - p.py(pos.y)}
          fill={shown ? 'none' : 'rgba(20, 33, 61, 0.06)'}
          stroke={INK}
          strokeWidth={shown ? 1.5 : 2.4}
          strokeDasharray={shown ? '5 4' : undefined}
          strokeOpacity={shown ? 0.6 : 1}
        />
        {/* the handles at +X and +Y last, on top */}
        {handle('x', -1)}
        {handle('y', -1)}
        {handle('x', 1)}
        {handle('y', 1)}
        {shown
          ? [
              [round.x, 0],
              [-round.x, 0],
              [0, round.y],
              [0, -round.y],
            ].map(([u, v]) => <circle key={`${u},${v}`} cx={p.px(u)} cy={p.py(v)} r="4.5" fill={RED} stroke="#fff" strokeWidth="1.5" />)
          : null}
        <AxisNames p={p} end={W[1]} />
      </g>
    );
  };

  const axisName = (axis) => (
    <>
      the <Tex tex={axis} />
      -axis
    </>
  );
  const hint = (axis) => (
    <p key={axis}>
      Not yet on {axisName(axis)}. There <Tex tex={axis === 'x' ? 'y=0' : 'x=0'} />, so <Tex tex={reduced[axis]} />.
    </p>
  );
  const answer = (
    <p>
      The ellipse intersects the <Tex tex="x" />-axis at <Tex tex={r`\pm${round.x}`} />, where <Tex tex={reduced.x} />, and the <Tex tex="y" />-axis at <Tex tex={r`\pm${round.y}`} />, where <Tex tex={reduced.y} />.
    </p>
  );

  return (
    <div className="cab-conic cab-icept">
      <div>
        <p className="cab-icept-round">
          Ellipse {k + 1} of {ROUNDS.length}
        </p>
        <p className="cab-icept-values">
          <Tex tex="x" />-intercept of your ellipse: <Tex tex={r`\pm${texNum(pos.x)}`} />
          <br />
          <Tex tex="y" />-intercept of your ellipse: <Tex tex={r`\pm${texNum(pos.y)}`} />
        </p>
        <div className="cab-icept-buttons">
          {shown ? (
            <button type="button" className="viz-button" onClick={next}>
              {k + 1 < ROUNDS.length ? 'Next ellipse' : 'Start again'}
            </button>
          ) : (
            <>
              <button type="button" className="viz-button" onClick={() => setStatus(ok.x && ok.y ? 'right' : 'wrong')}>
                Check
              </button>
              {status === 'wrong' ? (
                <button type="button" className="viz-button" onClick={() => setStatus('shown')}>
                  Show me
                </button>
              ) : null}
            </>
          )}
        </div>
        <div className="cab-readout cab-icept-feedback" aria-live="polite">
          {status === 'wrong' ? (
            <>
              {['x', 'y'].filter((axis) => !ok[axis]).map(hint)}
              {ok.x !== ok.y ? <p>Your ellipse is right on {axisName(ok.x ? 'x' : 'y')}.</p> : null}
            </>
          ) : null}
          {status === 'right' ? (
            <>
              <p className="cab-icept-yes">Right!</p>
              {answer}
            </>
          ) : null}
          {status === 'shown' ? answer : null}
        </div>
      </div>
      <figure className="cab-fig">
        <figcaption className="cab-formula">
          <Tex tex={`${formula(a, b)}=${c}`} />
        </figcaption>
        <ContourPlot
          f={f}
          x={W}
          y={W}
          size={SIZE}
          n={90}
          levels={NONE}
          highlight={shown ? c : undefined}
          highlightColor={RED}
          axes
          title={`The level set ${formula(a, b).replace(/\^2/g, '²')} = ${c}${shown ? '' : ', hidden'}, and an ellipse to stretch into it`}
        >
          {draw}
        </ContourPlot>
      </figure>
    </div>
  );
}
