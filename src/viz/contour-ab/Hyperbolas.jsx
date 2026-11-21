import { useId, useMemo, useRef, useState } from 'react';
import Tex, { r } from '../../lectures/l26/components/Tex.jsx';
import ContourPlot from '../../lectures/l26/components/ContourPlot.jsx';
import { AxisNames, INK, RED, Ticks, formula, planePoint, texNum } from './shared.jsx';

/*
 * The hyperbolas' activity, as Intercepts.jsx is the ellipses' (the user's request: the same style):
 * a level set ax² + by² = c, a and b of opposite signs, not drawn, and a hyperbola to drag into it,
 * x²/v² − y²/(mv)² = 1 to start (v = 1.5, m = 1), with its asymptotes y = ±mx dashed. Two dots, the
 * hyperbola's intercepts ±v: dragged, they move along the axis they are nearer to, so the reader
 * also chooses the axis it crosses. A ring on an asymptote: dragged, it turns the asymptotes, and sets
 * m. The arrow keys move them too (on a dot, the keys along the other axis move it onto that axis).
 * Check: the axis, v and m right (to the tenth), and the level set is drawn in red, with its
 * asymptotes and its intercepts; otherwise a hint for what is off (that axis is never crossed: there
 * −4x² = 4; the intercepts: x² = 1; the asymptotes: the level set 0), the level set still hidden, and
 * Show me. A new move takes the hint away. Three hyperbolas: whole-number intercepts, slopes in tenths.
 */

const ROUNDS = [
  { a: 1, b: -4, c: 1, axis: 'x', v: 1, m: 0.5 },
  { a: -4, b: 1, c: 4, axis: 'y', v: 2, m: 2 },
  { a: 9, b: -4, c: 36, axis: 'x', v: 2, m: 1.5 },
];
const W = [-3.5, 3.5]; // the window
const SIZE = 290;
const START = { axis: 'x', v: 1.5, m: 1 }; // wrong for every round
const TOL = 0.05; // on the tenth
const VS = [0.1, 3.4];
const MS = [0.1, 5];
const RING = 2.6; // the ring, this far from the origin
const TICKS = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];
const NONE = [];
const snap = ([lo, hi], v) => Math.max(lo, Math.min(hi, Math.round(v * 10) / 10));
const slope = (m) => (texNum(m) === '1' ? '' : texNum(m));
const OTHER = { x: 'y', y: 'x' };

/** The two branches of the hyperbola with intercepts ±v on `axis` and asymptotes y = ±mx, as paths. */
function branches(p, { axis, v, m }) {
  return [1, -1].map((s) => {
    const pts = [];
    for (let i = -80; i <= 80; i += 1) {
      const t = (i / 80) * 5;
      const [u, w] = axis === 'x' ? [s * v * Math.cosh(t), m * v * Math.sinh(t)] : [(v / m) * Math.sinh(t), s * v * Math.cosh(t)];
      pts.push(`${p.px(u).toFixed(1)},${p.py(w).toFixed(1)}`);
    }
    return `M${pts.join('L')}`;
  });
}

/** The lines y = ±mx across the plot. */
const asymptotes = (p, m) =>
  [m, -m].map((k) => {
    const L = 10;
    return `M${p.px(-L)},${p.py(-k * L)}L${p.px(L)},${p.py(k * L)}`;
  });

