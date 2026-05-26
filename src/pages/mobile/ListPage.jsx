// 다분해 모바일 리스트/검색 결과 페이지
// 흐름:
//   1) AppBar (검색박스 클릭 → SearchSheet)
//   2) 상단 목적 탭 TopTabs (전체/체중감량/근성장/혈당관리/식사대용)
//   3) 세부 카테고리 칩 가로 스크롤 (purpose.subCategories)
//   4) ActionBar (결과 N개 + 정렬 + 필터 진입)
//   5) FoodCard list 세로 스택 / EmptyState
//   6) FilterSheet / SortSheet / SearchSheet (모달 시트)
import { useMemo, useState } from 'react';
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
import { PRODUCTS } from '../../data/mockProducts.js';
import { searchProducts } from '../../data/searchIndex.js';
import { getAdapted } from '../../data/adapters.js';
import { PURPOSES, ALL_PURPOSE, FOOD_CATEGORIES } from '../../data/purposes.jsx';
import { usePurpose } from '../../store/PurposeContext.jsx';
import { useCompare } from '../../store/CompareContext.jsx';
import './ListPage.css';

// 상단 목적 탭 라벨 배열 ('전체' + PURPOSES 라벨)
const TAB_PURPOSES = [ALL_PURPOSE, ...PURPOSES];
const TAB_LABELS = TAB_PURPOSES.map((p) => p.label);

// purposeId ↔ 탭 인덱스 변환
function purposeIdToIndex(id) {
  const i = TAB_PURPOSES.findIndex((p) => p.id === id);
  return i < 0 ? 0 : i;
}
function indexToPurposeId(i) {
  return TAB_PURPOSES[i]?.id ?? 'all';
}

// =========================================================== 필터링 로직
// (데스크탑 ListPage 와 같은 규칙을 모바일 모듈에서 별도 보존 — 데스크탑 파일을 건드리지 않기 위함)

// tristate 필터의 키에 대응하는 제품 성분 배열
function getIngredientList(product, key) {
  if (key === 'sweeteners') return product.ingredients?.sweeteners ?? [];
  if (key === 'proteinSources') return product.ingredients?.proteinSources ?? [];
  if (key === 'allergens') return product.ingredients?.allergens ?? [];
  return [];
}

// 단일 필터 통과 여부
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

// 필터 적용
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

// 정렬 적용
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

// =========================================================== 페이지 컴포넌트
export default function ListPageMobile() {
  const { purpose, purposeId, setPurpose } = usePurpose();
  const { count: compareCount, toggle: toggleCompare } = useCompare();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';

  // 페이지 로컬 상태
  const [subCategory, setSubCategory] = useState('all');
  const [filterState, setFilterState] = useState({});
  const [sortKey, setSortKey] = useState('ranking');

  // 시트 open 상태
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // 활성 필터/조건 여부 (빈 상태 복구 액션용)
  const filterActiveCount = countActiveFilters(purpose.filters, filterState);
  const hasActiveCondition = filterActiveCount > 0 || subCategory !== 'all';

  // 탭 전환 → purpose 변경 + 세부카테고리/필터 리셋
  // (다른 목적의 필터 스펙이라 의미 없는 잔여 상태가 남지 않도록)
  const handleTabSelect = (i) => {
    const nextId = indexToPurposeId(i);
    setPurpose(nextId);
    setSubCategory('all');
    setFilterState({});
  };

  // 검색 시트에서 제출된 query 처리
  const handleSearchSubmit = (next) => {
    const trimmed = (next ?? '').trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      // 빈 검색 → 쿼리 제거
      setSearchParams({});
    }
  };

  // 검색어 지우기
  const clearSearch = () => setSearchParams({});

  // 필터/카테고리 모두 리셋
  const resetFilters = () => {
    setFilterState({});
    setSubCategory('all');
  };

  // 비교함 진입
  const goCompare = () => navigate('/compare');

  // 결과 계산 — 검색 → 목적 적합도 → 세부 카테고리 → 필터 → 정렬
  const products = useMemo(() => {
    let result = q ? searchProducts(q) : [...PRODUCTS];
    if (purposeId !== 'all') {
      result = result.filter((p) => p.purposesFit?.includes(purposeId));
    }
    if (subCategory !== 'all') {
      result = result.filter((p) => p.category === subCategory);
    }
    result = applyFilters(result, purpose.filters, filterState);
    result = applySort(result, sortKey);
    return result;
  }, [q, purposeId, purpose.filters, subCategory, filterState, sortKey]);

  return (
    <div className="m-list-root">
      <AppBar
        onSearch={() => setSearchOpen(true)}
        onCompare={goCompare}
        compareCount={compareCount}
      />
      <TopTabs
        tabs={TAB_LABELS}
        active={purposeIdToIndex(purposeId)}
        onSelect={handleTabSelect}
      />
      <SubCategoryChips
        categories={FOOD_CATEGORIES}
        value={subCategory}
        onChange={setSubCategory}
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

      {/* 결과 영역 — 카드 또는 빈 상태 */}
      {products.length === 0 ? (
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
          {products.map((p) => (
            <FoodCard
              key={p.id}
              food={getAdapted(p)}
              layout="list"
              onClick={() => navigate(`/product/${p.id}`)}
              onCompare={(food) => toggleCompare(food.id)}
            />
          ))}
        </div>
      )}

      {/* 모달 시트들 */}
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
        specs={purpose.filters}
        value={filterState}
        onApply={setFilterState}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
