// 비교 페이지용 헬퍼 함수 모음
// - 우수값(best) 인덱스 계산: '높을수록 좋음' / '낮을수록 좋음' 분기
// - 단일 책임 단위로 분리 (테스트 용이 + ComparePage 본문 정리)

// 안전한 숫자 추출 (undefined/null → 기본값)
function pick(product, key) {
  const v = product?.nutrition?.[key];
  return typeof v === 'number' ? v : null;
}

// 모든 값이 동일하면 우수값 강조 의미 없음 → 빈 배열 반환
function allSame(values) {
  const valid = values.filter((v) => v !== null);
  if (valid.length <= 1) return true;
  return valid.every((v) => v === valid[0]);
}

// 우수값 인덱스들 반환 (동률 가능 → 배열)
// - direction: 'max' | 'min'
// - products 중 nutrition.key가 가장 크거나 작은 항목의 index들
export function getBestIndices(products, key, direction = 'max') {
  if (!Array.isArray(products) || products.length < 2) return [];

  const values = products.map((p) => pick(p, key));
  if (allSame(values)) return [];

  // null은 비교 제외
  const reducer = direction === 'max'
    ? (acc, v) => (v !== null && (acc === null || v > acc) ? v : acc)
    : (acc, v) => (v !== null && (acc === null || v < acc) ? v : acc);

  const best = values.reduce(reducer, null);
  if (best === null) return [];

  // 동일값(동률)도 모두 포함
  return values
    .map((v, i) => (v === best ? i : -1))
    .filter((i) => i !== -1);
}

// 자동 비교 한 줄 문장 생성 (1~3 문장)
// - "Compare, don't rank" 톤: A는 X가 많고, B는 Y가 적어요
// - 1위/2위 단어는 절대 쓰지 않음
export function buildCompareSummary(products) {
  if (!products || products.length < 2) return null;

  // 비교 지표 정의: { key, direction, suffix, phraseHigh, phraseLow }
  // - phraseHigh: direction='max' 일 때 표현 ("단백질이 가장 많아요")
  // - phraseLow: direction='min' 일 때 표현 ("칼로리가 가장 낮아요")
  const metrics = [
    { key: 'protein', direction: 'max', phrase: '단백질이 가장 많아요' },
    { key: 'calories', direction: 'min', phrase: '칼로리가 가장 낮아요' },
    { key: 'sugar', direction: 'min', phrase: '당류가 가장 적어요' },
    { key: 'fiber', direction: 'max', phrase: '식이섬유가 가장 풍부해요' },
  ];

  // 각 지표별 우수 제품 1개씩 뽑기 (동률은 첫 번째)
  const sentences = [];
  for (const m of metrics) {
    const indices = getBestIndices(products, m.key, m.direction);
    if (indices.length === 0) continue;
    if (indices.length === products.length) continue; // 전원 동률은 skip
    const winner = products[indices[0]];
    if (!winner) continue;
    sentences.push(`${winner.name}이(가) ${m.phrase}`);
    if (sentences.length >= 3) break;
  }

  return sentences.length > 0 ? sentences : null;
}

// 비교에 노출할 지표 행 정의
// - label: 좌측 sticky 컬럼에 표시
// - key: nutrition.key
// - unit: 셀 우측 단위 표기
// - direction: 'max'(높을수록 좋음) | 'min'(낮을수록 좋음) | null(중립)
// - 중립 지표는 강조 없이 단순 표시 (탄수화물/지방은 목적에 따라 다름)
export const COMPARE_METRICS = [
  { label: '칼로리', key: 'calories', unit: 'kcal', direction: 'min' },
  { label: '단백질', key: 'protein', unit: 'g', direction: 'max' },
  { label: '탄수화물', key: 'carbs', unit: 'g', direction: null },
  { label: '지방', key: 'fat', unit: 'g', direction: null },
  { label: '당류', key: 'sugar', unit: 'g', direction: 'min' },
  { label: '식이섬유', key: 'fiber', unit: 'g', direction: 'max' },
];
