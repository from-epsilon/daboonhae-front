import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { productPath, parseProductId } from '../data/productUrl.js';
import { useCategoryProducts, useProductDetail } from '../store/ProductsContext.jsx';
import { getAdapted } from '../data/adapters.js';
import { categoryPath } from '../data/categoryTabs.js';
import { getFoodTypeByCode } from '../data/categoryTabs.js';
import { referenceUnitPrice, getCategoryCardConfig } from '../data/categoryCardMetrics.js';
import { AMINO_ACID_KEYS, AMINO_ACID_KO_ALIASES, AMINO_ACID_LABELS, EAA_AMINO_ACIDS, EAA_KEYS } from '../data/aminoAcids.js';
import { NUTRIENT_GROUP, isNutrientGroup } from '../data/nutrientGroups.js';
import { formatProteinSourceLabel, formatSweetenerLabel } from '../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../data/proteinQuality.js';
import { getProteinDrinkRecommendScore } from '../data/listSort.js';
import { useCompare } from '../store/CompareContext.jsx';
import { useWishlist } from '../store/WishlistContext.jsx';

import { ChevronDown } from 'lucide-react';
import ProductThumb from '../components/global/ProductThumb.jsx';
import { MacroRow } from '../components/ds/MacroRow.jsx';
import { IconCompare, IconHeart } from '../components/ds/Icons.jsx';
import { AnalysisReport } from '../components/desktop/detail/AnalysisReport.jsx';
import { CategoryGuide } from '../components/desktop/detail/CategoryGuide.jsx';
import { ReviewSection } from '../components/desktop/detail/ReviewSection.jsx';
import { RelatedProducts } from '../components/desktop/detail/RelatedProducts.jsx';
import PurchaseOffers from '../components/global/PurchaseOffers.jsx';
import Seo from '../components/global/Seo.jsx';
import { productLd, breadcrumbLd } from '../data/jsonLd.js';
import { buildProductBreadcrumb } from '../data/breadcrumb.js';
import './DetailPage.css';

function EmptyState() {
  return (
    <div className="page d-detail-empty">
      <Seo title="존재하지 않는 제품" noindex />
      <p className="d-detail-empty-msg">존재하지 않는 제품이에요.</p>
      <Link className="d-detail-empty-link" to="/">메인으로 가기</Link>
    </div>
  );
}

// #9 풀 breadcrumb — 카테고리 경로형 URL(/category/:slug)
function getCategoryListHref(categoryCode) {
  return categoryPath(categoryCode);
}

function Breadcrumb({ category, categoryCode, productName, onBack }) {
  const categoryHref = getCategoryListHref(categoryCode, category);

  return (
    <nav className="d-detail-breadcrumb" aria-label="경로">
      <Link to="/" className="d-detail-breadcrumb-link">홈</Link>
      <span className="d-detail-breadcrumb-sep">/</span>
      <Link to="/list" className="d-detail-breadcrumb-link">제품 목록</Link>
      {category && (
        <>
          <span className="d-detail-breadcrumb-sep">/</span>
          <Link to={categoryHref} className="d-detail-breadcrumb-link">{category}</Link>
        </>
      )}
      <span className="d-detail-breadcrumb-sep">/</span>
      <span className="d-detail-breadcrumb-current">{productName}</span>
    </nav>
  );
}

function hasNutritionValue(value) {
  return value !== undefined && value !== null && Number.isFinite(Number(value));
}

