// 전역 제품 데이터 컨텍스트
// - 앱 로딩 시 Supabase에서 전체 제품을 1회 fetch
// - 하위 컴포넌트는 useProducts() / useProductById()로 동기적 접근

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchProducts as apiFetchProducts } from '../data/productApi.js';

const Ctx = createContext({ products: [], loading: true, error: null });

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetchProducts()
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <Ctx.Provider value={{ products, loading, error, reload: load }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProducts() {
  return useContext(Ctx);
}

export function useProductById(id) {
  const { products } = useContext(Ctx);
  // URL param은 string, Supabase id는 number일 수 있으므로 == 비교
  return products.find(p => String(p.id) === String(id)) ?? null;
}
