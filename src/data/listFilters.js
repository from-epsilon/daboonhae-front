import { ALLERGEN_FILTER_NOTE, ALL_FILTERS } from './purposes.jsx';
import { computeBcaa, computeEaa } from './aminoAcids.js';
import { cleanProteinLabel, cleanSweetenerLabel } from './proteinQuality.js';

const PROTEIN_SOURCE_FILTER_CODES = new Set(['protein_drink', 'shake']);
const FLAVOR_OTHER_LABEL = '기타';

const PROTEIN_RANGE_SPECS = [
  { key: 'calories', type: 'range', label: '칼로리(kcal)', min: 0, max: 800 },
  { key: 'protein', type: 'range', label: '단백질(g)', min: 0, max: 50 },
  { key: 'eaa', type: 'range', label: '필수아미노산(mg)', min: 0, max: null },
  { key: 'bcaa', type: 'range', label: 'BCAA(mg)', min: 0, max: null },
  { key: 'carbs', type: 'range', label: '탄수화물(g)', min: 0, max: 80 },
  { key: 'fat', type: 'range', label: '지방(g)', min: 0, max: 30 },
  { key: 'sugar', type: 'range', label: '당류(g)', min: 0, max: 30 },
];

export function getListFilterSpecs({
  products,
  activeCode,
  filterState = {},
  proteinSourceLabelOf,
  sweetenerLabelOf,
}) {
  if (!supportsProteinSourceListFilters(activeCode)) {
    return withFlavorFilter(getGeneralFilterSpecs(products, filterState, { sweetenerLabelOf }), products, filterState);
  }
  return withFlavorFilter(getProteinDrinkFilterSpecs(products, filterState, {
    proteinSourceLabelOf,
    sweetenerLabelOf,
  }), products, filterState);
}

export function supportsProteinSourceListFilters(activeCode) {
  return PROTEIN_SOURCE_FILTER_CODES.has(activeCode);
}

export function getProteinSourceTexts(products) {
  return [...new Set(
    (products ?? [])
      .flatMap((product) => normalizeList(product?.ingredients?.proteinSources))
      .filter(Boolean),
  )];
}

export function getSweetenerTexts(products) {
  return [...new Set(
    (products ?? [])
      .flatMap((product) => normalizeList(product?.ingredients?.sweeteners))
      .filter(Boolean),
  )];
}

export function countActiveFilters(specs, state) {
  if (!specs || !state) return 0;
  let n = 0;
  for (const spec of specs) {
    const v = state[spec.key];
    if (v === undefined || v === null) continue;
    if (spec.type === 'range') {
      if (v.min !== undefined || v.max !== undefined) n += 1;
    } else if (spec.type === 'tristate' || spec.type === 'exclude_only') {
      const allowed = new Set(spec.options ?? []);
      const has = Object.entries(v).some(([option, s]) => {
        if (allowed.size > 0 && !allowed.has(option)) return false;
        return s === 'include' || s === 'exclude';
      });
      if (has) n += 1;
    } else if (spec.type === 'single') {
      if (v) n += 1;
    } else if (spec.type === 'bool') {
      if (v === true) n += 1;
    }
  }
  return n;
}

export function applyListFilters(products, specs, value, context = {}) {
  if (!specs || specs.length === 0) return products;
  const allowedOptionsByKey = Object.fromEntries(
    specs
      .filter((spec) => spec.type === 'tristate' || spec.type === 'exclude_only' || spec.type === 'single')
      .map((spec) => [spec.key, new Set(spec.options ?? [])]),
  );
  const filterContext = { ...context, allowedOptionsByKey };
  return products.filter((p) => {
    for (const spec of specs) {
      const v = value[spec.key];
      if (v === undefined || v === null) continue;
      if (!passSingleFilter(p, spec, v, filterContext)) return false;
    }
    return true;
  });
}

