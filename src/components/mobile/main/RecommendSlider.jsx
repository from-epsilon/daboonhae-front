// 모바일 메인 — 추천 식품 가로 슬라이더
// - 점수 내림차순 상위 8개의 mini 카드를 horizontal scroll-snap으로 노출
// - 점수 배지는 노출하지 않음 (홈에서는 정보 밀도를 낮춤)
// - 작은 폭(약 144px) 미니 카드: 썸네일 + 브랜드 + 이름 + 목적별 핵심 성분
import { getHighlightValue } from '../../../data/categoryCardMetrics.js';

// 목적별 핵심 성분 스탯 — 라벨 위 + 수치 아래 정렬 컬럼 (1~3개, 1순위 강조)
// - 카드 간 같은 위치에 같은 성분이 와서 가로 스캔으로 비교 가능
function HighlightStats({ food, metrics }) {
  let items = (metrics ?? [])
    .map((m) => ({ m, v: getHighlightValue(food, m) }))
    .filter((x) => x.v !== null);
  if (items.length === 0) {
    // 성분 데이터가 없으면 기본 매크로 폴백
    items = [
      { m: { key: 'calories', label: '칼로리' }, v: { num: food.macros.kcal, unit: 'kcal' } },
      { m: { key: 'protein', label: '단백질' }, v: { num: food.macros.protein, unit: 'g' } },
    ];
  }
  return (
    <div className="m-home-rec-stats">
      {items.map(({ m, v }, i) => (
        <div key={m.key} className={`m-home-rec-stat${i === 0 ? ' is-primary' : ''}`}>
          <span className="m-home-rec-stat-label">{m.label}</span>
          <span className="m-home-rec-stat-value">
            {v.num}
            <span className="m-home-rec-stat-unit">{v.unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// 단일 미니 카드 — 슬라이더 한 셀
// - onClick 시 디테일 진입 (상위에서 처리)
// - rank: 1부터 시작하는 순위 (전달 시 썸네일 좌상단 배지로 표시, 1~3위는 브랜드 그린)
// - metrics: 목적별 핵심 성분 정의 (없으면 기본 매크로 표시)
function RecommendCard({ food, rank, metrics, onClick }) {
  return (
    <article className="m-home-rec-card" onClick={onClick}>
      {/* 썸네일 */}
      <div className="m-home-rec-thumb">
        {rank != null && (
          <span className={`m-home-rec-rank${rank <= 3 ? ' is-top' : ''}`}>
            {rank}
          </span>
        )}
        {food.thumb ? (
          <img src={food.thumb} alt={food.name} loading="lazy" />
        ) : (
          <div className="m-home-rec-thumb-placeholder" />
        )}
      </div>
      {/* 텍스트 영역 */}
      <div className="m-home-rec-meta">
        <div className="m-home-rec-brand">{food.brand}</div>
        <div className="m-home-rec-name">{food.name}</div>
        <HighlightStats food={food} metrics={metrics} />
      </div>
    </article>
  );
}

// 슬라이더 본체
// - items: getAdapted 결과 배열 (정렬은 부모가 처리)
// - onItemClick(food)
// - showRank: true 시 정렬 순서대로 1위부터 순위 배지 표시
// - metrics: 목적별 핵심 성분 정의 (getPurposeHighlightMetrics 결과)
export function RecommendSlider({ items, onItemClick, showRank = false, metrics }) {
  if (!items || items.length === 0) {
    return <div className="m-home-empty">추천할 식품이 없습니다.</div>;
  }
  return (
    <div className="m-home-rec-slider" role="list" aria-label="추천 식품 슬라이더">
      {items.map((food, i) => (
        <div key={food.id} role="listitem">
          <RecommendCard
            food={food}
            rank={showRank ? i + 1 : null}
            metrics={metrics}
            onClick={() => onItemClick && onItemClick(food)}
          />
        </div>
      ))}
    </div>
  );
}
