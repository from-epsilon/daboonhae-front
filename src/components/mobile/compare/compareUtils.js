// 비교 페이지용 헬퍼 함수 모음
// - 우수값(best) 인덱스 계산: '높을수록 좋음' / '낮을수록 좋음' 분기
// - 단일 책임 단위로 분리 (테스트 용이 + ComparePage 본문 정리)

// 안전한 숫자 추출 (undefined/null → null)
function pick(product, metricOrKey) {
  const v = typeof metricOrKey?.getValue === 'function'
    ? metricOrKey.getValue(product)
    : product?.nutrition?.[metricOrKey];
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
export function getBestIndices(products, metricOrKey, direction = 'max') {
  if (!Array.isArray(products) || products.length < 2) return [];

  const values = products.map((p) => pick(p, metricOrKey));
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
