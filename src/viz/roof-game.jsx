import { useEffect, useRef } from 'react';
import '../lectures/l3/styles/deck.css';
import RoofGame3D from '../lectures/l3/components/RoofGame3D.jsx';

export const lecture = 3;

/*
 * On the slide the math is off at first (the "Σ math" button); on the page it is on from the start.
 * RoofGame3D keeps the setting to itself, so the page presses the button once the game is up. The
 * timeout is cancelled on cleanup, so a mount run twice (React's strict mode) presses it once.
 */
export default function RoofGame() {
  const wrap = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const button = [...wrap.current.querySelectorAll('.g3d-buttons button')].find((b) => b.textContent.includes('math'));
      if (button && !button.classList.contains('on')) button.click();
    });
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={wrap} style={{ display: 'contents' }}>
      <RoofGame3D eyebrow="A line meets a plane" />
    </div>
  );
}
