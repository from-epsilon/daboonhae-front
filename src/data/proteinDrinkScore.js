import { AMINO_ACID_LABELS } from './aminoAcids.js';

export const PROTEIN_DRINK_SCORE_PROFILE = 'protein_drink_default_v1';

export const PROTEIN_GRADE_ROWS = [
  { range: '0~4.9g', grade: 'D', label: '매우 낮음' },
  { range: '5~9.9g', grade: 'C', label: '낮음' },
  { range: '10~15.9g', grade: 'B', label: '보조 수준' },
  { range: '16~19.9g', grade: 'B+', label: '기준 근접' },
  { range: '20~23.9g', grade: 'A-', label: '기준 충족' },
  { range: '24~27.9g', grade: 'A', label: '충분함' },
  { range: '28~31.9g', grade: 'A+', label: '높은 편' },
  { range: '32~39.9g', grade: 'S', label: '매우 높음' },
  { range: '40g 이상', grade: 'S+', label: '초고함량' },
];

export const AMINO_QUALITY_GRADE_ROWS = [
  { range: '145+', grade: 'S+', label: '최상위' },
  { range: '140~144', grade: 'S', label: '매우 우수' },
  { range: '130~139', grade: 'A+', label: '우수' },
  { range: '115~129', grade: 'A', label: '높은 편' },
  { range: '100~114', grade: 'A-', label: '기준 충족' },
  { range: '90~99', grade: 'B+', label: '기준 근접' },
  { range: '80~89', grade: 'B', label: '일부 부족' },
  { range: '70~79', grade: 'C', label: '부족' },
  { range: '50~69', grade: 'D', label: '많이 부족' },
  { range: '50 미만', grade: 'F', label: '매우 부족' },
];

export const CALORIE_EFFICIENCY_GRADE_ROWS = [
  { range: '85kcal 이하', grade: 'S+', label: '최상위 열량 효율' },
  { range: '86~95kcal', grade: 'S', label: '매우 우수' },
  { range: '96~105kcal', grade: 'A+', label: '우수' },
  { range: '106~115kcal', grade: 'A', label: '높은 편' },
  { range: '116~130kcal', grade: 'A-', label: '양호' },
  { range: '131~155kcal', grade: 'B+', label: '보통 이상' },
  { range: '156~180kcal', grade: 'B', label: '보통' },
  { range: '181~300kcal', grade: 'C', label: '낮은 편' },
  { range: '301kcal 이상', grade: 'D', label: '낮음' },
];

export const PRICE_EFFICIENCY_GRADE_ROWS = [
  { range: '1,100원 이하', grade: 'S+', label: '최상위 가성비' },
  { range: '1,101~1,200원', grade: 'S', label: '매우 우수' },
  { range: '1,201~1,300원', grade: 'A+', label: '우수' },
  { range: '1,301~1,450원', grade: 'A', label: '높은 편' },
  { range: '1,451~1,650원', grade: 'A-', label: '양호' },
  { range: '1,651~2,000원', grade: 'B+', label: '보통 이상' },
  { range: '2,001~3,000원', grade: 'B', label: '보통' },
  { range: '3,001~5,000원', grade: 'C', label: '낮은 편' },
  { range: '5,001원 이상', grade: 'D', label: '낮음' },
];

export const CHICKEN_BREAST_AMINO_REFERENCE_FACTOR = 1.24;

const LIMITING_AMINO_LABELS = {
  ...AMINO_ACID_LABELS,
  sulfur_amino_acids: 'SAA',
  sulfur: 'SAA',
  saa: 'SAA',
  aromatic_amino_acids: 'AAA',
  aromatic: 'AAA',
  aaa: 'AAA',
};

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstDefined(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) return object[key];
  }
  return null;
}

export function tierTone(tier) {
  const key = String(tier ?? '').toUpperCase();
  if (key === 'S+' || key === 'S' || key === 'A+') return 'very-high';
  if (key === 'A') return 'high';
  if (key === 'A-') return 'strong';
  if (key === 'B+') return 'solid';
  if (key === 'B') return 'near';
  if (key === 'C') return 'light';
  if (key === 'D' || key === 'F') return 'poor';
  return 'caution';
}

export function proteinAmountTier(value) {
  const protein = finiteNumber(value);
  if (protein == null || protein < 0) return 'N/A';
  if (protein < 5) return 'D';
  if (protein < 10) return 'C';
  if (protein < 16) return 'B';
  if (protein < 20) return 'B+';
  if (protein < 24) return 'A-';
  if (protein < 28) return 'A';
  if (protein < 32) return 'A+';
  if (protein < 40) return 'S';
  return 'S+';
}

