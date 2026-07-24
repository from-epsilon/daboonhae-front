// 제품 데이터 컨텍스트
// - 전체 카탈로그는 실제로 필요한 화면에서만 지연 조회
// - 상세/카테고리 보조 데이터는 전용 훅으로 별도 조회

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchHomeProducts as apiFetchHomeProducts,
  fetchProductById as apiFetchProductById,
  fetchProducts as apiFetchProducts,
  fetchProductsByCategory as apiFetchProductsByCategory,
  fetchProductsByIds as apiFetchProductsByIds,
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

export function useHomeProducts() {
  const [state, setState] = useState({
    recommendations: { protein: [], meal: [] },
    recent: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    apiFetchHomeProducts()
      .then((result) => {
        if (active) {
          setState({ ...result, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            recommendations: { protein: [], meal: [] },
            recent: [],
            loading: false,
            error,
          });
        }
      });

    return () => { active = false; };
  }, []);

  return state;
}

export function useProductsByIds(ids) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProductsByIds는 ProductsProvider 안에서만 사용 가능');

  const orderedKey = (ids ?? [])
    .map((id) => String(id ?? '').trim())
    .filter(Boolean)
    .join(',');
  const requestKey = useMemo(
    () => [...new Set(orderedKey.split(',').filter(Boolean))].sort().join(','),
    [orderedKey],
  );
  const [state, setState] = useState({
    key: '',
    products: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    if (!requestKey || ctx.status === 'success') {
      return () => { active = false; };
    }

    const requestIds = requestKey.split(',');
    setState({ key: requestKey, products: [], loading: true, error: null });
    apiFetchProductsByIds(requestIds)
      .then((products) => {
        if (active) {
          setState({ key: requestKey, products, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ key: requestKey, products: [], loading: false, error });
        }
      });

    return () => { active = false; };
  }, [requestKey, ctx.status]);

  const sourceProducts = ctx.status === 'success'
    ? ctx.products
    : (state.key === requestKey ? state.products : []);
  const byId = new Map(sourceProducts.map((product) => [String(product.id), product]));
  const products = orderedKey
    ? orderedKey.split(',').map((id) => byId.get(id)).filter(Boolean)
    : [];

  return {
    products,
    loading: Boolean(requestKey)
      && ctx.status !== 'success'
      && (state.key !== requestKey || state.loading),
    error: state.key === requestKey ? state.error : null,
  };
}

export function useProductSearch(query, { categoryCode = null } = {}) {
  const normalized = String(query ?? '').trim();
  const categoryKey = String(categoryCode ?? '');
  const [state, setState] = useState({ query: '', products: [], loading: false, error: null });

  useEffect(() => {
    let active = true;
    if (!normalized) {
      setState({ query: '', products: [], loading: false, error: null });
      return () => { active = false; };
    }

    setState({ query: normalized, products: [], loading: true, error: null });
    apiSearchProductsRemote(normalized, {
      categoryCode: categoryKey || null,
    })
      .then((products) => {
        if (active) setState({ query: normalized, products, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ query: normalized, products: [], loading: false, error });
      });

    return () => { active = false; };
  }, [normalized, categoryKey]);

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

export function useListProducts(categoryCode) {
  const key = String(categoryCode ?? '');
  const catalog = useProducts({ autoLoad: !key });
  const category = useCategoryProducts(key);
  return key ? category : catalog;
}
