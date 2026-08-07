import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useProducts } from './ProductsContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { ANALYTICS_EVENTS, captureEvent } from '../lib/analytics.js';
import {
  clearAccountWishlist,
  completeLocalWishlistImport,
  fetchAccountWishlist,
  setAccountWishlistProduct,
} from '../data/wishlistApi.js';

const STORAGE_KEY = 'dabunhae:wishlist:v1';
const WishlistContext = createContext(null);

function normalizeId(id) {
  return id == null ? '' : String(id);
}

function uniqueIds(ids) {
  return [...new Set((ids ?? []).map(normalizeId).filter(Boolean))];
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? uniqueIds(parsed) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // 브라우저 저장소를 사용할 수 없어도 계정 찜은 계속 동작한다.
  }
}

export function WishlistProvider({ children }) {
  const { user, refreshProfile } = useAuth();
  const userId = user?.id ?? null;
  const [guestIds, setGuestIds] = useState(() => loadFromStorage());
  const [accountIds, setAccountIds] = useState([]);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const guestIdsRef = useRef(guestIds);
  const accountIdsRef = useRef(accountIds);
  const accountMutationQueueRef = useRef(Promise.resolve());
  const { products, loaded } = useProducts({ autoLoad: false });
  const validIds = useMemo(
    () => new Set(products.map((product) => normalizeId(product.id))),
    [products],
  );
  const ids = userId ? accountIds : guestIds;

  useEffect(() => {
    guestIdsRef.current = guestIds;
    saveToStorage(guestIds);
  }, [guestIds]);

  useEffect(() => {
    accountIdsRef.current = accountIds;
  }, [accountIds]);

  useEffect(() => {
    if (!loaded) return;
    setGuestIds((current) => current.filter((id) => validIds.has(normalizeId(id))));
  }, [loaded, validIds]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      accountIdsRef.current = [];
      setAccountIds([]);
      setAccountLoading(false);
      setAccountError(null);
      return () => { active = false; };
    }

    setAccountLoading(true);
    setAccountError(null);
    fetchAccountWishlist()
      .then((nextIds) => {
        if (!active) return;
        accountIdsRef.current = nextIds;
        setAccountIds(nextIds);
      })
      .catch((error) => {
        if (active) setAccountError(error);
      })
      .finally(() => {
        if (active) setAccountLoading(false);
      });

    return () => { active = false; };
  }, [userId]);

  const updateIds = useCallback((nextIds) => {
    if (userId) {
      accountIdsRef.current = nextIds;
      setAccountIds(nextIds);
    } else {
      guestIdsRef.current = nextIds;
      setGuestIds(nextIds);
    }
  }, [userId]);

  const enqueueAccountMutation = useCallback((mutation) => {
    accountMutationQueueRef.current = accountMutationQueueRef.current
      .then(mutation)
      .catch(async (error) => {
        setAccountError(error);
        try {
          const latestIds = await fetchAccountWishlist();
          accountIdsRef.current = latestIds;
          setAccountIds(latestIds);
        } catch {
          // 최초 오류를 유지한다. 다음 화면 진입 때 서버 상태를 다시 조회한다.
        }
      });
  }, []);

  const persistAccountChange = useCallback((id, wished) => {
    enqueueAccountMutation(() => setAccountWishlistProduct(id, wished));
  }, [enqueueAccountMutation]);

  const add = useCallback((productId) => {
    const id = normalizeId(productId);
    if (!id || (loaded && !validIds.has(id))) return false;
    const current = userId ? accountIdsRef.current : guestIdsRef.current;
    if (current.includes(id)) return true;
    const next = [...current, id];
    updateIds(next);
    if (userId) persistAccountChange(id, true);
    captureEvent(ANALYTICS_EVENTS.WISHLIST_CHANGED, {
      action: 'added',
      product_id: id,
      item_count: next.length,
    });
    return true;
  }, [loaded, validIds, userId, updateIds, persistAccountChange]);

  const remove = useCallback((productId) => {
    const id = normalizeId(productId);
    const current = userId ? accountIdsRef.current : guestIdsRef.current;
    if (!current.includes(id)) return;
    const next = current.filter((item) => item !== id);
    updateIds(next);
    if (userId) persistAccountChange(id, false);
    captureEvent(ANALYTICS_EVENTS.WISHLIST_CHANGED, {
      action: 'removed',
      product_id: id,
      item_count: next.length,
    });
  }, [userId, updateIds, persistAccountChange]);

  const toggle = useCallback((productId) => {
    const id = normalizeId(productId);
    if (!id || (loaded && !validIds.has(id))) return false;
    const current = userId ? accountIdsRef.current : guestIdsRef.current;
    const removing = current.includes(id);
    const next = removing
      ? current.filter((item) => item !== id)
      : [...current, id];
    updateIds(next);
    if (userId) persistAccountChange(id, !removing);
    captureEvent(ANALYTICS_EVENTS.WISHLIST_CHANGED, {
      action: removing ? 'removed' : 'added',
      product_id: id,
      item_count: next.length,
    });
    return true;
  }, [loaded, validIds, userId, updateIds, persistAccountChange]);

  const clear = useCallback(() => {
    updateIds([]);
    if (userId) {
      enqueueAccountMutation(() => clearAccountWishlist(userId));
    }
  }, [userId, updateIds, enqueueAccountMutation]);

  const completeGuestImport = useCallback(async ({ importItems }) => {
    if (!userId) throw new Error('로그인이 필요합니다.');
    const localIds = guestIdsRef.current;
    const nextAccountIds = await completeLocalWishlistImport(importItems ? localIds : []);
    accountIdsRef.current = nextAccountIds;
    setAccountIds(nextAccountIds);
    setAccountError(null);
    if (importItems) {
      guestIdsRef.current = [];
      setGuestIds([]);
    }
    await refreshProfile();
    return nextAccountIds;
  }, [userId, refreshProfile]);

  const has = useCallback((productId) => ids.includes(normalizeId(productId)), [ids]);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      loading: Boolean(userId) && accountLoading,
      error: accountError,
      guestIds,
      add,
      remove,
      toggle,
      clear,
      has,
      completeGuestImport,
    }),
    [
      ids,
      userId,
      accountLoading,
      accountError,
      guestIds,
      add,
      remove,
      toggle,
      clear,
      has,
      completeGuestImport,
    ],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist는 WishlistProvider 안에서만 사용 가능');
  return ctx;
}
