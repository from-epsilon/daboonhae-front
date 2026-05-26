// 다분해 DS ScoreGauge (원형 게이지 + 중앙 숫자)
// props:
//   - value: number (0.0 ~ 10.0)
//   - size: number (px, 기본 96)
//   - label: 게이지 하단 라벨 (선택)
import { scoreColor } from '../../data/adapters.js';

export function ScoreGauge({ value, size = 96, label }) {
  // 원 반지름과 둘레 계산
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const safeValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  // value/10 비율만큼 dashoffset 줄여 색칠
  const offset = circumference - (safeValue / 10) * circumference;
  const color = scoreColor(safeValue);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* 베이스 트랙 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gray-200)"
          strokeWidth={6}
        />
        {/* 진행 호 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-numeric)',
            fontWeight: 700,
            fontSize: size * 0.32,
            color: 'var(--text-primary)',
          }}
        >
          {safeValue.toFixed(1)}
        </div>
        {label && (
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
        )}
      </div>
    </div>
  );
}