export function formatProteinSourceLabel(source, resolver) {
  const resolved = resolver?.(source);
  if (resolved?.nameKo) {
    const name = cleanProteinLabel(resolved.nameKo);
    const abbr = resolved.abbreviation;
    if (!abbr || name.includes(`(${abbr})`)) return name;
    return `${name}(${abbr})`;
  }
  return cleanProteinLabel(source);
}

export function formatResolvedProteinSourceLabel(source, resolver) {
  const resolved = resolver?.(source);
  if (!resolved?.nameKo) return null;
  const name = cleanProteinLabel(resolved.nameKo);
  const abbr = resolved.abbreviation;
  if (!abbr || name.includes(`(${abbr})`)) return name;
  return `${name}(${abbr})`;
}

export function formatSweetenerLabel(sweetener, resolver) {
  const resolved = resolver?.(sweetener);
  if (resolved?.nameKo) return String(resolved.nameKo).trim();
  return cleanSweetenerLabel(sweetener);
}

export function formatResolvedSweetenerLabel(sweetener, resolver) {
  const resolved = resolver?.(sweetener);
  return resolved?.nameKo ? String(resolved.nameKo).trim() : null;
}

function getProteinDrinkFilterSpecs(
  products,
  filterState,
  {
    proteinSourceLabelOf = defaultProteinSourceLabel,
    sweetenerLabelOf = defaultSweetenerLabel,
  } = {},
) {
  const rangeSpecs = PROTEIN_RANGE_SPECS
    .map((spec) => hydrateRangeSpec(spec, products))
    .filter((spec) => hasNutrient(products, spec.key) || hasActiveRange(filterState[spec.key]));

  return [
    ...rangeSpecs,
    dynamicOptionSpec({
      products,
      filterState,
      key: 'proteinSources',
      type: 'tristate',
      label: '단백질 원료',
      context: { proteinSourceLabelOf },
    }),
    dynamicOptionSpec({
      products,
      filterState,
      key: 'sweeteners',
      type: 'tristate',
      label: '대체당',
      context: { sweetenerLabelOf },
    }),
    dynamicOptionSpec({
      products,
      filterState,
      key: 'allergens',
      type: 'exclude_only',
      label: '알레르기 유발 성분',
      note: ALLERGEN_FILTER_NOTE,
    }),
  ].filter(Boolean);
}

function getGeneralFilterSpecs(
  products,
  filterState,
  {
    sweetenerLabelOf = defaultSweetenerLabel,
  } = {},
) {
  return ALL_FILTERS.map((spec) => {
    if (spec.key !== 'sweeteners') return spec;
    return dynamicOptionSpec({
      products,
      filterState,
      key: 'sweeteners',
      type: spec.type,
      label: spec.label,
      context: { sweetenerLabelOf },
    });
  }).filter(Boolean);
}

function withFlavorFilter(specs, products, filterState) {
  const flavorSpec = dynamicOptionSpec({
    products,
    filterState,
    key: 'flavor',
    type: 'single',
    label: '맛',
  });
  return flavorSpec ? [flavorSpec, ...specs] : specs;
}

function hydrateRangeSpec(spec, products) {
  if (spec.max !== null) return spec;
  return { ...spec, max: dynamicRangeMax(products, spec.key) };
}

function dynamicRangeMax(products, key) {
  const max = Math.max(0, ...products.map((p) => getNutrientValue(p, key) ?? 0));
  if (max >= 1000) return Math.ceil(max / 1000) * 1000;
  if (max >= 100) return Math.ceil(max / 100) * 100;
  if (max >= 10) return Math.ceil(max / 10) * 10;
  return Math.max(1, Math.ceil(max));
}

function hasNutrient(products, key) {
  return products.some((p) => typeof getNutrientValue(p, key) === 'number');
}

function hasActiveRange(value) {
  return !!value && (value.min !== undefined || value.max !== undefined);
}

function dynamicOptionSpec({ products, filterState, key, type, label, note, context }) {
  const options = rankedOptions(products, key, filterState[key], context);
  if (options.length === 0) return null;
  return { key, type, label, note, options };
}

