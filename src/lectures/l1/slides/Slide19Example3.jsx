import Tex, { r } from '../components/Tex.jsx';
import Plane, { Dot, PlaneLabel } from '../components/Plane.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const GREEN = '#175e54';
export const INK = '#14213d';

export default function Slide19Example3() {
  return (
    <section>
      <h2>Example 3</h2>

      <div className="stage">
        <div className="stage-text">
          <Tex
            display
            tex={r`\vv{u}=\begin{bmatrix}1\\5\end{bmatrix},\quad
                   \vv{v}=\begin{bmatrix}5\\1\end{bmatrix},\quad
                   \vv{w}=\begin{bmatrix}1\\1\end{bmatrix}`}
          />
          <p className="question" style={{ marginTop: '0.5em' }}>
            <strong>
              What are the possible positions for a convex linear combination of{' '}
              <Tex tex={r`\vv{u}`} />, <Tex tex={r`\vv{v}`} /> and <Tex tex={r`\vv{w}`} />?
            </strong>
          </p>

          <Fragment index={3} className="note">
            This will be explored on a worksheet in <strong>discussion section this week</strong>.
            Sections start tomorrow — and no preparation for section is ever necessary.
          </Fragment>
        </div>

        <Plane
          xRange={[-0.3, 6]}
          yRange={[-0.3, 6]}
          unit={56}
          title="Three points in the plane and the triangle they span"
        >
          {(p) => (
            <g>
              <Fragment as="g" index={2}>
                <polygon
                  points={`${p.px(1)},${p.py(5)} ${p.px(5)},${p.py(1)} ${p.px(1)},${p.py(1)}`}
                  fill={CARDINAL}
                  opacity="0.12"
                />
              </Fragment>
              <Fragment as="g" index={1}>
                <g stroke={INK} strokeWidth="3" strokeLinecap="round" opacity="0.35" fill="none">
                  <line x1={p.px(1)} y1={p.py(5)} x2={p.px(5)} y2={p.py(1)} />
                  <line x1={p.px(1)} y1={p.py(5)} x2={p.px(1)} y2={p.py(1)} />
                  <line x1={p.px(5)} y1={p.py(1)} x2={p.px(1)} y2={p.py(1)} />
                </g>
              </Fragment>
              <Dot p={p} at={[1, 5]} color={CARDINAL} r={7} />
              <PlaneLabel p={p} at={[1, 5]} dx={-24} dy={-10} color={CARDINAL}>
                u
              </PlaneLabel>
              <Dot p={p} at={[5, 1]} color={TEAL} r={7} />
              <PlaneLabel p={p} at={[5, 1]} dx={10} dy={20} color={TEAL}>
                v
              </PlaneLabel>
              <Dot p={p} at={[1, 1]} color={GREEN} r={7} />
              <PlaneLabel p={p} at={[1, 1]} dx={-24} dy={20} color={GREEN}>
                w
              </PlaneLabel>
            </g>
          )}
        </Plane>
      </div>

      <Notes time="1:30 · running total 24:30">
        <p>
          Same u and v as before, plus a third vector w = (1, 1). Now take convex combinations of
          all <strong>three</strong>. What can you reach?
        </p>
        <p>
          <em>[Key press]</em> You already know part of the answer. If you set one coefficient to
          zero, you are back in Example 2 — so all three <strong>edges</strong> are reachable.
        </p>
        <p>
          <em>[Key press]</em> So what about the inside? Here is a hint, not a proof: pick a point
          on one edge, then take a convex combination of <em>that</em> with the third vector. You
          sweep out a segment into the interior. Do it for every point of the edge.
        </p>
        <p>
          The answer is the <strong>filled triangle</strong>, and I am deliberately showing it
          faintly, because —
        </p>
        <p>
          <em>[Key press]</em> — this is your <strong>worksheet in section this week</strong>. Come
          and argue it properly. Sections start tomorrow, and you do not prepare anything
          beforehand.
        </p>
      </Notes>
    </section>
  );
}
