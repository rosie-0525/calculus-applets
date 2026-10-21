import { useId, useState } from 'react';
import Slider from './Slider.jsx';
import Tex from './Tex.jsx';
import { MATH } from './svgmath.jsx';

const W = 380;
const H = 296;
const V0 = 355; // cm³ = mL: a Coke can's, the volume unless one is given
const S = 14; // px per cm
const CX = 172; // the can's axis
const FLOOR = 236; // the bottom of its front
const TILT = 0.24; // the ellipses' height / width
// at the start, a real can's shape (the user: the can that uses the least aluminum, r = (355/2π)^(1/3)
// = 3.84 cm, h = 2r = 7.67 cm, A = 277.5 cm² (shown as 278), looked shorter and flatter than a
// real one): a 12 oz Coke can is 12.2 cm tall and 6.6 cm wide, h/d ≈ 1.85, which for 355 mL is
// r = 3.13 cm, h = 11.6 cm, A = 288 cm² (shown as 289), 4% more than the least.
const r0 = (V) => Math.cbrt(V / (2 * 1.85 * Math.PI));
// a real can's lid is narrower than its body, and its bottom tapers to a narrower foot (drawn
// only: the area and volume are a cylinder's)
const LID = 0.82;
const FOOT = 0.86;
const SILVER = '#b8bec8';
const INK = '#14213d';
const RED = '#8c1515';
const SANS = 'Source Sans Pro, Helvetica, sans-serif';

const areaOf = (r, V) => 2 * Math.PI * r * r + (2 * V) / r;

/**
 * What is the best shape for a Coke can? (Constrained optimization problems): a can holding
 * 355 cm³, its radius r on a slider (2.7–6 cm) and its height h = 355/(πr²), each in cm on its
 * dimension line, and the aluminum, A = 2πr² + 2πrh, at the top left (in words: the slide has
 * few formulas, at the user's request). It starts at a real can's shape (h ≈ 3.7r, 288 cm²); the
 * least area is at h = 2r. With `names` (on Example 3), the lengths and the slider are named r and
 * h, as in the problem. With `volume` (Example 3's 128π cm³, at the user's request), the can holds
 * that, in place of 355 cm³; the least radius grows with it (as √V), so that h stays as tall.
 */
