import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { productPath, parseProductId } from '../data/productUrl.js';
import { useProductById, useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { categoryPath } from '../data/categoryTabs.js';
import { getFoodTypeByCode } from '../data/categoryTabs.js';
import { getCategoryCardConfig, getPrimaryMetricsByCode } from '../data/categoryCardMetrics.js';
import { formatProteinSourceLabel, formatSweetenerLabel } from '../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../data/proteinQuality.js';
import { useCompare } from '../store/CompareContext.jsx';

import { Check } from 'lucide-react';
import ProductThumb from '../components/global/ProductThumb.jsx';
import { MacroRow } from '../components/ds/MacroRow.jsx';
import { TieredPrimaryTable } from '../components/ds/FoodCard.jsx';
import { NutritionTable } from '../components/desktop/detail/NutritionTable.jsx';
import { AnalysisReport } from '../components/desktop/detail/AnalysisReport.jsx';
import { ProductNotice } from '../components/desktop/detail/ProductNotice.jsx';
import { CategoryGuide } from '../components/desktop/detail/CategoryGuide.jsx';
import { ReviewSection } from '../components/desktop/detail/ReviewSection.jsx';
import { RelatedProducts } from '../components/desktop/detail/RelatedProducts.jsx';
import PurchaseOffers from '../components/global/PurchaseOffers.jsx';
import Seo from '../components/global/Seo.jsx';
import { productLd, breadcrumbLd } from '../data/jsonLd.js';
import { buildProductBreadcrumb } from '../data/breadcrumb.js';
import './DetailPage.css';

function EmptyState() {
  return (
    <div className="page d-detail-empty">
      <Seo title="존재하지 않는 제품" noindex />
      <p className="d-detail-empty-msg">존재하지 않는 제품이에요.</p>
      <Link className="d-detail-empty-link" to="/">메인으로 가기</Link>
    </div>
  );
}

// #9 풀 breadcrumb — 카테고리 경로형 URL(/category/:slug)
function getCategoryListHref(categoryCode) {
  return categoryPath(categoryCode);
}

function Breadcrumb({ category, categoryCode, productName, onBack }) {
  const categoryHref = getCategoryListHref(categoryCode, category);

  return (
    <nav className="d-detail-breadcrumb" aria-label="경로">
      <Link to="/" className="d-detail-breadcrumb-link">홈</Link>
      <span className="d-detail-breadcrumb-sep">/</span>
      <Link to="/list" className="d-detail-breadcrumb-link">제품 목록</Link>
      {category && (
        <>
          <span className="d-detail-breadcrumb-sep">/</span>
          <Link to={categoryHref} className="d-detail-breadcrumb-link">{category}</Link>
        </>
      )}
      <span className="d-detail-breadcrumb-sep">/</span>
      <span className="d-detail-breadcrumb-current">{productName}</span>
    </nav>
  );
}

// 핵심 지표 표 — 리스트 카드와 동일한 단백질/EAA/류신/BCAA × 총량·100kcal당·1,000원당
function PrimaryMetricsSummary({ food, metrics }) {
  const priceBasis = metrics?.some((metric) => metric.pricePer === 'serving') ? '1회분당' : '개당';
  return (
    <div className="d-detail-metrics">
      <span className="d-detail-metrics-title">핵심 지표</span>
      <TieredPrimaryTable food={food} metrics={metrics} />
      <p className="d-detail-metrics-note">1,000원당 값은 등록된 구매링크의 {priceBasis} 최저가 기준이며, 실제 판매가와 다를 수 있어요.</p>
    </div>
  );
}

function formatHeaderNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  return value >= 100 ? Math.round(value).toLocaleString() : (Math.round(value * 10) / 10).toLocaleString();
}

function getDetailCardConfig(categoryCode) {
  const foodType = getFoodTypeByCode(categoryCode);
  return foodType ? getCategoryCardConfig(foodType.tab, foodType.label) : null;
}

function ProductServingMeta({ product, explicit = false }) {
  const parts = [];
  if (product.serving) parts.push(explicit ? `1회 제공량 ${product.serving}` : product.serving);
  const calories = formatHeaderNumber(product.nutrition?.calories);
  if (calories !== null) parts.push(`${calories}kcal`);
  if (parts.length === 0) return null;
  return <span className="d-detail-header-serving">{parts.join(' · ')}</span>;
}

