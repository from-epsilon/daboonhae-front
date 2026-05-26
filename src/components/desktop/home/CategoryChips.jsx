// 데스크탑 메인: 카테고리 카드 그리드 (크몽의 카테고리 아이콘 그리드 패턴)
// - 대표 카테고리 8개를 큰 카드(아이콘 + 라벨)로 노출
// - 클릭 → onSelect(category) — 부모에서 navigate('/list?category=...') 처리
// - 아이콘은 lucide 활용 (카테고리별 의미에 가까운 아이콘 매핑)
import {
  Drumstick,
  Milk,
  Cookie,
  Salad,
  Soup,
  GlassWater,
  Candy,
  CupSoda,
} from 'lucide-react';

// 카테고리별 아이콘/라벨/색상 — 화이트리스트로 고정
const CATEGORIES = [
  { name: '닭가슴살', Icon: Drumstick },
  { name: '프로틴 드링크', Icon: Milk },
  { name: '프로틴 바', Icon: Cookie },
  { name: '샐러드', Icon: Salad },
  { name: '저칼로리 도시락', Icon: Soup },
  { name: '제로 음료', Icon: GlassWater },
  { name: '간식', Icon: Candy },
  { name: '쉐이크', Icon: CupSoda },
];

function CategoryCard({ name, Icon, onClick }) {
  return (
    <button type="button" className="d-home-category-card" onClick={onClick}>
      <span className="d-home-category-icon-wrap" aria-hidden="true">
        <Icon size={24} strokeWidth={1.7} />
      </span>
      <span className="d-home-category-label">{name}</span>
    </button>
  );
}

export default function CategoryChips({ onSelect }) {
  return (
    <div className="d-home-category-grid">
      {CATEGORIES.map((c) => (
        <CategoryCard key={c.name} {...c} onClick={() => onSelect(c.name)} />
      ))}
    </div>
  );
}
