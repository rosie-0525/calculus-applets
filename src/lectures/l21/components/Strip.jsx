import { useRef } from 'react';
import Tex from './Tex.jsx';
import Fragment from './Fragment.jsx';
import Plane, { Dot } from './Plane.jsx';
import { FImage, GridImage } from './FShape.jsx';
import { useFragmentShown, useTween } from './useFragmentTween.js';
import { PRINT } from './print.js';
import { INK } from './tr.js';

export const XR = [-1.3, 1.3];
export const YR = [-1.3, 1.3];
const UNIT = 58;

const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
const I = [
  [1, 0],
  [0, 1],
];

/** A panel: the faint grid, F (gray) and, with `M`, its image (`color`), and (with `named`) its name under it. */
function Panel({ M, color, name, unit = UNIT, named = true }) {
  return (
    <div className="l21-panel">
      <Plane xRange={XR} yRange={YR} unit={unit} pad={6} grid={false} axes={false} title={name}>
        {(p) => (
          <g>
            <GridImage p={p} n={3} />
            <FImage p={p} home />
            {M && <FImage p={p} M={M} color={color} opacity={0.9} />}
            <Dot p={p} at={[0, 0]} color={INK} r={3.5} />
          </g>
        )}
      </Plane>
      {named && (
        <span className="l21-panel-name">
          <Tex tex={name} />
        </span>
      )}
    </div>
  );
}

/** The arrow of a step, its name above it and its matrix under it, in its colour. */
function Arrow({ color, name, matrix }) {
  return (
    <div className="l18-istep l21-step" style={{ color }}>
      <span className="l18-istep-name">
        <Tex tex={name} />
      </span>
      <svg width="120" height="22" viewBox="0 0 120 22" aria-hidden="true">
        <line x1="4" y1="11" x2="104" y2="11" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <polygon points="116,11 102,4 102,18" fill={color} />
      </svg>
      {matrix && (
        <span className="l18-istep-matrix">
          <Tex tex={matrix} />
        </span>
      )}
    </div>
  );
}

/** A step: on key press `index`, its arrow and its panel come, the image gliding there along `path`. */
function Step({ step, before, unit, named }) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const t = useTween(on, { ms: 1500, delay: 450 });
  const k = PRINT ? 1 : t;
  return (
    <Fragment index={step.index} className="l21-strip-step">
      <span ref={ref} className="fragment fx-marker" data-fragment-index={step.index} aria-hidden="true" />
      <Arrow color={step.color} name={step.name} matrix={step.matrix} />
      <Panel M={mul(step.path(k), before)} color={step.color} name={step.panel} unit={unit} named={named} />
    </Fragment>
  );
}

/**
 * F, then a step per key press: `steps` = [{ index, name, matrix, color, path, panel }], `path(t)`
 * the matrix on its way from I (t = 0) to the step's matrix (t = 1), `panel` the name of its panel.
 * Each panel shows F moved by all the steps so far (Lecture 18's strips, F → AF → F again).
 * `unit`: the panels' scale (px per unit); `named` false: no names under the panels.
 */
export default function Strip({ steps, first = 'F', unit = UNIT, named = true }) {
  let before = I;
  const items = steps.map((s) => {
    const item = <Step key={s.index} step={s} before={before} unit={unit} named={named} />;
    before = mul(s.path(1), before);
    return item;
  });
  return (
    <div className="l21-strip">
      <Panel name={first} unit={unit} named={named} />
      {items}
    </div>
  );
}
