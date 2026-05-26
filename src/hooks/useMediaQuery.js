import { useEffect, useState } from 'react';

// 미디어쿼리 매칭 여부를 반환하는 훅
// - SSR 안전: 초기값은 false → 첫 effect에서 실제 값으로 동기화
// - matchMedia 이벤트 구독으로 viewport 변경에 반응
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}

// 표준 모바일 브레이크포인트 (≤768px = 모바일 또는 태블릿 세로)
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
