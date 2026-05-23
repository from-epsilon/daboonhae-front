import { useParams, Link } from 'react-router-dom';
import { Check, Plus, ExternalLink } from 'lucide-react';
import { getProductById } from '../data/mockProducts.js';
import { usePurpose } from '../store/PurposeContext.jsx';
import { useCompare } from '../store/CompareContext.jsx';
import ProductSummary from '../components/detail/ProductSummary.jsx';
import AnalysisReport from '../components/detail/AnalysisReport.jsx';
import ReviewSection from '../components/detail/ReviewSection.jsx';

// 제품 상세 페이지
// - 요약: 카드보다 더 풍부한 정보 (모든 영양·원료·알레르기)
// - 분석 리포트: 현재 목적(purpose)에 따라 다른 섹션 구성
// - 후기(ReviewSection): 사이트 피드백과는 다른, 제품에 대한 사용자 후기
export default function DetailPage() {
  const { id } = useParams();
  const product = getProductById(id);
  const { purpose } = usePurpose();
  const { has, toggle, isFull, max } = useCompare();

  if (!product) {
    return (
      <div className="page detail-page">
        <div className="detail-empty">존재하지 않는 제품입니다. <Link to="/">메인으로</Link></div>
      </div>
    );
  }

  const inCart = has(product.id);

  // 비교함이 가득 찼고, 아직 안 담긴 제품을 추가 시도하면 안내
  const handleToggle = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있습니다.`);
      return;
    }
    toggle(product.id);
  };

  return (
    <div className="page detail-page">
      <div className="detail-grid">
        {/* 좌측: 제품 정보 / 액션 / 후기 — 길어지면 세로로 누적되며 페이지 스크롤 */}
        <div className="detail-main">
          <ProductSummary product={product} />

          <div className="detail-actions">
            <button
              className={`product-cart-btn ${inCart ? 'is-active' : ''}`}
              onClick={handleToggle}
              aria-pressed={inCart}
              title={!inCart && isFull ? `최대 ${max}개까지 담을 수 있습니다` : undefined}
            >
              {inCart ? <Check size={16} aria-hidden /> : <Plus size={16} aria-hidden />}
              <span>{inCart ? '비교함에 담김' : '비교함에 담기'}</span>
            </button>
            <a className="detail-buy" href={product.purchaseUrl} target="_blank" rel="noreferrer">
              <span>구매하러 가기</span>
              <ExternalLink size={16} aria-hidden />
            </a>
          </div>

          <ReviewSection productId={product.id} />
        </div>

        {/* 우측: 분석 리포트는 sticky로 항상 시야에 유지 (좁은 폭에선 1단으로 무너짐) */}
        <aside className="detail-side">
          <AnalysisReport product={product} purpose={purpose} />
        </aside>
      </div>
    </div>
  );
}
