import { useRef } from 'react';
import Tex, { r } from './Tex.jsx';
import Fragment from './Fragment.jsx';
import Plane, { Dot } from './Plane.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { EXAMPLES, along } from './UndoExamples.jsx';
import { useFragmentShown, useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { INK, BLUE, AMBER } from './inv.js';

// the examples of Invertible matrices and the slide after it, whose inverse is seen at once (the
// user's request, in place of the textbook's Example 18.1.4, A = [2 1; 1 2], whose inverse was not
// clear): A, and B, what brings F back (`same`: B = A); `tA`, `tB`: what T_A and T_B are, beside
// their names (the user's request: "rotation by 90°" is T_A, not the strip's title)
const byName = (name) => EXAMPLES.find((ex) => ex.name === name);
const acrossY = (
  <>
    reflection across the <span className="nowrap">y-axis</span>
  </>
);
export const STRIPS = {
  rotation: {
    ex: byName('Rotation by 90°'),
    tA: 'rotation by 90°',
    tB: 'rotation by −90°',
    A: r`\begin{bmatrix}0&-1\\1&0\end{bmatrix}`,
    B: r`\begin{bmatrix}0&1\\-1&0\end{bmatrix}`,
  },
  reflection: {
    ex: byName('Reflection across the y-axis'),
    tA: acrossY,
    tB: acrossY,
    A: r`\begin{bmatrix}-1&0\\0&1\end{bmatrix}`,
    B: r`\begin{bmatrix}-1&0\\0&1\end{bmatrix}`,
    same: true,
  },
};

// F and its images lie in −1 ≤ x ≤ 1, 0 ≤ y ≤ 1 (the turning square reaches y = √2)
export const XR = [-1.3, 1.3];
export const YR = [-0.25, 1.45];
export const UNIT = 62;
// the strip's columns: panel, T_A, panel, T_B, panel (px)
const PANEL = Math.round((XR[1] - XR[0]) * UNIT + 12);
export const COLUMNS = [PANEL, 250, PANEL, 330, PANEL];

/** A panel of the strip: F (gray) and, when `M`, its image (`color`). */
function Panel({ M, color, title }) {
  return (
    <Plane xRange={XR} yRange={YR} unit={UNIT} pad={6} grid={false} axes={false} title={title}>
      {(p) => (
        <g>
          <GridImage p={p} n={3} />
          <FImage p={p} home />
          {M && <FImage p={p} M={M} color={color} opacity={0.9} />}
          <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
        </g>
      )}
    </Plane>
  );
}

/** A fragment on key press `index`, or, without one, a plain element (shown from the start). */
function Maybe({ index, as: Tag = 'div', children, ...rest }) {
  return index == null ? (
    <Tag {...rest}>{children}</Tag>
  ) : (
    <Fragment index={index} as={Tag} {...rest}>
      {children}
    </Fragment>
  );
}

/** `from`, then, on key press `at`, `to` in its place (cross-faded; without `at`, `from` only). */
function Swap({ at, from, to }) {
  if (at == null) return from;
  return (
    <span className="l18-swap">
      <Fragment as="span" index={at} effect="fade-out">
        {from}
      </Fragment>
      <Fragment as="span" index={at}>
        {to}
      </Fragment>
    </span>
  );
}

/**
 * The arrow between two panels, its name and what it is above it ("T_A = rotation by 90°"), and the
 * matrix under it, on key press `matrixAt` (the user's request).
 */
function Step({ index, color, name, desc, matrix, matrixAt }) {
  return (
    <Maybe index={index} className="l18-istep" style={{ color }}>
      <span className="l18-istep-name">
        {name}
        {desc && <span className="l18-istep-desc"> = {desc}</span>}
      </span>
      <svg width="130" height="22" viewBox="0 0 130 22" aria-hidden="true">
        <line x1="4" y1="11" x2="114" y2="11" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <polygon points="126,11 112,4 112,18" fill={color} />
      </svg>
      <Maybe index={matrixAt} as="span" className="l18-istep-matrix">
        {matrix}
      </Maybe>
    </Maybe>
  );
}

/**
 * One example as a strip: on key press `forthAt`, the strip comes up, F, and T_A (blue; "T_A =
 * rotation by 90°") taking it to AF, gliding; then T_B (amber) bringing it back on `backAt`; then the
 * matrices, A and B, on `matricesAt` (B on `matrixBAt` instead, if given; the user's request; without these key presses, all shown from
 * the start, as it ended); on `renameAt`, B becomes A⁻¹ (T_{A⁻¹}, A⁻¹ = …). `label`: the example's
 * name, without what T_A and T_B are: the strip on a card of its own, the name a tag on its top-left
 * corner (the user's request: the two examples cramped, with their names on the left). `id`: the
 * data-id for reveal's auto-animate, on the row of panels, which is the same size on both slides, so
 * it only moves (the card and the tag fade in); no p inside, which reveal would also match by its
 * text and move twice. Print: each panel as it ends up.
 */
export default function InverseStrip({ strip, forthAt, backAt, matricesAt, matrixBAt = matricesAt, renameAt, id, label }) {
  const forthRef = useRef(null);
  const backRef = useRef(null);
  const forthOn = useFragmentShown(forthRef);
  const backOn = useFragmentShown(backRef);
  const tf = useTween(forthOn, { ms: 1500, delay: 500 });
  const tb = useTween(backOn, { ms: 1500, delay: 500 });
  const still = PRINT || forthAt == null;
  const forth = still || backOn ? 1 : tf;
  const back = still ? 1 : tb;
  const inv = (b, a) => <Swap at={renameAt} from={<Tex tex={b} />} to={<Tex tex={a} />} />;
  const tail = strip.same ? '=A' : '';
  return (
    <Maybe index={forthAt} className={`l18-istrip${label ? ' l18-istrip-card' : ''}`}>
      {forthAt != null && <span ref={forthRef} className="fragment fx-marker" data-fragment-index={forthAt} aria-hidden="true" />}
      {backAt != null && <span ref={backRef} className="fragment fx-marker" data-fragment-index={backAt} aria-hidden="true" />}
      {label && <span className="l18-istrip-tag">{label}</span>}
      <div className="l18-istrip-row" data-id={id} style={{ gridTemplateColumns: COLUMNS.map((w) => `${w}px`).join(' ') }}>
        <Panel title="F" />
        <Step color={BLUE} name={<Tex tex="T_A" />} desc={!label && strip.tA} matrix={<Tex tex={`A=${strip.A}`} />} matrixAt={matricesAt} />
        <Panel M={along(strip.ex, forth)} color={BLUE} title="AF" />
        <Step
          index={backAt}
          color={AMBER}
          name={inv('T_B', 'T_{A^{-1}}')}
          desc={!label && strip.tB}
          matrix={inv(`B=${strip.B}${tail}`, `A^{-1}=${strip.B}${tail}`)}
          matrixAt={matrixBAt}
        />
        <Maybe index={backAt}>
          <Panel M={along(strip.ex, 1 - back)} color={AMBER} title="F again" />
        </Maybe>
      </div>
    </Maybe>
  );
}

// the step, for a strip drawn elsewhere in the same style (What about shearing?)
export { Step as StripStep };
