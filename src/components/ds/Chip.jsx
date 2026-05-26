// 다분해 DS Chip (필터/태그용 작은 버튼)
// props:
//   - active: boolean — 선택 상태 (검은 배경)
//   - variant: 'default' | 'brand' (브랜드 그린 톤)
//   - onClick: () => void
export function Chip({ active = false, variant = 'default', children, onClick }) {
  // 기본 스타일
  const styles = {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 14px',
    borderRadius: 999,
    border: '1px solid var(--border-tertiary)',
    background: 'white',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  // active 우선, brand 보조 — DS 원본 순서 유지
  if (active) {
    Object.assign(styles, {
      background: 'var(--gray-900)',
      color: 'white',
      borderColor: 'var(--gray-900)',
    });
  }
  if (variant === 'brand') {
    Object.assign(styles, {
      background: 'var(--green-50)',
      color: 'var(--green-700)',
      borderColor: 'var(--green-200)',
    });
  }

  // 클릭 핸들러 타입 안전
  const handleClick = (e) => {
    if (typeof onClick === 'function') onClick(e);
  };

  return (
    <button type="button" style={styles} onClick={handleClick}>
      {children}
    </button>
  );
}
