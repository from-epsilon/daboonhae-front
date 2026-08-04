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
        <Skeleton width="38%" height={10} />
        <Skeleton width="92%" height={14} />
        <Skeleton width="68%" height={14} />
        <div className="d-skeleton-foodcard-stats">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton width="58%" height={8} />
              <Skeleton width="78%" height={14} />
            </div>
          ))}
        </div>
        <div className="d-skeleton-foodcard-purchase">
          <Skeleton width="35%" height={10} />
          <Skeleton width="38%" height={14} />
        </div>
      </div>
    </div>
  );
}

// wide 레이아웃 스켈레톤 (가로형 카드)
export function FoodCardWideSkeleton() {
  return (
    <div className="d-skeleton-wide-card" aria-hidden="true">
      <div className="d-skeleton-wide-actions">
        <Skeleton width={32} height={32} radius={16} />
        <Skeleton width={32} height={32} radius={16} />
      </div>
      <div className="d-skeleton-wide-main">
        <Skeleton width={140} height={140} radius={8} />
        <div className="d-skeleton-wide-body">
          <Skeleton width="20%" height={11} />
          <Skeleton width="60%" height={18} />
          <Skeleton width="22%" height={11} />
          <div className="d-skeleton-wide-metrics">
            <Skeleton width="24%" height={13} />
            <Skeleton width="18%" height={13} />
          </div>
          <Skeleton width="58%" height={11} />
          <Skeleton width="44%" height={11} />
        </div>
      </div>
      <div className="d-skeleton-wide-offers">
        <div className="d-skeleton-wide-offers-head">
          <Skeleton width={48} height={10} />
          <Skeleton width={260} height={9} />
        </div>
        <div className="d-skeleton-wide-offers-list">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={154} height={80} radius={8} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FoodCardListSkeleton() {
  return (
    <div className="m-list-skeleton-card" aria-hidden="true">
      <div className="m-list-skeleton-actions">
        <Skeleton width={29} height={29} radius={15} />
        <Skeleton width={29} height={29} radius={15} />
      </div>
      <div className="m-list-skeleton-main">
        <Skeleton width={104} height={104} radius={4} />
        <div className="m-list-skeleton-body">
          <Skeleton width="30%" height={10} />
          <Skeleton width="72%" height={14} />
          <Skeleton width="55%" height={14} />
          <Skeleton width="44%" height={10} />
          <div className="m-list-skeleton-metrics">
            <Skeleton width="36%" height={13} />
            <Skeleton width="28%" height={13} />
          </div>
        </div>
      </div>
      <div className="m-list-skeleton-offers">
        <div className="m-list-skeleton-offers-head">
          <Skeleton width={42} height={9} />
          <Skeleton width={188} height={8} />
        </div>
        <div className="m-list-skeleton-offers-list">
          <Skeleton width={142} height={64} radius={8} />
          <Skeleton width={142} height={64} radius={8} />
          <Skeleton width={142} height={64} radius={8} />
        </div>
      </div>
    </div>
  );
}
