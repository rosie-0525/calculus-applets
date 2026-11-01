import { useState } from 'react';
import '../lectures/l18/styles/deck.css';
import Tex from '../lectures/l18/components/Tex.jsx';
import Plane from '../lectures/l18/components/Plane.jsx';
import TexSvg from '../lectures/l18/components/TexSvg.jsx';
import { INK } from '../lectures/l18/components/inv.js';
import { BX, BY, BUNIT, BASINS } from '../lectures/l18/components/basins.js';
import { IMAGES, LABEL, star } from '../lectures/l18/slides/Slide18bBasins.jsx';

export const lecture = 18;

const XS = [-5, -4, -3, -2, -1, 1, 2];
const YS = [-2, -1, 1, 2, 3];

/*
 * Which zero does Newton's method find?, without its title: beside the list of the three zeros of
 * Example 5's f, each starting point a₁ of [−6, 3] × [−2.4, 3.65] in the colour of the zero that
 * a₁, a₂, … converge to (the deck's images), the zeros as white stars. On the slide each region
 * comes on a key press with its swatch; here all three show, and a click on a zero in the list
 * hides its region or shows it again.
 */
export default function NewtonBasins() {
  const [shown, setShown] = useState(BASINS.map(() => true));
  const toggle = (k) => setShown((v) => v.map((s, j) => (j === k ? !s : s)));
  const w = (BX[1] - BX[0]) * BUNIT;
  const h = (BY[1] - BY[0]) * BUNIT;
  return (
    <div className="l18-basins">
      <div className="l18-basins-text">
        <p>
          Zeros of <Tex tex="f" />:
        </p>
        <ul className="l18-basins-key">
          {BASINS.map(({ tint, at }, k) => (
            <li key={k}>
              <button type="button" className="inv-pick basins-pick" aria-pressed={shown[k]} aria-label={`Show the region of r${k + 1}`} onClick={() => toggle(k)}>
                <span className="l18-basins-swatch" style={{ background: tint, opacity: shown[k] ? 1 : 0.25 }} />
                <Tex tex={at} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="l18-basins-pic">
        <Plane xRange={BX} yRange={BY} unit={BUNIT} pad={0} grid={false} axes={false} title="Each starting point in the colour of the zero of f that Newton's method converges to from it: orange r₁, blue r₂, green r₃">
          {(p) => (
            <g>
              {IMAGES.map((src, k) => shown[k] && <image key={k} href={src} x={0} y={0} width={w} height={h} preserveAspectRatio="none" />)}
              <g stroke={INK} strokeOpacity="0.45" strokeWidth="1.4">
                <line x1={0} y1={p.py(0)} x2={w} y2={p.py(0)} />
                <line x1={p.px(0)} y1={0} x2={p.px(0)} y2={h} />
                {XS.map((x) => (
                  <line key={`x${x}`} x1={p.px(x)} y1={p.py(0) - 5} x2={p.px(x)} y2={p.py(0) + 5} />
                ))}
                {YS.map((y) => (
                  <line key={`y${y}`} x1={p.px(0) - 5} y1={p.py(y)} x2={p.px(0) + 5} y2={p.py(y)} />
                ))}
              </g>
              <g fontSize="15" fill={INK} className="l18-halo">
                {XS.map((x) => (
                  <text key={`x${x}`} x={p.px(x)} y={p.py(0) + 20} textAnchor="middle">
                    {`${x}`.replace('-', '−')}
                  </text>
                ))}
                {YS.map((y) => (
                  <text key={`y${y}`} x={p.px(0) - 9} y={p.py(y) + 5} textAnchor="end">
                    {`${y}`.replace('-', '−')}
                  </text>
                ))}
              </g>
              {BASINS.map(({ zero }, k) => (
                <g key={k}>
                  <polygon points={star(p.px(zero[0]), p.py(zero[1]))} fill="#fff" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
                  <TexSvg x={p.px(zero[0]) + LABEL[k].dx} y={p.py(zero[1]) + LABEL[k].dy} tex={`r_${k + 1}`} size={28} color={INK} w={50} h={34} className="l18-halo" />
                </g>
              ))}
            </g>
          )}
        </Plane>
      </div>
    </div>
  );
}