export default function SodaCan({ names = false, volume: V = V0 }) {
  const [r, setR] = useState(() => r0(V));
  // ids of its own, as the can is on two slides (Constrained optimization problems and Example 3)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const h = V / (Math.PI * r * r);
  const rx = r * S;
  const ry = TILT * rx;
  const top = FLOOR - h * S;
  const left = CX - rx;
  const right = CX + rx;
  // the neck (from the body up to the lid) and the foot (from the body down to the stand)
  const neck = Math.min(0.4 * rx, 0.16 * h * S);
  const foot = 0.16 * rx;
  const lid = LID * rx;
  const fr = FOOT * rx;
  // the white wave across the can, 55% of the way down
  const wave = (y0, amp) => {
    const pts = [];
    for (let k = 0; k <= 24; k += 1) {
      const x = left + (2 * rx * k) / 24;
      pts.push(`${x.toFixed(1)},${(y0 + amp * Math.sin((Math.PI * 2 * k) / 24 + 0.6)).toFixed(1)}`);
    }
    return pts;
  };
  const y0 = top + neck + 0.55 * (h * S - neck - foot);
  const amp = Math.min(10, 0.09 * h * S);
  const band = Math.max(4, Math.min(9, 0.06 * h * S));
  const upper = wave(y0 - band / 2, amp);
  const lower = wave(y0 + band / 2, amp * 0.8).reverse();
  const sh = top + neck; // where the neck meets the body
  const base = FLOOR - foot; // where the body meets the foot
  const body = [
    `M${CX - lid},${top}C${CX - lid},${top + 0.55 * neck} ${left},${top + 0.45 * neck} ${left},${sh}`,
    `L${left},${base}Q${left},${FLOOR} ${CX - fr},${FLOOR}A${fr} ${TILT * fr} 0 0 0 ${CX + fr},${FLOOR}`,
    `Q${right},${FLOOR} ${right},${base}L${right},${sh}C${right},${top + 0.45 * neck} ${CX + lid},${top + 0.55 * neck} ${CX + lid},${top}Z`,
  ].join('');
  const label = Math.min(17, 0.36 * rx, 0.28 * (base - sh));
  return (
    <div className="l12-can">
      <svg
        className="figure-svg"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`A can holding ${Math.round(V)} mL, of radius ${r.toFixed(1)} cm and height ${h.toFixed(1)} cm, made of ${areaOf(r, V).toFixed(0)} square cm of aluminum`}
      >
        <defs>
          <linearGradient id={`l12-can-red-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7a0c1c" />
            <stop offset="0.28" stopColor="#e3172f" />
            <stop offset="0.38" stopColor="#f2475a" />
            <stop offset="0.52" stopColor="#d01229" />
            <stop offset="1" stopColor="#6e0a18" />
          </linearGradient>
          <linearGradient id={`l12-can-lid-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3f4f6" />
            <stop offset="1" stopColor="#9ca3af" />
          </linearGradient>
          <linearGradient id={`l12-can-metal-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6b7280" />
            <stop offset="0.35" stopColor="#e5e7eb" />
            <stop offset="1" stopColor="#6b7280" />
          </linearGradient>
          <clipPath id={`l12-can-body-${uid}`}>
            <path d={body} />
          </clipPath>
        </defs>

        {/* shadow, body, wave, lid and tab */}
        <ellipse cx={CX + 8} cy={FLOOR + 4} rx={rx * 1.05} ry={ry * 1.1} fill="#000" opacity="0.08" />
        <path d={body} fill={`url(#l12-can-red-${uid})`} />
        <g clipPath={`url(#l12-can-body-${uid})`}>
          <polygon points={[...upper, ...lower].join(' ')} fill="#fff" opacity="0.92" />
        </g>
        {/* the unpainted foot, and the light on the neck */}
        <g clipPath={`url(#l12-can-body-${uid})`}>
          <rect x={left} y={base} width={2 * rx} height={FLOOR + ry - base} fill={`url(#l12-can-metal-${uid})`} />
          <ellipse cx={CX - 0.3 * rx} cy={top + 0.55 * neck} rx={0.18 * rx} ry={0.35 * neck} fill="#fff" opacity="0.18" />
        </g>
        <text
          x={CX}
          y={sh + 0.3 * (base - sh) + label / 3}
          textAnchor="middle"
          fontFamily={SANS}
          fontSize={label}
          fontWeight="700"
          fill="#fff"
        >
          {Math.round(V)} mL
        </text>
        <ellipse cx={CX} cy={top} rx={lid} ry={TILT * lid} fill={`url(#l12-can-lid-${uid})`} stroke={SILVER} strokeWidth="2.5" />
        <ellipse cx={CX} cy={top} rx={lid * 0.84} ry={TILT * lid * 0.84} fill="none" stroke="#9ca3af" strokeWidth="1.2" />
        <rect x={CX - lid * 0.22} y={top - TILT * lid * 0.55} width={lid * 0.44} height={TILT * lid * 0.5} rx={TILT * lid * 0.25} fill="#d1d5db" stroke="#6b7280" strokeWidth="0.8" />

        {/* r along the floor, h up the right side */}
        <g stroke={INK} strokeWidth="1.4">
          <line x1={CX} y1={FLOOR + ry + 12} x2={right} y2={FLOOR + ry + 12} />
          <line x1={CX} y1={FLOOR + ry + 7} x2={CX} y2={FLOOR + ry + 17} />
          <line x1={right} y1={FLOOR + ry + 7} x2={right} y2={FLOOR + ry + 17} />
          <line x1={right + 16} y1={top} x2={right + 16} y2={FLOOR} />
          <line x1={right + 11} y1={top} x2={right + 21} y2={top} />
          <line x1={right + 11} y1={FLOOR} x2={right + 21} y2={FLOOR} />
        </g>
        <text x={(CX + right) / 2} y={FLOOR + ry + 34} textAnchor="middle" fontFamily={SANS} fontSize="17" fill={INK}>
          {names && (
            <>
              <tspan fontFamily={MATH} fontStyle="italic">r</tspan> ={' '}
            </>
          )}
          {r.toFixed(1)} cm
        </text>
        <text x={right + 26} y={(top + FLOOR) / 2 + 6} fontFamily={SANS} fontSize="17" fill={INK}>
          {names && (
            <>
              <tspan fontFamily={MATH} fontStyle="italic">h</tspan> ={' '}
            </>
          )}
          {h.toFixed(1)} cm
        </text>

        <text x={14} y={30} fontFamily={SANS} fontSize="19" fill={RED}>
          aluminum: <tspan fontWeight="700">{areaOf(r, V).toFixed(0)} cm²</tspan>
        </text>
      </svg>
      <div className="lc-sliders">
        <Slider name="radius" label={names ? <Tex tex="r" /> : 'radius'} value={r} onChange={setR} min={2.7 * Math.sqrt(V / V0)} max={6} step={0.01} color={RED} format={() => ''} />
      </div>
    </div>
  );
}
