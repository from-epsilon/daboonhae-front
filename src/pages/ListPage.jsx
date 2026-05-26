import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCompare } from '../store/CompareContext.jsx';
import { useProducts } from '../store/ProductsContext.jsx';
import { searchProducts } from '../data/searchIndex.js';
import { FOOD_CATEGORIES, ALL_FILTERS } from '../data/purposes.jsx';
import SidebarFilter from '../components/desktop/list/SidebarFilter.jsx';
import ResultHeader from '../components/desktop/list/ResultHeader.jsx';
import ResultGrid from '../components/desktop/list/ResultGrid.jsx';
import EmptyResult from '../components/desktop/list/EmptyResult.jsx';
import ActiveFilterChips from '../components/desktop/list/ActiveFilterChips.jsx';
import './ListPage.css';

export default function ListPage() {
  const compare = useCompare();
  const { products: PRODUCTS, loading } = useProducts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category') ?? '';

  const [subCategory, setSubCategory] = useState(categoryParam || 'all');
  const [filterState, setFilterState] = useState({});

  useEffect(() => {
    if (categoryParam) setSubCategory(categoryParam);
  }, [categoryParam]);
  const [sortKey, setSortKey] = useState('calories_asc');

  const activeFilterCount = countActiveFilters(filterState);
  const hasActiveSubCategory = subCategory !== 'all';
  const canResetSomething = activeFilterCount > 0 || hasActiveSubCategory;

  const resetFilters = () => {
    setFilterState({});
    setSubCategory('all');
  };

  const clearSearch = () => navigate('/list');

  const products = useMemo(() => {
    let result = q ? searchProducts(q, PRODUCTS) : [...PRODUCTS];
    if (subCategory !== 'all') {
      result = result.filter((p) => p.category === subCategory);
    }
    result = applyFilters(result, ALL_FILTERS, filterState);
    result = applySort(result, sortKey);
    return result;
  }, [q, PRODUCTS, subCategory, filterState, sortKey]);

  if (loading) return <div className="d-list-page" style={{ textAlign: 'center', padding: '4rem' }}>불러오는 중...</div>;

  return (
    <div className="d-list-page">
      <div className="d-list-page-inner">
        <div className="d-list-category-chips">
          <button
            type="button"
            className={`d-list-category-chip${subCategory === 'all' ? ' is-active' : ''}`}
            onClick={() => setSubCategory('all')}
          >
            전체
          </button>
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`d-list-category-chip${subCategory === cat ? ' is-active' : ''}`}
              onClick={() => setSubCategory(cat)}
            >
              {cat}
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
    case 'sugar_asc': return arr.sort((a, b) => (a.nutrition.sugar ?? 0) - (b.nutrition.sugar ?? 0));
    default: return arr;
  }
}
