// 모바일 빈 결과 상태
// - 일러스트 없이 간결한 텍스트 + 복구 액션 (이모지 금지, DS Icons 활용)
import { Button } from '../../ds/Button.jsx';
import { IconSearch } from '../../ds/Icons.jsx';

export function EmptyState({ query, hasActiveFilters, onResetFilters, onClearSearch }) {
  // 어떤 상황의 빈 결과인지에 따라 메시지/액션 분기
  const hasQuery = Boolean(query);
  let title = '조건에 맞는 제품이 없어요';
  let desc = '필터를 완화하거나 다른 조건으로 시도해 보세요.';
  if (hasQuery && !hasActiveFilters) {
    title = `"${query}"에 대한 결과가 없어요`;
    desc = '검색어를 바꾸거나 추천 검색어를 사용해 보세요.';
  } else if (hasQuery && hasActiveFilters) {
    title = `"${query}" + 적용 필터로 찾을 수 있는 제품이 없어요`;
    desc = '필터를 초기화하거나 검색어를 지워 보세요.';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: 'var(--gray-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          marginBottom: 8,
        }}
      >
        <IconSearch size={24} />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          maxWidth: 280,
        }}
      >
        {desc}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {hasActiveFilters && (
          <Button variant="brand" size="sm" onClick={onResetFilters}>
            필터 초기화
          </Button>
        )}
        {hasQuery && (
          <Button variant="secondary" size="sm" onClick={onClearSearch}>
            검색 지우기
          </Button>
        )}
      </div>
    </div>
  );
}
