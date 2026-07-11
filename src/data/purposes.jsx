import { CandyOff, Dumbbell, TrendingDown, UtensilsCrossed, Search } from 'lucide-react';

// 탐색 성격(purpose) 메타데이터
// - 식품유형 카테고리는 성격과 무관하게 고정 (FOOD_CATEGORIES)
// - 각 성격은 필터 스펙/강조 수치/리포트 섹션만 다르게 적용

// DB food_type_categories.name_ko 와 일치 (2026-05 기준 11종)
export const FOOD_CATEGORIES = [
  '닭가슴살',
  '단백질 음료',
  '에너지바',
  '기타 가공육',
  '아이스크림',
  '과자/초콜릿/젤리',
  '제로 음료',
  '밥',
  '면',
  '시리얼/그래놀라/오트밀',
  '쉐이크',
];

export const ALLERGEN_FILTER_NOTE =
  '법정 알레르기 표시 대상은 난류(가금류), 우유, 메밀, 땅콩, 대두, 밀, 고등어, 게, 새우, 돼지고기, 복숭아, 토마토, 아황산류(최종제품 SO₂ 10mg/kg 이상), 호두, 닭고기, 쇠고기, 오징어, 조개류(굴·전복·홍합 포함), 잣입니다. 그 외 성분은 데이터가 없어 제외 필터에서 누락될 수 있으니 실제 제품 표시를 확인해 주세요.';

export const PURPOSES = [
  {
    id: 'low_sugar',
    label: '저당/제로슈거',
    Icon: CandyOff,
    highlightMetrics: [
      { key: 'sugar', label: '당류', unit: 'g' },
      { key: 'calories', label: '칼로리', unit: 'kcal' },
      { key: 'carbs', label: '탄수화물', unit: 'g' },
      { key: 'fiber', label: '식이섬유', unit: 'g' },
    ],
    filters: [
      { key: 'sugar', type: 'range', label: '당류(g)', min: 0, max: 20 },
      { key: 'calories', type: 'range', label: '칼로리(kcal)', min: 0, max: 600 },
      { key: 'sweeteners', type: 'tristate', label: '대체당' },
    ],
    reportSections: [
      { id: 'sugar_warning', title: '당류·대체당 분석' },
      { id: 'carb_fiber', title: '탄수화물·식이섬유 균형' },
      { id: 'glucose_fit', title: '저당 적합도' },
    ],
  },
  {
    id: 'protein',
    label: '단백질 보충',
    Icon: Dumbbell,
    highlightMetrics: [
      { key: 'protein', label: '단백질', unit: 'g' },
      { key: 'calories', label: '칼로리', unit: 'kcal' },
      { key: 'bcaa', label: 'BCAA', unit: 'g' },
      { key: 'proteinSource', label: '원료', unit: '' },
    ],
    filters: [
      { key: 'protein', type: 'range', label: '단백질(g)', min: 0, max: 50 },
      { key: 'proteinSources', type: 'tristate', label: '단백질 원료', options: ['WPI', 'WPC', '카제인', '대두', '닭고기', '계란'] },
      { key: 'lactoseFree', type: 'bool', label: '유당 free' },
    ],
    reportSections: [
      { id: 'protein_content', title: '단백질 함량·원료 분석' },
      { id: 'bcaa_profile', title: 'BCAA·아미노산 프로파일' },
      { id: 'post_workout', title: '운동 후 섭취 적합성' },
    ],
  },
  {
    id: 'weight_loss',
    label: '체중감량',
    Icon: TrendingDown,
    highlightMetrics: [
      { key: 'calories', label: '칼로리', unit: 'kcal' },
      { key: 'sugar', label: '당류', unit: 'g' },
      { key: 'carbs', label: '탄수화물', unit: 'g' },
      { key: 'fiber', label: '식이섬유', unit: 'g' },
    ],
    filters: [
      { key: 'calories', type: 'range', label: '칼로리(kcal)', min: 0, max: 600 },
      { key: 'sugar', type: 'range', label: '당류(g)', min: 0, max: 30 },
      { key: 'sweeteners', type: 'tristate', label: '대체당' },
    ],
    reportSections: [
      { id: 'calorie_sugar', title: '칼로리·당류 분석' },
      { id: 'carb_fiber', title: '탄수화물·식이섬유 균형' },
      { id: 'weight_loss_fit', title: '체중감량 적합도' },
    ],
  },
  {
    id: 'meal_replacement',
    label: '식사대용',
    Icon: UtensilsCrossed,
    highlightMetrics: [
      { key: 'calories', label: '칼로리', unit: 'kcal' },
      { key: 'protein', label: '단백질', unit: 'g' },
      { key: 'carbs', label: '탄수화물', unit: 'g' },
      { key: 'fat', label: '지방', unit: 'g' },
    ],
    filters: [
      { key: 'calories', type: 'range', label: '칼로리(kcal)', min: 0, max: 800 },
      { key: 'protein', type: 'range', label: '단백질(g) 이상', min: 0, max: 40 },
      { key: 'allergens', type: 'exclude_only', label: '알레르기 유발 성분', options: ['유당', '대두', '글루텐', '견과류'], note: ALLERGEN_FILTER_NOTE },
    ],
    reportSections: [
      { id: 'meal_balance', title: '한 끼 영양 균형' },
      { id: 'satiety', title: '포만감·식이섬유' },
      { id: 'meal_replacement_fit', title: '식사대용 적합도' },
    ],
  },
];

