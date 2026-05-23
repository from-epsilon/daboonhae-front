import { ArrowRight } from 'lucide-react';
import SearchBar from '../components/main/SearchBar.jsx';
import PurposeGrid from '../components/main/PurposeGrid.jsx';
import RankingSlider from '../components/main/RankingSlider.jsx';

// 메인 페이지
// - 세 가지 진입점이 한 화면에 공존
//   1) 검색 → 검색 플로우
//   2) 목적 그리드 → 목적기반 탐색 플로우
//   3) 랭킹/추천 슬라이드 → 랭킹/추천 플로우
export default function MainPage() {
  return (
    <div className="page main-page">
      <section className="main-hero">
        <h1 className="main-headline">광고 문구 말고, 성분으로 고르세요</h1>
        <p className="main-subheadline">식단 목적에 맞게 다이어트 식품을 분해해 비교해드립니다.</p>
        <SearchBar />
      </section>

      <section className="main-section">
        <h2 className="section-title">목적별로 둘러보기</h2>
        <PurposeGrid />
      </section>

      <section className="main-section">
        <div className="section-header">
          <h2 className="section-title">인기 랭킹 · 추천</h2>
          <a className="section-more" href="/list">
            <span>전체보기</span>
            <ArrowRight size={14} aria-hidden />
          </a>
        </div>
        <RankingSlider />
      </section>
    </div>
  );
}
