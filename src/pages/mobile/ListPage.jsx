import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { FoodCard } from '../../components/ds/FoodCard.jsx';
import { SubCategoryChips } from '../../components/mobile/list/SubCategoryChips.jsx';
import { ActionBar } from '../../components/mobile/list/ActionBar.jsx';
import { FilterSheet, countActiveFilters } from '../../components/mobile/list/FilterSheet.jsx';
import { SortSheet, getSortShortLabel } from '../../components/mobile/list/SortSheet.jsx';
import { ProteinSortLabel } from '../../components/list/ProteinSortLabel.jsx';
import { SearchSheet } from '../../components/mobile/list/SearchSheet.jsx';
import { EmptyState } from '../../components/mobile/list/EmptyState.jsx';
import { Skeleton } from '../../components/ds/Skeleton.jsx';
import { Pagination } from '../../components/ds/Pagination.jsx';
import { useProducts } from '../../store/ProductsContext.jsx';
import { searchProducts } from '../../data/searchIndex.js';
import { getAdapted } from '../../data/adapters.js';
import { applySort } from '../../data/listSort.js';
import { loadListViewState, saveListViewState } from '../../data/listViewState.js';
import { ALL_FILTERS } from '../../data/purposes.jsx';
import { ACTIVE_FOOD_TYPES, getFoodTypeByLabel, getFoodTypeByCode } from '../../data/categoryTabs.js';
import { useCompare } from '../../store/CompareContext.jsx';
import './ListPage.css';

const PAGE_SIZE = 20;

function getIngredientList(product, key) {
  if (key === 'sweeteners') return product.ingredients?.sweeteners ?? [];
  if (key === 'proteinSources') return product.ingredients?.proteinSources ?? [];
  if (key === 'allergens') return product.ingredients?.allergens ?? [];
  return [];
}

function passSingleFilter(product, spec, v) {
  if (spec.type === 'range') {
    const target = product.nutrition?.[spec.key];
    if (target === undefined) return true;
    if (v.min !== undefined && target < v.min) return false;
    if (v.max !== undefined && target > v.max) return false;
    return true;
  }
  if (spec.type === 'tristate') {
    if (!v || Object.keys(v).length === 0) return true;
    const items = getIngredientList(product, spec.key);
    for (const [opt, state] of Object.entries(v)) {
      if (state === 'include' && !items.includes(opt)) return false;
      if (state === 'exclude' && items.includes(opt)) return false;
    }
    return true;
  }
  if (spec.type === 'bool') {
    if (!v) return true;
    if (spec.key === 'lactoseFree') return product.ingredients?.lactoseFree === true;
    return true;
  }
  return true;
}

function applyFilters(products, specs, value) {
  if (!specs || specs.length === 0) return products;
  return products.filter((p) => {
    for (const spec of specs) {
      const v = value[spec.key];
      if (v === undefined || v === null) continue;
      if (!passSingleFilter(p, spec, v)) return false;
    }
    return true;
  });
}

