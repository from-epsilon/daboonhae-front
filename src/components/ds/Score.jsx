// 다분해 DS Score (점수 텍스트 표기 "8.7점")
// props:
//   - value: number (0.0 ~ 10.0)
//   - size: 'sm' | 'md' | 'lg' | 'xl'
import { scoreColor } from '../../data/adapters.js';

// 사이즈별 토큰 (DS 원본 그대로)
const SIZE_TOKENS = {
  sm: { num: 14, suf: 9, gap: 1, pad: '3px 8px' },
  md: { num: 22, suf: 12, gap: 2, pad: '6px 12px' },
  lg: { num: 32, suf: 16, gap: 3, pad: '10px 16px' },
  xl: { num: 56, suf: 22, gap: 4, pad: 0 },
};

export function Score({ value, size = 'md' }) {
  const s = SIZE_TOKENS[size] ?? SIZE_TOKENS.md;
  // value 안전 변환 (number 가 아니어도 0 으로)
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: s.gap,
        color: scoreColor(safeValue),
        fontFamily: 'var(--font-numeric)',
        fontWeight: 700,
        fontFeatureSettings: '"tnum"',
      }}
    >
      <span style={{ fontSize: s.num, lineHeight: 1 }}>{safeValue.toFixed(1)}</span>
      <span style={{ fontSize: s.suf, color: 'var(--text-secondary)', fontWeight: 500 }}>점</span>
    </div>
  );
}
