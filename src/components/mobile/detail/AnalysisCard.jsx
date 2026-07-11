// 모바일 디테일 — 룰 기반 분석 리포트 카드 집합
// - 현재 선택된 purpose의 reportSections를 순회하며 카드로 렌더
// - 각 섹션은 analyzeSection(raw, sectionId) 결과 문장 배열을 받음
// - 데이터-우선 톤 (analyzers.js가 이미 numbers-first로 짜여 있음)
import { analyzeSection } from '../../../data/analyzers.js';
import { useResolvedProteinSources, useResolvedSweeteners } from '../../../data/proteinQuality.js';
import { IconInfo } from '../../ds/Icons.jsx';
import { IngredientList } from './IngredientList.jsx';

function round1(value) {
  return Math.round(value * 10) / 10;
}

function formatG(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${round1(value).toLocaleString()}g`;
}

function formatKcal(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${Math.round(value).toLocaleString()}kcal`;
}

function formatNutrientAmount(fn) {
  if (fn.amount_text) return fn.amount_text;
  const unit = fn.unit || fn.nutrients?.default_unit || '';
  return fn.amount != null ? `${fn.amount}${unit}` : '-';
}

function normalizeMixerName(name) {
  if (name === '대유') return '두유';
  return name;
}

function getShakePreparation(additionalContent) {
  const item = (additionalContent ?? []).find((content) => content?.kind === 'shake_preparation');
  if (!item) return {};
  const data = item.data ?? {};
  const rawNames = Array.isArray(data.mixer_names)
    ? data.mixer_names
    : String(data.mixer_name ?? '').split(',').map((name) => name.trim()).filter(Boolean);
  const mixerNames = [...new Set(rawNames.map(normalizeMixerName).filter(Boolean))];
  const amount = Number(data.mixer_amount);
  const unit = data.mixer_unit || 'ml';
  const body = item.body || (mixerNames.length > 0 && Number.isFinite(amount) && amount > 0
    ? `${mixerNames.join(' 또는 ')} ${amount}${unit}에 타서 섭취`
    : '');
  const hasWaterOnly = mixerNames.length > 0 && mixerNames.every((name) => name === '물');
  const hasMilkLike = mixerNames.some((name) => name.includes('우유') || name.includes('두유'));
  const calorieRange = hasMilkLike && Number.isFinite(amount) && amount > 0
    ? {
      min: Math.round(amount * 0.35),
      max: Math.round(amount * 0.7),
    }
    : null;
  const calorieText = calorieRange
    ? `${mixerNames.filter((name) => name !== '물').join('·') || '우유·두유'} 선택 시 +${calorieRange.min}~${calorieRange.max}kcal 정도`
    : hasWaterOnly
      ? '물 기준 추가 열량은 없어요.'
      : null;
  const extraCaloriesLabel = calorieRange
    ? `+${calorieRange.min}~${calorieRange.max}kcal`
    : hasWaterOnly
      ? '+0kcal'
      : null;
  return { body, calorieText, extraCaloriesLabel };
}

function nutrientAmountInfo(foodNutrients, pattern) {
  let found = false;
  const total = (foodNutrients ?? []).reduce((sum, fn) => {
    const code = fn?.nutrient_code || fn?.nutrients?.code || '';
    const name = fn?.nutrients?.name_ko || '';
    if (!pattern.test(`${code} ${name}`)) return sum;
    found = true;
    return sum + (Number(fn.amount) || 0);
  }, 0);
  return found ? total : null;
}

