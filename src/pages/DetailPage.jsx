import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductById, useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { CATEGORY_TABS } from '../data/categoryTabs.js';
import { getPrimaryMetricsByCode } from '../data/categoryCardMetrics.js';
import { useCompare } from '../store/CompareContext.jsx';

import { Check } from 'lucide-react';
import ProductThumb from '../components/global/ProductThumb.jsx';
import { TieredPrimaryTable } from '../components/ds/FoodCard.jsx';
import { NutritionTable } from '../components/desktop/detail/NutritionTable.jsx';
import { AnalysisReport } from '../components/desktop/detail/AnalysisReport.jsx';
import { IngredientList } from '../components/desktop/detail/IngredientList.jsx';
import { ProductNotice } from '../components/desktop/detail/ProductNotice.jsx';
import { CategoryGuide } from '../components/desktop/detail/CategoryGuide.jsx';
import { ReviewSection } from '../components/desktop/detail/ReviewSection.jsx';
import { RelatedProducts } from '../components/desktop/detail/RelatedProducts.jsx';
import PurchaseOffers from '../components/global/PurchaseOffers.jsx';
import './DetailPage.css';

function EmptyState() {
  return (
    <div className="page d-detail-empty">
      <p className="d-detail-empty-msg">존재하지 않는 제품이에요.</p>
      <Link className="d-detail-empty-link" to="/">메인으로 가기</Link>
    </div>
  );
}

// #9 풀 breadcrumb
function getCategoryListHref(categoryCode, category) {
  const tab = CATEGORY_TABS.find((t) => t.subs.some((s) => s.code === categoryCode));
  const sub = tab?.subs.find((s) => s.code === categoryCode);
  if (tab && sub) return `/list?tab=${tab.id}&sub=${encodeURIComponent(sub.label)}`;
  return category ? `/list?q=${encodeURIComponent(category)}` : '/list';
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

// 핵심 지표 표 — 리스트 카드와 동일한 단백질/EAA/BCAA × 총량·100kcal당·1,000원당
function PrimaryMetricsSummary({ food, metrics }) {
  return (
    <div className="d-detail-metrics">
      <span className="d-detail-metrics-title">핵심 지표</span>
      <TieredPrimaryTable food={food} metrics={metrics} />
      <p className="d-detail-metrics-note">1,000원당 값은 등록된 구매링크의 개당 최저가 기준이며, 실제 판매가와 다를 수 있어요.</p>
    </div>
  );
}

function ProductOverview({ product, raw, nutrition, inCart, onToggleCompare, detailOpen, onToggleDetail }) {
  const primaryMetrics = getPrimaryMetricsByCode(raw?.categoryCode);

  return (
    <section className="d-detail-overview">
      {/* 상단: 제품 이미지 + 제목·핵심지표 */}
      <div className="d-detail-overview-grid">
        <div className="d-detail-overview-media">
          <div className="d-detail-overview-thumb">
            <ProductThumb product={product} size="card" />
          </div>
          <CompareButton inCart={inCart} onClick={onToggleCompare} />
        </div>
        <div className="d-detail-overview-body">
          <div className="d-detail-overview-titlebar">
            <div className="d-detail-overview-title">
              <span className="d-detail-header-brand">{product.brand}</span>
              <h1 className="d-detail-header-name">{product.name}</h1>
              <span className="d-detail-header-serving">{product.serving}</span>
            </div>
          </div>
          {primaryMetrics && <PrimaryMetricsSummary food={product} metrics={primaryMetrics} />}
        </div>
      </div>

      {/* 하단: 영양성분(기본 열·탄·단·지) + 펼침 시 전체 성분·원재료 — 같은 박스 내 */}
      <div className="d-detail-overview-nutri">
        <NutritionTable
          nutrition={nutrition}
          serving={product.serving}
          foodNutrients={raw?._raw?.foodNutrients}
          servingSize={raw?._raw?.servingSize}
          servingUnit={raw?._raw?.servingUnit}
          expanded={detailOpen}
          onToggleExpand={onToggleDetail}
        />
        {detailOpen && (
          <IngredientList
            ingredients={product.ingredients}
            rawText={raw?._raw?.ingredientsText}
            annotations={raw?._raw?.ingredientAnnotations}
          />
        )}
      </div>
    </section>
  );
}

// #3 섹션 앵커 탭
const SECTIONS = [
  { id: 'guide', label: '선택 가이드' },
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { has, toggle, isFull, max } = useCompare();
  const { loading } = useProducts();
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

  const inCart = has(product.id);
  const n = product.nutrition ?? {};

  const handleToggleCompare = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있어요.`);
      return;
    }
    toggle(product.id);
  };

  return (
    <div className="page d-detail">
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
            <div id="guide">
              <CategoryGuide category={raw?.category} />
            </div>
            <div id="analysis">
              <AnalysisReport
                nutrition={n}
                ingredients={product.ingredients}
                category={raw?.category}
                categoryCode={raw?.categoryCode}
                foodNutrients={raw?._raw?.foodNutrients}
              />
            </div>
            <ProductNotice
              additionalContent={raw?._raw?.additionalContent}
              cautionNotes={raw?._raw?.cautionNotes}
              crossContamination={raw?._raw?.crossContaminationText}
            />
            <div id="reviews">
              <ReviewSection productId={product.id} />
            </div>
            <RelatedProducts
              currentProduct={raw}
              onNavigate={(nextId) => navigate(`/product/${nextId}`)}
              limit={4}
            />
          </div>
        </div>

        {/* 우측 가격 비교 패널 — 스크롤 시 고정 */}
        <aside className="d-detail-aside">
          <div className="d-detail-aside-inner">
            <PurchaseOffers offers={product.purchaseLinks} title="가격 비교" showUpdatedAt stacked />
          </div>
        </aside>
      </div>
    </div>
  );
}
