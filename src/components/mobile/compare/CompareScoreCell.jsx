// 비교 점수 셀 (ScoreGauge 작은 사이즈 + best 강조 링)
// - 가로 스크롤 컬럼 안에 들어가는 점수 행
import { ScoreGauge } from '../../ds/ScoreGauge.jsx';
import { IconCheck } from '../../ds/Icons.jsx';

export function CompareScoreCell({ value, isBest }) {
  const cls = isBest
    ? 'm-compare-cell m-compare-cell--score m-compare-cell--best'
    : 'm-compare-cell m-compare-cell--score';
  return (
    <div className={cls}>
      {isBest && (
        <span className="m-compare-cell-check" aria-label="가장 높은 점수">
          <IconCheck size={11} stroke={2.5} />
        </span>
      )}
      <ScoreGauge value={value} size={56} />
    </div>
  );
}
