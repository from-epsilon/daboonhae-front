import { AMINO_ACID_KEYS, BCAA_KEYS, EAA_AMINO_ACIDS } from './aminoAcids.js';
import { NUTRIENT_GROUP, isNutrientGroup } from './nutrientGroups.js';
import { bestUnitPriceOf } from './purchaseLinks.js';
import {
  formatEfficiencyReferenceValue,
  getProteinDrinkScoreModel,
} from './proteinDrinkScore.js';

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
    supporting: true,
    compact: true,
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

function nutrientMetric(key, label, unit, direction = null, options = {}) {
  return {
    key,
    label,
    unit,
    direction,
    supporting: options.supporting === true,
    detailGroup: options.detailGroup,
    detailLevel: options.detailLevel,
    collapsedVisible: options.collapsedVisible === true,
    getValue: (product) => valueOf(product, key, options),
  };
}

function scoreMetric({
  key,
  label,
  unit = '',
  direction = 'max',
  select,
  formatValue,
  getNote,
  toggleGroup,
}) {
  return {
    key,
    label,
    unit,
    direction,
    toggleGroup,
    getValue: (product) => select(getProteinDrinkScoreModel(product))?.value ?? null,
    getGrade: (product) => select(getProteinDrinkScoreModel(product))?.tier ?? null,
    getTone: (product) => select(getProteinDrinkScoreModel(product))?.tone ?? null,
    getNote: getNote
      ? (product) => getNote(select(getProteinDrinkScoreModel(product)))
      : undefined,
    formatValue,
  };
}

const AMINO_DETAIL_OPTIONS = {
  zeroAsMissing: true,
  supporting: true,
  detailGroup: 'aminoAcids',
};

const PROTEIN_DRINK_AMINO_DETAIL_METRICS = [
  nutrientMetric('eaa', '필수아미노산', 'mg', 'max', {
    ...AMINO_DETAIL_OPTIONS,
    detailLevel: 1,
    collapsedVisible: true,
  }),
  nutrientMetric('bcaa', 'BCAA', 'mg', 'max', {
    ...AMINO_DETAIL_OPTIONS,
    detailLevel: 2,
    collapsedVisible: true,
  }),
  ...EAA_AMINO_ACIDS.map(({ code, label }) => nutrientMetric(
    code,
    label,
    'mg',
    'max',
    {
      ...AMINO_DETAIL_OPTIONS,
      detailLevel: BCAA_KEYS.includes(code) ? 3 : 2,
      collapsedVisible: code === 'leucine',
    },
  )),
];

const PROTEIN_DRINK_COMPARE_METRICS = [
  scoreMetric({
    key: 'proteinDrinkScore',
    label: '추천점수',
    unit: '점',
    select: (model) => model.overall,
    formatValue: (value) => Math.round(value).toLocaleString(),
  }),
  scoreMetric({
    key: 'proteinAmount',
    label: '단백질 총량',
    unit: 'g',
    select: (model) => model.proteinAmount,
  }),
  scoreMetric({
    key: 'aminoQuality',
    label: '아미노산 구성',
    unit: '점',
    select: (model) => model.aminoQuality,
    formatValue: (value) => Math.round(value).toLocaleString(),
    toggleGroup: 'aminoAcids',
  }),
  ...PROTEIN_DRINK_AMINO_DETAIL_METRICS,
  scoreMetric({
    key: 'calorieEfficiency',
    label: '칼로리 효율',
    unit: 'kcal',
    direction: 'min',
    select: (model) => model.calorieEfficiency,
    formatValue: formatEfficiencyReferenceValue,
    getNote: () => '닭가슴살 단백질 20g 기준',
  }),
  scoreMetric({
    key: 'priceEfficiency',
    label: '가성비',
    unit: '원',
    direction: 'min',
    select: (model) => model.priceEfficiency,
    formatValue: formatEfficiencyReferenceValue,
    getNote: (metric) => (
      metric.available ? '닭가슴살 단백질 20g 기준' : '가격 정보 없음'
    ),
  }),
  nutrientMetric('calories', '열량', 'kcal', null, { supporting: true }),
  nutrientMetric('carbs', '탄수화물', 'g', null, { supporting: true }),
  nutrientMetric('sugar', '당류', 'g', null, { supporting: true }),
  nutrientMetric('fat', '지방', 'g', null, { supporting: true }),
  nutrientMetric('sodium', '나트륨', 'mg', null, { supporting: true }),
];

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

  // 서로 다른 평가 프로필의 점수는 직접 비교하지 않는다.
  // 전부 단백질 음료일 때만 단백질 음료 전용 스코어 KPI를 사용한다.
  if (products.every((product) => categoryKeyOf(product) === PROTEIN_DRINK_CODE)) {
    return uniqueByKey([...PROTEIN_DRINK_COMPARE_METRICS, ...getMicronutrientMetrics(products)]);
  }

  return uniqueByKey([...DEFAULT_COMPARE_METRICS, ...getMicronutrientMetrics(products)]);
}

export function getCompareMetricValue(product, metric) {
  if (typeof metric.getValue === 'function') return metric.getValue(product);
  return valueOf(product, metric.key);
}

export function getCompareMetricPresentation(product, metric) {
  const value = getCompareMetricValue(product, metric);
  return {
    value,
    isRich: Boolean(metric.getGrade || metric.getNote),
    supporting: metric.supporting === true,
    grade: typeof metric.getGrade === 'function' ? metric.getGrade(product) : null,
    tone: typeof metric.getTone === 'function' ? metric.getTone(product) : null,
    note: typeof metric.getNote === 'function' ? metric.getNote(product) : null,
    displayValue: value == null
      ? '-'
      : typeof metric.formatValue === 'function'
        ? metric.formatValue(value)
        : null,
  };
}
