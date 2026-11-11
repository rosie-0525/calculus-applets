import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import TwoQuestions from '../components/TwoQuestions.jsx';
import { LoopPic, SYSTEM_MAPS } from '../components/ImageCards.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';
import { PRINT } from '../components/print.js';
import { TEAL, GREEN, LEAF } from '../components/ls.js';

/**
 * Linear system in matrix form (titled Linear systems before; after Linear systems are everywhere, the user's request): four concrete systems,
 * of 2 equations in 1 unknown up to 3 in 3, the first three matrices from Image's examples (ImageCards.jsx), the last one the third's with a column v₃ = v₁ + v₂ more;
 * then the two questions (TwoQuestions.jsx) and "Today we'll understand these using linear algebra!";
 * then "Write each system in the form Ax = b:" on the left (the user's request), each system rephrased as Ax = b
 * (no braces naming A, x, b: the user's request), A's size m × n under each matrix (first "A is m × n" and
 * T_A: ℝⁿ → ℝᵐ in rows under the systems, removed at the user's request: no linear transformation
 * yet), and the general statement in a box.
 * The number of equations m is teal (as C(A) ⊂ ℝᵐ and question 1), the number of unknowns n green (as
 * N(A) ⊂ ℝⁿ and question 2). The questions and the line under them fade out as "Write each system …"
 * comes in, in the same place (the same rows of the columns' grid).
 * Key presses: 1, 2 the questions; 3 Today …; 4 Write each system …; 5–8 each system as Ax = b;
 * 9 the sizes (the marker sys-dim); 10 the box; 11 the preview (below); 12–15 its pictures.
 * The right-hand sides of the systems can be edited at any time (SystemCol; the user's request): b
 * follows, in Ax = b, in "b = …" and in the pictures.
 *
 * The preview of the linear transformations, with no explanation, for the students to observe the
 * pattern (the user's request; first a slide of its own, Slide02eSystemsMaps, commented out: the
 * systems flashed as the slides changed, so it is key presses of this slide, as the questions before
 * Ax = b). Key press 11 (the marker sys-ab): "Write each system …", x, the = signs, the sizes and the
 * box go; A and b glide out of each Ax = b to "A = …, b = …" under their system (the new ones start
 * where the old ones were, see the layout effect), A black, b green (LEAF). Then, one per key press, under
 * each: the picture of T_A, played once (the user's request; ImageCards.jsx, LoopPic, run 'map': the black arrows e₁, e₂, …
 * become Ae₁, Ae₂, …, the image lights up, unlabelled), ℝⁿ → ℝᵐ under it (the user's request), and after that b, a green arrow (not among
 * the outputs for the first system, which has no solution).
 * (The systems: none, one, one and infinitely many solutions.)
 */

export const VARS = ['x', 'y', 'z'];

export const EXAMPLES = [
  { M: [[2], [1]], b: [4, 3] },
  {
    M: [
      [1, 1],
      [0, 1],
    ],
    b: [3, 1],
  },
  {
    M: [
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    b: [1, 2, 3],
  },
  {
    // ℝ³ collapses into a plane, not a line (the user's request), and gently: the third system's
    // matrix with a third column v₃ = v₁ + v₂, so e₁, e₂, e₃ each tilt onto the plane z = x + y (first
    // Example 1's matrix, whose e₃ ↦ (1, 2, −2) turned over: confusing, the user); b as the third system's
    M: [
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 2],
    ],
    b: [1, 2, 3],
  },
];

export const m = (k) => r`\textcolor{${TEAL}}{${k}}`;
export const n = (k) => r`\textcolor{${GREEN}}{${k}}`;

/**
 * The system in TeX, its terms in columns (alignedat): term & sign & term & … & = b. With `k`, each
 * right-hand side carries data-rhs="k-i": SystemCol makes it editable.
 */
export function systemTex(M, b, k) {
  const rows = M.map((row, i) => {
    const cells = [];
    let started = false;
    row.forEach((a, j) => {
      const coef = Math.abs(a) === 1 ? '' : String(Math.abs(a));
      if (j > 0) cells.push(a === 0 || !started ? '' : a < 0 ? '{}-{}' : '{}+{}');
      cells.push(a === 0 ? '' : `${a < 0 && !started ? '-' : ''}${coef}${VARS[j]}`);
      if (a !== 0) started = true;
    });
    return `${cells.join(' & ')} &= ${k === undefined ? b[i] : r`\htmlData{rhs=${k}-${i}}{${b[i]}}`}`;
  });
  return r`\left\{\begin{alignedat}{${M[0].length}}${rows.join(r`\\`)}\end{alignedat}\right.`;
}

