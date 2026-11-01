import { useRef, useState } from 'react';
import '../lectures/l20/styles/deck.css';
import Tex from '../lectures/l20/components/Tex.jsx';
import { DEPENDENT_R2 } from '../lectures/l20/components/Dependent.jsx';
import { GREEN } from '../lectures/l20/components/gs.js';
import { from, useFragmentSteps } from './redundancies.jsx';

export const lecture = 20;

const G = (tex) => String.raw`\textcolor{${GREEN}}{${tex}}`;
const ASK = ['Which vector is redundant?', 'Remove it', 'Start again'];

/**
 * One example on its card, as in the deck's DependentCards: its picture and its combination giving
 * 0; on its button the redundant vector turns amber, with the relation; then it is removed (a dashed
 * ghost) and the basis left turns green.
 */
export function DependentCard({ ex }) {
  const ref = useRef(null);
  const [s, setS] = useState(0);
  useFragmentSteps(ref, s);
  const { Pic, zero, relation, basis } = ex;
  return (
    <figure ref={ref}>
      <Pic amber={1} drop={2} />
      <figcaption>
        <Tex tex={zero} />
        <span className="l20-cap2" style={from(s, 1)}>
          <Tex tex={relation} />
        </span>
        <span className="l20-cap2" style={from(s, 2)}>
          <Tex tex={G(basis[0])} /> is a basis of <Tex tex={basis[1]} />
        </span>
      </figcaption>
      <div className="viz-toggle">
        <button type="button" className="viz-button" onClick={() => setS((k) => (k + 1) % 3)}>
          {ASK[s]}
        </button>
      </div>
    </figure>
  );
}

/*
 * Examples of linear dependence in ℝ², without its title: two vectors on a line, v₂ = −(3/2)v₁;
 * three adding up to 0, head to tail a closed triangle; a collection with 0 in it. Each card with
 * its combination giving 0. On the slide each card comes on a key press, then its redundant vector
 * turns amber with the relation, then it is removed and the basis left turns green; here each card
 * has its own button for the two.
 */
export default function DependentR2() {
  return (
    <div className="l20-pair l20-redund l20-dep">
      {DEPENDENT_R2.map((ex) => (
        <DependentCard key={ex.zero} ex={ex} />
      ))}
    </div>
  );
}
