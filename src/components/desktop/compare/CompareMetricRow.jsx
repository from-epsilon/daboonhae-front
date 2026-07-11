// 데스크탑 비교 - 영양소 1행 (라벨 + 제품별 셀들)
// - 행 자체가 grid: 160px(라벨) + 데이터 컬럼들(각 1fr)
// - 우수값(best)은 텍스트 컬러로만 강조
import { getCompareMetricPresentation } from '../../../data/compareKpis.js';

// 숫자 포맷 (정수면 그대로, 소수는 한 자리)
function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '-';
  const rounded = Number.isInteger(v) ? v : Math.round(v * 10) / 10;
  return rounded.toLocaleString();
}

function gradeClass(grade) {
  return String(grade ?? '')
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/-/g, 'minus')
    .replace(/[^a-z0-9]/g, '');
}

// 한 제품의 셀 (SRP)
function MetricCell({ productId, value, displayValue, grade, tone, note, unit, isBest, supporting, motionClass, motionStyle }) {
  const cls = [
    'd-compare-metric-cell',
    isBest ? 'd-compare-metric-cell--best' : '',
    supporting ? 'd-compare-metric-cell--supporting' : '',
    motionClass,
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} style={motionStyle} data-compare-product-id={productId}>
      {grade && (
        <span className={`d-compare-metric-grade is-${tone ?? 'neutral'} is-grade-${gradeClass(grade)}${grade === 'N/A' ? ' is-na' : ''}`}>
          {grade}
        </span>
      )}
      <div className="d-compare-metric-value">
        <span className="d-compare-metric-num">{displayValue ?? fmt(value)}</span>
        {unit && value !== null && value !== undefined && (
          <span className="d-compare-metric-unit">{unit}</span>
        )}
      </div>
      {note && <span className="d-compare-metric-note">{note}</span>}
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
  dragState,
}) {
  // 행의 최대값 계산 (막대 정규화 기준)
  const presentations = products.map((product) => (
    metric
      ? getCompareMetricPresentation(product, metric)
      : { value: product?.nutrition?.[metricKey], grade: null, tone: null, note: null, displayValue: null }
  ));
  return (
    <div className={`d-compare-row${metric?.supporting ? ' d-compare-row--supporting' : ''}`} style={rowStyle}>
      <div className="d-compare-row-label">
        <span className="d-compare-row-label-text">{label}</span>
      </div>
      {products.map((p, idx) => {
        const isDragging = dragState?.draggedId != null && String(dragState.draggedId) === String(p.id);
        const isDropTarget = dragState?.draggedId != null
          && String(dragState.targetId) === String(p.id)
          && String(dragState.draggedId) !== String(p.id);
        return (
          <MetricCell
            key={p.id}
            productId={p.id}
            value={presentations[idx].value}
            displayValue={presentations[idx].displayValue}
            grade={presentations[idx].grade}
            tone={presentations[idx].tone}
            note={presentations[idx].note}
            supporting={presentations[idx].supporting}
            unit={unit}
            isBest={bestSet?.has(idx) ?? false}
            motionClass={`${isDragging ? ' is-column-dragging' : ''}${isDropTarget ? ` is-column-drop-${dragState.dropPosition}` : ''}`}
            motionStyle={isDragging ? { transform: `translateX(${dragState.dragOffsetX}px)` } : undefined}
          />
        );
      })}
      {/* AddSlot 컬럼 자리 — 빈 셀로 컬럼 정렬 보존 */}
      {hasAdd && <div className="d-compare-metric-cell d-compare-metric-cell--empty" />}
    </div>
  );
}
