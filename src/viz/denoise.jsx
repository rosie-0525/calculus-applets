import '../lectures/l5/styles/deck.css';
import Tex, { r } from '../lectures/l5/components/Tex.jsx';
import { GRAY, NOTES, BASIS, NOISY, CLEAN_AMPS, CLEANED, HISS, note, mix, Track, Wave, combo } from '../lectures/l5/components/Sound.jsx';
import { NOTE_W } from '../lectures/l5/slides/Slide02Motivation.jsx';
import { DenoiseFigure, CARDINAL, TEAL, fmt, SPLIT_W } from '../lectures/l5/slides/Slide23Sound.jsx';

export const lecture = 5;

/* the four notes, which are orthogonal; then x = Proj_V(x) + (x − Proj_V(x)), and the picture. The
   slide's middle column, the projections onto each note, is left out. */
export default function Denoise() {
  return (
    <div className="viz-col">
      <div className="sound-panel notes-panel">
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

      <div className="denoise">
        <div className="split-col">
          {[
            { op: '', samples: NOISY, cls: '', color: GRAY, thin: true, tex: r`\vv{x}`, what: 'recording, with noise' },
            { op: '=', fn: mix(CLEAN_AMPS), samples: CLEANED, cls: 'teal', color: TEAL, tex: r`\operatorname{Proj}_V(\vv{x})=${combo(CLEAN_AMPS, fmt)}`, what: 'denoised chord' },
            { op: '+', samples: HISS, cls: 'red', color: CARDINAL, thin: true, tex: r`\vv{x}-\operatorname{Proj}_V(\vv{x})`, what: 'noise' },
          ].map(({ op, fn, samples, cls, color, thin, tex, what }) => (
            <div key={what} className="split-line">
              <span className="split-op">{op && <Tex tex={op} />}</span>
              <div className="sound-panel denoise-card">
                <Track
                  samples={samples}
                  label={`the ${what}`}
                  captionClassName={`split-caption ${cls}`}
                  caption={
                    <>
                      <Tex tex={tex} />
                      <br />
                      {what}
                    </>
                  }
                >
                  <Wave
                    {...(fn ? { fn } : { samples })}
                    width={SPLIT_W}
                    height={58}
                    color={color}
                    stroke={thin ? 1.4 : undefined}
                    label={`The ${what}`}
                  />
                </Track>
              </div>
            </div>
          ))}
        </div>

        <div className="stage-fig">
          <DenoiseFigure />
        </div>
      </div>
    </div>
  );
}
