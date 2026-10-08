import '../lectures/l2/styles/deck.css';
import DataToVectors from '../lectures/l2/components/DataToVectors.jsx';

export const lecture = 2;

export default function Correlation() {
  return (
    <div className="stage-fig">
      <DataToVectors index={1} angleIndex={2} />
    </div>
  );
}
