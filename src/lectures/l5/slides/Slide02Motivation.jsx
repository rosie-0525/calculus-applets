import { useMemo } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment, { FxMarker } from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';
import {
  GRAY,
  NOTES,
  C_MAJOR,
  A_MINOR,
  note,
  mix,
  sample,
  BASIS,
  decode,
  NOISY,
  CLEAN_AMPS,
  CLEANED,
  Track,
  Wave,
  combo,
  chord,
} from '../components/Sound.jsx';

/* The notes, the chords and the noisy recording live in Sound.jsx; slide 23 uses them too. */

export const NOTE_W = 232; // the width of a note's wave, four to a row
export const CHORD_W = 534; // the width of a chord's wave, in a half-width panel

export default function Slide02Motivation() {
  const cMajor = useMemo(() => sample(mix(C_MAJOR)), []);
  const aMinor = useMemo(() => sample(mix(A_MINOR)), []);
  // the noisy recording, and the chord closest to it: c_i = x·v_i / v_i·v_i for each note
  const noisy = NOISY;
  const cleanAmps = CLEAN_AMPS;
  const cleaned = CLEANED;
  const solved = useMemo(() => decode(aMinor).map((c) => Math.round(c)), [aMinor]);

  return (
    <section>
      <h2>Motivation</h2>

      <FxMarker index={3} id="solve" />
      <div className="fx-host sound-panels">
        {/* the building blocks: a strip across the slide */}
        <div className="sound-panel notes-panel">
          <p className="panel-title">Each pure note can be represented by a wave function</p>
          <div className="note-tracks">
            {NOTES.map(({ name, f }, i) => (
              <Track
                key={name}
                samples={BASIS[i]}
                label={`the note ${name}`}
                caption={
                  <>
                    <Tex tex={r`\vv{${name}}=`} /> <Tex className="note-formula" tex={r`\sin(2\pi\cdot ${f}\,t)`} />
                  </>
                }
              >
                <Wave fn={note(f)} width={NOTE_W} height={50} scale={1.15} stroke={1.6} label={`The note ${name}`} />
              </Track>
            ))}
          </div>
        </div>

        {/* what we do with them: two panels of the same shape, side by side */}
        <Fragment index={1} className="sound-panel">
          <p className="panel-title">Adding notes makes a chord</p>
          <Track
            samples={cMajor}
            label="the C major chord"
            caption={
              <>
                C major: <Tex tex={chord(C_MAJOR)} />
              </>
            }
          >
            <Wave fn={mix(C_MAJOR)} width={CHORD_W} label="The C major chord" />
          </Track>
          <Fragment index={2}>
            <Track
              samples={aMinor}
              label="the mystery chord"
              captionClassName="swap"
              caption={
                <>
                  <span className="swap-question">
                    a chord <Tex tex={r`\vv{u}={\color{#8c1515}?}`} />
                  </span>
                  <span className="swap-answer">
                    A minor: <Tex tex={r`\vv{u}=${chord(solved)}`} />
                  </span>
                </>
              }
            >
              <Wave fn={mix(A_MINOR)} width={CHORD_W} label="A mystery chord" />
            </Track>
          </Fragment>
        </Fragment>

        <Fragment index={4} className="sound-panel">
          <p className="panel-title">Denoise: the C major chord, recorded with hiss</p>
          <Track
            samples={noisy}
            label="the noisy recording"
            caption={
              <>
                noisy recording <Tex tex={r`\vv{x}`} />
              </>
            }
          >
            <Wave samples={noisy} width={CHORD_W} color={GRAY} stroke={1.4} label="The noisy recording" />
          </Track>
          <Fragment index={5}>
            <Track
              samples={cleaned}
              label="the cleaned recording"
              caption={
                <>
                  closest chord to <Tex tex={r`\vv{x}`} />: <Tex tex={combo(cleanAmps, (c) => c.toFixed(2))} />
                </>
              }
            >
              <Wave fn={mix(cleanAmps)} width={CHORD_W} label="The chord closest to the noisy recording" />
            </Track>
          </Fragment>
        </Fragment>
      </div>

      <Notes time="3:30 · running total 4:00">
        <p>
          A pure note is a sine wave: the air pressure goes up and down f times per second. Here are C,
          E, G and A, at 262, 330, 392 and 440 vibrations per second; 440 is the A an orchestra tunes
          to. <em>[play each note]</em> The higher the note, the faster the wave wiggles.
        </p>
        <p>
          <em>[Key press]</em> Play notes together and you get a chord: the waves simply add. The
          coefficient of a note is how loud it is: doubling a wave makes the air vibrate twice as far.
          Here a choir of four sings C major, but the chord has only three notes, C, E and G, so two
          voices sing the same note. The rule in four-part harmony is to double the <strong>root</strong>,
          the note the chord is named after and built on: C. So C major is 2C + E + G.{' '}
          <em>[press play]</em>
        </p>
        <p>
          <em>[Key press]</em> Now the other way around. Here is a chord. <em>[press play]</em> Which
          notes are in it, and how loud is each? We want to write u as a linear combination of the
          building blocks C, E, G, A. On Wednesday that meant solving a system, and with real
          sound data a huge one. <em>[let them guess]</em>
        </p>
        <p>
          <em>[Key press]</em> Answer: C + E + 2A, no G. The doubled note is the root: this is A
          minor. Today we will find these coefficients with one formula each, the{' '}
          <strong>Fourier formula</strong>. It works because different notes are perpendicular.
        </p>
        <p>
          <em>[Key press]</em> A real recording has noise. <em>[play noisy]</em> The recording x is no
          longer a combination of the notes: it is not in their span. Which chord is closest to it?{' '}
          <em>[Key press]</em> Here it is. <em>[play cleaned]</em> The hiss is gone, and the loudness of
          each note came back almost exactly: 2, 1, 1 and no A. Finding the closest vector in a span is
          a <strong>projection</strong>, the second topic of today. (If someone asks: the dot product of
          two waves is ∫₀¹ u(t)v(t) dt, and for different whole-number frequencies it is exactly 0.)
        </p>
      </Notes>
    </section>
  );
}
