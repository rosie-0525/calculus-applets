import RoofGame3D from '../components/RoofGame3D.jsx';
import Notes from '../components/Notes.jsx';

/**
 * Slide 2b: the video game of slide 2, in 3-D (src/game3d), shown again just before Example 4
 * (where a line meets a plane). The game fills the whole slide; it flies in over the arena each
 * time the slide appears, then plays itself until the mouse moves over it.
 */
export default function Slide02bGame3D() {
  return (
    <section className="g3d-slide" data-background-color="#05040b">
      <RoofGame3D eyebrow="Back to the game · a line meets a plane" />

      <Notes time="1:00 · running total 38:00">
        <p>
          Back to the game from the start, now with everything we know. <em>[Let the fly-in play;
          it ends at your eyes.]</em> Three robots hide behind concrete blocks. The top of each
          block is a piece of a <strong>plane</strong>, drawn extended as a red grid.
        </p>
        <p>
          <em>[Move the mouse to take over; click to fire.]</em> Every bolt flies along a{' '}
          <strong>line</strong> x(t) = p + t v: p is the muzzle, v the velocity, so t is the time in
          seconds. <em>[Click “Σ math”, top right, to show the math.]</em> Now each roof shows its
          normal vector n, and the panel on the left tracks the roof you are aiming at: its equation
          ax + by + cz = d, and the value of ax + by + cz at the robot's head. Bigger than d: the head
          is on your side of the roof plane, exposed (the tag over the robot turns teal). Smaller:
          covered. That is the two sides of a plane, from earlier today.
        </p>
        <p>
          <em>[Right-click, or shift-click, to fire in the bullet cam.]</em> Slow motion: t ticks up,
          and the bolt reaches the plane where n · (p + t v) = d. That is one equation for the one
          unknown t, and if the point it gives is on the roof, the bolt is blocked. Finding that
          point is the next example.
        </p>
        <p>
          <em>[Buttons, top right: the math (off at first), bullet cam for every shot, sound. Left alone for
          a few seconds, the game plays itself again.]</em>
        </p>
      </Notes>
    </section>
  );
}
