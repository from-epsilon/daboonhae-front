import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppBar } from '../../components/ds/AppBar.jsx';
import { FoodCard } from '../../components/ds/FoodCard.jsx';
import { SubCategoryChips } from '../../components/mobile/list/SubCategoryChips.jsx';
import { ActionBar } from '../../components/mobile/list/ActionBar.jsx';
import { FilterSheet } from '../../components/mobile/list/FilterSheet.jsx';
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
import {
  applyListFilters,
  countActiveFilters,
  formatProteinSourceLabel,
  formatSweetenerLabel,
  getListFilterSpecs,
  getProteinSourceTexts,
  getSweetenerTexts,
} from '../../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../../data/proteinQuality.js';
import {
  getListPageFromSearchParams,
  loadListViewState,
  saveListViewState,
  setListPageSearchParam,
} from '../../data/listViewState.js';
import { getFoodTypeByLabel, getFoodTypeByCode, getVisibleFoodTypes } from '../../data/categoryTabs.js';
import { useCompare } from '../../store/CompareContext.jsx';
import Seo from '../../components/global/Seo.jsx';
import './ListPage.css';

const PAGE_SIZE = 20;

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
  const pageParam = getListPageFromSearchParams(searchParams);
  const initialListStateRef = useRef(null);
  if (initialListStateRef.current === null) {
    initialListStateRef.current = loadListViewState();
  }
  const initialListState = initialListStateRef.current;

  // 세션 보존 상태 복원 — URL의 sub 파라미터가 있으면 그것을 우선
  const [activeSub, setActiveSub] = useState(() => subParam || initialListState.activeSub || 'all');
  const [filterState, setFilterState] = useState(() => initialListState.filterState || {});
  const [sortKey, setSortKey] = useState(() => initialListState.sortKey || 'default');
  const [page, setPage] = useState(() => pageParam || initialListState.page || 1);
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

  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // activeSub이 라벨이면 해당 식품유형 코드(food_type_category_code) 찾기
  const activeCode = useMemo(() => {
    if (activeSub === 'all') return null;
    return getFoodTypeByLabel(activeSub)?.code ?? null;
  }, [activeSub]);

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

  const baseProducts = useMemo(() => {
    let result = q ? searchProducts(q, PRODUCTS) : [...PRODUCTS];
    // 식품유형 칩 선택 시: 식품유형 코드 정확 매칭 / '전체'면 전 제품
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

  const filterActiveCount = useMemo(() => {
    return countActiveFilters(filterSpecs, filterState);
  }, [filterSpecs, filterState]);
  const hasActiveCondition = filterActiveCount > 0 || activeSub !== 'all';

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

  const seoTitle = q
    ? `'${q}' 검색 결과`
    : activeSub !== 'all'
      ? `${activeSub} 비교`
      : '다이어트 식품 목록';

  return (
    <div className="m-list-root">
      <Seo title={seoTitle} canonicalPath="/list" />
      <AppBar
        onSearch={() => setSearchOpen(true)}
        onCompare={goCompare}
        compareCount={compareCount}
        onLogo={() => navigate('/')}
      />

      <div className="m-list-sticky-header">
        <SubCategoryChips
          categories={visibleFoodTypes}
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
        specs={filterSpecs}
        value={filterState}
        onApply={setFilterState}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
