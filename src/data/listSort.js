// 리스트 정렬 — 카테고리별 정렬 옵션·기준 통합 (데스크톱/모바일 공용)
// - 단백질 음료는 단백질/필수아미노산(EAA)/BCAA × 총량·칼로리대비·가격대비 전용 9종
// - 그 외 카테고리는 공통 기본 옵션(당류/탄수화물 등)
// - 정렬값은 카드 메트릭(computeMetricValues)과 동일한 기준(칼로리/가격 대비)으로 산출
import { cheapestUnitPrice } from './categoryCardMetrics.js';
import { computeEaa, computeBcaa } from './aminoAcids.js';

const PROTEIN_DRINK_CATEGORY = '단백질 음료';

// 공통 기본 정렬 옵션 (단백질 음료 외 전 카테고리)
const DEFAULT_SORT_OPTIONS = [
  { key: 'default', label: '기본 정렬', short: '기본 정렬' },
  { key: 'calories_asc', label: '칼로리 낮은 순', short: '저칼로리순' },
  { key: 'protein_desc', label: '단백질 높은 순', short: '고단백순' },
  { key: 'carbs_asc', label: '탄수화물 낮은 순', short: '저탄수순' },
  { key: 'sugar_asc', label: '당류 낮은 순', short: '저당순' },
];

// 카테고리별 비노출 옵션 (의미 없는 정렬 숨김)
const HIDE_BY_CATEGORY = {
  '제로 음료': ['protein_desc', 'carbs_asc'],
  '아이스크림': ['protein_desc'],
  '셰이크': ['carbs_asc'],
};

// 단백질 음료 추천순 키 — 2축 그리드 위에 별도 노출(기본 선택)
export const PROTEIN_SORT_RECOMMEND = 'recommend';

// 단백질 음료 전용 2축 — 정렬 키는 `${base}_${mode}` 조합 (예: eaa_kcal)
// - 성분(base) × 기준(mode)을 각각 한 개씩 골라 조합 (UI: 2열 단일선택 그리드)
export const PROTEIN_SORT_MODES = [
  { key: 'total', label: '총량 기준' },
  { key: 'kcal', label: '100kcal 기준' },
  { key: 'price', label: '1,000원 기준' },
];
export const PROTEIN_SORT_BASES = [
  { key: 'protein', label: '단백질' },
  { key: 'eaa', label: '필수아미노산' },
  { key: 'bcaa', label: 'BCAA' },
];

export function isProteinDrinkCategory(category) {
  return category === PROTEIN_DRINK_CATEGORY;
}

// 성분·기준 → 정렬 키
export function makeProteinSortKey(base, mode) {
  return `${base}_${mode}`;
}

// 정렬 키 → { base, mode } (base/mode에 '_'가 없어 lastIndexOf로 안전 분리)
export function splitProteinSortKey(key) {
  const sep = (key ?? '').lastIndexOf('_');
  if (sep < 0) return { base: PROTEIN_SORT_BASES[0].key, mode: PROTEIN_SORT_MODES[0].key };
  return { base: key.slice(0, sep), mode: key.slice(sep + 1) };
}

// 조합 정렬 키 → 라벨 조각 { modeLabel, baseLabel } (기준/성분 색 구분 렌더용)
// - 추천순·미지정 등 조합이 아니면 null
export function getProteinSortParts(sortKey) {
  if (typeof sortKey !== 'string' || !sortKey.includes('_')) return null;
  const { base, mode } = splitProteinSortKey(sortKey);
  const m = PROTEIN_SORT_MODES.find((x) => x.key === mode);
  const b = PROTEIN_SORT_BASES.find((x) => x.key === base);
  if (!m || !b) return null;
  return { modeLabel: m.label, baseLabel: b.label };
}

// 단백질 음료 전용 정렬 옵션 — 추천순 + (기준 × 성분) 9종
// 라벨 형식: "{기준} {성분} 높은 순" (예: 100kcal당 BCAA 높은 순)
export const PROTEIN_DRINK_SORT_OPTIONS = [
  { key: PROTEIN_SORT_RECOMMEND, label: '추천순', short: '추천순' },
  ...PROTEIN_SORT_BASES.flatMap((b) =>
    PROTEIN_SORT_MODES.map((m) => ({
      key: makeProteinSortKey(b.key, m.key),
      label: `${m.label} ${b.label} 높은 순`,
      short: `${m.label} ${b.label}`,
    }))),
];

// 카테고리(서브 라벨) → 노출할 정렬 옵션 목록
export function getSortOptions(category) {
  if (category === PROTEIN_DRINK_CATEGORY) return PROTEIN_DRINK_SORT_OPTIONS;
  if (!category || category === 'all' || category === '전체') return DEFAULT_SORT_OPTIONS;
  const hidden = HIDE_BY_CATEGORY[category];
  if (!hidden) return DEFAULT_SORT_OPTIONS;
  return DEFAULT_SORT_OPTIONS.filter((o) => !hidden.includes(o.key));
}

