// 단백질 음료 정렬 라벨 — 성분명 강조 렌더
// - 조합 정렬일 때만 색 분리, 그 외(추천 순·칼로리 낮은 순·일반 카테고리)는 fallback 텍스트 그대로
// - withSuffix: '순' 접미사 포함(드롭다운 트리거용), 미포함(모바일 액션바 짧은 라벨용)
// - modeSuffix는 현재 숨긴다. 나중에 기준 구분을 다시 노출하려면 kcal/price 문구를 되살리면 된다.
import { getProteinSortParts } from '../../data/listSort.js';

export function ProteinSortLabel({ sortKey, fallback, withSuffix = false }) {
  const parts = getProteinSortParts(sortKey);
  if (!parts) return <>{fallback}</>;
  const modeSuffix = '';

  return (
    <>
      <span className="psort-label-base">{parts.baseLabel}</span>
      {withSuffix ? ' 순' : ''}
      {modeSuffix && <span className="psort-label-mode">{modeSuffix}</span>}
    </>
  );
}