function splitPreviewDisplayValue(display) {
  const text = String(display ?? '').trim();
  const match = text.match(/^(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return { num: text || '-', unit: '' };
  return {
    num: match[1],
    unit: match[2].trim(),
  };
}

function formatPreviewNutritionValue(value, unit, ratio = 1, { positiveOnly = false, showMissing = false } = {}) {
  if (!Number.isFinite(ratio)) return showMissing ? { num: '-', unit: '' } : null;
  if (!hasNutritionValue(value)) return showMissing ? { num: '-', unit: '' } : null;
  const numeric = Number(value) * ratio;
  if (positiveOnly && numeric <= 0) return showMissing ? { num: '-', unit: '' } : null;
  const rounded = unit === 'mg' || unit === 'kcal'
    ? Math.round(numeric)
    : Math.round(numeric * 10) / 10;
  return {
    num: rounded.toLocaleString(),
    unit,
  };
}

function formatPreviewFoodNutrient(fn, fallbackValue, fallbackUnit, ratio = 1, options = {}) {
  const unit = fn?.unit || fn?.nutrients?.default_unit || fallbackUnit || '';
  if (fn?.amount_text && ratio === 1 && !hasNutritionValue(fn.amount)) {
    return splitPreviewDisplayValue(fn.amount_text);
  }
  return formatPreviewNutritionValue(fn?.amount ?? fallbackValue, unit, ratio, options);
}

function normalizePreviewKoName(value) {
  return String(value ?? '')
    .trim()
    .replace(/^l[-_\s]+/i, '')
    .replace(/^l(?=[가-힣])/i, '')
    .replace(/\s+/g, '');
}

const PREVIEW_AMINO_CODE_SET = new Set(AMINO_ACID_KEYS);
const PREVIEW_AMINO_AGG_CODES = new Set(['src_eaa_mg', 'src_bcaa_mg', 'eaa', 'bcaa']);
const PREVIEW_LEFT_FIXED_CODES = new Set(['energy_kcal', 'carbohydrate_g', 'sugars_g', 'fat_g']);
const PREVIEW_RIGHT_FIXED_CODES = new Set(['protein_g', 'src_eaa_mg', 'src_bcaa_mg', 'eaa', 'bcaa', 'leucine']);
const PREVIEW_CARB_CHILD_CODES = new Set(['sugars_g', 'dietary_fiber', 'src_알룰로오스_g']);
const PREVIEW_FAT_CHILD_CODES = new Set(['saturated_fat_g', 'trans_fat_g']);
const PREVIEW_AMINO_KO_ALIAS_MAP = Object.fromEntries(
  Object.entries(AMINO_ACID_KO_ALIASES).map(([name, code]) => [normalizePreviewKoName(name), code]),
);

function previewAminoKey(fn) {
  const code = fn?.nutrient_code;
  if (PREVIEW_AMINO_CODE_SET.has(code)) return code;
  const nutrientCode = fn?.nutrients?.code;
  if (PREVIEW_AMINO_CODE_SET.has(nutrientCode)) return nutrientCode;
  const nameKey = PREVIEW_AMINO_KO_ALIAS_MAP[normalizePreviewKoName(fn?.nutrients?.name_ko)];
  if (nameKey) return nameKey;
  if (isNutrientGroup(fn, NUTRIENT_GROUP.AMINO_ACID) && !PREVIEW_AMINO_AGG_CODES.has(code)) {
    return code || fn?.nutrients?.code || null;
  }
  return null;
}

function sortPreviewNutrients(a, b) {
  const aOrder = a?.nutrients?.display_order ?? 9999;
  const bOrder = b?.nutrients?.display_order ?? 9999;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return String(a?.nutrients?.name_ko ?? a?.nutrient_code ?? '').localeCompare(String(b?.nutrients?.name_ko ?? b?.nutrient_code ?? ''), 'ko');
}

function firstFoodNutrientByCode(byCode, codes) {
  for (const code of codes) {
    if (byCode.get(code)) return byCode.get(code);
  }
  return null;
}

function previewLeftDepth(fn) {
  const code = fn?.nutrient_code;
  if (PREVIEW_CARB_CHILD_CODES.has(code) || PREVIEW_FAT_CHILD_CODES.has(code)) return 1;
  return 0;
}

function previewAminoDepth(aminoKey) {
  if (aminoKey === 'leucine' || aminoKey === 'isoleucine' || aminoKey === 'valine') return 3;
  if (EAA_KEYS.includes(aminoKey)) return 2;
  return 1;
}

function DetailNutritionPreview({
  product,
  categoryCode,
  foodNutrients,
  expanded,
  basis,
  onChangeBasis,
  onToggleExpand,
}) {
  const nutrition = product?.nutrition ?? {};
  const servingSize = product?.servingSize;
  const servingUnit = product?.servingUnit ?? '';
  const basisUnit = servingUnit?.includes('ml') ? 'ml' : 'g';
  const canToggleBasis = servingSize > 0 && servingSize !== 100;
  const calories = nutrition.calories;
  const unitPrice = referenceUnitPrice(product);
  const priceBasisHelp = product?.referencePrice?.source === 'list_price'
    ? '정가를 개당 가격으로 환산한 값이며, 실제 구매 가격과 다를 수 있습니다.'
    : '구매링크 최저가와 정가 중 낮은 기준가격으로 환산하며, 실제 가격과 다를 수 있습니다.';
  const basisOptions = [
    { key: 'serving', label: '1회 제공량', enabled: true },
    { key: 'per100', label: `100${basisUnit}`, enabled: canToggleBasis },
    { key: 'kcal', label: '100kcal', enabled: calories > 0 },
    { key: 'price', label: '1,000원', enabled: unitPrice > 0 },
  ];
  const enabledBasisOptions = basisOptions.filter((option) => option.enabled);
  const activeBasis = enabledBasisOptions.some((option) => option.key === basis) ? basis : 'serving';
  const ratio = (() => {
    if (activeBasis === 'per100') return canToggleBasis ? 100 / servingSize : null;
    if (activeBasis === 'kcal') return calories > 0 ? 100 / calories : null;
    if (activeBasis === 'price') return unitPrice > 0 ? 1000 / unitPrice : null;
    return 1;
  })();
  const byCode = new Map((foodNutrients ?? []).map((fn) => [fn.nutrient_code, fn]));
  const fixedLeftRows = [
    { key: 'energy_kcal', label: '열량', fn: byCode.get('energy_kcal'), fallbackValue: nutrition.calories, unit: 'kcal', showMissing: true },
    { key: 'carbohydrate_g', label: '탄수화물', fn: byCode.get('carbohydrate_g'), fallbackValue: nutrition.carbs, unit: 'g', showMissing: true },
    { key: 'sugars_g', label: '당류', fn: byCode.get('sugars_g'), fallbackValue: nutrition.sugar, unit: 'g', depth: 1, showMissing: true },
    { key: 'fat_g', label: '지방', fn: byCode.get('fat_g'), fallbackValue: nutrition.fat, unit: 'g', showMissing: true },
  ];
  const fixedRightRows = [
    { key: 'protein_g', label: '단백질', fn: byCode.get('protein_g'), fallbackValue: nutrition.protein, unit: 'g', showMissing: true },
    { key: 'eaa', label: '필수아미노산', fn: firstFoodNutrientByCode(byCode, ['src_eaa_mg', 'eaa']), fallbackValue: nutrition.eaa, unit: 'mg', depth: 1, positiveOnly: true, showMissing: true },
    { key: 'bcaa', label: 'BCAA', fn: firstFoodNutrientByCode(byCode, ['src_bcaa_mg', 'bcaa']), fallbackValue: nutrition.bcaa, unit: 'mg', depth: 2, positiveOnly: true, showMissing: true },
    { key: 'leucine', label: '류신', fn: byCode.get('leucine'), fallbackValue: nutrition.leucine, unit: 'mg', depth: 3, positiveOnly: true, showMissing: true },
  ];
  const extraLeftRows = (foodNutrients ?? [])
    .filter((fn) => {
      const code = fn?.nutrient_code;
      if (!code) return false;
      if (PREVIEW_LEFT_FIXED_CODES.has(code) || PREVIEW_RIGHT_FIXED_CODES.has(code)) return false;
      if (PREVIEW_AMINO_AGG_CODES.has(code) || previewAminoKey(fn)) return false;
      return true;
    })
    .sort(sortPreviewNutrients)
    .map((fn) => ({
      key: fn.nutrient_code,
      label: fn.nutrients?.name_ko || fn.nutrient_code,
      fn,
      unit: fn.unit || fn.nutrients?.default_unit || '',
      depth: previewLeftDepth(fn),
      showMissing: true,
      extra: true,
    }));
  const fixedEaaExtraRows = EAA_AMINO_ACIDS
    .filter((amino) => amino.code !== 'leucine')
    .map((amino) => ({
      key: amino.code,
      label: amino.label,
      fn: byCode.get(amino.code),
      fallbackValue: nutrition[amino.code],
      unit: 'mg',
      depth: previewAminoDepth(amino.code),
      positiveOnly: true,
      showMissing: true,
      extra: true,
    }));
  const fixedEaaCodes = new Set(EAA_AMINO_ACIDS.map((amino) => amino.code));
  const extraRightRows = (foodNutrients ?? [])
    .map((fn) => ({ fn, aminoKey: previewAminoKey(fn) }))
    .filter(({ fn, aminoKey }) => {
      if (!aminoKey) return false;
      if (fixedEaaCodes.has(aminoKey)) return false;
      if (PREVIEW_AMINO_AGG_CODES.has(fn?.nutrient_code)) return false;
      return true;
    })
    .sort((a, b) => {
      const aIndex = AMINO_ACID_KEYS.indexOf(a.aminoKey);
      const bIndex = AMINO_ACID_KEYS.indexOf(b.aminoKey);
      if (aIndex !== bIndex) return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      return sortPreviewNutrients(a.fn, b.fn);
    })
    .map(({ fn, aminoKey }) => ({
      key: fn.nutrient_code || aminoKey,
      label: AMINO_ACID_LABELS[aminoKey] || fn.nutrients?.name_ko || aminoKey,
      fn,
      unit: fn.unit || fn.nutrients?.default_unit || 'mg',
      depth: previewAminoDepth(aminoKey),
      positiveOnly: true,
      showMissing: true,
      extra: true,
    }));
  const visibleLeftRows = [...fixedLeftRows, ...extraLeftRows]
    .map((row) => ({ ...row, display: formatPreviewFoodNutrient(row.fn, row.fallbackValue, row.unit, ratio, row) }))
    .filter((row) => row.display);
  const visibleRightRows = [...fixedRightRows, ...fixedEaaExtraRows, ...extraRightRows]
    .map((row) => ({ ...row, display: formatPreviewFoodNutrient(row.fn, row.fallbackValue, row.unit, ratio, row) }))
    .filter((row) => row.display);

  if (visibleLeftRows.length === 0 && visibleRightRows.length === 0) return null;

  const renderLabel = (row) => (
    <span className={`d-detail-card-nutri-label${row.depth ? ` is-depth-${row.depth}` : ''}`}>
      {row.label}
    </span>
  );
  const renderValue = (row) => (
    <span className="d-detail-card-nutri-value">
      {row.display.num}<span className="d-detail-card-nutri-unit">{row.display.unit}</span>
    </span>
  );
  const renderList = (items) => (
    <ul className="d-detail-card-nutri-list">
      {items.map((row) => (
        <li className={`d-detail-card-nutri-row${row.extra ? ' is-extra' : ''}`} key={row.key}>
          {renderLabel(row)}
          {renderValue(row)}
        </li>
      ))}
    </ul>
  );
  const hasExtraRows = [...visibleLeftRows, ...visibleRightRows].some((row) => row.extra);

  return (
    <div className="d-detail-card-nutri">
      <div className="d-detail-card-nutri-head">
        <span className="d-detail-card-nutri-title">영양성분</span>
        <div className="d-detail-card-nutri-actions">
          {enabledBasisOptions.length > 1 && (
            <div className="d-detail-nutri-toggle d-detail-card-nutri-toggle" role="group" aria-label="영양성분 기준">
              {enabledBasisOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`d-detail-nutri-toggle-btn${activeBasis === option.key ? ' is-active' : ''}`}
                  onClick={() => onChangeBasis(option.key)}
                >
                  <span>{option.label}</span>
                  {option.key === 'price' && (
                    <span
                      className="d-detail-card-nutri-price-help"
                      aria-label={priceBasisHelp}
                    >
                      ?
                      <span className="d-detail-card-nutri-price-help-bubble" role="tooltip">
                        {priceBasisHelp}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {hasExtraRows && (
            <button
              type="button"
              className="d-detail-nutri-expand d-detail-card-nutri-expand"
              onClick={onToggleExpand}
              aria-expanded={expanded}
            >
              <span>{expanded ? '접기' : '전체 보기'}</span>
              <ChevronDown size={15} className={expanded ? 'is-open' : ''} />
            </button>
          )}
        </div>
      </div>
      <div className={`d-detail-card-nutri-table${expanded ? ' is-open' : ''}`}>
        {visibleLeftRows.length > 0 && renderList(visibleLeftRows)}
        {visibleRightRows.length > 0 && renderList(visibleRightRows)}
      </div>
    </div>
  );
}

function formatHeaderNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value)) return null;
  return value >= 100 ? Math.round(value).toLocaleString() : (Math.round(value * 10) / 10).toLocaleString();
}

function getDetailCardConfig(categoryCode) {
  const foodType = getFoodTypeByCode(categoryCode);
  return foodType ? getCategoryCardConfig(foodType.tab, foodType.label) : null;
}

function ProductServingMeta({ product, explicit = false }) {
  const parts = [];
  if (product.serving) parts.push(explicit ? `1회 제공량 ${product.serving}` : product.serving);
  const calories = formatHeaderNumber(product.nutrition?.calories);
  if (calories !== null) parts.push(`${calories}kcal`);
  if (parts.length === 0) return null;
  return <span className="d-detail-header-serving">{parts.join(' · ')}</span>;
}

function DetailIngredientFacts({ product, config }) {
  const sources = config?.showProteinSource ? (product.ingredients?.proteinSources ?? []) : [];
  const sweeteners = config?.showSweetenerMeta ? (product.ingredients?.sweeteners ?? product.sweeteners ?? []) : [];
  const proteinResolver = useProteinResolver(sources);
  const sweetenerResolver = useSweetenerResolver(sweeteners);
  const rows = [];

  if (sources.length > 0) {
    rows.push({
      key: 'protein',
      label: '단백질원',
      value: [...new Set(sources.map((source) => formatProteinSourceLabel(source, proteinResolver)))].join(' · '),
    });
  }
  if (config?.showSweetenerMeta) {
    rows.push({
      key: 'sweetener',
      label: '대체당',
      value: sweeteners.length > 0
        ? [...new Set(sweeteners.map((sweetener) => formatSweetenerLabel(sweetener, sweetenerResolver)))].join(' · ')
        : '없음',
    });
  }
  if (rows.length === 0) return null;

  return (
    <div className="d-detail-facts-meta">
      {rows.map((row) => (
        <div className="d-detail-facts-meta-row" key={row.key}>
          <span className="d-detail-facts-meta-label">{row.label}</span>
          <span className="d-detail-facts-meta-value">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function DetailRecommendScore({ product }) {
  const score = getProteinDrinkRecommendScore(product);
  if (!Number.isFinite(score)) return null;

  return (
    <div className="d-detail-facts-meta-row d-detail-recommend-score">
      <span className="d-detail-facts-meta-label">추천점수</span>
      <span className="d-detail-recommend-score-value">
        {Math.round(score)}<span className="d-detail-recommend-score-unit">점</span>
      </span>
    </div>
  );
}

function DetailSummaryFacts({ product, config }) {
  const showMacro = config?.macroBarVariant || config?.showMacroBar !== false;
  const hasMacro = showMacro && product.macros && (
    Number(product.macros.carbs) > 0 ||
    Number(product.macros.protein) > 0 ||
    Number(product.macros.fat) > 0
  );

  return (
    <div className="d-detail-facts">
      <ProductServingMeta
        product={product}
        explicit={config?.servingMetaVariant === 'explicit'}
      />
      {hasMacro && (
        <MacroRow
          {...product.macros}
          variant={config?.macroBarVariant ?? 'mini'}
          ratioOnly
        />
      )}
      <DetailRecommendScore product={product} />
      <DetailIngredientFacts product={product} config={config} />
    </div>
  );
}

function ProductOverview({
  product,
  raw,
  inCart,
  inWishlist,
  cardNutritionOpen,
  cardNutritionBasis,
  onChangeCardNutritionBasis,
  onToggleCardNutrition,
  onToggleCompare,
  onToggleWishlist,
}) {
  const config = getDetailCardConfig(raw?.categoryCode);
  const titleVariant = config?.titleVariant === 'size' ? product.sizeVariantLabel : '';

  return (
    <section className="d-detail-overview">
      <div className="d-detail-overview-actions">
        <LikeButton product={product} inWishlist={inWishlist} onClick={onToggleWishlist} />
        <CompareButton product={product} inCart={inCart} onClick={onToggleCompare} />
      </div>

      {/* 상단: 제품 이미지 + 제목·핵심지표 */}
      <div className="d-detail-overview-grid">
        <div className="d-detail-overview-media">
          <div className="d-detail-overview-thumb">
            <ProductThumb
              product={product}
              size="card"
              priority
              alt={`${product.brand ? product.brand + ' ' : ''}${product.name}`}
            />
          </div>
        </div>
        <div className="d-detail-overview-body">
          <div className="d-detail-overview-titlebar">
            <div className="d-detail-overview-title">
              <span className="d-detail-header-brand">{product.brand}</span>
              <h1 className="d-detail-header-name">
                {product.name}
                {titleVariant && <span className="d-detail-header-variant">{titleVariant}</span>}
              </h1>
            </div>
          </div>
          <DetailSummaryFacts product={product} config={config} />
          <DetailNutritionPreview
            product={product}
            categoryCode={raw?.categoryCode}
            foodNutrients={raw?._raw?.foodNutrients}
            expanded={cardNutritionOpen}
            basis={cardNutritionBasis}
            onChangeBasis={onChangeCardNutritionBasis}
            onToggleExpand={onToggleCardNutrition}
          />
        </div>
      </div>

    </section>
  );
}

// #3 섹션 앵커 탭
const SECTIONS = [
  { id: 'analysis', label: '분석 리포트' },
  { id: 'reviews', label: '후기' },
];

function SectionNav({ activeId, navRef }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    const nav = navRef?.current;
    if (!el) return;
    const navH = nav ? nav.offsetHeight : 0;
    const headerH = 64;
    const offset = headerH + navH + 12;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav className="d-detail-section-nav" ref={navRef} aria-label="섹션 이동">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => handleClick(e, s.id)}
          className={`d-detail-section-nav-item${activeId === s.id ? ' is-active' : ''}`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

function useActiveSection(productId) {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  useEffect(() => {
    setActiveId(SECTIONS[0].id);
    if (!productId) return undefined;
    // 스크롤 위치 기준 — 스티키 탭 바로 아래 라인을 지난 마지막 섹션을 활성화
    // (IntersectionObserver는 '변경된' 항목만 받아 중간/하단에서 강조가 끊김 → 스크롤 계산으로 대체)
    const onScroll = () => {
      const nav = document.querySelector('.d-detail-section-nav');
      // 판정선 여유(+16)는 클릭 스크롤 목적지(nav 아래 +12)보다 커야
      // 도착 직후 해당 섹션이 바로 강조됨(작으면 조금 더 내려야 켜짐)
      const line = (nav ? nav.getBoundingClientRect().bottom : 120) + 16;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      // 페이지 최하단이면 마지막 섹션을 강조(짧은 섹션이 라인에 못 닿는 경우 보정)
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = SECTIONS[SECTIONS.length - 1].id;
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [productId]);
  return activeId;
}

function LikeButton({ product, inWishlist, onClick }) {
  const label = inWishlist ? '찜함에서 빼기' : '찜하기';
  return (
    <button
      type="button"
      className={`d-detail-overview-action d-detail-overview-action--like${inWishlist ? ' is-active' : ''}`}
      onClick={onClick}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? `${product.name} 찜함에서 빼기` : `${product.name} 찜하기`}
    >
      <IconHeart size={17} stroke={1.8} fill={inWishlist ? 'currentColor' : 'none'} />
      <span className="d-detail-overview-action-tooltip" role="tooltip">{label}</span>
    </button>
  );
}

// #5 비교함 버튼 + 애니메이션 피드백
function CompareButton({ product, inCart, onClick }) {
  const [flash, setFlash] = useState(false);
  const label = inCart ? '비교함에서 빼기' : '비교함에 담기';
  const handleClick = () => {
    onClick();
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };
  return (
    <button
      type="button"
      className={`d-detail-overview-action d-detail-overview-action--compare${inCart ? ' is-active' : ''}${flash ? ' is-flash' : ''}`}
      onClick={handleClick}
      aria-pressed={inCart}
      aria-label={inCart ? `${product.name} 비교함에서 빼기` : `${product.name} 비교함에 담기`}
    >
      <IconCompare size={17} stroke={1.8} />
      <span className="d-detail-overview-action-tooltip" role="tooltip">{label}</span>
    </button>
  );
}

export default function DetailPage() {
  const { id: routeParam } = useParams();
  const id = parseProductId(routeParam); // 슬러그-ID 또는 순수 ID에서 ID만 추출
  const navigate = useNavigate();
  const { has, toggle, isFull, max } = useCompare();
  const wishlist = useWishlist();
  const navRef = useRef(null);
  const [cardNutritionOpen, setCardNutritionOpen] = useState(false);
  const [cardNutritionBasis, setCardNutritionBasis] = useState('serving');

  const { product: raw, loading, error } = useProductDetail(id);
  const { products: categoryProducts } = useCategoryProducts(raw?.categoryCode);
  const product = raw ? getAdapted(raw) : null;
  const activeSection = useActiveSection(product?.id);

  if (loading) return (
    <div className="page d-detail-skeleton-wrap">
      <div className="d-detail-skeleton-breadcrumb">
        <span className="d-skeleton" style={{ width: '30%', height: 12, borderRadius: 4, display: 'inline-block' }} />
      </div>
      <div className="d-detail-skeleton-body">
        <div className="d-skeleton" style={{ width: 320, height: 320, borderRadius: 12, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="d-skeleton" style={{ width: '25%', height: 12, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '60%', height: 28, borderRadius: 4, display: 'inline-block' }} />
          <span className="d-skeleton" style={{ width: '20%', height: 12, borderRadius: 4, display: 'inline-block' }} />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span className="d-skeleton" style={{ width: 100, height: 60, borderRadius: 8, display: 'inline-block' }} />
            <span className="d-skeleton" style={{ width: 100, height: 60, borderRadius: 8, display: 'inline-block' }} />
            <span className="d-skeleton" style={{ width: 100, height: 60, borderRadius: 8, display: 'inline-block' }} />
          </div>
          <span className="d-skeleton" style={{ width: '100%', height: 12, borderRadius: 6, display: 'inline-block', marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="page d-detail-empty">
      <p className="d-detail-empty-msg">제품 정보를 불러오지 못했어요.</p>
      <button type="button" className="d-detail-empty-link" onClick={() => window.location.reload()}>
        다시 시도
      </button>
    </div>
  );
  if (!product) return <EmptyState />;

  // 슬러그-ID 정규 URL로 통일 — 순수 ID(/product/5)나 옛 슬러그로 들어오면 교정
  const canonicalPath = productPath(product);
  if (routeParam !== canonicalPath.slice('/product/'.length)) {
    return <Navigate to={canonicalPath} replace />;
  }

  const inCart = has(product.id);
  const inWishlist = wishlist.has(product.id);
  const n = product.nutrition ?? {};
  const detailConfig = getDetailCardConfig(raw?.categoryCode);

  const handleToggleCompare = () => {
    if (!inCart && isFull) {
      window.alert(`비교함은 최대 ${max}개까지 담을 수 있어요.`);
      return;
    }
    toggle(product.id);
  };
  const handleToggleWishlist = () => {
    wishlist.toggle(product.id);
  };

  // 표시명 — 제품명에 브랜드가 이미 들어있으면 중복 제거 (예: '하림' + '하림 닭가슴살')
  const titleName =
    product.brand && !product.name.includes(product.brand)
      ? `${product.brand} ${product.name}`
      : product.name;
  // 영양 핵심 수치로 메타 설명 구성 (값 없으면 '-')
  const seoDesc =
    `${titleName} · 칼로리 ${n.calories ?? '-'}kcal, 단백질 ${n.protein ?? '-'}g, 당류 ${n.sugar ?? '-'}g. 판매처별 최저가 비교.`;

  return (
    <div className="page d-detail">
      <Seo
        title={`${titleName} 영양성분·가격 비교`}
        description={seoDesc}
        canonicalPath={canonicalPath}
        ogImage={product.thumb || undefined}
        ogType="article"
        jsonLd={[
          productLd(product),
          breadcrumbLd(
            buildProductBreadcrumb({
              category: raw?.category,
              categoryCode: raw?.categoryCode,
              productName: product.name,
            }),
          ),
        ]}
      />
      <Breadcrumb category={raw?.category} categoryCode={raw?.categoryCode} productName={product.name} />

      {/* 2단 레이아웃 — 좌: 본문 / 우: 가격 비교 sticky 패널 */}
      <div className="d-detail-layout">
        <div className="d-detail-main">
          <ProductOverview
            product={product}
            raw={raw}
            inCart={inCart}
            inWishlist={inWishlist}
            cardNutritionOpen={cardNutritionOpen}
            cardNutritionBasis={cardNutritionBasis}
            onToggleCompare={handleToggleCompare}
            onToggleWishlist={handleToggleWishlist}
            onToggleCardNutrition={() => setCardNutritionOpen((v) => !v)}
            onChangeCardNutritionBasis={setCardNutritionBasis}
          />

          {/* 섹션 앵커 탭 */}
          <SectionNav activeId={activeSection} navRef={navRef} />

          <div className="d-detail-sections">
            <div id="analysis" className="d-detail-section-block">
              <AnalysisReport
                product={product}
                products={categoryProducts}
                nutrition={n}
                ingredients={product.ingredients}
                category={raw?.category}
                categoryCode={raw?.categoryCode}
                foodNutrients={raw?._raw?.foodNutrients}
                additionalContent={raw?._raw?.additionalContent}
                servingSize={raw?._raw?.servingSize}
                servingUnit={raw?._raw?.servingUnit}
                rawText={raw?._raw?.ingredientsText}
                annotations={raw?._raw?.ingredientAnnotations}
              />
            </div>
            <div id="reviews" className="d-detail-section-block">
              <ReviewSection productId={product.id} />
            </div>
            <RelatedProducts
              currentProduct={raw}
              allProducts={categoryProducts}
              onNavigate={(food) => navigate(productPath(food))}
              limit={4}
            />
          </div>
        </div>

        {/* 우측 가격 비교 패널 — 스크롤 시 고정 */}
        <aside className="d-detail-aside">
          <div className="d-detail-aside-inner">
            <PurchaseOffers
              offers={product.purchaseLinks}
              productId={product.id}
              title="가격 비교"
              showUpdatedAt
              stacked
              sortBy="unit-first"
              pricePer={detailConfig?.purchasePricePer ?? 'unit'}
              servingsPerUnit={product.servingsPerUnit}
            />
            <CategoryGuide category={raw?.category} />
          </div>
        </aside>
      </div>
    </div>
  );
}
