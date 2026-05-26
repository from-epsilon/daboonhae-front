// 모바일 메인 페이지 (Round 3)
// 구조: AppBar(상단 52px) → 추천 슬라이더 → 목적별 그리드 → 최근 추가 리스트
// - 모바일 셸(.mobile-shell-main) 안에서 렌더 — 하단 56px BottomNav 공간은 셸이 padding-bottom으로 처리
// - 페이지 자체는 AppBar + 본문만 책임
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../data/mockProducts.js';
import { getAdapted } from '../../data/adapters.js';
import { usePurpose } from '../../store/PurposeContext.jsx';
import { useCompare } from '../../store/CompareContext.jsx';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { RecommendSlider } from '../../components/mobile/main/RecommendSlider.jsx';
import { PurposeGrid } from '../../components/mobile/main/PurposeGrid.jsx';
import { RecentList } from '../../components/mobile/main/RecentList.jsx';
import './MainPage.css';

// 섹션 헤더 (제목 + 부제) — 작은 SRP 컴포넌트로 분리
function SectionHeader({ title, subtitle }) {
  return (
    <header className="m-home-section-head">
      <h2 className="m-home-section-title">{title}</h2>
      {subtitle && <p className="m-home-section-sub">{subtitle}</p>}
    </header>
  );
}

// 추천 식품 목록 도출 — 점수 내림차순 상위 8개
function useRecommended(adapted) {
  return useMemo(() => {
    return [...adapted].sort((a, b) => b.score - a.score).slice(0, 8);
  }, [adapted]);
}

// 최근 추가 식품 목록 도출 — id 내림차순 5개 (id가 'p###' 패턴이라 문자열 비교로 충분)
function useRecent(adapted) {
  return useMemo(() => {
    return [...adapted].sort((a, b) => (a.id < b.id ? 1 : -1)).slice(0, 5);
  }, [adapted]);
}

export default function MainPageMobile() {
  const navigate = useNavigate();
  // 컨텍스트 expose 키는 setPurpose (id를 받음). 프롬프트의 setPurposeId와 동일 의도.
  const { setPurpose } = usePurpose();
  const { toggle, count } = useCompare();

  // raw 제품 → DS 형식 변환 (47개) — 마운트 시 1회 메모
  const adapted = useMemo(() => PRODUCTS.map(getAdapted), []);
  const recommended = useRecommended(adapted);
  const recent = useRecent(adapted);

  // ───────── 핸들러 (각 함수는 단일 책임)
  // 검색바 클릭 → 리스트로 (검색 필드는 리스트 페이지에서 활성)
  const handleSearch = () => navigate('/list?q=');
  // 비교함 아이콘 클릭 → 비교 페이지로
  const handleCompare = () => navigate('/compare');
  // FoodCard / 추천 카드 클릭 → 디테일
  const handleFoodClick = (food) => navigate(`/product/${food.id}`);
  // 목적 타일 클릭 → 컨텍스트에 목적 set + 리스트로
  const handlePurposePick = (purposeId) => {
    setPurpose(purposeId);
    navigate('/list');
  };
  // FoodCard 의 + 버튼 → 비교함 토글
  const handleToggleCompare = (food) => toggle(food.id);

  return (
    <>
      <AppBar
        onSearch={handleSearch}
        onCompare={handleCompare}
        compareCount={count}
      />

      <div className="m-home">
        {/* 1. 추천 식품 — 가로 슬라이더 (점수 상위 8개) */}
        <section className="m-home-section m-home-section--rec">
          <SectionHeader
            title="추천 식품"
            subtitle="다분해 점수가 높은 식품을 모았어요"
          />
          <RecommendSlider items={recommended} onItemClick={handleFoodClick} />
        </section>

        <div className="m-home-divider" aria-hidden="true" />

        {/* 2. 목적별 둘러보기 — 2x2 그리드 */}
        <section className="m-home-section">
          <SectionHeader
            title="목적별 둘러보기"
            subtitle="내 목표에 맞는 식품을 빠르게 찾아보세요"
          />
          <PurposeGrid onSelect={handlePurposePick} />
        </section>

        <div className="m-home-divider" aria-hidden="true" />

        {/* 3. 최근 추가 식품 — 리스트 */}
        <section className="m-home-section">
          <SectionHeader
            title="최근 추가된 식품"
            subtitle="새로 분해한 영양 정보를 확인하세요"
          />
          <RecentList
            items={recent}
            onItemClick={handleFoodClick}
            onCompare={handleToggleCompare}
          />
        </section>
      </div>
    </>
  );
}
