import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePurpose } from '../store/PurposeContext.jsx';
import { useCompare } from '../store/CompareContext.jsx';
import { PRODUCTS } from '../data/mockProducts.js';
import { searchProducts } from '../data/searchIndex.js';
import { PURPOSES, ALL_PURPOSE } from '../data/purposes.jsx';
import { TopTabs } from '../components/ds/TopTabs.jsx';
import SidebarFilter from '../components/desktop/list/SidebarFilter.jsx';
import ResultHeader from '../components/desktop/list/ResultHeader.jsx';
import ResultGrid from '../components/desktop/list/ResultGrid.jsx';
import EmptyResult from '../components/desktop/list/EmptyResult.jsx';
import ActiveFilterChips from '../components/desktop/list/ActiveFilterChips.jsx';
import './ListPage.css';

// 데스크탑 리스트/검색 결과 페이지
// - 1240px max-width 컨테이너
// - 상단: 목적 탭 (전체/체중감량/근성장/혈당관리/식사대용)
// - 본문 2단 레이아웃: 좌측 280px 사이드바 필터(sticky) + 우측 메인 그리드
// - 진입 플로우(검색/목적 그리드/랭킹 전체보기) 모두 합류 가능
export default function ListPage() {
  const { purpose, purposeId, setPurpose } = usePurpose();
  const compare = useCompare();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';

  const [subCategory, setSubCategory] = useState('all');
  const [filterState, setFilterState] = useState({});
  const [sortKey, setSortKey] = useState('ranking');

  // 사이드바 세부 카테고리 노출 목록
  // - 목적이 정해진 경우: 해당 목적의 subCategories 그대로
  // - '전체' 목적: mock 데이터에서 유니크 카테고리 추출 (사이드바 비지 않게)
  const sidebarSubCategories = useMemo(() => {
    if (purpose.subCategories && purpose.subCategories.length > 0) {
      return purpose.subCategories;
    }
    const unique = new Set(PRODUCTS.map((p) => p.category).filter(Boolean));
    return [...unique].sort((a, b) => a.localeCompare(b, 'ko'));
  }, [purpose.subCategories]);

  // 활성 조건 체크 — 빈 결과 시 복구 액션 및 사이드바 헤더에 사용
  const activeFilterCount = countActiveFilters(filterState);
  const hasActiveSubCategory = subCategory !== 'all';
  const canResetSomething = activeFilterCount > 0 || hasActiveSubCategory;

  const resetFilters = () => {
    setFilterState({});
    setSubCategory('all');
  };

  const clearSearch = () => navigate('/list');

  // 목적 변경 시 세부 카테고리/필터는 초기화 — 다른 목적의 필터 스펙이 호환되지 않음
  const handlePurposeTab = (index) => {
    const id = TAB_PURPOSE_IDS[index];
    if (id === purposeId) return;
    setPurpose(id);
    setSubCategory('all');
    setFilterState({});
  };

  // 1) 검색 쿼리 → 2) 목적 적합 → 3) 세부 카테고리 → 4) 필터 → 5) 정렬
  const products = useMemo(() => {
    let result = q ? searchProducts(q) : [...PRODUCTS];
    if (purposeId !== 'all') {
      result = result.filter((p) => p.purposesFit.includes(purposeId));
    }
    if (subCategory !== 'all') {
      result = result.filter((p) => p.category === subCategory);
    }
    result = applyFilters(result, purpose.filters, filterState);
    result = applySort(result, sortKey);
    return result;
  }, [q, purposeId, purpose.filters, subCategory, filterState, sortKey]);

  // 현재 목적 탭 인덱스 (전체=0, 이후 PURPOSES 순서)
  const activeTabIndex = TAB_PURPOSE_IDS.indexOf(purposeId);
  const safeTabIndex = activeTabIndex >= 0 ? activeTabIndex : 0;

  return (
    <div className="d-list-page">
      <div className="d-list-page-inner">
        <div className="d-list-tabs-wrap">
          <TopTabs tabs={TAB_LABELS} active={safeTabIndex} onSelect={handlePurposeTab} />
        </div>

        <div className="d-list-body">
          <SidebarFilter
            subCategories={sidebarSubCategories}
            subCategory={subCategory}
            onSubCategoryChange={setSubCategory}
            specs={purpose.filters}
            value={filterState}
            onChange={setFilterState}
            onReset={resetFilters}
            activeCount={activeFilterCount + (hasActiveSubCategory ? 1 : 0)}
          />

          <section className="d-list-main">
            <ResultHeader
              query={q}
              purposeLabel={purpose.label}
              count={products.length}
              sortKey={sortKey}
              onSortChange={setSortKey}
              onClearQuery={clearSearch}
            />

            <ActiveFilterChips
              subCategory={subCategory}
              onClearSubCategory={() => setSubCategory('all')}
              specs={purpose.filters}
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
              <ResultGrid
                products={products}
                onCardClick={(id) => navigate(`/product/${id}`)}
                onCompare={(id) => compare.toggle(id)}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// 탭 순서 — '전체' + PURPOSES 원본 순서 유지
const TAB_PURPOSE_IDS = [ALL_PURPOSE.id, ...PURPOSES.map((p) => p.id)];
const TAB_LABELS = [ALL_PURPOSE.label, ...PURPOSES.map((p) => p.label)];

// 활성 필터 개수 카운트 — range/tristate/bool 각각의 유효성 검사
function countActiveFilters(value) {
  let n = 0;
  for (const [, v] of Object.entries(value)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'boolean') {
      if (v) n += 1;
    } else if (typeof v === 'object') {
      // range {min,max} 또는 tristate {option:'include'|'exclude'}
      const keys = Object.keys(v).filter((k) => v[k] !== undefined && v[k] !== null && v[k] !== '');
      if (keys.length > 0) n += 1;
    }
  }
  return n;
}

// 목적별 필터 스펙을 현재 상태에 따라 적용
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

// 단일 필터 통과 여부 — 타입별 분기
function passSingleFilter(product, spec, v) {
  if (spec.type === 'range') return passRange(product, spec, v);
  if (spec.type === 'tristate') return passTriState(product, spec.key, v);
  if (spec.type === 'bool') return passBool(product, spec, v);
  return true;
}

// range 필터 — product.nutrition[key]가 [min, max] 사이여야 통과
function passRange(product, spec, v) {
  const target = product.nutrition?.[spec.key];
  if (target === undefined) return true;
  if (v.min !== undefined && target < v.min) return false;
  if (v.max !== undefined && target > v.max) return false;
  return true;
}

// tristate 필터 — include는 있어야, exclude는 없어야 통과
function passTriState(product, key, value) {
  if (!value || Object.keys(value).length === 0) return true;
  const items = getIngredientList(product, key);
  for (const [option, state] of Object.entries(value)) {
    if (state === 'include' && !items.includes(option)) return false;
    if (state === 'exclude' && items.includes(option)) return false;
  }
  return true;
}

// bool 필터 — 현재는 lactoseFree 하나, 향후 다른 키 추가 시 확장
function passBool(product, spec, v) {
  if (!v) return true;
  if (spec.key === 'lactoseFree') return product.ingredients?.lactoseFree === true;
  return true;
}

// tristate 키 → 제품 성분 배열
function getIngredientList(product, key) {
  if (key === 'sweeteners') return product.ingredients?.sweeteners ?? [];
  if (key === 'proteinSources') return product.ingredients?.proteinSources ?? [];
  if (key === 'allergens') return product.ingredients?.allergens ?? [];
  return [];
}

// 정렬 적용
function applySort(products, sortKey) {
  const arr = [...products];
  switch (sortKey) {
    case 'ranking':
      return arr.sort((a, b) => b.rankingScore - a.rankingScore);
    case 'calories_asc':
      return arr.sort((a, b) => (a.nutrition.calories ?? 0) - (b.nutrition.calories ?? 0));
    case 'protein_desc':
      return arr.sort((a, b) => (b.nutrition.protein ?? 0) - (a.nutrition.protein ?? 0));
    case 'sugar_asc':
      return arr.sort((a, b) => (a.nutrition.sugar ?? 0) - (b.nutrition.sugar ?? 0));
    default:
      return arr;
  }
}
