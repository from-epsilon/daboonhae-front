// 모바일 디테일 페이지 (Round 3)
// 구조: AppBar(서브) → Hero → MacroRow → 자동 태그 → 영양표 → 분석 리포트 → 원료 → 후기 → sticky CTA bar
// - 모바일 셸은 디테일에서 BottomNav 숨김 (App.jsx 처리). 본문 하단은 sticky CTA용 padding 확보
// - AppBar/CTA는 페이지가 직접 렌더
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductById, useProducts } from '../../store/ProductsContext.jsx';
import { getAdapted } from '../../data/adapters.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { usePurpose } from '../../store/PurposeContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { Button } from '../../components/ds/Button.jsx';
import { MacroRow } from '../../components/ds/MacroRow.jsx';
import { HeroSection } from '../../components/mobile/detail/HeroSection.jsx';
import { NutritionTable } from '../../components/mobile/detail/NutritionTable.jsx';
import { AnalysisCard } from '../../components/mobile/detail/AnalysisCard.jsx';
import { IngredientList } from '../../components/mobile/detail/IngredientList.jsx';
import { ReviewSection } from '../../components/mobile/detail/ReviewSection.jsx';
import { CategoryGuideCard } from '../../components/mobile/detail/CategoryGuideCard.jsx';
import { RelatedProducts } from '../../components/mobile/detail/RelatedProducts.jsx';
import { StickyCTA } from '../../components/mobile/detail/StickyCTA.jsx';
import { PurchaseSheet } from '../../components/mobile/detail/PurchaseSheet.jsx';
import './DetailPage.css';

// 매크로 분포 카드 — 풀 MacroRow + kcal 별도 노출
function MacroSection({ macros }) {
  return (
    <section className="m-detail-card m-detail-macro">
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">매크로 분포</h2>
        <span className="m-detail-card-sub">
          <b>{macros.kcal}</b>kcal
        </span>
      </header>
      <MacroRow
        protein={macros.protein}
        carbs={macros.carbs}
        fat={macros.fat}
        kcal={macros.kcal}
      />
    </section>
  );
}

// 제품 없음 안내 — 홈으로 가는 버튼
function EmptyState({ onHome }) {
  return (
    <div className="m-detail-empty">
      <p className="m-detail-empty-msg">존재하지 않는 제품이에요.</p>
      <Button variant="brand" onClick={onHome}>메인으로 가기</Button>
    </div>
  );
}

export default function DetailPageMobile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { has, toggle, isFull, max, count } = useCompare();
  const { purpose, purposeId } = usePurpose();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  // raw 제품 → DS 형식 변환 (adapter는 raw도 들고 있어 분석에 그대로 활용 가능)
  const { loading, products: allProducts } = useProducts();
  const raw = useProductById(id);
  const product = raw ? getAdapted(raw) : null;

  if (loading) return (
    <>
      <AppBar onBack={() => navigate(-1)} title="불러오는 중..." />
      <div className="m-detail" style={{ gap: 16, padding: '16px 16px 92px' }}>
        <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--gray-100)', borderRadius: 12 }} className="d-skeleton" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="d-skeleton" style={{ width: '30%', height: 12, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '80%', height: 22, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '50%', height: 12, borderRadius: 4, display: 'inline-block' }} />
        </div>
        <span className="d-skeleton" style={{ width: '100%', height: 80, borderRadius: 12, display: 'inline-block' }} />
        <span className="d-skeleton" style={{ width: '100%', height: 200, borderRadius: 12, display: 'inline-block' }} />
      </div>
    </>
  );
  if (!product) {
    return (
      <>
        <AppBar onBack={() => navigate('/')} title="제품 정보" />
        <EmptyState onHome={() => navigate('/')} />
      </>
    );
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

  return (
    <>
      <AppBar
        onBack={() => navigate(-1)}
        title={product.name}
        onCompare={() => navigate('/compare')}
        compareCount={count}
      />

      <div className="m-detail">
        {/* 1. 히어로: 이미지 + 브랜드/이름 + 태그 + 신뢰 배지 */}
        <HeroSection product={product} />

        {/* 2. 매크로 분포 */}
        <MacroSection macros={product.macros} />

        {/* 3. 선택 가이드 (데스크톱과 동일하게 본문 최상단 섹션) */}
        <CategoryGuideCard category={raw?.category} />

        {/* 4. 영양성분표 */}
        <NutritionTable nutrition={product.nutrition} serving={product.serving} foodNutrients={raw?._raw?.foodNutrients} />

        {/* 5. 원료 · 성분 */}
        <IngredientList ingredients={product.ingredients} />

        {/* 6. 분석 리포트 (목적별 룰 기반) */}
        <AnalysisCard rawProduct={raw} purpose={purpose} purposeId={purposeId} />

        {/* 7. 후기 */}
        <ReviewSection productId={product.id} />

        {/* 8. 같은 카테고리 다른 제품 (가장 아래) */}
        <RelatedProducts currentRaw={raw} allProducts={allProducts} />
      </div>

      {/* 7. 하단 sticky CTA */}
      <StickyCTA
        inCart={inCart}
        onToggleCompare={handleToggleCompare}
        purchaseUrl={raw?.purchaseUrl}
        purchaseLinks={product.purchaseLinks}
        onOpenPurchase={() => setPurchaseOpen(true)}
      />

      {/* 구매처 선택 시트 (오퍼 2곳 이상일 때) */}
      <PurchaseSheet
        open={purchaseOpen}
        offers={product.purchaseLinks}
        onClose={() => setPurchaseOpen(false)}
      />
    </>
  );
}
