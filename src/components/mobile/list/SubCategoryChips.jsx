// 모바일 세부 카테고리 칩 (줄바꿈 wrap — 가로 스크롤 X)
// - 첫 칩은 항상 '전체' (값 'all')
// - 칩이 많아지면 다음 줄로 넘어감
import { Chip } from '../../ds/Chip.jsx';

export function SubCategoryChips({ categories = [], value, onChange }) {
  // 카테고리 비어있으면 (purpose=all) 영역 자체 미렌더
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
        <Chip key={cat} active={value === cat} onClick={() => onChange(cat)}>
          {cat}
        </Chip>
      ))}
    </div>
  );
}
