import '../lectures/l9/styles/deck.css';
import { SaddleGraph, X_LINE, Y_LINE } from '../lectures/l9/slides/Slide08Saddle.jsx';

export const lecture = 9;

/* The slide's last picture, without the definition beside it (the caption says what the curves
   are): the graph of x² − y², with the curves over the x-axis (x², red) and the y-axis (−y², green). */
export default function SaddlePoint() {
  return <SaddleGraph lines={[X_LINE, Y_LINE]} title="The graph of x² − y² with the curves over the x-axis (a minimum at 0) and over the y-axis (a maximum at 0)" />;
}
