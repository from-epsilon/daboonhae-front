// 모바일 메인 — 추천 식품 가로 슬라이더
// - 점수 내림차순 상위 8개의 mini 카드를 horizontal scroll-snap으로 노출
// - DS 컨벤션상 "랭킹/순위" 표시는 금지 → 점수만 시각화 ("Compare, don't rank")
// - 작은 폭(약 144px) 미니 카드: 썸네일 + 점수 오버레이 + 브랜드 + 이름 + 1줄 매크로
import { scoreColor } from '../../../data/adapters.js';

// 단일 미니 카드 — 슬라이더 한 셀
// - onClick 시 디테일 진입 (상위에서 처리)
function RecommendCard({ food, onClick }) {
  return (
    <article className="m-home-rec-card" onClick={onClick}>
      {/* 썸네일 + 점수 오버레이 (좌상단) */}
      <div className="m-home-rec-thumb">
        {food.thumb ? (
          <img src={food.thumb} alt={food.name} loading="lazy" />
        ) : (
          <div className="m-home-rec-thumb-placeholder" />
        )}
        <span
          className="m-home-rec-score"
          style={{ color: scoreColor(food.score), borderColor: scoreColor(food.score) }}
        >
          {food.score.toFixed(1)}
        </span>
      </div>
      {/* 텍스트 영역 */}
      <div className="m-home-rec-meta">
        <div className="m-home-rec-brand">{food.brand}</div>
        <div className="m-home-rec-name">{food.name}</div>
        <div className="m-home-rec-macro">
          <b>{food.macros.kcal}</b>kcal · 단백질 <b>{food.macros.protein}g</b>
        </div>
      </div>
    </article>
  );
}

// 슬라이더 본체
// - items: getAdapted 결과 배열 (정렬은 부모가 처리)
// - onItemClick(food)
export function RecommendSlider({ items, onItemClick }) {
  if (!items || items.length === 0) {
    return <div className="m-home-empty">추천할 식품이 없습니다.</div>;
  }
  return (
    <div className="m-home-rec-slider" role="list" aria-label="추천 식품 슬라이더">
      {items.map((food) => (
        <div key={food.id} role="listitem">
          <RecommendCard food={food} onClick={() => onItemClick && onItemClick(food)} />
        </div>
      ))}
    </div>
  );
}
