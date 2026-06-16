// 단백질 원료 품질 — 원문 텍스트를 정규 원료로 해석해 약자·품질등급 표시
// - 해석은 DB 함수 resolve_protein_ingredient_code()(RPC)를 1순위로 사용 → DB 정규화 규칙과 100% 일치
// - RPC 실패(권한/인자명 불일치 등) 시 클라이언트 정규화 매칭으로 폴백
// - 원료 메타(약자·등급)는 protein_ingredients를 1회 로드해 code로 조회
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// ⚠️ DB 함수 resolve_protein_ingredient_code의 인자명. DB 정의와 달라 RPC가 실패하면
//    자동으로 클라 정규화 폴백으로 동작함(배지는 그대로 표시). 정확한 인자명으로 바꾸면 RPC 사용.
const RESOLVE_FN = 'resolve_protein_ingredient_code';
const RESOLVE_ARG = 'text';

// 원문 정규화 — DB normalize_protein_ingredient_alias() 근사(폴백용)
// (소문자화 → 한글·영문 외 문자 제거 → '분말' 제거)
export function normalizeProteinAlias(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^가-힣a-z]/g, '')
    .replace(/분말/g, '');
}

// 표시용 라벨 정리 — 끝의 '분말'·중복 구분 숫자 suffix 제거
// (예: 농축유청단백분말2 → 농축유청단백, 분리대두단백2 → 분리대두단백, 유청단백분말 → 유청단백)
// 전부 지워지면 원본 유지. % 등 다른 표기는 보존.
export function cleanProteinLabel(text) {
  const original = String(text || '').trim();
  const cleaned = original
    .replace(/\s*분말\s*\d*$/, '') // 끝의 '분말'(+선택 숫자)
    .replace(/\s*\d+$/, '')        // 끝의 구분 숫자
    .trim();
  return cleaned || original;
}

// 원문 정규화 — DB normalize_alternative_sweetener_alias() 근사(폴백용)
// (소문자화 → 한글·영문 외 문자 제거 → 숫자/형태 표기 제거)
export function normalizeSweetenerAlias(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/알룰로오스/g, '알룰로스')
    .replace(/[^가-힣a-z]/g, '')
    .replace(/(시럽|액|분말|결정|추출물)/g, '')
    .replace(/[ivx]+$/g, '');
}

// 표시용 라벨 정리 — 말티톨시럽64%, 결정알룰로스 같은 형태 표기를 대표명에 가깝게 축약
export function cleanSweetenerLabel(text) {
  const original = String(text || '').trim();
  const cleaned = original
    .replace(/알룰로오스/g, '알룰로스')
    .replace(/\s*\d+(\.\d+)?\s*%?\s*$/, '')
    .replace(/^\s*결정\s*/, '')
    .replace(/\s*(시럽|액|분말|추출물)\s*$/, '')
    .replace(/\s*[ivx]+\s*$/i, '')
    .trim();
  return cleaned || original;
}

// 품질 등급 표시 메타 (unknown은 배지 없음)
const GRADE_META = {
  excellent: { label: '최상', cls: 'is-excellent' },
  good: { label: '우수', cls: 'is-good' },
  moderate: { label: '보통', cls: 'is-moderate' },
  low: { label: '낮음', cls: 'is-low' },
};
export function proteinGradeMeta(grade) {
  return GRADE_META[grade] ?? null;
}

// ── 원료 사전 (code → 메타, byNorm → 폴백 매칭)
function buildDictionary(ingredients, aliases) {
  const byCode = new Map();
  const byNorm = new Map();
  const addNorm = (text, ing) => {
    const k = normalizeProteinAlias(text);
    if (k) byNorm.set(k, ing);
  };
  for (const g of ingredients) {
    const ing = {
      code: g.code,
      nameKo: g.name_ko ?? '',
      abbreviation: g.abbreviation || null,
      ingredientType: g.ingredient_type || null,
      qualityGrade: g.quality_grade || 'unknown',
      qualityBasis: g.quality_basis || null,
      displayDescription: g.display_description || null,
    };
    byCode.set(g.code, ing);
    addNorm(g.name_ko, ing);
    if (g.abbreviation) addNorm(g.abbreviation, ing);
  }
  for (const a of aliases) {
    const ing = byCode.get(a.protein_ingredient_code);
    if (!ing) continue;
    if (a.alias) addNorm(a.alias, ing); // 원본 alias도 같은 normalize로 키 등록(폴백 일관성)
  }
  return { byCode, byNorm };
}

const EMPTY_DICT = { byCode: new Map(), byNorm: new Map() };

let dictCache = null;
let dictInflight = null;

async function loadDictionary() {
  if (dictCache) return dictCache;
  if (dictInflight) return dictInflight;
  dictInflight = (async () => {
    try {
      const [ingRes, aliasRes] = await Promise.all([
        supabase
          .from('protein_ingredients')
          .select('code, name_ko, abbreviation, ingredient_type, quality_grade, quality_basis, display_description')
          .eq('is_active', true),
        supabase
          .from('protein_ingredient_aliases')
          .select('protein_ingredient_code, alias'),
      ]);
      dictCache = ingRes.error
        ? EMPTY_DICT
        : buildDictionary(ingRes.data ?? [], aliasRes.error ? [] : (aliasRes.data ?? []));
    } catch {
      dictCache = EMPTY_DICT;
    }
    return dictCache;
  })();
  return dictInflight;
}

// ── 텍스트 → 원료 코드 (DB RPC 1순위, 결과 캐시)
const codeCache = new Map(); // text → code|null
// 함수 미노출/권한없음이 확인되면 이후 RPC를 건너뛰고 폴백만 사용(불필요한 실패 호출 방지)
let rpcDisabled = false;

