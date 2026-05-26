// 데스크탑 비교 - 영양소 1행 (라벨 + 제품별 셀들 + 시각 막대)
// - 행 자체가 grid: 160px(라벨) + 데이터 컬럼들(각 1fr)
// - 각 데이터 셀: 값(숫자 + 단위) + 가로 막대(상대 비율 시각화)
// - 우수값(best)은 그린 배경 pill + IconCheck 강조 (모바일과 동일 패턴)
import { IconCheck } from '../../ds/Icons.jsx';

// 숫자 포맷 (정수면 그대로, 소수는 한 자리)
function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '-';
  return Number.isInteger(v) ? `${v}` : `${Math.round(v * 10) / 10}`;
}

// 각 셀의 막대 너비 비율 계산 (해당 행 최대값 대비, 0~100%)
function getBarPercent(value, maxValue) {
  if (value === null || value === undefined || maxValue === 0) return 0;
  const ratio = value / maxValue;
  return Math.min(100, Math.max(0, ratio * 100));
}

// 한 제품의 셀 (SRP)
function MetricCell({ value, unit, isBest, barPercent, isBarHidden }) {
  const cls = isBest
    ? 'd-compare-metric-cell d-compare-metric-cell--best'
    : 'd-compare-metric-cell';
  return (
    <div className={cls}>
      <div className="d-compare-metric-value">
        {isBest && (
          <span className="d-compare-metric-check" aria-label="이 지표에서 우수">
            <IconCheck size={11} stroke={2.5} />
          </span>
        )}
        <span className="d-compare-metric-num">{fmt(value)}</span>
        {unit && value !== null && value !== undefined && (
          <span className="d-compare-metric-unit">{unit}</span>
        )}
      </div>
      {!isBarHidden && (
        <div className="d-compare-metric-bar" aria-hidden="true">
          <div
            className="d-compare-metric-bar-fill"
            style={{ width: `${barPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function CompareMetricRow({
  label,
  products,
  metricKey,
  unit,
  bestSet,
  rowStyle,
  hasAdd,
}) {
  // 행의 최대값 계산 (막대 정규화 기준)
  const values = products.map((p) => {
    const v = p?.nutrition?.[metricKey];
    return typeof v === 'number' ? v : null;
  });
  const validValues = values.filter((v) => v !== null);
  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
  const isBarHidden =
    maxValue === 0 || validValues.every((v) => v === validValues[0]);

  return (
    <div className="d-compare-row" style={rowStyle}>
      <div className="d-compare-row-label">
        <span className="d-compare-row-label-text">{label}</span>
      </div>
      {products.map((p, idx) => (
        <MetricCell
          key={p.id}
          value={values[idx]}
          unit={unit}
          isBest={bestSet?.has(idx) ?? false}
          barPercent={getBarPercent(values[idx], maxValue)}
          isBarHidden={isBarHidden}
        />
      ))}
      {/* AddSlot 컬럼 자리 — 빈 셀로 컬럼 정렬 보존 */}
      {hasAdd && <div className="d-compare-metric-cell d-compare-metric-cell--empty" />}
    </div>
  );
}
