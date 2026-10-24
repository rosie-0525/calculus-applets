import { useEffect, useState } from 'react';
import '../lectures/l14/styles/deck.css';
import Tex, { r } from '../lectures/l14/components/Tex.jsx';
import Slider from '../lectures/l14/components/Slider.jsx';
import RotationPicture from '../lectures/l14/components/Rotation.jsx';
import { useTween } from '../lectures/l14/components/useFragmentTween.js';

export const lecture = 14;

// what the picture shows: v and R_θ(v); the parallelogram of v and w and its rotation (the
// textbook's Figure 14.4.1), built both ways; v, cv and their rotations, built both ways
const PARTS = [
  ['single', r`R_\theta(\vv v)`],
  ['pair', r`R_\theta(\vv v+\vv w)=R_\theta(\vv v)+R_\theta(\vv w)`],
  ['scale', r`R_\theta(c\vv v)=c\,R_\theta(\vv v)`],
];

// when the right side of an identity starts to build (the slide's next key press), after the left
// side has (by 2.8 s for the pair, 2.9 s for cv)
const SPLIT = 3300;

/**
 * The picture of `part` with θ, built both ways from its mount with the slide's tweens
 * (Slide07Rotations.jsx): the left side of the identity (v + w, then R_θ(v + w); cv, then R_θ(cv)),
 * then, SPLIT ms later, the right side (R_θ(v) and R_θ(w), then their parallelogram; R_θ(v), then
 * c R_θ(v)). RotationPicture puts the right side in the fragment `splitIndex`, which the page would
 * show from the start: `rot-split` shows it (site.css).
 */
function Build({ part, theta }) {
  const [split, setSplit] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSplit(true), SPLIT);
    return () => clearTimeout(timer);
  }, []);
  const pair = part === 'pair';
  const scale = part === 'scale';
  const staged = {
    sum: useTween(pair, { ms: 700, delay: 300 }),
    turn: useTween(pair, { ms: 1500, delay: 1300 }),
    splitIndex: 3,
    turnParts: useTween(pair && split, { ms: 1500, delay: 300 }),
    add: useTween(pair && split, { ms: 700, delay: 2000 }),
  };
  const scaled = {
    grow: useTween(scale, { ms: 900, delay: 300 }),
    turn: useTween(scale, { ms: 1500, delay: 1400 }),
    splitIndex: 6,
    turnV: useTween(scale && split, { ms: 1500, delay: 300 }),
    stretch: useTween(scale && split, { ms: 900, delay: 2000 }),
  };
  return (
    <div className={`rot-build${split ? ' rot-split' : ''}`}>
      <RotationPicture theta={theta} single={part === 'single'} pair={pair && { staged }} scale={scale && { staged: scaled }} unit={132} />
    </div>
  );
}

/*
 * Rotations of ℝ² without its words (the caption says them): the picture and the slider for θ. On
 * the slide the picture shows v and R_θ(v), then builds R_θ(v + w) = R_θ(v) + R_θ(w) both ways, then
 * R_θ(cv) = c R_θ(v), a key press for each side; here the buttons pick one of the three, and an
 * identity builds both ways, one side after the other, when its button is pressed (and on Replay).
 */
export default function RotationsLinear() {
  const [theta, setTheta] = useState(40);
  const [part, setPart] = useState('single');
  const [run, setRun] = useState(0);
  const pick = (k) => {
    setPart(k);
    setRun((n) => n + 1);
  };
  return (
    <div className="viz-col l14-rot-fig">
      <div className="viz-toggle" role="group" aria-label="What the picture shows">
        {PARTS.map(([k, tex]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={part === k} onClick={() => pick(k)}>
            <Tex tex={tex} />
          </button>
        ))}
      </div>
      <Build key={`${part}-${run}`} part={part} theta={theta} />
      <div className="l14-rot-controls">
        <Slider name="θ" label={<Tex tex={r`\theta`} />} value={theta} onChange={setTheta} min={0} max={360} step={1} format={(v) => `${v}°`} />
        {part !== 'single' && (
          <button type="button" className="viz-button" onClick={() => pick(part)}>
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
