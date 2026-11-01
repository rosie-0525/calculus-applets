import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { BLUE, AMBER, INK } from '../components/inv.js';

// a lower leg and its foot, seen from the side, toes to the right (in a 160 × 156 box)
export const LEG = 'M 58 6 L 96 6 L 98 92 Q 100 106 116 112 L 146 120 Q 158 124 156 134 L 154 140 L 50 140 Q 40 138 42 124 L 54 96 Z';
// the part of the leg below y = 44 (the sock), its cuff and two stripes, inside the leg's sides
// (no clipPath: in print a url(#id) names a hidden copy of the slide on an earlier page)
export const SOCK = 'M 56.3 44 L 96.9 44 L 98 92 Q 100 106 116 112 L 146 120 Q 158 124 156 134 L 154 140 L 50 140 Q 40 138 42 124 L 54 96 Z';
export const CUFF = '56.3,44 96.9,44 97.1,55 55.8,55';
export const SHOE = 'M 40 104 Q 62 96 97 99 Q 105 110 121 114 L 149 121 Q 163 126 161 138 L 161 142 L 39 142 Q 33 126 40 104 Z';

/** The foot, with its sock (B, amber, striped) and its shoe (A, blue) as asked. */
export function Foot({ sock, shoe }) {
  return (
    <svg className="l18-foot" viewBox="0 0 170 156" width="150" height="138" role="img" aria-label={`a foot${sock ? ', a sock' : ''}${shoe ? ', a shoe' : ''}`}>
      <path d={LEG} fill="#f3d2b3" stroke="#b07a55" strokeWidth="2" strokeLinejoin="round" />
      {sock && (
        <g>
          <path d={SOCK} fill="#e9a66a" stroke={AMBER} strokeWidth="2" strokeLinejoin="round" />
          <polygon points={CUFF} fill={AMBER} />
          <g stroke="#fff3e6" strokeWidth="4" opacity="0.8">
            <line x1="56.4" y1="68" x2="96.3" y2="68" />
            <line x1="55.8" y1="82" x2="96.6" y2="82" />
          </g>
        </g>
      )}
      {shoe && (
        <g>
          <path d={SHOE} fill={BLUE} stroke="#26496f" strokeWidth="2" strokeLinejoin="round" />
          <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
            <line x1="100" y1="104" x2="110" y2="99" />
            <line x1="107" y1="109" x2="117" y2="104" />
            <line x1="114" y1="113" x2="124" y2="108" />
          </g>
          <rect x="36" y="141" width="128" height="9" rx="3" fill={INK} />
        </g>
      )}
    </svg>
  );
}

/** The arrow from one foot to the next: the matrix above it, what it does under it. */
export function Step({ index, color, name, what }) {
  return (
    <Fragment index={index} className="l18-step l18-sock-step" style={{ color }}>
      <Tex tex={name} />
      <svg width="86" height="20" viewBox="0 0 86 20" aria-hidden="true">
        <line x1="3" y1="10" x2="72" y2="10" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <polygon points="84,10 70,3 70,17" fill={color} />
      </svg>
      <span className="l18-sock-what">{what}</span>
    </Fragment>
  );
}

/**
 * Socks and shoes (the textbook's (ii) at the start of Section 18.4, Example 18.4.4's socks and
 * shoes): the box, without a title; under it a foot. Key press 1: B puts on the sock; 2: A the
 * shoe, and AB under the first three feet; 3: A⁻¹ takes off the shoe; 4: B⁻¹ the sock, and
 * (AB)⁻¹ = B⁻¹A⁻¹ under the last three (their "first …, then …" removed by the user).
 */
export default function Slide14Socks() {
  return (
    <section>
      <h2>Socks and shoes</h2>

      <div className="block theorem">
        <p>
          If <Tex tex="A" /> and <Tex tex="B" /> are invertible <Tex tex={r`n\times n`} /> matrices, then so is <Tex tex="AB" />, and{' '}
          <span className="l15-nowrap">
            <Tex tex={r`(AB)^{-1}=B^{-1}A^{-1}`} />.
          </span>
        </p>
      </div>

      <div className="l18-socks">
        <div className="l18-socks-row">
          <Foot />
          <Step index={1} color={AMBER} name="B" what="sock on" />
          <Fragment index={1}>
            <Foot sock />
          </Fragment>
          <Step index={2} color={BLUE} name="A" what="shoe on" />
          <Fragment index={2}>
            <Foot sock shoe />
          </Fragment>
          <Step index={3} color={BLUE} name="A^{-1}" what="shoe off" />
          <Fragment index={3}>
            <Foot sock />
          </Fragment>
          <Step index={4} color={AMBER} name="B^{-1}" what="sock off" />
          <Fragment index={4}>
            <Foot />
          </Fragment>
        </div>
        {/* the brackets under the feet: the columns of .l18-socks-row are 150 + 4 × (110 + 150) px,
            the feet's centres at 75, 335, 595, 855, 1115 */}
        <svg className="l18-socks-brackets" width="1190" height="34" viewBox="0 0 1190 34" aria-hidden="true">
          <Fragment as="g" index={2}>
            <path d="M 75 0 V 18 H 590" fill="none" stroke={INK} strokeWidth="2.5" />
            <path d="M 590 18 V 2" fill="none" stroke={INK} strokeWidth="2.5" />
          </Fragment>
          <Fragment as="g" index={4}>
            <path d="M 600 2 V 18 H 1115 V 0" fill="none" stroke={INK} strokeWidth="2.5" />
          </Fragment>
        </svg>
        <div className="l18-socks-names">
          <Fragment index={2} as="p">
            <Tex tex="AB" />
          </Fragment>
          <Fragment index={4} as="p">
            <Tex tex={r`(AB)^{-1}=\textcolor{${AMBER}}{B^{-1}}\textcolor{${BLUE}}{A^{-1}}`} />
          </Fragment>
        </div>
      </div>
    </section>
  );
}
