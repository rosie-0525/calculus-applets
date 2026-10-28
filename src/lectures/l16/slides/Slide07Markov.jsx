import Fragment from '../components/Fragment.jsx';
import { BirdCartoon, MonopolyCartoon, ShuffleCartoon, ChatCartoon } from '../components/Cartoons.jsx';

// Markov chain or not? Each process, whether it is one, and why (the user's choice and order: two
// Markov chains, then Spotify shuffle (in place of the hot hand, which is debated), then a process
// that remembers everything), each with its cartoon
export const EXAMPLES = [
  {
    text: 'Bird\u00a0migration\u00a0in\u00a0Example\u00a01',
    Cartoon: BirdCartoon,
    yes: true,
    why: 'next island depends only on this year’s island.',
  },
  {
    text: 'Monopoly game',
    Cartoon: MonopolyCartoon,
    yes: true,
    why: 'next square depends only on this square and the dice.',
  },
  {
    text: 'Spotify shuffle',
    Cartoon: ShuffleCartoon,
    yes: false,
    why: 'next song depends on the last few songs.',
  },
  {
    text: 'ChatGPT’s answer',
    Cartoon: ChatCartoon,
    yes: false,
    why: 'next word depends on all the words so far.',
  },
];

/**
 * Markov chains: Mark's definition (its first sentence); then the four processes one by one, each
 * under its cartoon (Cartoons.jsx) on key press 1, 3, 5, 7, and whether it is a Markov chain, and
 * why, on the next. The Markov matrix and the probability vector are on Markov matrices.
 */
export default function Slide07Markov() {
  return (
    <section>
      <h2>Markov chains</h2>

      <div className="block definition">
        <p className="block-title">Definition</p>
        <p>
          A <strong>Markov chain</strong> is a process in which the evolution of a system depends on the current state of the system, but not on its
          previous states.
        </p>
      </div>

      <ul className="l16-mc-examples">
        {EXAMPLES.map((e, i) => (
          <Fragment key={e.text} index={2 * i + 1} as="li">
            <e.Cartoon />
            <div>
              <span className="l16-mc-name">{e.text}</span>
              <Fragment index={2 * i + 2} as="span" className="l16-mc-why">
                <span className={`verdict ${e.yes ? 'yes' : 'no'}`}>{e.yes ? '✓ Markov chain' : '✗ Not a Markov chain'}:</span> {e.why}
              </Fragment>
            </div>
          </Fragment>
        ))}
      </ul>
    </section>
  );
}
