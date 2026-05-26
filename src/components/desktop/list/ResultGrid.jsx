import { FoodCard } from '../../ds/FoodCard.jsx';
import { FoodCardSkeleton } from '../../ds/Skeleton.jsx';
import { getAdapted } from '../../../data/adapters.js';

// 데스크탑 결과 그리드
// - 4컬럼 고정 (CSS grid-template-columns), 화면 1024~1280 사이에선 3컬럼으로 자동 축소
// - FoodCard layout="grid" 사용
// - 카드 클릭 → 디테일, + 버튼 → 비교함 토글
// - isLoading=true 면 skeletonCount 만큼 placeholder 카드 렌더 (CLS 방지)
export default function ResultGrid({
  products,
  onCardClick,
  onCompare,
  isLoading = false,
  skeletonCount = 8,
}) {
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
            />
          </div>
        );
      })}
    </div>
  );
}
