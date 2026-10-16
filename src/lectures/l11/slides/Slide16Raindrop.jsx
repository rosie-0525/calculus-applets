import { useState } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import RaindropMap from '../components/RaindropMap.jsx';
import { OCEANS } from '../components/raindrop.js';
import { heightAt, useTerrain } from '../components/terrain.js';

export const WIDTH = 560; // both maps
// the drops of the PDF on the whole map, one into each watershed (grid pixels near the peak)
export const STILLS = [
  [196, 166],
  [183, 199],
  [216, 190],
];
export const CLOSE_STILLS = [[200, 187]]; // on the close-up: a drop from next to the peak that ends in the lake
export const INK = '#14213d';

/**
 * The close-up: Triple Divide Peak and the lake to its south-east, 90 pixels of the grid wide, in
 * the shape of the whole map, so that the whole map zooms into it exactly.
 */
export function closeUp({ W, H }) {
  const w = 90;
  const h = (w * H) / W;
  return [176, 196.5 - h / 2, 176 + w, 196.5 + h / 2];
}

/** The route of a drop's water, river by river, down to its ocean. */
export function Route({ ocean }) {
  return (
    <ul className="l10-route" style={{ '--ocean': ocean.color }}>
      {ocean.route.map((rv, k) => (
        <li key={rv} className={k === ocean.route.length - 1 ? 'sea' : undefined}>
          {k > 0 && <span className="arr">↓</span>}
          {rv}
        </li>
      ))}
    </ul>
  );
}

/**
 * The right-angle marks where the downhill part of a drop's path crosses the level curves (every
 * 50 m).
 */
export function Crossings({ p, t, drop }) {
  if (!drop) return null;
  const pts = drop.gridPts.slice(0, drop.down);
  const marks = [];
  for (let k = 1; k < pts.length; k += 1) {
    const e0 = heightAt(t, ...pts[k - 1]);
    const e1 = heightAt(t, ...pts[k]);
    const c = Math.floor(e0 / 50) * 50;
    if (e1 < c) {
      const [x, y] = [p.px(pts[k][0]), p.py(pts[k][1])];
      const back = pts[Math.max(0, k - 3)];
      const dx = x - p.px(back[0]);
      const dy = y - p.py(back[1]);
      const len = Math.hypot(dx, dy) || 1;
      const u = [(-dx / len) * 9, (-dy / len) * 9]; // back along the path
      const v = [-u[1], u[0]]; // along the level curve
      marks.push(<path key={k} d={`M ${x + u[0]} ${y + u[1]} l ${v[0]} ${v[1]} l ${-u[0]} ${-u[1]}`} fill="none" stroke={INK} strokeWidth="1.8" />);
    }
  }
  return <g>{marks}</g>;
}

/**
 * Where does a raindrop go? (after How do 300 units find their way?; it was also the opener, Slide02Raindrop.jsx): the map
 * around Triple Divide Peak, Glacier National Park (real elevation). A click drops a raindrop, which
 * runs downhill to a lake or off the map, and the name of its ocean appears; beside the map, the
 * rivers its water takes. Key press 1: the three watersheds of the USGS, tinted, with their oceans:
 * they meet at the peak. Key press 2: the map zooms into the peak and the lake south-east of it (a
 * click drops a raindrop there too; the PDF, and the close-up before any click, show one that ends
 * in the lake); the drop moves along −∇E. Key press 3: perpendicular to the level curves (the right
 * angles, at each level curve it crosses). Key press 4: in a lake it stops: a local minimum of
 * E.
 */
export default function Slide16Raindrop() {
  const t = useTerrain('divide');
  const [last, setLast] = useState(null);
  const crop = closeUp(t);
  // the zoom: a scale about the one point that stays put, which takes the whole map onto the close-up
  const s = t.W / (crop[2] - crop[0]);
  const k = WIDTH / (crop[2] - crop[0]);
  const origin = `${(crop[0] * k) / (s - 1)}px ${(crop[1] * k) / (s - 1)}px`;

  return (
    <section className="l10-drop">
      <h2>Where does a raindrop go?</h2>
      <p className="l10-sub">Triple Divide Peak, Glacier National Park, Montana</p>

      <div className="l10-drop-stage">
        <div className="l10-stack l10-zoom">
          <Fragment index={2} effect="fade-out" className="l10-zoom-whole" style={{ '--zoom-s': s, '--zoom-o': origin }}>
            <RaindropMap width={WIDTH} tints={1} stills={STILLS} onDrop={(d) => setLast(d.ocean)} />
          </Fragment>
          <Fragment index={2} className="l10-zoom-close">
            <RaindropMap width={WIDTH} crop={crop} stills={CLOSE_STILLS} preset labels={false}>
              {(p, tt, drops) => (
                <Fragment as="g" index={3}>
                  <Crossings p={p} t={tt} drop={drops[drops.length - 1]} />
                </Fragment>
              )}
            </RaindropMap>
          </Fragment>
        </div>

        <div className="l10-stack l10-drop-sides">
          <Fragment index={2} effect="fade-out" className="l10-drop-side">
            {last && <Route ocean={last} />}
            <Fragment index={1} as="ul" className="l10-oceans">
              {[OCEANS[17], OCEANS[10], OCEANS['09']].map((o) => (
                <li key={o.name} style={{ '--ocean': o.color }}>
                  {o.name}
                </li>
              ))}
            </Fragment>
          </Fragment>

          <Fragment index={2} className="l10-drop-side l10-drop-back">
            <p>
              <Tex tex={r`E(x,y)=`} /> elevation.
            </p>
            <p>
              The drop moves in the direction of <Tex tex={r`-\nabla E`} />,
            </p>
            <Fragment index={3} as="p">
              perpendicular to the level curves,
            </Fragment>
            <Fragment index={4} as="p">
              and stops in a lake: a <strong>local minimum</strong> of <Tex tex="E" />.
            </Fragment>
          </Fragment>
        </div>
      </div>
    </section>
  );
}
