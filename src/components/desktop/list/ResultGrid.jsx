import { FoodCard } from '../../ds/FoodCard.jsx';
import { FoodCardWideSkeleton } from '../../ds/Skeleton.jsx';
import { getAdapted } from '../../../data/adapters.js';
import { getFoodTypeByCode } from '../../../data/categoryTabs.js';
import { useCompare } from '../../../store/CompareContext.jsx';

export default function ResultGrid({
  products,
  onCardClick,
  onCompare,
  isLoading = false,
  skeletonCount = 5,
  sortKey,
}) {
  const { has } = useCompare();
  if (isLoading) {
    return (
      <div className="d-list-wide">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <FoodCardWideSkeleton key={`s-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="d-list-wide">
      {products.map((p) => {
        const food = getAdapted(p);
        // 카드 강조 지표는 제품의 식품유형(목적 탭 + 라벨) 기준 — 모바일 리스트와 동일
        const ft = getFoodTypeByCode(p.categoryCode);
        return (
          <div key={p.id} className="d-list-wide-cell">
            <FoodCard
              food={food}
              layout="wide"
              onClick={() => onCardClick(p.id)}
              onCompare={() => onCompare(p.id)}
              inCompare={has(p.id)}
              sortKey={sortKey}
              tabId={ft?.tab}
              subLabel={ft?.label}
            />
          </div>
        );
      })}
    </div>
  );
}
