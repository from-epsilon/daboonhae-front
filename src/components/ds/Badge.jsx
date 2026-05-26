// 다분해 DS Badge (소형 라벨)
// props:
//   - variant: 'brand' | 'softGreen' | 'red' | 'softRed' | 'orange' | 'softOrange' | 'info' | 'cta' | 'outline'
//   - children: 라벨 텍스트
export function Badge({ variant = 'brand', children }) {
  // 공통 형태
  const base = {
    fontFamily: 'var(--font-body)',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 3,
    lineHeight: 1.3,
    display: 'inline-flex',
    alignItems: 'center',
  };

  // variant별 색상 매핑 — adapters 에서 발급하는 v 값과 일치해야 함
  const variants = {
    brand: { background: 'var(--green-500)', color: 'white' },
    softGreen: { background: 'var(--green-50)', color: 'var(--green-700)' },
    red: { background: 'var(--red-500)', color: 'white' },
    softRed: { background: 'var(--red-50)', color: 'var(--red-700)' },
    orange: { background: 'var(--orange-500)', color: 'white' },
    softOrange: { background: 'var(--orange-50)', color: 'var(--orange-700)' },
    info: { background: 'var(--blue-50)', color: 'var(--blue-700)' },
    cta: { background: 'var(--brand-cta)', color: 'white' },
    outline: {
      background: 'white',
      color: 'var(--text-primary)',
      border: '1px solid var(--gray-900)',
    },
  };

  // 잘못된 variant 들어와도 brand 폴백
  const variantStyle = variants[variant] ?? variants.brand;

  return <span style={{ ...base, ...variantStyle }}>{children}</span>;
}
