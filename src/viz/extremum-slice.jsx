import '../lectures/l9/styles/deck.css';
import { CutGraph } from '../lectures/l9/slides/Slide06Theorem.jsx';

export const lecture = 9;

/* The slide's last picture, without the theorem and its proof (the caption says why): the graph of
   Local maximum and minimum over the xy-plane, cut through its peak by the plane y = b, and the
   slice f(x, b) with its horizontal tangent line at the peak. */
export default function ExtremumSlice() {
  return <CutGraph slice title="The graph cut by the vertical plane y = b through the peak: the slice f(x, b) has a maximum there, with a horizontal tangent line" />;
}
