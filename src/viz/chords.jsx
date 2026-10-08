import { useMemo } from 'react';
import '../lectures/l5/styles/deck.css';
import Tex, { r } from '../lectures/l5/components/Tex.jsx';
import { NOTES, BASIS, C_MAJOR, A_MINOR, note, mix, sample, Track, Wave, chord } from '../lectures/l5/components/Sound.jsx';
import { NOTE_W, CHORD_W } from '../lectures/l5/slides/Slide02Motivation.jsx';

export const lecture = 5;

/* The first two panels of the lecture's motivation: the notes, then two chords made of them. The
   slide's mystery chord is A minor, shown here with its answer. */
const CHORDS = [
  { name: 'C major', amps: C_MAJOR },
  { name: 'A minor', amps: A_MINOR },
];

export default function Chords() {
  const sounds = useMemo(() => CHORDS.map(({ amps }) => sample(mix(amps))), []);
  return (
    <div className="viz-col chords">
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

      <div className="sound-panel">
        <p className="panel-title">Adding notes makes a chord</p>
        <div className="chord-tracks">
          {CHORDS.map(({ name, amps }, i) => (
            <Track
              key={name}
              samples={sounds[i]}
              label={`the ${name} chord`}
              caption={
                <>
                  {name}: <Tex tex={chord(amps)} />
                </>
              }
            >
              <Wave fn={mix(amps)} width={CHORD_W} label={`The ${name} chord`} />
            </Track>
          ))}
        </div>
      </div>
    </div>
  );
}
