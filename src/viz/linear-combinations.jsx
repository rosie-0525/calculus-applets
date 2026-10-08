import { useState } from 'react';
import '../lectures/l1/styles/deck.css';
import { MultiplesExplorer, CombinationExplorer } from '../lectures/l1/slides/Slide16LinearCombinations.jsx';

export const lecture = 1;

export default function LinearCombinations() {
  // one vector: c v, and the smallest and largest c the slider has reached (the trail)
  const [c, setC] = useState(1.5);
  const [seen, setSeen] = useState([1.5, 1.5]);
  const onC = (x) => {
    setC(x);
    setSeen(([lo, hi]) => [Math.min(lo, x), Math.max(hi, x)]);
  };
  // two vectors: c1 v1 + c2 v2
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);

  return (
    <div className="viz-row">
      <MultiplesExplorer c={c} setC={onC} seen={seen} />
      <CombinationExplorer c1={c1} c2={c2} setC1={setC1} setC2={setC2} />
    </div>
  );
}
