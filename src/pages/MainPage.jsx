import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { useCompare } from '../store/CompareContext.jsx';
import { IconChevron } from '../components/ds/Icons.jsx';
import { FoodCardSkeleton } from '../components/ds/Skeleton.jsx';

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

function useRecommended(adapted) {
  return useMemo(
    () => [...adapted].sort((a, b) => b.score - a.score).slice(0, 8),
    [adapted],
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
  const recommended = useRecommended(adapted);
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

      {/* 추천 식품 — 점수 상위 8개 */}
      <section className="d-home-section">
        <SectionHeader
          title="추천 식품"
          subtitle="다이어트에 추천하는 식품을 골라봤어요"
          onMore={handleMore}
        />
        <FoodGrid
          items={recommended}
          onItemClick={handleFoodClick}
          onCompare={handleToggleCompare}
          showPurchase
        />
      </section>

      {/* 최근 추가된 식품 */}
      <section className="d-home-section">
        <SectionHeader
          title="최근 추가된 식품"
          subtitle="새로 분해한 영양 정보를 확인하세요"
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
