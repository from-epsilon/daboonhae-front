// 모바일 메인 — 최근 추가 식품 리스트
// - 메인 전용 MobileSummaryListCard 사용 (목록 카드와 구현·스타일 독립)
// - 부모에서 정렬/슬라이스된 items를 받는다
import { MobileSummaryListCard } from '../../summary/SummaryCard.jsx';
import { useCompare } from '../../../store/CompareContext.jsx';

export function RecentList({ items, onItemClick, onCompare }) {
  const { has } = useCompare();

  if (!items || items.length === 0) {
    return <div className="m-home-empty">최근 추가된 식품이 없습니다.</div>;
  }
  return (
    <ul className="m-home-recent-list" role="list">
      {items.map((food) => (
        <li key={food.id} className="m-home-recent-row">
          <MobileSummaryListCard
            food={food}
            onClick={() => onItemClick && onItemClick(food)}
            onCompare={onCompare ? () => onCompare(food) : undefined}
            inCompare={has(food.id)}
          />
        </li>
      ))}
    </ul>
  );
}
