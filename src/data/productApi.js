// Supabase 제품 데이터 조회 + mock shape 변환
// - foods 테이블 기준, food_type_categories / food_nutrients 조인
// - food_families / food_purpose_category_links / food_aliases는 RLS가 허용되면 함께 조회,
//   anon 권한이 막혀 있으면(permission denied) 자동으로 빼고 재조회(폴백)
// - 기존 mockProducts.js와 동일한 shape으로 변환하여 adapters/analyzers 호환 유지
// - 컬럼은 SUPABASE_PRODUCT_QUERY_GUIDE 기준 신규 스키마만 사용(레거시 컬럼 사용 금지)

import { supabase } from '../lib/supabase.js';
import { AMINO_ACID_KEYS, AMINO_ACID_KO_ALIASES } from './aminoAcids.js';
import { NUTRIENT_GROUP, isNutrientGroup } from './nutrientGroups.js';

export const PROTEIN_DRINK_SCORE_PROFILE = 'protein_drink_default_v1';

// ── 영양성분 코드 → mock nutrition 키 매핑
const NUTRIENT_KEY = {
  energy_kcal: 'calories',
  protein_g: 'protein',
  carbohydrate_g: 'carbs',
  sugars_g: 'sugar',
  fat_g: 'fat',
  dietary_fiber: 'fiber',
  sodium_mg: 'sodium',
  trans_fat_g: 'transFat',
  saturated_fat_g: 'saturatedFat',
  cholesterol_mg: 'cholesterol',
  src_알룰로오스_g: 'allulose',
  src_eaa_mg: 'eaa',
  src_bcaa_mg: 'bcaa',
  leucine: 'leucine',
  isoleucine: 'isoleucine',
  valine: 'valine',
  lysine: 'lysine',
  methionine: 'methionine',
  phenylalanine: 'phenylalanine',
  threonine: 'threonine',
  tryptophan: 'tryptophan',
  histidine: 'histidine',
};

const AMINO_CODE_ALIASES = {
  glutamate: 'glutamic_acid',
  aspartate: 'aspartic_acid',
};

for (const key of AMINO_ACID_KEYS) {
  AMINO_CODE_ALIASES[key] = key;
  AMINO_CODE_ALIASES[`${key}_mg`] = key;
  AMINO_CODE_ALIASES[`l_${key}`] = key;
  AMINO_CODE_ALIASES[`l_${key}_mg`] = key;
  AMINO_CODE_ALIASES[`src_${key}_mg`] = key;
  AMINO_CODE_ALIASES[`src_l_${key}_mg`] = key;
  AMINO_CODE_ALIASES[`amino_${key}`] = key;
  AMINO_CODE_ALIASES[`amino_acid_${key}`] = key;
}

const AMINO_KO_ALIASES = Object.fromEntries(
  Object.entries(AMINO_ACID_KO_ALIASES).map(([name, key]) => [normalizeKoName(name), key]),
);

function publicStorageImageUrl(path) {
  if (!path) return '';
  return supabase.storage.from('food-images').getPublicUrl(path).data.publicUrl;
}

function productImageUrl(food) {
  return publicStorageImageUrl(food.storage_image_path) || food.image_url || '';
}

function normalizeSearchAlias(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-./()[\]{}%,·・:：]+/g, '');
}

function normalizeNutrientCode(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^l[-_\s]+/, '')
    .replace(/[-\s]+/g, '_');
}

function normalizeKoName(value) {
  return String(value ?? '')
    .trim()
    .replace(/^l[-_\s]+/i, '')
    .replace(/^l(?=[가-힣])/i, '')
    .replace(/\s+/g, '');
}

function resolveAminoKey(fn) {
  const candidates = [
    fn?.nutrient_code,
    fn?.nutrients?.code,
    fn?.nutrients?.name_en,
  ];
  for (const candidate of candidates) {
    const key = AMINO_CODE_ALIASES[normalizeNutrientCode(candidate)];
    if (key) return key;
  }

  const nameKey = AMINO_KO_ALIASES[normalizeKoName(fn?.nutrients?.name_ko)];
  if (nameKey) return nameKey;

  return null;
}

function resolveNutrientKey(fn) {
  const directKey = NUTRIENT_KEY[fn?.nutrient_code];
  if (directKey) return directKey;

  const aminoKey = resolveAminoKey(fn);
  if (aminoKey) return aminoKey;

  if (isNutrientGroup(fn, NUTRIENT_GROUP.AMINO_ACID)) {
    return resolveAminoKey(fn);
  }

  return null;
}

