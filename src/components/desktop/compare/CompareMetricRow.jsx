// 데스크탑 비교 - 영양소 1행 (라벨 + 제품별 셀들)
// - 행 자체가 grid: 160px(라벨) + 데이터 컬럼들(각 1fr)
// - 우수값(best)은 텍스트 컬러로만 강조
import { getCompareMetricValue } from '../../../data/compareKpis.js';

// 숫자 포맷 (정수면 그대로, 소수는 한 자리)
function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '-';
  const rounded = Number.isInteger(v) ? v : Math.round(v * 10) / 10;
  return rounded.toLocaleString();
}

// 한 제품의 셀 (SRP)
function MetricCell({ value, unit, isBest }) {
  const cls = isBest
    ? 'd-compare-metric-cell d-compare-metric-cell--best'
    : 'd-compare-metric-cell';

  return (
    <div className={cls}>
      <div className="d-compare-metric-value">
        <span className="d-compare-metric-num">{fmt(value)}</span>
        {unit && value !== null && value !== undefined && (
          <span className="d-compare-metric-unit">{unit}</span>
        )}
      </div>
    </div>
  );
}

export function CompareMetricRow({
  metric,
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
    const v = metric
      ? getCompareMetricValue(p, metric)
      : p?.nutrition?.[metricKey];
    return typeof v === 'number' ? v : null;
  });
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
        />
      ))}
      {/* AddSlot 컬럼 자리 — 빈 셀로 컬럼 정렬 보존 */}
      {hasAdd && <div className="d-compare-metric-cell d-compare-metric-cell--empty" />}
    </div>
  );
}
