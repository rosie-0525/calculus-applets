import '../lectures/l4/styles/deck.css';
import { PANELS } from '../lectures/l4/slides/Slide06SubspaceOrNot.jsx';

export const lecture = 4;

export default function SubspaceOrNot() {
  return (
    <div className="subspace-panels">
      {PANELS.map(({ Fig, name, ok, why }, i) => (
        <figure key={i} className="subspace-panel">
          <Fig at={2 * i + 2} />
          <figcaption>
            {name}
            <span className={`verdict ${ok ? 'yes' : 'no'}`}>
              {ok ? '✓ subspace' : '✗ not a subspace'}: {why}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
