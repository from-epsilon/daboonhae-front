import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
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
import { useProductSearch, useProducts } from '../../store/ProductsContext.jsx';
import { searchProducts } from '../../data/searchIndex.js';
import { getAdapted } from '../../data/adapters.js';
import { applySort, resolveSortKey } from '../../data/listSort.js';
import {
  applyListFilters,
  countActiveFilters,
  formatResolvedProteinSourceLabel,
  formatResolvedSweetenerLabel,
  getListFilterSpecs,
  getProteinSourceTexts,
  getSweetenerTexts,
  supportsProteinSourceListFilters,
} from '../../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../../data/proteinQuality.js';
import {
  getListPageFromSearchParams,
  loadListViewState,
  saveListViewState,
  setListPageSearchParam,
} from '../../data/listViewState.js';
import { getFoodTypeByLabel, getFoodTypeByCode, getFoodTypeBySlug, getVisibleFoodTypes, isListProductVisible, categoryPath } from '../../data/categoryTabs.js';
import NotFoundPage from '../NotFoundPage.jsx';
import { useCompare } from '../../store/CompareContext.jsx';
import Seo from '../../components/global/Seo.jsx';
import { productPath } from '../../data/productUrl.js';
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
  // 카테고리 경로형 URL(/category/:slug) — 경로의 슬러그가 카테고리의 단일 출처
  const { categorySlug } = useParams();
  const routeFoodType = categorySlug ? getFoodTypeBySlug(categorySlug) : null;
  const q = searchParams.get('q') ?? '';
  const remoteSearch = useProductSearch(q);
  const listLoading = loading || remoteSearch.loading;
  const subParam = searchParams.get('sub') ?? '';
  const pageParam = getListPageFromSearchParams(searchParams);
  const initialListStateRef = useRef(null);
  if (initialListStateRef.current === null) {
    initialListStateRef.current = loadListViewState();
  }
  const initialListState = initialListStateRef.current;

  // 카테고리는 URL(경로) 우선 → sub 쿼리 → 세션 복원 순
  const [activeSub, setActiveSub] = useState(() => routeFoodType?.label || subParam || initialListState.activeSub || 'all');
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

  // URL(경로 슬러그)을 카테고리의 단일 출처로 동기화 — /category/:slug → 라벨, /list → 전체
  useEffect(() => {
    const ft = categorySlug ? getFoodTypeBySlug(categorySlug) : null;
    setActiveSub(ft ? ft.label : 'all');
  }, [categorySlug]);

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
    const resolved = resolveSortKey(activeSub, sortKey);
    if (resolved !== sortKey) setSortKey(resolved);
  }, [activeSub, sortKey]);

  useEffect(() => {
    if (listLoading || activeSub === 'all') return;
    if (!visibleFoodTypes.some((ft) => ft.label === activeSub)) {
      setActiveSub('all');
    }
  }, [listLoading, activeSub, visibleFoodTypes]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // activeSub이 라벨이면 해당 식품유형 코드(food_type_category_code) 찾기
  const activeCode = useMemo(() => {
    if (activeSub === 'all') return null;
    return getFoodTypeByLabel(activeSub)?.code ?? null;
  }, [activeSub]);

  // 칩 선택 → 카테고리 경로형 URL로 이동 (URL이 카테고리의 단일 출처)
  const handleSubSelect = useCallback((label) => {
    navigate(label === 'all' ? '/list' : categoryPath(label));
  }, [navigate]);

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
    const visibleProducts = PRODUCTS.filter(isListProductVisible);
    let result = visibleProducts;
    if (q) {
      result = remoteSearch.error
        ? searchProducts(q, visibleProducts)
        : remoteSearch.products.filter(isListProductVisible);
    }
    // 식품유형 칩 선택 시: 식품유형 코드 정확 매칭 / '전체'면 전 제품
    if (activeCode) {
      result = result.filter((p) => p.categoryCode === activeCode);
    }
    return result;
  }, [q, PRODUCTS, remoteSearch.products, remoteSearch.error, activeCode]);

  const proteinSourceTexts = useMemo(
    () => (supportsProteinSourceListFilters(activeCode) ? getProteinSourceTexts(baseProducts) : []),
    [baseProducts, activeCode],
  );
  const resolveProteinSource = useProteinResolver(proteinSourceTexts);
  const proteinSourceLabelOf = useCallback(
    (source) => formatResolvedProteinSourceLabel(source, resolveProteinSource),
    [resolveProteinSource],
  );
  const sweetenerTexts = useMemo(
    () => getSweetenerTexts(baseProducts),
    [baseProducts],
  );
  const resolveSweetener = useSweetenerResolver(sweetenerTexts);
  const sweetenerLabelOf = useCallback(
    (sweetener) => formatResolvedSweetenerLabel(sweetener, resolveSweetener),
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
    // 정렬 기준은 카테고리(서브 라벨)별로 달라짐 — 단백질 음료는 단백질/EAA/류신/BCAA 전용
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
    // 로딩 중엔 products가 비어 pageCount=1이 되므로 clamp 금지
    // (직접 /list?page=2 진입 시 1로 리셋되어 딥 페이지가 크롤/표시 안 되는 버그 방지)
    if (listLoading) return;
    if (page > pageCount) {
      setListPage(pageCount, { replace: true });
    }
  }, [listLoading, page, pageCount, setListPage]);

  const pageProducts = useMemo(
    () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [products, page],
  );

  // 페이지 이동 — 리스트 상단으로 스크롤
  const goPage = (next) => {
    setListPage(next, { replace: false, scroll: true });
  };

  // 페이지네이션 크롤용 href — 현재 경로(/list 또는 /category/:slug) 기준 + page만 교체
  const hrefForPage = useCallback((n) => {
    const qs = setListPageSearchParam(searchParams, n).toString();
    const base = routeFoodType ? `/category/${routeFoodType.slug}` : '/list';
    return qs ? `${base}?${qs}` : base;
  }, [searchParams, routeFoodType]);

  // 존재하지 않는 카테고리 슬러그 → 404(noindex)
  if (categorySlug && !routeFoodType) {
    return <NotFoundPage />;
  }

  const seoTitle = q
    ? `'${q}' 검색 결과`
    : activeSub !== 'all'
      ? `${activeSub} 비교`
      : '다이어트 식품 목록';

  // 페이지별 메타 설명 — 카테고리/검색은 전용 문구, 그 외 기본값(undefined)
  const seoDesc = q
    ? `'${q}' 검색 결과 — 다이어트 식품의 영양성분·가격을 비교하세요.`
    : activeSub !== 'all'
      ? `${activeSub} 영양성분·가격 비교. 단백질·당류·칼로리를 제품별로 한눈에 비교하세요.`
      : undefined;

  // canonical — 카테고리 경로면 /category/:slug, 아니면 /list (둘 다 page만 보존)
  const basePath = routeFoodType ? `/category/${routeFoodType.slug}` : '/list';
  const canonicalPath = page > 1 ? `${basePath}?page=${page}` : basePath;

  return (
    <div className="m-list-root">
      <Seo title={seoTitle} description={seoDesc} canonicalPath={canonicalPath} />
      <h1 className="sr-only">{seoTitle}</h1>
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

      {listLoading ? (
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
                onClick={() => navigate(productPath(p))}
                onCompare={(food) => toggleCompare(food.id)}
              />
            );
          })}
          <Pagination page={page} pageCount={pageCount} onChange={goPage} hrefForPage={hrefForPage} />
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
