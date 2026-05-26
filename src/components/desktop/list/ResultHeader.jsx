import { X } from 'lucide-react';
import SortMenu from './SortMenu.jsx';

export default function ResultHeader({ query, count, sortKey, onSortChange, onClearQuery }) {
  return (
    <div className="d-list-result-header">
      <div className="d-list-result-header-left">
        <div className="d-list-result-title">제품 결과 <span className="d-list-result-count">{count}</span></div>
        {query && <SearchChip query={query} onClear={onClearQuery} />}
      </div>
      <SortMenu value={sortKey} onChange={onSortChange} />
    </div>
  );
}

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
