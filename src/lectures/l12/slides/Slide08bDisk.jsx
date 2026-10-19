import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import { DiskFigure } from '../components/Disk.jsx';

export const BLUE = '#1d4ed8';
export const RED = '#8c1515';
export const INK = '#14213d';
export const SANS = 'Source Sans Pro, Helvetica, sans-serif';
export const S3 = Math.sqrt(3) / 2;

// as on Recall: finding global extrema, and in the same places (which the levels' labels keep
// clear of): the points on the circle in blue, the one inside in red, each value beyond its point
export const ON_CIRCLE = [
  { at: [1 / 2, S3], text: '5/4', dx: 18, dy: -10, anchor: 'start' },
  { at: [1 / 2, -S3], text: '5/4', dx: 18, dy: 22, anchor: 'start' },
  { at: [-1, 0], text: '−1', dx: -20, dy: 6, anchor: 'end' },
];

/** A point and its value. */
export function Mark({ p, at: [x, y], color, text, dx, dy, anchor }) {
  return (
    <g>
      <circle cx={p.px(x)} cy={p.py(y)} r="7" fill={color} stroke="#fff" strokeWidth="2" />
      <text x={p.px(x) + dx} y={p.py(y) + dy} textAnchor={anchor} fill={color} fontSize="17" fontWeight="700" fontFamily={SANS} className="map-label">
        {text}
      </text>
    </g>
  );
}

/** A ring round a max or min, and its name ("max" or "min") beside it. */
export function Ring({ p, at: [x, y], name, dx, dy, anchor }) {
  return (
    <g>
      <circle cx={p.px(x)} cy={p.py(y)} r="15" fill="none" stroke={INK} strokeWidth="2.5" />
      <text x={p.px(x) + dx} y={p.py(y) + dy} textAnchor={anchor} fill={INK} fontSize="16" fontWeight="700" fontFamily={SANS} className="map-label">
        {name}
      </text>
    </g>
  );
}

/**
 * Example 2 (board; the user's): the f of Recall: finding global extrema and Constrained
 * optimization, beside their picture (DiskFigure, Disk.jsx, which gives f and D): (i) its max and
 * min on the circle x² + y² = 1 (in black, the user's request); (ii) on the disk D, where the
 * minimum is at the critical point inside. f and D written out, and both parts shown from the
 * start (the user's requests). Key press 1: the picture; 2: (i)'s max 5/4 at (1/2, ±√3/2) and min
 * −1 at (−1, 0), on the circle; 3: (ii)'s, the same max and the min −5/4 at (−1/2, 0), inside
 * (the ring of (i)'s min fades out). The working is commented out.
 */
export default function Slide08bDisk() {
  return (
    <section>
      <h2>
        Example 2 <span className="board-pill">board</span>
      </h2>

      <div className="stage l12-disk-stage">
        <div className="stage-text">
          <p>
            The function <Tex tex="f(x,y)=x^2+2y^2+x-1" /> on <Tex tex={r`D=\{(x,y):x^2+y^2\le 1\}`} />:
          </p>
          <ol className="parts">
            <li>
              Find the maximum and minimum of <Tex tex="f" /> subject to the constraint{' '}
              <span className="l12-nowrap">
                <Tex tex="x^2+y^2=1" />.
              </span>
            </li>
            {/* g(x, y) = x² + y², c = 1; ∇f = (2x + 1, 4y), ∇g = (2x, 2y), which is 0 only at (0, 0),
                not on the circle. ∇f = λ∇g: 2x + 1 = 2λx and 4y = 2λy, so y = 0 or λ = 2.
                y = 0: (±1, 0), with f(1, 0) = 1 (λ = 3/2) and f(−1, 0) = −1 (λ = 1/2).
                λ = 2: 2x + 1 = 4x, x = 1/2, y = ±√3/2, with f(1/2, ±√3/2) = 5/4.
                Maximum 5/4 at (1/2, ±√3/2); minimum −1 at (−1, 0). */}
            <li>
              Find the maximum and minimum of <Tex tex="f" /> on <Tex tex="D" />.
            </li>
            {/* Inside: ∇f = (2x + 1, 4y) = 0 at (−1/2, 0), in D, with f(−1/2, 0) = −5/4 (a local
                minimum). On the boundary, the candidates of (i). Maximum 5/4 at (1/2, ±√3/2), on the
                circle; minimum −5/4 at (−1/2, 0), inside D. */}
          </ol>
        </div>

        <Fragment index={1} className="stage-fig">
          <DiskFigure>
            {(p) => (
              <g>
                {/* (i): on the circle */}
                <Fragment as="g" index={2}>
                  {ON_CIRCLE.map((m) => (
                    <Mark key={m.at.join()} p={p} color={BLUE} {...m} />
                  ))}
                  {[S3, -S3].map((y) => (
                    <Ring key={y} p={p} at={[1 / 2, y]} name="max" dx={-22} dy={6} anchor="end" />
                  ))}
                  {/* not the min on D */}
                  <Fragment as="g" index={3} effect="fade-out">
                    <Ring p={p} at={[-1, 0]} name="min" dx={-20} dy={-16} anchor="end" />
                  </Fragment>
                </Fragment>
                {/* (ii): on D, the same max, and the min at the critical point inside */}
                <Fragment as="g" index={3}>
                  <Mark p={p} at={[-1 / 2, 0]} color={RED} text="−5/4" dx={0} dy={36} anchor="middle" />
                  <Ring p={p} at={[-1 / 2, 0]} name="min" dx={0} dy={-22} anchor="middle" />
                </Fragment>
              </g>
            )}
          </DiskFigure>
        </Fragment>
      </div>
    </section>
  );
}
