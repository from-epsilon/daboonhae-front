import { Salad, Dumbbell, Droplet, UtensilsCrossed, Search } from 'lucide-react';

// 목적(purpose) 메타데이터 일원화
// - 아이콘/라벨/세부 카테고리/필터 스펙/카드·비교에서 강조할 수치/리포트 섹션 키
// - 목적 추가·수정 시 이 파일만 손대면 됨 (UI는 이 메타를 받아 자동으로 다른 모양을 렌더)
// - Icon은 Lucide 컴포넌트(대문자) — 사용처에서 <p.Icon size={...} />로 렌더

export const PURPOSES = [
  {
    id: 'weight_loss',
    label: '체중감량',
    Icon: Salad,
    subCategories: ['샐러드', '저칼로리 도시락', '곤약·면', '제로 음료', '간식'],
    // 카드/비교 행에서 강조할 핵심 수치 (좌 → 우 순서)
    highlightMetrics: [
      { key: 'calories', label: '칼로리', unit: 'kcal' },
      { key: 'sugar', label: '당류', unit: 'g' },
      { key: 'carbs', label: '탄수화물', unit: 'g' },
      { key: 'fiber', label: '식이섬유', unit: 'g' },
    ],
    // 필터 항목 (FilterPanel이 이 스펙대로 자동 렌더)
    filters: [
      { key: 'calories', type: 'range', label: '칼로리(kcal)', min: 0, max: 600 },
      { key: 'sugar', type: 'range', label: '당류(g)', min: 0, max: 30 },
      { key: 'sweeteners', type: 'tristate', label: '대체당', options: ['말티톨', '아스파탐', '수크랄로스', '스테비아', '알룰로스'] },
    ],
    // 분석 리포트 섹션 — id로 analyzer 함수 매칭, title은 UI 표시용
    reportSections: [
      { id: 'calorie_sugar', title: '칼로리·당류 분석' },
      { id: 'carb_fiber', title: '탄수화물·식이섬유 균형' },
      { id: 'weight_loss_fit', title: '체중감량 적합도' },
    ],
  },
  {
    id: 'muscle',
    label: '근성장',
    Icon: Dumbbell,
    subCategories: ['닭가슴살', '프로틴 파우더', '프로틴 드링크', '프로틴 바', '계란·간편식'],
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
    id: 'glucose',
    label: '혈당관리',
    Icon: Droplet,
    subCategories: ['저GI 간식', '제로 음료', '대체당 디저트', '식이섬유 강화'],
    highlightMetrics: [
      { key: 'sugar', label: '당류', unit: 'g' },
      { key: 'sweeteners', label: '대체당', unit: '' },
      { key: 'fiber', label: '식이섬유', unit: 'g' },
      { key: 'carbs', label: '탄수화물', unit: 'g' },
    ],
    filters: [
      { key: 'sugar', type: 'range', label: '당류(g)', min: 0, max: 20 },
      { key: 'sweeteners', type: 'tristate', label: '대체당', options: ['말티톨', '아스파탐', '수크랄로스', '스테비아', '알룰로스'] },
      { key: 'fiber', type: 'range', label: '식이섬유(g) 이상', min: 0, max: 15 },
    ],
    reportSections: [
      { id: 'sugar_warning', title: '당류·대체당 주의 분석' },
      { id: 'fiber_glycemic', title: '식이섬유·혈당 영향' },
      { id: 'glucose_fit', title: '혈당관리 적합도' },
    ],
  },
  {
    id: 'meal_replacement',
    label: '식사대용',
    Icon: UtensilsCrossed,
    subCategories: ['도시락', '쉐이크', '시리얼·그래놀라', '간편 한 끼'],
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

// 목적 미선택 시 사용할 "전체" 모드
// - 카드는 기본 수치만, 필터는 공통 필터만 노출
export const ALL_PURPOSE = {
  id: 'all',
  label: '전체',
  Icon: Search,
  subCategories: [],
  highlightMetrics: [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'sugar', label: '당류', unit: 'g' },
  ],
  filters: [
    { key: 'calories', type: 'range', label: '칼로리(kcal)', min: 0, max: 800 },
  ],
  reportSections: [
    { id: 'basic_info', title: '기본 영양 정보' },
  ],
};

// id로 목적 메타데이터 조회 (없으면 ALL_PURPOSE 반환)
export function getPurpose(id) {
  if (!id || id === 'all') return ALL_PURPOSE;
  return PURPOSES.find((p) => p.id === id) ?? ALL_PURPOSE;
}
