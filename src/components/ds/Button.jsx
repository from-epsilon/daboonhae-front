// 다분해 DS Button
// props:
//   - variant: 'cta' | 'brand' | 'secondary' | 'ghost' (기본 'cta')
//   - size: 'sm' | 'md' | 'lg' (기본 'md')
//   - full: boolean — true 시 100% 너비
//   - disabled: boolean
//   - onClick: () => void
//   - children: 버튼 내용
export function Button({
  variant = 'cta',
  size = 'md',
  children,
  onClick,
  full = false,
  disabled = false,
}) {
  // 스타일 토큰 분리 (base + variant + size 머지)
  const styles = {
    base: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      border: '1px solid transparent',
      borderRadius: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      lineHeight: 1,
    },
    cta: {
      background: disabled ? 'var(--gray-200)' : 'var(--brand-cta)',
      color: disabled ? 'var(--text-tertiary)' : 'white',
    },
    brand: { background: 'var(--green-500)', color: 'white' },
    secondary: {
      background: 'white',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-secondary)',
    },
    ghost: { background: 'var(--gray-100)', color: 'var(--text-primary)' },
    sm: { fontSize: 13, padding: '8px 14px' },
    md: { fontSize: 15, padding: '12px 20px' },
    lg: { fontSize: 16, padding: '16px 28px' },
  };

  // 클릭 핸들러: disabled 일 때 호출 안 함 + 함수 타입 가드
  const handleClick = (e) => {
    if (disabled) return;
    if (typeof onClick === 'function') onClick(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        width: full ? '100%' : undefined,
        display: full ? 'flex' : 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}
