import Tex from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Space, { PlanePatch, Dot3 } from '../components/Space.jsx';
import Surface from '../components/Surface.jsx';

export const RED = '#8c1515';
export const TEAL = '#0e7490';
export const SANS = 'Source Sans Pro, Helvetica, sans-serif';

// a peak at (1, 0) and a pit at (−1, 0)
export const f = (x, y) => 3 * x * Math.exp(-(x * x + y * y) / 2);
export const R = [-3, 3];
export const Z = 0.7;
export const FLOOR = -2.1;

/** The point of the graph over P, with its label. */
export function Near({ s, c, color, label, dy }) {
  const top = [c[0], c[1], Z * f(...c)];
  return (
    <g>
      <Dot3 s={s} at={top} color={color} r={6.5} stroke="#fff" strokeWidth="1.5" />
      <text x={s.P(top)[0]} y={s.P(top)[1] + dy} textAnchor="middle" fill={color} fontSize="19" fontWeight="700" fontFamily={SANS}>
        {label}
      </text>
    </g>
  );
}

/**
 * Local maximum and minimum: Mark's definition, the minimum first, then (key press 1) the maximum.
 * Beside it the graph of 3x e^(−(x² + y²)/2), with a pit at (−1, 0) and (key press 1) a peak at
 * (1, 0) (Near).
 */
export default function Slide05Local() {
  return (
    <section className="dense">
      <h2>Local maximum and minimum</h2>

      <div className="stage">
        <div className="stage-text">
          <p>
            Let <Tex tex={String.raw`f:\mathbb{R}^n\to\mathbb{R}`} /> be a scalar-valued function.
          </p>
          <div className="block definition">
            <p className="block-title">Definition</p>
            <p>
              <Tex tex="f" /> has a <strong>local minimum</strong> at <Tex tex={String.raw`\mathbf{p}`} /> if for every point{' '}
              <Tex tex={String.raw`\mathbf{x}`} /> sufficiently close to <Tex tex={String.raw`\mathbf{p}`} /> we have{' '}
              <Tex tex={String.raw`{f(\mathbf{x})\ge f(\mathbf{p}).}`} />
            </p>
            <Fragment index={1} as="p">
              <Tex tex="f" /> has a <strong>local maximum</strong> at <Tex tex={String.raw`\mathbf{p}`} /> if for every{' '}
              <Tex tex={String.raw`\mathbf{x}`} /> sufficiently close to <Tex tex={String.raw`\mathbf{p}`} /> we have{' '}
              <Tex tex={String.raw`{f(\mathbf{x})\le f(\mathbf{p}).}`} />
            </Fragment>
          </div>
        </div>

        <Space width={565} height={480} unit={66} center={[0.5, 0.5]} axes={false} az={-62} el={24} swing={8} title="The graph of a function with a pit and a peak">
          {(s) => (
            <g>
              <PlanePatch s={s} P={[0, 0, FLOOR]} e={[1, 0, 0]} e2={[0, 1, 0]} range={R} fill="#eef2f5" opacity={1} stroke="#d5dbe1" />
              <Surface s={s} f={f} x={R} y={R} n={36} zScale={Z} mesh="rgba(15, 40, 50, 0.16)" />
              <Near s={s} c={[-1, 0]} color={TEAL} label="local minimum" dy={34} />
              <Fragment as="g" index={1}>
                <Near s={s} c={[1, 0]} color={RED} label="local maximum" dy={-18} />
              </Fragment>
            </g>
          )}
        </Space>
      </div>
    </section>
  );
}
