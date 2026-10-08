import { useEffect, useRef, useState } from 'react';
import Tex, { r } from './Tex.jsx';
import Engine from '../game3d/engine.js';

/**
 * The 3-D shooter of slide 2b: a WebGL canvas (src/game3d) under a HUD of
 * plain DOM. React draws the HUD once; the engine fills in the numbers and
 * moves the crosshair and the tags every frame through `hud`.
 *
 * Mouse: move to aim, click to fire (hold for more), right-click or
 * shift-click to fire in the bullet cam. Left alone, it plays itself.
 * `eyebrow` is the small line above the title.
 */
export default function RoofGame3D({ eyebrow = 'Motivation · now in 3D' }) {
  const canvasRef = useRef(null);
  const hud = useRef({ chips: [], pops: [] });
  const engineRef = useRef(null);
  const [opts, setOpts] = useState({ math: false, cam: false, sound: true }); // math: the Σ button, off at first
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let engine;
    try {
      engine = new Engine(canvasRef.current, hud.current, opts);
      engineRef.current = engine;
      if (import.meta.env.DEV) window.roofGame = engine; // for poking at it from the console
      engine.start();
    } catch (err) {
      console.error('3-D game unavailable:', err);
      setFailed(true);
    }
    return () => {
      engine?.dispose();
      engineRef.current = null;
    };
    // the engine is created once; option changes go through setOptions below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setOptions(opts);
  }, [opts]);

  const ref = (key) => (el) => {
    hud.current[key] = el;
  };
  const toggle = (key) => (e) => {
    e.stopPropagation();
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  };

  return (
    <div className="g3d" ref={ref('root')} data-prevent-swipe>
      <canvas
        ref={canvasRef}
        className="g3d-canvas"
        width="1280"
        height="720"
        role="img"
        aria-label="A 3-D shooter game: robots hide behind blocks whose sloping tops are pieces of planes. Move the mouse to aim, click to fire."
      />
      <div className="g3d-vignette" />
      <div className="g3d-bar top" />
      <div className="g3d-bar bottom" />

      <header className="g3d-head">
        <p className="g3d-eyebrow">{eyebrow}</p>
        <h2 className="g3d-title">Can you hit the enemy?</h2>
      </header>

      <div className="g3d-score">
        <span className="g3d-demo">● DEMO</span>
        <span className="g3d-count hit">
          HITS <b ref={ref('hits')}>0</b>
        </span>
        <span className="g3d-count blocked">
          BLOCKED <b ref={ref('blocked')}>0</b>
        </span>
      </div>

      <div className="g3d-buttons">
        <button type="button" className={opts.math ? 'on' : ''} onClick={toggle('math')} onPointerDown={(e) => e.stopPropagation()}>
          <Tex tex={r`\Sigma`} /> math
        </button>
        <button type="button" className={opts.cam ? 'on' : ''} onClick={toggle('cam')} onPointerDown={(e) => e.stopPropagation()}>
          ◉ bullet cam
        </button>
        <button type="button" className={opts.sound ? 'on' : ''} onClick={toggle('sound')} onPointerDown={(e) => e.stopPropagation()}>
          ♪ sound
        </button>
      </div>

      <aside className="g3d-panel">
        <p className="g3d-panel-title">Live math · the roof you are aiming at</p>
        <div className="row">
          <span className="lab">your bolt</span>
          <span className="val">
            <Tex tex={r`\vv{x}(t)=\vv{p}+t\,\vv{v}`} />
            <span className="unit">t in seconds</span>
          </span>
        </div>
        <div className="row sub">
          <span className="lab" />
          <span className="val">
            <Tex tex={r`\vv{p}`} /> = <span className="num" ref={ref('p')} />
          </span>
        </div>
        <div className="row sub">
          <span className="lab" />
          <span className="val">
            <Tex tex={r`\vv{v}`} /> = <span className="num" ref={ref('v')} />
          </span>
        </div>
        <div className="row">
          <span className="lab">roof</span>
          <span className="val num eq" ref={ref('plane')} />
        </div>
        <div className="row">
          <span className="lab">enemy head</span>
          <span className="val" ref={ref('headVal')}>
            <Tex tex="ax+by+cz" /> = <span className="num" ref={ref('head')} /> <b ref={ref('headCmp')} />{' '}
            <Tex tex="d" />
          </span>
        </div>
        <div className="row sub">
          <span className="lab" />
          <span className="verdict" ref={ref('headVerdict')} />
        </div>
        <div className="row">
          <span className="lab">crossing</span>
          <span className="val">
            <Tex tex={r`\vv{n}\cdot(\vv{p}+t\,\vv{v})=d`} /> at <Tex tex="t" /> ={' '}
            <span className="num" ref={ref('tStar')} />
          </span>
        </div>
        <div className="row sub">
          <span className="lab" />
          <span className="verdict" ref={ref('lineVerdict')} />
        </div>
      </aside>

      <div className="g3d-layer">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="g3d-chip"
            data-state="hidden"
            ref={(el) => {
              hud.current.chips[i] = el;
            }}
          >
            <span className="v" />
            <span className="w" />
          </div>
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="g3d-pop"
            ref={(el) => {
              hud.current.pops[i] = el;
            }}
          />
        ))}
        <div className="g3d-cross" data-state="none" ref={ref('cross')}>
          <svg viewBox="-32 -32 64 64" width="64" height="64" aria-hidden="true">
            <circle r="15" fill="none" strokeWidth="2" />
            <path d="M 0 -27 V -19 M 0 19 V 27 M -27 0 H -19 M 19 0 H 27" strokeWidth="2.5" strokeLinecap="round" />
            <circle r="2.2" stroke="none" />
          </svg>
          <span className="lab" ref={ref('crossLabel')} />
        </div>
      </div>

      <div className="g3d-callout" ref={ref('callout')}>
        <p className="t" ref={ref('calloutTitle')} />
        <p className="b" ref={ref('calloutBody')} />
      </div>

      <div className="g3d-camhud">
        <span className="rec">● BULLET CAM</span>
        <span className="eq">
          <Tex tex={r`\vv{x}(t)=\vv{p}+t\,\vv{v}=`} /> <span className="num" ref={ref('camX')} />
        </span>
        <span className="tt">
          <Tex tex="t" /> = <span className="num" ref={ref('camT')} /> s
        </span>
      </div>

      <div className="g3d-intro">
        <p className="big">Can you hit the enemy?</p>
        <p className="small">Every bolt flies along a line. Every roof is a piece of a plane.</p>
      </div>

      <p className="g3d-hint">
        <span className="idle">DEMO · move the mouse over the game to take over</span>
        <span className="user">click to fire · hold for more · right-click or shift-click: bullet cam</span>
      </p>

      {failed && (
        <div className="g3d-fail">
          <p>This browser could not start WebGL, so the 3-D game cannot run here.</p>
          <p>The 2-D version is on the previous slide.</p>
        </div>
      )}
    </div>
  );
}
