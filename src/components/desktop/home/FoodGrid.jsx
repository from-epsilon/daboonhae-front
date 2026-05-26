// 데스크탑 메인: 식품 카드 그리드 (Round 4)
// - 추천/최근 두 섹션에서 공통 사용 (4컬럼 그리드)
// - DS atom FoodCard(layout='grid') 사용 — hover lift 는 외부 래퍼에서 부여
// - props: { items, onItemClick, onCompare }
import { FoodCard } from '../../ds/FoodCard.jsx';

// 그리드 셀 한 칸 — FoodCard 를 hover-lift 가능한 래퍼로 감쌈
// (FoodCard atom 자체는 모바일과 공유하므로 hover 스타일을 atom 내부에 박지 않음)
function FoodCell({ food, onItemClick, onCompare }) {
  return (
    <div className="d-home-food-cell">
      <FoodCard
        food={food}
        layout="grid"
        onClick={() => onItemClick(food)}
        onCompare={onCompare ? () => onCompare(food) : undefined}
      />
    </div>
  );
}

export default function FoodGrid({ items, onItemClick, onCompare, variant = 'recommend' }) {
  // variant 별 클래스: recommend(추천 12개) | recent(최근 8개) — 그리드 차이 미세
  const cls = variant === 'recent' ? 'd-home-recent-grid' : 'd-home-food-grid';
  return (
    <div className={cls}>
      {items.map((food) => (
        <FoodCell
          key={food.id}
          food={food}
          onItemClick={onItemClick}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
}
