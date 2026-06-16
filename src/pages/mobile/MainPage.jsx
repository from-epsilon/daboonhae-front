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
import Seo from '../../components/global/Seo.jsx';
import { organizationLd, websiteLd } from '../../data/jsonLd.js';
import { CATEGORY_TABS } from '../../data/categoryTabs.js';
import { getPurposeRecommendedProducts } from '../../data/homeRecommendations.js';
import { getPurposeHighlightMetrics } from '../../data/categoryCardMetrics.js';
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

// 목적별 추천 — 선택한 목적에 속한 제품을 목적별 추천 점수순 상위 8개로
function usePurposeRecommended(products, tabId) {
  return useMemo(() => {
    return getPurposeRecommendedProducts(products, tabId, 8);
  }, [products, tabId]);
}

// 추천 섹션 목적 선택 — 세그먼트 컨트롤 (회색 트랙 + 활성 흰 카드)
function PurposeSegment({ value, onChange }) {
  return (
    <div className="m-home-rec-seg" role="tablist" aria-label="추천 목적 선택">
      {CATEGORY_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          className={`m-home-rec-seg-btn${t.id === value ? ' is-active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
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
  const [recTabId, setRecTabId] = useState(CATEGORY_TABS[0].id);
  const recommended = usePurposeRecommended(PRODUCTS, recTabId);
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
      <Seo canonicalPath="/" jsonLd={[organizationLd(), websiteLd()]} />
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
          {/* 데스크톱 배너(MainBanner)와 문구 통일 */}
          <h1 className="m-home-hero-title">
            다이어트 식품, 고르기 어렵죠?<br />
            성분표 없이도 <span className="m-home-hero-accent">한눈에 비교</span>하세요
          </h1>
          <p className="m-home-hero-sub">
            저당·고단백·식사대용 식품의 당류·단백질·칼로리부터 원재료까지 다분해가 정리해 비교해 드려요.
          </p>
          <span className="m-home-hero-cta">
            다이어트 식품 둘러보기 <ArrowRight size={14} strokeWidth={2.5} />
          </span>
        </section>

        {/* 1. 카테고리 탭 — 히어로와 딱 붙임 */}
        <section className="m-home-section m-home-section--cattabs">
          <CategoryTabs products={PRODUCTS} />
        </section>

        <div className="m-home-divider" aria-hidden="true" />

        {/* 2. 목적별 추천 식품 — 목적 칩 + 순위 슬라이더 */}
        <section className="m-home-section m-home-section--rec">
          <SectionHeader
            title="목적별 추천 식품"
            onMore={() => navigate(`/list?tab=${recTabId}`)}
          />
          <PurposeSegment value={recTabId} onChange={setRecTabId} />
          <RecommendSlider
            key={recTabId}
            items={recommended}
            onItemClick={handleFoodClick}
            showRank
            metrics={getPurposeHighlightMetrics(recTabId)}
          />
        </section>

        <div className="m-home-divider" aria-hidden="true" />

        {/* 3. 최근 추가 식품 — 리스트 */}
        <section className="m-home-section">
          <SectionHeader
            title="최근 추가된 식품"
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
