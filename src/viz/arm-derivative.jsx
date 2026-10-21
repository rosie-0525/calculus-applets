import { useState } from 'react';
import '../lectures/l13/styles/deck.css';
import Tex, { r } from '../lectures/l13/components/Tex.jsx';
import { ArmFigure, AngleSliders, START, TEAL, CARDINAL } from '../lectures/l13/slides/Slide13cRobotArm.jsx';

export const lecture = 13;

/*
 * Robot arm (a slide the deck has commented out for now) with its first two steps showing, without
 * its title: Lecture 7's arm, its two sliders, and at the hand the moves h₁c₁ and h₂c₂ when only the
 * shoulder, or only the elbow, turns, and the region the hand reaches for |h₁|, |h₂| ≤ 0.25 (gray)
 * with the parallelogram that approximates it (gold); beside it f, (Df)(θ₁, θ₂), its columns in the
 * joints' colors, and the approximation. On the slide a key press then straightens the arm and the
 * last one looks ahead to Chapter 18; here the caption asks what happens when the arm is straight,
 * and θ₂'s slider gets there.
 */
export default function ArmDerivative() {
  const [t1, setT1] = useState(START[0]);
  const [t2, setT2] = useState(START[1]);
  return (
    <div className="stage l13-arm-stage">
      <div className="stage-fig l13-arm-fig">
        <ArmFigure t1={t1} t2={t2} />
        <AngleSliders t1={t1} t2={t2} onT1={setT1} onT2={setT2} />
      </div>

      <div className="stage-text">
        <p>
          Position of the hand <Tex tex={r`f:\mathbb R^2\to\mathbb R^2`} />:
        </p>
        <Tex display tex={r`f(\theta_1,\theta_2)=\begin{bmatrix}L_1\cos\theta_1+L_2\cos(\theta_1+\theta_2)\\ L_1\sin\theta_1+L_2\sin(\theta_1+\theta_2)\end{bmatrix}`} />
        <Tex
          display
          tex={r`(Df)(\theta_1,\theta_2)=\begin{bmatrix}\textcolor{${TEAL}}{-L_1\sin\theta_1-L_2\sin(\theta_1+\theta_2)}&\textcolor{${CARDINAL}}{-L_2\sin(\theta_1+\theta_2)}\\ \textcolor{${TEAL}}{L_1\cos\theta_1+L_2\cos(\theta_1+\theta_2)}&\textcolor{${CARDINAL}}{L_2\cos(\theta_1+\theta_2)}\end{bmatrix}`}
        />
        <Tex display tex={r`f(\boldsymbol\theta+\vv h)\approx f(\boldsymbol\theta)+\big((Df)(\boldsymbol\theta)\big)\vv h=f(\boldsymbol\theta)+h_1\textcolor{${TEAL}}{\vv c_1}+h_2\textcolor{${CARDINAL}}{\vv c_2}`} />
        <p className="l13-arm-note">
          <Tex tex={r`|h_1|,|h_2|\le 0.25`} />: the hand’s reach (gray) <Tex tex={r`\approx`} /> a parallelogram (gold).
        </p>
      </div>
    </div>
  );
}
