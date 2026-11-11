import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Slider from '../components/Slider.jsx';
import Plane from '../components/Plane.jsx';
import { BLUE_PLANE, AMBER_PLANE } from '../components/Planes.jsx';
import TwoPlanes from '../components/TwoPlanes.jsx';
import CautionSign from '../components/CautionSign.jsx';
import { INK, BLUE, AMBER, PURPLE, GREEN, RED } from '../components/ls.js';

export const tc = (color, tex) => r`\textcolor{${color}}{${tex}}`;

export const XR = [-0.9, 3.1];
export const YR = [-0.7, 2.6];

/** The segment of the line ax + by = c inside the picture's box. */
export function clip([a, b, c]) {
  const out = [];
  if (Math.abs(b) > 1e-9) {
    for (const x of XR) {
      const y = (c - a * x) / b;
      if (y >= YR[0] - 1e-9 && y <= YR[1] + 1e-9) out.push([x, y]);
    }
  }
  if (Math.abs(a) > 1e-9) {
    for (const y of YR) {
      const x = (c - b * y) / a;
      if (x > XR[0] + 1e-9 && x < XR[1] - 1e-9) out.push([x, y]);
    }
  }
  return out.slice(0, 2);
}

/** Where the lines ax + by = c and a'x + b'y = c' meet. */
export function meet([a, b, c], [d, e, f]) {
  const det = a * e - b * d;
  return [(c * e - b * f) / det, (a * f - c * d) / det];
}

// the underdetermined system: x + y + z = 2 and x + y + cz = 1, two planes parallel to (1, −1, 0)
export const N1 = [1, 1, 1];
export const AXIS = [1, -1, 0];
export const MID = [0.9, 0.9, 0.1]; // the middle of the picture

/**
 * Rule of thumb (Mark's two paragraphs; the textbook's Remark 21.4.5 and the skill "visualize the
 * ideas of overdetermined and underdetermined", Figures 21.4.1–21.4.2), a T-chart (rule 14d). On
 * arrival, each side's heading, its system of equations in a brace and the rule of thumb in words
 * (the user's wording): usually no solution (more equations than unknowns); usually infinitely many
 * solutions (fewer equations than unknowns). Key press 1: the two applets, each with a slider for
 * its c, which show that the rule of thumb can fail (the user's requests). Overdetermined: three
 * lines in the plane, x + y = 2, x − y = 0 and x + 2y = c: they meet at one point only for c = 3
 * (the green dot, "one solution"); otherwise their pairwise crossings make a triangle ("no
 * solution"). Underdetermined: two planes, x + y + z = 2 and x + y + cz = 1 (TwoPlanes.jsx): the
 * second tilts with c (from −2 to 4) about the line x + y = 1, z = 0 and meets the first in a line
 * ("infinitely many solutions"), which runs off as c nears 1; at c = 1 they are parallel ("no solution").
 * (Each verdict has the room of the longer of its two wordings, so nothing moves when it changes:
 * the user's request.) Key press 2: a caution sign to the right of the title, "This might fail!",
 * in the sign's yellow, not highlighted and without an outline, over a strip of caution tape (the
 * user's requests).
 * Before: a side per key press, the equations under the pictures, dim C(A) ≤ n < m and
 * dim N(A) = n − dim C(A) ≥ n − m > 0, two fixed planes meeting in a line (Planes.jsx), for a while
 * one line (1 equation, 2 unknowns), "Propane: 3 equations, 4 unknowns", and the exceptions on the
 * poll that followed (Slide20Poll), all removed or replaced at the user's requests. Print: c = 4
 * and c = −1, as on arrival.
 */
