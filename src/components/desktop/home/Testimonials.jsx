// 데스크탑 메인 — 사용자 후기 (크몽의 "고객 후기 슬라이드" 패턴 차용)
// - 가로 카드 4개 (mock 데이터)
// - 별점 + 본문 발췌 + 닉네임 + 컨텍스트 (목적/카테고리)
// - 신뢰감 + 사람냄새 → 전환 가장 큰 영향 요소
import { IconCheck } from '../../ds/Icons.jsx';

// 후기 mock — 짧고 구체적인 한 줄
// - author: 마스킹된 가짜 실명 대신 사용 시나리오 기반 익명 페르소나
//   (mock fake review 인상 방지)
const TESTIMONIALS = [
  {
    id: 't1',
    quote: '광고만 보고 샀다가 당류가 충격이었던 경험이 있어요. 이제는 비교부터 해요.',
    author: '다이어트 3개월차',
    context: '체중감량 · 30대',
    rating: 5,
  },
  {
    id: 't2',
    quote: '단백질 함량만 보는 게 아니라 원료(WPI/WPC)까지 알려줘서 좋아요.',
    author: '근력운동 입문자',
    context: '근성장 · 20대',
    rating: 5,
  },
  {
    id: 't3',
    quote: '대체당 종류별로 필터링되는 게 신기했어요. 알룰로스만 골라서 봤어요.',
    author: '당관리 사용자',
    context: '혈당관리 · 40대',
    rating: 5,
  },
  {
    id: 't4',
    quote: '한 끼 대용으로 칼로리/단백질/지방 균형을 한 번에 비교할 수 있어 편해요.',
    author: '직장인 식단러',
    context: '식사대용 · 30대',
    rating: 4,
  },
];

// 별점 — 채워진 별(IconCheck 대체)로 표시. SVG로 간단히 표현
function Stars({ count }) {
  return (
    <span className="d-home-testimonial-stars" aria-label={`${count}점 만점에 5점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`d-home-testimonial-star${i < count ? ' is-filled' : ''}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

function TestimonialCard({ quote, author, context, rating }) {
  return (
    <article className="d-home-testimonial">
      <Stars count={rating} />
      <p className="d-home-testimonial-quote">{quote}</p>
      <footer className="d-home-testimonial-foot">
        <span className="d-home-testimonial-author">{author}</span>
        <span className="d-home-testimonial-context">{context}</span>
      </footer>
    </article>
  );
}

export default function Testimonials() {
  return (
    <section className="d-home-testimonials" aria-label="사용자 후기">
      <header className="d-home-section-head">
        <div className="d-home-section-title-wrap">
          <h2 className="d-home-section-title">사용자 후기</h2>
          <p className="d-home-section-sub">
            <IconCheck size={12} stroke={2.5} className="d-home-section-sub-icon" />
            예시 후기 · 실제 사용자 코멘트를 모집 중이에요
          </p>
        </div>
      </header>
      <div className="d-home-testimonial-grid">
        {TESTIMONIALS.map((t) => (
          <TestimonialCard key={t.id} {...t} />
        ))}
      </div>
    </section>
  );
}
