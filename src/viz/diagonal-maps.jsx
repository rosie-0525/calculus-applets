import { useEffect, useState } from 'react';
import '../lectures/l15/styles/deck.css';
import Tex from '../lectures/l15/components/Tex.jsx';
import Slider from '../lectures/l15/components/Slider.jsx';
import { useGlide } from '../lectures/l15/components/useFragmentTween.js';
import { BLUE, AMBER } from '../lectures/l15/components/la.js';
import { PRESETS, texD, DPanel } from '../lectures/l15/slides/Slide12DiagonalMaps.jsx';

export const lecture = 15;

/*
 * What else do diagonal matrices do?: the picture of diag(d₁, d₂), sliders for d₁ and d₂, and the
 * four matrices as tiles, a stretch, a reflection, a projection, a reflection and stretch. On the
 * slide each tile comes on a key press, the picture reset to the unit square and gliding to it;
 * here clicking a tile does that (again on the next click), and it stays tinted until another one
 * is clicked.
 */
export default function DiagonalMaps() {
  const [pick, setPick] = useState(-1);
  const [run, setRun] = useState(0);
  const [target, setTarget] = useState([1, 1]);
  const [d1, setD1] = useGlide(target[0], 1300);
  const [d2, setD2] = useGlide(target[1], 1300);
  // on each click, back to the unit square at once, then a glide to the new matrix
  useEffect(() => {
    if (pick < 0) return undefined;
    setD1(1);
    setD2(1);
    setTarget([1, 1]);
    const timer = setTimeout(() => setTarget(PRESETS[pick].d), 400);
    return () => clearTimeout(timer);
  }, [pick, run, setD1, setD2]);
  const choose = (k) => {
    setPick(k);
    setRun((n) => n + 1);
  };
  return (
    <div className="l15-dmaps">
      <div className="l15-dmaps-pic">
        <DPanel d={[d1, d2]} />
        <div className="lc-sliders l15-d-sliders">
          <Slider name="d1" label={<Tex tex="d_1" />} value={Math.round(d1 * 10) / 10} onChange={setD1} min={-2} max={2} step={0.1} color={BLUE} />
          <Slider name="d2" label={<Tex tex="d_2" />} value={Math.round(d2 * 10) / 10} onChange={setD2} min={-2} max={2} step={0.1} color={AMBER} />
        </div>
      </div>
      <div className="l15-dmaps-text">
        <div className="l15-presets" role="group" aria-label="Diagonal matrices">
          {PRESETS.map((q, k) => (
            <button key={q.name} type="button" className={`l15-preset dmap-pick${pick === k ? ' current-fragment' : ''}`} aria-pressed={pick === k} onClick={() => choose(k)}>
              <Tex tex={texD(q.d)} />
              <span>{q.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
