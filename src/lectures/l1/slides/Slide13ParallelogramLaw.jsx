import Tex, { r } from '../components/Tex.jsx';
import Plane, { Arrow, PlaneLabel } from '../components/Plane.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';
export const INK = '#14213d';

/** v, w and v + w drawn from the origin, completed to a parallelogram on key press 1. */
export function SameStartFigure() {
  return (
    <Plane
      xRange={[-0.5, 4.5]}
      yRange={[-0.5, 4.5]}
      unit={58}
      title="v and w from the same starting point, the parallelogram they span, and its diagonal v + w"
    >
      {(p) => (
        <g>
          <Fragment as="g" index={1}>
            <Arrow p={p} from={[1, 3]} to={[3, 4]} color={TEAL} width={2.6} dashed head={11} />
            <Arrow p={p} from={[2, 1]} to={[3, 4]} color={CARDINAL} width={2.6} dashed head={11} />
          </Fragment>
          <Arrow p={p} to={[1, 3]} color={CARDINAL} />
          <PlaneLabel p={p} at={[1, 3]} dx={-24} dy={-10} color={CARDINAL}>
            v
          </PlaneLabel>
          <Arrow p={p} to={[2, 1]} color={TEAL} />
          <PlaneLabel p={p} at={[2, 1]} dx={4} dy={24} color={TEAL}>
            w
          </PlaneLabel>
          <Arrow p={p} to={[3, 4]} color={INK} width={4.5} />
          <PlaneLabel p={p} at={[3, 4]} dx={8} dy={-8} color={INK}>
            v + w
          </PlaneLabel>
        </g>
      )}
    </Plane>
  );
}

/**
 * The same sum drawn tip to tail, built over three key presses (CSS in
 * deck.css, "Slide 13"): it appears as the left picture; on the next press w
 * slides up so that it starts where v ends; on the one after, v + w vanishes
 * and redraws from tail to head. Invisible FxMarker fragments drive both steps.
 */
export function TipToTailFigure() {
  return (
    <Plane
      xRange={[-0.5, 4.5]}
      yRange={[-0.5, 4.5]}
      unit={58}
      title="v from the origin, then w starting at the end of v; v + w runs from the origin to where w ends"
    >
      {(p) => (
        <g>
          <Arrow
            p={p}
            to={[3, 4]}
            color={INK}
            width={4.5}
            shaftProps={{ pathLength: 1, className: 'tt-sum-shaft' }}
            headProps={{ className: 'tt-sum-head' }}
          />
          <PlaneLabel p={p} at={[3, 4]} dx={8} dy={-8} color={INK} className="tt-sum-head">
            v + w
          </PlaneLabel>

          {/* w, drawn at the origin and shifted by v = (1, 3) to start at the tip of v */}
          <g
            className="tt-w"
            style={{
              '--tt-dx': `${p.px(1) - p.px(0)}px`,
              '--tt-dy': `${p.py(3) - p.py(0)}px`,
            }}
          >
            <Arrow p={p} to={[2, 1]} color={TEAL} />
            <PlaneLabel p={p} at={[2, 1]} dx={4} dy={24} color={TEAL}>
              w
            </PlaneLabel>
          </g>

          <Arrow p={p} to={[1, 3]} color={CARDINAL} />
          <PlaneLabel p={p} at={[1, 3]} dx={-24} dy={-10} color={CARDINAL}>
            v
          </PlaneLabel>
        </g>
      )}
    </Plane>
  );
}

export default function Slide13ParallelogramLaw() {
  return (
    <section>
      <h2>The Parallelogram Law</h2>

      <div className="pictures-pair">
        <figure>
          <SameStartFigure />
        </figure>

        <Fragment index={3} as="figure" className="tip-to-tail">
          <FxMarker index={4} id="tt-slide" />
          <FxMarker index={5} id="tt-redraw" />
          <div className="fx-host">
            <TipToTailFigure />
          </div>
        </Fragment>
      </div>

      <Fragment index={2}>
        <p className="compact parallelogram-statement">
          <Tex tex={r`\vv{v}+\vv{w}`} /> is the <strong>diagonal of the parallelogram</strong>{' '}
          spanned by <Tex tex={r`\vv{v}`} /> and <Tex tex={r`\vv{w}`} />.
        </p>
      </Fragment>

      <Notes time="1:15 · running total 14:00">
        <p>Here is the relationship.</p>
        <p>
          <em>[Key press]</em> Copy w over so it starts at the tip of v — that is the dashed teal
          arrow. Copy v over so it starts at the tip of w — dashed cardinal. The four arrows close
          up into a <strong>parallelogram</strong>.
        </p>
        <p>
          <em>[Key press]</em> And v + w is exactly the <strong>diagonal</strong> from the origin.
          This is the <strong>Parallelogram Law</strong>. It is how you should picture vector
          addition from now on.
        </p>
        <p>
          <em>[Key press]</em> The same sum, drawn differently. Here is the same picture again.
        </p>
        <p>
          <em>[Key press]</em> Slide w up so that it starts where v ends.
        </p>
        <p>
          <em>[Key press]</em> Now follow v, then w — and v + w runs from where you started to
          where you land.
        </p>
      </Notes>
    </section>
  );
}
