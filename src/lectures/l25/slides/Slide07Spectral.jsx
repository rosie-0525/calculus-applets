import Tex, { r } from '../components/Tex.jsx';
// import Prism from '../components/Prism.jsx';
import PrismFilm from '../components/PrismFilm.jsx';
import Fragment from '../components/Fragment.jsx';
import { useMarkers } from '../components/Staged.jsx';
import { PRINT } from '../components/print.js';

/**
 * The Spectral Theorem (Mark's box, the textbook's Theorem 24.1.4; the slide's title names it, so the
 * box has no title): on arrival, a symmetric n × n matrix has an orthogonal basis w₁, …, wₙ of ℝⁿ
 * consisting of eigenvectors (the user's request: only that, too many words; Mark's two more sentences,
 * that λ₁, …, λₙ are all of the eigenvalues of A and that eigenvectors for distinct eigenvalues are
 * orthogonal, removed: the second is on Orthogonal eigenvectors, its Why?). Under it, why
 * "spectral" (the user's request, in place of T_A stretching the plane along w₁, then along w₂; then
 * white light, no 2 × 2 matrix; then no A, the user's request: it was A = −d²/dt², with the pure
 * colours its eigenvectors; then no labels "white light" and "pure colours", the user's request; then
 * realistic and artistically appealing, the user's request: the light computed, see Prism.jsx; then
 * no dark background, the prism point up on a table, white light shining from a window, the user's
 * request; then the light natural, and shining on the wall instead of the table, the user's request;
 * then a three.js scene like Lecture 9's train over Donner Pass, the user's request: PrismScene.js;
 * then that animation commented out and the film rendered with Blender in its place, the user's
 * request: PrismFilm.jsx, cut to the strip that fits under the box; then the film appears on a key
 * press and plays by itself, the user's request: it was there on arrival, its first frame). Key
 * press 1: the film appears and plays: a glass prism on a wooden table in a sunlit room, between a
 * board with a slit and a white screen; white light comes through the slit, crosses the prism and
 * splits into the pure colours, which land on the screen, one above the other, while the camera
 * pulls back; 2: a brace beside them, light spectrum (the user's words; it was spectrum of A).
 * Print: the film's last frame.
 */
// the strip of the film under the box: as wide as the slide, FILM_H tall, starting FILM_TOP below
// the film's top edge (the wall above and the table in front are cut; the prism, the light and the
// colours stay in it from the first frame to the last)
export const FILM_H = 410;
export const FILM_TOP = 147;
export default function Slide07Spectral() {
  const [markers, on] = useMarkers([1, 2]);
  return (
    <section>
      <h2>The Spectral Theorem</h2>
      {markers}

      <div className="block theorem l25-spec-box">
        <p>
          If <Tex tex="A" /> is a symmetric <Tex tex={r`n\times n`} /> matrix, there is an orthogonal basis <Tex tex={r`\vv w_1,\dots,\vv w_n`} /> of{' '}
          <Tex tex={r`\mathbb R^n`} /> consisting of eigenvectors for <Tex tex="A" />.
        </p>
        <p className="pointer corner">(→ Theorem 24.1.4)</p>
      </div>

      {/* the three.js animation (Prism.jsx; it needs Prism and Stills imported), commented out by the
          user: the Blender film instead
      <div className="l25-prism">
        {PRINT ? (
          <Stills
            stills={[
              { node: <Prism still={0} spectrum={2} /> },
              { at: 1, node: <Prism still={1} spectrum={2} /> },
            ]}
          />
        ) : (
          <Prism lit={on[0]} spectrum={2} />
        )}
      </div>
      */}
      <Fragment index={1} className="l25-prism">
        {PRINT ? (
          <PrismFilm still={1} spectrum={2} height={FILM_H} top={FILM_TOP} />
        ) : (
          <PrismFilm lit={on[0]} named={on[1]} spectrum={2} height={FILM_H} top={FILM_TOP} />
        )}
      </Fragment>
    </section>
  );
}
