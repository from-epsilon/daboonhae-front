// 데스크탑 메인 페이지 (Round 4 — 디자인 시스템 기준 재구성)
// 구조:
//   1) 히어로 배너  — brand-green 그라데이션 + 검색
//   2) 목적별 카드 — 4컬럼 (체중감량/근성장/혈당관리/식사대용)
//   3) 추천 식품   — 4컬럼 × 3행 (점수 상위 12개)
//   4) 카테고리 칩 — 대표 카테고리 가로 정렬
//   5) 최근 추가   — 4컬럼 × 2행 (id 내림차순 8개)
// - 데스크탑 셸(App.jsx DesktopShell) 안에서 렌더 → Header/CompareTrayBar/Feedback FAB는 셸 책임
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { useCompare } from '../store/CompareContext.jsx';
import { IconChevron } from '../components/ds/Icons.jsx';

import MainBanner from '../components/desktop/home/MainBanner.jsx';
import CategoryIconGrid from '../components/desktop/home/CategoryIconGrid.jsx';
import FoodGrid from '../components/desktop/home/FoodGrid.jsx';
import Footer from '../components/desktop/home/Footer.jsx';

import './MainPage.css';

// ─────────────── 섹션 헤더 (제목 + 부제 + 더보기 링크)
// - SRP: 제목/부제 표시 + 우측 더보기 버튼만 책임
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

// ─────────────── 데이터 도출 훅 (각 훅 SRP)
// 추천: 점수(0~10) 내림차순 상위 12개
function useRecommended(adapted) {
  return useMemo(
    () => [...adapted].sort((a, b) => b.score - a.score).slice(0, 12),
    [adapted],
  );
}

// 최근 추가: id 내림차순 상위 8개 (id 패턴 'p###' → 문자열 비교로 충분)
function useRecent(adapted) {
  return useMemo(
    () => [...adapted].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 8),
    [adapted],
  );
}

// ─────────────── 메인 페이지 컴포넌트
export default function MainPage() {
  const navigate = useNavigate();
  const { toggle } = useCompare();
  const { products: PRODUCTS, loading } = useProducts();

  const adapted = useMemo(() => PRODUCTS.map(getAdapted), [PRODUCTS]);
  const recommended = useRecommended(adapted);
  const recent = useRecent(adapted);

  // ───────── 핸들러
  // 카테고리 칩 클릭 → 리스트로 (카테고리 쿼리)
  const handleCategoryPick = (category) => {
    navigate(`/list?category=${encodeURIComponent(category)}`);
  };
  // 카드 클릭 → 디테일
  const handleFoodClick = (food) => navigate(`/product/${food.id}`);
  // 카드의 + 버튼 → 비교함 토글
  const handleToggleCompare = (food) => toggle(food.id);
  // 더보기 → 리스트
  const handleMore = () => navigate('/list');

  if (loading) return <div className="d-home" style={{ textAlign: 'center', padding: '4rem' }}>불러오는 중...</div>;

  return (
    <div className="d-home">
      <MainBanner
        ctaHref="/list"
        onCtaClick={(e) => { e.preventDefault(); navigate('/list'); }}
      />

      {/* 2. 카테고리 아이콘 그리드 — 가로 9칸 (8 + 전체보기) */}
      <CategoryIconGrid
        onSelect={(catId) => {
          const labelById = {
            'cereal': '시리얼/그래놀라',
            'chicken': '닭가슴살',
            'energy-bar': '에너지바',
            'icecream': '아이스크림',
            'rice-noodle': '밥/면류',
            'protein-drink': '단백질 음료',
            'sausage': '소시지/햄',
            'shake': '셰이크',
            'snack': '과자',
            'zero-drink': '제로 음료',
          };
          const label = labelById[catId] ?? catId;
          handleCategoryPick(label);
        }}
        onSelectAll={() => navigate('/list')}
      />

      {/* 3. 최근 추가 식품 — 4컬럼 × 2행 (8개) */}
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

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
