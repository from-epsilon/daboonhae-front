import { cheapestUnitPrice } from './categoryCardMetrics.js';
import { AMINO_ACID_KEYS, AMINO_ACID_LABELS } from './aminoAcids.js';
import { NUTRIENT_GROUP, isNutrientGroup } from './nutrientGroups.js';
import { bestUnitPriceOf } from './purchaseLinks.js';

const PROTEIN_DRINK_CODE = 'protein_drink';
const PROTEIN_DRINK_LABEL = '단백질 음료';

export const LOWEST_UNIT_PRICE_COMPARE_METRIC = {
  key: 'lowestUnitPrice',
  label: '최저가',
  unit: '원/개',
  direction: 'min',
  getValue: bestUnitPriceOf,
};

const DEFAULT_COMPARE_METRICS = [
  { label: '열량', key: 'calories', unit: 'kcal', direction: 'min' },
  { label: '단백질', key: 'protein', unit: 'g', direction: 'max' },
  { label: '탄수화물', key: 'carbs', unit: 'g', direction: null },
  { label: '지방', key: 'fat', unit: 'g', direction: null },
  { label: '당류', key: 'sugar', unit: 'g', direction: 'min' },
  { label: '식이섬유', key: 'fiber', unit: 'g', direction: 'max' },
];

const CORE_NUTRIENT_CODES = new Set([
  'energy_kcal',
  'protein_g',
  'carbohydrate_g',
  'sugars_g',
  'fat_g',
  'dietary_fiber',
  'sodium_mg',
  'trans_fat_g',
  'saturated_fat_g',
  'cholesterol_mg',
  'src_알룰로오스_g',
  'src_eaa_mg',
  'src_bcaa_mg',
  'eaa',
  'bcaa',
  ...AMINO_ACID_KEYS,
]);

function valueOf(product, key, { zeroAsMissing = false } = {}) {
  const value = product?.nutrition?.[key];
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  if (zeroAsMissing && value <= 0) return null;
  return value;
}

function proteinValue(product, base, mode) {
  const total = valueOf(product, base, { zeroAsMissing: true });
  if (total === null) return null;

  if (mode === 'total') return total;

  const calories = valueOf(product, 'calories', { zeroAsMissing: true });
  if (mode === 'kcal') {
    return calories ? (total / calories) * 100 : null;
  }

  if (mode === 'price') {
    const unitPrice = cheapestUnitPrice(product);
    return unitPrice ? (total / unitPrice) * 1000 : null;
  }

  return null;
}

function rawNutrientName(fn) {
  return fn?.nutrients?.name_ko || fn?.nutrient_code || '';
}

function rawNutrientUnit(fn) {
  return fn?.unit || fn?.nutrients?.default_unit || '';
}

function getRawNutrientAmount(product, nutrientCode) {
  const row = (product?.foodNutrients ?? []).find((fn) => fn?.nutrient_code === nutrientCode);
  const value = row?.amount;
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

function isVitaminNutrient(fn) {
  if (!fn?.nutrient_code || CORE_NUTRIENT_CODES.has(fn.nutrient_code)) return false;
  return isNutrientGroup(fn, NUTRIENT_GROUP.VITAMIN);
}

function isMineralNutrient(fn) {
  if (!fn?.nutrient_code || CORE_NUTRIENT_CODES.has(fn.nutrient_code)) return false;
  return isNutrientGroup(fn, NUTRIENT_GROUP.MINERAL);
}

function rawNutrientMetric(fn, groupLabel) {
  const nutrientCode = fn.nutrient_code;
  const name = rawNutrientName(fn);
  return {
    key: `${groupLabel}:${nutrientCode}`,
    label: name,
    unit: rawNutrientUnit(fn),
    direction: 'max',
    getValue: (product) => {
      const value = getRawNutrientAmount(product, nutrientCode);
      return value != null && value > 0 ? value : null;
    },
  };
}

function getMicronutrientMetrics(products) {
  const rows = [];
  const seen = new Set();

  for (const group of [
    { label: '비타민', test: isVitaminNutrient },
    { label: '미네랄', test: isMineralNutrient },
  ]) {
    const candidates = [];
    for (const product of products ?? []) {
      for (const fn of product?.foodNutrients ?? []) {
        if (!group.test(fn)) continue;
        if (typeof fn.amount !== 'number' || fn.amount <= 0) continue;
        candidates.push(fn);
      }
    }
    candidates
      .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999))
      .forEach((fn) => {
        const key = `${group.label}:${fn.nutrient_code}`;
        if (seen.has(key)) return;
        seen.add(key);
        rows.push(rawNutrientMetric(fn, group.label));
      });
  }

  return rows;
}

