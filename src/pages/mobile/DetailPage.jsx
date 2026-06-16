// 모바일 디테일 페이지 (Round 3)
// 구조: AppBar(서브) → Hero → MacroRow → 자동 태그 → 영양표 → 분석 리포트 → 원료 → 후기 → sticky CTA bar
// - 모바일 셸은 디테일에서 BottomNav 숨김 (App.jsx 처리). 본문 하단은 sticky CTA용 padding 확보
// - AppBar/CTA는 페이지가 직접 렌더
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { productPath, parseProductId } from '../../data/productUrl.js';
import { useProductById, useProducts } from '../../store/ProductsContext.jsx';
import { getAdapted } from '../../data/adapters.js';
import { getPrimaryMetricsByCode } from '../../data/categoryCardMetrics.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { usePurpose } from '../../store/PurposeContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { Button } from '../../components/ds/Button.jsx';
import { MacroRow } from '../../components/ds/MacroRow.jsx';
import { TieredPrimaryTable } from '../../components/ds/FoodCard.jsx';
import { HeroSection } from '../../components/mobile/detail/HeroSection.jsx';
import { NutritionTable } from '../../components/mobile/detail/NutritionTable.jsx';
import { AnalysisCard } from '../../components/mobile/detail/AnalysisCard.jsx';
import { IngredientList } from '../../components/mobile/detail/IngredientList.jsx';
import { ProductNotice } from '../../components/mobile/detail/ProductNotice.jsx';
import { ReviewSection } from '../../components/mobile/detail/ReviewSection.jsx';
import { CategoryGuideCard } from '../../components/mobile/detail/CategoryGuideCard.jsx';
import { RelatedProducts } from '../../components/mobile/detail/RelatedProducts.jsx';
import { StickyCTA } from '../../components/mobile/detail/StickyCTA.jsx';
import PurchaseOffers from '../../components/global/PurchaseOffers.jsx';
import Seo from '../../components/global/Seo.jsx';
import { productLd, breadcrumbLd } from '../../data/jsonLd.js';
import { buildProductBreadcrumb } from '../../data/breadcrumb.js';
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

// 핵심 지표 카드 — 리스트 카드와 동일한 단백질/EAA/BCAA × 총량·100kcal당·1,000원당
function PrimaryMetricsSection({ food, metrics }) {
  return (
    <section className="m-detail-card m-detail-metrics">
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">핵심 지표</h2>
      </header>
      <TieredPrimaryTable food={food} metrics={metrics} />
      <p className="m-detail-metrics-note">1,000원당 값은 등록된 구매링크의 개당 최저가 기준이에요.</p>
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
  const { id: routeParam } = useParams();
  const id = parseProductId(routeParam); // 슬러그-ID 또는 순수 ID에서 ID만 추출
  const navigate = useNavigate();
  const { has, toggle, isFull, max, count } = useCompare();
  const { purpose, purposeId } = usePurpose();

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
        <Seo title="존재하지 않는 제품" noindex />
        <AppBar onBack={() => navigate('/')} title="제품 정보" />
        <EmptyState onHome={() => navigate('/')} />
      </>
    );
  }

  // 슬러그-ID 정규 URL로 통일 — 순수 ID나 옛 슬러그로 들어오면 교정
  const canonicalPath = productPath(product);
  if (routeParam !== canonicalPath.slice('/product/'.length)) {
    return <Navigate to={canonicalPath} replace />;
  }

  const inCart = has(product.id);
  // 핵심 지표 표 — 1순위 지표가 있는 카테고리(단백질 음료 등)만 노출
  const primaryMetrics = getPrimaryMetricsByCode(raw?.categoryCode);

  // 비교함 토글 — 가득 차고 새로 담으려 하면 안내
  const handleToggleCompare = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있어요.`);
      return;
    }
    toggle(product.id);
  };

  const n = product.nutrition ?? {};
  // 표시명 — 제품명에 브랜드가 이미 들어있으면 중복 제거
  const titleName =
    product.brand && !product.name.includes(product.brand)
      ? `${product.brand} ${product.name}`
      : product.name;
  const seoDesc =
    `${titleName} · 칼로리 ${n.calories ?? '-'}kcal, 단백질 ${n.protein ?? '-'}g, 당류 ${n.sugar ?? '-'}g. 판매처별 최저가 비교.`;

  return (
    <>
      <Seo
        title={`${titleName} 영양성분·가격 비교`}
        description={seoDesc}
        canonicalPath={canonicalPath}
        ogImage={product.thumb || undefined}
        ogType="article"
        jsonLd={[
          productLd(product),
          breadcrumbLd(
            buildProductBreadcrumb({
              category: raw?.category,
              categoryCode: raw?.categoryCode,
              productName: product.name,
            }),
          ),
        ]}
      />
      <AppBar
        onBack={() => navigate(-1)}
        title={product.name}
        onCompare={() => navigate('/compare')}
        compareCount={count}
      />

      <div className="m-detail">
        {/* 1. 히어로: 이미지 + 브랜드/이름 + 태그 + 신뢰 배지 */}
        <HeroSection product={product} />
        <PurchaseOffers offers={product.purchaseLinks} className="m-detail-purchase-offers" />

        {/* 2. 선택 가이드 (본문 최상단 섹션, 토글로 접기 가능) */}
        <CategoryGuideCard category={raw?.category} />

        {/* 3. 매크로 분포 */}
        <MacroSection macros={product.macros} />

        {/* 3-1. 핵심 지표 표 (단백질/EAA/BCAA × 총량·100kcal당·1,000원당) */}
        {primaryMetrics && <PrimaryMetricsSection food={product} metrics={primaryMetrics} />}

        {/* 4. 영양성분표 + 펼침 안 원료·추가 안내 */}
        <NutritionTable nutrition={product.nutrition} serving={product.serving} foodNutrients={raw?._raw?.foodNutrients}>
          <IngredientList
            ingredients={product.ingredients}
            rawText={raw?._raw?.ingredientsText}
            annotations={raw?._raw?.ingredientAnnotations}
            embedded
          />
          <ProductNotice
            additionalContent={raw?._raw?.additionalContent}
            cautionNotes={raw?._raw?.cautionNotes}
            crossContamination={raw?._raw?.crossContaminationText}
            embedded
          />
        </NutritionTable>

        {/* 5. 분석 리포트 (목적별 룰 기반) */}
        <AnalysisCard rawProduct={raw} purpose={purpose} purposeId={purposeId} />

        {/* 6. 후기 */}
        <ReviewSection productId={product.id} />

        {/* 7. 같은 카테고리 다른 제품 (가장 아래) */}
        <RelatedProducts currentRaw={raw} allProducts={allProducts} />
      </div>

      {/* 7. 하단 sticky CTA */}
      <StickyCTA
        inCart={inCart}
        onToggleCompare={handleToggleCompare}
      />
    </>
  );
}
