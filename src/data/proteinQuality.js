// 단백질 원료 품질 — 원문 텍스트를 정규 원료로 해석해 약자·품질등급 표시
// - ingredients/ingredient_aliases를 한 번 로드해 모든 원료명을 로컬에서 해석
// - 원료 메타는 ingredients, 품질 등급은 ingredient_protein_quality_assessments에서 읽어 code로 합침
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// DB normalize_protein_ingredient_alias()와 같은 순서로 적용한다.
export function normalizeProteinAlias(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-./()[\]{}%,·・:：]+/g, '')
    .replace(/[0-9]+/g, '')
    .replace(/([가-힣])[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ]+$/g, '$1')
    .replace(/([가-힣])[ivx]+$/g, '$1')
    .replace(/단백질/g, '단백')
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
    .replace(/^d(?=[가-힣])/, '')
    .replace(/(시럽|액|분말|결정|추출물)/g, '')
    .replace(/[ivx]+$/g, '');
}

// 표시용 라벨 정리 — 말티톨시럽64%, 결정알룰로스 같은 형태 표기를 대표명에 가깝게 축약
export function cleanSweetenerLabel(text) {
  const original = String(text || '').trim();
  const cleaned = original
    .replace(/알룰로오스/g, '알룰로스')
    .replace(/\s*\d+(\.\d+)?\s*%?\s*$/, '')
    .replace(/^\s*D[-\s]*/i, '')
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
function formatQualityBasis(quality) {
  if (!quality) return null;
  const method = quality.method ? String(quality.method).toUpperCase() : '';
  const evidence = quality.evidence_level || '';
  const ageBasis = quality.age_basis || '';
  return [method, evidence, ageBasis].filter(Boolean).join(' · ') || null;
}

function buildDictionary(ingredients, aliases, qualities) {
  const byCode = new Map();
  const byNorm = new Map();
  const ambiguousNorms = new Set();
  const qualityByCode = new Map();
  const evidenceRank = { direct: 1, proxy: 2, estimated: 3 };
  const rankedQualities = [...(qualities ?? [])].sort((a, b) => {
    const ar = evidenceRank[a?.evidence_level] ?? 99;
    const br = evidenceRank[b?.evidence_level] ?? 99;
    if (ar !== br) return ar - br;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });
  for (const q of rankedQualities) {
    if (q?.ingredient_code && !qualityByCode.has(q.ingredient_code)) {
      qualityByCode.set(q.ingredient_code, q);
    }
  }
  const addNorm = (text, ing) => {
    const k = normalizeProteinAlias(text);
    if (!k || ambiguousNorms.has(k)) return;
    const existing = byNorm.get(k);
    if (existing && existing.code !== ing.code) {
      byNorm.delete(k);
      ambiguousNorms.add(k);
      return;
    }
    byNorm.set(k, ing);
  };
  for (const g of ingredients) {
    const quality = qualityByCode.get(g.code);
    const ing = {
      code: g.code,
      nameKo: g.name_ko ?? '',
      abbreviation: g.abbreviation || null,
      ingredientType: null,
      qualityGrade: quality?.grade || 'unknown',
      qualityBasis: formatQualityBasis(quality),
      displayDescription: g.display_description || null,
      quality,
    };
    byCode.set(g.code, ing);
    addNorm(g.name_ko, ing);
    if (g.abbreviation) addNorm(g.abbreviation, ing);
  }
  for (const a of aliases) {
    const ing = byCode.get(a.ingredient_code);
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
      const [ingRes, aliasRes, qualityRes] = await Promise.all([
        supabase
          .from('ingredients')
          .select('code, name_ko, abbreviation, display_description')
          .eq('category', 'protein_source')
          .eq('is_active', true),
        supabase
          .from('ingredient_aliases')
          .select('ingredient_code, alias'),
        supabase
          .from('ingredient_protein_quality_assessments')
          .select('id, ingredient_code, grade, method, evidence_level, age_basis, source_url'),
      ]);
      if (ingRes.error) {
        dictCache = EMPTY_DICT;
      } else {
        dictCache = buildDictionary(
          ingRes.data ?? [],
          aliasRes.error ? [] : (aliasRes.data ?? []),
          qualityRes.error ? [] : (qualityRes.data ?? []),
        );
      }
    } catch {
      dictCache = EMPTY_DICT;
    }
    return dictCache;
  })();
  return dictInflight;
}