export const ALL_FILTERS = [
  { key: 'calories', type: 'range', label: '칼로리(kcal)', min: 0, max: 800 },
  { key: 'protein', type: 'range', label: '단백질(g)', min: 0, max: 50 },
  { key: 'carbs', type: 'range', label: '탄수화물(g)', min: 0, max: 80 },
  { key: 'fat', type: 'range', label: '지방(g)', min: 0, max: 30 },
  { key: 'sugar', type: 'range', label: '당류(g)', min: 0, max: 30 },
  { key: 'sweeteners', type: 'tristate', label: '대체당' },
  { key: 'proteinSources', type: 'tristate', label: '단백질 원료', options: ['WPI', 'WPC', '카제인', '대두', '닭고기', '계란'] },
  { key: 'allergens', type: 'exclude_only', label: '알레르기 유발 성분', options: ['유당', '대두', '글루텐', '견과류'], note: ALLERGEN_FILTER_NOTE },
  { key: 'lactoseFree', type: 'bool', label: '유당 free' },
];

export const ALL_PURPOSE = {
  id: 'all',
  label: '전체',
  Icon: Search,
  highlightMetrics: [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'sugar', label: '당류', unit: 'g' },
  ],
  filters: ALL_FILTERS,
  reportSections: [
    { id: 'basic_info', title: '기본 영양 정보' },
  ],
};

export function getPurpose(id) {
  if (!id || id === 'all') return ALL_PURPOSE;
  return PURPOSES.find((p) => p.id === id) ?? ALL_PURPOSE;
}

// 카테고리별 리스트 카드에서 강조할 핵심 영양 지표
// key: nutrition 객체의 필드명 (calories, protein, carbs, sugar, fat, fiber, sodium 등)
export const CATEGORY_KEY_METRICS = {
  '닭가슴살': [
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'fat', label: '지방', unit: 'g' },
    { key: 'sodium', label: '나트륨', unit: 'mg' },
  ],
  '단백질 음료': [
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'sugar', label: '당류', unit: 'g' },
  ],
  '에너지바': [
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'sugar', label: '당류', unit: 'g' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
  ],
  '기타 가공육': [
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'sodium', label: '나트륨', unit: 'mg' },
    { key: 'fat', label: '지방', unit: 'g' },
  ],
  '제로 음료': [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'sugar', label: '당류', unit: 'g' },
  ],
  '과자/초콜릿/젤리': [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'sugar', label: '당류', unit: 'g' },
    { key: 'fat', label: '지방', unit: 'g' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
  ],
  '시리얼/그래놀라/오트밀': [
    { key: 'fiber', label: '식이섬유', unit: 'g' },
    { key: 'sugar', label: '당류', unit: 'g' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
  ],
  '밥': [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'sodium', label: '나트륨', unit: 'mg' },
  ],
  '면': [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'sodium', label: '나트륨', unit: 'mg' },
  ],
  '쉐이크': [
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'sugar', label: '당류', unit: 'g' },
  ],
  '아이스크림': [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'sugar', label: '당류', unit: 'g' },
    { key: 'fat', label: '지방', unit: 'g' },
  ],
};

const DEFAULT_KEY_METRICS = [
  { key: 'calories', label: '칼로리', unit: 'kcal' },
  { key: 'protein', label: '단백질', unit: 'g' },
  { key: 'sugar', label: '당류', unit: 'g' },
  { key: 'fat', label: '지방', unit: 'g' },
];

export function getCategoryMetrics(category) {
  return CATEGORY_KEY_METRICS[category] ?? DEFAULT_KEY_METRICS;
}
