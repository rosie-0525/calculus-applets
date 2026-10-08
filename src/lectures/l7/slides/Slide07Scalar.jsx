import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import BayMap from '../components/BayMap.jsx';
import { PLACES } from '../components/bay.js';
import { SP500, SP500_START } from '../data/sp500.js';

export const INK = '#14213d';
export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const GRAY = '#6b7280';

/* ---------- the Math 51 grade ---------- */

// the syllabus's grading scheme: each score is a percentage; the homework is curved to 8/9 of the
// possible points (× 9/8) and the pre-class quizzes to 90% of them (× 10/9): the curve, in red,
// comes at the key press after the grade
export const GRADE = [
  ['0.25', 'm_1', 'midterm 1'],
  ['0.25', 'm_2', 'midterm 2'],
  ['0.35', 'f', 'final exam'],
  ['0.10', 'h', 'homework', r`\tfrac98`],
  ['0.05', 'r', 'pre-class quizzes', r`\tfrac{10}9`],
];

/**
 * The grade as one chain, "Your final Math 51 grade = G(m₁, m₂, f, h, r) = 0.25 m₁ + …", laid out
 * like a grade breakdown: one weighted score per line, named on the right.
 */
export function GradeSum() {
  return (
    <table className="sv-grade">
      <tbody>
        <tr>
          <td colSpan={3} className="sv-grade-lead">
            Your final Math 51 grade
          </td>
        </tr>
        <tr>
          <td className="sv-grade-op">
            <Tex tex="=" />
          </td>
          <td colSpan={2}>
            <Tex tex="G(m_1,m_2,f,h,r)" />
          </td>
        </tr>
        {GRADE.map(([wt, v, name, curve], k) => (
          <tr key={v}>
            <td className="sv-grade-op">
              <Tex tex={k ? '+' : '='} />
            </td>
            <td>
              <Tex tex={r`${wt}\,${v}`} />
              {curve && (
                <Fragment as="span" index={5}>
                  <Tex tex={r`\textcolor{${CARDINAL}}{{}\cdot${curve}}`} />
                </Fragment>
              )}
            </td>
            <td className="sv-grade-name">{name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------- the S&P 500 ---------- */

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const CHART = { width: 283, height: 220, l: 44, r: 10, t: 24, b: 24, top: 8000 };
export const T1 = SP500_START + SP500.length / 12;
export const px = (t) => CHART.l + ((t - SP500_START) / (T1 - SP500_START)) * (CHART.width - CHART.l - CHART.r);
export const py = (v) => CHART.height - CHART.b - (v / CHART.top) * (CHART.height - CHART.t - CHART.b);
export const tOf = (k) => SP500_START + k / 12;
export const LINE = SP500.map((v, k) => `${k ? 'L' : 'M'}${px(tOf(k)).toFixed(1)},${py(v).toFixed(1)}`).join('');

/** The graph of P(t): the S&P 500 month by month. Pointing at it shows the month and P there. */
export function StockChart() {
  const [k, setK] = useState(SP500.length - 1);
  const { width: W, height: H } = CHART;
  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) * W) / box.width;
    const t = SP500_START + ((x - CHART.l) / (W - CHART.l - CHART.r)) * (T1 - SP500_START);
    setK(Math.max(0, Math.min(SP500.length - 1, Math.round((t - SP500_START) * 12))));
  };
  const [x, y] = [px(tOf(k)), py(SP500[k])];
  const label = `${MONTHS[k % 12]} ${SP500_START + Math.floor(k / 12)}: ${SP500[k].toLocaleString('en-US')}`;
  const left = x > W - 140;
  return (
    <svg className="figure-svg stock-chart" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="The S&P 500 index month by month since 1990" onPointerMove={onMove} data-prevent-swipe>
      <g fontSize="12" fill={GRAY}>
        {[0, 2000, 4000, 6000, 8000].map((v) => (
          <g key={v}>
            <line x1={CHART.l} x2={W - CHART.r} y1={py(v)} y2={py(v)} stroke="#eef0f3" />
            <text x={CHART.l - 7} y={py(v) + 4} textAnchor="end">
              {v.toLocaleString('en-US')}
            </text>
          </g>
        ))}
        {[1990, 2000, 2010, 2020].map((t) => (
          <text key={t} x={px(t)} y={H - 8} textAnchor="middle">
            {t}
          </text>
        ))}
      </g>
      <line x1={CHART.l} x2={W - CHART.r} y1={py(0)} y2={py(0)} stroke={GRAY} strokeWidth="1.2" />
      <path d={LINE} fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinejoin="round" />
      <line x1={x} x2={x} y1={py(0)} y2={y} stroke={INK} strokeWidth="1.5" strokeDasharray="0.1 5" strokeLinecap="round" />
      <circle cx={x} cy={y} r="5.5" fill={CARDINAL} />
      <text x={x + (left ? -10 : 10)} y={y - 8} textAnchor={left ? 'end' : 'start'} fontSize="14" fontWeight="700" fill={CARDINAL} paintOrder="stroke" stroke="#fff" strokeWidth="4">
        {label}
      </text>
    </svg>
  );
}

/**
 * Scalar-valued functions: Mark's definition, then three examples in a row, one per key press, each
 * centred in its column, in the same four tiers that line up across the slide: its name, a picture,
 * what the function means, and its signature (tinted as the definition: each one is an f: ℝⁿ → ℝ).
 * The chart and the map are the same height. 1: the stock market price (pointing at the chart shows
 * P); 2: also, P = P(t, interest rate, inflation, …), P: ℝⁿ → ℝ. 3: the elevation around the Bay
 * (pointing at the map shows E). 4: the Math 51 grade, from the syllabus's grading scheme, as one
 * chain "Your final Math 51 grade = G(…) = 0.25 m₁ + …" in the picture and meaning tiers. 5: the
 * curve on the homework (· 9/8) and the pre-class quizzes (· 10/9), in red.
 */
export default function Slide07Scalar() {
  return (
    <section className="dense">
      <h2>Scalar-valued functions</h2>

      <div className="block definition">
        <p>
          A <strong>scalar-valued</strong> function is a function <Tex tex={r`\mathbb{R}^n\to\mathbb{R}`} />.
        </p>
      </div>

      <div className="sv-row">
        <Fragment index={1} className="sv-col">
          <p className="sv-title">Stock market price (S&amp;P 500)</p>
          <div className="sv-stage">
            <StockChart />
          </div>
          <p className="sv-rule">
            <Tex tex="P(t)" /> = price at time <Tex tex="t" />
          </p>
          <p className="sv-sig">
            <Tex tex={r`P:\mathbb{R}\to\mathbb{R}`} />
          </p>
          <Fragment index={2} className="sv-more">
            <p className="sv-rule">
              Also, <Tex tex={r`P=P(t,\text{interest rate},\text{inflation},\dots)`} />
            </p>
            <p className="sv-sig">
              <Tex tex={r`P:\mathbb{R}^n\to\mathbb{R}`} />
            </p>
          </Fragment>
        </Fragment>

        <Fragment index={3} className="sv-col">
          <p className="sv-title">Elevation around the Bay</p>
          <div className="sv-stage">
            <BayMap c={0} scale={0.5} shore={null} today={false} places={[PLACES[0]]} />
          </div>
          <p className="sv-rule">
            <Tex tex="E(x,y)" /> = height above the sea level at location <Tex tex="(x,y)" />
          </p>
          <p className="sv-sig">
            <Tex tex={r`E:\mathbb{R}^2\to\mathbb{R}`} />
          </p>
        </Fragment>

        <Fragment index={4} className="sv-col">
          <p className="sv-title">Grade</p>
          <div className="sv-stage sv-stage-tall">
            <GradeSum />
          </div>
          <p className="sv-sig">
            <Tex tex={r`G:\mathbb{R}^5\to\mathbb{R}`} />
          </p>
        </Fragment>
      </div>
    </section>
  );
}
