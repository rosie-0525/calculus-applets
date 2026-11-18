import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow } from '../components/Plane.jsx';
import { TipLabel } from '../components/SumPicture.jsx';
import { FImage, GridImage } from '../components/FShape.jsx';
import { useMarkers } from '../components/Staged.jsx';
import { useTween } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { rot } from '../components/inv.js';
import { A0, EIGS0, INK, BLUE, AMBER, apply, len, pts, texMh, times } from '../components/eig.js';

export const UNIT = 62;
// the identity on its way to A: (1 − t)I + tA keeps A's eigenvectors on their lines all the way (the
// first two); the rotation turns by 90t° (a straight line from I to it would shrink the plane on the way)
export const lerpI = (A) => (t) => A.map((row, i) => row.map((a, j) => (1 - t) * (i === j ? 1 : 0) + t * a));
// shared with How many eigenvalues? (Slide17HowMany, the user's request: this slide's animations moved
// there, this slide removed) and Preview (Slide07LikeDiagonal). The first: Stretch and shrink's
// A = [1 1/2; 1/2 1] (the user's request, in place of [2 −1; −1 2]), u stretched by 3/2, v shrunk by 1/2.
// Its `scale`: u and v themselves move, no blue Au, Av (the user's request), and once in place their
// labels read Au and Av; `label`: beside the moving tip, off its line
export const CARDS = [
  {
    m: texMh(A0),
    at: lerpI(A0),
    xRange: [-3, 3],
    yRange: [-3, 3],
    scale: true,
    eigs: [
      { ...EIGS0[0], end: r`A\vv u`, label: { gap: 0, dx: 16, dy: 14 } },
      { ...EIGS0[1], end: r`A\vv v`, label: { gap: 0, dx: -18, dy: 14 } },
    ],
    title: 'The grid, the unit square and F under A = [1 1/2; 1/2 1]: u stretched by 3/2, v shrunk by 1/2',
  },
  {
    m: r`\begin{bmatrix}1&1\\0&1\end{bmatrix}`,
    at: lerpI([
      [1, 1],
      [0, 1],
    ]),
    xRange: [-3, 3],
    yRange: [-3, 3],
    eigs: [{ v: [1, 0], lam: 1, color: AMBER, name: r`\vv e_1`, end: r`A\vv e_1=\vv e_1`, label: { gap: 8, dx: 18, dy: 20 } }],
    title: 'The grid, the unit square and F under the shear A = [1 1; 0 1]: e₁ stays',
  },
  {
    m: r`\begin{bmatrix}0&-1\\1&0\end{bmatrix}`,
    at: (t) => rot(90 * t),
    xRange: [-3, 3],
    yRange: [-3, 3],
    eigs: [],
    title: 'The grid, the unit square and F under the rotation A = [0 −1; 1 0]: every line turns',
  },
];

/**
 * One matrix at work (Example 1's look): the grid, the unit square and F moved by the matrix on its
 * way from I to A (gray: where they start), faded back; the eigenlines in their colours, each
 * eigenvector x and Ax (blue) moving along its line; at the end, Ax = λx (for λ = 1 in place of x's
 * name, which it would cover); a card with `scale`: x itself moves to Ax, its label Ax once there.
 * `unit`: smaller on Preview.
 */
export function Scene({ card, t, unit = UNIT }) {
  const M = card.at(t);
  const done = t > 0.999;
  return (
    <Plane xRange={card.xRange} yRange={card.yRange} unit={unit} pad={6} grid={false} axes={false} title={card.title}>
      {(p) => (
        <g>
          <g opacity="0.7">
            <GridImage p={p} M={M} />
            <FImage p={p} home />
            <FImage p={p} M={M} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />
          </g>
          {card.eigs.map((e, i) => {
            const f = times(9 / len(e.v), e.v);
            return <polyline key={i} points={pts(p, [times(-1, f), f])} stroke={e.color} strokeWidth="2.6" opacity="0.6" fill="none" />;
          })}
          {/* Ax under x: the same arrow where λ = 1, a blue rim round it; with `scale`, x itself moves */}
          {!card.scale &&
            card.eigs.map((e, i) => (
              <Arrow key={i} p={p} to={apply(M, e.v)} color={BLUE} width={4.4} />
            ))}
          {card.eigs.map((e, i) => (
            <Arrow key={i} p={p} to={card.scale ? apply(M, e.v) : e.v} color={e.color} width={3} head={12} />
          ))}
          <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
          <g className="l15-sum-labels">
            {card.scale &&
              card.eigs.map((e, i) => {
                const a = { gap: 0, dx: 0, dy: 0, ...e.label };
                return <TipLabel key={i} p={p} v={apply(M, e.v)} tex={done ? e.end : e.name} color={e.color} size={20} gap={a.gap} dx={a.dx} dy={a.dy} />;
              })}
            {!card.scale && card.eigs.map((e, i) => {
              const a = { gap: 16, dx: 0, dy: 0, ...e.label };
              const b = { gap: 0, dx: 0, dy: 0, ...e.labelEnd };
              const inPlace = done && e.lam === 1;
              return (
                <g key={i}>
                  <TipLabel p={p} v={e.v} tex={inPlace ? e.end : e.name} color={inPlace ? BLUE : e.color} size={20} gap={a.gap} dx={a.dx} dy={a.dy} />
                  {done && e.lam !== 1 && <TipLabel p={p} v={apply(M, e.v)} tex={e.end} color={BLUE} size={20} gap={b.gap} dx={b.dx} dy={b.dy} />}
                </g>
              );
            })}
          </g>
        </g>
      )}
    </Plane>
  );
}

/**
 * (Removed by the user, commented out in App.jsx: its animations, CARDS and Scene, are now on How many
 * eigenvalues?, in place of the parabolas; the first matrix is now A = [1 1/2; 1/2 1].)
 * What the three matrices do (the user's request), after How many eigenvalues?: its three matrices, each
 * on its key press (1–3) with its picture, and a moment later T_A moves the grid, the unit square and
 * F: [2 −1; −1 2] keeps both eigenlines (u stays, v triples), the shear [1 1; 0 1] keeps one (the x-axis:
 * e₁ stays), and the rotation by 90° keeps none. Print: each at the end of its move.
 */
export default function Slide17bHowManyMoves() {
  const [markers, on] = useMarkers([1, 2, 3]);
  const ts = [useTween(on[0], { ms: 2800, delay: 1000 }), useTween(on[1], { ms: 2800, delay: 1000 }), useTween(on[2], { ms: 2800, delay: 1000 })];
  return (
    <section>
      <h2>What the three matrices do</h2>
      {markers}

      <div className="l24-moves">
        {CARDS.map((c, k) => (
          <Fragment key={c.m} index={k + 1} className="l24-moves-card">
            <p className="l24-moves-m">
              <Tex tex={`A=${c.m}`} />
            </p>
            <Scene card={c} t={PRINT ? 1 : ts[k]} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}
