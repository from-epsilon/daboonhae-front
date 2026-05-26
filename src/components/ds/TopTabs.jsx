// 다분해 DS TopTabs (상단 탭 — 카테고리/리스트 페이지용)
// props:
//   - tabs: string[]  탭 라벨 배열
//   - active: number  현재 활성 인덱스
//   - onSelect: (index) => void
export function TopTabs({ tabs = [], active = 0, onSelect }) {
  // 클릭 핸들러 타입 가드
  const handleSelect = (i) => {
    if (typeof onSelect === 'function') onSelect(i);
  };

  return (
    <div
      style={{
        background: 'white',
        display: 'flex',
        padding: '0 8px',
        borderBottom: '1px solid var(--border-tertiary)',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      {tabs.map((t, i) => (
        <div
          key={i}
          onClick={() => handleSelect(i)}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: i === active ? 700 : 500,
            padding: '14px 12px',
            color: i === active ? 'var(--text-primary)' : 'var(--text-tertiary)',
            position: 'relative',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {t}
          {i === active && (
            <span
              style={{
                position: 'absolute',
                bottom: -1,
                left: 8,
                right: 8,
                height: 2,
                background: 'var(--gray-900)',
                borderRadius: 2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