function parseNutrition(foodNutrients) {
  const n = {};
  for (const fn of foodNutrients ?? []) {
    const key = resolveNutrientKey(fn);
    if (!key || fn.amount == null) continue;
    const amount = typeof fn.amount === 'number' ? fn.amount : Number(fn.amount);
    n[key] = Number.isFinite(amount) ? amount : fn.amount;
  }
  return n;
}

// ── 영양값 기준 계산 (가이드: nutritionBasisOf)
// - nutrition_basis_type에 따라 기준량/단위 결정 (단위는 항상 net_content_unit)
function nutritionBasisOf(food) {
  const unit = food.net_content_unit ?? '';
  switch (food.nutrition_basis_type) {
    case 'net_content':
      return { type: 'net_content', amount: food.net_content_amount ?? null, unit };
    case 'package_unit':
      return { type: 'package_unit', amount: food.package_unit_amount ?? null, unit };
    case 'serving':
      return { type: 'serving', amount: food.serving_amount ?? null, unit };
    case 'standard_100':
      return { type: 'standard_100', amount: 100, unit };
    default:
      return { type: null, amount: null, unit };
  }
}

function servingsPerUnitOf(food) {
  const net = Number(food.net_content_amount);
  const serving = Number(food.serving_amount);
  if (Number.isFinite(net) && net > 0 && Number.isFinite(serving) && serving > 0) {
    return net / serving;
  }

  // 단일 파우치/팩은 serving_amount가 비어 있어도 순내용량 자체가 1회분인 경우가 많다.
  if (
    food.nutrition_basis_type === 'net_content' &&
    Number.isFinite(net) &&
    net > 0 &&
    net <= 100 &&
    ['g', 'ml'].includes(food.net_content_unit)
  ) {
    return 1;
  }

  return null;
}

// ── food_purpose_category_links → 정규화된 목적 카테고리 배열
// - DB 다대다 링크에서 { code, name } 형태로 추출 (name_ko 우선)
function parsePurposeCategories(links) {
  if (!Array.isArray(links)) return [];
  return links
    .map((l) => ({
      code: l.purpose_category_code,
      name: l.food_purpose_categories?.name_ko ?? l.purpose_category_code,
    }))
    .filter((p) => p.code);
}

// ── 제품군(food_families) → 정규화
function parseFamily(family) {
  if (!family) return null;
  return {
    id: family.id,
    name: family.name ?? '',
    brand: family.brand ?? '',
  };
}

// ── food_purchase_links → 구매 오퍼 목록 (가이드 표시 방식)
// - is_active !== false 인 링크만, 가격 오름차순(최저가 우선)
// - quantity 기본 1 (x N 표시용)
function parsePurchaseLinks(links) {
  if (!Array.isArray(links)) return [];
  return links
    .filter((l) => l && l.is_active !== false && l.url)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    .map((l) => ({
      vendorName: l.vendor_name ?? '',
      url: l.url,
      quantity: l.quantity ?? 1,
      price: l.price ?? null,
      isFastDelivery: l.is_fast_delivery === true,
      updatedAt: l.updated_at ?? null,
    }));
}

function parseScoreSnapshots(snapshots) {
  if (!Array.isArray(snapshots)) return [];
  return snapshots
    .filter((snapshot) => snapshot?.profile_code)
    .map((snapshot) => ({
      profileCode: snapshot.profile_code,
      profileVersion: snapshot.profile_version ?? null,
      score: typeof snapshot.score === 'number' ? snapshot.score : Number(snapshot.score ?? 0),
      confidence: typeof snapshot.confidence === 'number' ? snapshot.confidence : Number(snapshot.confidence ?? 0),
      components: snapshot.components ?? null,
      reasons: Array.isArray(snapshot.reasons) ? snapshot.reasons : [],
      computedAt: snapshot.computed_at ?? null,
    }));
}

function pickScoreSnapshot(snapshots, profileCode) {
  return snapshots.find((snapshot) => snapshot.profileCode === profileCode) ?? null;
}

// ── 영양값 기반 목적 자동 태깅 (DB 링크가 비었을 때 폴백)
function derivePurposesFit(n) {
  const fits = [];
  if (n.protein >= 15) fits.push('protein');
  if (n.calories <= 200 || n.sugar <= 5) fits.push('weight_loss');
  if (n.sugar <= 3) fits.push('low_sugar');
  if (n.calories >= 200 && n.protein >= 10) fits.push('meal_replacement');
  return fits;
}

// ── 영양 품질 점수 (40~98)
function deriveRankingScore(n) {
  let s = 50;
  if (n.protein >= 20) s += 20;
  else if (n.protein >= 10) s += 10;
  if (n.sugar <= 1) s += 20;
  else if (n.sugar <= 3) s += 15;
  else if (n.sugar <= 5) s += 5;
  if (n.calories <= 120) s += 8;
  if (n.sugar >= 10) s -= 10;
  return Math.min(98, Math.max(40, s));
}

