// 다분해 데이터 어댑터
// - mockProducts의 raw 제품 데이터를 디자인 시스템(DS) 컴포넌트 형식으로 변환
// - mockProducts.js는 수정하지 않고, 여기서만 매핑/파생 계산을 처리
// - DS 컴포넌트(Score, FoodCard, Badge, MacroRow 등)는 이 어댑터의 출력 형태에 의존

// ============================================================ 점수 매핑

// rankingScore(40~98)을 DS 다분해 점수(0.0~10.0)로 환산
// - 단순 10분의 1 비례 (현재 데이터 범위: 4.0~9.8)
// - 한 자리 소수로 반올림 → DS 컨벤션('점수 한 자리 소수') 일치
export function toDsScore(product) {
  const raw = product?.rankingScore ?? 0;
  return Math.round((raw / 10) * 10) / 10;
}

// 점수 → 강조 컬러 (CSS 변수)
// - DS 규칙: ≥7.0 green, 4.0~6.9 orange, <4.0 red
export function scoreColor(score) {
  if (score >= 7) return 'var(--green-500)';
  if (score >= 4) return 'var(--orange-500)';
  return 'var(--red-500)';
}

// 점수 → 약한 배경 컬러 (배지/배너 배경용)
// - 동일 임계값으로 50 ramp 사용
export function scoreColorSoft(score) {
  if (score >= 7) return 'var(--green-50)';
  if (score >= 4) return 'var(--orange-50)';
  return 'var(--red-50)';
}

// ============================================================ 자동 태그 생성

// 점수 한 자리 소수로 포맷 (DS 컨벤션)
function round1(n) {
  return Math.round(n * 10) / 10;
}

// 단백질 태그 (≥20g): 점수는 protein/2.5, 10 상한
function tagHighProtein(n) {
  if ((n.protein ?? 0) < 20) return null;
  return { v: 'softGreen', label: '고단백' };
}

function tagLowSugar(n) {
  if ((n.sugar ?? Infinity) > 3) return null;
  return { v: 'softGreen', label: '저당' };
}

function tagLowCalorie(n) {
  if ((n.calories ?? Infinity) > 100) return null;
  return { v: 'softGreen', label: '저칼로리' };
}

function tagHighFiber(n) {
  if ((n.fiber ?? 0) < 5) return null;
  return { v: 'softGreen', label: '고섬유' };
}

// 무가당 태그: 감미료 없음 + 당류 ≤1g
function tagNoSugarAdded(ing, n) {
  const sweetenerCount = ing?.sweeteners?.length ?? 0;
  if (sweetenerCount !== 0) return null;
  if ((n.sugar ?? Infinity) > 1) return null;
  return { v: 'softGreen', label: '무가당' };
}

// 유당 free 태그
function tagLactoseFree(ing) {
  if (ing?.lactoseFree !== true) return null;
  return { v: 'softGreen', label: '유당 free' };
}

// 당류 경고 태그 (≥10g)
function tagSugarWarn(n) {
  if ((n.sugar ?? 0) < 10) return null;
  return { v: 'softOrange', label: `당류 ${n.sugar}g` };
}

// 고지방 경고 태그 (≥15g)
function tagFatWarn(n) {
  if ((n.fat ?? 0) < 15) return null;
  return { v: 'softOrange', label: `지방 ${n.fat}g` };
}

// 영양/성분 기반 자동 태그 생성
// - DS 컨벤션: 앞쪽 우선순위 유지, 최대 4개
// - '공식 영양정보' 신뢰 배지는 별도 slot(getTrustBadges)으로 분리 → 강점 많은 제품에서 밀리지 않음
export function getAutoTags(product) {
  const n = product?.nutrition ?? {};
  const ing = product?.ingredients ?? {};

  const rules = [
    tagHighProtein(n),
    tagLowSugar(n),
    tagLowCalorie(n),
    tagHighFiber(n),
    tagNoSugarAdded(ing, n),
    tagLactoseFree(ing),
    tagSugarWarn(n),
    tagFatWarn(n),
  ];

  return rules.filter(Boolean).slice(0, 4);
}

// ============================================================ 신뢰 배지 (trust slot)
// - 자동 태그와 별도 슬롯으로 노출 (FoodCard 썸네일 옆 작은 체크 아이콘 + 텍스트)
// - 현재 47종 모두 식약처/원천 DB 출처라 항상 '공식 영양정보' 1개 반환
//   추후 데이터 다양화 시 product.source 별 분기 추가 예정
export function getTrustBadges(product) {
  // 향후 product.source/품목제조보고번호 유무 등으로 분기 가능
  return [{ v: 'info', label: '공식 영양정보' }];
}

// ============================================================ 매크로 변환

// DS MacroRow 컴포넌트 입력 형식으로 변환
// - sugar/fiber/bcaa는 디테일 표시용이라 여기서는 제외
export function toMacros(product) {
  const n = product?.nutrition ?? {};
  return {
    kcal: n.calories ?? 0,
    protein: n.protein ?? 0,
    carbs: n.carbs ?? 0,
    fat: n.fat ?? 0,
  };
}

// ============================================================ Mock 후기 수
// - PRODUCTS에 review_count 필드가 없어, id 해시 + score를 결합해 결정적 mock 값 생성
// - 동일 id는 항상 동일 값 (렌더마다 흔들리지 않음)
// - 점수가 높을수록 후기수도 약간 더 많음 (자연스러운 분포 시뮬레이션)
// - 추후 PRODUCTS에 review_count 들어오면 이 함수는 제거하고 raw 값을 그대로 쓰면 됨
export function getMockReviewCount(product) {
  const id = product?.id ?? '';
  // 간단 해시: 문자열 코드 합
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  }
  const scoreBoost = Math.round((product?.rankingScore ?? 50) / 10); // 4~10 정도
  // 5 ~ 120 사이로 매핑 (해시 % 100 + 5) + 점수 보정
  return (h % 100) + 5 + scoreBoost;
}

// ============================================================ 통합 어댑터

// DS 컴포넌트(FoodCard 등)가 한 번에 받을 수 있는 형태로 통합
// - 표시용 필드는 DS 키마(thumb/serving/score/tags)로 정규화
// - 디테일/필터링용 원본 필드(purposesFit/ingredients/nutrition)는 보존
export function getAdapted(product) {
  const n = product?.nutrition ?? {};
  const calculatedBcaa = (n.leucine || 0) + (n.isoleucine || 0) + (n.valine || 0);
  const eaa = (n.leucine || 0) + (n.isoleucine || 0) + (n.valine || 0) +
    (n.lysine || 0) + (n.methionine || 0) + (n.phenylalanine || 0) +
    (n.threonine || 0) + (n.tryptophan || 0) + (n.histidine || 0);

  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    thumb: product.thumbnail,
    serving: product.volume,
    servingSize: product._raw?.servingSize ?? null,
    servingUnit: product._raw?.servingUnit ?? '',
    category: product.category,
    categoryCode: product.categoryCode ?? '',
    macros: toMacros(product),
    score: toDsScore(product),
    reviewCount: getMockReviewCount(product),
    tags: getAutoTags(product),
    trustBadges: getTrustBadges(product),
    purposeCategories: product.purposeCategories ?? [],
    purchaseLinks: product.purchaseLinks ?? [],
    purposesFit: product.purposesFit,
    ingredients: product.ingredients,
    nutrition: { ...n, eaa, bcaa: calculatedBcaa || n.bcaa || 0 },
    sweeteners: product.ingredients?.sweeteners ?? [],
  };
}
