import '../lectures/l11/styles/deck.css';
import { useTerrain } from '../lectures/l11/components/terrain.js';
import { LombardMap, LombardPhoto } from '../lectures/l11/slides/Slide14Lombard.jsx';

export const lecture = 11;

const MAP_W = 330; // as on the slide: the map turned a quarter turn, 330 × 455, and the photo cropped to it
const MAP_H = 455;

/*
 * Lombard Street, as on Why does the gradient point in the direction of fastest increase?, with
 * every step showing, without the derivation (the caption of Direction of fastest increase gives
 * it): the photo and the map of Russian Hill side by side, the map turned a quarter turn clockwise
 * so that ∇E points up as in the photo, with ∇E at P, u (turned by dragging on the map) and the
 * zigzag route; beside them the grades in the direction of ∇E, of u, and along the route. The deck
 * loads the elevation before it starts; here the applet waits for it.
 */
export default function Lombard() {
  const t = useTerrain('lombard');
  if (!t) return <div style={{ width: 2 * MAP_W + 340, height: MAP_H }} />;
  return (
    <div className="l10-sw">
      <LombardMap at={1} width={MAP_W} rotate>
        {(map, read) => (
          <div className="l10-sw-stage">
            <div className="l10-sw-pics">
              <LombardPhoto className="l10-sw-photo" />
              {map}
            </div>
            <div className="l10-sw-left">
              <div className="l10-sw-read">{read}</div>
            </div>
          </div>
        )}
      </LombardMap>
    </div>
  );
}
