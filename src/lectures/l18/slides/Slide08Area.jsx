import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, Dot } from '../components/Plane.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { GridImage } from '../components/FShape.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, AMBER, apply, pts, det2 } from '../components/inv.js';

// a few nice matrices, each on its own, against a rank 1 one (the user's request: no family of A
// gliding from one to the next, which confused; `name` only says which is which here, the slide has no
// titles, the user's request); `at`: where "area …" goes; `note`: under A and det(A), a key press later
export const EXAMPLES = [
  {
    name: 'stretch (diagonal)',
    A: [
      [2, 0],
      [0, 1.5],
    ],
    at: [1, 0.75],
  },
  {
    name: 'shear',
    A: [
      [1, 1],
      [0, 1],
    ],
    at: [1, 0.5],
  },
  {
    name: 'rank 1',
    note: 'not invertible',
    A: [
      [1, 2],
      [0.5, 1],
    ],
    at: [2.55, 0.22],
  },
];
// one frame for all three, so that their areas compare
export const XR = [-0.6, 3.3];
export const YR = [-0.45, 1.85];
export const UNIT = 94;
export const SQ = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
export const E = [
  [1, 0],
  [0, 1],
];
export const num = (x) => {
  const t = (Math.round(x * 100) / 100).toString();
  return t === '-0' ? '0' : t.replace('-', '−');
};
export const same = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 1e-9;
// where the label of the arrow to v goes: past its tip, and to its right (`side` 1) or left (−1), so
// that Ae₁ and Ae₂ stay apart when A is flat and the two arrows lie on one line
export const tag = (v, side) => {
  const n = Math.hypot(...v) || 1;
  const d = [v[0] / n, v[1] / n];
  return [v[0] + 0.16 * d[0] + 0.22 * side * d[1], v[1] + 0.16 * d[1] - 0.22 * side * d[0]];
};

/**
 * The unit square (gray, dashed) and its image under (1 − t)I + tA (orange, as in the textbook), the
 * grid moving with it (the previous style; the user's request: the square seen turning into the
 * parallelogram, and, rank 1, the whole plane squashed onto a line, as before); the arrows labelled
 * (the user's request): e₁, e₂ at first; once they move, Ae₁, Ae₂, and e₁, e₂ stay where they were,
 * faint ("Ae₁ = e₁" when they are the same). "area 1" in the square at first; once it lands, the area
 * of A's parallelogram at `at` (no number in between: A itself, not a family, the user's request);
 * flat (det = 0), the line the plane is squashed onto in red, and "area 0" in red.
 */
