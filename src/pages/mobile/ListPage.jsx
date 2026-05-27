import { useMemo, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { TopTabs } from '../../components/ds/TopTabs.jsx';
import { FoodCard } from '../../components/ds/FoodCard.jsx';
import { SubCategoryChips } from '../../components/mobile/list/SubCategoryChips.jsx';
import { ActionBar } from '../../components/mobile/list/ActionBar.jsx';
import { FilterSheet, countActiveFilters } from '../../components/mobile/list/FilterSheet.jsx';
import { SortSheet, getSortShortLabel } from '../../components/mobile/list/SortSheet.jsx';
import { SearchSheet } from '../../components/mobile/list/SearchSheet.jsx';
import { EmptyState } from '../../components/mobile/list/EmptyState.jsx';
import { Skeleton } from '../../components/ds/Skeleton.jsx';
import { useProducts } from '../../store/ProductsContext.jsx';
import { searchProducts } from '../../data/searchIndex.js';
import { getAdapted } from '../../data/adapters.js';
import { ALL_FILTERS } from '../../data/purposes.jsx';
import { CATEGORY_TABS, getTabCategories } from '../../data/categoryTabs.js';
import { useCompare } from '../../store/CompareContext.jsx';
import './ListPage.css';

const TAB_LABELS = CATEGORY_TABS.map((t) => t.label);
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

function applySort(products, sortKey) {
  const arr = [...products];
  switch (sortKey) {
    case 'ranking':
      return arr.sort((a, b) => b.rankingScore - a.rankingScore);
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    case 'calories_asc':
      return arr.sort((a, b) => (a.nutrition.calories ?? 0) - (b.nutrition.calories ?? 0));
    case 'protein_desc':
      return arr.sort((a, b) => (b.nutrition.protein ?? 0) - (a.nutrition.protein ?? 0));
    default:
      return arr;
  }
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
  const { count: compareCount, toggle: toggleCompare } = useCompare();
  const { products: PRODUCTS, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const tabParam = searchParams.get('tab') ?? '';
  const subParam = searchParams.get('sub') ?? '';

  const initTab = useMemo(() => {
    if (!tabParam) return 0;
    const idx = CATEGORY_TABS.findIndex((t) => t.id === tabParam);
    return idx >= 0 ? idx : 0;
  }, [tabParam]);

  const initSub = useMemo(() => {
    if (!subParam) return 'all';
    return subParam;
  }, [subParam]);

  const [activeTab, setActiveTab] = useState(initTab);
  const [activeSub, setActiveSub] = useState(initSub);
  const [filterState, setFilterState] = useState({});
  const [sortKey, setSortKey] = useState('ranking');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const tab = CATEGORY_TABS[activeTab];
  const tabCategories = useMemo(() => getTabCategories(tab.id), [tab.id]);
  const subLabels = tab.subs.map((s) => s.label);

  // activeSub이 라벨이면 해당 DB 카테고리 찾기
  const activeCategory = useMemo(() => {
    if (activeSub === 'all') return null;
    const found = tab.subs.find((s) => s.label === activeSub);
    return found?.category ?? null;
  }, [activeSub, tab]);

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

  const handleTabSelect = useCallback((i) => {
    setActiveTab(i);
    setActiveSub('all');
    setFilterState({});
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleSubSelect = useCallback((label) => {
    setActiveSub(label === 'all' ? 'all' : label);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleSearchSubmit = (next) => {
    const trimmed = (next ?? '').trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
    setVisibleCount(PAGE_SIZE);
  };

  const clearSearch = () => { setSearchParams({}); setVisibleCount(PAGE_SIZE); };

  const resetFilters = () => {
    setFilterState({});
    setActiveSub('all');
    setVisibleCount(PAGE_SIZE);
  };

  const goCompare = () => navigate('/compare');

  const products = useMemo(() => {
    let result = q ? searchProducts(q, PRODUCTS) : [...PRODUCTS];
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    } else {
      result = result.filter((p) => tabCategories.includes(p.category));
    }
    result = applyFilters(result, ALL_FILTERS, filterState);
    result = applySort(result, sortKey);
    return result;
  }, [q, PRODUCTS, tabCategories, activeCategory, filterState, sortKey]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );
  const hasMore = visibleCount < products.length;

  return (
    <div className="m-list-root">
      <AppBar
        onSearch={() => setSearchOpen(true)}
        onCompare={goCompare}
        compareCount={compareCount}
      />

      <div className="m-list-sticky-header">
        <TopTabs
          tabs={TAB_LABELS}
          active={activeTab}
          onSelect={handleTabSelect}
        />
        <SubCategoryChips
          categories={subLabels}
          value={activeSub}
          onChange={handleSubSelect}
        />
        <ActionBar
          count={products.length}
          query={q}
          onClearQuery={clearSearch}
          sortLabel={getSortShortLabel(sortKey)}
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
          {visibleProducts.map((p) => (
            <FoodCard
              key={p.id}
              food={getAdapted(p)}
              layout="list"
              tabId={tab.id}
              subLabel={activeSub !== 'all' ? activeSub : undefined}
              onClick={() => navigate(`/product/${p.id}`)}
              onCompare={(food) => toggleCompare(food.id)}
            />
          ))}
          {hasMore && (
            <button
              type="button"
              className="m-list-load-more"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              더 보기 ({products.length - visibleCount}개 남음)
            </button>
          )}
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
