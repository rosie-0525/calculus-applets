import '../lectures/l16/styles/deck.css';
import Tex, { r } from '../lectures/l16/components/Tex.jsx';
import IslandMap from '../lectures/l16/components/IslandMap.jsx';
import { M_STAY, matvec } from '../lectures/l16/components/markov.js';
import { P0, POWERS, f3, bmatrix, vec, useYear } from '../lectures/l16/slides/Slide08dAllOnCLong.jsx';

export const lecture = 16;

/*
 * Example 2 in the long run: M^k over p_k = M^k p_0 for the same year k, a tear-off calendar that
 * turns to the next year's page on a click (up to 15) and a round button back to year 0, beside
 * Example 2's transition diagram with p_k's shares on the islands, each the deeper in colour the
 * bigger its share. The slide's last line, all the birds end up on C, is left for the reader.
 */
export default function LongRun() {
  const [k, year] = useYear(0);
  const p = matvec(POWERS[k], P0);
  return (
    <div className="l16-long">
      <div className="l16-long-left">
        <div className="l16-long-cell">
          <Tex display className="l16-long-mat l16-long-m" tex={r`M^{${k}}\approx${bmatrix(POWERS[k])}`} />
          {year}
        </div>
        <div>
          <p className="l16-long-what">
            <strong>Fraction of birds on islands A, B, C</strong> at <Tex tex={`k=${k}`} />
          </p>
          <Tex display className="l16-long-mat" tex={k === 0 ? r`=\mathbf p_0\approx${vec(p)}` : r`=\mathbf p_{${k}}=M^{${k}}\mathbf p_0\approx${vec(p)}`} />
        </div>
      </div>
      <div className="l16-long-map">
        <IslandMap M={M_STAY} width={400} r={66} shares={p} format={f3} />
      </div>
    </div>
  );
}
