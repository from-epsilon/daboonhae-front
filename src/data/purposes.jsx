import { CandyOff, Dumbbell, TrendingDown, UtensilsCrossed, Search } from 'lucide-react';

// 탐색 성격(purpose) 메타데이터
// - 식품유형 카테고리는 성격과 무관하게 고정 (FOOD_CATEGORIES)
// - 각 성격은 필터 스펙/강조 수치/리포트 섹션만 다르게 적용

export const FOOD_CATEGORIES = [
  '시리얼/그래놀라',
  '닭가슴살',
  '에너지바',
  '아이스크림',
  '밥/면류',
  '단백질 음료',
  '소시지/햄',
  '셰이크',
  '과자',
  '제로음료',
];

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
      { key: 'sweeteners', type: 'tristate', label: '대체당', options: ['말티톨', '아스파탐', '수크랄로스', '스테비아', '알룰로스'] },
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
      { key: 'sweeteners', type: 'tristate', label: '대체당', options: ['말티톨', '아스파탐', '수크랄로스', '스테비아', '알룰로스'] },
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
      { key: 'allergens', type: 'tristate', label: '알레르겐', options: ['유당', '대두', '글루텐', '견과류'] },
    ],
    reportSections: [
      { id: 'meal_balance', title: '한 끼 영양 균형' },
      { id: 'satiety', title: '포만감·식이섬유' },
      { id: 'meal_replacement_fit', title: '식사대용 적합도' },
    ],
  },
];

// 전체 모드: 모든 성격의 필터를 합침 (key 기준 중복 제거)
export const ALL_FILTERS = (() => {
  const seen = new Set();
  const result = [];
  for (const p of PURPOSES) {
    for (const f of p.filters) {
      if (!seen.has(f.key)) {
        seen.add(f.key);
        result.push(f);
      }
    }
  }
  return result;
})();

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
