// 제품 데이터 컨텍스트
// - 전체 카탈로그는 실제로 필요한 화면에서만 지연 조회
// - 상세/카테고리 보조 데이터는 전용 훅으로 별도 조회

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProductById as apiFetchProductById,
  fetchProducts as apiFetchProducts,
  fetchProductsByCategory as apiFetchProductsByCategory,
  searchProductsRemote as apiSearchProductsRemote,
} from '../data/productApi.js';

const Ctx = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const load = useCallback(({ force = false } = {}) => {
    setStatus('loading');
    setError(null);
    return apiFetchProducts({ force })
      .then(setProducts)
      .then((nextProducts) => {
        setStatus('success');
        return nextProducts;
      })
      .catch((nextError) => {
        setError(nextError);
        setStatus('error');
        throw nextError;
      });
  }, []);

  const reload = useCallback(() => load({ force: true }), [load]);

  return (
    <Ctx.Provider value={{ products, status, error, load, reload }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProducts({ autoLoad = true } = {}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProducts는 ProductsProvider 안에서만 사용 가능');

  useEffect(() => {
    if (autoLoad && ctx.status === 'idle') {
      ctx.load().catch(() => {});
    }
  }, [autoLoad, ctx.status, ctx.load]);

  return {
    products: ctx.products,
    loading: ctx.status === 'loading' || (autoLoad && ctx.status === 'idle'),
    loaded: ctx.status === 'success',
    error: ctx.error,
    reload: ctx.reload,
  };
}

export function useProductSearch(query) {
  const normalized = String(query ?? '').trim();
  const [state, setState] = useState({ query: '', products: [], loading: false, error: null });

  useEffect(() => {
    let active = true;
    if (!normalized) {
      setState({ query: '', products: [], loading: false, error: null });
      return () => { active = false; };
    }

    setState({ query: normalized, products: [], loading: true, error: null });
    apiSearchProductsRemote(normalized)
      .then((products) => {
        if (active) setState({ query: normalized, products, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ query: normalized, products: [], loading: false, error });
      });

    return () => { active = false; };
  }, [normalized]);

  return state;
}

export function useProductById(id) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProductById는 ProductsProvider 안에서만 사용 가능');
  // URL param은 string, Supabase id는 number일 수 있으므로 == 비교
  return ctx.products.find(p => String(p.id) === String(id)) ?? null;
}

export function useProductDetail(id) {
  const key = String(id ?? '');
  const [state, setState] = useState({ key: '', product: null, loading: false, error: null });

  useEffect(() => {
    let active = true;
    if (!key) {
      setState({ key: '', product: null, loading: false, error: null });
      return () => { active = false; };
    }

    setState({ key, product: null, loading: true, error: null });
    apiFetchProductById(id)
      .then((product) => {
        if (active) setState({ key, product, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ key, product: null, loading: false, error });
      });

    return () => { active = false; };
  }, [id, key]);

  const isCurrent = state.key === key;
  return {
    product: isCurrent ? state.product : null,
    loading: Boolean(key) && (!isCurrent || state.loading),
    error: isCurrent ? state.error : null,
  };
}

export function useCategoryProducts(categoryCode) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCategoryProducts는 ProductsProvider 안에서만 사용 가능');
  const key = String(categoryCode ?? '');
  const [state, setState] = useState({ key: '', products: [], loading: false, error: null });

  useEffect(() => {
    let active = true;
    if (!key) {
      setState({ key: '', products: [], loading: false, error: null });
      return () => { active = false; };
    }

    // 목록에서 상세로 이동했다면 이미 받은 전체 카탈로그를 재사용한다.
    if (ctx.status === 'success') {
      return () => { active = false; };
    }

    setState({ key, products: [], loading: true, error: null });
    apiFetchProductsByCategory(categoryCode)
      .then((products) => {
        if (active) setState({ key, products, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ key, products: [], loading: false, error });
      });

    return () => { active = false; };
  }, [categoryCode, key, ctx.status]);

  const catalogProducts = ctx.status === 'success'
    ? ctx.products.filter((product) => product.categoryCode === categoryCode)
    : null;
  const isCurrent = state.key === key;
  return {
    products: catalogProducts ?? (isCurrent ? state.products : []),
    loading: catalogProducts === null && Boolean(key) && (!isCurrent || state.loading),
    error: catalogProducts === null && isCurrent ? state.error : null,
  };
}
