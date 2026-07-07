import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useProducts } from './ProductsContext.jsx';

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
  const { products, loading } = useProducts();
  const validIds = useMemo(
    () => new Set(products.map((p) => normalizeId(p.id))),
    [products],
  );

  useEffect(() => {
    saveToStorage(ids);
  }, [ids]);

  useEffect(() => {
    if (loading) return;
    setIds((prev) => prev.filter((id) => validIds.has(normalizeId(id))));
  }, [loading, validIds]);

  const add = useCallback((productId) => {
    const id = normalizeId(productId);
    if (!id || !validIds.has(id)) return false;
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return true;
  }, [validIds]);

  const remove = useCallback((productId) => {
    const id = normalizeId(productId);
    setIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const toggle = useCallback((productId) => {
    const id = normalizeId(productId);
    if (!id || !validIds.has(id)) return false;
    setIds((prev) => (prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id]));
    return true;
  }, [validIds]);

  const clear = useCallback(() => {
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
