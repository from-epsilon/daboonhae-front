import { FoodCard } from '../../ds/FoodCard.jsx';
import { FoodCardSkeleton } from '../../ds/Skeleton.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { useCompare } from '../../../store/CompareContext.jsx';

export default function ResultGrid({
  products,
  onCardClick,
  onCompare,
  isLoading = false,
  skeletonCount = 8,
  sortKey,
}) {
  const { has } = useCompare();
  if (isLoading) {
    return (
      <div className="d-list-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={`s-${i}`} className="d-list-grid-cell">
            <FoodCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="d-list-grid">
      {products.map((p) => {
        // adapter는 카드 렌더 직전에 호출 — 정렬/필터된 결과만 변환
        const food = getAdapted(p);
        return (
          <div key={p.id} className="d-list-grid-cell">
            <FoodCard
              food={food}
              layout="grid"
              onClick={() => onCardClick(p.id)}
              onCompare={() => onCompare(p.id)}
              inCompare={has(p.id)}
              sortKey={sortKey}
            />
          </div>
        );
      })}
    </div>
  );
}
