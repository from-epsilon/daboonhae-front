// 3탭 카테고리 구조 — 홈/리스트 페이지 공유
export const CATEGORY_TABS = [
  {
    id: 'protein',
    label: '단백질 보충',
    subs: [
      { label: '닭가슴살', category: '닭가슴살' },
      { label: '단백질 음료', category: '단백질 음료' },
      { label: '단백질바', category: '에너지바' },
    ],
  },
  {
    id: 'low_sugar',
    label: '저당 간식',
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

// 탭의 모든 카테고리 목록 (중복 제거)
export function getTabCategories(tabId) {
  const tab = CATEGORY_TABS.find((t) => t.id === tabId);
  if (!tab) return [];
  return [...new Set(tab.subs.map((s) => s.category))];
}