export function Picture({ A, at, t }) {
  const M = A.map((row, i) => row.map((m, j) => (1 - t) * (i === j ? 1 : 0) + t * m));
  const area = Math.abs(det2(A));
  const flat = t >= 1 && area < 0.005;
  const cols = E.map((e) => apply(M, e));
  const ends = E.map((e) => apply(A, e));
  const labels = [];
  E.forEach((e, k) => {
    const side = k === 0 ? 1 : -1;
    const color = k === 0 ? BLUE : AMBER;
    if (same(ends[k], e)) {
      labels.push({ v: e, side, tex: t > 0.15 ? r`A\vv e_${k + 1}=\vv e_${k + 1}` : r`\vv e_${k + 1}`, color, opacity: 1 });
      return;
    }
    labels.push({ v: e, side, tex: r`\vv e_${k + 1}`, color, opacity: t > 0 ? 0.6 : 1 });
    if (t > 0.15) labels.push({ v: cols[k], side, tex: r`A\vv e_${k + 1}`, color, opacity: Math.min(1, (t - 0.15) / 0.3) });
  });
  // the longer column first, so that the shorter one shows on top of it when they lie on one line
  const order = [0, 1].sort((i, j) => Math.hypot(...cols[j]) - Math.hypot(...cols[i]));
  return (
    <Plane xRange={XR} yRange={YR} unit={UNIT} pad={8} grid={false} axes={false} title={`The unit square and its image under A, of area ${num(area)}`}>
      {(p) => {
        const dir = Math.hypot(...ends[0]) > 0.05 ? ends[0] : ends[1];
        const len = Math.hypot(...dir) || 1;
        const far = [(dir[0] / len) * 6, (dir[1] / len) * 6];
        return (
          <g>
            <GridImage p={p} M={M} n={6} />
            {flat && <polyline points={pts(p, [[-far[0], -far[1]], far])} stroke={RED} strokeWidth="2.5" opacity="0.6" />}
            <polygon points={pts(p, SQ)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon
              points={pts(p, SQ.map((q) => apply(M, q)))}
              fill="rgba(242, 179, 122, 0.55)"
              stroke="#c2702a"
              strokeWidth={flat ? 5 : 2}
              strokeLinejoin="round"
            />
            {t > 0 && (
              <g opacity={0.45}>
                <Arrow p={p} to={E[0]} color={BLUE} width={2.5} head={12} />
                <Arrow p={p} to={E[1]} color={AMBER} width={2.5} head={12} />
              </g>
            )}
            {order.map((k) => (
              <Arrow key={k} p={p} to={cols[k]} color={k === 0 ? BLUE : AMBER} width={3.5} head={13} />
            ))}
            <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
            <g className="l15-sum-labels">
              {labels.map(({ v, side, tex, color, opacity }) => {
                const [x, y] = tag(v, side);
                return <TexSvg key={tex} x={p.px(x)} y={p.py(y)} tex={tex} size={20} color={color} w={110} h={34} opacity={opacity} />;
              })}
              {t === 0 && <TexSvg x={p.px(0.5)} y={p.py(0.5)} tex={r`\text{area}=1`} size={21} color={INK} w={130} h={34} />}
              {t >= 1 && <TexSvg x={p.px(at[0])} y={p.py(at[1])} tex={r`\text{area}=${num(area)}`} size={21} color={flat ? RED : INK} w={130} h={34} />}
            </g>
          </g>
        );
      }}
    </Plane>
  );
}

/**
 * One example on key press `index`: its picture, the square turning into A's parallelogram half a
 * second later, and A and det(A) under it; its `note` (red) under them on key press `noteAt`. Print:
 * as it ends up.
 */
export function Example({ ex, index, noteAt }) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const tw = useTween(on, { ms: 1800, delay: 500 });
  const t = PRINT ? 1 : tw;
  const [[a, b], [c, d]] = ex.A;
  const A = r`A=\begin{bmatrix}\textcolor{${BLUE}}{${num(a)}}&\textcolor{${AMBER}}{${num(b)}}\\ \textcolor{${BLUE}}{${num(c)}}&\textcolor{${AMBER}}{${num(d)}}\end{bmatrix}`;
  return (
    <Fragment index={index} className="l18-area-ex">
      <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />
      <Picture A={ex.A} at={ex.at} t={t} />
      <div className="l18-area-readout">
        <Tex tex={`${A},\\quad \\det(A)=${num(det2(ex.A))}`} />
      </div>
      {ex.note && (
        <Fragment index={noteAt} className="l18-area-note l18-not">
          {ex.note}
        </Fragment>
      )}
    </Fragment>
  );
}

/**
 * Determinant and area (the textbook's Remark 18.2.6): in plain text, a linear transformation
 * T_A(x) = Ax "stretches" things, then the box, without a title, T_A takes the unit square to a
 * parallelogram with area |det(A)| (the user's request). Under them, side by side, no cards, no
 * titles (the user's request), one picture a key press, each a matrix on its own (no family of A
 * gliding from one to the next), the square turning into its parallelogram (Example): 1, a stretch,
 * A = [2 0; 0 1.5], area 3; 2, a shear, A = [1 1; 0 1], area 1; 3, rank 1, A = [1 2; 0.5 1], the
 * whole plane squashed onto a line (red), area 0; each with A and det(A) under it. 4: "not
 * invertible" (red) under the rank 1 one's (the user's request, in place of a sentence under them all).
 */
export default function Slide08Area() {
  return (
    <section>
      <h2>Determinant and area</h2>

      {/* first in plain text, then the box (the user's request) */}
      <p className="l18-area-lead">
        A linear transformation <Tex tex={r`T_A(\vv x)=A\vv x`} /> “stretches” things.
      </p>
      <div className="block theorem">
        <p>
          <Tex tex={r`T_A`} /> takes the unit square to a parallelogram with area <Tex tex={r`|\det(A)|`} />.
        </p>
        <p className="pointer corner">(→ Remark 18.2.6)</p>
      </div>

      <div className="l18-area-row">
        {EXAMPLES.map((ex, k) => (
          <Example key={ex.name} ex={ex} index={k + 1} noteAt={EXAMPLES.length + 1} />
        ))}
      </div>
    </section>
  );
}