function DetailIngredientFacts({ product, config }) {
  const sources = config?.showProteinSource ? (product.ingredients?.proteinSources ?? []) : [];
  const sweeteners = config?.showSweetenerMeta ? (product.ingredients?.sweeteners ?? product.sweeteners ?? []) : [];
  const proteinResolver = useProteinResolver(sources);
  const sweetenerResolver = useSweetenerResolver(sweeteners);
  const rows = [];

  if (sources.length > 0) {
    rows.push({
      key: 'protein',
      label: '단백질원',
      value: [...new Set(sources.map((source) => formatProteinSourceLabel(source, proteinResolver)))].join(' · '),
    });
  }
  if (config?.showSweetenerMeta) {
    rows.push({
      key: 'sweetener',
      label: '대체당',
      value: sweeteners.length > 0
        ? [...new Set(sweeteners.map((sweetener) => formatSweetenerLabel(sweetener, sweetenerResolver)))].join(' · ')
        : '없음',
    });
  }
  if (rows.length === 0) return null;

  return (
    <div className="d-detail-facts-meta">
      {rows.map((row) => (
        <div className="d-detail-facts-meta-row" key={row.key}>
          <span className="d-detail-facts-meta-label">{row.label}</span>
          <span className="d-detail-facts-meta-value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function DetailSummaryFacts({ product, config }) {
  const showMacro = config?.macroBarVariant || config?.showMacroBar !== false;
  const hasMacro = showMacro && product.macros && (
    Number(product.macros.carbs) > 0 ||
    Number(product.macros.protein) > 0 ||
    Number(product.macros.fat) > 0
  );

  return (
    <div className="d-detail-facts">
      <ProductServingMeta
        product={product}
        explicit={config?.servingMetaVariant === 'explicit'}
      />
      {hasMacro && (
        <MacroRow
          {...product.macros}
          variant={config?.macroBarVariant ?? 'mini'}
          ratioOnly
        />
      )}
      <DetailIngredientFacts product={product} config={config} />
    </div>
  );
}

function ProductOverview({ product, raw, nutrition, inCart, onToggleCompare, detailOpen, onToggleDetail }) {
  const primaryMetrics = getPrimaryMetricsByCode(raw?.categoryCode);
  const config = getDetailCardConfig(raw?.categoryCode);
  const titleVariant = config?.titleVariant === 'size' ? product.sizeVariantLabel : '';

  return (
    <section className="d-detail-overview">
      {/* 상단: 제품 이미지 + 제목·핵심지표 */}
      <div className="d-detail-overview-grid">
        <div className="d-detail-overview-media">
          <div className="d-detail-overview-thumb">
            <ProductThumb
              product={product}
              size="card"
              priority
              alt={`${product.brand ? product.brand + ' ' : ''}${product.name}`}
            />
          </div>
          <CompareButton inCart={inCart} onClick={onToggleCompare} />
        </div>
        <div className="d-detail-overview-body">
          <div className="d-detail-overview-titlebar">
            <div className="d-detail-overview-title">
              <span className="d-detail-header-brand">{product.brand}</span>
              <h1 className="d-detail-header-name">
                {product.name}
                {titleVariant && <span className="d-detail-header-variant">{titleVariant}</span>}
              </h1>
            </div>
          </div>
          <DetailSummaryFacts product={product} config={config} />
          {primaryMetrics && <PrimaryMetricsSummary food={product} metrics={primaryMetrics} />}
        </div>
      </div>

      {/* 하단: 영양성분(기본 열·탄·단·지) + 펼침 시 전체 성분·추가 안내 */}
      <div className="d-detail-overview-nutri">
        <NutritionTable
          nutrition={nutrition}
          serving={product.serving}
          foodNutrients={raw?._raw?.foodNutrients}
          servingSize={raw?._raw?.servingSize}
          servingUnit={raw?._raw?.servingUnit}
          categoryCode={raw?.categoryCode}
          expanded={detailOpen}
          onToggleExpand={onToggleDetail}
        />
        {detailOpen && (
          <ProductNotice
            additionalContent={raw?._raw?.additionalContent}
            cautionNotes={raw?._raw?.cautionNotes}
            crossContamination={raw?._raw?.crossContaminationText}
            embedded
            collapsible={false}
          />
        )}
      </div>
    </section>
  );
}

// #3 섹션 앵커 탭
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
    const headerH = 64;
    const offset = headerH + navH + 12;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav className="d-detail-section-nav" ref={navRef} aria-label="섹션 이동">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => handleClick(e, s.id)}
          className={`d-detail-section-nav-item${activeId === s.id ? ' is-active' : ''}`}
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
    // 스크롤 위치 기준 — 스티키 탭 바로 아래 라인을 지난 마지막 섹션을 활성화
    // (IntersectionObserver는 '변경된' 항목만 받아 중간/하단에서 강조가 끊김 → 스크롤 계산으로 대체)
    const onScroll = () => {
      const nav = document.querySelector('.d-detail-section-nav');
      // 판정선 여유(+16)는 클릭 스크롤 목적지(nav 아래 +12)보다 커야
      // 도착 직후 해당 섹션이 바로 강조됨(작으면 조금 더 내려야 켜짐)
      const line = (nav ? nav.getBoundingClientRect().bottom : 120) + 16;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      // 페이지 최하단이면 마지막 섹션을 강조(짧은 섹션이 라인에 못 닿는 경우 보정)
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

// #5 비교함 버튼 + 애니메이션 피드백
function CompareButton({ inCart, onClick }) {
  const [flash, setFlash] = useState(false);
  const handleClick = () => {
    onClick();
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };
  return (
    <button
      type="button"
      className={`d-detail-compare-btn${inCart ? ' is-active' : ''}${flash ? ' is-flash' : ''}`}
      onClick={handleClick}
    >
      {inCart && <Check size={16} />}
      <span>{inCart ? '비교함 빼기' : '비교함 담기'}</span>
    </button>
  );
}

export default function DetailPage() {
  const { id: routeParam } = useParams();
  const id = parseProductId(routeParam); // 슬러그-ID 또는 순수 ID에서 ID만 추출
  const navigate = useNavigate();
  const { has, toggle, isFull, max } = useCompare();
  const { products, loading } = useProducts();
  const activeSection = useActiveSection(id);
  const navRef = useRef(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const raw = useProductById(id);
  const product = raw ? getAdapted(raw) : null;

  if (loading) return (
    <div className="page d-detail-skeleton-wrap">
      <div className="d-detail-skeleton-breadcrumb">
        <span className="d-skeleton" style={{ width: '30%', height: 12, borderRadius: 4, display: 'inline-block' }} />
      </div>
      <div className="d-detail-skeleton-body">
        <div className="d-skeleton" style={{ width: 320, height: 320, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="d-skeleton" style={{ width: '25%', height: 12, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '60%', height: 28, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '20%', height: 12, borderRadius: 4, display: 'inline-block' }} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span className="d-skeleton" style={{ width: 100, height: 60, borderRadius: 8, display: 'inline-block' }} />
            <span className="d-skeleton" style={{ width: 100, height: 60, borderRadius: 8, display: 'inline-block' }} />
            <span className="d-skeleton" style={{ width: 100, height: 60, borderRadius: 8, display: 'inline-block' }} />
          </div>
          <span className="d-skeleton" style={{ width: '100%', height: 12, borderRadius: 6, display: 'inline-block', marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
  if (!product) return <EmptyState />;

  // 슬러그-ID 정규 URL로 통일 — 순수 ID(/product/5)나 옛 슬러그로 들어오면 교정
  const canonicalPath = productPath(product);
  if (routeParam !== canonicalPath.slice('/product/'.length)) {
    return <Navigate to={canonicalPath} replace />;
  }

  const inCart = has(product.id);
  const n = product.nutrition ?? {};
  const detailConfig = getDetailCardConfig(raw?.categoryCode);

  const handleToggleCompare = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있어요.`);
      return;
    }
    toggle(product.id);
  };

  // 표시명 — 제품명에 브랜드가 이미 들어있으면 중복 제거 (예: '하림' + '하림 닭가슴살')
  const titleName =
    product.brand && !product.name.includes(product.brand)
      ? `${product.brand} ${product.name}`
      : product.name;
  // 영양 핵심 수치로 메타 설명 구성 (값 없으면 '-')
  const seoDesc =
    `${titleName} · 칼로리 ${n.calories ?? '-'}kcal, 단백질 ${n.protein ?? '-'}g, 당류 ${n.sugar ?? '-'}g. 판매처별 최저가 비교.`;

  return (
    <div className="page d-detail">
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
      <Breadcrumb category={raw?.category} categoryCode={raw?.categoryCode} productName={product.name} />

      {/* 2단 레이아웃 — 좌: 본문 / 우: 가격 비교 sticky 패널 */}
      <div className="d-detail-layout">
        <div className="d-detail-main">
          <ProductOverview
            product={product}
            raw={raw}
            nutrition={n}
            inCart={inCart}
            onToggleCompare={handleToggleCompare}
            detailOpen={detailOpen}
            onToggleDetail={() => setDetailOpen((v) => !v)}
          />

          {/* 섹션 앵커 탭 */}
          <SectionNav activeId={activeSection} navRef={navRef} />

          <div className="d-detail-sections">
            <div id="analysis">
              <AnalysisReport
                product={product}
                products={products}
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
            <div id="reviews">
              <ReviewSection productId={product.id} />
            </div>
            <RelatedProducts
              currentProduct={raw}
              onNavigate={(food) => navigate(productPath(food))}
              limit={4}
            />
          </div>
        </div>

        {/* 우측 가격 비교 패널 — 스크롤 시 고정 */}
        <aside className="d-detail-aside">
          <div className="d-detail-aside-inner">
            <PurchaseOffers
              offers={product.purchaseLinks}
              title="가격 비교"
              showUpdatedAt
              stacked
              sortBy="unit-first"
              pricePer={detailConfig?.purchasePricePer ?? 'unit'}
              servingsPerUnit={product.servingsPerUnit}
            />
            <CategoryGuide category={raw?.category} />
          </div>
        </aside>
      </div>
    </div>
  );
}
