// 모바일 디테일 페이지 (Round 3)
// 구조: AppBar(서브) → Hero → MacroRow → 자동 태그 → 영양표 → 분석 리포트 → 원료 → 후기 → sticky CTA bar
// - 모바일 셸은 디테일에서 BottomNav 숨김 (App.jsx 처리). 본문 하단은 sticky CTA용 padding 확보
// - AppBar/CTA는 페이지가 직접 렌더
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { productPath, parseProductId } from '../../data/productUrl.js';
import { useCategoryProducts, useProductDetail } from '../../store/ProductsContext.jsx';
import { getAdapted } from '../../data/adapters.js';
import { getFoodTypeByCode } from '../../data/categoryTabs.js';
import { cheapestUnitPrice, getCategoryCardConfig } from '../../data/categoryCardMetrics.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { useWishlist } from '../../store/WishlistContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { Button } from '../../components/ds/Button.jsx';
import { MacroRow } from '../../components/ds/MacroRow.jsx';
import { HeroSection } from '../../components/mobile/detail/HeroSection.jsx';
import { NutritionTable } from '../../components/mobile/detail/NutritionTable.jsx';
import { AnalysisReport } from '../../components/desktop/detail/AnalysisReport.jsx';
import { ProductNotice } from '../../components/mobile/detail/ProductNotice.jsx';
import { ReviewSection } from '../../components/mobile/detail/ReviewSection.jsx';
import { CategoryGuideCard } from '../../components/mobile/detail/CategoryGuideCard.jsx';
import { RelatedProducts } from '../../components/mobile/detail/RelatedProducts.jsx';
import { StickyCTA } from '../../components/mobile/detail/StickyCTA.jsx';
import PurchaseOffers from '../../components/global/PurchaseOffers.jsx';
import Seo from '../../components/global/Seo.jsx';
import { productLd, breadcrumbLd } from '../../data/jsonLd.js';
import { buildProductBreadcrumb } from '../../data/breadcrumb.js';
import '../DetailPage.css';
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

function getDetailCardConfig(categoryCode) {
  const foodType = getFoodTypeByCode(categoryCode);
  return foodType ? getCategoryCardConfig(foodType.tab, foodType.label) : null;
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

function LoadErrorState({ onRetry }) {
  return (
    <div className="m-detail-empty">
      <p className="m-detail-empty-msg">제품 정보를 불러오지 못했어요.</p>
      <Button variant="brand" onClick={onRetry}>다시 시도</Button>
    </div>
  );
}

const SECTIONS = [
  { id: 'analysis', label: '분석 리포트' },
  { id: 'reviews', label: '후기' },
];

function SectionNav({ activeId, navRef }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    const nav = navRef?.current;
    if (!el) return;
    const navH = nav ? nav.offsetHeight : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - 52 - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav className="m-detail-section-nav" ref={navRef} aria-label="섹션 이동">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => handleClick(e, s.id)}
          className={`m-detail-section-nav-item${activeId === s.id ? ' is-active' : ''}`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

function useActiveSection(productId) {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    setActiveId(SECTIONS[0].id);

    const onScroll = () => {
      const nav = document.querySelector('.m-detail-section-nav');
      const line = (nav ? nav.getBoundingClientRect().bottom : 100) + 16;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = SECTIONS[SECTIONS.length - 1].id;
      setActiveId(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [productId]);

  return activeId;
}

export default function DetailPageMobile() {
  const { id: routeParam } = useParams();
  const id = parseProductId(routeParam); // 슬러그-ID 또는 순수 ID에서 ID만 추출
  const navigate = useNavigate();
  const { has, toggle, isFull, max, count } = useCompare();
  const wishlist = useWishlist();
  const activeSection = useActiveSection(id);
  const navRef = useRef(null);

  // raw 제품 → DS 형식 변환 (adapter는 raw도 들고 있어 분석에 그대로 활용 가능)
  const { product: raw, loading, error } = useProductDetail(id);
  const { products: categoryProducts } = useCategoryProducts(raw?.categoryCode);
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
  if (error) {
    return (
      <>
        <AppBar onBack={() => navigate(-1)} title="제품 정보" />
        <LoadErrorState onRetry={() => window.location.reload()} />
      </>
    );
  }
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
  const inWishlist = wishlist.has(product.id);
  const detailConfig = getDetailCardConfig(raw?.categoryCode);
  const showMacroSection = detailConfig?.showMacroBar !== false && !detailConfig?.macroBarVariant;

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
        onWishlist={() => navigate('/wishlist')}
        wishlistCount={wishlist.count}
      />

      <div className="m-detail">
        {/* 1. 히어로: 이미지 + 브랜드/이름 + 태그 + 신뢰 배지 */}
        <HeroSection product={product} config={detailConfig} />
        <PurchaseOffers
          offers={product.purchaseLinks}
          productId={product.id}
          className="m-detail-purchase-offers"
          sortBy="unit-first"
          pricePer={detailConfig?.purchasePricePer ?? 'unit'}
          servingsPerUnit={product.servingsPerUnit}
          showUpdatedAt
        />

        {/* 2. 매크로 분포 */}
        {showMacroSection && <MacroSection macros={product.macros} />}

        {/* 3. 영양성분표 + 펼침 안 추가 안내 */}
        <NutritionTable
          nutrition={product.nutrition}
          serving={product.serving}
          foodNutrients={raw?._raw?.foodNutrients}
          categoryCode={raw?.categoryCode}
          servingSize={product.servingSize}
          servingUnit={product.servingUnit}
          unitPrice={cheapestUnitPrice(product)}
        >
          <ProductNotice
            additionalContent={raw?._raw?.additionalContent}
            cautionNotes={raw?._raw?.cautionNotes}
            crossContamination={raw?._raw?.crossContaminationText}
            embedded
          />
        </NutritionTable>

        {/* 4. 선택 가이드 — 데스크탑 aside와 같은 보조 정보, 주요 영양 정보 뒤에 배치 */}
        <CategoryGuideCard category={raw?.category} />

        {/* 4-1. 섹션 앵커 탭 */}
        <SectionNav activeId={activeSection} navRef={navRef} />

        {/* 5. 분석 리포트 — 데스크탑과 동일한 리포트 컴포넌트 사용 */}
        <div id="analysis">
          <AnalysisReport
            product={product}
            products={categoryProducts}
            nutrition={n}
            ingredients={product.ingredients}
            category={raw?.category}
            categoryCode={raw?.categoryCode}
            foodNutrients={raw?._raw?.foodNutrients}
            additionalContent={raw?._raw?.additionalContent}
            servingSize={raw?._raw?.servingSize}
            servingUnit={raw?._raw?.servingUnit}
            rawText={raw?._raw?.ingredientsText}
            annotations={raw?._raw?.ingredientAnnotations}
          />
        </div>

        {/* 6. 후기 */}
        <div id="reviews">
          <ReviewSection productId={product.id} />
        </div>

        {/* 7. 비슷한 제품 (같은 제품군 우선, 없으면 같은 카테고리) */}
        <RelatedProducts currentRaw={raw} allProducts={categoryProducts} />
      </div>

      {/* 7. 하단 sticky CTA */}
      <StickyCTA
        inCart={inCart}
        onToggleCompare={handleToggleCompare}
        inWishlist={inWishlist}
        onToggleWishlist={() => wishlist.toggle(product.id)}
      />
    </>
  );
}
