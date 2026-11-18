import { useEffect, useRef, useState } from 'react';
import Fragment from './Fragment.jsx';
import film from '../assets/prism-film.mp4';
import first from '../assets/prism-film-first.jpg';
import last from '../assets/prism-film-last.jpg';

// The prism's film (the user's request: a much cooler version of The Spectral Theorem's picture, made
// with Blender; first on a slide of its own after it, then on The Spectral Theorem itself, under the
// box, in place of Prism.jsx's picture, cut to the strip that fits there): a glass prism on a walnut table in a sunlit room, between a
// board with a slit and a white screen; the sun comes out, a sheet of white light leaves the slit,
// crosses the prism and fans out into the pure colours, which land on the screen one above the other,
// while the camera pulls back from the prism to the whole table. Rendered by `blender/prism_film.py`
// (Cycles: the glass, the wood, the daylight and the depth of field are path-traced; the light's path
// is the deck's own optics, prismOptics.js, baked into a glowing volume), 172 frames of 1920 × 872 at
// 30 a second, encoded by `blender/encode.py`; its first and last frames are also images (the film
// before it plays, the last frame when the slide is reached from behind, and the stills in print).

// the picture on the slide (the film is 1920 × 872), and where the last frame shows the band of
// colours on the screen: its side nearer the camera, from red down to violet (the film's own numbers,
// `marks.json`, written with it; × 2/3)
export const W = 1280;
export const H = (W * 872) / 1920;
const X_NEAR = 1090.5;
const Y_RED = 276.8;
const Y_VIOLET = 412.3;
const BRACE_D = 9;
const X_BRACE = X_NEAR + 8;
// a brace from y1 down to y2, its tip pointing right, at the name
const brace = (x, y1, y2, d = BRACE_D) => {
  const m = (y1 + y2) / 2;
  return `M ${x} ${y1} Q ${x + d} ${y1} ${x + d} ${y1 + d} L ${x + d} ${m - d} Q ${x + d} ${m} ${x + 2 * d} ${m} Q ${x + d} ${m} ${x + d} ${m + d} L ${x + d} ${y2 - d} Q ${x + d} ${y2} ${x} ${y2}`;
};

/**
 * The film. Live: its first frame; at `lit` (the slide's key press) it plays, once, and stays on its
 * last frame; if `lit` is already on when the slide is reached (from the slide after it), or at
 * `named` (the next key press) before the film is over, the last frame at once. `still` (print): the
 * first frame (0) or the last (1), as an image. On key press `spectrum`: a brace beside the band of
 * colours, light spectrum. `height` and `top` cut the picture to a strip (in the slide's px, the film
 * being W wide): `height` tall, starting `top` below the film's top edge; without them, the whole film.
 */
export default function PrismFilm({ lit = false, named = false, still, spectrum, height = H, top = 0 }) {
  const video = useRef(null);
  const was = useRef(false);
  // 'before': the film at its start; 'film': playing, or over; 'after': the last frame, an image
  const [phase, setPhase] = useState('before');

  useEffect(() => {
    const v = video.current;
    if (still != null || !v) return;
    const rewind = () => {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {
        /* not loaded yet: it starts at 0 anyway */
      }
    };
    if (!lit) {
      rewind();
      setPhase('before');
    } else if (!was.current && !named) {
      rewind();
      setPhase('film');
      const playing = v.play();
      if (playing) playing.catch(() => setPhase('after'));
    } else if (named && !v.ended) {
      v.pause();
      setPhase('after');
    }
    was.current = lit;
  }, [lit, named, still]);

  return (
    <div
      className="l25-film"
      style={{ width: W, height }}
      role="img"
      aria-label="A glass prism on a wooden table in a sunlit room: a sheet of white light from a slit in a board crosses the prism and fans out into the pure colours, which land on a white screen one above the other, from red at the top down to violet: the light spectrum"
    >
      <div className="l25-film-frame" style={{ top: -top, height: H }}>
        {still != null ? (
          <img src={still ? last : first} alt="" />
        ) : (
          <>
            <video ref={video} src={film} poster={first} muted playsInline preload="auto" />
            <img src={last} alt="" style={{ opacity: phase === 'after' ? 1 : 0 }} />
          </>
        )}
        {spectrum != null && (
          <svg viewBox={`0 0 ${W} ${H}`}>
            <Fragment as="g" index={spectrum}>
              <path d={brace(X_BRACE, Y_RED, Y_VIOLET)} fill="none" stroke="#14213d" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <foreignObject x={X_BRACE + 2 * BRACE_D + 8} y={(Y_RED + Y_VIOLET) / 2 - 40} width={150} height={80} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                <div xmlns="http://www.w3.org/1999/xhtml" className="l25-film-name">
                  <span>light</span>
                  <span>spectrum</span>
                </div>
              </foreignObject>
            </Fragment>
          </svg>
        )}
      </div>
    </div>
  );
}
