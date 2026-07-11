// 비교 데이터 셀 (지표 라벨 + 값 + 우수값 강조)
// - 각 셀이 자체 라벨을 위에 표기 (좌측 라벨 컬럼 제거 대응)
// - isBest=true 일 때 그린 텍스트로 강조
// - direction=null 이면 강조 없음 (중립 지표)

// 숫자 포맷 (정수면 그대로, 소수는 한 자리)
function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '-';
  const rounded = Number.isInteger(v) ? v : Math.round(v * 10) / 10;
  return rounded.toLocaleString();
}

export function CompareCell({ label, value, displayValue, note, unit, isBest, isRich = false, supporting = false }) {
  // best 여부에 따라 클래스 분기 (CSS 토큰만 사용)
  const cls = [
    'm-compare-cell',
    isBest ? 'm-compare-cell--best' : '',
    isRich ? 'm-compare-cell--rich' : '',
    supporting ? 'm-compare-cell--supporting' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <span className="m-compare-cell-label">{label}</span>
      <span className="m-compare-cell-valrow">
        <span className="m-compare-cell-num">{displayValue ?? fmt(value)}</span>
        {unit && value !== null && value !== undefined && (
          <span className="m-compare-cell-unit">{unit}</span>
        )}
      </span>
      {note && <span className="m-compare-cell-note">{note}</span>}
    </div>
  );
}
