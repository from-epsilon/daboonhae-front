// 데스크탑 비교 - 자동 태그 행 & Trust 배지 행
// - 각 제품 컬럼에 Badge 스택 (세로 정렬)
// - 태그 없으면 dash로 빈 셀 표시
import { Badge } from '../../ds/Badge.jsx';

// 공통 셀 (SRP)
function TagsCell({ items, kind }) {
  if (!items || items.length === 0) {
    return (
      <div className={`d-compare-tags-cell d-compare-tags-cell--${kind}`}>
        <span className="d-compare-tags-empty">-</span>
      </div>
    );
  }
  return (
    <div className={`d-compare-tags-cell d-compare-tags-cell--${kind}`}>
      <div className="d-compare-tags-stack">
        {items.map((t, i) => (
          <Badge key={`${t.label}-${i}`} variant={t.v}>
            {t.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function CompareTagsRow({ label, products, rowStyle, hasAdd }) {
  return (
    <div className="d-compare-row" style={rowStyle}>
      <div className="d-compare-row-label">
        <span className="d-compare-row-label-text">{label}</span>
        <span className="d-compare-row-hint">특성 자동 분류</span>
      </div>
      {products.map((p) => (
        <TagsCell key={p.id} items={p.tags} kind="auto" />
      ))}
      {hasAdd && <div className="d-compare-tags-cell d-compare-tags-cell--empty" />}
    </div>
  );
}

export function CompareTrustRow({ label, products, rowStyle, hasAdd }) {
  return (
    <div className="d-compare-row d-compare-row--trust" style={rowStyle}>
      <div className="d-compare-row-label">
        <span className="d-compare-row-label-text">{label}</span>
        <span className="d-compare-row-hint">데이터 출처</span>
      </div>
      {products.map((p) => (
        <TagsCell key={p.id} items={p.trustBadges} kind="trust" />
      ))}
      {hasAdd && <div className="d-compare-tags-cell d-compare-tags-cell--empty" />}
    </div>
  );
}