function ListSkeleton() {
  return (
    <div className="m-list-cards">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="m-list-skeleton-card">
          <Skeleton width={88} height={88} radius={4} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width="30%" height={11} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="60%" height={11} />
            <Skeleton width="100%" height={6} radius={3} />
            <div style={{ display: 'flex', gap: 4 }}>
              <Skeleton width={48} height={18} radius={10} />
              <Skeleton width={40} height={18} radius={10} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ListPageMobile() {
  const { count: compareCount, toggle: toggleCompare, has: hasCompare } = useCompare();
  const { products: PRODUCTS, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const subParam = searchParams.get('sub') ?? '';

  // 세션 보존 상태 복원 — URL의 sub 파라미터가 있으면 그것을 우선
  const [activeSub, setActiveSub] = useState(() => subParam || loadListViewState().activeSub || 'all');
  const [filterState, setFilterState] = useState(() => loadListViewState().filterState || {});
  const [sortKey, setSortKey] = useState(() => loadListViewState().sortKey || 'default');
  const [page, setPage] = useState(() => loadListViewState().page || 1);

  // 카테고리·필터·정렬·페이지 변경 시 세션에 저장 → 상세/비교함 다녀와도 유지
  useEffect(() => {
    saveListViewState({ activeSub, filterState, sortKey, page });
  }, [activeSub, filterState, sortKey, page]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // activeSub이 라벨이면 해당 식품유형 코드(food_type_category_code) 찾기
  const activeCode = useMemo(() => {
    if (activeSub === 'all') return null;
    return getFoodTypeByLabel(activeSub)?.code ?? null;
  }, [activeSub]);

  const filterActiveCount = useMemo(() => {
    let n = 0;
    for (const [, v] of Object.entries(filterState)) {
      if (v === undefined || v === null) continue;
      if (typeof v === 'boolean') { if (v) n += 1; }
      else if (typeof v === 'object') {
        if (Object.keys(v).filter((k) => v[k] !== undefined && v[k] !== null && v[k] !== '').length > 0) n += 1;
      }
    }
    return n;
  }, [filterState]);
  const hasActiveCondition = filterActiveCount > 0 || activeSub !== 'all';

  const handleSubSelect = useCallback((label) => {
    setActiveSub(label === 'all' ? 'all' : label);
  }, []);

  const handleSearchSubmit = (next) => {
    const trimmed = (next ?? '').trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  const clearSearch = () => { setSearchParams({}); };

  const resetFilters = () => {
    setFilterState({});
    setActiveSub('all');
  };

  const goCompare = () => navigate('/compare');

  const products = useMemo(() => {
    let result = q ? searchProducts(q, PRODUCTS) : [...PRODUCTS];
    // 식품유형 칩 선택 시: 식품유형 코드 정확 매칭 / '전체'면 전 제품
    if (activeCode) {
      result = result.filter((p) => p.categoryCode === activeCode);
    }
    result = applyFilters(result, ALL_FILTERS, filterState);
    // 정렬 기준은 카테고리(서브 라벨)별로 달라짐 — 단백질 음료는 단백질/EAA/BCAA 전용
    result = applySort(result, activeSub, sortKey);
    return result;
  }, [q, PRODUCTS, activeCode, activeSub, filterState, sortKey]);

  // 검색·필터·정렬·카테고리 변경 시 1페이지로 초기화
  // (단, 첫 렌더에서는 복원된 페이지를 유지 — 상세에서 뒤로 왔을 때 초기화 방지)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [q, activeCode, filterState, sortKey]);

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pageProducts = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [products, page],
  );

  // 페이지 이동 — 리스트 상단으로 스크롤
  const goPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="m-list-root">
      <AppBar
        onSearch={() => setSearchOpen(true)}
        onCompare={goCompare}
        compareCount={compareCount}
        onLogo={() => navigate('/')}
      />

      <div className="m-list-sticky-header">
        <SubCategoryChips
          categories={ACTIVE_FOOD_TYPES}
          value={activeSub}
          onChange={handleSubSelect}
        />
        <ActionBar
          count={products.length}
          query={q}
          onClearQuery={clearSearch}
          sortLabel={<ProteinSortLabel sortKey={sortKey} fallback={getSortShortLabel(activeSub, sortKey)} />}
          onOpenSort={() => setSortOpen(true)}
          filterActiveCount={filterActiveCount}
          onOpenFilter={() => setFilterOpen(true)}
        />
      </div>

      {loading ? (
        <ListSkeleton />
      ) : products.length === 0 ? (
        <div className="m-list-empty-wrap">
          <EmptyState
            query={q}
            hasActiveFilters={hasActiveCondition}
            onResetFilters={resetFilters}
            onClearSearch={clearSearch}
          />
        </div>
      ) : (
        <div className="m-list-cards">
          {pageProducts.map((p) => {
            // 카드 메트릭은 제품의 식품유형(목적 탭 + 라벨) 기준
            const ft = getFoodTypeByCode(p.categoryCode);
            return (
              <FoodCard
                key={p.id}
                food={getAdapted(p)}
                layout="list"
                tabId={ft?.tab}
                subLabel={ft?.label}
                sortKey={sortKey}
                inCompare={hasCompare(p.id)}
                onClick={() => navigate(`/product/${p.id}`)}
                onCompare={(food) => toggleCompare(food.id)}
              />
            );
          })}
          <Pagination page={page} pageCount={pageCount} onChange={goPage} />
        </div>
      )}

      <SearchSheet
        open={searchOpen}
        initialQuery={q}
        onClose={() => setSearchOpen(false)}
        onSubmit={handleSearchSubmit}
      />
      <SortSheet
        open={sortOpen}
        value={sortKey}
        category={activeSub}
        onChange={setSortKey}
        onClose={() => setSortOpen(false)}
      />
      <FilterSheet
        open={filterOpen}
        specs={ALL_FILTERS}
        value={filterState}
        onApply={setFilterState}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
