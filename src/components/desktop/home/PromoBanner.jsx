// 데스크탑 메인 — 우측 1/3 프로모션 배너 (카드 스택 + 점 인디케이터 + 자동 회전 옵션)
// - 가장 앞 카드(slides[current])만 콘텐츠가 보이고, 뒤 2장은 아래쪽으로 살짝 비치는 stack 형태
// - 좌/우 네비 버튼 + N/M 카운트 + 점 인디케이터
// - 자동 회전: prefers-reduced-motion: no-preference 일 때만 6초 간격
//   (모션 민감 사용자에게 자동 변화 강요하지 않음 — WCAG 2.2.2)
// - slides[]: [{ eyebrow, title, sub, accent }] — accent 는 'green' | 'blue' | 'purple'
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 임시 슬라이드 데이터 (산출물에서 별도 정리)
// - accent 키는 CSS의 .d-home-promo-card--{accent} 와 매칭
const DEFAULT_SLIDES = [
  {
    id: 'analysis',
    eyebrow: 'NEW · 분해 리포트',
    title: '내가 마신 음료, 당류 얼마나 들었을까?',
    sub: '제품 한 개를 12개 지표로 분해해 시각화합니다.',
    accent: 'green',
  },
  {
    id: 'compare',
    eyebrow: '비교함 · 최대 5개',
    title: '비슷한 제품, 숫자로 한눈에 비교',
    sub: '브랜드 광고가 아닌 영양정보표로 비교하세요.',
    accent: 'blue',
  },
  {
    id: 'personal',
    eyebrow: '식단 목적',
    title: '체중감량·근성장·혈당관리,\n내 목적에 맞춰 추천',
    sub: '목적을 고르면 핵심 지표만 강조해 보여드려요.',
    accent: 'purple',
  },
];

const AUTO_ADVANCE_MS = 6000;

// 한 카드의 렌더 — accent 클래스로 톤 변형
// - depth: 0 = 가장 앞, 1 = 한 칸 뒤, 2 = 두 칸 뒤
function PromoCard({ slide, depth, total, current }) {
  const className = `d-home-promo-card d-home-promo-card--${slide.accent} d-home-promo-card--depth-${depth}`;
  return (
    <div className={className} aria-hidden={depth > 0}>
      {depth === 0 && (
        <>
          <span className="d-home-promo-eyebrow">{slide.eyebrow}</span>
          {/* heading 위계: HeroSection 의 h1 다음 — h2 사용 (a11y: h1→h3 skip 방지) */}
          <h2 className="d-home-promo-title">{slide.title}</h2>
          <p className="d-home-promo-sub">{slide.sub}</p>
          {/* 시각 요소 자리 — 추후 이미지/일러스트 교체 가능 */}
          <div className="d-home-promo-illus" aria-hidden="true">
            <span className="d-home-promo-illus-circle d-home-promo-illus-circle--1" />
            <span className="d-home-promo-illus-circle d-home-promo-illus-circle--2" />
            <span className="d-home-promo-illus-circle d-home-promo-illus-circle--3" />
          </div>
          <div className="d-home-promo-pagination">
            <span className="d-home-promo-pagination-num">
              {current + 1} <span className="d-home-promo-pagination-sep">/</span>{' '}
              <span className="d-home-promo-pagination-total">{total}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// 점 인디케이터 — 현재 슬라이드를 시각적으로 노출 + 클릭으로 직접 이동 가능
function Dots({ total, current, onPick }) {
  return (
    <div className="d-home-promo-dots" role="tablist" aria-label="배너 슬라이드">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === current}
          aria-label={`${i + 1}번 배너로 이동`}
          className={`d-home-promo-dot${i === current ? ' is-active' : ''}`}
          onClick={() => onPick(i)}
        />
      ))}
    </div>
  );
}

export default function PromoBanner({ slides = DEFAULT_SLIDES, initialIndex = 0 }) {
  const [current, setCurrent] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;
  const intervalRef = useRef(null);

  const go = (delta) => {
    setCurrent((c) => (c + delta + total) % total);
  };
  const goTo = (idx) => setCurrent(((idx % total) + total) % total);

  // 자동 회전 — prefers-reduced-motion 가 아닐 때만, hover/focus 시 일시정지
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: no-preference)');
    if (!mql.matches || isPaused || total <= 1) return undefined;
    intervalRef.current = window.setInterval(() => go(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, total]);

  // 표시할 카드 3장 선택 (가장 앞 + 다음 2장)
  const visibleSlides = [0, 1, 2].map((depth) => {
    const idx = (current + depth) % total;
    return { slide: slides[idx], depth };
  });

  // hover/focus 시 자동 회전 일시정지 — 사용자 상호작용 중에 슬라이드가 바뀌면 거슬림
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  return (
    <aside
      className="d-home-promo"
      aria-label="프로모션 배너"
      aria-roledescription="carousel"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocusCapture={handlePause}
      onBlurCapture={handleResume}
    >
      <div className="d-home-promo-stack">
        {/* 뒤에서부터 그려야 z-index 자연 (depth=2 → depth=0 순서) */}
        {[...visibleSlides].reverse().map(({ slide, depth }) => (
          <PromoCard
            key={`${slide.id}-${depth}`}
            slide={slide}
            depth={depth}
            total={total}
            current={current}
          />
        ))}
      </div>
      <div className="d-home-promo-controls">
        <Dots total={total} current={current} onPick={goTo} />
        <div className="d-home-promo-nav">
          <button
            type="button"
            className="d-home-promo-nav-btn"
            onClick={() => go(-1)}
            aria-label="이전 배너"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="d-home-promo-nav-btn"
            onClick={() => go(1)}
            aria-label="다음 배너"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
