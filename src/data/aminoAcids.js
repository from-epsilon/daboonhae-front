// 아미노산 합산 — 어댑터(getAdapted)와 리스트 정렬(listSort) 공용 단일 출처
// 표시값·정렬값이 항상 같은 기준을 쓰도록 한 곳에서만 계산한다.

// 필수아미노산(EAA) 9종 총량 합산
export function computeEaa(n) {
  if (!n) return 0;
  return (n.leucine || 0) + (n.isoleucine || 0) + (n.valine || 0) +
    (n.lysine || 0) + (n.methionine || 0) + (n.phenylalanine || 0) +
    (n.threonine || 0) + (n.tryptophan || 0) + (n.histidine || 0);
}

// BCAA(류신·이소류신·발린) 합산 — 개별값이 없으면 저장된 bcaa 값으로 폴백
export function computeBcaa(n) {
  if (!n) return 0;
  const sum = (n.leucine || 0) + (n.isoleucine || 0) + (n.valine || 0);
  return sum || n.bcaa || 0;
}