export function aminoQualityTier(value) {
  const score = finiteNumber(value);
  if (score == null || score <= 0) return 'N/A';
  if (score < 50) return 'F';
  if (score < 70) return 'D';
  if (score < 80) return 'C';
  if (score < 90) return 'B';
  if (score < 100) return 'B+';
  if (score < 115) return 'A-';
  if (score < 130) return 'A';
  if (score < 140) return 'A+';
  if (score < 145) return 'S';
  return 'S+';
}

function per20gProtein(value, protein) {
  const amount = finiteNumber(value);
  const proteinAmount = finiteNumber(protein);
  if (amount == null || proteinAmount == null || amount <= 0 || proteinAmount <= 0) return null;
  return (amount * 20) / proteinAmount;
}

export function chickenEquivalentCalorieTier(value) {
  const number = finiteNumber(value);
  if (number == null || number <= 0) return 'N/A';
  const displayedValue = Math.round(number);
  if (displayedValue <= 85) return 'S+';
  if (displayedValue <= 95) return 'S';
  if (displayedValue <= 105) return 'A+';
  if (displayedValue <= 115) return 'A';
  if (displayedValue <= 130) return 'A-';
  if (displayedValue <= 155) return 'B+';
  if (displayedValue <= 180) return 'B';
  if (displayedValue <= 300) return 'C';
  return 'D';
}

export function chickenEquivalentPriceTier(value) {
  const number = finiteNumber(value);
  if (number == null || number <= 0) return 'N/A';
  const displayedValue = Math.round(number);
  if (displayedValue <= 1100) return 'S+';
  if (displayedValue <= 1200) return 'S';
  if (displayedValue <= 1300) return 'A+';
  if (displayedValue <= 1450) return 'A';
  if (displayedValue <= 1650) return 'A-';
  if (displayedValue <= 2000) return 'B+';
  if (displayedValue <= 3000) return 'B';
  if (displayedValue <= 5000) return 'C';
  return 'D';
}

export function formatEfficiencyReferenceValue(value) {
  const number = finiteNumber(value);
  if (number == null) return null;
  return Math.round(number).toLocaleString();
}

function normalizeAminoKey(value) {
  return String(value ?? '').trim().toLowerCase();
}

const LIMITING_AMINO_KEYS = new Map([
  ...Object.entries(AMINO_ACID_LABELS).flatMap(([key, label]) => [
    [normalizeAminoKey(key), key],
    [normalizeAminoKey(label), key],
  ]),
  ['saa', 'saa'],
  ['sulfur', 'saa'],
  ['sulfur_amino_acids', 'saa'],
  ['aaa', 'aaa'],
  ['aromatic', 'aaa'],
  ['aromatic_amino_acids', 'aaa'],
]);

function canonicalAminoKey(value) {
  const normalized = normalizeAminoKey(value);
  return LIMITING_AMINO_KEYS.get(normalized) ?? normalized;
}

function limitingAminoKey(item) {
  const value = typeof item === 'string'
    ? item
    : item?.code ?? item?.key ?? item?.name ?? item?.label;
  return canonicalAminoKey(value);
}

function limitingScoreKeys(key) {
  const candidates = new Set([key]);
  if (['saa', 'sulfur', 'methionine', 'cysteine'].includes(key)) {
    candidates.add('sulfur_amino_acids');
    candidates.add('sulfur');
  }
  if (['aaa', 'aromatic', 'phenylalanine', 'tyrosine'].includes(key)) {
    candidates.add('aromatic_amino_acids');
    candidates.add('aromatic');
  }
  return candidates;
}

export function getLimitingAminoSummary(items, scoreItems) {
  const primary = (Array.isArray(items) ? items : []).find((item) => limitingAminoKey(item));
  const key = limitingAminoKey(primary);
  if (!key) return null;

  const normalizedScores = (Array.isArray(scoreItems) ? scoreItems : [])
    .map((item) => ({
      key: canonicalAminoKey(item?.key ?? item?.code ?? item?.name ?? item?.label),
      labelKey: canonicalAminoKey(item?.label),
      score: finiteNumber(item?.score),
    }))
    .filter((item) => item.key || item.labelKey);
  const scoreIndex = new Map();
  for (const item of normalizedScores) {
    if (item.key) scoreIndex.set(item.key, item.score);
    if (item.labelKey) scoreIndex.set(item.labelKey, item.score);
  }
  const primaryScore = [...limitingScoreKeys(key)]
    .map((candidate) => scoreIndex.get(candidate))
    .find((score) => score != null);
  if (primaryScore != null && primaryScore > 100) return null;

  const deficientCount = new Set(
    normalizedScores
      .filter((item) => item.score != null && item.score < 100)
      .map((item) => item.key || item.labelKey),
  ).size;
  const label = LIMITING_AMINO_LABELS[key] ?? key;
  return `${label}${deficientCount > 1 ? ' 등' : ''}`;
}

