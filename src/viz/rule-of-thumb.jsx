import { useState } from 'react';
import '../lectures/l22/styles/deck.css';
import Tex, { r } from '../lectures/l22/components/Tex.jsx';
import Slider from '../lectures/l22/components/Slider.jsx';
import Plane from '../lectures/l22/components/Plane.jsx';
import { BLUE_PLANE, AMBER_PLANE } from '../lectures/l22/components/Planes.jsx';
import TwoPlanes from '../lectures/l22/components/TwoPlanes.jsx';
import { INK, BLUE, AMBER, PURPLE, GREEN, RED } from '../lectures/l22/components/ls.js';
import { tc, XR, YR, clip, meet, N1, AXIS, MID } from '../lectures/l22/slides/Slide19RuleOfThumb.jsx';

export const lecture = 22;

/*
 * Rule of thumb, without its title and its caution sign (the caption says it): a T-chart, each side
 * its heading, its system and the rule of thumb in words, then its applet, a slider for its c.
 * Overdetermined: x + y = 2, x − y = 0, x + 2y = c, three lines in the plane, which meet at one
 * point (green) only for c = 3; otherwise their crossings make a triangle, "no solution".
 * Underdetermined: x + y + z = 2, x + y + cz = 1, two planes (TwoPlanes.jsx; the view rocks, drag to
 * turn it): the second tilts with c about the line x + y = 1, z = 0 and meets the first in a line,
 * "infinitely many solutions", which runs off as c nears 1; at c = 1 they are parallel, "no
 * solution". On the slide the applets come on key press 1; here at once. (The slide's chart, copied.)
 */
export default function RuleOfThumb() {
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
        <div className="l22-rt-applet">
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
        </div>
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
        <div className="l22-rt-applet">
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
        </div>
      </div>
    </div>
  );
}
