// 탭(목적) + 서브카테고리 조합으로 리스트 카드 메트릭 결정
// 같은 DB 카테고리(에너지바)도 단백질 보충 vs 식사대용에서 다른 메트릭 표시

const PROTEIN_COMMON = [
  { key: 'calories', label: '칼로리', unit: 'kcal', perVol: true },
  { key: 'protein', label: '단백질', unit: 'g', perVol: true, perKcal: true },
  { key: 'eaa', label: '필수아미노산', unit: 'mg', perVol: true, perKcal: true },
  { key: 'bcaa', label: 'BCAA', unit: 'mg', perVol: true, perKcal: true },
];

// 단백질 음료 — 3단 우선순위 카드
// 1순위: 핵심 단백질 지표 (칼로리 대비 /100kcal + 가격 대비 /1,000원)
// - unitInRatio: 비율값에도 단위 표기 → 총량/칼로리대비/가격대비 형식 통일
const PROTEIN_DRINK_PRIMARY = [
  { key: 'protein', label: '단백질', unit: 'g', perKcal: true, perPrice: true, unitInRatio: true },
  { key: 'eaa', label: '필수아미노산', unit: 'mg', perKcal: true, perPrice: true, unitInRatio: true },
  { key: 'bcaa', label: 'BCAA', unit: 'mg', perKcal: true, perPrice: true, unitInRatio: true },
  { key: 'leucine', label: '류신', unit: 'mg', perKcal: true, perPrice: true, unitInRatio: true },
];

// 3순위: 보조 영양 (작게, 총량만)
const PROTEIN_DRINK_SECONDARY = [
  { key: 'calories', label: '칼로리', unit: 'kcal' },
  { key: 'carbs', label: '탄수화물', unit: 'g' },
  { key: 'sugar', label: '당류', unit: 'g' },
  { key: 'fat', label: '지방', unit: 'g' },
  { key: 'saturatedFat', label: '포화지방', unit: 'g' },
  { key: 'transFat', label: '트랜스지방', unit: 'g' },
  { key: 'sodium', label: '나트륨', unit: 'mg' },
];

const LOW_SUGAR_COMMON = [
  { key: 'calories', label: '칼로리', unit: 'kcal', perVol: true },
  { key: 'sugar', label: '당류', unit: 'g', perVol: true },
  { key: 'carbs', label: '탄수화물', unit: 'g', perVol: true },
  { key: 'fat', label: '지방', unit: 'g', perVol: true },
];

const MEAL_COMMON = [
  { key: 'calories', label: '칼로리', unit: 'kcal', perVol: true },
  { key: 'carbs', label: '탄수화물', unit: 'g', perVol: true },
  { key: 'protein', label: '단백질', unit: 'g', perVol: true },
  { key: 'fat', label: '지방', unit: 'g', perVol: true },
  { key: 'sugar', label: '당류', unit: 'g', perVol: true },
];

const CEREAL_METRICS = [
  { key: 'calories', label: '칼로리', unit: 'kcal', perVol: true },
  { key: 'carbs', label: '탄수화물', unit: 'g', perVol: true },
  { key: 'protein', label: '단백질', unit: 'g', perVol: true },
  { key: 'fat', label: '지방', unit: 'g', perVol: true },
  { key: 'sugar', label: '당류', unit: 'g', perVol: true },
  { key: 'fiber', label: '식이섬유', unit: 'g', perVol: true },
];

// tabId:subLabel → { metrics, showSweeteners }
// subLabel은 categoryTabs.js의 tab.subs[].label과 일치해야 함 (DB name_ko 변경 반영)
const CONFIG = {
  // 단백질 보충
  'protein:닭가슴살':    { metrics: PROTEIN_COMMON, showSweeteners: false },
  // 단백질 음료 — 3단 우선순위(핵심 단백질 지표 → 단백질원 → 보조 영양)
  // 탄단지 비율바·감미료·알레르기·중복 보조영양(SubNutrients)은 숨김
  'protein:단백질 음료': {
    primaryMetrics: PROTEIN_DRINK_PRIMARY,
    showProteinSource: true,
    secondaryMetrics: PROTEIN_DRINK_SECONDARY,
    showSweeteners: false,
    showMacroBar: false,
    showSubNutrients: false,
    // 단백질원·유당Free 등은 상단 구조화 블록(TieredMeta)에서 표시 →
    // 데스크톱 wide의 IngredientDetails는 통째로 생략(중복 방지)
    showIngredientDetails: false,
  },
  'protein:에너지바':    { metrics: PROTEIN_COMMON, showSweeteners: false },
  'protein:기타 가공육':  { metrics: PROTEIN_COMMON, showSweeteners: false },

  // 저당 간식
  'low_sugar:아이스크림':     { metrics: LOW_SUGAR_COMMON, showSweeteners: true },
  'low_sugar:과자/초콜릿/젤리': { metrics: LOW_SUGAR_COMMON, showSweeteners: true },
  'low_sugar:제로 음료':      { metrics: [], showSweeteners: true },

  // 식사대용
  'meal:밥':              { metrics: MEAL_COMMON, showSweeteners: false },
  'meal:면':              { metrics: MEAL_COMMON, showSweeteners: false },
  'meal:시리얼/그래놀라/오트밀': { metrics: CEREAL_METRICS, showSweeteners: false },
  'meal:셰이크': {
    metrics: [],
    showProteinSource: true,
    showSweetenerMeta: true,
    showSweeteners: false,
    macroBarVariant: 'mini',
    purchasePricePer: 'serving',
    titleVariant: 'size',
    servingMetaVariant: 'explicit',
    showServingCalories: true,
    showSubNutrients: false,
    showIngredientDetails: false,
  },
  'meal:에너지바':          { metrics: MEAL_COMMON, showSweeteners: false },
};