// 현재 정렬 키가 해당 카테고리 옵션에 없으면 첫 옵션으로 보정
// (예: 단백질 음료에는 '기본 정렬'이 없어 첫 옵션 = 단백질 총량으로 정렬됨)
export function resolveSortKey(category, sortKey) {
  const options = getSortOptions(category);
  return options.some((o) => o.key === sortKey) ? sortKey : options[0].key;
}

// 정렬 키 → 전체 라벨 (드롭다운/시트 표시용)
export function getSortLabel(category, sortKey) {
  const options = getSortOptions(category);
  const cur = options.find((o) => o.key === sortKey) ?? options[0];
  return cur.label;
}

// 정렬 키 → 짧은 라벨 (모바일 액션바 표시용)
export function getSortShortLabel(category, sortKey) {
  const options = getSortOptions(category);
  const cur = options.find((o) => o.key === sortKey) ?? options[0];
  return cur.short ?? cur.label;
}

// ── 단백질 음료 정렬값 — 클수록 상위, 데이터 없으면 -Infinity로 맨 뒤
function proteinDrinkValue(food, sortKey) {
  const n = food?.nutrition ?? {};
  const sep = sortKey.lastIndexOf('_');
  const base = sortKey.slice(0, sep); // protein | eaa | bcaa
  const mode = sortKey.slice(sep + 1); // total | kcal | price

  let total;
  if (base === 'protein') total = n.protein ?? 0;
  else if (base === 'eaa') total = computeEaa(n);
  else if (base === 'bcaa') total = computeBcaa(n);
  else return -Infinity;

  if (!(total > 0)) return -Infinity;
  if (mode === 'total') return total;
  if (mode === 'kcal') {
    const cal = n.calories;
    return cal > 0 ? (total / cal) * 100 : -Infinity; // 100kcal당 함량
  }
  if (mode === 'price') {
    const unitPrice = cheapestUnitPrice(food);
    return unitPrice > 0 ? (total / unitPrice) * 1000 : -Infinity; // 1,000원당 함량
  }
  return -Infinity;
}

export function getProteinDrinkRecommendScore(food) {
  const score = food?.recommendationScores?.proteinDrinkDefault?.score;
  return Number.isFinite(score) ? score : null;
}

export function getProteinDrinkRecommendConfidence(food) {
  const confidence = food?.recommendationScores?.proteinDrinkDefault?.confidence;
  return Number.isFinite(confidence) ? confidence : 0;
}

function compareProteinRecommend(a, b) {
  const scoreA = getProteinDrinkRecommendScore(a);
  const scoreB = getProteinDrinkRecommendScore(b);
  const scoreDiff = (scoreB ?? -Infinity) - (scoreA ?? -Infinity);
  if (scoreDiff !== 0) return scoreDiff;

  const confidenceDiff = getProteinDrinkRecommendConfidence(b) - getProteinDrinkRecommendConfidence(a);
  if (confidenceDiff !== 0) return confidenceDiff;

  const idDiff = Number(a?.id) - Number(b?.id);
  if (Number.isFinite(idDiff) && idDiff !== 0) return idDiff;

  return String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'ko');
}

// 정렬 적용 — 카테고리별 기준 분기 (raw 제품 배열 입력)
export function applySort(products, category, sortKey) {
  const key = resolveSortKey(category, sortKey);
  const arr = [...products];

  // 단백질 음료 — 추천순은 단백질 음료 전용 종합 점수, 그 외는 단백질/EAA/BCAA 기준 내림차순
  if (category === PROTEIN_DRINK_CATEGORY) {
    if (key === PROTEIN_SORT_RECOMMEND) return arr.sort(compareProteinRecommend);
    return arr.sort((a, b) => proteinDrinkValue(b, key) - proteinDrinkValue(a, key));
  }

  switch (key) {
    case 'calories_asc':
      return arr.sort((a, b) => (a.nutrition.calories ?? 0) - (b.nutrition.calories ?? 0));
    case 'protein_desc':
      return arr.sort((a, b) => (b.nutrition.protein ?? 0) - (a.nutrition.protein ?? 0));
    case 'carbs_asc':
      return arr.sort((a, b) => (a.nutrition.carbs ?? 0) - (b.nutrition.carbs ?? 0));
    case 'sugar_asc':
      return arr.sort((a, b) => (a.nutrition.sugar ?? 0) - (b.nutrition.sugar ?? 0));
    default:
      return arr;
  }
}
