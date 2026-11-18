import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane, { Arrow, RightAngle, AngleArc } from '../components/Plane.jsx';
import { Backdrop } from '../components/SumPicture.jsx';
import { GridImage } from '../components/FShape.jsx';
import useSwing from '../components/useSwing.js';
import { PRINT } from '../components/print.js';
import { INK, RED, AMBER, PURPLE, EIGS0, apply, len, pts, times, texMh, A0 } from '../components/eig.js';
import { A3, EIGS3, AN, EIGSN } from '../components/spec.js';
import NoteOwl from '../components/NoteOwl.jsx';

export const SIZE = 206; // each picture's side (px); its range is chosen so that its eigenvectors fill it alike
// a matrix that is not symmetric (the user's request: in place of Example 3's [13 −3; −3 5]), whose
// eigenvectors are almost, but not, perpendicular: A(1, 1) = 4(1, 1), A(1, −2) = (1, −2), at 108.4°
export const AS = [
  [3, 1],
  [2, 2],
];
export const EIGSS = [
  { v: [1, 1], lam: 4, color: AMBER },
  { v: [1, -2], lam: 1, color: PURPLE },
];
// each card: its matrix (TeX and entries), its eigenvectors, its picture's range (±half), and `s`, the
// multiple of each eigenvector that is drawn, so that it and λ times it both fit
// the not symmetric ones first, under A basis of eigenvectors exists for a larger class of matrices,
// then the symmetric ones, under the owl's note (the user's order)
export const NONSYM = [
  { m: r`\begin{bmatrix}3&1\\2&2\end{bmatrix}`, A: AS, eigs: EIGSS, half: 2.4, s: 0.5, sym: false },
  { m: r`\begin{bmatrix}1&1\\0&2\end{bmatrix}`, A: AN, eigs: EIGSN, half: 2.4, s: 1, sym: false },
];
export const SYM = [
  { m: texMh(A0), A: A0, eigs: EIGS0, half: 2.2, s: 1, sym: true },
  { m: r`\begin{bmatrix}1&2\\2&-2\end{bmatrix}`, A: A3, eigs: EIGS3, half: 3.4, s: 0.5, sym: true },
];
export const MARKS = 7; // the key press of the right-angle marks and the arcs, in all four pictures
export const I2 = [
  [1, 0],
  [0, 1],
];
// T_A on its way, (1 − t)I + tA: each eigenvector v goes to (1 + t(λ − 1))v, along its own line
export const along = (A, t) => A.map((row, i) => row.map((a, j) => (1 - t) * I2[i][j] + t * a));

/** A matrix's two eigenvectors on their eigenlines, over a faint grid, with the plane's grid (blue)
 *  and the eigenvectors moved by (1 − t)I + tA: T_A stretches (or flips) each along its own line. On
 *  key press MARKS, the right-angle mark between them, or (not symmetric) the arc of their angle, in red. */
export function Picture({ card, t }) {
  const R = [-card.half, card.half];
  const unit = SIZE / (2 * card.half);
  const M = along(card.A, t);
  const ds = card.eigs.map((e) => times(card.s, e.v));
  const moved = ds.map((d) => apply(M, d));
  // the marks between the moved eigenvectors (between the drawn ones while one passes through 0)
  const [a, b] = moved.map((u, i) => (len(u) > 1e-3 ? u : ds[i]));
  return (
    <Plane xRange={R} yRange={R} unit={unit} pad={0} grid={false} axes={false} title="The plane moved by A: its two eigenvectors stay on their eigenlines">
      {(p) => (
        <g>
          <Backdrop p={p} xRange={R} yRange={R} />
          <GridImage p={p} M={M} n={7} color="rgba(59, 110, 168, 0.2)" axis="rgba(59, 110, 168, 0.42)" />
          {card.eigs.map((e, i) => (
            <polyline key={i} points={pts(p, [times(-9, e.v), times(9, e.v)])} stroke={e.color} strokeWidth="2.4" opacity="0.5" fill="none" />
          ))}
          <Fragment as="g" index={MARKS}>
            {card.sym ? <RightAngle p={p} at={[0, 0]} a={a} b={b} size={15} color={INK} /> : <AngleArc p={p} a={a} b={b} radius={30} color={RED} width={2.4} />}
          </Fragment>
          {moved.map((u, i) => (
            <Arrow key={i} p={p} to={u} color={card.eigs[i].color} width={3.4} head={Math.min(13, 0.6 * len(u) * unit)} />
          ))}
          <circle cx={p.px(0)} cy={p.py(0)} r="3.5" fill={INK} />
        </g>
      )}
    </Plane>
  );
}

