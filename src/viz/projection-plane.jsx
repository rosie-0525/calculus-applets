import '../lectures/l5/styles/deck.css';
import { TheoremFigure } from '../lectures/l5/slides/Slide18ProjectionTheorem.jsx';
import { DifferenceFigure } from '../lectures/l5/slides/Slide19ProjectionProperties.jsx';

export const lecture = 5;

export default function ProjectionPlane() {
  return (
    <div className="viz-row">
      <TheoremFigure />
      <DifferenceFigure />
    </div>
  );
}
