import { useEffect, useRef } from 'react';

// 무한 스크롤 훅 — 센티널 요소가 뷰포트에 가까워지면 onLoadMore 호출
// - hasMore가 false면 관찰하지 않음
// - rootMargin으로 바닥 도달 전에 미리 로드 (기본 400px)
export function useInfiniteScroll({ hasMore, onLoadMore, rootMargin = '400px' }) {
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, rootMargin]);

  return sentinelRef;
}
