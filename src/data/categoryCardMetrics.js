// 탭(목적) + 서브카테고리 조합으로 리스트 카드 메트릭 결정
// 같은 DB 카테고리(에너지바)도 단백질 보충 vs 식사대용에서 다른 메트릭 표시

const PROTEIN_COMMON = [
  { key: 'calories', label: '칼로리', unit: 'kcal', perVol: true },
  { key: 'protein', label: '단백질', unit: 'g', perVol: true, perKcal: true },
  { key: 'eaa', label: 'EAA', unit: 'mg', perVol: true, perKcal: true },
  { key: 'bcaa', label: 'BCAA', unit: 'mg', perVol: true, perKcal: true },
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

const SHAKE_METRICS = [
  ...MEAL_COMMON,
];

// tabId:subLabel → { metrics, showSweeteners }
// subLabel은 categoryTabs.js의 tab.subs[].label과 일치해야 함 (DB name_ko 변경 반영)
const CONFIG = {
  // 단백질 보충
  'protein:닭가슴살':    { metrics: PROTEIN_COMMON, showSweeteners: false },
  'protein:단백질 음료': { metrics: PROTEIN_COMMON, showSweeteners: false },
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
  'meal:셰이크':           { metrics: SHAKE_METRICS, showSweeteners: true },
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

export function computeMetricValues(food, metric) {
  const n = food.nutrition ?? {};
  const total = n[metric.key];
  if (total === undefined || total === null) return null;
  // 칼로리 제외: 값이 0이면 데이터 없는 것으로 간주하고 숨김
  if (metric.key !== 'calories' && total === 0) return null;

  const servingSize = food.servingSize;
  const cal = n.calories;

  const result = { total: fmt(total), unit: metric.unit, ratios: [] };

  if (metric.perVol && servingSize && servingSize > 0) {
    const per100 = (total / servingSize) * 100;
    const volUnit = food.servingUnit || 'g';
    result.ratios.push({ value: fmt(per100), label: `/100${volUnit}` });
  }

  if (metric.perKcal && cal && cal > 0) {
    const perCal = (total / cal) * 100;
    result.ratios.push({ value: fmt(perCal), label: '/100kcal' });
  }

  return result;
}
