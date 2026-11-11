import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import { SPECIES, Molecule } from '../components/Molecules.jsx';
import CTScan from '../components/CTScan.jsx';
import Bridge from '../components/Bridge.jsx';

/** The system in words under its card: the unknowns, and what the equations say. */
export function System({ unknowns, equations }) {
  return (
    <div className="l12-open-problem">
      <span className="l12-open-kw">unknowns</span>
      <span>{unknowns}</span>
      <span className="l12-open-kw">equations</span>
      <span>{equations}</span>
    </div>
  );
}

export const RW = 360;
export const RH = 290;
// the four molecules: where each one is, its size, and its name under it
export const PLACES = [
  { k: 0, x: 118, y: 66, s: 1.2 },
  { k: 1, x: 286, y: 66, s: 1.5 },
  { k: 2, x: 118, y: 222, s: 1.4 },
  { k: 3, x: 286, y: 222, s: 1.55 },
];

/**
 * A small flame beside the reaction's arrow (burning), flickering on a loop (the user's request):
 * its outer and inner flames sway and stretch from their base at different rates (CSS l22-fire;
 * still in print and with reduced motion).
 */
export function Flame({ x, y }) {
  return (
    <g transform={`translate(${x - 17} ${y - 22}) scale(0.85)`}>
      <path className="l22-fire l22-fire-out" d="M20 2C24 12 34 18 34 32C34 43 27 50 20 50C13 50 6 43 6 32C6 24 11 19 13 13C15 19 17 21 19 22C19 14 18 8 20 2Z" fill="#f59e0b" stroke="#c2702a" strokeWidth="2" strokeLinejoin="round" />
      <path className="l22-fire l22-fire-in" d="M20 26C23 31 27 34 27 40C27 45 24 48 20 48C16 48 13 45 13 40C13 36 16 33 17 30C18 33 19 34 20 34C20 31 19 29 20 26Z" fill="#fde68a" />
    </g>
  );
}

// each molecule's formula under its cartoon (in place of its name, the user's request)
export const FORMULA = { propane: 'C3H8', oxygen: 'O2', co2: 'CO2', water: 'H2O' };

/** A formula in SVG text, its digits as subscripts: C₃H₈. */
export const formula = (f) =>
  f.split(/(\d+)/).filter(Boolean).map((part, i) =>
    /\d/.test(part) ? (
      <tspan key={i} baselineShift="sub" fontSize="0.72em">
        {part}
      </tspan>
    ) : (
      part
    ),
  );

/**
 * Burning propane, unbalanced: ? C₃H₈ + ? O₂ → ? CO₂ + ? H₂O (the formulas in place of the names
 * propane, oxygen, carbon dioxide, water: the user's request), each molecule a ball-and-stick cartoon
 * with an amber "?" for how many, the reaction's arrow going down with a flame beside it.
 */
export function Reaction() {
  const word = { fontSize: 19, fontFamily: 'KaTeX_Main, Georgia, serif', fill: '#14213d', textAnchor: 'middle' };
  const big = { fontSize: 30, fontFamily: 'KaTeX_Main, Georgia, serif', fill: '#14213d', textAnchor: 'middle' };
  return (
    <svg viewBox={`0 0 ${RW} ${RH}`} width={RW} height={RH} className="figure-svg l22-burn" role="img" aria-label="propane plus oxygen gives carbon dioxide plus water, how many of each unknown">
      {PLACES.map(({ k, x, y, s }) => {
        const [hw, hh] = SPECIES[k].size;
        return (
          <g key={k}>
            <Molecule mol={SPECIES[k].mol} x={x} y={y} scale={s} />
            <text x={x - hw * s - 16} y={y + 11} {...big} fill="#c2702a" fontWeight="700">
              ?
            </text>
            <text x={x} y={y + hh * s + 24} {...word}>
              {formula(FORMULA[SPECIES[k].key])}
            </text>
          </g>
        );
      })}
      <text x={200} y={76} {...big}>
        +
      </text>
      <text x={200} y={232} {...big}>
        +
      </text>
      <line x1={180} y1={128} x2={180} y2={168} stroke="#14213d" strokeWidth="2.4" />
      <path d="M 172 162 L 180 176 L 188 162" fill="none" stroke="#14213d" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <Flame x={214} y={152} />
    </svg>
  );
}

/**
 * Linear systems are everywhere (the opener, after the title, in Lecture 12's format at the user's
 * request: three cards, each a question over its picture and its linear system in words, all at
 * once (the system first came on the next key press; the user's request); examples from the
 * textbook's §21.1, (1) and (5)). On arrival, how much oxygen does burning propane need? (balancing
 * a reaction; unknowns, how many of each molecule; equations, the atoms of each element are as many
 * after as before). 1: how does a CT scan see inside the body? (CTScan.jsx, the X-rays turning round
 * a head; unknowns, the density of each pixel; equations, each X-ray measures the total density along
 * it). 2: will the bridge hold the truck? (Bridge.jsx, the forces in the beams solved live as a truck
 * crosses; unknowns, the force in each beam; equations, at each joint the forces balance).
 */
export default function Slide02bEverywhere() {
  return (
    <section>
      <h2>Linear systems are everywhere</h2>

      <div className="l12-open l22-open">
        <div className="l12-open-card">
          <p className="l12-open-q">How much oxygen does burning propane need?</p>
          <div className="l12-open-fig">
            <Reaction />
          </div>
          <System unknowns="how many of each molecule" equations="as many atoms of each kind after as before" />
        </div>

        <Fragment index={1} className="l12-open-card">
          <p className="l12-open-q">How does a CT scan see inside the body?</p>
          <div className="l12-open-fig">
            <CTScan />
          </div>
          <System unknowns="the density of each pixel" equations="each X-ray measures the total density along it" />
        </Fragment>

        <Fragment index={2} className="l12-open-card">
          <p className="l12-open-q">Will the bridge hold the truck?</p>
          <div className="l12-open-fig">
            <Bridge />
          </div>
          <System unknowns="the force in each beam" equations="at each joint, the forces balance" />
        </Fragment>
      </div>

      {/* the user's request */}
      <Notes>
        <p>Linear systems are everywhere in our world: they appear in chemistry, in medicine, and in engineering.</p>
      </Notes>
    </section>
  );
}
