// 데스크탑 비교 테이블 (메인 그리드)
// 구조:
//   - 좌측 라벨 컬럼(160px) + 데이터 컬럼들(각 1fr, min 180px)
//   - 각 행마다 자체 grid-template-columns 를 동일하게 사용해 컬럼 정렬 보장
// 행 종류:
//   1) 헤더 행: 빈 라벨 셀 + 제품 카드들(썸네일/브랜드/이름/X/Score) [+AddSlot]
//   2) 카테고리별 KPI 행들
import { CompareHeaderRow } from './CompareHeaderRow.jsx';
import { CompareMetricRow } from './CompareMetricRow.jsx';
import { ComparePurchaseRow } from './ComparePurchaseRow.jsx';
import { CompareAddSlot } from './CompareAddSlot.jsx';

// 좌측 라벨 컬럼(160px) + 데이터 컬럼들(각 1fr, min 180px)
function buildGridTemplate(dataColCount) {
  const dataPart = Array(dataColCount).fill('minmax(180px, 1fr)').join(' ');
  return `160px ${dataPart}`;
}

export function CompareTable({
  products,
  bestByKey,
  purchaseBestSet,
  metrics,
  onRemove,
  onOpen,
  onAdd,
  canAdd,
  remaining,
}) {
  const dataColCount = products.length + (canAdd ? 1 : 0);
  const gridTemplate = buildGridTemplate(dataColCount);
  const rowStyle = { gridTemplateColumns: gridTemplate };

  return (
    <section className="d-compare-table" aria-label="제품 비교 표">
      {/* 1) 헤더 행 — 라벨 자리는 비워두고(페이지 헤더가 대체), 각 컬럼에 제품 카드 */}
      <div className="d-compare-row d-compare-row--header" style={rowStyle}>
        <div
          className="d-compare-row-label d-compare-row-label--header"
          aria-hidden="true"
        />
        {products.map((p) => (
          <CompareHeaderRow
            key={p.id}
            product={p}
            onRemove={onRemove}
            onOpen={onOpen}
          />
        ))}
        {canAdd && <CompareAddSlot onClick={onAdd} remaining={remaining} />}
      </div>

      <ComparePurchaseRow
        products={products}
        bestSet={purchaseBestSet}
        rowStyle={rowStyle}
        hasAdd={canAdd}
      />

      {/* 2) KPI 행들 */}
      {metrics.map((m) => (
        <CompareMetricRow
          key={m.key}
          metric={m}
          label={m.label}
          products={products}
          metricKey={m.key}
          unit={m.unit}
          bestSet={bestByKey[m.key]}
          rowStyle={rowStyle}
          hasAdd={canAdd}
        />
      ))}
    </section>
  );
}