/** A card, on key press `index`: the matrix, its picture, and symmetric (green) or not symmetric (red). */
export function Card({ card, t, index }) {
  return (
    <Fragment index={index} className="l25-perp-card">
      <p className="l25-perp-m">
        <Tex tex={card.m} />
      </p>
      <Picture card={card} t={t} />
      <p className={card.sym ? 'l25-ok' : 'l25-not'}>{card.sym ? 'symmetric' : 'not symmetric'}</p>
    </Fragment>
  );
}

/**
 * Orthogonal eigenvectors: the examples of the Spectral Theorem, stated on the slide before, in two
 * columns (the user's order). On arrival, on the left: Basis of eigenvectors exists for a larger class of
 * matrices (the user's words); key presses 1, 2: under it, one at a time (the user's request: on more
 * key presses), two matrices that are not symmetric, with a basis of eigenvectors, [3 1; 2 2]
 * (eigenvectors (1, 1) and (1, −2), at 108.4°; in place of Example 3's [13 −3; −3 5], the user's
 * request) and the poll's [1 1; 0 2]; 3: under them, the slogan (bold teal; the user's request, the
 * why on the board), eigenvectors with pairwise different eigenvalues are linearly independent; 4: on
 * the right, the owl's note (NoteOwl.jsx; it waddles in as the line appears): for symmetric matrices,
 * eigenvectors associated to different eigenvalues are orthogonal (bold); 5, 6: under it, one at a
 * time, Lecture 24's [1 1/2; 1/2 1] and Example 1's [1 2; 2 −2], symmetric (the user's request: on key
 * presses); 7: the
 * right-angle marks in the symmetric ones and the arcs of the angles (red) in the others (the
 * user's request: after the examples). Each card: the matrix over its two eigenvectors on their
 * eigenlines, and symmetric (green) or not symmetric (red). T_A plays in each picture (the user's
 * request: "animate the transformation in each case"), all four together, there and back on a loop
 * from arrival: the plane's grid (blue) moves by (1 − t)I + tA and each eigenvector stretches (or,
 * for −3, flips) along its own line. Print: the pictures after T_A. (The justification under the
 * pictures, Why? λ(v · w) = (Av) · w = v · (Aw) = μ(v · w) ⟹ v · w = 0, removed by the user.)
 */
export default function Slide06Perp() {
  const sec = useRef(null);
  const t = useSwing(!PRINT, { ms: 2200, hold: 1500, delay: 900, live: () => !!sec.current?.classList.contains('present') });
  return (
    <section ref={sec}>
      <h2>Orthogonal eigenvectors</h2>

      <div className="l25-perp">
        <p className="l25-perp-head">Basis of eigenvectors exists for a larger class of matrices.</p>
        <Fragment index={4} as="p" className="l25-perp-head l25-perp-right l25-note">
          <NoteOwl />
          For symmetric matrices, eigenvectors associated to different eigenvalues are <strong>orthogonal</strong>.
        </Fragment>
        <div className="l25-perp-pair">
          {NONSYM.map((c, i) => (
            <Card key={c.m} card={c} t={PRINT ? 1 : t} index={1 + i} />
          ))}
        </div>
        <Fragment index={3} as="p" className="l25-slogan l25-perp-slogan">
          Eigenvectors with pairwise different eigenvalues are linearly independent.
        </Fragment>
        <div className="l25-perp-pair l25-perp-right">
          {SYM.map((c, i) => (
            <Card key={c.m} card={c} t={PRINT ? 1 : t} index={5 + i} />
          ))}
        </div>
      </div>
    </section>
  );
}
