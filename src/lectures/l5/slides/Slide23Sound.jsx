import Tex, { r } from '../components/Tex.jsx';
import Space, { Arrow3, Seg3, Dot3, Label3, PlanePatch, PlaneGrid, RightAngle3, ProjText } from '../components/Space.jsx';
import { plus, times } from '../components/vec.js';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import { INK, GRAY, NOTES, BASIS, NOISY, CLEAN_AMPS, CLEANED, HISS, note, mix, Track, Wave, combo } from '../components/Sound.jsx';

export const CARDINAL = '#8c1515';
export const TEAL = '#0e7490';

/** A coefficient to two decimals, never "−0.00". */
export const fmt = (c) => (Math.abs(c) < 0.005 ? 0 : c).toFixed(2);

export const SPLIT_W = 290; // the three waves of x = Proj_V(x) + (x − Proj_V(x)), one under the other
export const PROJ_W = 270; // the four projections, in a column
export const PROJ_SCALE = 2.3; // the four projections share one vertical scale, so heights compare
export const PROJ_SAMPLES = BASIS.map((v, i) => v.map((y) => CLEAN_AMPS[i] * y)); // Proj_N(x), to play

/* ---------- The picture: the recording above the floor V of all chords ---------- */

export const O = [0, 0, 0];
export const U1 = [1, 0.1, 0];
export const U2 = [-0.1, 1, 0];
export const UP = [0, 0, 1];
export const P = plus(times(1.4, U1), times(1.9, U2)); // Proj_V(x)
export const X = plus(P, times(1.9, UP));

/**
 * One piece per key press, in step with the waves: x above V; then (with the sum) Proj_V(x) and
 * the dotted perpendicular from x down to V; then the hiss x − Proj_V(x), at a right angle to V.
 */
export function DenoiseFigure() {
  return (
    <Space
      width={400}
      height={290}
      unit={68}
      center={[0.42, 0.44]}
      axes={false}
      az={-36}
      el={24}
      swing={8}
      title="The recording x above the subspace V of chords; the denoised chord Proj_V(x) is the closest point of V, and the hiss x − Proj_V(x) is orthogonal to V"
    >
      {(s) => (
        <g>
          <PlanePatch s={s} P={O} e={U1} e2={U2} range={[-1, 2.2]} range2={[-1.1, 2.7]} />
          <PlaneGrid s={s} P={O} e={U1} e2={U2} range={[-1, 2.2]} range2={[-1.1, 2.7]} color="#b6d5dc" width={0.7} />
          <Label3 s={s} at={plus(times(2.2, U1), times(-1.1, U2))} dx={-20} dy={30} color={TEAL} size={18}>
            V
            <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif" fontSize={14}>
              {' '}= all chords
            </tspan>
          </Label3>

          <Fragment as="g" index={2}>
            <Arrow3 s={s} to={P} color={TEAL} width={4} />
            {/* the right angle lies in the plane of x and Proj_V(x), drawn over the arrowhead */}
            <Fragment as="g" index={3} effect="fade-out">
              <Seg3 s={s} from={X} to={P} color={INK} width={2.4} strokeDasharray="0.1 6.5" />
              <RightAngle3 s={s} corner={P} a={UP} b={times(-1, P)} size={0.3} color={INK} />
            </Fragment>
            <Label3 s={s} at={P} dx={-34} dy={30} color={TEAL} size={15}>
              <ProjText sub="V" />
            </Label3>
            <Label3 s={s} at={P} dx={-34} dy={48} color={TEAL} size={13} italic={false}>
              denoised chord
            </Label3>
          </Fragment>

          <Fragment as="g" index={3}>
            <Arrow3 s={s} from={P} to={X} color={CARDINAL} width={3} head={12} dashed />
            <RightAngle3 s={s} corner={P} a={UP} b={times(-1, P)} size={0.3} color={CARDINAL} />
            <Label3
              s={s}
              at={plus(P, times(1.05, UP))}
              dx={10}
              dy={6}
              color={CARDINAL}
              size={14}
              stroke="#fff"
              strokeWidth={4}
              paintOrder="stroke"
            >
              x − <ProjText sub="V" />
              <tspan fontStyle="normal" fontFamily="KaTeX_Main, Georgia, serif">
                {' '}= noise
              </tspan>
            </Label3>
          </Fragment>

          <Arrow3 s={s} to={X} color={INK} width={3.5} />
          <Dot3 s={s} at={O} color={INK} r={4} />
          <Label3 s={s} at={X} dx={8} dy={-4} color={INK}>
            x
          </Label3>
          <Label3 s={s} at={X} dx={22} dy={-4} color={INK} size={13} italic={false}>
            recording
          </Label3>
        </g>
      )}
    </Space>
  );
}