// ── 알레르기 텍스트 → 배열
function parseAllergens(text) {
  if (!text) return [];
  return text
    .split(/[,，、\s]+/)
    .map(s => s.trim())
    .filter((s) => s && s !== '함유');
}

// ── ingredient_annotations → 단백질원료/대체당 배열
// - type별로 원문 구간 text를 추출 (없으면 label 폴백), 중복 제거
function parseIngredientAnnotations(anns) {
  const list = Array.isArray(anns) ? anns : [];
  const bySourceOrder = (a, b) => {
    const ax = Number.isFinite(a?.start) ? a.start : Infinity;
    const bx = Number.isFinite(b?.start) ? b.start : Infinity;
    if (ax !== bx) return ax - bx;
    const ay = Number.isFinite(a?.end) ? a.end : Infinity;
    const by = Number.isFinite(b?.end) ? b.end : Infinity;
    return ay - by;
  };
  const pick = (type) =>
    [...new Set(
      list
        .filter((a) => a && a.type === type)
        .sort(bySourceOrder)
        .map((a) => (a.text ?? a.label ?? '').trim())
        .filter(Boolean),
    )];
  return {
    proteinSources: pick('protein_source'),
    sweeteners: pick('alternative_sweetener'),
  };
}

// ── Supabase row → mock product shape
function transformProduct(food) {
  const nutrition = parseNutrition(food.food_nutrients);
  const allergens = parseAllergens(food.allergens_text);
  const lactoseFree = !allergens.some(a => a.includes('우유') || a.includes('유당'));
  const purposeCategories = parsePurposeCategories(food.food_purpose_category_links);
  const basis = nutritionBasisOf(food);
  const servingsPerUnit = servingsPerUnitOf(food);
  const family = parseFamily(food.food_families);
  const purchaseLinks = parsePurchaseLinks(food.food_purchase_links);
  const scoreSnapshots = parseScoreSnapshots(food.food_score_snapshots);
  const proteinDrinkScore = pickScoreSnapshot(scoreSnapshots, PROTEIN_DRINK_SCORE_PROFILE);
  // 원재료 구간 마킹 → 단백질원료/대체당 추출
  const { proteinSources, sweeteners } = parseIngredientAnnotations(food.ingredient_annotations);

  // 영양 기준량 표기 (예: '250ml', '100g'); 기준량 없으면 빈 문자열
  const volume = basis.amount != null ? `${basis.amount}${basis.unit ?? ''}` : '';

  return {
    id: food.id,
    name: food.name ?? '',
    brand: food.brand ?? '',
    thumbnail: productImageUrl(food),
    volume,
    flavorCode: food.flavor_code ?? '',
    flavorName: food.food_flavors?.name_ko ?? food.flavor_code ?? '',
    // 표시용 식품유형 라벨(name_ko 우선) + 매칭용 코드 분리 보존
    category: food.food_type_categories?.name_ko ?? food.food_type_category_code ?? '',
    categoryCode: food.food_type_category_code ?? '',
    categoryIsActive: food.food_type_categories?.is_active === true,
    family,
    purposeCategories,
    purposesFit: derivePurposesFit(nutrition),
    nutrition,
    ingredients: {
      sweeteners,
      proteinSources,
      allergens,
      lactoseFree,
    },
    description: '',
    purchaseUrl: food.source_url ?? '#',
    purchaseLinks,
    scoreSnapshots,
    recommendationScores: {
      proteinDrinkDefault: proteinDrinkScore,
    },
    rankingScore: deriveRankingScore(nutrition),
    _raw: {
      ingredientsText: food.ingredients_text ?? '',
      allergensText: food.allergens_text ?? '',
      crossContaminationText: food.cross_contamination_text ?? '',
      cautionNotes: food.caution_notes ?? '',
      additionalContent: Array.isArray(food.additional_content) ? food.additional_content : [],
      ingredientAnnotations: Array.isArray(food.ingredient_annotations) ? food.ingredient_annotations : [],
      barcode: food.barcode ?? '',
      foodNutrients: food.food_nutrients ?? [],
      // 영양표 토글/per100 계산에 쓰는 '기준량' (이전 servingSize 자리)
      servingSize: basis.amount,
      servingUnit: basis.unit,
      servingAmount: food.serving_amount ?? null,
      servingDescription: food.serving_description ?? '',
      servingsPerUnit,
      netContentAmount: food.net_content_amount ?? null,
      netContentUnit: food.net_content_unit ?? '',
      nutritionBasisType: basis.type,
      sizeVariantLabel: food.size_variant_label ?? '',
      isMfdsOfficial: food.is_mfds_official_source ?? false,
      sourceUrl: food.source_url ?? '',
      sourceFoodCode: food.source_food_code ?? '',
      aliases: (food.food_aliases ?? []).map((a) => a.alias).filter(Boolean),
    },
  };
}

