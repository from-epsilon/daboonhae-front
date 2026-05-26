// 비교 데이터 셀 (영양소 1개 값 표시 + 우수값 강조)
// - isBest=true 일 때 그린 텍스트 + 체크 아이콘 + soft-green pill 배경
// - direction=null 이면 강조 없음 (중립 지표)
import { IconCheck } from '../../ds/Icons.jsx';

// 숫자 포맷 (정수면 그대로, 소수는 한 자리)
function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '-';
  return Number.isInteger(v) ? `${v}` : `${Math.round(v * 10) / 10}`;
}

export function CompareCell({ value, unit, isBest }) {
  // best 여부에 따라 클래스 분기 (CSS 토큰만 사용)
  const cls = isBest ? 'm-compare-cell m-compare-cell--best' : 'm-compare-cell';
  return (
    <div className={cls}>
      {isBest && (
        <span className="m-compare-cell-check" aria-label="이 지표에서 우수">
          <IconCheck size={11} stroke={2.5} />
        </span>
      )}
      <span className="m-compare-cell-num">{fmt(value)}</span>
      {unit && <span className="m-compare-cell-unit">{unit}</span>}
    </div>
  );
}
