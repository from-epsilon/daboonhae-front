import { MessageCircle, RotateCcw, Search } from 'lucide-react';

// 결과 0개 빈 상태
// - 일러스트 없이 텍스트 + CTA (조건 초기화/제품 추가 요청)
// - 사용자가 처한 상황(필터 활성 vs 검색어 활성 vs 둘 다)에 따라 적절한 액션 노출
export default function EmptyResult({
  query,
  hasActiveConditions,
  onResetConditions,
  onRequestProduct,
}) {
  const hasQuery = Boolean(query.trim());
  const title = hasQuery
    ? `"${query}"에 대한 결과가 없어요 😢`
    : '조건에 맞는 제품이 없어요';
  const description = hasQuery
    ? '다분해가 더 열심히 채워둘게요!'
    : '필터 조건을 완화해 보세요.';

  return (
    <div className="d-list-empty">
      <div className="d-list-empty-icon" aria-hidden>
        <Search size={28} strokeWidth={1.5} />
      </div>
      <div className="d-list-empty-title">{title}</div>
      <div className="d-list-empty-desc">
        <span>{description}</span>
        <span>찾는 제품이 아직 등록되지 않았다면 알려주세요.</span>
      </div>
      <div className="d-list-empty-actions">
        {hasActiveConditions && (
          <button type="button" className="d-list-empty-btn" onClick={onResetConditions}>
            <RotateCcw size={14} aria-hidden />
            <span>검색·필터 초기화</span>
          </button>
        )}
        <button
          type="button"
          className="d-list-empty-btn d-list-empty-btn-primary"
          onClick={onRequestProduct}
        >
          <MessageCircle size={14} aria-hidden />
          <span>제품 추가 요청하기</span>
        </button>
      </div>
    </div>
  );
}
