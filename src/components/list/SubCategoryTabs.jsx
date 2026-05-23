// 세부 카테고리 박스 (Kurly 스타일)
// - categories 배열을 받아 + '전체보기' 박스 그리드로 노출
// - 빈 배열이면 박스 미노출
// - 활성 카테고리는 primary 색상 + 굵게 표시
export default function SubCategoryTabs({ categories, value, onChange }) {
  if (!categories || categories.length === 0) {
    return null;
  }
  const tabs = ['all', ...categories];

  return (
    <nav className="category-nav" aria-label="세부 카테고리">
      <div className="category-nav-box">
        <div className="category-nav-grid">
          {tabs.map((tab) => {
            const isActive = value === tab;
            const label = tab === 'all' ? '전체보기' : tab;
            return (
              <button
                key={tab}
                type="button"
                aria-pressed={isActive}
                className={`category-nav-item ${isActive ? 'is-active' : ''}`}
                onClick={() => onChange(tab)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
