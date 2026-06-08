// 다분해 DS Chip (필터/태그용 작은 버튼)
// props:
//   - active: boolean — 선택 상태 (검은 배경)
//   - variant: 'default' | 'brand' (브랜드 그린 톤)
//   - disabled: boolean — 분석 준비중 등 비활성 (클릭 불가 + 흐리게)
//   - onClick: () => void
export function Chip({ active = false, variant = 'default', disabled = false, children, onClick }) {
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

  // active 우선, brand 보조 — 선택 상태는 brand green으로 통일
  if (active) {
    Object.assign(styles, {
      background: 'var(--green-600)',
      color: 'white',
      borderColor: 'var(--green-600)',
    });
  }
  if (variant === 'brand') {
    Object.assign(styles, {
      background: 'var(--green-50)',
      color: 'var(--green-700)',
      borderColor: 'var(--green-200)',
    });
  }
  // 비활성(준비중) — active/brand보다 우선해 흐린 회색으로 덮어씀
  if (disabled) {
    Object.assign(styles, {
      background: 'var(--gray-100)',
      color: 'var(--text-tertiary)',
      borderColor: 'var(--border-tertiary)',
      cursor: 'default',
    });
  }

  // 클릭 핸들러 타입 안전 — 비활성 시 무시
  const handleClick = (e) => {
    if (disabled) return;
    if (typeof onClick === 'function') onClick(e);
  };

  return (
    <button
      type="button"
      style={styles}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
    >
      {children}
    </button>
  );
}