function nutrientMetric(key, label, unit, direction = null, options) {
  return {
    key,
    label,
    unit,
    direction,
    getValue: (product) => valueOf(product, key, options),
  };
}

function proteinMetric(base, baseLabel, unit, mode, modeLabel) {
  return {
    key: mode === 'total' ? base : `${base}_${mode}`,
    label: mode === 'total' ? baseLabel : `${baseLabel} ${modeLabel}`,
    unit,
    direction: 'max',
    getValue: (product) => proteinValue(product, base, mode),
  };
}

const PROTEIN_BASES = [
  { key: 'protein', label: '단백질', unit: 'g' },
  { key: 'eaa', label: 'EAA', unit: 'mg' },
  { key: 'bcaa', label: 'BCAA', unit: 'mg' },
];

const PROTEIN_MODES = [
  { key: 'total', label: '' },
  { key: 'kcal', label: '/100kcal' },
  { key: 'price', label: '/1,000원' },
];

const PROTEIN_DRINK_COMPARE_METRICS = [
  nutrientMetric('calories', '열량', 'kcal', 'min'),
  ...PROTEIN_BASES.flatMap((base) =>
    PROTEIN_MODES.map((mode) =>
      proteinMetric(base.key, base.label, base.unit, mode.key, mode.label))),
  nutrientMetric('carbs', '탄수화물', 'g', 'min'),
  nutrientMetric('fat', '지방', 'g', 'min'),
  nutrientMetric('saturatedFat', '포화지방', 'g', 'min'),
  nutrientMetric('transFat', '트랜스지방', 'g', 'min'),
  nutrientMetric('cholesterol', '콜레스테롤', 'mg', 'min'),
  nutrientMetric('sodium', '나트륨', 'mg', 'min'),
  ...AMINO_ACID_KEYS.map((key) =>
    nutrientMetric(key, AMINO_ACID_LABELS[key] ?? key, 'mg', 'max', { zeroAsMissing: true })),
];

const CATEGORY_COMPARE_METRICS = {
  [PROTEIN_DRINK_CODE]: PROTEIN_DRINK_COMPARE_METRICS,
};

function categoryKeyOf(product) {
  if (product?.categoryCode) return product.categoryCode;
  if (product?.category === PROTEIN_DRINK_LABEL) return PROTEIN_DRINK_CODE;
  return 'default';
}

function uniqueByKey(metrics) {
  const seen = new Set();
  return metrics.filter((metric) => {
    if (seen.has(metric.key)) return false;
    seen.add(metric.key);
    return true;
  });
}

export function getCompareMetricsForProducts(products) {
  if (!Array.isArray(products) || products.length === 0) return DEFAULT_COMPARE_METRICS;

  const metrics = [];
  for (const product of products) {
    const categoryKey = categoryKeyOf(product);
    metrics.push(...(CATEGORY_COMPARE_METRICS[categoryKey] ?? DEFAULT_COMPARE_METRICS));
  }

  return uniqueByKey([...metrics, ...getMicronutrientMetrics(products)]);
}

export function getCompareMetricValue(product, metric) {
  if (typeof metric.getValue === 'function') return metric.getValue(product);
  return valueOf(product, metric.key);
}
