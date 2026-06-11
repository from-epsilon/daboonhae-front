import { useCallback, useEffect, useState } from 'react';

// 선택 가이드 접힘/펼침 상태 훅
// - localStorage에 저장 → 다른 상세 페이지로 이동해도 접은 상태가 유지됨
// - 기본값은 펼침(false). 사용자가 한 번 접으면 그 선택이 이어짐
const STORAGE_KEY = 'dabunhae:guideCollapsed:v1';

function loadCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function useGuideCollapsed() {
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // 저장 실패는 치명적이지 않으므로 무시
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);

  return [collapsed, toggle];
}
