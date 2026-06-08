// 모바일 식품유형 칩 (줄바꿈 wrap — 가로 스크롤 X)
// - 첫 칩은 항상 '전체' (값 'all')
// - categories: { label, disabled } 배열 — 준비중(disabled)은 비활성 + '준비중' 표시
// - 칩이 많아지면 다음 줄로 넘어감
import { Chip } from '../../ds/Chip.jsx';

export function SubCategoryChips({ categories = [], value, onChange }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        padding: '8px 16px',
        background: 'white',
        borderBottom: '1px solid var(--border-tertiary)',
        flexShrink: 0,
      }}
    >
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
          {cat.disabled ? `${cat.label} · 준비중` : cat.label}
        </Chip>
      ))}
    </div>
  );
}
