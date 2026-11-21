import { useState } from 'react';
import '../lectures/l26/styles/deck.css';
import Tex, { r } from '../lectures/l26/components/Tex.jsx';
import DiagCard from '../lectures/l26/components/DiagCard.jsx';
import Slider from '../lectures/l26/components/Slider.jsx';
import { form, signed, START } from '../lectures/l26/slides/Slide12Diagonal.jsx';
import Figure from '../site/Figure.jsx';
import { Beat, P, Summary, Think, Why } from '../site/Story.jsx';
import Hyperbolas from './contour-ab/Hyperbolas.jsx';
import Intercepts from './contour-ab/Intercepts.jsx';
import Quiz from './contour-ab/Quiz.jsx';

export const lecture = 26;
export const story = true;

/*
 * Contour plots of ax² + by², as a story (the user's request: text in the page's column, with
 * pictures to play with). First a line, Adjust the values of a and b to explore the contour plot of
 * ax² + by², the slide's applet (SlideApplet), and the two questions the parts answer (the user's
 * words); then
 *   When a and b have the same sign, we get ellipses (the user's title). An activity: a circle to
 *     stretch into each of three ellipses, by its handles on the axes (Intercepts; the user's
 *     requests), then the conclusion, in the box a
 *     question was in: if |a| < |b|, longer along the x-axis; if |a| > |b|, along the y-axis (two
 *     lines, aligned: the user's request), with Why? to open under it.
 *   When a and b have opposite signs, we get hyperbolas. The same (the user's request): a hyperbola
 *     to drag into each of three, by its intercepts and its asymptotes (Hyperbolas), then the
 *     conclusion (which axis it intersects: c has the sign of a, or of b; if |a| < |b|, the
 *     asymptotes closer to the x-axis), with Why?.
 *   The slide's conclusion, in a box, and a quiz: four contour plots, their formulas
 *   to drag under them (Quiz).
 * (Removed at the user's requests: a first part, Zoom in on a critical point; a last one, Near a
 * critical point; and the parts Case a = b = 1: circles, Case a = 1, b > 0: ellipses (a question),
 * Case a = 1, b < 0: hyperbolas (a question), Case a = 1, b = 0: parallel lines, and All cases: the
 * map of (a, b), which the two parts on the equations replace. The text cut to about a third: the
 * user's request.)
 */

/**
 * The slide's applet (Slide12Diagonal.jsx), without its title and its conclusion (the parts under it
 * explain it, and the box at the end sums it up): sliders for a and b (−4 to 4, x² + 4y² to start),
 * beside the contour plot of ax² + by² (DiagCard: the asymptotes dotted when a and b have opposite
 * signs), its formula over it with the numbers in. In a narrow box the plot is under the sliders.
 */
function SlideApplet() {
  const [[a, b], set] = useState(START);
  return (
    <div className="cab-slide">
      <div className="l26-ab">
        <div className="l26-ab-text">
          <div className="lc-sliders l26-ab-sliders">
            <Slider name="a" label={<Tex tex="a" />} value={a} onChange={(v) => set(([, y]) => [v, y])} min={-4} max={4} format={signed} />
            <Slider name="b" label={<Tex tex="b" />} value={b} onChange={(v) => set(([x]) => [x, v])} min={-4} max={4} format={signed} />
          </div>
        </div>
        <figure className="l26-ab-fig">
          <figcaption>
            <Tex tex={form(a, b)} />
          </figcaption>
          <DiagCard l1={a} l2={b} size={270} title={`The contour plot of ${form(a, b).replace(/\^2/g, '²')}`} axisLabels />
        </figure>
      </div>
    </div>
  );
}

// a picture, at the left of the column, as the text is
const fig = (label, child) => (
  <Figure lecture={lecture} label={label} align="left">
    {child}
  </Figure>
);

