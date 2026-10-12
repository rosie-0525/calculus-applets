import '../lectures/l9/styles/deck.css';
import { GGraph, GContour, Classified } from '../lectures/l9/components/ExampleG.jsx';

export const lecture = 9;

/* The first picture of Preview, at the size of Example 1's: the graph of g, with its level curves
   on it, and its contour plot, every level labelled, the local maximum, the local minimum and the
   two saddle points labelled on both. */
export default function ClassifyContour() {
  return (
    <div className="exg-figs">
      <GGraph scale={0.9} marks={[1, 2]} />
      <GContour width={384}>{(p) => <Classified p={p} index={[1, 2]} />}</GContour>
    </div>
  );
}
