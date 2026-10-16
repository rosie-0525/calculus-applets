import { useEffect, useMemo, useRef, useState } from 'react';
import '../lectures/l11/styles/deck.css';
import Tex, { r } from '../lectures/l11/components/Tex.jsx';
import Slider from '../lectures/l11/components/Slider.jsx';
import { confidences } from '../lectures/l11/components/digits.js';
import { getDigits, loadDigits } from '../lectures/l11/components/digitsData.js';
import { inkColor, pngOf } from '../lectures/l11/components/digitPics.js';
import { start, stepFrom, DrawPad, EGraph, Bars, PAIRS } from '../lectures/l11/slides/Slide19bDigits.jsx';

export const lecture = 11;

/** The slide's demo, once the digits have arrived. */
function Demo() {
  const [rate, setRate] = useState(0.5);
  const [st, setSt] = useState(start);
  const [running, setRunning] = useState(false);
  const [x, setX] = useState(null);
  const clearRef = useRef(() => {});

  // the slide's Run: a step every 90 ms, up to step 500 (or until E is no longer a number)
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setSt((s) => {
        const next = stepFrom(s, rate);
        if (next.n >= 500 || !Number.isFinite(next.E)) setRunning(false);
        return next;
      });
    }, 90);
    return () => clearInterval(id);
  }, [running, rate]);

  const pairs = useMemo(() => {
    const { train } = getDigits();
    return Array.from({ length: PAIRS }, (_, k) => ({ src: pngOf(train.img(k), (v) => inkColor(v / 255)), label: train.y[k] }));
  }, []);
  const P = useMemo(() => (x ? confidences(st.w, x) : null), [x, st.w]);
  const blur = (e) => e.currentTarget.blur();

  return (
    <div className="l10-dg">
      <div className="l10-dg-row">
        <div className="l10-dg-left">
          <div className="l10-dg-fn">
            <p>
              <span className="l10-dg-tag">Function</span>
              <Tex tex={r`f(\vv x)`} /> with a lot of parameters
            </p>
            <div className="l10-dg-io">
              <div>
                <p className="l10-dg-head">
                  input <Tex tex={r`\vv x`} />: your drawing
                </p>
                <div className="l10-dg-inrow">
                  <Tex tex={r`\vv x=`} />
                  <div>
                    <div className="l10-dg-padbox">
                      <DrawPad onImage={setX} clearRef={clearRef} />
                      {!x && <span className="l10-dg-hint">draw a digit</span>}
                    </div>
                    <div className="l10-dg-padbar">
                      <button type="button" onPointerUp={blur} onClick={() => clearRef.current()}>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="l10-dg-arrow">
                <Tex tex="f" />
                <svg width="60" height="16" viewBox="0 0 60 16" aria-hidden="true">
                  <line x1="2" y1="8" x2="46" y2="8" stroke="#14213d" strokeWidth="2.5" />
                  <polygon points="58,8 44,2 44,14" fill="#14213d" />
                </svg>
              </div>
              <div>
                <p className="l10-dg-head">output: probabilities</p>
                <Bars P={P} />
              </div>
            </div>
          </div>

          <div className="l10-dg-data">
            <p>
              <span className="l10-dg-tag">Data</span>5,000 images with their correct labels:
            </p>
            <p className="l10-dg-pairs">
              {pairs.map(({ src, label }, k) => (
                <span key={k}>
                  <Tex tex={`(\\vv x_${k + 1},y_${k + 1})=\\big(`} />
                  <img src={src} alt={`A handwritten ${label}`} />
                  <Tex tex={`,\\,${label}\\big)${k < PAIRS - 1 ? ',' : ',\\ \\dots'}`} />
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="l10-dg-right">
          <div>
            <p>
              <span className="l10-dg-tag">Error</span>
              <Tex tex="E" /> = total error of the prediction <Tex tex={r`f(\vv x_i)`} />{' '}
              <span className="l10-dg-nowrap">
                versus the truth <Tex tex="y_i" />
              </span>
            </p>
            <div className="l10-dg-graphbox">
              <EGraph hist={st.hist} />
              <p className="l10-dg-read l10-dg-now">
                step {st.n}: <Tex tex={`E=${st.E.toFixed(3)}`} />
              </p>
            </div>
          </div>

          <div>
            <p className="l10-dg-min">
              <span className="l10-dg-tag">Minimize</span>
              <Tex tex="E" /> by gradient descent
            </p>
            <div className="l10-ai-controls l10-dg-controls">
              <button type="button" onPointerUp={blur} onClick={() => setSt((s) => stepFrom(s, rate))} disabled={!Number.isFinite(st.E)}>
                Step
              </button>
              <button type="button" onPointerUp={blur} onClick={() => setRunning((v) => !v)} disabled={!Number.isFinite(st.E)}>
                {running ? 'Stop' : 'Run'}
              </button>
              <button
                type="button"
                onPointerUp={blur}
                onClick={() => {
                  setRunning(false);
                  setSt(start());
                }}
              >
                Reset
              </button>
              <span className="l10-dg-break" />
              <Slider name="learning rate t" label={<span>learning rate <Tex tex="t" /></span>} value={rate} onChange={setRate} min={0.05} max={3} step={0.05} format={(v) => v.toFixed(2)} />
              <span className="l10-dg-rate">Correct rate: {Math.round(st.acc * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * An AI learns to read digits with every step showing, without its title and goal (the caption
 * says them): a tiny AI (softmax regression, 7,850 parameters, from 0) learns to read handwritten
 * digits (MNIST) by gradient descent on its error E, its parts tagged with the rows of How does an
 * AI learn?: the function, a digit drawn on the pad and the AI's confidence in each digit, live; the
 * data; the error E and its graph against the step number; Step, Run / Stop, Reset and the learning
 * rate, with the correct rate on 1,000 test digits. The deck loads the digits (4.7 MB) before it
 * starts; here the applet waits for them.
 */
export default function Digits() {
  const [ready, setReady] = useState(() => !!getDigits());
  useEffect(() => {
    if (ready) return undefined;
    let live = true;
    loadDigits().then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [ready]);
  return ready ? <Demo /> : <div style={{ width: 1100, height: 560 }} />;
}