export default function Hyperbolas() {
  const [k, setK] = useState(0);
  const [shape, setShape] = useState(START);
  const [status, setStatus] = useState('idle'); // idle | wrong | right | shown
  const [drag, setDrag] = useState(null); // 'v' or 'm'
  const plot = useRef(null);
  const frame = useRef(null);
  const clip = `cab-hyp-${useId().replace(/[^\w-]/g, '')}`;
  const round = ROUNDS[k];
  const { a, b, c } = round;
  const f = useMemo(() => (x, y) => a * x * x + b * y * y, [a, b]);
  const ok = { axis: shape.axis === round.axis, v: Math.abs(shape.v - round.v) <= TOL, m: Math.abs(shape.m - round.m) <= TOL };
  const crossing = ok.axis && ok.v;
  const shown = status === 'right' || status === 'shown';
  const reduced = { x: `{${formula(a, 0)}=${c}}`, y: `{${formula(0, b)}=${c}}` }; // in braces: no line break
  const zero = `{${formula(a, b)}=0}`;

  const change = (next) => {
    if (shown) return;
    setShape((s) => ({ ...s, ...next(s) }));
    if (status === 'wrong') setStatus('idle');
  };
  const handlers = (what) => ({
    onPointerDown: (e) => {
      if (shown) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag(what);
    },
    onPointerMove: (e) => {
      if (drag !== what) return;
      const [u, w] = planePoint(e, frame.current, plot.current);
      if (what === 'v') {
        const axis = Math.abs(u) >= Math.abs(w) ? 'x' : 'y';
        change(() => ({ axis, v: snap(VS, Math.abs(axis === 'x' ? u : w)) }));
      } else change(() => ({ m: snap(MS, Math.abs(w) / Math.max(Math.abs(u), 0.02)) }));
    },
    onPointerUp: () => setDrag(null),
    onPointerCancel: () => setDrag(null),
    onKeyDown: (e) => {
      const key = { ArrowRight: ['x', 1], ArrowLeft: ['x', -1], ArrowUp: ['y', 1], ArrowDown: ['y', -1] }[e.key];
      if (!key) return;
      e.preventDefault();
      const [along, d] = key;
      const step = (e.shiftKey ? 0.5 : 0.1) * d;
      if (what === 'm') change((s) => ({ m: snap(MS, s.m + step) }));
      else change((s) => (s.axis === along ? { v: snap(VS, s.v + step) } : { axis: along }));
    },
  });
  const next = () => {
    setK((k + 1) % ROUNDS.length);
    setShape(START);
    setStatus('idle');
  };

  const draw = (p) => {
    plot.current = p;
    const { axis, v, m } = shape;
    const at = (s) => (axis === 'x' ? [p.px(s * v), p.py(0)] : [p.px(0), p.py(s * v)]);
    const th = Math.atan(m);
    const ring = [p.px(RING * Math.cos(th)), p.py(RING * Math.sin(th))];
    const hit = (what, [cx, cy], main) => (
      <circle
        className={`cab-icept-hit${shown ? '' : ' live'}`}
        data-handle={what}
        cx={cx}
        cy={cy}
        r="17"
        fill="transparent"
        {...(main
          ? {
              tabIndex: shown ? -1 : 0,
              role: 'slider',
              'aria-label': what === 'v' ? 'The intercepts of the hyperbola' : 'The slope of the asymptotes',
              'aria-valuemin': what === 'v' ? VS[0] : MS[0],
              'aria-valuemax': what === 'v' ? VS[1] : MS[1],
              'aria-valuenow': what === 'v' ? v : m,
              'aria-valuetext': what === 'v' ? `${axis} = ±${texNum(v)}` : `y = ±${slope(m)}x`,
            }
          : { 'aria-hidden': true })}
        {...handlers(what)}
      />
    );
    const [vx, vy] = at(1);
    return (
      <g>
        <clipPath id={clip}>
          <rect x={p.px(W[0])} y={p.py(W[1])} width={p.px(W[1]) - p.px(W[0])} height={p.py(W[0]) - p.py(W[1])} />
        </clipPath>
        <rect ref={frame} x={p.px(W[0])} y={p.py(W[1])} width={p.px(W[1]) - p.px(W[0])} height={p.py(W[0]) - p.py(W[1])} fill="none" />
        <Ticks p={p} ticks={TICKS} />
        <g clipPath={`url(#${clip})`} fill="none">
          {shown
            ? asymptotes(p, round.m).map((d) => <path key={d} d={d} stroke={RED} strokeWidth="1.3" strokeDasharray="2 5" strokeLinecap="round" />)
            : null}
          {asymptotes(p, m).map((d) => (
            <path key={d} d={d} stroke={INK} strokeWidth="1.3" strokeDasharray="6 5" strokeOpacity={shown ? 0.35 : 0.6} />
          ))}
          {branches(p, shape).map((d) => (
            <path key={d} d={d} stroke={INK} strokeWidth={shown ? 1.5 : 2.4} strokeDasharray={shown ? '5 4' : undefined} strokeOpacity={shown ? 0.6 : 1} />
          ))}
        </g>
        <circle cx={at(-1)[0]} cy={at(-1)[1]} r="6" fill={INK} stroke="#fff" strokeWidth="2" />
        {hit('v', at(-1), false)}
        <circle cx={vx} cy={vy} r="7" fill={INK} stroke="#fff" strokeWidth="2" />
        {shown ? null : (
          <text x={axis === 'x' ? vx + 4 : vx + 12} y={axis === 'x' ? vy - 13 : vy - 9} fill={INK} fontSize="14" fontWeight="600" stroke="#fff" strokeWidth="4" paintOrder="stroke">
            {texNum(v)}
          </text>
        )}
        {hit('v', [vx, vy], true)}
        <circle cx={ring[0]} cy={ring[1]} r="7" fill="#fff" stroke={INK} strokeWidth="2.6" />
        {hit('m', ring, true)}
        {shown
          ? [1, -1].map((s) => {
              const [u, w] = round.axis === 'x' ? [s * round.v, 0] : [0, s * round.v];
              return <circle key={s} cx={p.px(u)} cy={p.py(w)} r="4.5" fill={RED} stroke="#fff" strokeWidth="1.5" />;
            })
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
  const hints = [];
  if (!ok.axis) {
    hints.push(
      <p key="axis">
        It does not cross {axisName(shape.axis)}: there <Tex tex={`${OTHER[shape.axis]}=0`} />, so <Tex tex={reduced[shape.axis]} />, which has no solution.
      </p>,
    );
  } else if (!ok.v) {
    hints.push(
      <p key="v">
        Not yet at the <Tex tex={shape.axis} />
        -intercepts. There <Tex tex={`${OTHER[shape.axis]}=0`} />, so <Tex tex={reduced[shape.axis]} />.
      </p>,
    );
  }
  if (!ok.m) {
    hints.push(
      <p key="m">
        Not yet the asymptotes. They are the level set <Tex tex={zero} />.
      </p>,
    );
  }
  if (crossing !== ok.m) hints.push(<p key="ok">Your {crossing ? 'intercepts are' : 'asymptotes are'} right.</p>);
  const answer = (
    <p>
      The hyperbola intersects {axisName(round.axis)} at <Tex tex={r`\pm${round.v}`} />, where <Tex tex={reduced[round.axis]} />. Its asymptotes are <Tex tex={r`{y=\pm ${slope(round.m)}x}`} />, which is the level set <Tex tex={zero} />.
    </p>
  );

  return (
    <div className="cab-conic cab-icept">
      <div>
        <p className="cab-icept-round">
          Hyperbola {k + 1} of {ROUNDS.length}
        </p>
        <p className="cab-icept-values">
          <Tex tex={shape.axis} />
          -intercept of your hyperbola: <Tex tex={r`\pm${texNum(shape.v)}`} />
          <br />
          Asymptotes of your hyperbola: <Tex tex={r`{y=\pm ${slope(shape.m)}x}`} />
        </p>
        <div className="cab-icept-buttons">
          {shown ? (
            <button type="button" className="viz-button" onClick={next}>
              {k + 1 < ROUNDS.length ? 'Next hyperbola' : 'Start again'}
            </button>
          ) : (
            <>
              <button type="button" className="viz-button" onClick={() => setStatus(ok.axis && ok.v && ok.m ? 'right' : 'wrong')}>
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
          {status === 'wrong' ? hints : null}
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
          title={`The level set ${formula(a, b).replace(/\^2/g, '²')} = ${c}${shown ? '' : ', hidden'}, and a hyperbola to drag into it`}
        >
          {draw}
        </ContourPlot>
      </figure>
    </div>
  );
}