export const col = (entries) => r`\begin{bmatrix}${entries.join(r`\\`)}\end{bmatrix}`;

/**
 * The system as Ax = b, A's size under A (l22-sys-dim: hidden until the marker sys-dim). With `k`, the
 * matrix and b carry the data-id sys-A-k and sys-b-k, from which they glide to "A = …, b = …" on key
 * press 11.
 */
export const axbTex = (M, b, k) => {
  const id = (name, tex) => (k === undefined ? tex : r`\htmlData{id=sys-${name}-${k}}{${tex}}`);
  const A = r`\begin{bmatrix}${M.map((row) => row.join('&')).join(r`\\`)}\end{bmatrix}`;
  return r`\underset{\htmlClass{l22-sys-dim}{\normalsize ${m(M.length)}\times ${n(M[0].length)}}}{${id('A', A)}}${col(VARS.slice(0, M[0].length))}=${id('b', col(b))}`;
};

export const show = (v) => String(v).replace('-', '−');

/**
 * A system's column: its counts (m teal, n green) over it. With `onRhs`, its right-hand sides can be
 * edited (the user's request): click one, type a number; onRhs(k, i, value) at each change that is a
 * number (Enter or Escape leaves; left empty or not a number, it goes back to its last value). The
 * system's TeX is rendered once, with its first values: the typing happens in KaTeX's own span.
 */
export function SystemCol({ M, b, k, onRhs }) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !onRhs || PRINT) return undefined;
    const offs = [...root.querySelectorAll('[data-rhs]')].map((cell) => {
      const i = Number(cell.dataset.rhs.split('-')[1]);
      let last = b[i];
      cell.contentEditable = 'true';
      cell.spellcheck = false;
      cell.inputMode = 'decimal';
      const read = () => {
        const text = cell.textContent.replace(/−/g, '-').trim();
        return /^-?(\d+\.?\d*|\.\d+)$/.test(text) ? Number(text) : null;
      };
      const input = () => {
        const v = read();
        if (v === null) return;
        last = v;
        onRhs(k, i, v);
      };
      const blur = () => {
        cell.textContent = show(last);
      };
      const focus = () => window.getSelection()?.selectAllChildren(cell);
      const keydown = (e) => {
        e.stopPropagation(); // not reveal's keys
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          cell.blur();
        }
      };
      const on = { input, blur, focus, keydown };
      Object.entries(on).forEach(([type, f]) => cell.addEventListener(type, f));
      return () => Object.entries(on).forEach(([type, f]) => cell.removeEventListener(type, f));
    });
    return () => offs.forEach((off) => off());
    // b: the first values only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, onRhs]);
  return (
    <div ref={ref} className="l22-sys-col" style={{ gridColumn: k + 1, gridRow: 1 }}>
      <p className="l22-sys-head">
        {word(M.length, 'equation', 'equations', 'l22-sys-m')}, {word(M[0].length, 'unknown', 'unknowns', 'l22-sys-n')}
      </p>
      {/* the last system glides to the next slide (auto-animate, data-id ex1-system; l22-glide-sys:
          the same font size on both, the system's own size inside, so that only its scale glides) */}
      {k === 3 ? (
        <div className="l22-glide-sys" data-id="ex1-system">
          <span>
            <Tex tex={systemTex(M, b, onRhs ? k : undefined)} />
          </span>
        </div>
      ) : (
        <Tex tex={systemTex(M, b, onRhs ? k : undefined)} />
      )}
    </div>
  );
}

export const word = (k, one, many, cls) => (
  <span className={cls}>
    {k} {k === 1 ? one : many}
  </span>
);

export const mat = (M) => r`\begin{bmatrix}${M.map((row) => row.join('&')).join(r`\\`)}\end{bmatrix}`;

/** "A = …, b = …" (b green): A and b carry the data-ids of axbTex's; "A =" and "b =" fade in (l22-ab-eq). */
export const abTex = (M, b, k) =>
  r`\htmlClass{l22-ab-eq}{A=}\htmlData{id=sys-A-${k}}{${mat(M)}}\quad\textcolor{${LEAF}}{\htmlClass{l22-ab-eq}{\vv b=}\htmlData{id=sys-b-${k}}{${col(b)}}}`;

