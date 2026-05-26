// 모바일 세부 카테고리 가로 스크롤 칩
// - 첫 칩은 항상 '전체' (값 'all')
// - active 시 검은 배경 (DS Chip atom 활용)
import { Chip } from '../../ds/Chip.jsx';

export function SubCategoryChips({ categories = [], value, onChange }) {
  // 카테고리 비어있으면 (purpose=all) 영역 자체 미렌더
  if (!categories || categories.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        padding: '10px 16px',
        background: 'white',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-tertiary)',
        WebkitOverflowScrolling: 'touch',
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
