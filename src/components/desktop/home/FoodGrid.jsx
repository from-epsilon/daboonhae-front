// 데스크탑 메인: 식품 카드 그리드 (Round 4)
// - 추천/최근 두 섹션에서 공통 사용 (4컬럼 그리드)
// - 메인 전용 SummaryCard 사용 — 목록/찜함 카드와 구현·스타일 독립
// - props: { items, onItemClick, onCompare }
import { SummaryCard } from '../../summary/SummaryCard.jsx';
import { useCompare } from '../../../store/CompareContext.jsx';

// 그리드 셀 한 칸 — SummaryCard를 홈 전용 hover 래퍼로 감쌈
// - rank: 1부터 시작하는 순위 (전달 시 셀 좌상단 배지 오버레이, 1~3위는 브랜드 그린)
// - metrics: 목적별 핵심 성분 정의 (요약카드 지표 교체용)
function FoodCell({ food, rank, metrics, onItemClick, onCompare, inCompare, showPurchase, variant }) {
  const cardProps = {
    food,
    onClick: () => onItemClick(food),
    onCompare: onCompare ? () => onCompare(food) : undefined,
    inCompare,
  };

  return (
    <div className="d-home-food-cell">
      {rank != null && (
        <span className={`d-home-rank-badge${rank <= 3 ? ' is-top' : ''}`}>
          {rank}
        </span>
      )}
      <SummaryCard
        {...cardProps}
        metrics={metrics}
        showPurchase={showPurchase}
        variant={variant === 'recommend' ? 'recommend' : 'standard'}
      />
    </div>
  );
}

export default function FoodGrid({ items, onItemClick, onCompare, variant = 'recommend', showPurchase = false, showRank = false, metrics }) {
  const { has } = useCompare();
  // variant 별 클래스: recommend(추천 12개) | recent(최근 8개) — 그리드 차이 미세
  const cls = variant === 'recent' ? 'd-home-recent-grid' : 'd-home-food-grid';
  return (
    <div className={cls}>
      {items.map((food, i) => (
        <FoodCell
          key={food.id}
          food={food}
          rank={showRank ? i + 1 : null}
          metrics={metrics}
          onItemClick={onItemClick}
          onCompare={onCompare}
          inCompare={has(food.id)}
          showPurchase={showPurchase}
          variant={variant}
        />
      ))}
    </div>
  );
}
