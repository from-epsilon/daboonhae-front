// Supabase 제품 데이터 조회 + mock shape 변환
// - foods 테이블 기준, food_type_categories / food_nutrients 조인
// - food_families / food_purpose_category_links / food_aliases는 RLS가 허용되면 함께 조회,
//   anon 권한이 막혀 있으면(permission denied) 자동으로 빼고 재조회(폴백)
// - 기존 mockProducts.js와 동일한 shape으로 변환하여 adapters/analyzers 호환 유지
// - 컬럼은 SUPABASE_PRODUCT_QUERY_GUIDE 기준 신규 스키마만 사용(레거시 컬럼 사용 금지)

import { supabase } from '../lib/supabase.js';

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

function parseNutrition(foodNutrients) {
  const n = {
    calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0,
    sodium: 0, transFat: 0, saturatedFat: 0, cholesterol: 0, allulose: undefined,
    bcaa: 0, leucine: 0, isoleucine: 0, valine: 0,
    lysine: 0, methionine: 0, phenylalanine: 0, threonine: 0, tryptophan: 0, histidine: 0,
  };
  for (const fn of foodNutrients ?? []) {
    const key = NUTRIENT_KEY[fn.nutrient_code];
    if (key) n[key] = fn.amount ?? 0;
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
    }));
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
  return text.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean);
}

// ── Supabase row → mock product shape
function transformProduct(food) {
  const nutrition = parseNutrition(food.food_nutrients);
  const allergens = parseAllergens(food.allergens_text);
  const lactoseFree = !allergens.some(a => a.includes('우유') || a.includes('유당'));
  const purposeCategories = parsePurposeCategories(food.food_purpose_category_links);
  const basis = nutritionBasisOf(food);
  const family = parseFamily(food.food_families);
  const purchaseLinks = parsePurchaseLinks(food.food_purchase_links);

  // 영양 기준량 표기 (예: '250ml', '100g'); 기준량 없으면 빈 문자열
  const volume = basis.amount != null ? `${basis.amount}${basis.unit ?? ''}` : '';

  return {
    id: food.id,
    name: food.name ?? '',
    brand: food.brand ?? '',
    thumbnail: food.image_url ?? '',
    volume,
    // 표시용 식품유형 라벨(name_ko 우선) + 매칭용 코드 분리 보존
    category: food.food_type_categories?.name_ko ?? food.food_type_category_code ?? '',
    categoryCode: food.food_type_category_code ?? '',
    family,
    purposeCategories,
    purposesFit: derivePurposesFit(nutrition),
    nutrition,
    ingredients: {
      sweeteners: [],
      proteinSources: [],
      allergens,
      lactoseFree,
    },
    description: '',
    purchaseUrl: food.source_url ?? '#',
    purchaseLinks,
    rankingScore: deriveRankingScore(nutrition),
    _raw: {
      ingredientsText: food.ingredients_text ?? '',
      allergensText: food.allergens_text ?? '',
      crossContaminationText: food.cross_contamination_text ?? '',
      barcode: food.barcode ?? '',
      foodNutrients: food.food_nutrients ?? [],
      // 영양표 토글/per100 계산에 쓰는 '기준량' (이전 servingSize 자리)
      servingSize: basis.amount,
      servingUnit: basis.unit,
      servingDescription: food.serving_description ?? '',
      nutritionBasisType: basis.type,
      sizeVariantLabel: food.size_variant_label ?? '',
      isMfdsOfficial: food.is_mfds_official_source ?? false,
      sourceUrl: food.source_url ?? '',
      sourceFoodCode: food.source_food_code ?? '',
      aliases: (food.food_aliases ?? []).map((a) => a.alias).filter(Boolean),
    },
  };
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
  food_purchase_links ( vendor_name, url, quantity, price, is_active ),
`;

// ── 목록 select 절 (목록/검색 공통). optional=true면 family/purpose 조인 포함
const LIST_SELECT_BASE = (optional) => `
  id, name, brand, barcode, image_url,
  is_mfds_official_source, source_url, source_food_code,
  net_content_amount, net_content_unit,
  package_unit_count, package_unit_name, package_unit_amount,
  serving_amount, serving_description, nutrition_basis_type,
  ingredients_text, allergens_text, cross_contamination_text,
  food_type_category_code, family_id, size_variant_label, updated_at,
  food_type_categories ( code, name_ko ),
  ${optional ? FAMILY_JOIN : ''}
  ${optional ? PURPOSE_JOIN : ''}
  ${PURCHASE_JOIN}
  food_nutrients (
    nutrient_code, amount, unit, amount_text,
    nutrients ( code, name_ko, default_unit, display_order )
  )
`;

// ── 단건 상세 select 절. optional=true면 family/purpose/alias 조인 포함
const DETAIL_SELECT_BASE = (optional) => `
  id, name, brand, barcode, image_url,
  is_mfds_official_source, source_url, source_food_code,
  net_content_amount, net_content_unit,
  package_unit_count, package_unit_name, package_unit_amount,
  serving_amount, serving_description, nutrition_basis_type,
  ingredients_text, allergens_text, cross_contamination_text,
  food_type_category_code, family_id, size_variant_label, updated_at,
  food_type_categories ( code, name_ko ),
  ${optional ? FAMILY_JOIN : ''}
  ${optional ? PURPOSE_JOIN : ''}
  ${PURCHASE_JOIN}
  food_nutrients (
    nutrient_code, amount, unit, amount_text,
    nutrients ( code, name_ko, name_en, default_unit, group_name, display_order )
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

// ── 제품 목록 전체 조회
export async function fetchProducts() {
  if (optionalJoinsAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(LIST_SELECT_BASE(true))
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (!error) return (data ?? []).map(transformProduct);
    if (!isOptionalJoinError(error)) throw error;
    optionalJoinsAvailable = false;
    console.warn('[productApi] 선택 조인(food_families/purpose/aliases) 불가, 기본 조인으로 폴백');
  }

  const { data, error } = await supabase
    .from('foods')
    .select(LIST_SELECT_BASE(false))
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformProduct);
}

// ── 단건 상세 조회
export async function fetchProductById(id) {
  if (optionalJoinsAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(DETAIL_SELECT_BASE(true))
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (!error) return transformProduct(data);
    if (!isOptionalJoinError(error)) throw error;
    optionalJoinsAvailable = false;
  }

  const { data, error } = await supabase
    .from('foods')
    .select(DETAIL_SELECT_BASE(false))
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return transformProduct(data);
}

// ── 텍스트 검색 (이름/브랜드/식품유형코드/바코드/원천코드)
export async function searchProductsRemote(query) {
  const escaped = query.replaceAll('%', '\\%').replaceAll('_', '\\_');
  const orFilter = `name.ilike.%${escaped}%,brand.ilike.%${escaped}%,food_type_category_code.ilike.%${escaped}%,barcode.ilike.%${escaped}%,source_food_code.ilike.%${escaped}%`;

  if (optionalJoinsAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(LIST_SELECT_BASE(true))
      .eq('is_active', true)
      .or(orFilter)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (!error) return (data ?? []).map(transformProduct);
    if (!isOptionalJoinError(error)) throw error;
    optionalJoinsAvailable = false;
  }

  const { data, error } = await supabase
    .from('foods')
    .select(LIST_SELECT_BASE(false))
    .eq('is_active', true)
    .or(orFilter)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map(transformProduct);
}
