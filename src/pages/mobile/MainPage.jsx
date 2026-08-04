import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeProducts } from '../../store/ProductsContext.jsx';
import { getAdapted } from '../../data/adapters.js';
import { useCompare } from '../../store/CompareContext.jsx';
import { useWishlist } from '../../store/WishlistContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { RecommendSlider } from '../../components/mobile/main/RecommendSlider.jsx';
import { CategoryTabs } from '../../components/mobile/main/CategoryTabs.jsx';
import { RecentList } from '../../components/mobile/main/RecentList.jsx';
import { SearchSheet } from '../../components/mobile/list/SearchSheet.jsx';
import { Skeleton } from '../../components/ds/Skeleton.jsx';
import Footer from '../../components/desktop/home/Footer.jsx';
import Seo from '../../components/global/Seo.jsx';
import { productPath } from '../../data/productUrl.js';
import { HOME_PURPOSE_TABS } from '../../data/categoryTabs.js';
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

// 추천 섹션 목적 선택 — 세그먼트 컨트롤 (회색 트랙 + 활성 흰 카드)
function PurposeSegment({ value, onChange }) {
  return (
    <div className="m-home-rec-seg" role="tablist" aria-label="추천 목적 선택">
      {HOME_PURPOSE_TABS.map((t) => {
        const disabled = t.id === 'low_sugar';
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === value}
            aria-disabled={disabled || undefined}
            aria-label={disabled ? `${t.label}, 준비중` : undefined}
            data-tooltip={disabled ? '준비중' : undefined}
            className={`m-home-rec-seg-btn${t.id === value ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
            onClick={() => !disabled && onChange(t.id)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="m-home">
      <div className="m-home-hero-skeleton">
        <Skeleton width="68%" height={20} radius={4} />
        <Skeleton width="82%" height={20} radius={4} />
        <Skeleton width="92%" height={11} radius={4} style={{ marginTop: 8 }} />
        <Skeleton width="72%" height={11} radius={4} />
        <Skeleton width={152} height={36} radius={18} style={{ marginTop: 8 }} />
      </div>
      <section className="m-home-section m-home-section--cattabs m-home-skeleton-cattabs" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="m-home-skeleton-cat-item">
            <Skeleton width={78} height={78} radius={12} />
            <Skeleton width={62} height={12} />
          </div>
        ))}
      </section>
      <div className="m-home-divider" aria-hidden="true" />
      <section className="m-home-section m-home-section--rec m-home-skeleton-rec" aria-hidden="true">
        <div className="m-home-skeleton-section-head">
          <Skeleton width={132} height={18} />
          <Skeleton width={44} height={12} />
        </div>
        <Skeleton width="calc(100% - 16px)" height={44} radius={22} />
        <div className="m-home-skeleton-rec-list">
          {[0, 1].map((i) => (
            <div key={i} className="m-home-skeleton-rec-card">
              <Skeleton width={196} height={196} radius={12} />
              <Skeleton width="38%" height={10} />
              <Skeleton width="88%" height={14} />
              <Skeleton width="68%" height={14} />
              <div className="m-home-skeleton-rec-stats">
                <Skeleton width={56} height={28} />
                <Skeleton width={56} height={28} />
              </div>
              <Skeleton width="100%" height={36} radius={6} />
            </div>
          ))}
        </div>
      </section>
      <div className="m-home-divider" aria-hidden="true" />
      <section className="m-home-section m-home-skeleton-recent" aria-hidden="true">
        <div className="m-home-skeleton-section-head">
          <Skeleton width={132} height={18} />
          <Skeleton width={44} height={12} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="m-home-skeleton-recent-row">
            <Skeleton width={104} height={104} radius={8} />
            <div>
              <Skeleton width="34%" height={10} />
              <Skeleton width="82%" height={14} />
              <Skeleton width="64%" height={14} />
              <Skeleton width="100%" height={34} radius={6} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function MainPageMobile() {
  const navigate = useNavigate();
  const { toggle, count, has } = useCompare();
  const wishlist = useWishlist();
  const { recommendations, recent: recentProducts, loading } = useHomeProducts();
  const [searchOpen, setSearchOpen] = useState(false);

  const [recTabId, setRecTabId] = useState(HOME_PURPOSE_TABS[0].id);
  const recommended = useMemo(
    () => (recommendations[recTabId] ?? []).slice(0, 8).map(getAdapted),
    [recommendations, recTabId],
  );
  const recent = useMemo(
    () => recentProducts.slice(0, 5).map(getAdapted),
    [recentProducts],
  );

  const handleSearch = () => setSearchOpen(true);
  const handleSearchSubmit = (next) => {
    const q = (next ?? '').trim();
    navigate(q ? `/list?q=${encodeURIComponent(q)}` : '/list');
  };
  const handleCompare = () => navigate('/compare');
  const handleWishlist = () => navigate('/wishlist');
  const handleFoodClick = (food) => navigate(productPath(food));
  const handleToggleCompare = (food) => toggle(food.id);

  const handleLogo = () => navigate('/');

  if (loading) return (
    <>
      <AppBar
        onSearch={handleSearch}
        onCompare={handleCompare}
        compareCount={count}
        onWishlist={handleWishlist}
        wishlistCount={wishlist.count}
        onLogo={handleLogo}
      />
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
      {/* WebSite·Organization JSON-LD는 사이트 이름 확정용으로 index.html에 정적 배치(단일 출처) */}
      <Seo canonicalPath="/" />
      <AppBar
        onSearch={handleSearch}
        onCompare={handleCompare}
        compareCount={count}
        onWishlist={handleWishlist}
        wishlistCount={wishlist.count}
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
          <CategoryTabs />
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
            onCompare={handleToggleCompare}
            hasCompare={has}
            onWishlist={(food) => wishlist.toggle(food.id)}
            hasWishlist={wishlist.has}
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
