import Tex from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Plane from '../components/Plane.jsx';
import TexSvg from '../components/TexSvg.jsx';
import { INK } from '../components/inv.js';
import { BX, BY, BUNIT, BASINS } from '../components/basins.js';
import basin0 from '../assets/basin-0.png';
import basin1 from '../assets/basin-1.png';
import basin2 from '../assets/basin-2.png';

export const IMAGES = [basin0, basin1, basin2];
// where each zero's name sits, from its star (px)
export const LABEL = [
  { dx: 26, dy: -24 },
  { dx: -30, dy: -22 },
  { dx: 32, dy: -16 },
];

/** A five-pointed star centred on (cx, cy), as the zeros in the user's picture of the basins. */
export const star = (cx, cy, R = 12, r = 5) =>
  Array.from({ length: 10 }, (_, k) => {
    const t = -Math.PI / 2 + (k * Math.PI) / 5;
    const s = k % 2 ? r : R;
    return `${(cx + s * Math.cos(t)).toFixed(1)},${(cy + s * Math.sin(t)).toFixed(1)}`;
  }).join(' ');

/**
 * Which zero does Newton's method find? (the user's request): each starting point
 * a₁ of [−6, 3] × [−2.4, 3.65] in the colour of the zero of Example 5's f that a₁, a₂, … converge
 * to (computed by scripts/basins.mjs into src/assets/basin-k.png). On arrival the three zeros, white
 * stars named r₁, r₂, r₃ on the picture and listed on the left (names and colours as in the user's
 * picture of the basins, newton_basins_zoom.png); after More steps (the user's request); key presses 1–3: each zero's region and its swatch, r₁, r₂, r₃. The
 * regions are images, so print needs no stills.
 */
export default function Slide18bBasins() {
  return (
    <section>
      <h2>Which zero does Newton's method find?</h2>

      <div className="l18-basins">
        <div className="l18-basins-text">
          <p>Zeros of <Tex tex="f" />:</p>
          <ul className="l18-basins-key">
            {BASINS.map(({ tint, at }, k) => (
              <li key={k}>
                <Fragment as="span" index={k + 1} className="l18-basins-swatch" style={{ background: tint }} />
                <Tex tex={at} />
              </li>
            ))}
          </ul>
        </div>

        <div className="l18-basins-pic">
          <Plane xRange={BX} yRange={BY} unit={BUNIT} pad={0} grid={false} axes={false} title="Each starting point in the colour of the zero of f that Newton's method converges to from it: orange r₁, blue r₂, green r₃">
            {(p) => {
              const w = (BX[1] - BX[0]) * BUNIT;
              const h = (BY[1] - BY[0]) * BUNIT;
              const xs = [-5, -4, -3, -2, -1, 1, 2];
              const ys = [-2, -1, 1, 2, 3];
              return (
                <g>
                  {IMAGES.map((src, k) => (
                    <Fragment key={k} as="g" index={k + 1}>
                      <image href={src} x={0} y={0} width={w} height={h} preserveAspectRatio="none" />
                    </Fragment>
                  ))}
                  {/* the axes, faint, over the regions */}
                  <g stroke={INK} strokeOpacity="0.45" strokeWidth="1.4">
                    <line x1={0} y1={p.py(0)} x2={w} y2={p.py(0)} />
                    <line x1={p.px(0)} y1={0} x2={p.px(0)} y2={h} />
                    {xs.map((x) => (
                      <line key={`x${x}`} x1={p.px(x)} y1={p.py(0) - 5} x2={p.px(x)} y2={p.py(0) + 5} />
                    ))}
                    {ys.map((y) => (
                      <line key={`y${y}`} x1={p.px(0) - 5} y1={p.py(y)} x2={p.px(0) + 5} y2={p.py(y)} />
                    ))}
                  </g>
                  <g fontSize="15" fill={INK} className="l18-halo">
                    {xs.map((x) => (
                      <text key={`x${x}`} x={p.px(x)} y={p.py(0) + 20} textAnchor="middle">
                        {`${x}`.replace('-', '−')}
                      </text>
                    ))}
                    {ys.map((y) => (
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
              );
            }}
          </Plane>
        </div>
      </div>
    </section>
  );
}