function rankedOptions(products, key, selected = {}, context = {}) {
  const counts = new Map();
  for (const product of products) {
    const items = getIngredientList(product, key, context);
    if (key === 'flavor' && items.length === 0) {
      counts.set(FLAVOR_OTHER_LABEL, (counts.get(FLAVOR_OTHER_LABEL) ?? 0) + 1);
      continue;
    }
    for (const item of new Set(items)) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  if (selected && typeof selected === 'object') {
    for (const option of Object.keys(selected)) {
      if ((key === 'sweeteners' || key === 'proteinSources') && !counts.has(option)) continue;
      if (selected[option]) counts.set(option, counts.get(option) ?? 0);
    }
  } else if (typeof selected === 'string' && selected) {
    counts.set(selected, counts.get(selected) ?? 0);
  }
  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0], 'ko');
    })
    .map(([option]) => option);
}

function passSingleFilter(product, spec, v, context) {
  if (spec.type === 'range') return passRange(product, spec, v);
  if (spec.type === 'tristate') return passTriState(product, spec.key, v, context);
  if (spec.type === 'exclude_only') return passTriState(product, spec.key, v, context);
  if (spec.type === 'single') return passSingle(product, spec.key, v, context);
  if (spec.type === 'bool') return passBool(product, spec, v);
  return true;
}

function passRange(product, spec, v) {
  const isActive = v.min !== undefined || v.max !== undefined;
  if (!isActive) return true;
  const target = getNutrientValue(product, spec.key);
  if (target === undefined || target === null) return false;
  if (v.min !== undefined && target < v.min) return false;
  if (v.max !== undefined && target > v.max) return false;
  return true;
}

function passTriState(product, key, value, context) {
  if (!value || Object.keys(value).length === 0) return true;
  const items = getIngredientList(product, key, context);
  const allowed = context.allowedOptionsByKey?.[key];
  for (const [option, state] of Object.entries(value)) {
    if (allowed && !allowed.has(option)) continue;
    if (state === 'include' && !items.includes(option)) return false;
    if (state === 'exclude' && items.includes(option)) return false;
  }
  return true;
}

function passSingle(product, key, value, context) {
  if (!value) return true;
  const items = getIngredientList(product, key, context);
  if (key === 'flavor' && value === FLAVOR_OTHER_LABEL) return items.length === 0;
  return items.includes(value);
}

function passBool(product, spec, v) {
  if (!v) return true;
  if (spec.key === 'lactoseFree') return product.ingredients?.lactoseFree === true;
  return true;
}

function getNutrientValue(product, key) {
  const n = product?.nutrition ?? {};
  if (key === 'eaa') return computeEaa(n) ?? undefined;
  if (key === 'bcaa') return computeBcaa(n) ?? undefined;
  return typeof n[key] === 'number' ? n[key] : undefined;
}

function getIngredientList(product, key, context = {}) {
  const ingredients = product?.ingredients ?? {};
  if (key === 'sweeteners') {
    const labelOf = context.sweetenerLabelOf ?? defaultSweetenerLabel;
    return normalizeList(ingredients.sweeteners).map(labelOf).filter(Boolean);
  }
  if (key === 'proteinSources') {
    const labelOf = context.proteinSourceLabelOf ?? defaultProteinSourceLabel;
    return normalizeList(ingredients.proteinSources).map(labelOf).filter(Boolean);
  }
  if (key === 'flavor') {
    return normalizeList([product?.flavorName || product?.flavorCode]).filter(Boolean);
  }
  if (key === 'allergens') return normalizeList(ingredients.allergens).filter((item) => item !== '함유');
  return [];
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function defaultProteinSourceLabel(source) {
  return formatProteinSourceLabel(source);
}

function defaultSweetenerLabel(sweetener) {
  return formatSweetenerLabel(sweetener);
}
