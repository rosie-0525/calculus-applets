import { useEffect, useRef, useState } from 'react';
import '../lectures/l7/styles/deck.css';
import Tex, { r } from '../lectures/l7/components/Tex.jsx';
import { ArmFigure, AngleSliders, AngleMap, descent, wrap, START } from '../lectures/l7/slides/Slide19bRobotArm.jsx';

export const lecture = 7;

/* The pose (θ1, θ2), set by the sliders or the dot on the map, and the path of gradient descent
   while it runs: `descend` slides the dot downhill from where it is, as the slide's last key
   press does. */
function usePose() {
  const [t, setT] = useState(START);
  const [path, setPath] = useState(null);
  const [run, setRun] = useState(0); // counts the presses of the button
  const now = useRef(t);
  now.current = t;
  useEffect(() => {
    if (!run) return undefined;
    const pts = descent(now.current);
    let frame;
    let t0;
    const ms = Math.min(3200, 600 + 14 * pts.length);
    const step = (time) => {
      if (t0 === undefined) t0 = time;
      const k = Math.min(1, (time - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const m = Math.round(e * (pts.length - 1));
      setPath(pts.slice(0, m + 1));
      setT(pts[m].map(wrap));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [run]);
  const setPose = (p) => {
    setRun(0);
    setPath(null);
    setT(p);
  };
  return { t, path, setPose, descend: () => setRun((n) => n + 1) };
}

/* The slide with everything showing, without the challenge's link: the arm and its sliders, the
   functions f, d and D = d ∘ f, and the contour plot of D, where the dot is the pose. */
export default function RobotArm() {
  const { t, path, setPose, descend } = usePose();
  return (
    <div className="arm">
      <div className="arm-pose">
        <ArmFigure t1={t[0]} t2={t[1]} />
        <AngleSliders t={t} onChange={setPose} />
      </div>

      <div className="arm-side">
        <div className="arm-step">
          <p>
            Position of the arm <Tex tex={r`\vv{f}:\mathbb{R}^2\to\mathbb{R}^2`} />:
          </p>
          <Tex display tex={r`\vv{f}(\theta_1,\theta_2)=\begin{bmatrix}L_1\cos\theta_1+L_2\cos(\theta_1+\theta_2)\\ L_1\sin\theta_1+L_2\sin(\theta_1+\theta_2)\end{bmatrix}.`} />
        </div>
        <div className="arm-step">
          <p>
            Distance function <Tex tex={r`d:\mathbb{R}^2\to\mathbb{R}`} />:
          </p>
          <Tex display tex={r`d(\vv{x})=\norm{\vv{x}-\vv{p}}.`} />
        </div>
        <div>
          <p>Composition</p>
          <Tex display tex={r`D(\theta_1,\theta_2)=d\bigl(\vv{f}(\theta_1,\theta_2)\bigr)=\norm{\vv{f}(\theta_1,\theta_2)-\vv{p}}`} />
          <p>is the distance between the arm and the cup.</p>
        </div>
      </div>

      <div className="arm-right">
        <div className="arm-map-wrap">
          <p className="arm-map-title">
            Contour plot for <Tex tex={r`D(\theta_1,\theta_2)`} />
          </p>
          <AngleMap t1={t[0]} t2={t[1]} onChange={setPose} path={path} />
        </div>
        <p className="arm-descend">
          <button type="button" className="viz-button" onClick={descend}>
            Gradient descent
          </button>
        </p>
      </div>
    </div>
  );
}
