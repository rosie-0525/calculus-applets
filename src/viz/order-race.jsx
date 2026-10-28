import { useState } from 'react';
import '../lectures/l15/styles/deck.css';
import { Race } from '../lectures/l15/slides/Slide08cRace.jsx';

export const lecture = 15;

/*
 * How much faster?, its table: Method I, (AB)C, and Method II, A(BC), for A, B n × n and C n × 1,
 * their multiplications and times at a billion per second, with the slider for n (3 to 1,000,000).
 * The uses below it on the slide, neural networks and video games, are an applet of their own
 * (order-uses.jsx).
 */
export default function OrderRace() {
  const [n, setN] = useState(1000);
  return (
    <div className="race-col">
      <Race n={n} setN={setN} />
    </div>
  );
}
