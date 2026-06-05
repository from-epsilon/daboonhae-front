import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompare } from '../store/CompareContext.jsx';
import { useProducts } from '../store/ProductsContext.jsx';
import { searchProducts } from '../data/searchIndex.js';
import { ALL_FILTERS } from '../data/purposes.jsx';
import { CATEGORY_TABS, productMatchesTab } from '../data/categoryTabs.js';
import { FoodCardWideSkeleton } from '../components/ds/Skeleton.jsx';
import SidebarFilter from '../components/desktop/list/SidebarFilter.jsx';
import ResultHeader from '../components/desktop/list/ResultHeader.jsx';
import ResultGrid from '../components/desktop/list/ResultGrid.jsx';
import EmptyResult from '../components/desktop/list/EmptyResult.jsx';
import ActiveFilterChips from '../components/desktop/list/ActiveFilterChips.jsx';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';
import './ListPage.css';

const PAGE_SIZE = 20;

export default function ListPage() {
  const compare = useCompare();
  const { products: PRODUCTS, loading } = useProducts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const tabParam = searchParams.get('tab') ?? '';
  const subParam = searchParams.get('sub') ?? '';

  const initTab = useMemo(() => {
    if (!tabParam) return 0;
    const idx = CATEGORY_TABS.findIndex((t) => t.id === tabParam);
    return idx >= 0 ? idx : 0;
  }, [tabParam]);

  const [activeTab, setActiveTab] = useState(initTab);
  const [activeSub, setActiveSub] = useState(subParam || 'all');
  const [filterState, setFilterState] = useState({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [sortKey, setSortKey] = useState('default');

  const tab = CATEGORY_TABS[activeTab];

  // 서브칩 라벨 → 식품유형 코드(food_type_category_code)
  const activeCode = useMemo(() => {
    if (activeSub === 'all') return null;
    const found = tab.subs.find((s) => s.label === activeSub);
    return found?.code ?? null;
  }, [activeSub, tab]);

  const activeFilterCount = countActiveFilters(filterState);
  const canResetSomething = activeFilterCount > 0 || activeSub !== 'all';

  const resetFilters = () => {
    setFilterState({});
    setActiveSub('all');
    setVisibleCount(PAGE_SIZE);
  };

  const clearSearch = () => navigate('/list');

  const products = useMemo(() => {
    let result = q ? searchProducts(q, PRODUCTS) : [...PRODUCTS];
    if (activeCode) {
      result = result.filter((p) => p.categoryCode === activeCode);
    } else {
      result = result.filter((p) => productMatchesTab(p, tab.id));
    }
    result = applyFilters(result, ALL_FILTERS, filterState);
    result = applySort(result, sortKey);
    return result;
  }, [q, PRODUCTS, tab.id, activeCode, filterState, sortKey]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );
  const hasMore = visibleCount < products.length;

  // 무한 스크롤 — 리스트 하단 센티널 노출 시 다음 페이지 로드
  const sentinelRef = useInfiniteScroll({
    hasMore,
    onLoadMore: () => setVisibleCount((c) => c + PAGE_SIZE),
  });

  if (loading) {
    return (
      <div className="d-list-page">
        <div className="d-list-page-inner">
          <div className="d-list-category-chips">
            {CATEGORY_TABS.map((t, i) => (
              <button key={t.id} type="button" className={`d-list-category-chip${i === 0 ? ' is-active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="d-list-body">
            <div />
            <section className="d-list-main">
              {Array.from({ length: 5 }).map((_, i) => (
                <FoodCardWideSkeleton key={i} />
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-list-page">
      <div className="d-list-page-inner">
        {/* 상위 3탭 */}
        <div className="d-list-category-chips">
          {CATEGORY_TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`d-list-category-chip${i === activeTab ? ' is-active' : ''}`}
              onClick={() => { setActiveTab(i); setActiveSub('all'); setVisibleCount(PAGE_SIZE); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 하위 서브카테고리 칩 */}
        <div className="d-list-sub-chips">
          <button
            type="button"
            className={`d-list-sub-chip${activeSub === 'all' ? ' is-active' : ''}`}
            onClick={() => { setActiveSub('all'); setVisibleCount(PAGE_SIZE); }}
          >
            전체
          </button>
          {tab.subs.map((s) => (
            <button
              key={s.label}
              type="button"
              className={`d-list-sub-chip${activeSub === s.label ? ' is-active' : ''}`}
              onClick={() => { setActiveSub(s.label); setVisibleCount(PAGE_SIZE); }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="d-list-body">
          <SidebarFilter
            specs={ALL_FILTERS}
            value={filterState}
            onChange={setFilterState}
            onReset={resetFilters}
            activeCount={activeFilterCount}
          />

          <section className="d-list-main">
            <ResultHeader
              query={q}
              count={products.length}
              sortKey={sortKey}
              onSortChange={setSortKey}
              onClearQuery={clearSearch}
              category={activeSub !== 'all' ? activeSub : tab.label}
            />

            <ActiveFilterChips
              specs={ALL_FILTERS}
              value={filterState}
              onChange={setFilterState}
            />

            {products.length === 0 ? (
              <EmptyResult
                query={q}
                canResetFilters={canResetSomething}
                onResetFilters={resetFilters}
                onClearQuery={clearSearch}
              />
            ) : (
              <>
                <ResultGrid
                  products={visibleProducts}
                  onCardClick={(id) => navigate(`/product/${id}`)}
                  onCompare={(id) => compare.toggle(id)}
                  sortKey={sortKey}
                />
                {hasMore && (
                  <div ref={sentinelRef} className="d-list-sentinel" aria-hidden="true" />
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function countActiveFilters(value) {
  let n = 0;
  for (const [, v] of Object.entries(value)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'boolean') { if (v) n += 1; }
    else if (typeof v === 'object') {
      const keys = Object.keys(v).filter((k) => v[k] !== undefined && v[k] !== null && v[k] !== '');
      if (keys.length > 0) n += 1;
    }
  }
  return n;
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

function passSingleFilter(product, spec, v) {
  if (spec.type === 'range') return passRange(product, spec, v);
  if (spec.type === 'tristate') return passTriState(product, spec.key, v);
  if (spec.type === 'exclude_only') return passTriState(product, spec.key, v);
  if (spec.type === 'bool') return passBool(product, spec, v);
  return true;
}

function passRange(product, spec, v) {
  const target = product.nutrition?.[spec.key];
  if (target === undefined) return true;
  if (v.min !== undefined && target < v.min) return false;
  if (v.max !== undefined && target > v.max) return false;
  return true;
}

function passTriState(product, key, value) {
  if (!value || Object.keys(value).length === 0) return true;
  const items = getIngredientList(product, key);
  for (const [option, state] of Object.entries(value)) {
    if (state === 'include' && !items.includes(option)) return false;
    if (state === 'exclude' && items.includes(option)) return false;
  }
  return true;
}

function passBool(product, spec, v) {
  if (!v) return true;
  if (spec.key === 'lactoseFree') return product.ingredients?.lactoseFree === true;
  return true;
}

function getIngredientList(product, key) {
  if (key === 'sweeteners') return product.ingredients?.sweeteners ?? [];
  if (key === 'proteinSources') return product.ingredients?.proteinSources ?? [];
  if (key === 'allergens') return product.ingredients?.allergens ?? [];
  return [];
}

function applySort(products, sortKey) {
  const arr = [...products];
  switch (sortKey) {
    case 'calories_asc': return arr.sort((a, b) => (a.nutrition.calories ?? 0) - (b.nutrition.calories ?? 0));
    case 'protein_desc': return arr.sort((a, b) => (b.nutrition.protein ?? 0) - (a.nutrition.protein ?? 0));
    case 'carbs_asc': return arr.sort((a, b) => (a.nutrition.carbs ?? 0) - (b.nutrition.carbs ?? 0));
    case 'sugar_asc': return arr.sort((a, b) => (a.nutrition.sugar ?? 0) - (b.nutrition.sugar ?? 0));
    default: return arr;
  }
}