// 텍스트 1건 해석 — 이미 로드한 사전에서 동기 조회한다.
function resolveOne(dict, text) {
  if (!text) return null;
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
      const entries = unique.map((text) => [text, resolveOne(dict, text)]);
      if (alive) setMap(new Map(entries));
    })();
    return () => { alive = false; };
    // key로 내용 변화만 감지 (배열 신원 변화 무시)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return useCallback((text) => map.get(text) ?? null, [map]);
}

export function useResolvedProteinSources(texts) {
  const list = Array.isArray(texts)
    ? texts.map((text) => (typeof text === 'string' ? text : text?.label ?? text?.text ?? '')).filter(Boolean)
    : [];
  const key = list.join('');
  const [sources, setSources] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const dict = await loadDictionary();
      const entries = list.map((rawText, index) => ({
        rawText,
        index,
        ingredient: resolveOne(dict, rawText),
      }));
      const seen = new Set();
      const resolved = [];
      for (const entry of entries) {
        const ingredient = entry.ingredient;
        if (!ingredient?.code || seen.has(ingredient.code)) continue;
        seen.add(ingredient.code);
        resolved.push({
          ...ingredient,
          rawText: entry.rawText,
          order: entry.index,
        });
      }
      if (alive) setSources(resolved);
    })();
    return () => { alive = false; };
    // key로 내용 변화만 감지 (배열 신원 변화 무시)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return sources;
}

// ── 대체당 사전/해석
// 대체당은 nutrients.group_name = 대체당(...) 행을 사전으로 쓰고,
// ingredient_annotations 원문은 nutrient_aliases.normalized_alias로 canonical 성분에 연결한다.
function sweetenerGroupType(groupName) {
  const text = String(groupName || '').trim();
  const match = text.match(/^대체당\((.+)\)$/);
  if (match) return match[1];
  return text.startsWith('대체당') ? text.replace(/^대체당/, '').trim() || '대체당' : null;
}

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
      groupName: row.group_name || null,
      sweetenerType: sweetenerGroupType(row.group_name),
      benefitsText: row.benefits_text || null,
      cautionsText: row.cautions_text || null,
    };
    byCode.set(row.code, sweetener);
    addNorm(row.name_ko, sweetener);
  }
  for (const alias of aliases) {
    const sweetener = byCode.get(alias.nutrient_code);
    if (!sweetener) continue;
    if (alias.normalized_alias) byNorm.set(alias.normalized_alias, sweetener);
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
          .from('nutrients')
          .select('code, name_ko, group_name, benefits_text, cautions_text')
          .eq('is_active', true)
          .like('group_name', '대체당%'),
        supabase
          .from('nutrient_aliases')
          .select('nutrient_code, alias, normalized_alias'),
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

async function resolveSweetenerOne(dict, text) {
  if (!text) return null;
  if (!sweetenerCodeCache.has(text)) {
    sweetenerCodeCache.set(text, dict.byNorm.get(normalizeSweetenerAlias(text))?.code ?? null);
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

export function useResolvedSweeteners(texts) {
  const list = Array.isArray(texts)
    ? texts.map((text) => (typeof text === 'string' ? text : text?.label ?? text?.text ?? '')).filter(Boolean)
    : [];
  const key = list.join('');
  const [sweeteners, setSweeteners] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const dict = await loadSweetenerDictionary();
      const entries = await Promise.all(
        list.map(async (rawText, index) => ({ rawText, index, sweetener: await resolveSweetenerOne(dict, rawText) })),
      );
      const seen = new Set();
      const resolved = [];
      for (const entry of entries) {
        const sweetener = entry.sweetener;
        if (!sweetener?.code || seen.has(sweetener.code)) continue;
        seen.add(sweetener.code);
        resolved.push({
          ...sweetener,
          rawText: entry.rawText,
          order: entry.index,
        });
      }
      if (alive) setSweeteners(resolved);
    })();
    return () => { alive = false; };
    // key로 내용 변화만 감지 (배열 신원 변화 무시)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return sweeteners;
}
