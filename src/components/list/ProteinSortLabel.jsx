// 단백질 음료 정렬 라벨 — 기준(파랑) / 성분(초록)으로 색 구분 렌더
// - 조합 정렬(기준×성분)일 때만 색 분리, 그 외(추천순·일반 카테고리)는 fallback 텍스트 그대로
// - withSuffix: '높은 순' 접미사 포함(드롭다운 트리거용), 미포함(모바일 액션바 짧은 라벨용)
import { getProteinSortParts } from '../../data/listSort.js';

export function ProteinSortLabel({ sortKey, fallback, withSuffix = false }) {
  const parts = getProteinSortParts(sortKey);
  if (!parts) return <>{fallback}</>;
  // 단위(총량/100kcal/1,000원)만 색, 뒤따르는 '기준'은 기본 검정. 성분도 색으로 구분
  const m = parts.modeLabel.match(/^(.*?)\s*(기준)$/);
  const unit = m ? m[1] : parts.modeLabel;
  const gijun = m ? m[2] : '';
  return (
    <>
      <span className="psort-label-mode">{unit}</span>
      {gijun ? ` ${gijun}` : ''}
      {' '}
      <span className="psort-label-base">{parts.baseLabel}</span>
      {withSuffix ? ' 높은 순' : ''}
    </>
  );
}