export default function ContourStory() {
  return (
    <>
      <P>{r`Adjust the values of $a$ and $b$ to explore the contour plot of $ax^2 + by^2$.`}</P>
      {fig('The contour plot of ax² + by², with sliders for a and b', <SlideApplet />)}
      <P>When do we get an ellipse, and when do we get a hyperbola? How do the values of $a$ and $b$ determine the shape of the ellipse and the hyperbola?</P>

      <Beat id="ab-ellipses" title={r`When $a$ and $b$ have the same sign, we get ellipses`}>
        <P>{r`When do we get a “tall” ellipse, and when is it “fat”? For each ellipse below, work out its intersections with the $x$- and $y$-axes, and drag the circle into the correct shape of the ellipse.`}</P>
        {fig('A circle to stretch into the ellipse ax² + by² = c, by its handles on the axes', <Intercepts />)}
        <Think label="Conclusion:">{r`<span class="story-lines">if $|a| <\nobreak |b|$, the ellipse is longer along the $x$-axis;<br>if $|a| >\nobreak |b|$, the ellipse is longer along the $y$-axis.</span>`}</Think>
        <Why>
          <P>{r`The intersection with $y = 0$ (the $x$-axis) is given by $ax^2 =\nobreak c$, so the ellipse $ax^2 + by^2 =\nobreak c$ meets the $x$-axis at $x =\nobreak \pm\sqrt{c/a}$. Likewise, the intersection with $x = 0$ (the $y$-axis) is given by $by^2 =\nobreak c$, so it meets the $y$-axis at $y =\nobreak \pm\sqrt{c/b}$.`}</P>
          <P>{r`If $|a| <\nobreak |b|$, then $c/a >\nobreak c/b$ (both are positive, since $c$ has the same sign as $a$ and $b$), so $\sqrt{c/a} >\nobreak \sqrt{c/b}$. That is, the ellipse is longer along the $x$-axis.`}</P>
          <P>{r`If $|a| >\nobreak |b|$, the argument is similar.`}</P>
        </Why>
      </Beat>

      <Beat id="ab-hyperbolas" title={r`When $a$ and $b$ have opposite signs, we get hyperbolas`}>
        <P>{r`How does the shape of the hyperbola depend on the values of $a$ and $b$? For each hyperbola below, work out its intersections with the axes and its asymptotes, then drag it into the correct shape.`}</P>
        {fig('A hyperbola to drag into the shape of ax² + by² = c, by its intercepts and an asymptote', <Hyperbolas />)}
        <Think label="Conclusion:">{r`<span class="story-lines">if $c$ has the same sign as $a$, the hyperbola intersects the $x$-axis;<br>if $c$ has the same sign as $b$, the hyperbola intersects the $y$-axis;<br>if $|a| <\nobreak |b|$, the asymptotes are closer to the $x$-axis;<br>if $|a| >\nobreak |b|$, the asymptotes are closer to the $y$-axis.</span>`}</Think>
        <Why>
          <P>{r`The intersection with $y = 0$ (the $x$-axis) is given by $ax^2 =\nobreak c$, which has the solutions $x =\nobreak \pm\sqrt{c/a}$ when $c/a > 0$, that is, when $c$ has the same sign as $a$. Likewise, the intersection with $x = 0$ (the $y$-axis), given by $by^2 =\nobreak c$, has solutions when $c$ has the same sign as $b$.`}</P>
          <P>{r`Far from the origin, $ax^2$ and $by^2$ are large and $c$ hardly matters, so the hyperbola $ax^2 + by^2 =\nobreak c$ runs close to the level set 0, where $ax^2 + by^2 =\nobreak 0$. Since $a$ and $b$ have opposite signs, this says $|a|x^2 =\nobreak |b|y^2$. Thus the asymptotes of the hyperbola are the lines $y =\nobreak \pm\sqrt{|a|/|b|}\,x$.`}</P>
          <P>{r`If $|a| <\nobreak |b|$, then $\sqrt{|a|/|b|} <\nobreak 1$, so the asymptotes are less steep than $y =\nobreak \pm x$. That is, they are closer to the $x$-axis.`}</P>
          <P>{r`If $|a| >\nobreak |b|$, the argument is similar.`}</P>
        </Why>
      </Beat>

      <Summary>
        <P>
          {r`<b>Takeaway.</b> If $a$ and $b$ have the same sign, the level sets of $ax^2 + by^2$ are <b>ellipses</b>; if $|a| <\nobreak |b|$, the ellipse is longer along the $x$-axis. If $a$ and $b$ have opposite signs, the level sets are <b>hyperbolas</b>; if $|a| <\nobreak |b|$, their asymptotes are closer to the $x$-axis.`}
        </P>
      </Summary>

      <Beat id="ab-quiz" title="Check your understanding">
        <P>
          {r`Drag each function under its contour plot.`}
        </P>
        {fig('Four contour plots, A to D, to match to their functions', <Quiz />)}
      </Beat>
    </>
  );
}
