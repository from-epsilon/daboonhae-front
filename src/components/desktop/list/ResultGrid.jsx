import { FoodCard } from '../../ds/FoodCard.jsx';
import { FoodCardWideSkeleton } from '../../ds/Skeleton.jsx';
import { getAdapted } from '../../../data/adapters.js';
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
        return (
          <div key={p.id} className="d-list-wide-cell">
            <FoodCard
              food={food}
              layout="wide"
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
