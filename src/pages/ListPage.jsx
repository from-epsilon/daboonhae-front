import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompare } from '../store/CompareContext.jsx';
import { useProducts } from '../store/ProductsContext.jsx';
import { searchProducts } from '../data/searchIndex.js';
import { applySort } from '../data/listSort.js';
import {
  applyListFilters,
  countActiveFilters,
  formatProteinSourceLabel,
  formatSweetenerLabel,
  getListFilterSpecs,
  getProteinSourceTexts,
  getSweetenerTexts,
} from '../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../data/proteinQuality.js';
import {
  getListPageFromSearchParams,
  loadListViewState,
  saveListViewState,
  setListPageSearchParam,
} from '../data/listViewState.js';
import { ACTIVE_FOOD_TYPES, getFoodTypeByLabel, getVisibleFoodTypes } from '../data/categoryTabs.js';
import { FoodCardWideSkeleton } from '../components/ds/Skeleton.jsx';
import SidebarFilter from '../components/desktop/list/SidebarFilter.jsx';
import ResultHeader from '../components/desktop/list/ResultHeader.jsx';
import ResultGrid from '../components/desktop/list/ResultGrid.jsx';
import EmptyResult from '../components/desktop/list/EmptyResult.jsx';
import ActiveFilterChips from '../components/desktop/list/ActiveFilterChips.jsx';
import { Pagination } from '../components/ds/Pagination.jsx';
import Seo from '../components/global/Seo.jsx';
import './ListPage.css';

const PAGE_SIZE = 20;

export default function ListPage() {
  const compare = useCompare();
  const { products: PRODUCTS, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const subParam = searchParams.get('sub') ?? '';
  const pageParam = getListPageFromSearchParams(searchParams);
  const initialListStateRef = useRef(null);
  if (initialListStateRef.current === null) {
    initialListStateRef.current = loadListViewState();
  }
  const initialListState = initialListStateRef.current;

  // 세션 보존 상태 복원 — URL의 sub 파라미터가 있으면 그것을 우선
  const [activeSub, setActiveSub] = useState(() => subParam || initialListState.activeSub || 'all');
  const [filterState, setFilterState] = useState(() => initialListState.filterState || {});
  const [page, setPage] = useState(() => pageParam || initialListState.page || 1);

  const [sortKey, setSortKey] = useState(() => initialListState.sortKey || 'default');
  const visibleFoodTypes = useMemo(() => getVisibleFoodTypes(PRODUCTS), [PRODUCTS]);

  const setListPage = useCallback((nextPage, { replace = true, scroll = false } = {}) => {
    const normalized = Number.isFinite(nextPage) ? Math.max(1, Math.trunc(nextPage)) : 1;
    setPage(normalized);
    setSearchParams((prev) => setListPageSearchParam(prev, normalized), { replace });
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  // 카테고리·필터·정렬·페이지 변경 시 세션에 저장 → 상세/비교함 다녀와도 유지
  useEffect(() => {
    saveListViewState({ activeSub, filterState, sortKey, page });
  }, [activeSub, filterState, sortKey, page]);

  useEffect(() => {
    if (pageParam !== null && pageParam !== page) {
      setPage(pageParam);
    }
  }, [pageParam, page]);

  useEffect(() => {
    if (loading || activeSub === 'all') return;
    if (!visibleFoodTypes.some((ft) => ft.label === activeSub)) {
      setActiveSub('all');
    }
  }, [loading, activeSub, visibleFoodTypes]);

  // 식품유형 칩 라벨 → 식품유형 코드(food_type_category_code)
  const activeCode = useMemo(() => {
    if (activeSub === 'all') return null;
    return getFoodTypeByLabel(activeSub)?.code ?? null;
  }, [activeSub]);

  const baseProducts = useMemo(() => {
    let result = q ? searchProducts(q, PRODUCTS) : [...PRODUCTS];
    if (activeCode) {
      result = result.filter((p) => p.categoryCode === activeCode);
    }
    return result;
  }, [q, PRODUCTS, activeCode]);

  const proteinSourceTexts = useMemo(
    () => (activeCode === 'protein_drink' ? getProteinSourceTexts(baseProducts) : []),
    [baseProducts, activeCode],
  );
  const resolveProteinSource = useProteinResolver(proteinSourceTexts);
  const proteinSourceLabelOf = useCallback(
    (source) => formatProteinSourceLabel(source, resolveProteinSource),
    [resolveProteinSource],
  );
  const sweetenerTexts = useMemo(
    () => (activeCode === 'protein_drink' ? getSweetenerTexts(baseProducts) : []),
    [baseProducts, activeCode],
  );
  const resolveSweetener = useSweetenerResolver(sweetenerTexts);
  const sweetenerLabelOf = useCallback(
    (sweetener) => formatSweetenerLabel(sweetener, resolveSweetener),
    [resolveSweetener],
  );

  const filterSpecs = useMemo(
    () => getListFilterSpecs({
      products: baseProducts,
      activeCode,
      filterState,
      proteinSourceLabelOf,
      sweetenerLabelOf,
    }),
    [baseProducts, activeCode, filterState, proteinSourceLabelOf, sweetenerLabelOf],
  );

  const activeFilterCount = countActiveFilters(filterSpecs, filterState);
  const canResetSomething = activeFilterCount > 0 || activeSub !== 'all';

  const resetFilters = () => {
    setFilterState({});
    setActiveSub('all');
  };

  const clearSearch = () => navigate('/list');

  const products = useMemo(() => {
    let result = applyListFilters(baseProducts, filterSpecs, filterState, {
      proteinSourceLabelOf,
      sweetenerLabelOf,
    });
    // 정렬 기준은 카테고리(서브 라벨)별로 달라짐 — 단백질 음료는 단백질/EAA/BCAA 전용
    result = applySort(result, activeSub, sortKey);
    return result;
  }, [baseProducts, filterSpecs, activeSub, filterState, sortKey, proteinSourceLabelOf, sweetenerLabelOf]);

  const resetPageKey = useMemo(
    () => JSON.stringify({ q, activeCode, filterState, sortKey }),
    [q, activeCode, filterState, sortKey],
  );
  const resetPageKeyRef = useRef(resetPageKey);

  // 검색·필터·정렬·카테고리 변경 시 1페이지로 초기화
  // 최초 조건값 자체를 기준으로 비교해 StrictMode의 effect 재실행에서도 복원 페이지를 유지
  useEffect(() => {
    if (resetPageKeyRef.current === resetPageKey) {
      return;
    }
    resetPageKeyRef.current = resetPageKey;
    setListPage(1, { replace: true });
  }, [resetPageKey]);

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  useEffect(() => {
    if (page > pageCount) {
      setListPage(pageCount, { replace: true });
    }
  }, [page, pageCount, setListPage]);

  const pageProducts = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [products, page],
  );

  // 페이지 이동 — 리스트 상단으로 스크롤
  const goPage = (next) => {
    setListPage(next, { replace: false, scroll: true });
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

  // 검색어 > 카테고리 > 기본 순으로 제목 결정. canonical은 필터/정렬 쿼리 제거된 '/list'
  const seoTitle = q
    ? `'${q}' 검색 결과`
    : activeSub !== 'all'
      ? `${activeSub} 비교`
      : '다이어트 식품 목록';

  return (
    <div className="d-list-page">
      <Seo title={seoTitle} canonicalPath="/list" />
      <h1 className="sr-only">{seoTitle}</h1>
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
          {visibleFoodTypes.map((ft) => (
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
            specs={filterSpecs}
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
              specs={filterSpecs}
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
