import '../lectures/l1/styles/deck.css';
import Tex from '../lectures/l1/components/Tex.jsx';
import { WebFigure } from '../lectures/l1/slides/Slide10HigherDimensions.jsx';

export const lecture = 1;
export const zoom = 1.3;

/* The slide's first example, Google Search, without its title (the applet's title says it). */
export default function PageRank() {
  return (
    <div className="dims-card hd-card">
      <WebFigure />
      <ul className="bullets dims-bullets">
        <li>
          A toy internet with only 5 pages can be represented by <Tex tex="(0.21,\ 0.38,\ 0.19,\ 0.12,\ 0.10)" />,
          with numbers indicating the “importance” of each webpage.
        </li>
        <li>
          For the real web, we will need a vector with <strong>hundreds of billions</strong> of entries.
        </li>
      </ul>
    </div>
  );
}
