import { X } from 'lucide-react';
import SortMenu from './SortMenu.jsx';

// 결과 헤더 — 검색어 칩(있을 때) + 결과 카운트 + 정렬 드롭다운(우측)
// - 검색어가 없으면 "{목적명} 추천 제품 N개"
// - 검색어가 있으면 검색어 chip("× 닫기" 가능) + 결과 N개
export default function ResultHeader({ query, purposeLabel, count, sortKey, onSortChange, onClearQuery }) {
  return (
    <div className="d-list-result-header">
      <div className="d-list-result-header-left">
        {query ? (
          <SearchChip query={query} onClear={onClearQuery} />
        ) : (
          <div className="d-list-result-purpose">{purposeLabel} 추천 제품</div>
        )}
        <div className="d-list-result-count">
          검색 결과 <strong>{count}</strong>개
        </div>
      </div>
      <SortMenu value={sortKey} onChange={onSortChange} />
    </div>
  );
}

// 검색어 칩 — 클릭 시 검색어 제거 (전체 보기)
function SearchChip({ query, onClear }) {
  return (
    <button
      type="button"
      className="d-list-search-chip"
      onClick={onClear}
      aria-label={`검색어 "${query}" 지우기`}
      title="검색어 지우기"
    >
      <span className="d-list-search-chip-text">"{query}"</span>
      <X size={14} aria-hidden />
    </button>
  );
}
