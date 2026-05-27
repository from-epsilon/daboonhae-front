// 다분해 DS — 스켈레톤 로딩 프리미티브
// - 단일 책임: 회색 박스 + shimmer 애니메이션
// - prefers-reduced-motion에서는 애니메이션 비활성 (정적 회색 박스로 표시)
// - className으로 추가 모양 조정 (border-radius 등)

// 공통 박스
// props:
//   - width / height: number(px) | string(CSS) — 미지정 시 100% / 16px
//   - radius: number(px) — 미지정 시 4px
//   - className: 추가 클래스
//   - style: 추가 인라인 스타일
export function Skeleton({ width, height, radius = 4, className = '', style }) {
  const w = typeof width === 'number' ? `${width}px` : width ?? '100%';
  const h = typeof height === 'number' ? `${height}px` : height ?? '16px';
  return (
    <span
      aria-hidden="true"
      className={`d-skeleton ${className}`}
      style={{ width: w, height: h, borderRadius: radius, ...style }}
    />
  );
}

// FoodCard.grid 와 같은 모양으로 비어있는 카드 한 칸을 렌더
export function FoodCardSkeleton() {
  return (
    <div className="d-skeleton-foodcard" aria-hidden="true">
      <Skeleton height="100%" radius={8} className="d-skeleton-foodcard-thumb" />
      <div className="d-skeleton-foodcard-body">
        <Skeleton width="40%" height={10} />
        <Skeleton width="90%" height={14} />
        <Skeleton width="70%" height={14} />
        <Skeleton width="60%" height={18} />
      </div>
    </div>
  );
}

// wide 레이아웃 스켈레톤 (가로형 카드)
export function FoodCardWideSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        gap: 20,
        padding: '20px 0',
        borderBottom: '1px solid var(--border-tertiary)',
      }}
    >
      <Skeleton width={140} height={140} radius={8} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width="20%" height={11} />
        <Skeleton width="60%" height={15} />
        <Skeleton width="15%" height={11} />
        <Skeleton width="100%" height={6} radius={3} />
        <Skeleton width="50%" height={12} />
        <div style={{ display: 'flex', gap: 4 }}>
          <Skeleton width={48} height={18} radius={3} />
          <Skeleton width={36} height={18} radius={3} />
          <Skeleton width={52} height={18} radius={3} />
        </div>
        <Skeleton width="40%" height={11} />
      </div>
      <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Skeleton width={40} height={28} radius={4} />
        <Skeleton width={56} height={28} radius={4} />
      </div>
    </div>
  );
}
