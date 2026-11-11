import { useRef } from 'react';
import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import FlipCard, { useFlips } from '../components/FlipCard.jsx';
import { useFragmentShown } from '../components/useFragmentTween.js';

export const A1 = [
  ['1', '2', '3', '4'],
  ['5', '6', '7', '8'],
  ['9', '10', '11', '12'],
];
export const A = [
  [1, 0, 2, 3],
  [4, 1, 0, 2],
  [2, 3, 1, 0],
];
export const B = [
  [1, 3, 0, 2],
  [2, 0, 1, 4],
  [0, 1, 3, 1],
];
export const TWO_A = A.map((row) => row.map((a) => 2 * a));
export const A_PLUS_B = A.map((row, i) => row.map((a, j) => a + B[i][j]));

export const CELL = 32;
export const PAD = 10;
export const FONT = 19;
export const S = 2 * PAD + 4 * CELL; // the side of a card's box (FlipCard)
export const OP = 46; // the width of an operator's column
// a row's cards: card, operator, card, operator, card, so that the = signs line up from row to row
export const SLOTS = `${S}px ${OP}px ${S}px ${OP}px ${S}px`;

/** An operator between cards, level with their centres, in column `col` of the row's cards. */
export const Op = ({ tex, col }) => (
  <span className="l21-prop-op" style={{ height: S, gridColumn: col }}>
    <Tex tex={tex} />
  </span>
);

/** A card in column `col` of the row's cards. */
export const Card = ({ col, ...props }) => (
  <div style={{ gridColumn: col }}>
    <FlipCard cell={CELL} pad={PAD} font={FONT} {...props} />
  </div>
);

/** The turns of the cards of key press `index`, on a loop while the slide is on screen. */
export function useCards(index, opts) {
  const ref = useRef(null);
  const on = useFragmentShown(ref);
  const u = useFlips(on, { ms: 1500, hold: 1500, delay: 500, live: () => !!ref.current?.closest('section')?.classList.contains('present'), ...opts });
  const marker = <span ref={ref} className="fragment fx-marker" data-fragment-index={index} aria-hidden="true" />;
  return [u, marker];
}

/**
 * Properties of the transpose (in place of Christine's poll on them, at the user's request; (cA)ᵀ =
 * cAᵀ added): a table of the three properties, a row each, the formula on the left (all three on
 * arrival) and, on its key press (1–3), its explanation on the right: 3 × 4 matrices turned over like
 * cards about the line through their diagonal entries, on a loop (FlipCard), in columns card, +, card,
 * =, card, so that the = signs line up (the user asked for a better layout than two properties side by
 * side over the third): A turned over twice is A again (in the middle column); 2·A = 2A, every card
 * turned over, reads 2·Aᵀ = (2A)ᵀ; A + B = A + B, every card turned over, reads Aᵀ + Bᵀ = (A + B)ᵀ.
 * Print: the cards turned over.
 */
export default function Slide03Poll() {
  const [u1, m1] = useCards(1, { rest: 900 });
  const [u2, m2] = useCards(2);
  const [u3, m3] = useCards(3);
  return (
    <section>
      <h2>Properties of the transpose</h2>

      {m1}
      {m2}
      {m3}
      <div className="l21-props">
        <div className="l21-prop">
          <div className="l21-prop-f" style={{ height: S }}>
            <Tex tex={r`(A^{\top})^{\top}=A`} />
          </div>
          <Fragment index={1} className="l21-prop-cards" style={{ gridTemplateColumns: SLOTS }}>
            <Card col={3} rows={A1} u={u1} labels={[r`A`, r`A^{\top}`, r`(A^{\top})^{\top}`]} />
          </Fragment>
        </div>

        <div className="l21-prop">
          <div className="l21-prop-f" style={{ height: S }}>
            <Tex tex={r`(cA)^{\top}=cA^{\top}`} />
            <span className="l21-prop-note">
              for any scalar <Tex tex="c" />
            </span>
          </div>
          <Fragment index={2} className="l21-prop-cards" style={{ gridTemplateColumns: SLOTS }}>
            <Op col={2} tex="2" />
            <Card col={3} rows={A} u={u2} labels={[r`A`, r`A^{\top}`]} />
            <Op col={4} tex="=" />
            <Card col={5} rows={TWO_A} u={u2} labels={[r`2A`, r`(2A)^{\top}`]} />
          </Fragment>
        </div>

        <div className="l21-prop">
          <div className="l21-prop-f" style={{ height: S }}>
            <Tex tex={r`(A+B)^{\top}=A^{\top}+B^{\top}`} />
          </div>
          <Fragment index={3} className="l21-prop-cards" style={{ gridTemplateColumns: SLOTS }}>
            <Card col={1} rows={A} u={u3} labels={[r`A`, r`A^{\top}`]} />
            <Op col={2} tex="+" />
            <Card col={3} rows={B} u={u3} labels={[r`B`, r`B^{\top}`]} />
            <Op col={4} tex="=" />
            <Card col={5} rows={A_PLUS_B} u={u3} labels={[r`A+B`, r`(A+B)^{\top}`]} />
          </Fragment>
        </div>
      </div>
    </section>
  );
}
