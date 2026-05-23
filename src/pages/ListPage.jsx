import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { usePurpose } from '../store/PurposeContext.jsx';
import { PRODUCTS } from '../data/mockProducts.js';
import { searchProducts } from '../data/searchIndex.js';
import SubCategoryTabs from '../components/list/SubCategoryTabs.jsx';
import FilterPanel from '../components/list/FilterPanel.jsx';
import SortDropdown from '../components/list/SortDropdown.jsx';
import ProductCard from '../components/list/ProductCard.jsx';

// 리스트 페이지
// - 3개 진입 플로우의 합류 지점
//   1) 검색 → ?q=... 쿼리스트링
//   2) 목적 그리드 → 전역 purpose에 따라 자동 필터링
//   3) 랭킹 '전체보기' → 그대로 진입
// - 핵심: 어디서 들어왔든 동일한 UI에서 목적/세부카테고리/필터/정렬 조작 가능
export default function ListPage() {
  const { purpose, purposeId } = usePurpose();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';

  const [subCategory, setSubCategory] = useState('all');
  const [filterState, setFilterState] = useState({});
  const [sortKey, setSortKey] = useState('ranking');

  // 빈 결과일 때 복구 액션을 위해 활성 조건 추적
  const hasActiveFilter = Object.keys(filterState).length > 0;
  const hasActiveSubCategory = subCategory !== 'all';
  const canResetSomething = hasActiveFilter || hasActiveSubCategory;

  const resetFilters = () => {
    setFilterState({});
    setSubCategory('all');
  };

  const clearSearch = () => navigate('/list');

  // 1) 검색 쿼리 적용 → 2) 목적 적합도 적용 → 3) 세부 카테고리 → 4) 필터 → 5) 정렬
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

  return (
    <div className="page list-page">
      <div className="list-page-header">
        <h2 className="list-title">
          {q ? `"${q}" 검색 결과` : `${purpose.label} 추천 제품`}
        </h2>
        {/* 정렬 드롭다운은 타이틀과 같은 행에 우측 정렬 */}
        <SortDropdown value={sortKey} onChange={setSortKey} />
      </div>

      {/* 카테고리 탭과 결과 카운트는 풀폭으로 상단 배치
          → 카테고리 유무와 무관하게 아래 그리드에서 필터/제품 그리드 시작 위치가 항상 같음 */}
      <SubCategoryTabs
        categories={purpose.subCategories}
        value={subCategory}
        onChange={setSubCategory}
      />
      <div className="list-result-bar">
        총 <strong className="list-result-count">{products.length}</strong>개의 제품
      </div>

      <div className="list-body">
        <aside className="list-sidebar">
          <FilterPanel
            specs={purpose.filters}
            value={filterState}
            onChange={setFilterState}
          />
        </aside>

        <section className="list-main">
          {products.length === 0 ? (
            <div className="list-empty">
              <p className="list-empty-text">조건에 맞는 제품이 없습니다.</p>
              <div className="list-empty-actions">
                {canResetSomething && (
                  <button className="list-empty-btn" onClick={resetFilters}>
                    <RotateCcw size={14} aria-hidden />
                    <span>필터 초기화</span>
                  </button>
                )}
                {q && (
                  <button className="list-empty-btn" onClick={clearSearch}>
                    <span>"{q}" 검색 지우고 전체 보기</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} purpose={purpose} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// 목적별 필터 스펙(specs)을 현재 상태(value)에 따라 적용
// - range: {min, max} 사이 / multi: 선택된 항목이 제외 또는 포함 / bool: 옵션 활성 시 조건
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
    return passTriStateFilter(product, spec.key, v);
  }
  if (spec.type === 'bool') {
    if (!v) return true;
    if (spec.key === 'lactoseFree') return product.ingredients?.lactoseFree === true;
    return true;
  }
  return true;
}

// tristate 필터 통과 여부
// - value: { option: 'include' | 'exclude' } → 키 없는 옵션은 상관없음
// - include: 그 옵션이 제품에 있어야 통과 / exclude: 없어야 통과
function passTriStateFilter(product, key, value) {
  if (!value || Object.keys(value).length === 0) return true;
  const items = getIngredientList(product, key);
  for (const [option, state] of Object.entries(value)) {
    if (state === 'include' && !items.includes(option)) return false;
    if (state === 'exclude' && items.includes(option)) return false;
  }
  return true;
}

// tristate 필터의 키(sweeteners/proteinSources/allergens)에 해당하는 제품 성분 배열 반환
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
