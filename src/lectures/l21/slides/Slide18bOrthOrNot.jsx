import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Dot } from '../components/Plane.jsx';
import Space, { Arrow3, Seg3, Patch3 } from '../components/Space.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { FImage, GridImage } from '../components/FShape.jsx';
import { useFragmentShown, useTween } from '../components/useFragmentTween.js';
import useSwing from '../components/useSwing.js';
import { PRINT } from '../components/print.js';
import { INK, RED, BLUE, GREEN, lerp, rot } from '../components/tr.js';

export const mul = (A, B) => A.map((row) => [row[0] * B[0][0] + row[1] * B[1][0], row[0] * B[0][1] + row[1] * B[1][1]]);
export const lerpI = (M, t) => M.map((row, i) => row.map((m, j) => lerp(i === j ? 1 : 0, m, t)));
export const PHI = (Math.atan2(1, 2) * 180) / Math.PI; // f)'s mirror, the line at 26.57° (tan φ = 1/2)

/** v turned by `phi` radians about the line through (1, 1, 1) (Rodrigues' formula). */
export function turn111(v, phi) {
  const k = 1 / Math.sqrt(3);
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const kv = k * (v[0] + v[1] + v[2]);
  const cross = [k * (v[2] - v[1]), k * (v[0] - v[2]), k * (v[1] - v[0])]; // (1, 1, 1)/√3 × v
  return v.map((x, i) => x * c + cross[i] * s + k * kv * (1 - c));
}

// h)'s columns, each the sum of two standard vectors (h = I + g): length √2, and any two at 60°
export const COLS = [
  [1, 1, 0],
  [0, 1, 1],
  [1, 0, 1],
];

/**
 * The eight matrices: `at(t)` is the matrix on its way from I (t = 0) to it (t = 1), so that F moves
 * as the matrix does: rotations turn, the reflections turn F over like a card across their mirrors,
 * the others stretch or shear; g) and h), 3 × 3, move e₁, e₂, e₃ and the unit cube instead (`space(t)`:
 * where the three arrows are at t; `center`: where the origin sits in the picture). `what` names it,
 * for the picture's title only. Orthogonal matrices as linear transformations reuses them (and the
 * picture's frame), with eᵢ and Aeᵢ on top.
 */
export const EXAMPLES = [
  { opt: 'a)', tex: r`\begin{bmatrix}1&1\\0&1\end{bmatrix}`, at: (t) => lerpI([[1, 1], [0, 1]], t), what: 'a shear' },
  { opt: 'b)', tex: r`\begin{bmatrix}1&-1\\1&1\end{bmatrix}`, at: (t) => rot(45 * t).map((row) => row.map((m) => m * lerp(1, Math.SQRT2, t))), what: 'a turn by 45° and a stretch' },
  { opt: 'c)', tex: r`\tfrac1{\sqrt2}\begin{bmatrix}1&-1\\1&1\end{bmatrix}`, at: (t) => rot(45 * t), ok: true, what: 'the rotation by 45°' },
  { opt: 'd)', tex: r`\begin{bmatrix}-1&0\\0&1\end{bmatrix}`, at: (t) => [[lerp(1, -1, t), 0], [0, 1]], ok: true, what: 'the reflection across the y-axis' },
  { opt: 'e)', tex: r`\tfrac15\begin{bmatrix}4&2\\2&1\end{bmatrix}`, at: (t) => lerpI([[0.8, 0.4], [0.4, 0.2]], t), what: 'the projection onto the line through (2, 1)' },
  { opt: 'f)', tex: r`\begin{bmatrix}3/5&4/5\\4/5&-3/5\end{bmatrix}`, at: (t) => mul(mul(rot(PHI), [[1, 0], [0, 1 - 2 * t]]), rot(-PHI)), ok: true, what: 'a reflection' },
  {
    opt: 'g)',
    tex: r`\begin{bmatrix}0&0&1\\1&0&0\\0&1&0\end{bmatrix}`,
    space: (t) => [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((e) => turn111(e, (2 * Math.PI * t) / 3)),
    center: [0.32, 0.68],
    ok: true,
    what: 'a permutation matrix: e1 to e2, e2 to e3, e3 to e1, the unit cube turning onto itself',
  },
  {
    opt: 'h)',
    tex: r`\begin{bmatrix}1&0&1\\1&1&0\\0&1&1\end{bmatrix}`,
    space: (t) => COLS.map((col, i) => col.map((c, j) => lerp(i === j ? 1 : 0, c, t))),
    center: [0.12, 0.75],
    what: 'e1, e2, e3 moved to the columns (1, 1, 0), (0, 1, 1), (1, 0, 1), longer and not at right angles: the unit cube stretched and skewed',
  },
];
export const XR = [-1.15, 2.15];
export const YR = [-0.75, 2.1];
export const UNIT = 52;
// the size of a picture, so that h)'s 3-D one matches the others
export const W = (XR[1] - XR[0]) * UNIT + 8;
export const H = (YR[1] - YR[0]) * UNIT + 8;

export const N = 8; // the cards; key press N + 1 replays all the pictures, on a loop

/** Whether key press `index` has been reached, and the fragment marker that tells. */
export function useShown(index) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const marker = <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />;
  return [on, marker];
}

