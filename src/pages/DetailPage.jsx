import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductById, useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { CATEGORY_TABS } from '../data/categoryTabs.js';
import { useCompare } from '../store/CompareContext.jsx';

import { Check } from 'lucide-react';
import ProductThumb from '../components/global/ProductThumb.jsx';
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

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '-';
  return Number.isInteger(Number(value)) ? String(value) : String(Math.round(Number(value) * 10) / 10);
}

function RankValue({ rankInfo, emptyLabel = '가격 정보 없음' }) {
  if (!rankInfo) {
    return <strong className="is-muted">{emptyLabel}</strong>;
  }
  return (
    <span className="d-detail-rank-value">
      <strong>{rankInfo.rank}위</strong>
      <span>{rankInfo.total}개 중</span>
    </span>
  );
}

function cheapestUnitPrice(product) {
  const prices = (product?.purchaseLinks ?? [])
    .map((offer) => {
      if (typeof offer?.price !== 'number') return null;
      const quantity = Number(offer.quantity ?? 1);
      if (!Number.isFinite(quantity) || quantity <= 0) return offer.price;
      return offer.price / quantity;
    })
    .filter((price) => typeof price === 'number' && Number.isFinite(price) && price > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

function rankAmong(items, currentId, getScore) {
  const scored = items
    .map((item) => ({ item, score: getScore(item) }))
    .filter(({ score }) => typeof score === 'number' && Number.isFinite(score) && score > 0)
    .sort((a, b) => b.score - a.score);
  const index = scored.findIndex(({ item }) => String(item.id) === String(currentId));
  if (index < 0) return null;
  return { rank: index + 1, total: scored.length, score: scored[index].score };
}

function getCategoryPeers(allProducts, product) {
  return (allProducts ?? []).filter((item) => {
    if (product?.categoryCode) return item?.categoryCode === product.categoryCode;
    return item?.category === product?.category;
  });
}

function getProteinDrinkRanks(allProducts, product) {
  const peers = getCategoryPeers(allProducts, product);
  return {
    proteinPerPrice: rankAmong(peers, product.id, (item) => {
      const unitPrice = cheapestUnitPrice(item);
      const protein = item?.nutrition?.protein;
      if (!unitPrice || typeof protein !== 'number') return null;
      return protein / unitPrice;
    }),
    proteinPerCalorie: rankAmong(peers, product.id, (item) => {
      const protein = item?.nutrition?.protein;
      const calories = item?.nutrition?.calories;
      if (typeof protein !== 'number' || typeof calories !== 'number' || calories <= 0) return null;
      return protein / calories;
    }),
  };
}

function getOverviewMetrics(raw, nutrition) {
  return [
    { label: '칼로리', value: nutrition?.calories, unit: 'kcal' },
    { label: '단백질', value: nutrition?.protein, unit: 'g' },
  ];
}

function QuickGlance({ raw, nutrition }) {
  const items = getOverviewMetrics(raw, nutrition);
  return (
    <div className="d-detail-quick">
      {items.map((item) => (
        <div key={item.label} className="d-detail-quick-item">
          <span className="d-detail-quick-label">{item.label}</span>
          <span className="d-detail-quick-value">
            {formatNumber(item.value)}<span className="d-detail-quick-unit">{item.unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ProteinDrinkRankSummary({ ranks }) {
  return (
    <div className="d-detail-rank">
      <div className="d-detail-rank-item">
        <span className="d-detail-rank-label">가격 대비 단백질</span>
        <RankValue rankInfo={ranks.proteinPerPrice} />
      </div>
      <div className="d-detail-rank-item">
        <span className="d-detail-rank-label">칼로리 대비 단백질</span>
        <RankValue rankInfo={ranks.proteinPerCalorie} emptyLabel="순위 정보 없음" />
      </div>
      <p className="d-detail-rank-note">가격 순위는 등록된 구매링크의 개당 최저가 기준이며, 실제 판매가와 다를 수 있어요.</p>
    </div>
  );
}

function ProductOverview({ product, raw, nutrition, allProducts, inCart, onToggleCompare, detailOpen, onToggleDetail }) {
  const isProteinDrink = raw?.categoryCode === 'protein_drink' || raw?.category === '단백질 음료';
  const ranks = isProteinDrink ? getProteinDrinkRanks(allProducts, raw) : null;

  return (
    <section className="d-detail-overview">
      {/* 상단: 제품 이미지 + 제목·핵심지표 */}
      <div className="d-detail-overview-grid">
        <div className="d-detail-overview-media">
          <ProductThumb product={product} size="card" />
        </div>
        <div className="d-detail-overview-body">
          <div className="d-detail-overview-titlebar">
            <div className="d-detail-overview-title">
              <span className="d-detail-header-brand">{product.brand}</span>
              <h1 className="d-detail-header-name">{product.name}</h1>
              <span className="d-detail-header-serving">{product.serving} 기준</span>
            </div>
            <CompareButton inCart={inCart} onClick={onToggleCompare} />
          </div>
          <QuickGlance raw={raw} nutrition={nutrition} />
          {isProteinDrink && <ProteinDrinkRankSummary ranks={ranks} />}
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
  const [activeId, setActiveId] = useState('guide');
  useEffect(() => {
    setActiveId('guide');
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        { rootMargin: '-140px 0px -60% 0px' },
      );
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      }
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timer);
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
  const { loading, products: allProducts } = useProducts();
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
            allProducts={allProducts}
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
