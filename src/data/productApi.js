// Supabase 제품 데이터 조회 + mock shape 변환
// - foods 테이블 기준, food_type_categories / food_nutrients 조인
// - 기존 mockProducts.js와 동일한 shape으로 변환하여 adapters/analyzers 호환 유지

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

// ── food_purpose_category_links → 정규화된 목적 카테고리 배열
// - DB 다대다 링크에서 { code, name } 형태로 추출
// - name은 name_ko 우선, 없으면 코드 fallback
function parsePurposeCategories(links) {
  if (!Array.isArray(links)) return [];
  return links
    .map((l) => ({
      code: l.purpose_category_code,
      name: l.food_purpose_categories?.name_ko ?? l.purpose_category_code,
    }))
    .filter((p) => p.code);
}

// ── 영양값 기반 목적 자동 태깅 (DB 링크가 비었을 때 폴백)
// - food_purpose_category_links 데이터가 아직 채워지지 않은 제품 대비용
// - DB 링크가 있으면 그것을 우선 사용
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

  return {
    id: food.id,
    name: food.name ?? '',
    brand: food.brand ?? '',
    thumbnail: food.image_url ?? '',
    volume: food.serving_size != null
      ? `${food.serving_size}${food.serving_unit ?? ''}`
      : '',
    category: food.food_type_categories?.name_ko
      ?? food.food_type_category_code ?? '',
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
    purchaseUrl: '#',
    rankingScore: deriveRankingScore(nutrition),
    _raw: {
      ingredientsText: food.ingredients_text ?? '',
      allergensText: food.allergens_text ?? '',
      crossContaminationText: food.cross_contamination_text ?? '',
      barcode: food.barcode ?? '',
      foodNutrients: food.food_nutrients ?? [],
      servingSize: food.serving_size ?? null,
      servingUnit: food.serving_unit ?? '',
      nutritionBasis: food.nutrition_values_basis ?? '',
      nutritionBasisAmount: food.nutrition_basis_amount ?? null,
      nutritionBasisUnit: food.nutrition_basis_unit ?? '',
    },
  };
}

// ── 목록 select 절 (목록/검색 공통)
const PURPOSE_JOIN = `
  food_purpose_category_links (
    purpose_category_code,
    food_purpose_categories ( code, name_ko )
  ),
`;

const LIST_SELECT_BASE = (purpose) => `
  id, name, brand, barcode, image_url,
  serving_size, serving_unit,
  nutrition_values_basis, nutrition_basis_amount, nutrition_basis_unit,
  ingredients_text, allergens_text, cross_contamination_text,
  food_type_category_code,
  food_type_categories ( code, name_ko ),
  ${purpose ? PURPOSE_JOIN : ''}
  food_nutrients (
    nutrient_code, amount, unit, amount_text,
    nutrients ( code, name_ko, default_unit, display_order )
  )
`;

const LIST_SELECT = LIST_SELECT_BASE(true);
const LIST_SELECT_NO_PURPOSE = LIST_SELECT_BASE(false);

// 목적 카테고리 테이블 RLS가 막혀있을 때 한 번 false로 떨어뜨리고 그 후 재시도 안 함
let purposeJoinAvailable = true;

function isPurposeJoinError(error) {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  return (
    error.code === '42501' ||
    msg.includes('food_purpose_category') ||
    msg.includes('permission denied')
  );
}

// ── 제품 목록 전체 조회
export async function fetchProducts() {
  if (purposeJoinAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(LIST_SELECT)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (!error) return (data ?? []).map(transformProduct);
    if (!isPurposeJoinError(error)) throw error;
    // 목적 카테고리 RLS 미허용 → 폴백
    purposeJoinAvailable = false;
    console.warn('[productApi] purpose category join 불가, food_type 폴백으로 전환');
  }

  const { data, error } = await supabase
    .from('foods')
    .select(LIST_SELECT_NO_PURPOSE)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformProduct);
}

// ── 단건 상세 조회
const DETAIL_SELECT_BASE = (purpose) => `
  *,
  food_type_categories ( code, name_ko ),
  ${purpose ? PURPOSE_JOIN : ''}
  food_nutrients (
    nutrient_code, amount, unit, amount_text,
    nutrients ( code, name_ko, name_en, default_unit, group_name, display_order )
  )
`;

export async function fetchProductById(id) {
  if (purposeJoinAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(DETAIL_SELECT_BASE(true))
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (!error) return transformProduct(data);
    if (!isPurposeJoinError(error)) throw error;
    purposeJoinAvailable = false;
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

// ── 텍스트 검색
export async function searchProductsRemote(query) {
  const escaped = query.replaceAll('%', '\\%').replaceAll('_', '\\_');
  const orFilter = `name.ilike.%${escaped}%,brand.ilike.%${escaped}%,food_type_category_code.ilike.%${escaped}%,barcode.ilike.%${escaped}%`;

  if (purposeJoinAvailable) {
    const { data, error } = await supabase
      .from('foods')
      .select(LIST_SELECT)
      .eq('is_active', true)
      .or(orFilter)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (!error) return (data ?? []).map(transformProduct);
    if (!isPurposeJoinError(error)) throw error;
    purposeJoinAvailable = false;
  }

  const { data, error } = await supabase
    .from('foods')
    .select(LIST_SELECT_NO_PURPOSE)
    .eq('is_active', true)
    .or(orFilter)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map(transformProduct);
}