export function getProteinDrinkScoreModel(product) {
  const snapshot = product?.recommendationScores?.proteinDrinkDefault ?? null;
  const core = snapshot?.components?.core ?? {};
  const amino = snapshot?.components?.amino_acids ?? snapshot?.components?.aminoAcids ?? {};
  const proteinValue = finiteNumber(product?.nutrition?.protein);
  const proteinTier = firstDefined(core, 'protein_amount_tier', 'proteinAmountTier') || proteinAmountTier(proteinValue);
  const aminoValue = finiteNumber(firstDefined(amino, 'quality_score', 'qualityScore'));
  const aminoFactor =
    finiteNumber(firstDefined(core, 'amino_quality_factor', 'aminoQualityFactor'))
    ?? (aminoValue == null ? null : aminoValue / 100);
  const coreValues = core?.values ?? {};
  const efficiencyProteinValue =
    finiteNumber(firstDefined(coreValues, 'serving_g', 'servingG')) ?? proteinValue;
  const rawCaloriePer20g =
    finiteNumber(firstDefined(core, 'kcal_per_20g_protein', 'kcalPer20gProtein'))
    ?? per20gProtein(firstDefined(coreValues, 'kcal', 'calories'), efficiencyProteinValue)
    ?? per20gProtein(product?.nutrition?.calories, proteinValue);
  const calorieValue =
    finiteNumber(firstDefined(
      core,
      'chicken_protein_20g_equivalent_kcal',
      'chickenProtein20gEquivalentKcal',
    ))
    ?? (
      rawCaloriePer20g != null && aminoFactor != null && aminoFactor > 0
        ? rawCaloriePer20g * CHICKEN_BREAST_AMINO_REFERENCE_FACTOR / aminoFactor
        : null
    );
  const calorieTier =
    firstDefined(
      core,
      'chicken_protein_20g_equivalent_kcal_tier',
      'chickenProtein20gEquivalentKcalTier',
    )
    || chickenEquivalentCalorieTier(calorieValue);
  const priceBasis = firstDefined(core, 'price_factor_basis', 'priceFactorBasis');
  const rawPricePer20g =
    finiteNumber(firstDefined(core, 'price_per_20g_protein', 'pricePer20gProtein'))
    ?? per20gProtein(firstDefined(coreValues, 'unit_price_krw', 'unitPriceKrw'), efficiencyProteinValue);
  const rawPriceValue =
    finiteNumber(firstDefined(
      core,
      'chicken_protein_20g_equivalent_price_krw',
      'chickenProtein20gEquivalentPriceKrw',
    ))
    ?? (
      rawPricePer20g != null && aminoFactor != null && aminoFactor > 0
        ? rawPricePer20g * CHICKEN_BREAST_AMINO_REFERENCE_FACTOR / aminoFactor
        : null
    );
  const rawPriceTier =
    firstDefined(
      core,
      'chicken_protein_20g_equivalent_price_tier',
      'chickenProtein20gEquivalentPriceTier',
    )
    || chickenEquivalentPriceTier(rawPriceValue);
  const hasPriceBasis = Boolean(priceBasis)
    && !String(priceBasis).startsWith('missing_price_neutral_');
  const priceMeasured = hasPriceBasis && rawPriceValue != null && Boolean(rawPriceTier);
  const aminoScoreItems = amino?.amino_acid_scores ?? amino?.aminoAcidScores ?? [];

  return {
    snapshot,
    overall: {
      value: finiteNumber(snapshot?.score),
      confidence: finiteNumber(snapshot?.confidence),
    },
    proteinAmount: {
      value: proteinValue,
      tier: proteinTier || 'N/A',
      tone: tierTone(proteinTier),
    },
    aminoQuality: {
      value: aminoValue,
      tier: aminoQualityTier(aminoValue),
      tone: tierTone(aminoQualityTier(aminoValue)),
      limiting: getLimitingAminoSummary(
        amino?.limiting_amino_acids ?? amino?.limitingAminoAcids,
        aminoScoreItems,
      ),
      scoreItems: aminoScoreItems,
    },
    calorieEfficiency: {
      value: calorieTier ? calorieValue : null,
      tier: calorieTier || 'N/A',
      tone: tierTone(calorieTier),
    },
    priceEfficiency: {
      value: priceMeasured ? rawPriceValue : null,
      tier: priceMeasured ? rawPriceTier : 'N/A',
      tone: priceMeasured ? tierTone(rawPriceTier) : 'caution',
      basis: priceBasis,
      available: priceMeasured,
    },
  };
}
