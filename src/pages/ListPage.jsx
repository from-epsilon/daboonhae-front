import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompare } from '../store/CompareContext.jsx';
import { useProducts } from '../store/ProductsContext.jsx';
import { searchProducts } from '../data/searchIndex.js';
import { ALL_FILTERS } from '../data/purposes.jsx';
import { applySort } from '../data/listSort.js';
import { loadListViewState, saveListViewState } from '../data/listViewState.js';
import { ACTIVE_FOOD_TYPES, getFoodTypeByLabel } from '../data/categoryTabs.js';
import { FoodCardWideSkeleton } from '../components/ds/Skeleton.jsx';
import SidebarFilter from '../components/desktop/list/SidebarFilter.jsx';
import ResultHeader from '../components/desktop/list/ResultHeader.jsx';
import ResultGrid from '../components/desktop/list/ResultGrid.jsx';
import EmptyResult from '../components/desktop/list/EmptyResult.jsx';
import ActiveFilterChips from '../components/desktop/list/ActiveFilterChips.jsx';
import { Pagination } from '../components/ds/Pagination.jsx';
import './ListPage.css';

const PAGE_SIZE = 20;

export default function ListPage() {
  const compare = useCompare();
  const { products: PRODUCTS, loading } = useProducts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const subParam = searchParams.get('sub') ?? '';

  // 세션 보존 상태 복원 — URL의 sub 파라미터가 있으면 그것을 우선
  const [activeSub, setActiveSub] = useState(() => subParam || loadListViewState().activeSub || 'all');
  const [filterState, setFilterState] = useState(() => loadListViewState().filterState || {});
  const [page, setPage] = useState(() => loadListViewState().page || 1);

  const [sortKey, setSortKey] = useState(() => loadListViewState().sortKey || 'default');

  // 카테고리·필터·정렬·페이지 변경 시 세션에 저장 → 상세/비교함 다녀와도 유지
  useEffect(() => {
    saveListViewState({ activeSub, filterState, sortKey, page });
  }, [activeSub, filterState, sortKey, page]);

  // 식품유형 칩 라벨 → 식품유형 코드(food_type_category_code)
  const activeCode = useMemo(() => {
    if (activeSub === 'all') return null;
    return getFoodTypeByLabel(activeSub)?.code ?? null;
  }, [activeSub]);

  const activeFilterCount = countActiveFilters(filterState);
  const canResetSomething = activeFilterCount > 0 || activeSub !== 'all';

  const resetFilters = () => {
    setFilterState({});
    setActiveSub('all');
  };

  const clearSearch = () => navigate('/list');

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

  if (loading) {
    return (
      <div className="d-list-page">
        <div className="d-list-page-inner">
          <div className="d-list-sub-chips">
            <button type="button" className="d-list-sub-chip is-active">전체</button>
            {ACTIVE_FOOD_TYPES.map((ft) => (
              <button key={ft.label} type="button" className="d-list-sub-chip">
                {ft.label}
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
        {/* 식품유형 칩 — 목적 탭 없이 전 식품유형을 한 줄로, 준비중은 비활성 */}
        <div className="d-list-sub-chips">
          <button
            type="button"
            className={`d-list-sub-chip${activeSub === 'all' ? ' is-active' : ''}`}
            onClick={() => setActiveSub('all')}
          >
            전체
          </button>
          {ACTIVE_FOOD_TYPES.map((ft) => (
            <button
              key={ft.label}
              type="button"
              className={`d-list-sub-chip${activeSub === ft.label ? ' is-active' : ''}`}
              onClick={() => setActiveSub(ft.label)}
            >
              {ft.label}
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
              category={activeSub !== 'all' ? activeSub : '전체'}
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
                  products={pageProducts}
                  onCardClick={(id) => navigate(`/product/${id}`)}
                  onCompare={(id) => compare.toggle(id)}
                  sortKey={sortKey}
                />
                <Pagination page={page} pageCount={pageCount} onChange={goPage} />
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
