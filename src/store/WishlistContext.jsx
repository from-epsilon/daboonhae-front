import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useProducts } from './ProductsContext.jsx';
import { ANALYTICS_EVENTS, captureEvent } from '../lib/analytics.js';

const STORAGE_KEY = 'dabunhae:wishlist:v1';
const WishlistContext = createContext(null);

function normalizeId(id) {
  return id == null ? '' : String(id);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map(normalizeId).filter(Boolean))];
  } catch {
    return [];
  }
}

function saveToStorage(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 저장 실패는 치명적이지 않으므로 무시
  }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => loadFromStorage());
  const idsRef = useRef(ids);
  const { products, loaded } = useProducts({ autoLoad: false });
  const validIds = useMemo(
    () => new Set(products.map((p) => normalizeId(p.id))),
    [products],
  );

  useEffect(() => {
    idsRef.current = ids;
    saveToStorage(ids);
  }, [ids]);

  useEffect(() => {
    if (!loaded) return;
    setIds((prev) => prev.filter((id) => validIds.has(normalizeId(id))));
  }, [loaded, validIds]);

  const add = useCallback((productId) => {
    const id = normalizeId(productId);
    if (!id || (loaded && !validIds.has(id))) return false;
    const current = idsRef.current;
    if (current.includes(id)) return true;
    const next = [...current, id];
    idsRef.current = next;
    setIds(next);
    captureEvent(ANALYTICS_EVENTS.WISHLIST_CHANGED, {
      action: 'added',
      product_id: id,
      item_count: next.length,
    });
    return true;
  }, [loaded, validIds]);

  const remove = useCallback((productId) => {
    const id = normalizeId(productId);
    const current = idsRef.current;
    if (!current.includes(id)) return;
    const next = current.filter((item) => item !== id);
    idsRef.current = next;
    setIds(next);
    captureEvent(ANALYTICS_EVENTS.WISHLIST_CHANGED, {
      action: 'removed',
      product_id: id,
      item_count: next.length,
    });
  }, []);

  const toggle = useCallback((productId) => {
    const id = normalizeId(productId);
    if (!id || (loaded && !validIds.has(id))) return false;
    const current = idsRef.current;
    const removing = current.includes(id);
    const next = removing
      ? current.filter((item) => item !== id)
      : [...current, id];
    idsRef.current = next;
    setIds(next);
    captureEvent(ANALYTICS_EVENTS.WISHLIST_CHANGED, {
      action: removing ? 'removed' : 'added',
      product_id: id,
      item_count: next.length,
    });
    return true;
  }, [loaded, validIds]);

  const clear = useCallback(() => {
    idsRef.current = [];
    setIds([]);
  }, []);

  const has = useCallback((productId) => ids.includes(normalizeId(productId)), [ids]);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      add,
      remove,
      toggle,
      clear,
      has,
    }),
    [ids, add, remove, toggle, clear, has],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist는 WishlistProvider 안에서만 사용 가능');
  return ctx;
}
