// 모바일 필터·정렬 액션 바
// - 좌: 결과 개수 ("검색 결과 N개")
// - 우: 정렬 버튼 + 필터 버튼 (필터는 활성 개수 배지)
// - 검색어 q 가 있으면 좌측 위에 '"q" 검색 결과' 별도 한 줄
import { IconFilter, IconSort, IconClose, IconChevron } from '../../ds/Icons.jsx';

// 검색어 표시 줄 (있을 때만)
function SearchedQueryRow({ query, onClear }) {
  if (!query) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 16px 4px',
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}
    >
      <span>
        <b style={{ color: 'var(--text-primary)' }}>"{query}"</b> 검색 결과
      </span>
      <button
        type="button"
        onClick={onClear}
        aria-label="검색 지우기"
        style={{
          background: 'var(--gray-100)',
          border: 'none',
          borderRadius: 999,
          padding: 2,
          cursor: 'pointer',
          color: 'var(--text-tertiary)',
          display: 'inline-flex',
        }}
      >
        <IconClose size={12} stroke={2} />
      </button>
    </div>
  );
}

// 좌측 결과 카운트
function ResultsCount({ count }) {
  return (
    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
      총 <b style={{ fontFamily: 'var(--font-numeric)' }}>{count}</b>개
    </div>
  );
}

// 우측 버튼 — 정렬
function SortButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 500,
        padding: '6px 8px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <IconSort size={16} />
      <span>{label}</span>
      <IconChevron size={12} stroke={2} />
    </button>
  );
}

// 우측 버튼 — 필터 (활성 개수 배지)
function FilterButton({ activeCount, onClick }) {
  const active = activeCount > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: active ? 'var(--green-50)' : 'transparent',
        border: '1px solid',
        borderColor: active ? 'var(--green-500)' : 'var(--border-tertiary)',
        borderRadius: 999,
        padding: '5px 11px',
        cursor: 'pointer',
        color: active ? 'var(--green-700)' : 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
      }}
    >
      <IconFilter size={14} />
      <span>필터{active ? ` ${activeCount}` : ''}</span>
    </button>
  );
}

export function ActionBar({
  count,
  query,
  onClearQuery,
  sortLabel,
  onOpenSort,
  filterActiveCount,
  onOpenFilter,
}) {
  return (
    <div
      style={{
        background: 'white',
        borderBottom: '1px solid var(--border-tertiary)',
        flexShrink: 0,
      }}
    >
      <SearchedQueryRow query={query} onClear={onClearQuery} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px 10px',
        }}
      >
        <ResultsCount count={count} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <SortButton label={sortLabel} onClick={onOpenSort} />
          <FilterButton activeCount={filterActiveCount} onClick={onOpenFilter} />
        </div>
      </div>
    </div>
  );
}
