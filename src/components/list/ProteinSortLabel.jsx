// 단백질 음료 정렬 라벨 — 기준(파랑) / 성분(초록)으로 색 구분 렌더
// - 조합 정렬(기준×성분)일 때만 색 분리, 그 외(추천순·일반 카테고리)는 fallback 텍스트 그대로
// - withSuffix: '순' 접미사 포함(드롭다운 트리거용), 미포함(모바일 액션바 짧은 라벨용)
import { getProteinSortParts } from '../../data/listSort.js';

export function ProteinSortLabel({ sortKey, fallback, withSuffix = false }) {
  const parts = getProteinSortParts(sortKey);
  if (!parts) return <>{fallback}</>;
  const modeSuffix =
    parts.modeLabel === '100kcal 기준'
      ? '(칼로리대비)'
      : parts.modeLabel === '1,000원 기준'
        ? '(가격대비)'
        : '';

  return (
    <>
      <span className="psort-label-base">{parts.baseLabel}</span>
      {withSuffix ? '순' : ''}
      {modeSuffix && <span className="psort-label-mode">{modeSuffix}</span>}
    </>
  );
}
