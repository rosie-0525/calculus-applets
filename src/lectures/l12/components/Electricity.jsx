import Fragment from './Fragment.jsx';
import { RED } from './Example1.jsx';
import { MAIN, MATH } from './svgmath.jsx';
import HOURS from '../data/caiso-oct2026.json';

/**
 * California's electricity prices, shared by Electricity prices and What does λ mean? (the same
 * picture in the same place on both). CAISO's day-ahead market, 1–15 October 2026
 * (src/data/make-caiso.py): for each hour [date, hour ending, c = demand − solar − wind (GW), the
 * power the other plants must make, price at the Northern California hub ($/MWh)]. Noon is the hour
 * 12–1 pm (hour ending 13), 6 pm the hour 6–7 pm (hour ending 19): on average c = 8.6 GW and $33.55
 * at noon, c = 34.1 GW and $104.38 at 6 pm.
 */
export const NOON = 13;
export const SIX = 19;
const mean = (v) => v.reduce((s, x) => s + x, 0) / v.length;
export const MEAN_PRICE = (h) => mean(HOURS.filter((d) => d[1] === h).map((d) => d[3]));

// The price as a function of c, fitted by least squares to the 360 hours: price = b + a c³
// (R² = 0.78; better than a + b c, 0.58, or a + b c², 0.72): b ≈ 33.8, a ≈ 0.00122, so $35 at noon's
// 8.6 GW and $82 at 6 pm's 34.1 GW, where the prices range from $48 to $243.
const FIT = (() => {
  const X = HOURS.map((d) => d[2] ** 3);
  const Y = HOURS.map((d) => d[3]);
  const n = X.length;
  const sx = X.reduce((s, x) => s + x, 0);
  const sy = Y.reduce((s, y) => s + y, 0);
  const sxx = X.reduce((s, x) => s + x * x, 0);
  const sxy = X.reduce((s, x, i) => s + x * Y[i], 0);
  const a = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { a, b: (sy - a * sx) / n };
})();
const price = (c) => FIT.b + FIT.a * c ** 3;

const AMBER = '#c2410c'; // noon
const NAVY = '#1e3a8a'; // 6 pm
export const W = 370;
const H = 340;
const PAD = { left: 56, right: 12, top: 12, bottom: 52 };
const XS = [-5, 50];
const YS = [0, 250];
const LABEL = [40.5, 205]; // the curve's label, (c, price), clear of the 6 pm dots
const px = (c) => PAD.left + ((c - XS[0]) / (XS[1] - XS[0])) * (W - PAD.left - PAD.right);
const py = (p) => H - PAD.bottom - ((p - YS[0]) / (YS[1] - YS[0])) * (H - PAD.top - PAD.bottom);
const DATE = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const CLOCK = (k) => `${((k + 11) % 12) + 1} ${k % 24 < 12 ? 'am' : 'pm'}`;
const HOUR = (h) => `${CLOCK(h - 1)}–${CLOCK(h)}`; // the hour ending h

/**
 * The hours of 1–15 October 2026: the price against c, each hour a dot (noon in amber, 6 pm in
 * navy, its date, hour, c and price in a tooltip); with `curveAt`, the fitted price b + a c³, the
 * curve λ = M′(c), in red, on that key press.
 */
export default function Prices({ curveAt }) {
  const curve = [];
  for (let c = -2.5; c <= 47.5; c += 0.5) if (price(c) <= YS[1]) curve.push(`${px(c).toFixed(1)},${py(price(c)).toFixed(1)}`);
  const dots = [...HOURS].sort((d, e) => (d[1] === NOON || d[1] === SIX) - (e[1] === NOON || e[1] === SIX));
  return (
    <svg
      className="figure-svg"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`California's electricity price against the demand for power c, one dot per hour of 1 to 15 October 2026: the price rises with the demand; the noon hours are on the lower left, the 6 pm hours on the upper right${curveAt === undefined ? '' : '; a fitted curve λ = M′(c)'}`}
    >
      <g fill="#6b7280" fontSize="14">
        <rect x={px(XS[0])} y={py(YS[1])} width={px(XS[1]) - px(XS[0])} height={py(YS[0]) - py(YS[1])} fill="none" stroke="#9ca3af" />
        {[0, 10, 20, 30, 40, 50].map((c) => (
          <g key={`x${c}`}>
            <line x1={px(c)} y1={py(0)} x2={px(c)} y2={py(0) + 5} stroke="#6b7280" />
            <text x={px(c)} y={py(0) + 20} textAnchor="middle">
              {c}
            </text>
          </g>
        ))}
        {[0, 50, 100, 150, 200, 250].map((p) => (
          <g key={`y${p}`}>
            <line x1={px(XS[0]) - 5} y1={py(p)} x2={px(XS[0])} y2={py(p)} stroke="#6b7280" />
            <text x={px(XS[0]) - 8} y={py(p) + 5} textAnchor="end">
              {p}
            </text>
          </g>
        ))}
        <text x={(px(XS[0]) + px(XS[1])) / 2} y={H - 10} textAnchor="middle" fill="#14213d" fontSize="16">
          demand <tspan fontFamily={MATH} fontStyle="italic">c</tspan> (GW)
        </text>
        <text transform={`translate(15 ${(py(YS[0]) + py(YS[1])) / 2}) rotate(-90)`} textAnchor="middle" fill="#14213d" fontSize="16">
          price ($/MWh)
        </text>
      </g>

      {dots.map(([d, h, c, p]) => {
        const color = h === NOON ? AMBER : h === SIX ? NAVY : '#9ca3af';
        return (
          <circle key={`${d}-${h}`} cx={px(c)} cy={py(p)} r={h === NOON || h === SIX ? 4.2 : 3} fill={color} fillOpacity={h === NOON || h === SIX ? 0.9 : 0.45}>
            <title>{`${DATE(d)}, ${HOUR(h)}: c = ${c.toFixed(1)} GW, $${p.toFixed(0)}/MWh`}</title>
          </circle>
        );
      })}
      <g fontFamily={MAIN} fontSize="17" fontWeight="700" className="map-label">
        <text x={px(8.6)} y={py(MEAN_PRICE(NOON)) + 34} textAnchor="middle" fill={AMBER}>
          noon: <tspan fontFamily={MATH} fontStyle="italic" fontWeight="400">c</tspan> ≈ 9
        </text>
        <text x={px(22)} y={py(150)} textAnchor="middle" fill={NAVY}>
          6 pm: <tspan fontFamily={MATH} fontStyle="italic" fontWeight="400">c</tspan> ≈ 34
        </text>
      </g>

      {curveAt !== undefined && (
        <Fragment as="g" index={curveAt}>
          <polyline points={curve.join(' ')} fill="none" stroke={RED} strokeWidth="3" />
          <text x={px(LABEL[0])} y={py(LABEL[1])} textAnchor="end" fontFamily={MAIN} fontSize="18" fill={RED} className="map-label">
            <tspan fontStyle="italic">λ</tspan> = <tspan fontStyle="italic">M</tspan>′(<tspan fontStyle="italic">c</tspan>)
          </text>
        </Fragment>
      )}
    </svg>
  );
}
