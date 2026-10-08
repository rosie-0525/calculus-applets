import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, Dot, PlaneLabel } from '../components/Plane.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';

export const col = (a, b) => r`\begin{bmatrix}${a}\\${b}\end{bmatrix}`;

// One column of the table per value of t; `name` marks the two ends, u and v.
export const ROWS = [
  { i: 1, t: '0', pt: [1, 5], tex: col(1, 5), name: r`\vv{u}`, color: CARDINAL },
  { i: 2, t: r`\dfrac14`, pt: [2, 4], tex: col(2, 4) },
  { i: 3, t: r`\dfrac12`, pt: [3, 3], tex: col(3, 3) },
  { i: 4, t: r`\dfrac34`, pt: [4, 2], tex: col(4, 2) },
  { i: 5, t: '1', pt: [5, 1], tex: col(5, 1), name: r`\vv{v}`, color: TEAL },
];

export default function Slide18Example2() {
  return (
    <section>
      <h2>
        Example 2 <span style={{ fontSize: '0.55em', color: 'var(--ink-soft)' }}>(→ Example 1.3.8)</span>
      </h2>

      <div className="stage">
        <div className="stage-text">
          <Tex
            display
            tex={r`\vv{u}=\begin{bmatrix}1\\5\end{bmatrix},
                   \qquad
                   \vv{v}=\begin{bmatrix}5\\1\end{bmatrix}`}
          />
          <p className="compact">
            For <Tex tex={r`t=0,\tfrac14,\tfrac12,\tfrac34,1`} />, compute{' '}
            <Tex tex={r`(1-t)\vv{u}+t\vv{v}`} />.
          </p>

          <Fragment as="table" index={1} className="tvals">
            <tbody>
              <tr className="tvals-t">
                <th>
                  <Tex tex="t" />
                </th>
                {ROWS.map((row) => (
                  <Fragment as="td" index={row.i} key={row.i}>
                    <Tex tex={row.t} />
                  </Fragment>
                ))}
              </tr>
              <tr className="tvals-result">
                <th>
                  <Tex tex={r`(1-t)\vv{u}+t\vv{v}`} />
                </th>
                {ROWS.map((row) => (
                  <Fragment as="td" index={row.i} key={row.i}>
                    <Tex tex={row.tex} />
                    {row.name && (
                      <span className="tvals-name" style={{ color: row.color }}>
                        <Tex tex={`=${row.name}`} />
                      </span>
                    )}
                  </Fragment>
                ))}
              </tr>
            </tbody>
          </Fragment>
        </div>

        <Plane
          xRange={[-0.3, 6]}
          yRange={[-0.3, 6]}
          unit={56}
          title="The five convex combinations of u and v, lying on the segment between them"
        >
          {(p) => (
            <g>
              <Fragment as="g" index={6}>
                <line
                  x1={p.px(1)}
                  y1={p.py(5)}
                  x2={p.px(5)}
                  y2={p.py(1)}
                  stroke={INK}
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </Fragment>
              <Arrow p={p} to={[1, 5]} color={CARDINAL} width={3} />
              <PlaneLabel p={p} at={[1, 5]} dx={-24} dy={-10} color={CARDINAL}>
                u
              </PlaneLabel>
              <Arrow p={p} to={[5, 1]} color={TEAL} width={3} />
              <PlaneLabel p={p} at={[5, 1]} dx={10} dy={16} color={TEAL}>
                v
              </PlaneLabel>
              {ROWS.map((row) => (
                <Fragment as="g" index={row.i} key={row.i}>
                  <Dot p={p} at={row.pt} color={INK} r={7} />
                </Fragment>
              ))}
            </g>
          )}
        </Plane>
      </div>

      <Fragment index={7} className="note">
        The convex linear combinations of <Tex tex={r`\vv{u}`} /> and <Tex tex={r`\vv{v}`} /> sweep
        out the <strong>line segment</strong> joining them.
      </Fragment>

      <Notes time="3:00 · running total 23:00">
        <p>
          This is Example 1.3.8 in the book. Work it with me — five values of t.
        </p>
        <p>
          <em>[Key press]</em> t = 0 kills the v term entirely, so we just get{' '}
          <strong>u = (1, 5)</strong>. That is the top-left point.
        </p>
        <p>
          <em>[Key press]</em> t = 1/4: three quarters of u plus one quarter of v. Three quarters
          of (1, 5) is (0.75, 3.75); a quarter of (5, 1) is (1.25, 0.25). Add them:{' '}
          <strong>(2, 4)</strong>.
        </p>
        <p>
          <em>[Key press]</em> t = 1/2 is the plain average, <strong>(3, 3)</strong> — the midpoint.
        </p>
        <p>
          <em>[Key press ×2]</em> t = 3/4 gives (4, 2), and t = 1 gives v itself, (5, 1).
        </p>
        <p>
          <em>[Key press]</em> Look at the five dots. They are <strong>evenly spaced along the
          segment from u to v</strong>.
        </p>
        <p>
          <em>[Key press]</em> And that is the general fact: as t runs over [0, 1], the
          point (1 − t)u + tv traces out exactly the segment joining u and v. t is how far along
          you have gone.
        </p>
      </Notes>
    </section>
  );
}
