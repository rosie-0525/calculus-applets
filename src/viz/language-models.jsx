import '../lectures/l1/styles/deck.css';
import Tex, { r } from '../lectures/l1/components/Tex.jsx';
import { MODELS } from '../lectures/l1/slides/Slide10HigherDimensions.jsx';

export const lecture = 1;
export const zoom = 1.3;

/* The slide's second example, large language models, without its title (the applet's title says it). */
export default function LanguageModels() {
  return (
    <div className="dims-card hd-card">
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
    </div>
  );
}
