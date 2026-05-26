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
import { PRODUCTS } from '../data/mockProducts.js';
import { getAdapted } from '../data/adapters.js';
import { usePurpose } from '../store/PurposeContext.jsx';
import { useCompare } from '../store/CompareContext.jsx';
import { IconChevron } from '../components/ds/Icons.jsx';

import HeroSection from '../components/desktop/home/HeroSection.jsx';
import PromoBanner from '../components/desktop/home/PromoBanner.jsx';
import CategoryIconGrid from '../components/desktop/home/CategoryIconGrid.jsx';
import PurposeCards from '../components/desktop/home/PurposeCards.jsx';
import FoodGrid from '../components/desktop/home/FoodGrid.jsx';
import TrustStats from '../components/desktop/home/TrustStats.jsx';
import Testimonials from '../components/desktop/home/Testimonials.jsx';
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
  const { setPurpose } = usePurpose();
  const { toggle } = useCompare();

  // raw 제품 → DS 형식 (47개) — 마운트 시 1회 메모
  const adapted = useMemo(() => PRODUCTS.map(getAdapted), []);
  const recommended = useRecommended(adapted);
  const recent = useRecent(adapted);

  // ───────── 핸들러 (단일 책임)
  // 히어로 검색 → 리스트 페이지로 (쿼리 동봉)
  const handleSearch = (query) => {
    if (query) navigate(`/list?q=${encodeURIComponent(query)}`);
    else navigate('/list');
  };
  // 목적 카드 클릭 → 컨텍스트 set + 리스트로
  const handlePurposePick = (purposeId) => {
    setPurpose(purposeId);
    navigate('/list');
  };
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

  return (
    <div className="d-home">
      {/* 1. 상단 split: 좌 2/3 히어로(검색+키워드) + 우 1/3 프로모션 카드 스택 */}
      <div className="d-home-top">
        <HeroSection onSearch={handleSearch} />
        <PromoBanner />
      </div>

      {/* 2. 카테고리 아이콘 그리드 — 가로 9칸 (8 + 전체보기) */}
      <CategoryIconGrid
        onSelect={(catId) => {
          // CategoryIconGrid는 카테고리 id 를 넘기지만, 리스트 페이지는 한글 카테고리명을 받음
          // → id → 라벨 매핑은 컴포넌트 안에 두지 않고 부모(MainPage)에서 처리
          const labelById = {
            'protein-drink': '프로틴 드링크',
            'protein-bar': '프로틴 바',
            'zero-drink': '제로 음료',
            'konjac': '곤약·면',
            'chicken': '닭가슴살',
            'lunchbox': '저칼로리 도시락',
            'shake': '쉐이크',
          };
          const label = labelById[catId] ?? catId;
          handleCategoryPick(label);
        }}
        onSelectAll={() => navigate('/list')}
      />

      {/* 3. 목적별로 둘러보기 — 빠른 진입점 */}
      <section className="d-home-section">
        <SectionHeader
          title="목적별로 둘러보기"
          subtitle="내 목표에 맞는 다이어트 식품을 빠르게 찾아보세요"
        />
        <PurposeCards onSelect={handlePurposePick} />
      </section>

      {/* 4. 추천 식품 — 4컬럼 × 3행 (12개) */}
      <section className="d-home-section">
        <SectionHeader
          title="추천 식품"
          subtitle="영양 균형 점수가 높은 식품을 모았어요"
          onMore={handleMore}
        />
        <FoodGrid
          items={recommended}
          onItemClick={handleFoodClick}
          onCompare={handleToggleCompare}
          variant="recommend"
        />
      </section>

      {/* 5. 신뢰 수치 섹션 */}
      <TrustStats />

      {/* 6. 최근 추가 식품 — 4컬럼 × 2행 (8개) */}
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

      {/* 7. 사용자 후기 슬라이드 */}
      <Testimonials />

      {/* 8. 푸터 — 회사 정보 / 약관 / 문의 */}
      <Footer />
    </div>
  );
}
