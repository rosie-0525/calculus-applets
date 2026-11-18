import { useEffect, useRef, useState } from 'react';
import '../lectures/l25/styles/deck.css';
import PrismFilm from '../lectures/l25/components/PrismFilm.jsx';
import { useFragmentSteps } from './redundancies.jsx';

export const lecture = 25;

// how long the film runs (172 frames at 30 a second): the brace comes when it ends, or after this
// and a little more if the film cannot play (PrismFilm then shows its last frame)
const FILM_MS = 5733;

/*
 * The Spectral Theorem's film (PrismFilm.jsx, made with Blender), without the slide's title and its
 * box (the caption has what the box says): a glass prism on a walnut table in a sunlit room, between
 * a board with a slit and a white screen; white light comes through the slit, crosses the prism and
 * fans out into the pure colours, which land on the screen one above the other, while the camera
 * pulls back. On the slide it is cut to the strip under the box, appears on a key press and plays,
 * and the brace "light spectrum" comes on the next one; here it is the whole film, its first frame
 * until Play, and the brace comes once it has played (Play again starts it over).
 */
export default function SpectralPrism() {
  const ref = useRef(null);
  const [run, setRun] = useState(0);
  const [over, setOver] = useState(false);
  useEffect(() => {
    if (!run) return undefined;
    setOver(false);
    const done = () => setOver(true);
    const video = ref.current?.querySelector('video');
    video?.addEventListener('ended', done);
    const timer = setTimeout(done, FILM_MS + 4000);
    return () => {
      video?.removeEventListener('ended', done);
      clearTimeout(timer);
    };
  }, [run]);
  // the brace, the slide's key press 2, once the film is over
  useFragmentSteps(ref, over ? 2 : 1);
  return (
    <div className="viz-col sp-film" ref={ref}>
      <PrismFilm key={run} lit={run > 0} spectrum={2} />
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setRun((n) => n + 1)}>
          {run ? 'Play again' : 'Play'}
        </button>
      </div>
    </div>
  );
}
