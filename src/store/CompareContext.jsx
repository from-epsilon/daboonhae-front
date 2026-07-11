import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useProducts } from './ProductsContext.jsx';
import { ANALYTICS_EVENTS, captureEvent } from '../lib/analytics.js';

// 비교함(compare cart) 전역 상태
// - 어디서든 제품을 담거나 빼기 가능
// - localStorage에 영속 → 새로고침에도 유지

const STORAGE_KEY = 'dabunhae:compare:v1';
// 비교함 최대 담을 수 있는 제품 수 (UI/UX 폭 고려)
export const MAX_COMPARE = 5;
const CompareContext = createContext(null);

// localStorage에서 초기값 로드 (최대치 초과분은 잘라냄)
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

// localStorage에 저장
function saveToStorage(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 저장 실패는 치명적이지 않으므로 무시
  }
}

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => loadFromStorage());
  const idsRef = useRef(ids);
  const { products, loaded } = useProducts({ autoLoad: false });
  const validIds = useMemo(
    () => new Set(products.map((p) => String(p.id))),
    [products],
  );

  // 상태 변경 시 localStorage 동기화
  useEffect(() => {
    idsRef.current = ids;
    saveToStorage(ids);
  }, [ids]);

  // 제품 풀에서 제외된 항목(비활성 제품/비활성 카테고리 등)은 비교함에서도 제거
  useEffect(() => {
    if (!loaded) return;
    setIds((prev) => prev.filter((id) => validIds.has(String(id))));
  }, [loaded, validIds]);

  // 추가 시 최대치 초과면 false 반환 → 호출부에서 알림 처리
  const add = useCallback((productId) => {
    if (loaded && !validIds.has(String(productId))) return false;
    const current = idsRef.current;
    if (current.some((id) => String(id) === String(productId))) return false;
    if (current.length >= MAX_COMPARE) return false;
    const next = [...current, productId];
    idsRef.current = next;
    setIds(next);
    captureEvent(ANALYTICS_EVENTS.COMPARE_CHANGED, {
      action: 'added',
      product_id: String(productId),
      item_count: next.length,
    });
    return true;
  }, [loaded, validIds]);

  const remove = useCallback((productId) => {
    const current = idsRef.current;
    const next = current.filter((id) => String(id) !== String(productId));
    if (next.length === current.length) return;
    idsRef.current = next;
    setIds(next);
    captureEvent(ANALYTICS_EVENTS.COMPARE_CHANGED, {
      action: 'removed',
      product_id: String(productId),
      item_count: next.length,
    });
  }, []);

  // 토글: 이미 담겨있으면 빼기, 아니면 추가 (최대치 초과면 false 반환)
  const toggle = useCallback((productId) => {
    if (loaded && !validIds.has(String(productId))) return false;
    const current = idsRef.current;
    const removing = current.some((id) => String(id) === String(productId));
    if (!removing && current.length >= MAX_COMPARE) return false;
    const next = removing
      ? current.filter((id) => String(id) !== String(productId))
      : [...current, productId];
    idsRef.current = next;
    setIds(next);
    captureEvent(ANALYTICS_EVENTS.COMPARE_CHANGED, {
      action: removing ? 'removed' : 'added',
      product_id: String(productId),
      item_count: next.length,
    });
    return true;
  }, [loaded, validIds]);

  const clear = useCallback(() => {
    idsRef.current = [];
    setIds([]);
  }, []);

  const reorder = useCallback((sourceId, destinationId, position = 'before') => {
    const current = idsRef.current;
    const sourceIndex = current.findIndex((id) => String(id) === String(sourceId));
    const destinationIndex = current.findIndex((id) => String(id) === String(destinationId));
    if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex === destinationIndex) return;
    const next = [...current];
    const [moved] = next.splice(sourceIndex, 1);
    const remainingDestinationIndex = next.findIndex((id) => String(id) === String(destinationId));
    const insertIndex = remainingDestinationIndex + (position === 'after' ? 1 : 0);
    next.splice(insertIndex, 0, moved);
    idsRef.current = next;
    setIds(next);
  }, []);

  const has = useCallback((productId) => ids.includes(productId), [ids]);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      max: MAX_COMPARE,
      isFull: ids.length >= MAX_COMPARE,
      add,
      remove,
      toggle,
      clear,
      reorder,
      has,
    }),
    [ids, add, remove, toggle, clear, reorder, has],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare는 CompareProvider 안에서만 사용 가능');
  return ctx;
}
