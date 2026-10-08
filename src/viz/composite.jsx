import '../lectures/l7/styles/deck.css';
import { HelixFigure } from '../lectures/l7/slides/Slide19Composite.jsx';

export const lecture = 7;

/* The slide's figure (the functions are named in the caption): f runs along the helix (red), and
   g ∘ f below it around the circle (teal). */
export default function Composite() {
  return <HelixFigure shadowAt={1} />;
}
