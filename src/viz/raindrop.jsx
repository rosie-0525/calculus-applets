import { useState } from 'react';
import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import RaindropMap from '../lectures/l11/components/RaindropMap.jsx';
import { OCEANS } from '../lectures/l11/components/raindrop.js';
import { useTerrain } from '../lectures/l11/components/terrain.js';
import { Route, Crossings, closeUp, WIDTH, CLOSE_STILLS } from '../lectures/l11/slides/Slide16Raindrop.jsx';

export const lecture = 11;

const VIEWS = [
  ['whole', 'The whole map'],
  ['close', 'Close-up of the peak'],
];

/*
 * Where does a raindrop go?, without its title (the caption says where): the map around Triple
 * Divide Peak, where a click drops a raindrop that runs downhill, and beside it the rivers its
 * water takes to its ocean. On the slide, a key press tints the three watersheds and the next one
 * zooms into the peak; here a button shows the watersheds, and two more pick the whole map or the
 * close-up (the zoom is a fade-out fragment, which the page would not hide). On the close-up, a
 * drop from next to the peak, perpendicular to the level curves (the right angles), that stops in
 * a lake, with the slide's sentences beside it. The deck loads the elevation before it starts; here
 * the applet waits for it.
 */
export default function Raindrop() {
  const t = useTerrain('divide');
  const [view, setView] = useState('whole');
  const [tints, setTints] = useState(false);
  const [last, setLast] = useState(null);
  if (!t) return <div style={{ width: WIDTH + 300, height: (WIDTH * 396) / 407 }} />;

  return (
    <div className="viz-col">
      <div className="viz-toggle" role="group" aria-label="Which map">
        {VIEWS.map(([k, name]) => (
          <button key={k} type="button" className="viz-button" aria-pressed={view === k} onClick={() => setView(k)}>
            {name}
          </button>
        ))}
      </div>

      <div className="l10-drop-stage drop-stage">
        {view === 'whole' ? (
          <RaindropMap key="whole" width={WIDTH} tints={tints} onDrop={(d) => setLast(d.ocean)} />
        ) : (
          <RaindropMap key="close" width={WIDTH} crop={closeUp(t)} stills={CLOSE_STILLS} preset labels={false}>
            {(p, tt, drops) => <Crossings p={p} t={tt} drop={drops[drops.length - 1]} />}
          </RaindropMap>
        )}

        {view === 'whole' ? (
          <div className="l10-drop-sides drop-side">
            <div className="viz-toggle drop-tints">
              <button type="button" className="viz-button" aria-pressed={tints} onClick={() => setTints((v) => !v)}>
                {tints ? 'Hide the watersheds' : 'Show the watersheds'}
              </button>
            </div>
            <div className="l10-drop-side">
              {tints && (
                <ul className="l10-oceans">
                  {[OCEANS[17], OCEANS[10], OCEANS['09']].map((o) => (
                    <li key={o.name} style={{ '--ocean': o.color }}>
                      {o.name}
                    </li>
                  ))}
                </ul>
              )}
              {last && <Route ocean={last} />}
            </div>
          </div>
        ) : (
          <div className="l10-drop-sides drop-side">
            <div className="l10-drop-side l10-drop-back">
              <p>
                <Tex tex={r`E(x,y)=`} /> elevation.
              </p>
              <p>
                The drop moves in the direction of <Tex tex={r`-\nabla E`} />,
              </p>
              <p>perpendicular to the level curves,</p>
              <p>
                and stops in a lake: a <strong>local minimum</strong> of <Tex tex="E" />.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
