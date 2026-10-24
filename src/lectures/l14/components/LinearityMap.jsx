import Plane, { Arrow, Dot } from './Plane.jsx';
import Fragment from './Fragment.jsx';
import TexSvg from './TexSvg.jsx';
import { MATH } from './svgmath.jsx';

const INK = '#14213d';
export const C1 = '#3b6ea8'; // e₁ and f(e₁)
export const C2 = '#c2410c'; // e₂ and f(e₂)
const UNIT = 54;

// Linear transformations, Example 1: f(x) = Ax with A = [2 −1; 1 1]
const A = [
  [2, -1],
  [1, 1],
];
const f = ([x, y]) => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
const id = (v) => v;
const E1 = [1, 0];
const E2 = [0, 1];

/** The key presses of f(e₁) and f(e₂) on the right. */
export const SHOW_F = [2, 3];

/**
 * The questions, each the key press `index` (its tip-to-tail sum on the left) and `index + 1` (the
 * same through f on the right): `legs`, the copies of e₁, e₂ that slide to the tip of the arrow before
 * them (`later`: after the first one has); `sum`, the point reached; its label's TeX and offsets.
 */
export const QUESTIONS = [
  { index: 4, legs: [{ v: E2, at: E1, color: C2 }], sum: [1, 1], tex: String.raw`\vv e_1+\vv e_2`, in: [0, -22], out: [-12, 0, 'end'] },
  { index: 6, legs: [{ v: E1, at: E1, color: C1 }], sum: [2, 0], tex: String.raw`2\vv e_1`, in: [0, 24], out: [0, 26] },
  {
    index: 8,
    legs: [
      { v: E1, at: E1, color: C1 },
      { v: E2, at: [2, 0], color: C2, later: true },
    ],
    sum: [2, 1],
    tex: String.raw`2\vv e_1+\vv e_2`,
    in: [6, -20, 'start'],
    out: [-12, 0, 'end'],
  },
];

/** A copy of the arrow 0 → v (through g) that glides to start at g(at) when its fragment shows. */
function Leg({ p, g, v, at, color, later }) {
  const [ax, ay] = g(at);
  const style = { '--dx': `${p.px(ax) - p.px(0)}px`, '--dy': `${p.py(ay) - p.py(0)}px` };
  return (
    <g className={`l14-leg${later ? ' l14-later' : ''}`} style={style}>
      <Arrow p={p} to={g(v)} color={color} width={3} opacity={0.8} />
    </g>
  );
}

/**
 * One plane: e₁, e₂ through g, with their `labels` (on key presses `basisAt`, if given), and each
 * question's legs and sum (the input on the left, f on the right).
 */
function Panel({ g, xRange, yRange, step, wrap, labels, basisAt = [] }) {
  return (
    <Plane xRange={xRange} yRange={yRange} unit={UNIT} pad={14} axes={false} title={wrap('vectors')}>
      {(p) => (
        <g>
          <g stroke="#9ca3af" strokeWidth="1.3">
            <line x1={p.px(xRange[0])} y1={p.py(0)} x2={p.px(xRange[1])} y2={p.py(0)} />
            <line x1={p.px(0)} y1={p.py(yRange[0])} x2={p.px(0)} y2={p.py(yRange[1])} />
          </g>
          {QUESTIONS.map((q, k) => {
            const [dx, dy, anchor = 'middle'] = q[step === 0 ? 'in' : 'out'];
            const [sx, sy] = g(q.sum);
            const next = QUESTIONS[k + 1];
            const body = (
              <g>
                {q.legs.map((leg, j) => (
                  <Leg key={j} p={p} g={g} {...leg} />
                ))}
                <g className={`l14-pop${q.legs.some((leg) => leg.later) ? ' l14-later' : ''}`}>
                  <Dot p={p} at={[sx, sy]} color={INK} r={5.5} />
                  <TexSvg x={p.px(sx) + dx} y={p.py(sy) + dy} anchor={anchor} tex={wrap(q.tex)} color={INK} />
                </g>
              </g>
            );
            return (
              <Fragment key={k} as="g" index={q.index + step}>
                {next ? (
                  <Fragment as="g" index={next.index} effect="semi-fade-out">
                    {body}
                  </Fragment>
                ) : (
                  body
                )}
              </Fragment>
            );
          })}
          {[E1, E2].map((e, k) => {
            const node = (
              <g key={k}>
                <Arrow p={p} to={g(e)} color={k === 0 ? C1 : C2} />
                {labels[k](p)}
              </g>
            );
            return basisAt[k] != null ? (
              <Fragment key={k} as="g" index={basisAt[k]}>
                {node}
              </Fragment>
            ) : (
              node
            );
          })}
          <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
        </g>
      )}
    </Plane>
  );
}

/**
 * Linearity Principle, Example 1: e₁, e₂ and, through f(x) = Ax with A = [2 −1; 1 1], f(e₁) and
 * f(e₂) (on key presses SHOW_F), side by side with an arrow f between them. On each question's key press, a
 * copy of e₁ or e₂ glides to the tip of the arrow before it and the sum's dot and label appear (e₁ +
 * e₂, 2e₁, 2e₁ + e₂); on the next key press, the same with f(e₁), f(e₂) on the right; the question
 * before fades back.
 */
export default function LinearityMap() {
  return (
    <div className="l14-lm">
      <Panel
        g={id}
        step={0}
        xRange={[-0.7, 3.45]}
        yRange={[-0.65, 1.7]}
        wrap={(t) => t}
        labels={[
          (p) => <TexSvg x={p.px(0.5)} y={p.py(0) + 22} tex={String.raw`\vv e_1`} color={C1} />,
          (p) => <TexSvg x={p.px(0) - 10} y={p.py(0.5)} anchor="end" tex={String.raw`\vv e_2`} color={C2} />,
        ]}
      />
      <svg className="l14-map-arrow" viewBox="0 0 90 60" width="80" height="54" aria-hidden="true">
        <line x1="8" y1="40" x2="72" y2="40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <polygon points="84,40 70,33 70,47" fill={INK} />
        <text x="45" y="24" textAnchor="middle" fontSize="26" fontFamily={MATH} fontStyle="italic" fill={INK}>
          f
        </text>
      </svg>
      <Panel
        g={f}
        step={1}
        xRange={[-1.75, 4.75]}
        yRange={[-0.65, 3.6]}
        wrap={(t) => `f(${t})`}
        basisAt={SHOW_F}
        labels={[
          (p) => <TexSvg x={p.px(1) + 6} y={p.py(0.5) + 22} anchor="start" tex={String.raw`f(\vv e_1)`} color={C1} />,
          (p) => <TexSvg x={p.px(-1)} y={p.py(1) - 20} tex={String.raw`f(\vv e_2)`} color={C2} />,
        ]}
      />
    </div>
  );
}
