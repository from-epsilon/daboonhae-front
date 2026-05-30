import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../store/ProductsContext.jsx';
import { getAdapted } from '../../data/adapters.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { RecommendSlider } from '../../components/mobile/main/RecommendSlider.jsx';
import { CategoryTabs } from '../../components/mobile/main/CategoryTabs.jsx';
import { RecentList } from '../../components/mobile/main/RecentList.jsx';
import { SearchSheet } from '../../components/mobile/list/SearchSheet.jsx';
import { Skeleton } from '../../components/ds/Skeleton.jsx';
import Footer from '../../components/desktop/home/Footer.jsx';
import { ArrowRight, ChevronRight } from 'lucide-react';
import './MainPage.css';

function SectionHeader({ title, subtitle, moreLabel, onMore }) {
  return (
    <header className="m-home-section-head">
      <div>
        <h2 className="m-home-section-title">{title}</h2>
        {subtitle && <p className="m-home-section-sub">{subtitle}</p>}
      </div>
      {onMore && (
        <button type="button" className="m-home-section-more" onClick={onMore}>
          <span>{moreLabel ?? '더보기'}</span>
          <ChevronRight size={14} strokeWidth={2.2} />
        </button>
      )}
    </header>
  );
}

function useRecommended(adapted) {
  return useMemo(() => {
    return [...adapted].sort((a, b) => b.score - a.score).slice(0, 8);
  }, [adapted]);
}

function useRecent(adapted) {
  return useMemo(() => {
    return [...adapted].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 5);
  }, [adapted]);
}

function HomeSkeleton() {
  return (
    <div className="m-home">
      <div className="m-home-hero-skeleton">
        <Skeleton width="50%" height={14} radius={4} />
        <Skeleton width="80%" height={22} radius={4} />
        <Skeleton width="60%" height={14} radius={4} />
      </div>
      <div style={{ padding: '20px 0' }}>
        <Skeleton width="30%" height={18} radius={4} style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: '0 0 160px' }}>
              <Skeleton height={160} radius={12} />
              <Skeleton width="40%" height={10} radius={3} style={{ marginTop: 8 }} />
              <Skeleton width="80%" height={13} radius={3} style={{ marginTop: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MainPageMobile() {
  const navigate = useNavigate();
  const { toggle, count } = useCompare();
  const { products: PRODUCTS, loading } = useProducts();
  const [searchOpen, setSearchOpen] = useState(false);

  const adapted = useMemo(() => PRODUCTS.map(getAdapted), [PRODUCTS]);
  const recommended = useRecommended(adapted);
  const recent = useRecent(adapted);

  const handleSearch = () => setSearchOpen(true);
  const handleSearchSubmit = (next) => {
    const q = (next ?? '').trim();
    navigate(q ? `/list?q=${encodeURIComponent(q)}` : '/list');
  };
  const handleCompare = () => navigate('/compare');
  const handleFoodClick = (food) => navigate(`/product/${food.id}`);
  const handleToggleCompare = (food) => toggle(food.id);

  const handleLogo = () => navigate('/');

  if (loading) return (
    <>
      <AppBar onSearch={handleSearch} onCompare={handleCompare} compareCount={count} onLogo={handleLogo} />
      <HomeSkeleton />
      <SearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={handleSearchSubmit}
      />
    </>
  );

  return (
    <>
      <AppBar
        onSearch={handleSearch}
        onCompare={handleCompare}
        compareCount={count}
        onLogo={handleLogo}
      />

      <div className="m-home">
        {/* 히어로 배너 */}
        <section className="m-home-hero" onClick={() => navigate('/list')}>
          <div className="m-home-hero-glow" aria-hidden="true" />
          <p className="m-home-hero-eyebrow">성분 비교 플랫폼</p>
          <h1 className="m-home-hero-title">
            성분표 뒤집지 말고,<br />
            <span className="m-home-hero-accent">한눈에 비교</span>하세요
          </h1>
          <p className="m-home-hero-sub">
            {adapted.length}개 제품의 영양 성분을 분석했어요
          </p>
          <span className="m-home-hero-cta">
            둘러보기 <ArrowRight size={14} strokeWidth={2.5} />
          </span>
        </section>

        {/* 1. 카테고리 탭 — 히어로와 딱 붙임 */}
        <section className="m-home-section m-home-section--cattabs">
          <CategoryTabs />
        </section>

        <div className="m-home-divider" aria-hidden="true" />

        {/* 2. 추천 식품 — 가로 슬라이더 */}
        <section className="m-home-section m-home-section--rec">
          <SectionHeader
            title="추천 식품"
            subtitle="다분해 점수가 높은 식품이에요"
            onMore={() => navigate('/list')}
          />
          <RecommendSlider items={recommended} onItemClick={handleFoodClick} />
        </section>

        <div className="m-home-divider" aria-hidden="true" />

        {/* 3. 최근 추가 식품 — 리스트 */}
        <section className="m-home-section">
          <SectionHeader
            title="최근 추가된 식품"
            subtitle="새로 분석된 영양 정보예요"
            onMore={() => navigate('/list')}
          />
          <RecentList
            items={recent}
            onItemClick={handleFoodClick}
            onCompare={handleToggleCompare}
          />
        </section>

        <Footer />
      </div>

      <SearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={handleSearchSubmit}
      />
    </>
  );
}
