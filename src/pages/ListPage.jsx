import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useCompare } from '../store/CompareContext.jsx';
import { useProductSearch, useProducts } from '../store/ProductsContext.jsx';
import { searchProducts } from '../data/searchIndex.js';
import { applySort } from '../data/listSort.js';
import {
  applyListFilters,
  countActiveFilters,
  formatResolvedProteinSourceLabel,
  formatResolvedSweetenerLabel,
  getListFilterSpecs,
  getProteinSourceTexts,
  getSweetenerTexts,
  supportsProteinSourceListFilters,
} from '../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../data/proteinQuality.js';
import {
  getListPageFromSearchParams,
  loadListViewState,
  saveListViewState,
  setListPageSearchParam,
} from '../data/listViewState.js';
import { LIST_FOOD_TYPES, getFoodTypeByLabel, getFoodTypeBySlug, getVisibleFoodTypes, isListProductVisible, categoryPath } from '../data/categoryTabs.js';
import NotFoundPage from './NotFoundPage.jsx';
import { FoodCardWideSkeleton } from '../components/ds/Skeleton.jsx';
import SidebarFilter from '../components/desktop/list/SidebarFilter.jsx';
import ResultHeader from '../components/desktop/list/ResultHeader.jsx';
import ResultGrid from '../components/desktop/list/ResultGrid.jsx';
import EmptyResult from '../components/desktop/list/EmptyResult.jsx';
import ActiveFilterChips from '../components/desktop/list/ActiveFilterChips.jsx';
import { Pagination } from '../components/ds/Pagination.jsx';
import Seo from '../components/global/Seo.jsx';
import { productPath } from '../data/productUrl.js';
import './ListPage.css';

const PAGE_SIZE = 20;

export default function ListPage() {
  const compare = useCompare();
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
  const [page, setPage] = useState(() => pageParam || initialListState.page || 1);

  const [sortKey, setSortKey] = useState(() => initialListState.sortKey || 'default');
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
    if (listLoading || activeSub === 'all') return;
    if (!visibleFoodTypes.some((ft) => ft.label === activeSub)) {
      setActiveSub('all');
    }
  }, [listLoading, activeSub, visibleFoodTypes]);

  // 식품유형 칩 라벨 → 식품유형 코드(food_type_category_code)
  const activeCode = useMemo(() => {
    if (activeSub === 'all') return null;
    return getFoodTypeByLabel(activeSub)?.code ?? null;
  }, [activeSub]);

  const baseProducts = useMemo(() => {
    const visibleProducts = PRODUCTS.filter(isListProductVisible);
    let result = visibleProducts;
    if (q) {
      result = remoteSearch.error
        ? searchProducts(q, visibleProducts)
        : remoteSearch.products.filter(isListProductVisible);
    }
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

  const activeFilterCount = countActiveFilters(filterSpecs, filterState);
  const canResetSomething = activeFilterCount > 0 || activeSub !== 'all';

  const resetFilters = () => {
    setFilterState({});
    setActiveSub('all');
  };

  const clearSearch = () => { setSearchParams({}); };

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

  if (listLoading) {
    return (
      <div className="d-list-page">
        <div className="d-list-page-inner">
          <div className="d-list-sub-chips">
            <button type="button" className="d-list-sub-chip is-active">전체</button>
            {LIST_FOOD_TYPES.map((ft) => (
              <button
                key={ft.label}
                type="button"
                className={`d-list-sub-chip${ft.disabled ? ' is-disabled' : ''}`}
                aria-disabled={ft.disabled || undefined}
              >
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

  // 검색어 > 카테고리 > 기본 순으로 제목 결정
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

  // canonical — 카테고리 경로면 /category/:slug, 아니면 /list (둘 다 page만 보존, 필터/정렬 제외)
  const basePath = routeFoodType ? `/category/${routeFoodType.slug}` : '/list';
  const canonicalPath = page > 1 ? `${basePath}?page=${page}` : basePath;

  return (
    <div className="d-list-page">
      <Seo title={seoTitle} description={seoDesc} canonicalPath={canonicalPath} />
      <h1 className="sr-only">{seoTitle}</h1>
      <div className="d-list-page-inner">
        {/* 식품유형 칩 — 목적 탭 없이 전 식품유형을 한 줄로, 준비중은 비활성 */}
        <div className="d-list-sub-chips">
          <button
            type="button"
            className={`d-list-sub-chip${activeSub === 'all' ? ' is-active' : ''}`}
            onClick={() => navigate('/list')}
          >
            전체
          </button>
          {visibleFoodTypes.map((ft) => {
            const disabled = Boolean(ft.disabled);
            return (
              <button
                key={ft.label}
                type="button"
                className={`d-list-sub-chip${activeSub === ft.label ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
                onClick={() => !disabled && navigate(categoryPath(ft))}
                aria-disabled={disabled || undefined}
                aria-label={disabled ? `${ft.label}, 준비중` : undefined}
                data-tooltip={disabled ? '준비중' : undefined}
              >
                {ft.label}
              </button>
            );
          })}
        </div>

        <div className="d-list-body">
          <SidebarFilter
            specs={filterSpecs}
            value={filterState}
            onChange={setFilterState}
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
              onReset={resetFilters}
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
                  onCardClick={(p) => navigate(productPath(p))}
                  onCompare={(id) => compare.toggle(id)}
                  sortKey={sortKey}
                />
                <Pagination page={page} pageCount={pageCount} onChange={goPage} hrefForPage={hrefForPage} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