export default function Slide02dSystems() {
  const marker = useRef(null);
  const grid = useRef(null);
  const shown = useFragmentShown(marker);
  // each system's right-hand side, as edited in the systems: b in Ax = b, in "b = …" and in the pictures
  const [bs, setBs] = useState(() => EXAMPLES.map(({ b }) => b));
  const onRhs = useCallback((k, i, v) => setBs((old) => old.map((b, j) => (j === k ? b.map((c, l) => (l === i ? v : c)) : b))), []);
  // Key press 11: each new A and b starts on the one in Ax = b (hidden at once, by the CSS) and glides
  // to its place
  useLayoutEffect(() => {
    const g = grid.current;
    if (!shown || PRINT || !g || !g.closest('section')?.classList.contains('present')) return;
    const scale = g.getBoundingClientRect().width / g.offsetWidth || 1;
    const moved = [];
    g.querySelectorAll('.l22-sys-ab [data-id]').forEach((to) => {
      const from = g.querySelector(`.l22-sys-axb [data-id="${to.dataset.id}"]`);
      if (!from) return;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      to.style.transition = 'none';
      to.style.transform = `translate(${(a.left - b.left) / scale}px, ${(a.top - b.top) / scale}px) scale(${a.height / b.height})`;
      moved.push(to);
    });
    g.getBoundingClientRect(); // the start is laid out before the glide
    moved.forEach((to) => {
      to.style.transition = 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
      to.style.transform = 'none';
    });
  }, [shown]);

  return (
    <section data-auto-animate>
      <h2>Linear system in matrix form</h2>

      <FxMarker index={9} id="sys-dim" />
      <span ref={marker} className="fragment fx-marker" data-fragment-index={11} data-fx="sys-ab" aria-hidden="true" />
      <div ref={grid} className="l22-sys-grid fx-host">
        {EXAMPLES.map(({ M, b }, k) => (
          <SystemCol key={k} M={M} b={b} k={k} onRhs={onRhs} />
        ))}

        <Fragment index={4} effect="fade-out" className="l22-sys-q" style={{ gridColumn: '1 / -1', gridRow: '2 / 7' }}>
          <TwoQuestions steps className="l22-q-compact" />
          <Fragment index={3} as="p" className="l22-sys-today">
            <span>
              Today we&rsquo;ll understand these using <span className="l22-sys-la">linear algebra</span>!
            </span>
          </Fragment>
        </Fragment>

        {/* the instruction, in the questions' place, then each column's Ax = b in row 3 of the grid,
            level across the columns */}
        <Fragment index={4} as="p" className="l22-sys-write l22-sys-old" style={{ gridColumn: '1 / -1', gridRow: 2 }}>
          Write each system in the form <Tex tex={r`A\vv x=\vv b`} />:
        </Fragment>
        {EXAMPLES.map(({ M }, k) => [
          <Fragment key={`axb${k}`} index={5 + k} className="l22-sys-col l22-sys-axb l22-sys-old" style={{ gridColumn: k + 1, gridRow: 3 }}>
            <Tex tex={axbTex(M, bs[k], k)} />
          </Fragment>,
        ])}

        <Fragment index={10} className="block why l22-sys-box l22-sys-old" style={{ gridColumn: '1 / -1', gridRow: 6 }}>
          <p>
            A linear system with <Tex tex={m('m')} /> equations and <Tex tex={n('n')} /> unknowns can be written as <Tex tex={r`A\vv x=\vv b`} />, where <Tex tex="A" /> is an{' '}
            <Tex tex={r`${m('m')}\times ${n('n')}`} /> matrix.
          </p>
        </Fragment>

        {/* the preview, over the rows under the systems (their columns: a subgrid): A = …, b = …, then the pictures */}
        <div className="l22-sys-over" style={{ gridColumn: '1 / -1', gridRow: '2 / 7' }}>
          {EXAMPLES.map(({ M }, k) => [
            <Fragment key={`ab${k}`} index={11} className="l22-sys-col l22-sys-ab" style={{ gridColumn: k + 1, gridRow: 1 }}>
              <Tex tex={abTex(M, bs[k], k)} />
            </Fragment>,
            <div key={`pic${k}`} className="l22-sys-pic" style={{ gridColumn: k + 1, gridRow: 2 }}>
              <LoopPic index={12 + k} ex={{ ...SYSTEM_MAPS[k], b: bs[k] }} once />
              <Fragment index={12 + k} className="l22-sys-rn">
                <Tex tex={r`\mathbb R^{${n(M[0].length)}}\to\mathbb R^{${m(M.length)}}`} />
              </Fragment>
            </div>,
          ])}
        </div>
      </div>
    </section>
  );
}
