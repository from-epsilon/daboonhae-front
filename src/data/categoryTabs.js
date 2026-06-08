// 3탭 카테고리 구조 — 홈/리스트 페이지 공유
// - 탭 자체는 food_purpose_categories(목적 카테고리, 다대다 링크) 기준
// - 서브 칩은 food_type_categories(식품유형) 기준
//
// 매칭 규칙
// - 1차: food_purpose_categories.name_ko === tab.purposeName 또는 code === tab.purposeCode
// - 폴백: 링크 데이터가 비어있거나 RLS로 막혔을 때 식품유형 코드(food_type_category_code) 기반
//   ※ name_ko는 문구가 바뀔 수 있어(예: '과자/초콜릿/젤리') 매칭은 코드로 한다.
//
// 서브 칩의 code는 DB food_type_categories.code 와 1:1 매칭 (2026-05 기준 11종):
//   chicken_breast 닭가슴살 / protein_drink 단백질 음료 / energy_bar 에너지바 /
//   processed_meat 기타 가공육 / ice_cream 아이스크림 / snack_sweets 과자·초콜릿·젤리 /
//   zero_drink 제로 음료 / rice 밥 / noodle 면 / cereal_granola_oat 시리얼·그래놀라·오트밀 / shake 셰이크
export const CATEGORY_TABS = [
  {
    id: 'protein',
    label: '단백질 보충',
    purposeName: '단백질 보충',
    purposeCode: 'protein_supplement',
    fallbackFit: 'protein',
    subs: [
      { label: '닭가슴살', code: 'chicken_breast' },
      { label: '단백질 음료', code: 'protein_drink' },
      { label: '에너지바', code: 'energy_bar' },
      { label: '기타 가공육', code: 'processed_meat' },
    ],
  },
  {
    id: 'low_sugar',
    label: '저당 간식',
    purposeName: '저당 간식',
    purposeCode: 'low_sugar_snack',
    fallbackFit: 'low_sugar',
    subs: [
      { label: '아이스크림', code: 'ice_cream' },
      { label: '과자/초콜릿/젤리', code: 'snack_sweets' },
      { label: '제로 음료', code: 'zero_drink' },
    ],
  },
  {
    id: 'meal',
    label: '식사 대용',
    purposeName: '식사 대용',
    purposeCode: 'meal_replacement',
    fallbackFit: 'meal_replacement',
    subs: [
      { label: '밥', code: 'rice' },
      { label: '면', code: 'noodle' },
      { label: '시리얼/그래놀라/오트밀', code: 'cereal_granola_oat' },
      { label: '셰이크', code: 'shake' },
      { label: '에너지바', code: 'energy_bar' },
    ],
  },
];

// 식품유형(food_type_categories) 전체 — 리스트에서 목적 탭 없이 칩으로 한 번에 노출
// - tab: 리스트 카드 메트릭(categoryCardMetrics) 결정용 목적 키
// - disabled: 분석 준비중(데이터 미제공) → 칩 비활성화
// ※ 에너지바·기타 가공육은 노출 대상에서 제외
export const FOOD_TYPES = [
  { label: '닭가슴살', code: 'chicken_breast', tab: 'protein' },
  { label: '단백질 음료', code: 'protein_drink', tab: 'protein' },
  { label: '셰이크', code: 'shake', tab: 'meal' },
  { label: '아이스크림', code: 'ice_cream', tab: 'low_sugar' },
  { label: '과자/초콜릿/젤리', code: 'snack_sweets', tab: 'low_sugar' },
  { label: '제로 음료', code: 'zero_drink', tab: 'low_sugar', disabled: true },
  { label: '밥', code: 'rice', tab: 'meal', disabled: true },
  { label: '면', code: 'noodle', tab: 'meal', disabled: true },
  { label: '시리얼/그래놀라/오트밀', code: 'cereal_granola_oat', tab: 'meal', disabled: true },
];

// 분석 완료(활성) 식품유형만 — 리스트 칩 노출용 (준비중 제외)
export const ACTIVE_FOOD_TYPES = FOOD_TYPES.filter((ft) => !ft.disabled);

const FOOD_TYPE_BY_CODE = Object.fromEntries(FOOD_TYPES.map((ft) => [ft.code, ft]));
const FOOD_TYPE_BY_LABEL = Object.fromEntries(FOOD_TYPES.map((ft) => [ft.label, ft]));

// 식품유형 코드/라벨 → FOOD_TYPES 항목 (없으면 null)
export function getFoodTypeByCode(code) {
  return FOOD_TYPE_BY_CODE[code] ?? null;
}
export function getFoodTypeByLabel(label) {
  return FOOD_TYPE_BY_LABEL[label] ?? null;
}

// 탭의 모든 서브 카테고리(food_type) 코드 목록 (중복 제거)
// - 서브가 'all'일 때 1차 필터로 사용
// - 목적 링크가 비어있는 제품을 위한 폴백 매칭에도 활용
export function getTabCodes(tabId) {
  const tab = CATEGORY_TABS.find((t) => t.id === tabId);
  if (!tab) return [];
  return [...new Set(tab.subs.map((s) => s.code))];
}

export function getTab(tabId) {
  return CATEGORY_TABS.find((t) => t.id === tabId) ?? null;
}

// 제품이 탭(목적 카테고리)에 속하는지 판정
// 1) DB 링크(product.purposeCategories) 있으면 그 결과만 사용 — name_ko 또는 code 매칭
// 2) 링크 비어있으면 서브 카테고리(food_type 코드) 기반 폴백
//    (영양값 휴리스틱은 탭 의미와 어긋날 수 있어 폴백 경로에서 제외)
export function productMatchesTab(product, tabId) {
  const tab = getTab(tabId);
  if (!tab) return false;

  const links = product?.purposeCategories;
  if (Array.isArray(links) && links.length > 0) {
    return links.some(
      (pc) => pc?.name === tab.purposeName || pc?.code === tab.purposeCode,
    );
  }

  const tabCodes = getTabCodes(tabId);
  return tabCodes.includes(product?.categoryCode);
}
