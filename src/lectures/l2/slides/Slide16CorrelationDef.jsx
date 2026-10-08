import { useEffect, useRef, useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import DataToVectors from '../components/DataToVectors.jsx';
import Notes from '../components/Notes.jsx';

/**
 * A gray arrow from the end of the "Averages ..." line up to the boxed
 * assumption. Its ends are measured from the layout (after the fonts load),
 * in unscaled slide pixels relative to `hostRef`.
 */
export function CentreArrow({ hostRef, index }) {
  const [ends, setEnds] = useState(null);
  useEffect(() => {
    const host = hostRef.current;
    const measure = () => {
      const text = host.querySelector('.centre-means-text');
      const box = host.querySelector('.centre-cond');
      if (!text || !box) return;
      const h = host.getBoundingClientRect();
      const scale = h.width / host.offsetWidth || 1;
      const rel = (rect) => ({
        left: (rect.left - h.left) / scale,
        right: (rect.right - h.left) / scale,
        top: (rect.top - h.top) / scale,
        bottom: (rect.bottom - h.top) / scale,
      });
      const t = rel(text.getBoundingClientRect());
      const b = rel(box.getBoundingClientRect());
      setEnds({
        from: [t.right + 10, (t.top + t.bottom) / 2],
        to: [(b.left + b.right) / 2, b.bottom + 5],
      });
    };
    document.fonts?.ready.then(measure);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [hostRef]);

  if (!ends) return null;
  const [x1, y1] = ends.from;
  const [x2, y2] = ends.to;
  return (
    <Fragment as="svg" index={index} className="centre-arrow" aria-hidden="true">
      <defs>
        <marker
          id="centre-arrow-head"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
        </marker>
      </defs>
      <path
        d={`M ${x1} ${y1} Q ${x2} ${y1} ${x2} ${y2}`}
        fill="none"
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#centre-arrow-head)"
      />
    </Fragment>
  );
}

export default function Slide16CorrelationDef() {
  const textRef = useRef(null);
  return (
    <section className="dense">
      <h2>Computing correlation coefficients</h2>

      <div className="stage">
        <div className="stage-text centre-host" ref={textRef}>
          <div className="block definition">
            <ul className="bullets compact">
              <Fragment index={1} as="li">
                Put <Tex tex="n" /> data points <Tex tex={r`(x_1,y_1),\dots,(x_n,y_n)`} /> into two
                vectors
                <Tex
                  display
                  tex={r`\vv{X}=\begin{bmatrix}x_1\\\vdots\\x_n\end{bmatrix},\qquad
                         \vv{Y}=\begin{bmatrix}y_1\\\vdots\\y_n\end{bmatrix}.`}
                />
              </Fragment>
              <Fragment index={2} as="li">
                Compute the <strong>correlation coefficient</strong>:
                <Tex
                  display
                  tex={r`r=\frac{\vv{X}\cdot\vv{Y}}{\norm{\vv{X}}\,\norm{\vv{Y}}},`}
                />
                where we assume{' '}
                <FxMarker index={3} id="centre-box" />
                <span className="fx-host">
                  <Tex
                    className="centre-cond"
                    tex={r`\vv{X}\cdot\vv{1}=\vv{Y}\cdot\vv{1}=0`}
                  />
                </span>
                .
              </Fragment>
            </ul>
          </div>

          <Fragment index={3} as="p" className="aside centre-means">
            <span className="centre-means-text">
              Averages of <Tex tex="x_i" /> and <Tex tex="y_i" /> are both zero
            </span>
          </Fragment>
          <CentreArrow hostRef={textRef} index={3} />

          <Fragment index={4} as="p" className="aside centre-note">
            We can arrange this to be true by replacing each <Tex tex="x_i" /> by{' '}
            <Tex tex={r`x_i-\bar{x}`} /> (and each <Tex tex="y_i" /> by <Tex tex={r`y_i-\bar{y}`} />
            ).
          </Fragment>
        </div>

        <div className="stage-fig">
          <DataToVectors index={1} angleIndex={2} />
        </div>
      </div>

      <Notes time="2:30 · running total 34:15">
        <p>Here is the recipe.</p>
        <p>
          <em>[Key press]</em> Stack all the x-values into one vector X, and all the y-values into
          another vector Y. On the left, three data points; on the right, the X and Y they make.
          With three points, X and Y are vectors in ℝ³, not in ℝ²: each axis belongs to one data
          point. (With n points they live in ℝⁿ, which we cannot draw, but the idea is the same.)
          You can drag the right-hand picture to turn it.
        </p>
        <p>
          <em>[Key press]</em> Then the correlation coefficient r is just the cosine of the angle
          between X and Y. We assume X · 1 = 0 and Y · 1 = 0; more on that in a moment. Here
          X = (−3, 1, 2), Y = (−1, −2, 3): X · Y = 7 and ‖X‖ = ‖Y‖ = √14, so r = 7/14 = 0.5 and
          θ = 60°. The dashed green line is the best-fit line.
        </p>
        <p>
          <em>[Move the gray slider under the graphs one level at a time, pausing at each]</em> The x's stay put; only the
          y's move, and the data stays centred all the way.
        </p>
        <ol>
          <li>
            Every y halved: the points and the line get flatter, but the arrow Y only gets shorter
            — it does not turn. θ and r stay the same (Poll 1). So r is not the slope.
          </li>
          <li>θ = 0°: Y = X, the points lie exactly on the line y = x, and r = 1.</li>
          <li>θ = 90°: X ⟂ Y, the best line is flat, and r = 0 — no linear relation.</li>
          <li>θ = 180°: Y = −X, the points lie exactly on a falling line, and r = −1.</li>
        </ol>
        <p>(Sliding back to the first level returns to r = 0.5.)</p>
        <p>
          <em>[Key press]</em> Now the assumption X · 1 = Y · 1 = 0. From Example 1, X · (1/n)1 is
          the average x̄ of the xᵢ, so X · 1 = 0 says the average of the xᵢ is zero, and the same
          for the yᵢ — the data is <strong>centered</strong>. (The points on the right always are.)
        </p>
        <p>
          <em>[Key press]</em> We can always arrange this: replace each xᵢ by xᵢ − x̄, and each yᵢ
          by yᵢ − ȳ. That just slides the cloud of points so its center is at the origin, which
          does not change how well a line fits. The next example is already centered.
        </p>
      </Notes>
    </section>
  );
}