// tabId 기반 기본 폴백
const TAB_DEFAULTS = {
  protein:   { metrics: PROTEIN_COMMON, showSweeteners: false },
  low_sugar: { metrics: LOW_SUGAR_COMMON, showSweeteners: true },
  meal:      { metrics: MEAL_COMMON, showSweeteners: false },
};

const GLOBAL_DEFAULT = {
  metrics: [
    { key: 'calories', label: '칼로리', unit: 'kcal', perVol: true },
    { key: 'protein', label: '단백질', unit: 'g', perVol: true },
    { key: 'sugar', label: '당류', unit: 'g', perVol: true },
  ],
  showSweeteners: false,
};

export function getCategoryCardConfig(tabId, subLabel) {
  if (tabId && subLabel) {
    const key = `${tabId}:${subLabel}`;
    if (CONFIG[key]) return CONFIG[key];
  }
  if (tabId && TAB_DEFAULTS[tabId]) return TAB_DEFAULTS[tabId];
  return GLOBAL_DEFAULT;
}

// ============================================================ 목적별 추천 카드(홈)
// 목적에서 가장 중요한 성분 순서로 최대 3개 — 추천 슬라이더/그리드 미니 카드용
const PURPOSE_HIGHLIGHTS = {
  protein: [
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'bcaa', label: 'BCAA', unit: 'mg' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
  ],
  low_sugar: [
    { key: 'sugar', label: '당류', unit: 'g' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
  ],
  meal: [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
  ],
};

export function getPurposeHighlightMetrics(tabId) {
  return PURPOSE_HIGHLIGHTS[tabId] ?? GLOBAL_DEFAULT.metrics;
}

// 추천 카드용 표시값 — 총량만 (비율 없음)
// - 값 없으면 null. 칼로리 외 0은 데이터 누락으로 간주해 숨김 (computeMetricValues와 동일 규칙)
// - 단, 당류 0은 저당 맥락에서 핵심 정보라 표시
export function getHighlightValue(food, metric) {
  const v = food?.nutrition?.[metric.key];
  if (v === undefined || v === null || isNaN(v)) return null;
  if (v === 0 && metric.key !== 'calories' && metric.key !== 'sugar') return null;
  return { num: fmt(v), unit: metric.unit };
}

// 비율 계산
function fmt(v) {
  if (v === null || v === undefined || isNaN(v)) return '-';
  return v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
}

// 천단위 콤마 포함 표기 (가격 대비 함량용)
function fmtComma(v) {
  if (v === null || v === undefined || isNaN(v)) return '-';
  const r = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
  return r.toLocaleString();
}

// 개당 최저가(원) — purchaseLinks 중 유효 오퍼의 최저 단가
// - 단가 = price / quantity (PurchaseOffers의 unitPriceOf와 동일 규칙)
export function cheapestUnitPrice(food) {
  const offers = food?.purchaseLinks ?? [];
  let best = Infinity;
  for (const o of offers) {
    if (!o || o.is_active === false || typeof o.price !== 'number') continue;
    const qty = Number(o.quantity ?? 1);
    const unit = Number.isFinite(qty) && qty > 0 ? o.price / qty : o.price;
    if (unit < best) best = unit;
  }
  return best === Infinity ? null : best;
}

export function computeMetricValues(food, metric) {
  const n = food.nutrition ?? {};
  const total = n[metric.key];
  if (total === undefined || total === null) return null;
  // 칼로리 제외: 값이 0이면 데이터 없는 것으로 간주하고 숨김
  if (metric.key !== 'calories' && total === 0) return null;

  const servingSize = food.servingSize;
  const cal = n.calories;

  const result = { total: fmt(total), unit: metric.unit, ratios: [] };

  // ratios 항목은 표시 문자열(value) + 숫자/단위 분리(num/unit)를 함께 제공
  // (인라인 렌더는 value, 표 렌더는 num/unit으로 단위를 작게 표기)
  if (metric.perVol && servingSize && servingSize > 0) {
    const per100 = (total / servingSize) * 100;
    const volUnit = food.servingUnit || 'g';
    result.ratios.push({ value: fmt(per100), label: `/100${volUnit}`, num: fmt(per100), unit: metric.unit });
  }

  if (metric.perKcal && cal && cal > 0) {
    const perCal = (total / cal) * 100;
    const num = metric.unitInRatio ? fmtComma(perCal) : fmt(perCal);
    const val = metric.unitInRatio ? `${num}${metric.unit}` : num;
    result.ratios.push({ value: val, label: '/100kcal', num, unit: metric.unit });
  }

  // 가격 대비 — 1,000원당 함량 (개당 최저가 기준, 높을수록 가성비 ↑)
  if (metric.perPrice) {
    const unitPrice = cheapestUnitPrice(food);
    if (unitPrice && unitPrice > 0) {
      const per1000 = (total / unitPrice) * 1000;
      const num = fmtComma(per1000);
      result.ratios.push({ value: `${num}${metric.unit}`, label: '/1,000원', num, unit: metric.unit });
    }
  }

  return result;
}
