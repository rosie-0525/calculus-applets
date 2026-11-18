import { useState } from 'react';
import '../lectures/l24/styles/deck.css';
import Tex, { r } from '../lectures/l24/components/Tex.jsx';
import Plane from '../lectures/l24/components/Plane.jsx';
import { FImage, GridImage } from '../lectures/l24/components/FShape.jsx';
import { useTween } from '../lectures/l24/components/useFragmentTween.js';
import { INK, BLUE } from '../lectures/l24/components/eig.js';
import { CARDS, PLAY, UNIT } from '../lectures/l24/slides/Slide17HowMany.jsx';
// the pictures How many eigenvalues? imports (they were What the three matrices do's)
import { CARDS as MOVES, Scene } from '../lectures/l24/slides/Slide17bHowManyMoves.jsx';
import { from } from './redundancies.jsx';

export const lecture = 24;

/** A matrix at work, played as it mounts once `on`; until then the grid, the unit square and F where
 *  they start, in Scene's frame, without the eigenlines (they would tell). */
function Picture({ card, on }) {
  const t = useTween(on, PLAY);
  if (!on) {
    return (
      <Plane xRange={card.xRange} yRange={card.yRange} unit={UNIT} pad={6} grid={false} axes={false} title="The grid, the unit square and F">
        {(p) => (
          <g>
            <g opacity="0.7">
              <GridImage p={p} />
              <FImage p={p} home />
              <FImage p={p} color={BLUE} opacity={0.9} squareFill="rgba(59, 110, 168, 0.12)" />
            </g>
            <circle cx={p.px(0)} cy={p.py(0)} r="4" fill={INK} />
          </g>
        )}
      </Plane>
    );
  }
  return <Scene card={card} t={t} unit={UNIT} />;
}

/**
 * One matrix on its card, the card a button: A and "P_A(λ)", the grid, the unit square and F, and
 * "How many eigenvalues?" in gray. Clicked, its polynomial, factored on the line under it, its
 * picture (the grid, the unit square and F moved by A, with its eigenlines), played, and its
 * eigenvalues; a click again plays it again.
 */
function Card({ c, move }) {
  const [turn, setTurn] = useState(0);
  const on = turn > 0 ? 1 : 0;
  return (
    <div className="l24-many-card hm-card">
      <button type="button" className="inv-pick hm-pick" aria-pressed={!!on} onClick={() => setTurn((n) => n + 1)}>
        <p className="l24-many-m">
          <Tex tex={`A=${c.m}`} />
        </p>
        <p className="l24-many-p">
          <Tex tex={r`P_A(\lambda)`} />
          <span className="l24-many-pf">
            <span style={from(on, 1)}>
              <Tex tex={`{}=${c.p}`} />
            </span>
            <span style={from(on, 1)}>
              <Tex tex={c.f} />
            </span>
          </span>
        </p>
        <Picture key={turn} card={move} on={!!on} />
        <p className={`l24-many-v${on ? '' : ' hm-ask'}`}>{on ? c.verdict : 'How many eigenvalues?'}</p>
      </button>
    </div>
  );
}

/*
 * How many eigenvalues?, without its title: three matrices, each on a card with its characteristic
 * polynomial, then factored, its picture and its eigenvalues: A = [1 1/2; 1/2 1], (λ − 1/2)(λ − 3/2),
 * u stretched by 3/2 and v shrunk by 1/2 along their eigenlines, two eigenvalues; the shear [1 1; 0 1],
 * (λ − 1)², e₁ staying put on the only eigenline, one; the rotation by 90°, λ² + 1 > 0, every line
 * turning, none. On the slide each card's polynomial, factors and picture come on three key presses;
 * here a card shows them all, its picture playing, when it is clicked (until then its picture is the
 * grid, the square and F at rest, without the eigenlines).
 */
export default function HowManyEigenvalues() {
  return (
    <div className="l24-many hm">
      {CARDS.map((c, k) => (
        <Card key={c.p} c={c} move={MOVES[k]} />
      ))}
    </div>
  );
}