function onlyActiveCategoryRows(rows) {
  return (rows ?? []).filter((food) => food?.food_type_categories?.is_active === true);
}

// ── 선택 조인 절 (RLS 허용 시에만 포함)
const FAMILY_JOIN = `
  food_families ( id, name, brand, food_type_category_code ),
`;
const PURPOSE_JOIN = `
  food_purpose_category_links (
    purpose_category_code,
    food_purpose_categories ( code, name_ko )
  ),
`;
const ALIAS_JOIN = `
  food_aliases ( alias, normalized_alias ),
`;
const PURCHASE_JOIN = `
  food_purchase_links ( vendor_name, url, quantity, price, is_fast_delivery, is_active, updated_at ),
`;
const SCORE_JOIN = `
  food_score_snapshots (
    profile_code, profile_version, score, confidence, components, reasons, computed_at
  ),
`;
const FLAVOR_JOIN = `
  food_flavors ( code, name_ko, display_order, is_active ),
`;

// ── 목록 select 절 (목록/검색 공통). optional=true면 family/purpose 조인 포함
const LIST_SELECT_BASE = (optional) => `
  id, name, brand, barcode, image_url, storage_image_path,
  is_mfds_official_source, source_url, source_food_code,
  flavor_code,
  net_content_amount, net_content_unit,
  package_unit_count, package_unit_name, package_unit_amount,
  serving_amount, serving_description, nutrition_basis_type,
  ingredients_text, allergens_text, cross_contamination_text,
  caution_notes, additional_content, ingredient_annotations,
  food_type_category_code, family_id, size_variant_label, updated_at,
  food_type_categories!inner ( code, name_ko, is_active ),
  ${FLAVOR_JOIN}
  ${optional ? FAMILY_JOIN : ''}
  ${optional ? PURPOSE_JOIN : ''}
  ${PURCHASE_JOIN}
  ${SCORE_JOIN}
  food_nutrients (
    nutrient_code, amount, unit, amount_text,
    nutrients ( code, name_ko, default_unit, group_name, display_order, benefits_text, cautions_text )
  )
`;

// ── 단건 상세 select 절. optional=true면 family/purpose/alias 조인 포함
const DETAIL_SELECT_BASE = (optional) => `
  id, name, brand, barcode, image_url, storage_image_path,
  is_mfds_official_source, source_url, source_food_code,
  flavor_code,
  net_content_amount, net_content_unit,
  package_unit_count, package_unit_name, package_unit_amount,
  serving_amount, serving_description, nutrition_basis_type,
  ingredients_text, allergens_text, cross_contamination_text,
  caution_notes, additional_content, ingredient_annotations,
  food_type_category_code, family_id, size_variant_label, updated_at,
  food_type_categories!inner ( code, name_ko, is_active ),
  ${FLAVOR_JOIN}
  ${optional ? FAMILY_JOIN : ''}
  ${optional ? PURPOSE_JOIN : ''}
  ${PURCHASE_JOIN}
  ${SCORE_JOIN}
  food_nutrients (
    nutrient_code, amount, unit, amount_text,
    nutrients ( code, name_ko, name_en, default_unit, group_name, display_order, benefits_text, cautions_text )
  )${optional ? ',' : ''}
  ${optional ? ALIAS_JOIN.trim().replace(/,$/, '') : ''}
`;

// 선택 조인(food_families/purpose_links/aliases) RLS가 막혀있으면 한 번 false로 떨어뜨리고 재시도 안 함
let optionalJoinsAvailable = true;

// 선택 조인 권한/관계 에러인지 판정 (이 경우 폴백)
function isOptionalJoinError(error) {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  return (
    error.code === '42501' || // permission denied
    msg.includes('food_purpose_category') ||
    msg.includes('food_families') ||
    msg.includes('food_aliases') ||
    msg.includes('permission denied')
  );
}

function isNoRowsError(error) {
  if (!error) return false;
  return error.code === 'PGRST116' || (error.message ?? '').toLowerCase().includes('no rows');
}