function nutrientValueIfShown(nutrition, foodNutrients, key, pattern) {
  if (nutrientAmountInfo(foodNutrients, pattern) === null) return null;
  const value = nutrition?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatGOrUnknown(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '정보 없음';
  return formatG(value);
}

function formatKcalOrUnknown(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '정보 없음';
  return formatKcal(value);
}

function carbCaloriePercent(carbs, calories) {
  if (typeof carbs !== 'number' || !Number.isFinite(carbs)) return null;
  if (!(calories > 0)) return null;
  return (carbs * 4 / calories) * 100;
}

function formatCarbCaloriePercent(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '정보 없음';
  return `${Math.round(value).toLocaleString()}%`;
}

function nutrientNote(label, value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${label} ${formatG(value)}`
    : `${label} 정보 없음`;
}

function carbComponentNote(type, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return `${type} 정보 없음`;
  if (type === '당알코올') return '혈당·소화 부담은 종류와 양에 따라 달라요.';
  if (type === '식이섬유') return '포만감 유지와 장 건강에 도움이 될 수 있어요.';
  return undefined;
}

const COMPLETENESS_TERMS = ['비타민', '칼슘', '철', '아연', '마그네슘', '칼륨', '엽산', '나이아신', '비오틴', '판토텐산'];

function displayedMicronutrients(foodNutrients) {
  return (foodNutrients ?? [])
    .filter((fn) => {
      const name = fn.nutrients?.name_ko || fn.nutrient_code || '';
      return COMPLETENESS_TERMS.some((term) => name.includes(term));
    })
    .sort((a, b) => (a.nutrients?.display_order ?? 999) - (b.nutrients?.display_order ?? 999))
    .slice(0, 8);
}

function bestUnitPrice(product) {
  const offers = product?.purchaseLinks ?? [];
  let best = Infinity;
  for (const offer of offers) {
    if (!offer || offer.is_active === false || typeof offer.price !== 'number') continue;
    const qty = Number(offer.quantity ?? 1);
    const unit = Number.isFinite(qty) && qty > 0 ? offer.price / qty : offer.price;
    if (unit < best) best = unit;
  }
  return best === Infinity ? null : best;
}

function servingPrice(product) {
  const unit = bestUnitPrice(product);
  const servings = Number(product?._raw?.servingsPerUnit);
  if (!(unit > 0)) return null;
  return servings > 0 ? unit / servings : unit;
}

function proteinPer100Kcal(product) {
  const protein = product?.nutrition?.protein;
  const calories = product?.nutrition?.calories;
  if (!(protein > 0) || !(calories > 0)) return null;
  return (protein / calories) * 100;
}

function proteinPer1000Won(product) {
  const protein = product?.nutrition?.protein;
  const price = servingPrice(product);
  if (!(protein > 0) || !(price > 0)) return null;
  return (protein / price) * 1000;
}

function caloriesPer1000Won(product) {
  const calories = product?.nutrition?.calories;
  const price = servingPrice(product);
  if (!(calories > 0) || !(price > 0)) return null;
  return (calories / price) * 1000;
}

const SHAKE_POSITION_MODES = [
  { key: 'total', label: '1회분당' },
  { key: 'kcal', label: '100kcal당' },
  { key: 'price', label: '1,000원당' },
];

const SHAKE_POSITION_BASES = [
  {
    key: 'calories',
    label: '열량',
    unit: 'kcal',
    getValue: (product, mode) => {
      if (mode === 'total') return product?.nutrition?.calories;
      if (mode === 'price') return caloriesPer1000Won(product);
      return null;
    },
    direction: { total: 'asc', price: 'desc' },
  },
  {
    key: 'carbs',
    label: '탄수화물',
    unit: 'g',
    getValue: (product, mode) => {
      if (mode === 'total') return product?.nutrition?.carbs;
      if (mode === 'price') {
        const carbs = product?.nutrition?.carbs;
        const price = servingPrice(product);
        return carbs > 0 && price > 0 ? (carbs / price) * 1000 : null;
      }
      return null;
    },
    direction: { total: 'asc', price: 'desc' },
  },
  {
    key: 'sugar',
    label: '당류',
    unit: 'g',
    getValue: (product, mode) => mode === 'total' ? product?.nutrition?.sugar : null,
    direction: { total: 'asc' },
  },
  {
    key: 'protein',
    label: '단백질',
    unit: 'g',
    getValue: (product, mode) => {
      if (mode === 'total') return product?.nutrition?.protein;
      if (mode === 'kcal') return proteinPer100Kcal(product);
      if (mode === 'price') return proteinPer1000Won(product);
      return null;
    },
    direction: { total: 'desc', kcal: 'desc', price: 'desc' },
  },
];

function sameShakeCategory(product) {
  return product?.categoryCode === 'shake' || product?.category === '쉐이크';
}

function formatPositionValue(value, unit) {
  if (unit === 'kcal') return formatKcal(value);
  return formatG(value);
}

function buildPositions(rawProduct, products) {
  const peers = (products ?? []).filter(sameShakeCategory);
  if (rawProduct && !peers.some((p) => String(p.id) === String(rawProduct.id))) peers.push(rawProduct);

  const ranks = {};
  for (const base of SHAKE_POSITION_BASES) {
    ranks[base.key] = {};
    for (const mode of SHAKE_POSITION_MODES) {
      const direction = base.direction?.[mode.key] ?? 'desc';
      const rows = peers
        .map((product) => ({ product, value: base.getValue(product, mode.key) }))
        .filter((row) => typeof row.value === 'number' && Number.isFinite(row.value) && row.value > 0)
        .sort((a, b) => direction === 'asc' ? a.value - b.value : b.value - a.value);
      const index = rows.findIndex((row) => String(row.product.id) === String(rawProduct?.id));
      ranks[base.key][mode.key] = index >= 0 ? {
        rank: index + 1,
        total: rows.length,
        value: rows[index].value,
        unit: base.unit,
      } : null;
    }
  }
  return ranks;
}

function carbCards(n, foodNutrients) {
  const sugar = nutrientValueIfShown(n, foodNutrients, 'sugar', /sugars_g|당류/i);
  const sugarAlcohol = nutrientAmountInfo(foodNutrients, /에리스리톨|말티톨|자일리톨|소르비톨|당알코올|erythritol|maltitol|xylitol|sorbitol|polyol/i);
  const fiber = nutrientValueIfShown(n, foodNutrients, 'fiber', /dietary_fiber|식이섬유/i);
  return [
    {
      key: 'sugar',
      label: '당류',
      value: sugar,
    },
    {
      key: 'sugarAlcohol',
      label: '당알코올',
      value: sugarAlcohol,
      note: carbComponentNote('당알코올', sugarAlcohol),
    },
    {
      key: 'fiber',
      label: '식이섬유',
      value: fiber,
      note: carbComponentNote('식이섬유', fiber),
    },
  ];
}

function carbMealCriterion(carbShare) {
  if (typeof carbShare !== 'number' || !Number.isFinite(carbShare)) return '식사대용 적합도 정보 없음';
  if (carbShare < 35) return '보충형에 가까움 · 열량 대비 탄수화물 낮음';
  if (carbShare < 45) return '낮은 편 · 식사대용 기준보다 낮음';
  if (carbShare <= 65) return '식사대용 기본 구간';
  return '탄수화물 높음 · 목적에 맞는지 확인 필요';
}

function proteinSourceType(name) {
  if (/WPI|분리유청|분리 유청/i.test(name)) return '분리유청';
  if (/WPC|농축유청|농축 유청/i.test(name)) return '농축유청';
  if (/카제인/i.test(name)) return '카제인';
  if (/대두|소이|soy/i.test(name)) return '대두';
  if (/완두|pea/i.test(name)) return '완두';
  return '단백질원';
}

function ShakeMetricCard({ label, value, note, tone }) {
  const isMissingValue = value === '정보 없음' || value === '데이터 없음';
  return (
    <div className={`m-detail-shake-metric${tone ? ` is-${tone}` : ''}`}>
      <span>{label}</span>
      <strong className={isMissingValue ? 'is-missing' : undefined}>{value}</strong>
      {note && <p>{note}</p>}
    </div>
  );
}

function ShakeSection({ title, children }) {
  return (
    <article className="m-detail-card m-detail-shake-section">
      <header className="m-detail-report-head">
        <h3 className="m-detail-report-title">{title}</h3>
      </header>
      {children}
    </article>
  );
}

function ShakeReportMobile({ rawProduct, products }) {
  const n = rawProduct?.nutrition ?? {};
  const raw = rawProduct?._raw ?? {};
  const ingredients = rawProduct?.ingredients ?? {};
  const foodNutrients = raw.foodNutrients ?? [];
  const preparation = getShakePreparation(raw.additionalContent);
  const positions = buildPositions(rawProduct, products);
  const carbComposition = carbCards(n, foodNutrients);
  const calories = nutrientValueIfShown(n, foodNutrients, 'calories', /energy_kcal|열량/i);
  const carbs = nutrientValueIfShown(n, foodNutrients, 'carbs', /carbohydrate_g|탄수화물/i);
  const carbShare = carbCaloriePercent(carbs, calories);
  const sugar = nutrientValueIfShown(n, foodNutrients, 'sugar', /sugars_g|당류/i);
  const fiber = nutrientValueIfShown(n, foodNutrients, 'fiber', /dietary_fiber|식이섬유/i);
  const protein = nutrientValueIfShown(n, foodNutrients, 'protein', /protein_g|단백질/i);
  const fat = nutrientValueIfShown(n, foodNutrients, 'fat', /fat_g|(^|\s)지방(\s|$)/i);
  const saturatedFat = nutrientValueIfShown(n, foodNutrients, 'saturatedFat', /saturated_fat|포화지방/i);
  const proteinSources = ingredients.proteinSources ?? [];
  const sweeteners = ingredients.sweeteners ?? [];
  const micronutrients = displayedMicronutrients(foodNutrients);
  const displaySources = useResolvedProteinSources(proteinSources)
    .map((source) => source.abbreviation ? `${source.nameKo}(${source.abbreviation})` : source.nameKo);
  const displaySweeteners = useResolvedSweeteners(sweeteners);
  const calorieNote = preparation.body ? (
    <>
      <span className="m-detail-shake-note-line">{preparation.calorieText || '제품 표시 기준 열량입니다.'}</span>
      <span className="m-detail-shake-note-line is-method">권장용법: {preparation.body}</span>
    </>
  ) : (preparation.calorieText || '제품 표시 기준 열량입니다.');

  return (
    <section className="m-detail-report">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">분석 리포트</h2>
        <span className="m-detail-section-sub">쉐이크</span>
      </header>
      <div className="m-detail-shake-grid">
        <ShakeSection title="탄단지 구성">
          <div className="m-detail-shake-metrics is-two">
            <ShakeMetricCard label="탄수화물" value={formatGOrUnknown(carbs)} note={`${nutrientNote('당류', sugar)} · ${nutrientNote('식이섬유', fiber)}`} />
            <ShakeMetricCard label="단백질" value={formatGOrUnknown(protein)} note={displaySources.length > 0 ? displaySources.join(' · ') : '단백질원 정보 없음'} />
            <ShakeMetricCard label="지방" value={formatGOrUnknown(fat)} note={saturatedFat !== null ? `포화지방 ${formatGOrUnknown(saturatedFat)}` : '포화지방 정보 없음'} />
          </div>
        </ShakeSection>

        <ShakeSection title="핵심 판단">
          <div className="m-detail-shake-metrics is-two">
            <ShakeMetricCard
              label="열량"
              value={preparation.extraCaloriesLabel ? `${formatKcalOrUnknown(calories)} · ${preparation.extraCaloriesLabel}` : formatKcalOrUnknown(calories)}
              note={calorieNote}
              tone="calorie"
            />
            <ShakeMetricCard
              label="탄수화물"
              value={formatCarbCaloriePercent(carbShare)}
              note={carbMealCriterion(carbShare)}
            />
            <ShakeMetricCard label="단백질" value={formatGOrUnknown(protein)} note={displaySources.length > 0 ? displaySources.join(' · ') : '단백질원 정보 없음'} />
          </div>
        </ShakeSection>

        <ShakeSection title="탄수화물 구성">
          <div className="m-detail-shake-metrics is-carb">
            {carbComposition.map((card) => (
              <ShakeMetricCard
                key={card.key}
                label={card.label}
                value={formatGOrUnknown(card.value)}
                note={card.key === 'sugar' ? undefined : card.note}
                tone={card.tone}
              />
            ))}
          </div>
        </ShakeSection>

        <ShakeSection title="동일 카테고리 위치">
          <div className="m-detail-shake-position">
            <div className="m-detail-shake-position-row is-head">
              <span>성분</span>
              {SHAKE_POSITION_MODES.map((mode) => (
                <b key={mode.key}>{mode.label}</b>
              ))}
            </div>
            {SHAKE_POSITION_BASES.map((base) => (
              <div className="m-detail-shake-position-row" key={base.key}>
                <span>{base.label}</span>
                {SHAKE_POSITION_MODES.map((mode) => {
                  const rank = positions?.[base.key]?.[mode.key];
                  return (
                    <div key={mode.key} className={!rank ? 'is-empty' : ''}>
                      {rank ? (
                        <>
                          <strong>{rank.rank}위</strong>
                          <em>/ {rank.total}개 · {formatPositionValue(rank.value, rank.unit)}</em>
                        </>
                    ) : (
                      <em>-</em>
                    )}
                  </div>
                );
                })}
              </div>
            ))}
          </div>
          <p className="m-detail-report-empty">1,000원당 값은 1회분당 최저가 기준이에요.</p>
        </ShakeSection>

        <ShakeSection title="단백질원">
          <div className="m-detail-shake-chip-list">
            {displaySources.length > 0
              ? displaySources.map((name) => (
                <span key={`p-${name}`}>
                  <strong>{name}</strong>
                  {proteinSourceType(name) !== name ? proteinSourceType(name) : null}
                </span>
              ))
              : <p className="m-detail-report-empty">추출된 단백질원 정보가 아직 없어요.</p>}
          </div>
        </ShakeSection>

        <ShakeSection title="대체당">
          <div className="m-detail-shake-chip-list">
            {displaySweeteners.length > 0
              ? displaySweeteners.map((sweetener) => (
                <span key={`s-${sweetener.code}`}>
                  <strong>{sweetener.nameKo}</strong>
                  {sweetener.sweetenerType || '대체당'}
                </span>
              ))
              : <p className="m-detail-report-empty">추출된 대체당 정보가 아직 없어요.</p>}
          </div>
        </ShakeSection>

        <ShakeSection title="추가 성분">
          <div className="m-detail-shake-chip-list">
            {micronutrients.length > 0
              ? micronutrients.map((fn) => (
                <span key={fn.nutrient_code}>
                  <strong>{fn.nutrients?.name_ko || fn.nutrient_code}</strong>
                  {formatNutrientAmount(fn)}
                </span>
              ))
              : <p className="m-detail-report-empty">추가 영양성분 정보가 없어요.</p>}
          </div>
        </ShakeSection>
        <IngredientList
          ingredients={ingredients}
          rawText={raw.ingredientsText}
          annotations={raw.ingredientAnnotations}
          rawOnly
          title="원재료명"
        />
      </div>
    </section>
  );
}

// 단일 분석 카드 — 제목 + 문장 리스트
function ReportCard({ title, lines, index }) {
  return (
    <article className="m-detail-card m-detail-report-card">
      <header className="m-detail-report-head">
        <span className="m-detail-report-index">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="m-detail-report-title">{title}</h3>
      </header>
      {lines.length > 0 ? (
        <ul className="m-detail-report-lines">
          {lines.map((line, i) => (
            <li key={i} className="m-detail-report-line">{line}</li>
          ))}
        </ul>
      ) : (
        <p className="m-detail-report-empty">분석할 정보가 부족합니다.</p>
      )}
    </article>
  );
}

// 목적 안내 (purpose === 'all' 일 때만 노출)
function PurposeHint({ purposeId }) {
  if (purposeId !== 'all') return null;
  return (
    <div className="m-detail-report-hint">
      <IconInfo size={14} />
      <span>기본 리포트는 제품 유형에 맞는 주요 관점을 자동으로 묶어 보여줘요.</span>
    </div>
  );
}

const BASE_REPORT_SECTIONS = [
  { id: 'basic_info', title: '기본 영양 정보' },
  { id: 'calorie_sugar', title: '칼로리·당류 포인트' },
  { id: 'protein_content', title: '단백질 포인트' },
];

const CATEGORY_REPORT_SECTIONS = {
  chicken_breast: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'protein_content', title: '단백질 함량' },
    { id: 'calorie_sugar', title: '칼로리·당류' },
    { id: 'post_workout', title: '운동 후 섭취' },
  ],
  protein_drink: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'protein_content', title: '단백질 함량·원료' },
    { id: 'bcaa_profile', title: 'BCAA·아미노산' },
    { id: 'post_workout', title: '운동 후 섭취' },
  ],
  energy_bar: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'meal_balance', title: '한 끼 균형' },
    { id: 'protein_content', title: '단백질 포인트' },
    { id: 'satiety', title: '포만감' },
  ],
  processed_meat: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'protein_content', title: '단백질 포인트' },
    { id: 'calorie_sugar', title: '칼로리·당류' },
    { id: 'meal_balance', title: '식사 균형' },
  ],
  ice_cream: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'calorie_sugar', title: '칼로리·당류' },
    { id: 'sugar_warning', title: '저당 포인트' },
    { id: 'weight_loss_fit', title: '체중감량 적합도' },
  ],
  snack_sweets: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'calorie_sugar', title: '칼로리·당류' },
    { id: 'carb_fiber', title: '탄수화물·식이섬유' },
    { id: 'sugar_warning', title: '저당 포인트' },
  ],
  zero_drink: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'sugar_warning', title: '당류·대체당' },
    { id: 'glucose_fit', title: '저당 적합도' },
  ],
  rice: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'meal_balance', title: '한 끼 균형' },
    { id: 'carb_fiber', title: '탄수화물·식이섬유' },
    { id: 'satiety', title: '포만감' },
  ],
  noodle: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'meal_balance', title: '한 끼 균형' },
    { id: 'carb_fiber', title: '탄수화물·식이섬유' },
    { id: 'satiety', title: '포만감' },
  ],
  cereal_granola_oat: [
    { id: 'basic_info', title: '기본 영양 정보' },
    { id: 'meal_balance', title: '한 끼 균형' },
    { id: 'carb_fiber', title: '탄수화물·식이섬유' },
    { id: 'satiety', title: '포만감' },
  ],
};

function getDefaultReportSections(rawProduct) {
  return CATEGORY_REPORT_SECTIONS[rawProduct?.categoryCode] ?? BASE_REPORT_SECTIONS;
}

export function AnalysisCard({ rawProduct, purpose, purposeId, products }) {
  if (rawProduct?.categoryCode === 'shake' || rawProduct?.category === '쉐이크') {
    return <ShakeReportMobile rawProduct={rawProduct} products={products} />;
  }

  const isDefaultReport = purposeId === 'all';
  const sections = isDefaultReport ? getDefaultReportSections(rawProduct) : (purpose?.reportSections ?? []);
  const reportRows = sections
    .map((sec) => ({ ...sec, lines: analyzeSection(rawProduct, sec.id) }))
    .filter((row) => !isDefaultReport || row.lines.length > 0);

  return (
    <section className="m-detail-report">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">분석 리포트</h2>
        <span className="m-detail-section-sub">
          {isDefaultReport ? '기본 리포트' : `${purpose?.label ?? '전체'} 기준`}
        </span>
      </header>
      <PurposeHint purposeId={purposeId} />
      <div className="m-detail-report-grid">
        {reportRows.map((sec, idx) => (
          <ReportCard
            key={sec.id}
            index={idx}
            title={sec.title}
            lines={sec.lines}
          />
        ))}
      </div>
      <IngredientList
        ingredients={rawProduct?.ingredients}
        rawText={rawProduct?._raw?.ingredientsText}
        annotations={rawProduct?._raw?.ingredientAnnotations}
        rawOnly
        title="원재료명"
      />
    </section>
  );
}
