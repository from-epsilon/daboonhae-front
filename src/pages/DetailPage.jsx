// 데스크탑 디테일 페이지 (Round 4)
// 구조:
//   - 상단: 뒤로 가기 링크 (간단한 breadcrumb 톤)
//   - 본문 2단(40 / 60):
//       좌측: ProductHero(큰 이미지 + 액션 라인) + RelatedProducts(같은 카테고리)
//       우측(sticky): ScoreCard(브랜드/이름/점수/태그/매크로/CTA)
//   - 풀폭 섹션 (본문 아래, 1240px max-width 안):
//       NutritionTable / AnalysisReport / IngredientList / ReviewSection
// 모바일과 분리됨 (모바일은 pages/mobile/DetailPage.jsx, sticky CTA + 카드 스택)
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../data/mockProducts.js';
import { getAdapted } from '../data/adapters.js';
import { useCompare } from '../store/CompareContext.jsx';
import { usePurpose } from '../store/PurposeContext.jsx';
import { Button } from '../components/ds/Button.jsx';
import { IconBack } from '../components/ds/Icons.jsx';
import { ProductHero } from '../components/desktop/detail/ProductHero.jsx';
import { ScoreCard } from '../components/desktop/detail/ScoreCard.jsx';
import { NutritionTable } from '../components/desktop/detail/NutritionTable.jsx';
import { AnalysisReport } from '../components/desktop/detail/AnalysisReport.jsx';
import { IngredientList } from '../components/desktop/detail/IngredientList.jsx';
import { ReviewSection } from '../components/desktop/detail/ReviewSection.jsx';
import { RelatedProducts } from '../components/desktop/detail/RelatedProducts.jsx';
import './DetailPage.css';

// 제품 없음 안내 — 홈으로 이동
function EmptyState() {
  return (
    <div className="page d-detail-empty">
      <p className="d-detail-empty-msg">존재하지 않는 제품이에요.</p>
      <Link className="d-detail-empty-link" to="/">메인으로 가기</Link>
    </div>
  );
}

// 상단 뒤로 가기 — breadcrumb 톤 (간단)
function BackLine({ onBack, category }) {
  return (
    <div className="d-detail-back">
      <button type="button" className="d-detail-back-btn" onClick={onBack}>
        <IconBack size={16} />
        <span>뒤로</span>
      </button>
      {category && (
        <span className="d-detail-back-crumb">
          <span className="d-detail-back-crumb-sep">/</span>
          {category}
        </span>
      )}
    </div>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { has, toggle, isFull, max } = useCompare();
  const { purpose } = usePurpose();

  // raw 제품 → DS 형식 변환 (adapter는 raw 도 포함하므로 분석 그대로 활용)
  const raw = getProductById(id);
  const product = raw ? getAdapted(raw) : null;

  // 제품 없음 — 빈 상태
  if (!product) {
    return <EmptyState />;
  }

  const inCart = has(product.id);

  // 비교함 토글 — 가득 차고 새로 담으려 하면 안내
  const handleToggleCompare = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있어요.`);
      return;
    }
    toggle(product.id);
  };

  // 관련 제품 클릭 — 디테일로 이동 (같은 라우트 push)
  const handleRelatedNavigate = (nextId) => {
    navigate(`/product/${nextId}`);
  };

  // 뒤로 가기 — 히스토리 1단계, 없으면 메인
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="page d-detail">
      <BackLine onBack={handleBack} category={raw?.category} />

      {/* 본문 2단: 좌측 이미지/관련 + 우측 정보(sticky) */}
      <div className="d-detail-layout">
        <div className="d-detail-col-left">
          <ProductHero product={product} />
          <RelatedProducts
            currentProduct={raw}
            onNavigate={handleRelatedNavigate}
            limit={3}
          />
        </div>
        <aside className="d-detail-col-right">
          <ScoreCard
            product={product}
            inCart={inCart}
            isFull={isFull}
            max={max}
            onToggleCompare={handleToggleCompare}
            purchaseUrl={raw?.purchaseUrl}
          />
        </aside>
      </div>

      {/* 풀폭 섹션들 — 가로 전체 활용 */}
      <div className="d-detail-sections">
        <NutritionTable nutrition={product.nutrition} serving={product.serving} />
        <AnalysisReport rawProduct={raw} purpose={purpose} />
        <IngredientList ingredients={product.ingredients} />
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