async function rpcResolveCode(text) {
  if (rpcDisabled) return undefined;
  try {
    const { data, error } = await supabase.rpc(RESOLVE_FN, { [RESOLVE_ARG]: text });
    if (error) {
      // PGRST202(함수 없음) · 42883(시그니처 불일치) · 42501(권한없음) → RPC 영구 비활성화
      if (['PGRST202', '42883', '42501'].includes(error.code)) rpcDisabled = true;
      return undefined; // RPC 불가 → 폴백 신호
    }
    return typeof data === 'string' && data ? data : null;
  } catch {
    return undefined;
  }
}

// 텍스트 1건 해석 — RPC(코드)→사전 메타, 실패 시 클라 정규화 폴백
async function resolveOne(dict, text) {
  if (!text) return null;
  if (!codeCache.has(text)) {
    codeCache.set(text, await rpcResolveCode(text));
  }
  const code = codeCache.get(text);
  if (code) {
    const ing = dict.byCode.get(code);
    if (ing) return ing;
  }
  // code === null(RPC가 매칭 없음) 또는 undefined(RPC 불가) → 클라 폴백
  return dict.byNorm.get(normalizeProteinAlias(text)) ?? null;
}

// React 훅 — 주어진 텍스트들을 비동기 해석한 뒤 resolve(text) 동기 조회 제공
// (해석 완료 시 재렌더 → 배지 등장. 미해석/실패 시 null)
export function useProteinResolver(texts) {
  const list = Array.isArray(texts) ? texts.filter(Boolean) : [];
  const key = list.join('');
  const [map, setMap] = useState(() => new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const dict = await loadDictionary();
      const unique = [...new Set(list)];
      const entries = await Promise.all(
        unique.map(async (text) => [text, await resolveOne(dict, text)]),
      );
      if (alive) setMap(new Map(entries));
    })();
    return () => { alive = false; };
    // key로 내용 변화만 감지 (배열 신원 변화 무시)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return useCallback((text) => map.get(text) ?? null, [map]);
}

// ── 대체당 사전/해석
const SWEETENER_RESOLVE_FN = 'resolve_alternative_sweetener_code';
const SWEETENER_RESOLVE_ARG = 'text';

function buildSweetenerDictionary(sweeteners, aliases) {
  const byCode = new Map();
  const byNorm = new Map();
  const addNorm = (text, sweetener) => {
    const k = normalizeSweetenerAlias(text);
    if (k) byNorm.set(k, sweetener);
  };
  for (const row of sweeteners) {
    const sweetener = {
      code: row.code,
      nameKo: row.name_ko ?? '',
      sweetenerType: row.sweetener_type || null,
    };
    byCode.set(row.code, sweetener);
    addNorm(row.name_ko, sweetener);
  }
  for (const alias of aliases) {
    const sweetener = byCode.get(alias.alternative_sweetener_code);
    if (!sweetener) continue;
    if (alias.alias) addNorm(alias.alias, sweetener);
  }
  return { byCode, byNorm };
}

const EMPTY_SWEETENER_DICT = { byCode: new Map(), byNorm: new Map() };

let sweetenerDictCache = null;
let sweetenerDictInflight = null;

async function loadSweetenerDictionary() {
  if (sweetenerDictCache) return sweetenerDictCache;
  if (sweetenerDictInflight) return sweetenerDictInflight;
  sweetenerDictInflight = (async () => {
    try {
      const [sweetenerRes, aliasRes] = await Promise.all([
        supabase
          .from('alternative_sweeteners')
          .select('code, name_ko, sweetener_type')
          .eq('is_active', true),
        supabase
          .from('alternative_sweetener_aliases')
          .select('alternative_sweetener_code, alias'),
      ]);
      sweetenerDictCache = sweetenerRes.error
        ? EMPTY_SWEETENER_DICT
        : buildSweetenerDictionary(
          sweetenerRes.data ?? [],
          aliasRes.error ? [] : (aliasRes.data ?? []),
        );
    } catch {
      sweetenerDictCache = EMPTY_SWEETENER_DICT;
    }
    return sweetenerDictCache;
  })();
  return sweetenerDictInflight;
}

const sweetenerCodeCache = new Map();
let sweetenerRpcDisabled = false;

async function rpcResolveSweetenerCode(text) {
  if (sweetenerRpcDisabled) return undefined;
  try {
    const { data, error } = await supabase.rpc(SWEETENER_RESOLVE_FN, { [SWEETENER_RESOLVE_ARG]: text });
    if (error) {
      if (['PGRST202', '42883', '42501'].includes(error.code)) sweetenerRpcDisabled = true;
      return undefined;
    }
    return typeof data === 'string' && data ? data : null;
  } catch {
    return undefined;
  }
}

async function resolveSweetenerOne(dict, text) {
  if (!text) return null;
  if (!sweetenerCodeCache.has(text)) {
    sweetenerCodeCache.set(text, await rpcResolveSweetenerCode(text));
  }
  const code = sweetenerCodeCache.get(text);
  if (code) {
    const sweetener = dict.byCode.get(code);
    if (sweetener) return sweetener;
  }
  return dict.byNorm.get(normalizeSweetenerAlias(text)) ?? null;
}

export function useSweetenerResolver(texts) {
  const list = Array.isArray(texts) ? texts.filter(Boolean) : [];
  const key = list.join('');
  const [map, setMap] = useState(() => new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const dict = await loadSweetenerDictionary();
      const unique = [...new Set(list)];
      const entries = await Promise.all(
        unique.map(async (text) => [text, await resolveSweetenerOne(dict, text)]),
      );
      if (alive) setMap(new Map(entries));
    })();
    return () => { alive = false; };
    // key로 내용 변화만 감지 (배열 신원 변화 무시)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return useCallback((text) => map.get(text) ?? null, [map]);
}
