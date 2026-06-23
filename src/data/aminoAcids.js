// 아미노산 합산 — 어댑터(getAdapted)와 리스트 정렬(listSort) 공용 단일 출처
// 표시값·정렬값이 항상 같은 기준을 쓰도록 한 곳에서만 계산한다.
// 기준: 개별 아미노산이 전부 있으면 합산값을 우선 사용, 하나라도 비면 DB 집계값(src_eaa_mg / src_bcaa_mg)으로 폴백.

export const EAA_AMINO_ACIDS = [
  { code: 'leucine', label: '류신' },
  { code: 'isoleucine', label: '이소류신' },
  { code: 'valine', label: '발린' },
  { code: 'lysine', label: '라이신' },
  { code: 'methionine', label: '메티오닌' },
  { code: 'phenylalanine', label: '페닐알라닌' },
  { code: 'threonine', label: '트레오닌' },
  { code: 'tryptophan', label: '트립토판' },
  { code: 'histidine', label: '히스티딘' },
];

export const NON_ESSENTIAL_AMINO_ACIDS = [
  { code: 'arginine', label: '아르기닌', aliases: ['L-아르기닌'] },
  { code: 'glutamine', label: '글루타민', aliases: ['L-글루타민'] },
  { code: 'glutamic_acid', label: '글루탐산', aliases: ['글루타민산'] },
  { code: 'alanine', label: '알라닌' },
  { code: 'aspartic_acid', label: '아스파르트산', aliases: ['아스파라긴산'] },
  { code: 'asparagine', label: '아스파라긴' },
  { code: 'cysteine', label: '시스테인' },
  { code: 'cystine', label: '시스틴' },
  { code: 'glycine', label: '글리신' },
  { code: 'proline', label: '프롤린' },
  { code: 'serine', label: '세린' },
  { code: 'tyrosine', label: '티로신', aliases: ['타이로신'] },
  { code: 'taurine', label: '타우린' },
  { code: 'ornithine', label: '오르니틴' },
  { code: 'citrulline', label: '시트룰린' },
];

export const AMINO_ACIDS = [...EAA_AMINO_ACIDS, ...NON_ESSENTIAL_AMINO_ACIDS];
export const EAA_KEYS = EAA_AMINO_ACIDS.map((amino) => amino.code);
export const BCAA_KEYS = ['leucine', 'isoleucine', 'valine'];
export const NON_ESSENTIAL_AMINO_KEYS = NON_ESSENTIAL_AMINO_ACIDS.map((amino) => amino.code);
export const AMINO_ACID_KEYS = AMINO_ACIDS.map((amino) => amino.code);
export const AMINO_ACID_LABELS = Object.fromEntries(
  AMINO_ACIDS.map((amino) => [amino.code, amino.label]),
);
export const AMINO_ACID_KO_ALIASES = Object.fromEntries(
  AMINO_ACIDS.flatMap((amino) =>
    [amino.label, ...(amino.aliases ?? [])].map((name) => [name, amino.code])),
);

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