// the 3-D pictures' view: the diagonal through (1, 1, 1), g)'s axis and h)'s stretch, at 60° to the
// line of sight, so that neither is hidden (seen end on, g)'s turn looks flat and h)'s stretch short)
export const AZ = 20;
export const EL = 20;
export const UNIT3 = 52;
export const CUBE = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
export const add = (...vs) => vs.reduce((a, v) => a.map((x, k) => x + v[k]), [0, 0, 0]);

/** The 12 edges of the box spanned by c₁, c₂, c₃ from the origin, as pairs of corners. */
export function edges(c) {
  const out = [];
  [0, 1, 2].forEach((i) => {
    const [j, k] = [0, 1, 2].filter((m) => m !== i);
    [[], [c[j]], [c[k]], [c[j], c[k]]].forEach((base) => out.push([add(...base), add(...base, c[i])]));
  });
  return out;
}

/** Its 6 faces, as lists of corners. */
export function faces(c) {
  const out = [];
  [0, 1, 2].forEach((k) => {
    const [i, j] = [0, 1, 2].filter((m) => m !== k);
    [[], [c[k]]].forEach((base) => out.push([add(...base), add(...base, c[i]), add(...base, c[i], c[j]), add(...base, c[j])]));
  });
  return out;
}

/**
 * The picture of a 3 × 3 example: the unit cube (dashed gray) and its image, the box spanned by the
 * arrows that start as e₁ (red), e₂ (blue) and e₃ (green), at `tips` (the user's request: an object,
 * to see whether things are stretched), its faces in `color`, far ones first. For g) (from
 * Orthogonal matrices), the permutation matrix [0 0 1; 1 0 0; 0 1 0], e₁ moves to e₂, e₂ to e₃ and e₃
 * to e₁, each turned by 120t° about the line through (1, 1, 1), so the cube turns, unchanged, onto
 * itself; for h), each arrow slides straight to its column, and the cube stretches into a slanted box.
 * The labels mark the places e₁, e₂, e₃ (each in the color of the arrow that starts there).
 */
export function Cube3({ tips, color, center, title }) {
  const arrows = [RED, BLUE, GREEN].map((c, i) => ({ color: c, tip: tips[i] }));
  const labels = [
    { tex: r`\vv e_1`, color: RED, at: [1, 0, 0], dx: -14, dy: 6 },
    { tex: r`\vv e_2`, color: BLUE, at: [0, 1.2, 0], dx: 10, dy: 4 },
    { tex: r`\vv e_3`, color: GREEN, at: [0, 0, 1], dx: 0, dy: -14 },
  ];
  return (
    <Space width={W} height={H} unit={UNIT3} center={center} az={AZ} el={EL} rock={false} drag={false} axes={false} title={title}>
      {(sp) => {
        const depth = (pts) => pts.reduce((d, q) => d + sp.depth(q), 0) / pts.length;
        return (
          <g>
            {edges(CUBE).map(([a, b], n) => (
              <Seg3 key={`h${n}`} s={sp} from={a} to={b} color="#9ca3af" width={1.3} dashed />
            ))}
            {faces(tips)
              .sort((a, b) => depth(a) - depth(b))
              .map((f, n) => (
                <Patch3 key={`f${n}`} s={sp} corners={f} fill={color} opacity={0.13} stroke={color} strokeWidth={1.4} strokeOpacity={0.55} />
              ))}
            {labels.map((l) => {
              const [x, y] = sp.P(l.at);
              return <TexSvg key={l.tex} x={x + l.dx} y={y + l.dy} tex={l.tex} color={l.color} size={16} w={34} h={24} />;
            })}
            {[...arrows]
              .sort((a, b) => sp.depth(a.tip) - sp.depth(b.tip))
              .map((a) => (
                <Arrow3 key={a.color} s={sp} to={a.tip} color={a.color} width={3} head={11} />
              ))}
          </g>
        );
      }}
    </Space>
  );
}

