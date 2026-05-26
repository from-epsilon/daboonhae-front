// 데스크탑 메인 히어로 배너 — 크몽 톤(클린 화이트 + 강한 카피 + prominent 검색)
// - 그라데이션 대신 오프화이트 배경 + 부드러운 그린 글로우 일러스트 톤
// - 강한 헤드라인(검정) + 부제 + 큰 pill 검색바
// - Enter 또는 검색 버튼 클릭 → onSearch(query) 호출
import { useState } from 'react';
import { IconSearch } from '../../ds/Icons.jsx';

// 컨트롤 분리: 검색 input 자체만 책임 (form submit 처리는 부모)
function SearchInput({ value, onChange, onSubmit }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };
  return (
    <input
      type="search"
      className="d-home-search-input"
      placeholder="제품명·브랜드·성분으로 검색"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      aria-label="식품 검색"
    />
  );
}

// 검색바 하단에 인기 검색어 칩 — 빠른 진입점 (크몽 추천 검색어 패턴 차용)
const POPULAR_KEYWORDS = ['프로틴 드링크', '곤약', '제로 음료', '닭가슴살', '저당 간식'];

export default function HeroBanner({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    onSearch(query.trim());
  };

  const handleQuickPick = (kw) => onSearch(kw);

  return (
    <section className="d-home-hero">
      {/* 데코 — 양 옆에 부드러운 그린 글로우 (배경에만 영향, 콘텐츠 무관) */}
      <span className="d-home-hero-deco d-home-hero-deco--left" aria-hidden="true" />
      <span className="d-home-hero-deco d-home-hero-deco--right" aria-hidden="true" />

      <div className="d-home-hero-inner">
        <span className="d-home-hero-eyebrow">성분으로 비교하는 다이어트 식품</span>
        <h1 className="d-home-hero-headline">
          광고 문구 말고, <br />
          <span className="d-home-hero-headline-accent">성분</span>으로 고르세요
        </h1>
        <p className="d-home-hero-sub">
          47종 다이어트 식품의 영양·성분을 분해해 비교합니다. 목적에 맞는 한 끼를 숫자로 확인하세요.
        </p>

        <form
          className="d-home-search"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          role="search"
        >
          <span className="d-home-search-icon" aria-hidden="true">
            <IconSearch size={20} stroke={2} />
          </span>
          <SearchInput value={query} onChange={setQuery} onSubmit={handleSubmit} />
          <button type="submit" className="d-home-search-btn">
            검색
          </button>
        </form>

        <div className="d-home-hero-keywords" aria-label="인기 검색어">
          <span className="d-home-hero-keywords-label">인기 검색어</span>
          {POPULAR_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              className="d-home-hero-keyword"
              onClick={() => handleQuickPick(kw)}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