export default function Slide19RuleOfThumb() {
  const [cc, setC] = useState(4);
  const [cu, setCu] = useState(-1);
  const lines = [
    [1, 1, 2, BLUE],
    [1, -1, 0, AMBER],
    [1, 2, cc, PURPLE],
  ];
  const pts = [meet(lines[0], lines[1]), meet(lines[0], lines[2]), meet(lines[1], lines[2])];
  const one = Math.abs(cc - 3) < 0.05;
  const parallel = Math.abs(cu - 1) < 0.05;
  return (
    <section>
      <div className="l15-caution-head l22-rt-head">
        <h2>Rule of thumb</h2>
        <Fragment index={2} className="l22-rt-caution">
          <CautionSign />
          <span className="l22-rt-caution-text">This might fail!</span>
        </Fragment>
      </div>

      <div className="l22-tchart l22-rt">
        <div className="l22-tcol">
          <p className="l22-thead">
            Overdetermined: <Tex tex="m>n" />
          </p>
          <p className="l22-rt-eqs">
            <Tex tex={r`\left\{\begin{aligned}${tc(BLUE, 'x+y')}&${tc(BLUE, '=2')}\\ ${tc(AMBER, 'x-y')}&${tc(AMBER, '=0')}\\ ${tc(PURPLE, 'x+2y')}&${tc(PURPLE, '=c')}\end{aligned}\right.`} />
          </p>
          <p className="l22-rt-why">
            Usually no solution
            <br />
            (more equations than unknowns)
          </p>
          <Fragment index={1} className="l22-rt-applet">
            <Plane xRange={XR} yRange={YR} unit={68} pad={8} grid={false} axes={false} title="Three lines in the plane">
              {(p) => (
                <g>
                  <line x1={p.px(XR[0])} y1={p.py(0)} x2={p.px(XR[1])} y2={p.py(0)} stroke="#d1d5db" strokeWidth="1.3" />
                  <line x1={p.px(0)} y1={p.py(YR[0])} x2={p.px(0)} y2={p.py(YR[1])} stroke="#d1d5db" strokeWidth="1.3" />
                  {lines.map(([a, b, c, color], k) => {
                    const seg = clip([a, b, c]);
                    if (seg.length < 2) return null;
                    return <line key={k} x1={p.px(seg[0][0])} y1={p.py(seg[0][1])} x2={p.px(seg[1][0])} y2={p.py(seg[1][1])} stroke={color} strokeWidth="3.2" strokeLinecap="round" />;
                  })}
                  {one ? (
                    <circle cx={p.px(1)} cy={p.py(1)} r="8" fill={GREEN} stroke="#fff" strokeWidth="2" />
                  ) : (
                    <g>
                      <polygon points={pts.map(([x, y]) => `${p.px(x)},${p.py(y)}`).join(' ')} fill={RED} fillOpacity="0.12" stroke="none" />
                      {pts.map(([x, y], k) => (
                        <circle key={k} cx={p.px(x)} cy={p.py(y)} r="4.5" fill={INK} />
                      ))}
                    </g>
                  )}
                </g>
              )}
            </Plane>
            <div className="l22-rt-ctl">
              <Slider name="c" label={<Tex tex="c" />} color={PURPLE} value={cc} onChange={setC} min={1.5} max={4.5} step={0.1} />
              <span className="l22-rt-verdict">
                <span className={`l22-not${one ? ' is-off' : ''}`}>no solution</span>
                <span className={`l22-ok${one ? '' : ' is-off'}`}>one solution</span>
              </span>
            </div>
          </Fragment>
        </div>

        <div className="l22-tcol">
          <p className="l22-thead">
            Underdetermined: <Tex tex="m<n" />
          </p>
          <p className="l22-rt-eqs">
            <Tex tex={r`\left\{\begin{aligned}${tc(BLUE, 'x+y+z')}&${tc(BLUE, '=2')}\\ ${tc(AMBER, 'x+y+cz')}&${tc(AMBER, '=1')}\end{aligned}\right.`} />
          </p>
          <p className="l22-rt-why">
            Usually infinitely many solutions
            <br />
            (fewer equations than unknowns)
          </p>
          <Fragment index={1} className="l22-rt-applet">
            <TwoPlanes
              planes={[
                { n: N1, d: 2, at: [1, 1, 0], ...BLUE_PLANE },
                { n: [1, 1, parallel ? 1 : cu], d: 1, at: [0.5, 0.5, 0], half: 1.7, ...AMBER_PLANE },
              ]}
              axis={AXIS}
              at={MID}
              title="Two planes: they meet in a line, or are parallel"
            />
            <div className="l22-rt-ctl">
              <Slider name="c, underdetermined" label={<Tex tex="c" />} color={AMBER} value={cu} onChange={setCu} min={-2} max={4} step={0.1} />
              <span className="l22-rt-verdict">
                <span className={`l22-ok${parallel ? ' is-off' : ''}`}>infinitely many solutions</span>
                <span className={`l22-not${parallel ? '' : ' is-off'}`}>no solution</span>
              </span>
            </div>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