/**
 * One example: its matrix at once; on key press `index`, the verdict, Orthogonal (green) or Not
 * orthogonal (red), nothing more, and its picture, played once (the user's request); `replay` (key
 * press N + 1): the picture on a loop, at `swing`.
 */
export function Card({ ex, index, replay, swing }) {
  const [on, marker] = useShown(index);
  const once = useTween(on, { ms: 1500, delay: 400 });
  // played once with the verdict, then, from key press N + 1, on a loop with all the others: from the
  // image back to F and forth again (1 − swing, so that nothing jumps when the loop starts)
  const t = PRINT ? 1 : replay ? 1 - swing : once;
  const color = ex.ok ? GREEN : RED;
  const title = `What ${ex.opt} does: ${ex.what}`;
  return (
    <div className="l21-oq-card">
      {marker}
      <div className="l21-oq-top">
        <p className="l21-oq-mat">
          <span className="l21-oq-opt">{ex.opt}</span> <Tex tex={ex.tex} />
        </p>
        <Fragment index={index} as="p" className={`l21-oq-answer ${ex.ok ? 'l21-oq-yes' : 'l21-oq-no'}`}>
          {ex.ok ? 'Orthogonal' : 'Not orthogonal'}
        </Fragment>
      </div>
      <Fragment index={index} className="l21-oq-fig">
        {ex.space ? (
          <Cube3 tips={ex.space(t)} color={color} center={ex.center} title={title} />
        ) : (
          <Plane xRange={XR} yRange={YR} unit={UNIT} pad={4} grid={false} axes={false} title={title}>
            {(p) => (
              <g>
                <GridImage p={p} n={4} />
                <FImage p={p} home />
                <FImage p={p} M={ex.at(t)} color={color} opacity={0.9} />
                <Dot p={p} at={[0, 0]} color={INK} r={3} />
              </g>
            )}
          </Plane>
        )}
      </Fragment>
    </div>
  );
}

/**
 * Orthogonal or not? (the user's request, in place of the poll Which of these matrices is
 * orthogonal?: a full page of examples and non-examples). Eight cards, 2 × 4 (the user's request),
 * each its matrix at once, its picture under it; on its key press (a to h, key presses 1–8), the
 * verdict, Orthogonal (green) or Not orthogonal (red), and its picture, played once; key press 9: all
 * the pictures again, on a loop (the user's request; the user removed "Orthogonal?" and the reasons): F,
 * the faint grid and F in gray, the image green or red (b, c switched with e, f, then d with f, at
 * the user's requests). a) a shear, no; b) orthogonal columns of length √2, no; c) b) divided by √2,
 * the rotation by 45°, yes; d) the reflection across the y-axis (from Orthogonal matrices; once g),
 * moved here in place of the rotation by 90°, the user's request), yes; e) the projection onto the
 * line through (2, 1), (1/5)[4 2; 2 1], F squashed onto it (in place of the stretch [2 0; 0 1/2], the
 * user's request), no; f) the poll's reflection (the poll's b)), yes; g) a permutation matrix,
 * e₁, e₂, e₃ permuted in ℝ³ (from Orthogonal matrices), the unit cube turning onto itself, yes; h) a
 * 3 × 3 that is not (the user's request; switched with g), at the user's request), I + g), its columns
 * (1, 1, 0), (0, 1, 1), (1, 0, 1) of length √2 at 60° to each other, the cube stretched, no.
 * Print: each at its image.
 */
export default function Slide18bOrthOrNot() {
  const grid = useRef(null);
  const [replay, marker] = useShown(N + 1);
  const swing = useSwing(replay, { ms: 1500, hold: 1100, delay: 300, live: () => !!grid.current?.closest('section')?.classList.contains('present') });
  return (
    <section>
      <h2>Orthogonal or not?</h2>
      {marker}
      <div className="l21-oq-grid" ref={grid}>
        {EXAMPLES.map((ex, i) => (
          <Card key={ex.opt} ex={ex} index={i + 1} replay={replay} swing={swing} />
        ))}
      </div>
    </section>
  );
}
