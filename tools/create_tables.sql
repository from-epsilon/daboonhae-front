-- ============================================================
-- 다분해 제품 DB 스키마 (Supabase SQL Editor에서 실행)
-- 가이드: SUPABASE_PRODUCT_QUERY_GUIDE.md 기준
-- ============================================================

-- 1. 식품유형 카테고리
CREATE TABLE IF NOT EXISTS food_type_categories (
  code       TEXT PRIMARY KEY,
  name_ko    TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 영양성분 사전
CREATE TABLE IF NOT EXISTS nutrients (
  code          TEXT PRIMARY KEY,
  name_ko       TEXT NOT NULL,
  name_en       TEXT,
  default_unit  TEXT NOT NULL DEFAULT '',
  group_name    TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 제품 기본 정보
CREATE TABLE IF NOT EXISTS foods (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT NOT NULL,
  brand                    TEXT,
  barcode                  TEXT,
  image_url                TEXT,
  serving_size             NUMERIC,
  serving_unit             TEXT,
  nutrition_values_basis    TEXT,
  nutrition_basis_amount    NUMERIC,
  nutrition_basis_unit      TEXT,
  food_type_category_code  TEXT REFERENCES food_type_categories(code),
  ingredients_text         TEXT,
  allergens_text           TEXT,
  cross_contamination_text TEXT,
  is_active                BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_foods_active ON foods(is_active);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(food_type_category_code);
CREATE INDEX IF NOT EXISTS idx_foods_updated ON foods(updated_at DESC);

-- 4. 제품별 영양성분
CREATE TABLE IF NOT EXISTS food_nutrients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id       UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  nutrient_code TEXT NOT NULL REFERENCES nutrients(code),
  amount        NUMERIC,
  unit          TEXT,
  amount_text   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(food_id, nutrient_code)
);

CREATE INDEX IF NOT EXISTS idx_food_nutrients_food ON food_nutrients(food_id);

-- 5. 검색용 별칭 (선택)
CREATE TABLE IF NOT EXISTS food_aliases (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  alias   TEXT NOT NULL
);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_foods_updated
  BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_food_type_categories_updated
  BEFORE UPDATE ON food_type_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_nutrients_updated
  BEFORE UPDATE ON nutrients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS 정책 (anon 공개 읽기)
-- ============================================================
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_type_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active foods"
  ON foods FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read food type categories"
  ON food_type_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read food nutrients"
  ON food_nutrients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM foods
      WHERE foods.id = food_nutrients.food_id
        AND foods.is_active = true
    )
  );

CREATE POLICY "Public can read nutrients"
  ON nutrients FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read food aliases"
  ON food_aliases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM foods
      WHERE foods.id = food_aliases.food_id
        AND foods.is_active = true
    )
  );

-- ============================================================
-- 초기 영양성분 사전 데이터
-- ============================================================
INSERT INTO nutrients (code, name_ko, name_en, default_unit, group_name, display_order) VALUES
  ('energy_kcal',     '열량',       'Energy',        'kcal', '기본', 1),
  ('protein_g',       '단백질',     'Protein',       'g',    '기본', 2),
  ('carbohydrate_g',  '탄수화물',   'Carbohydrate',  'g',    '기본', 3),
  ('sugars_g',        '당류',       'Sugars',        'g',    '기본', 4),
  ('fat_g',           '지방',       'Fat',           'g',    '기본', 5),
  ('saturated_fat_g', '포화지방',   'Saturated Fat', 'g',    '기본', 6),
  ('trans_fat_g',     '트랜스지방', 'Trans Fat',     'g',    '기본', 7),
  ('cholesterol_mg',  '콜레스테롤', 'Cholesterol',   'mg',   '기본', 8),
  ('sodium_mg',       '나트륨',     'Sodium',        'mg',   '기본', 9),
  ('dietary_fiber_g', '식이섬유',   'Dietary Fiber', 'g',    '추가', 10)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 초기 식품유형 카테고리 데이터
-- ============================================================
INSERT INTO food_type_categories (code, name_ko) VALUES
  ('chicken_breast', '닭가슴살'),
  ('protein_drink',  '프로틴 드링크'),
  ('protein_bar',    '프로틴 바'),
  ('zero_drink',     '제로 음료'),
  ('snack',          '간식'),
  ('cereal_granola', '시리얼·그래놀라'),
  ('konjac_noodle',  '곤약·면'),
  ('egg_meal',       '계란·간편식'),
  ('sausage_ham',    '소시지/햄'),
  ('shake',          '셰이크'),
  ('icecream',       '아이스크림'),
  ('rice_noodle',    '밥/면류')
ON CONFLICT (code) DO NOTHING;