function mergeProducts(primary, secondary, limit = 50) {
  const seen = new Set();
  const merged = [];
  for (const product of [...(primary ?? []), ...(secondary ?? [])]) {
    const key = String(product?.id ?? '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(product);
    if (merged.length >= limit) break;
  }
  return merged;
}

async function fetchProductsByIds(ids) {
  const uniqueIds = [...new Set((ids ?? []).filter((id) => id != null))];
  if (uniqueIds.length === 0) return [];

  if (optionalJoinsAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(LIST_SELECT_BASE(true))
      .eq('is_active', true)
      .eq('food_type_categories.is_active', true)
      .in('id', uniqueIds);

    if (!error) return onlyActiveCategoryRows(data).map(transformProduct);
    if (!isOptionalJoinError(error)) throw error;
    optionalJoinsAvailable = false;
  }

  const { data, error } = await supabase
    .from('foods')
    .select(LIST_SELECT_BASE(false))
    .eq('is_active', true)
    .eq('food_type_categories.is_active', true)
    .in('id', uniqueIds);

  if (error) throw error;
  return onlyActiveCategoryRows(data).map(transformProduct);
}

async function searchAliasProductIds(query) {
  const normalized = normalizeSearchAlias(query);
  if (!normalized) return [];
  const { data, error } = await supabase
    .from('food_aliases')
    .select('food_id')
    .ilike('normalized_alias', `%${normalized}%`)
    .limit(50);

  if (error) {
    if (isOptionalJoinError(error)) {
      console.warn('[productApi] food_aliases 검색 불가, 기본 검색만 사용');
      return [];
    }
    throw error;
  }
  return [...new Set((data ?? []).map((row) => row.food_id).filter((id) => id != null))];
}

async function searchProductsByFilter(orFilter) {
  if (optionalJoinsAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(LIST_SELECT_BASE(true))
      .eq('is_active', true)
      .eq('food_type_categories.is_active', true)
      .or(orFilter)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (!error) return onlyActiveCategoryRows(data).map(transformProduct);
    if (!isOptionalJoinError(error)) throw error;
    optionalJoinsAvailable = false;
  }

  const { data, error } = await supabase
    .from('foods')
    .select(LIST_SELECT_BASE(false))
    .eq('is_active', true)
    .eq('food_type_categories.is_active', true)
    .or(orFilter)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return onlyActiveCategoryRows(data).map(transformProduct);
}

// ── 제품 목록 전체 조회
export async function fetchProducts() {
  if (optionalJoinsAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(LIST_SELECT_BASE(true))
      .eq('is_active', true)
      .eq('food_type_categories.is_active', true)
      .order('updated_at', { ascending: false });

    if (!error) return onlyActiveCategoryRows(data).map(transformProduct);
    if (!isOptionalJoinError(error)) throw error;
    optionalJoinsAvailable = false;
    console.warn('[productApi] 선택 조인(food_families/purpose/aliases) 불가, 기본 조인으로 폴백');
  }

  const { data, error } = await supabase
    .from('foods')
    .select(LIST_SELECT_BASE(false))
    .eq('is_active', true)
    .eq('food_type_categories.is_active', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return onlyActiveCategoryRows(data).map(transformProduct);
}

// ── 단건 상세 조회
export async function fetchProductById(id) {
  if (optionalJoinsAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(DETAIL_SELECT_BASE(true))
      .eq('id', id)
      .eq('is_active', true)
      .eq('food_type_categories.is_active', true)
      .single();

    if (!error) return data?.food_type_categories?.is_active === true ? transformProduct(data) : null;
    if (isNoRowsError(error)) return null;
    if (!isOptionalJoinError(error)) throw error;
    optionalJoinsAvailable = false;
  }

  const { data, error } = await supabase
    .from('foods')
    .select(DETAIL_SELECT_BASE(false))
    .eq('id', id)
    .eq('is_active', true)
    .eq('food_type_categories.is_active', true)
    .single();

  if (isNoRowsError(error)) return null;
  if (error) throw error;
  return data?.food_type_categories?.is_active === true ? transformProduct(data) : null;
}

// ── 텍스트 검색 (이름/브랜드/식품유형코드/바코드/원천코드)
export async function searchProductsRemote(query) {
  const escaped = query.replaceAll('%', '\\%').replaceAll('_', '\\_');
  const orFilter = `name.ilike.%${escaped}%,brand.ilike.%${escaped}%,food_type_category_code.ilike.%${escaped}%,barcode.ilike.%${escaped}%,source_food_code.ilike.%${escaped}%`;

  const direct = await searchProductsByFilter(orFilter);
  const aliasIds = await searchAliasProductIds(query);
  const aliasMatches = await fetchProductsByIds(aliasIds);
  return mergeProducts(direct, aliasMatches);
}
