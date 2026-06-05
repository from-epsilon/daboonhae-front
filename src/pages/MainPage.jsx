import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { useCompare } from '../store/CompareContext.jsx';
import { IconChevron } from '../components/ds/Icons.jsx';
import { FoodCardSkeleton } from '../components/ds/Skeleton.jsx';
import { CATEGORY_TABS, productMatchesTab } from '../data/categoryTabs.js';
import { getPurposeHighlightMetrics } from '../data/categoryCardMetrics.js';

import MainBanner from '../components/desktop/home/MainBanner.jsx';
import CategoryTabsDesktop from '../components/desktop/home/CategoryTabs.jsx';
import FoodGrid from '../components/desktop/home/FoodGrid.jsx';
import Footer from '../components/desktop/home/Footer.jsx';

import './MainPage.css';

function SectionHeader({ title, subtitle, moreLabel, onMore }) {
  return (
    <header className="d-home-section-head">
      <div className="d-home-section-title-wrap">
        <h2 className="d-home-section-title">{title}</h2>
        {subtitle && <p className="d-home-section-sub">{subtitle}</p>}
      </div>
      {onMore && (
        <button type="button" className="d-home-section-more" onClick={onMore}>
          <span>{moreLabel ?? '전체보기'}</span>
          <IconChevron size={14} stroke={2} />
        </button>
      )}
    </header>
  );
}

// 목적별 추천 — 선택한 목적에 속한 제품을 다분해 점수순 상위 10개로 (5열 × 2행)
function usePurposeRecommended(adapted, tabId) {
  return useMemo(
    () => adapted
      .filter((p) => productMatchesTab(p, tabId))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10),
    [adapted, tabId],
  );
}

// 추천 섹션 목적 선택 — 세그먼트 컨트롤 (회색 트랙 + 활성 흰 카드)
function PurposeSegment({ value, onChange }) {
  return (
    <div className="d-home-rec-seg" role="tablist" aria-label="추천 목적 선택">
      {CATEGORY_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          className={`d-home-rec-seg-btn${t.id === value ? ' is-active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function useRecent(adapted) {
  return useMemo(
    () => [...adapted].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 8),
    [adapted],
  );
}

function HomeSkeletonDesktop() {
  return (
    <div className="d-home">
      <div className="d-home-skeleton-banner" />
      <div className="d-home-food-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <FoodCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function MainPage() {
  const navigate = useNavigate();
  const { toggle } = useCompare();
  const { products: PRODUCTS, loading } = useProducts();

  const adapted = useMemo(() => PRODUCTS.map(getAdapted), [PRODUCTS]);
  const [recTabId, setRecTabId] = useState(CATEGORY_TABS[0].id);
  const recommended = usePurposeRecommended(adapted, recTabId);
  const recent = useRecent(adapted);

  const handleFoodClick = (food) => navigate(`/product/${food.id}`);
  const handleToggleCompare = (food) => toggle(food.id);
  const handleMore = () => navigate('/list');

  if (loading) return <HomeSkeletonDesktop />;

  return (
    <div className="d-home">
      <MainBanner
        ctaHref="/list"
        onCtaClick={(e) => { e.preventDefault(); navigate('/list'); }}
      />

      <CategoryTabsDesktop />

      {/* 목적별 추천 식품 — 제목·세그먼트·전체보기 한 행 + 점수 순위 그리드 */}
      <section className="d-home-section">
        <div className="d-home-rec-head">
          <h2 className="d-home-section-title">목적별 추천 식품</h2>
          <PurposeSegment value={recTabId} onChange={setRecTabId} />
          <button
            type="button"
            className="d-home-section-more"
            onClick={() => navigate(`/list?tab=${recTabId}`)}
          >
            <span>전체보기</span>
            <IconChevron size={14} stroke={2} />
          </button>
        </div>
        <FoodGrid
          items={recommended}
          onItemClick={handleFoodClick}
          onCompare={handleToggleCompare}
          showPurchase
          showRank
          metrics={getPurposeHighlightMetrics(recTabId)}
        />
      </section>

      {/* 최근 추가된 식품 */}
      <section className="d-home-section">
        <SectionHeader
          title="최근 추가된 식품"
          onMore={handleMore}
        />
        <FoodGrid
          items={recent}
          onItemClick={handleFoodClick}
          onCompare={handleToggleCompare}
          variant="recent"
        />
      </section>

      <Footer />
    </div>
  );
}
