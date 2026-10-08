import '../lectures/l4/styles/deck.css';
import { EYES } from '../lectures/l4/slides/Slide02Motivation.jsx';
import { EyeBasis } from '../lectures/l4/slides/Slide15aBackToColors.jsx';

export const lecture = 4;

export default function ColorDimension() {
  return (
    <div className="end-eyes">
      {EYES.map((eye, i) => (
        <EyeBasis key={eye.key} eye={eye} index={i + 1} />
      ))}
    </div>
  );
}
