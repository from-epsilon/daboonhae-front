// 모바일 메인 — 최근 추가 식품 리스트
// - FoodCard layout="list"를 그대로 사용 (썸네일+이름+macros+tags+trust)
// - 부모에서 정렬/슬라이스된 items를 받는다
import { FoodCard } from '../../ds/FoodCard.jsx';

export function RecentList({ items, onItemClick, onCompare }) {
  if (!items || items.length === 0) {
    return <div className="m-home-empty">최근 추가된 식품이 없습니다.</div>;
  }
  return (
    <ul className="m-home-recent-list" role="list">
      {items.map((food) => (
        <li key={food.id} className="m-home-recent-row">
          <FoodCard
            food={food}
            layout="list"
            onClick={() => onItemClick && onItemClick(food)}
            onCompare={onCompare ? () => onCompare(food) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
