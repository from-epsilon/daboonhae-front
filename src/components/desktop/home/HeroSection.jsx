// 데스크탑 메인 — 좌측 2/3 영역: 헤드라인 2줄 + pill 검색바 + 추천 키워드 칩
// - 카피와 키워드는 임시값 (산출물에서 별도 정리)
// - 검색 동작: input + Enter 또는 검색 버튼 클릭 → onSearch(query) / 키워드 클릭 → onSearch(keyword)
// - 키워드 칩은 props.keywords 로 외부 주입도 가능 (미지정 시 기본 POPULAR 사용)
// - PRODUCTS 개수를 통계 prefix로 강조 → 좌측 시각 무게 보강
import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { IconSearch } from '../../ds/Icons.jsx';
import { PRODUCTS } from '../../../data/mockProducts.js';

// 임시 추천 키워드 — 우리 서비스(저당/다이어트 식품 비교) 맥락에 맞춰 합리적 가설로 채움
// 산출물에서 별도 정리되어 사용자가 검토/변경 가능
const POPULAR = [
  '저당 단백질 바',
  '곤약면',
  '제로 음료',
  '대체당',
  '닭가슴살',
  '단백질 쉐이크',
];

export default function HeroSection({ onSearch, keywords = POPULAR }) {
  const [query, setQuery] = useState('');

  const submit = (q) => {
    if (typeof onSearch === 'function') onSearch((q ?? '').trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(query);
  };

  // 좌측 비주얼 무게 보강 — eyebrow에 실제 분석 제품 수 노출
  const productCount = PRODUCTS.length;

  return (
    <section className="d-home-hero-left">
      {/* 좌측 배경 데코 — 부드러운 그린 글로우 (시각 무게 균형) */}
      <span className="d-home-hero-glow" aria-hidden="true" />

      <p className="d-home-hero-eyebrow">
        <TrendingUp size={14} strokeWidth={2.5} aria-hidden />
        <span>지금까지 {productCount}개 제품 분해 · 매주 업데이트</span>
      </p>
      <h1 className="d-home-hero-headline">
        오늘의 한 끼, <br />
        <span className="d-home-hero-headline-accent">숫자로 확인</span>해 보세요
      </h1>

      <form className="d-home-search" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          className="d-home-search-input"
          placeholder="제품명·브랜드·성분으로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="식품·성분 검색"
        />
        <button
          type="submit"
          className="d-home-search-fab"
          aria-label="검색"
        >
          <IconSearch size={20} stroke={2} />
        </button>
      </form>

      <div className="d-home-hero-keywords" aria-label="추천 검색어">
        <span className="d-home-hero-keywords-prefix">
          <TrendingUp size={12} strokeWidth={2.5} aria-hidden />
          <span>인기 검색어</span>
        </span>
        {keywords.map((kw) => (
          <button
            key={kw}
            type="button"
            className="d-home-hero-keyword"
            onClick={() => submit(kw)}
          >
            {kw}
          </button>
        ))}
      </div>
    </section>
  );
}
