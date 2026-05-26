import { RotateCcw, Search } from 'lucide-react';

// 결과 0개 빈 상태
// - 일러스트 없이 텍스트 + CTA (필터/검색 초기화)
// - 사용자가 처한 상황(필터 활성 vs 검색어 활성 vs 둘 다)에 따라 적절한 액션 노출
export default function EmptyResult({ query, canResetFilters, onResetFilters, onClearQuery }) {
  return (
    <div className="d-list-empty">
      <div className="d-list-empty-icon" aria-hidden>
        <Search size={28} strokeWidth={1.5} />
      </div>
      <div className="d-list-empty-title">조건에 맞는 제품이 없습니다</div>
      <div className="d-list-empty-desc">필터 조건을 완화하거나, 검색어를 다시 확인해 보세요.</div>
      <div className="d-list-empty-actions">
        {canResetFilters && (
          <button type="button" className="d-list-empty-btn d-list-empty-btn-primary" onClick={onResetFilters}>
            <RotateCcw size={14} aria-hidden />
            <span>필터 초기화</span>
          </button>
        )}
        {query && (
          <button type="button" className="d-list-empty-btn" onClick={onClearQuery}>
            <span>"{query}" 검색 지우기</span>
          </button>
        )}
      </div>
    </div>
  );
}
