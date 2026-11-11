import { useRef, useState } from 'react';
import '../lectures/l21/styles/deck.css';
import Tex, { r } from '../lectures/l21/components/Tex.jsx';
import { A1, A, B, TWO_A, A_PLUS_B, S, SLOTS, Op, Card, useCards } from '../lectures/l21/slides/Slide03Poll.jsx';
import { from } from './redundancies.jsx';

export const lecture = 21;

/** Its cards, turning over on a loop from when they are mounted (the slide's fragment marker with them). */
function Cards({ children, rest }) {
  const [u, marker] = useCards(1, rest ? { rest } : undefined);
  return (
    <>
      {marker}
      {children(u)}
    </>
  );
}

const ROWS = [
  {
    formula: r`(A^{\top})^{\top}=A`,
    rest: 900,
    cards: (u) => <Card col={3} rows={A1} u={u} labels={[r`A`, r`A^{\top}`, r`(A^{\top})^{\top}`]} />,
  },
  {
    formula: r`(cA)^{\top}=cA^{\top}`,
    note: (
      <>
        for any scalar <Tex tex="c" />
      </>
    ),
    cards: (u) => (
      <>
        <Op col={2} tex="2" />
        <Card col={3} rows={A} u={u} labels={[r`A`, r`A^{\top}`]} />
        <Op col={4} tex="=" />
        <Card col={5} rows={TWO_A} u={u} labels={[r`2A`, r`(2A)^{\top}`]} />
      </>
    ),
  },
  {
    formula: r`(A+B)^{\top}=A^{\top}+B^{\top}`,
    cards: (u) => (
      <>
        <Card col={1} rows={A} u={u} labels={[r`A`, r`A^{\top}`]} />
        <Op col={2} tex="+" />
        <Card col={3} rows={B} u={u} labels={[r`B`, r`B^{\top}`]} />
        <Op col={4} tex="=" />
        <Card col={5} rows={A_PLUS_B} u={u} labels={[r`A+B`, r`(A+B)^{\top}`]} />
      </>
    ),
  },
];

/** A property: its formula and a button; on the button, its 3 × 4 matrices turned over like cards, on a loop. */
function Property({ row }) {
  const [on, setOn] = useState(false);
  const turn = useRef(0);
  return (
    <div className="l21-prop">
      <div className="l21-prop-f tpp-f" style={{ height: S }}>
        <Tex tex={row.formula} />
        {row.note && <span className="l21-prop-note">{row.note}</span>}
        <button
          type="button"
          className="viz-button tpp-why"
          aria-pressed={on}
          onClick={() => {
            turn.current += 1;
            setOn((v) => !v);
          }}
        >
          {on ? 'Hide' : 'Why?'}
        </button>
      </div>
      <div className="l21-prop-cards" style={{ gridTemplateColumns: SLOTS, ...from(on ? 1 : 0, 1) }}>
        <Cards key={turn.current} rest={row.rest}>
          {row.cards}
        </Cards>
      </div>
    </div>
  );
}

/*
 * Properties of the transpose, without its title: a row per property, the formula on the left and,
 * on the right, its explanation: 3 × 4 matrices turned over like cards about the line through their
 * diagonal entries, on a loop (FlipCard), in columns card, +, card, =, card, so that the = signs line
 * up: A turned over twice is A again; 2·A = 2A, every card turned over, reads 2·Aᵀ = (2A)ᵀ; A + B =
 * A + B, every card turned over, reads Aᵀ + Bᵀ = (A + B)ᵀ. On the slide each explanation comes on a
 * key press; here each row has a button, under its formula, and its cards start turning when they
 * come.
 */
export default function TransposeProperties() {
  return (
    <div className="l21-props tpp">
      {ROWS.map((row) => (
        <Property key={row.formula} row={row} />
      ))}
    </div>
  );
}
