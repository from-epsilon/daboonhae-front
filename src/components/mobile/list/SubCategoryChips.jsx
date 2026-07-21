// 모바일 식품유형 칩 (한 줄 가로 스크롤)
// - 첫 칩은 항상 '전체' (값 'all')
// - categories: { label, disabled } 배열 — 준비중(disabled)은 비활성 + '준비중' 표시
// - 칩이 화면 너비를 넘으면 가로로 스크롤
import { Chip } from '../../ds/Chip.jsx';

export function SubCategoryChips({ categories = [], value, onChange }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="m-list-category-chips">
      <Chip active={value === 'all'} onClick={() => onChange('all')}>
        전체
      </Chip>
      {categories.map((cat) => (
        <Chip
          key={cat.label}
          active={value === cat.label}
          disabled={cat.disabled}
          onClick={() => onChange(cat.label)}
        >
          {cat.disabled ? `${cat.label} (준비중)` : cat.label}
        </Chip>
      ))}
    </div>
  );
}