export default function Slide23Sound() {
  return (
    <section className="dense">
      <h2>Back to sound: denoising is a projection</h2>

      <p className="compact">
        <Tex tex={r`V=\operatorname{span}(\vv{C},\vv{E},\vv{G},\vv{A})`} /> is the set of all chords;{' '}
        <Tex tex={r`\vv{C},\vv{E},\vv{G},\vv{A}`} /> are orthogonal.
      </p>

      {/* x = Proj_V(x) + (x − Proj_V(x)) down the left; the projections onto the notes, which add
          up to Proj_V(x), in the middle; the picture on the right */}
      <div className="denoise">
        <div className="split-col">
          <div className="split-line">
            <span className="split-op" />
            <div className="sound-panel denoise-card">
              <Track
                samples={NOISY}
                label="the noisy recording"
                captionClassName="split-caption"
                caption={
                  <>
                    <Tex tex={r`\vv{x}`} />
                    <br />
                    recording, with noise
                  </>
                }
              >
                <Wave samples={NOISY} width={SPLIT_W} height={58} color={GRAY} stroke={1.4} label="The noisy recording" />
              </Track>
            </div>
          </div>

          <Fragment index={2} className="split-line">
            <span className="split-op">
              <Tex tex="=" />
            </span>
            <div className="sound-panel denoise-card">
              <Track
                samples={CLEANED}
                label="the denoised chord"
                captionClassName="split-caption teal"
                caption={
                  <>
                    <Tex tex={r`\operatorname{Proj}_V(\vv{x})=${combo(CLEAN_AMPS, fmt)}`} />
                    <br />
                    denoised chord
                  </>
                }
              >
                <Wave fn={mix(CLEAN_AMPS)} width={SPLIT_W} height={58} color={TEAL} label="The denoised chord" />
              </Track>
            </div>
          </Fragment>

          <Fragment index={3} className="split-line">
            <span className="split-op">
              <Tex tex="+" />
            </span>
            <div className="sound-panel denoise-card">
              <Track
                samples={HISS}
                label="the hiss that was removed"
                captionClassName="split-caption red"
                caption={
                  <>
                    <Tex tex={r`\vv{x}-\operatorname{Proj}_V(\vv{x})`} />
                    <br />
                    noise
                  </>
                }
              >
                <Wave samples={HISS} width={SPLIT_W} height={58} color={CARDINAL} stroke={1.4} label="The hiss" />
              </Track>
            </div>
          </Fragment>
        </div>

        <Fragment index={1} className="proj-col">
          <p className="denoise-title">
            Project <Tex tex={r`\vv{x}`} /> onto each note:
          </p>
          <div className="proj-cards">
            {NOTES.map(({ name, f }, i) => {
              const c = CLEAN_AMPS[i];
              return (
                <div key={name} className="sound-panel denoise-card">
                  <Track
                    samples={PROJ_SAMPLES[i]}
                    label={`the projection onto ${name}`}
                    caption={<Tex tex={r`\operatorname{Proj}_{\vv{${name}}}(\vv{x})=${fmt(c)}\,\vv{${name}}`} />}
                  >
                    <Wave
                      fn={(t) => c * note(f)(t)}
                      width={PROJ_W}
                      height={36}
                      scale={PROJ_SCALE}
                      color={TEAL}
                      stroke={1.6}
                      label={`The projection of the recording onto the note ${name}`}
                    />
                  </Track>
                </div>
              );
            })}
          </div>
        </Fragment>

        <div className="stage-fig">
          <DenoiseFigure />
        </div>
      </div>

      <Notes time="2:30 · running total 42:00">
        <p>
          Now the motivation, with today's words. The chords of our four notes form the subspace V, the
          span of C, E, G, A. Different notes are orthogonal, so they are an orthogonal basis of V. The
          noisy recording x is not in V: the hiss is not a chord. <em>[play x]</em> In the picture, x
          is above the floor of all chords. (V is 4-dimensional; the picture draws it as a plane.)
        </p>
        <p>
          <em>[Key press]</em> To find the closest chord, project x onto each note: one dot product per
          note. <em>[play a few]</em> The coefficients come out 2.01, 0.99, 0.99 and 0.00: the loudness
          of each note, almost exactly the 2, 1, 1, 0 of C major. The A wave is flat: there is no A in
          the recording.
        </p>
        <p>
          <em>[Key press]</em> Add the four projections and you get Proj_V(x), the chord closest to x.{' '}
          <em>[play]</em> In the picture: drop perpendicularly from x to the floor.
        </p>
        <p>
          <em>[Key press]</em> The recording splits in two: x = Proj_V(x) + (x − Proj_V(x)), the
          denoised chord plus what we removed. <em>[play the hiss]</em> It is pure
          hiss, with no note left in it: it is orthogonal to C, E, G and A, so to every chord. Its length
          is the distance from the recording to the nearest chord.
        </p>
      </Notes>
    </section>
  );
}
