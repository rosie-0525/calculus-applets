import Tex, { r } from '../components/Tex.jsx';
import Fragment from '../components/Fragment.jsx';
import Notes from '../components/Notes.jsx';

export const CARDINAL = '#8c1515';
export const SOFT = '#6b7280';

/*
 * A toy internet of five pages. Each circle's size is the page's (made-up)
 * PageRank score; the scores, listed in page order, are the vector below the
 * picture. Links are [from page, to page].
 */
export const PAGES = [
  { name: '1', at: [52, 50], score: 0.21 },
  { name: '2', at: [150, 84], score: 0.38 },
  { name: '3', at: [258, 56], score: 0.19 },
  { name: '4', at: [66, 150], score: 0.12 },
  { name: '5', at: [240, 152], score: 0.1 },
];
export const LINKS = [
  [1, 2], [4, 2], [3, 2], [5, 3], [2, 3], [4, 1], [2, 1], [5, 2],
];
export const TOP = '2'; // the most linked-to page
export const radius = (score) => 10 + 34 * score;

export function WebFigure() {
  const link = ([a, b], i) => {
    const [p, q] = [PAGES[a - 1], PAGES[b - 1]];
    const [dx, dy] = [q.at[0] - p.at[0], q.at[1] - p.at[1]];
    const d = Math.hypot(dx, dy);
    const [ux, uy] = [dx / d, dy / d];
    const start = [p.at[0] + ux * radius(p.score), p.at[1] + uy * radius(p.score)];
    const end = [q.at[0] - ux * (radius(q.score) + 3), q.at[1] - uy * (radius(q.score) + 3)];
    return (
      <line
        key={i}
        x1={start[0]}
        y1={start[1]}
        x2={end[0]}
        y2={end[1]}
        stroke="#9ca3af"
        strokeWidth="1.5"
        markerEnd="url(#web-head)"
      />
    );
  };
  return (
    <svg className="figure-svg" viewBox="0 0 310 176" width="310" height="176" role="img" aria-label="A toy internet of five pages linking to each other; page 2, the most linked-to, has the largest score">
      <defs>
        <marker id="web-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
        </marker>
      </defs>
      {LINKS.map(link)}
      {PAGES.map((pg) => {
        const top = pg.name === TOP;
        return (
          <g key={pg.name}>
            <circle cx={pg.at[0]} cy={pg.at[1]} r={radius(pg.score)} fill={top ? '#fbeaea' : '#f3f4f6'} stroke={top ? CARDINAL : SOFT} strokeWidth="1.5" />
            <text x={pg.at[0]} y={pg.at[1] + 5} fontSize="14" fontWeight="700" textAnchor="middle" fill={top ? CARDINAL : '#374151'}>
              {pg.score.toFixed(2)}
            </text>
            <text x={pg.at[0]} y={pg.at[1] - radius(pg.score) - 5} fontSize="11" textAnchor="middle" fill={SOFT}>
              page {pg.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Published embedding dimensions: entries per token vector (the model's hidden size). */
export const MODELS = [
  ['GPT-2 (small)', 2019, 768],
  ['GPT-3', 2020, 12288],
  ['Llama 3.1 405B', 2024, 16384],
];

export default function Slide10HigherDimensions() {
  return (
    <section>
      <h2>Higher-dimensional vectors</h2>

      <div className="dims-cards">
        <Fragment index={1} className="dims-card">
          <p className="card-title">
            <strong>Google Search</strong>: PageRank
          </p>
          <WebFigure />
          <ul className="bullets dims-bullets">
            <li>
              A toy internet with only 5 pages can be represented by{' '}
              <Tex tex="(0.21,\ 0.38,\ 0.19,\ 0.12,\ 0.10)" />, with numbers indicating the
              “importance” of each webpage.
            </li>
            <li>
              For the real web, we will need a vector with <strong>hundreds of billions</strong> of
              entries.
            </li>
          </ul>
        </Fragment>

        <Fragment index={2} className="dims-card">
          <p className="card-title">
            <strong>Large language models</strong> (ChatGPT, Claude, …)
          </p>
          <p className="compact card-body">Each token is stored as a vector:</p>
          <Tex
            display
            tex={r`\text{“cat”}\ \longmapsto\ \underbrace{(0.12,\ -0.83,\ 0.05,\ \dots,\ 0.41)}_{\text{thousands of entries}}`}
          />
          <table className="dims-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Year</th>
                <th className="num">Embedding dimension</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map(([model, year, entries]) => (
                <tr key={model}>
                  <td>{model}</td>
                  <td className="year">{year}</td>
                  <td className="num">{entries.toLocaleString('en-US')}</td>
                </tr>
              ))}
              <tr className="unknown">
                <td>GPT-4 and later, Claude</td>
                <td className="year">—</td>
                <td className="num">not published</td>
              </tr>
            </tbody>
          </table>
        </Fragment>
      </div>

      <Fragment index={3}>
        <p className="pointer dims-pointer">
          → see §1.2 in the textbook for more real-world examples
        </p>
      </Fragment>

      <Notes time="1:30 · running total 10:00">
        <p>
          Two pictures was the easy case. Most vectors that matter in practice are far too long to
          draw.
        </p>
        <p>
          <em>[Key press]</em> Google. The original idea behind Google Search, PageRank (Brin and
          Page, 1998), gives every web page an importance score, computed from which pages link to
          it — a page is important if important pages link to it. List all the scores in order
          and you have one vector, with one entry per web page. On this toy internet of five pages
          — numbers made up — page 2 has the most incoming links and the highest score, and the
          whole web is the 5-vector (0.21, 0.38, 0.19, 0.12, 0.10). The real web has one entry per
          page, and Google says its index covers hundreds of billions of pages. (Today PageRank is
          one of many signals Google uses, but the idea is the same.)
        </p>
        <p>
          <em>[Key press]</em> Large language models — ChatGPT, Claude — store every token — a
          word or a piece of a word — as a vector of numbers. The numbers on the slide are made
          up; the sizes are real. The number of entries is called the{' '}
          <strong>embedding dimension</strong>. GPT-2 used 768 numbers per token, GPT-3 used
          12,288, and Meta’s largest open model, Llama 3.1 405B, uses 16,384. OpenAI and Anthropic
          do not publish this number for GPT-4 or for Claude. Words with similar meanings end up
          with vectors that point in similar directions — so the “direction” from the last slide
          still means something, in 12,000 dimensions.
        </p>
        <p>
          <em>[Key press]</em> §1.2 of the textbook has more real-world examples — worth a look.
        </p>
        <p>
          The point: in real-world applications you will frequently encounter higher-dimensional
          vectors. These have far too many entries to draw, but we can still use our intuition
          from 2-D and 3-D vectors to do algebraic manipulations of these vectors.
        </p>
      </Notes>
    </section>
  );
}
