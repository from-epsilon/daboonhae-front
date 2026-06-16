// 아미노산 합산 — 어댑터(getAdapted)와 리스트 정렬(listSort) 공용 단일 출처
// 표시값·정렬값이 항상 같은 기준을 쓰도록 한 곳에서만 계산한다.
// 기준: 개별 아미노산이 전부 있으면 합산값을 우선 사용, 하나라도 비면 DB 집계값(src_eaa_mg / src_bcaa_mg)으로 폴백.

export const EAA_KEYS = [
  'leucine', 'isoleucine', 'valine', 'lysine', 'methionine',
  'phenylalanine', 'threonine', 'tryptophan', 'histidine',
];
export const BCAA_KEYS = ['leucine', 'isoleucine', 'valine'];

// 키 목록이 모두 0보다 큰 값으로 채워져 있는지
function allPresent(n, keys) {
  return keys.every((k) => typeof n[k] === 'number' && n[k] > 0);
}

function sumKeys(n, keys) {
  return keys.reduce((acc, k) => acc + (n[k] || 0), 0);
}

// 필수아미노산(EAA) — 9종이 모두 있으면 합산, 하나라도 없으면 집계값(src_eaa_mg) 폴백
export function computeEaa(n) {
  if (!n) return 0;
  if (allPresent(n, EAA_KEYS)) return sumKeys(n, EAA_KEYS);
  return typeof n.eaa === 'number' && n.eaa > 0 ? n.eaa : 0; // src_eaa_mg
}

// BCAA(류신·이소류신·발린) — 3종이 모두 있으면 합산, 하나라도 없으면 집계값(src_bcaa_mg) 폴백
export function computeBcaa(n) {
  if (!n) return 0;
  if (allPresent(n, BCAA_KEYS)) return sumKeys(n, BCAA_KEYS);
  return typeof n.bcaa === 'number' && n.bcaa > 0 ? n.bcaa : 0; // src_bcaa_mg
}
