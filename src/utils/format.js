// 카드/비교에서 highlightMetric을 표시용 문자열로 변환
// - nutrition[key]가 있으면 숫자+단위, 없으면 ingredients에서 대체값(원료/대체당 등) 추출

export function formatMetric(product, metric) {
  const nutritionValue = product.nutrition?.[metric.key];
  if (nutritionValue !== undefined && nutritionValue !== null && typeof nutritionValue === 'number') {
    return `${nutritionValue}${metric.unit ?? ''}`;
  }

  // 영양수치가 아닌 메트릭들 (원료/대체당 등) 매핑
  if (metric.key === 'proteinSource') {
    const arr = product.ingredients?.proteinSources ?? [];
    return arr.length > 0 ? arr.join(', ') : '-';
  }
  if (metric.key === 'sweeteners') {
    const arr = product.ingredients?.sweeteners ?? [];
    return arr.length > 0 ? arr.join(', ') : '없음';
  }

  return '-';
}
