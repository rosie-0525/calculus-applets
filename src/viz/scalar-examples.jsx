import '../lectures/l7/styles/deck.css';
import Tex, { r } from '../lectures/l7/components/Tex.jsx';
import BayMap from '../lectures/l7/components/BayMap.jsx';
import { PLACES } from '../lectures/l7/components/bay.js';
import { StockChart } from '../lectures/l7/slides/Slide07Scalar.jsx';

export const lecture = 7;

/* The slide's first two examples, the stock market and the elevation around the Bay (not the
   grade, which is a formula and not a picture), each with its rule and its signature. */
export default function ScalarExamples() {
  return (
    <div className="viz-row sv-pair">
      <div className="sv-col">
        <p className="sv-title">Stock market price (S&amp;P 500)</p>
        <StockChart />
        <p className="sv-rule">
          <Tex tex="P(t)" /> = price at time <Tex tex="t" />
        </p>
        <p className="sv-sig">
          <Tex tex={r`P:\mathbb{R}\to\mathbb{R}`} />
        </p>
      </div>
      <div className="sv-col">
        <p className="sv-title">Elevation around the Bay</p>
        <BayMap c={0} scale={0.5} shore={null} today={false} places={[PLACES[0]]} />
        <p className="sv-rule">
          <Tex tex="E(x,y)" /> = height above the sea level at location <Tex tex="(x,y)" />
        </p>
        <p className="sv-sig">
          <Tex tex={r`E:\mathbb{R}^2\to\mathbb{R}`} />
        </p>
      </div>
    </div>
  );
}
