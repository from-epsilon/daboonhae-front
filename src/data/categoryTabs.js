// 3탭 카테고리 구조 — 홈/리스트 페이지 공유
// - 탭 자체는 food_purpose_categories(목적 카테고리, 다대다 링크) 기준
// - 서브 칩은 food_type_categories(식품유형) 기준
//
// 매칭 규칙
// - 1차: food_purpose_categories.name_ko === tab.purposeName 또는 code === tab.purposeCode
// - 폴백: 링크 데이터가 비어있을 때만 product.purposesFit(영양값 휴리스틱) 사용
export const CATEGORY_TABS = [
  {
    id: 'protein',
    label: '단백질 보충',
    purposeName: '단백질 보충',
    purposeCode: 'protein_supplement',
    fallbackFit: 'protein',
    subs: [
      { label: '닭가슴살', category: '닭가슴살' },
      { label: '단백질 음료', category: '단백질 음료' },
      { label: '단백질바', category: '에너지바' },
    ],
  },
  {
    id: 'low_sugar',
    label: '저당 간식',
    purposeName: '저당 간식',
    purposeCode: 'low_sugar_snack',
    fallbackFit: 'low_sugar',
    subs: [
      { label: '아이스크림', category: '아이스크림' },
      { label: '과자', category: '과자' },
      { label: '젤리', category: '젤리' },
      { label: '제로 음료', category: '제로 음료' },
    ],
  },
  {
    id: 'meal',
    label: '식사 대용',
    purposeName: '식사 대용',
    purposeCode: 'meal_replacement',
    fallbackFit: 'meal_replacement',
    subs: [
      { label: '밥', category: '밥/면류' },
      { label: '면', category: '밥/면류' },
      { label: '시리얼', category: '시리얼/그래놀라' },
      { label: '그래놀라', category: '시리얼/그래놀라' },
      { label: '쉐이크', category: '셰이크' },
      { label: '단백질바', category: '에너지바' },
    ],
  },
];

// 탭의 모든 서브 카테고리(food_type) 목록 (중복 제거)
// - 서브가 'all'일 때 1차 필터로 사용
// - 목적 링크가 비어있는 제품을 위한 폴백 매칭에도 활용
export function getTabCategories(tabId) {
  const tab = CATEGORY_TABS.find((t) => t.id === tabId);
  if (!tab) return [];
  return [...new Set(tab.subs.map((s) => s.category))];
}

export function getTab(tabId) {
  return CATEGORY_TABS.find((t) => t.id === tabId) ?? null;
}

// 제품이 탭(목적 카테고리)에 속하는지 판정
// 1) DB 링크(product.purposeCategories) 있으면 그 결과만 사용 — name_ko 또는 code 매칭
// 2) 링크 비어있으면 서브 카테고리(food_type) 기반 폴백 — 기존 동작 유지
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

  const tabCats = getTabCategories(tabId);
  return tabCats.includes(product?.category);
}
