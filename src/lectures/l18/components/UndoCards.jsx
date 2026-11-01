import { useRef } from 'react';
import Tex from './Tex.jsx';
import Fragment from './Fragment.jsx';
import { Dot } from './Plane.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { along, UndoPlane } from './UndoExamples.jsx';
import { useFragmentShown, useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { INK, RED, BLUE, AMBER, apply } from './inv.js';

/**
 * One example of Linear transformation: Invertible or not?, now with what undoes it: the plane and F go to their images
 * by T as `t` goes from 0 to 1 (F blue); if T is invertible, T⁻¹ brings them back as `b` goes from
 * 0 to 1 (F amber, the blue F left faint); if not, two points (blue, amber; their homes faint, a
 * dashed line between) land on the same point, ringed. Print: T's end, and, if T is invertible,
 * S's end on S's key press `back`.
 */
function UndoCard({ ex, unit, t, b, back }) {
  return (
    <UndoPlane unit={unit} title={`${ex.name}: ${ex.undo ? `undone by ${ex.undo}` : 'not invertible'}`}>
      {(p) =>
        PRINT && ex.undo ? (
          <g>
            <Fragment as="g" index={back} effect="fade-out">
              {undoLayers(p, ex, 1, 0)}
            </Fragment>
            <Fragment as="g" index={back}>
              {undoLayers(p, ex, 1, 1)}
            </Fragment>
          </g>
        ) : (
          undoLayers(p, ex, t, b)
        )
      }
    </UndoPlane>
  );
}

/** What UndoCard draws on its plane `p`, T `t` of the way and S `b` of the way back. */
function undoLayers(p, ex, t, b) {
  const M = ex.undo && b > 0 ? along(ex, 1 - b) : along(ex, t);
  return (
    <g>
      <GridImage p={p} M={M} />
      <FImage p={p} home />
      {ex.undo ? (
        <>
          {t > 0 && <FImage p={p} M={along(ex, t)} color={BLUE} opacity={b > 0 ? 0.35 : 0.9} />}
          {b > 0 && <FImage p={p} M={M} color={AMBER} opacity={0.9} />}
        </>
      ) : (
        <>
          <g opacity={0.45 * t}>
            <line x1={p.px(ex.points[0][0])} y1={p.py(ex.points[0][1])} x2={p.px(ex.points[1][0])} y2={p.py(ex.points[1][1])} stroke={INK} strokeWidth="1.4" strokeDasharray="5 5" />
            <Dot p={p} at={ex.points[0]} color={BLUE} r={5} />
            <Dot p={p} at={ex.points[1]} color={AMBER} r={5} />
          </g>
          <FImage p={p} M={M} color={BLUE} opacity={0.9} />
          <Dot p={p} at={apply(M, ex.points[0])} color={BLUE} r={6} />
          <Dot p={p} at={apply(M, ex.points[1])} color={AMBER} r={t > 0.98 ? 4 : 6} />
          {t > 0.98 && <circle cx={p.px(apply(M, ex.points[0])[0])} cy={p.py(apply(M, ex.points[0])[1])} r={11} fill="none" stroke={RED} strokeWidth="2.4" />}
        </>
      )}
      <Dot p={p} at={[0, 0]} color={INK} r={3} />
    </g>
  );
}

/** "Rotation by 90°" → "rotation by 90°", after "T =". */
const lower = (s) => s[0].toLowerCase() + s.slice(1);

/**
 * The cards of Invertible linear transformations (both slides), a row of `examples`, two key presses
 * each from key press 1: example k's T on key press 2k + 1, then S, what undoes it, or "not
 * invertible" on 2k + 2. The captions name them as in the definition: "T = rotation by 90°", then
 * "S = rotation by −90°" (the reflection: S = T). Print: each card's end.
 */
export default function UndoCards({ examples, unit }) {
  const refs = examples.map(() => useRef(null));
  const backRefs = examples.map(() => useRef(null));
  const go = refs.map(useFragmentShown).map((shown) => useTween(shown, { ms: 1200, delay: 500 }));
  const back = backRefs.map(useFragmentShown).map((shown) => useTween(shown, { ms: 1200, delay: 300 }));
  return (
    <>
      {refs.map((ref, k) => (
        <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={2 * k + 1} aria-hidden="true" />
      ))}
      {backRefs.map((ref, k) => (
        <span key={k} ref={ref} className="fragment fx-marker" data-fragment-index={2 * k + 2} aria-hidden="true" />
      ))}
      <div className="l18-undo">
        {examples.map((ex, k) => (
          <Fragment key={ex.name} index={2 * k + 1} as="figure" className="l18-undo-card">
            <UndoCard ex={ex} unit={unit} t={PRINT ? 1 : go[k]} b={PRINT ? 1 : back[k]} back={2 * k + 2} />
            <figcaption>
              <Tex tex="T" /> = {lower(ex.name)}
              <br />
              {ex.undo ? (
                <Fragment as="span" index={2 * k + 2} className="l18-undo-by">
                  <Tex tex="S" /> = {ex.undo === 'itself' ? <Tex tex="T" /> : ex.undo}
                </Fragment>
              ) : (
                <Fragment as="span" index={2 * k + 2} className="l18-not">
                  not invertible
                </Fragment>
              )}
            </figcaption>
          </Fragment>
        ))}
      </div>
    </>
  );
}
