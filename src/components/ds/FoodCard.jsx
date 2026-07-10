// 다분해 DS FoodCard (제품 카드 — grid/list 두 가지 레이아웃)
// props:
//   - food: adapters.getAdapted(product) 결과 객체
//       { id, brand, name, thumb(URL), score(0~10), macros, tags, trustBadges, ... }
//   - onClick: 카드 전체 클릭 핸들러 (디테일 진입)
//   - layout: 'grid' (홈/리스트 그리드) | 'list' (리스트 페이지)
//   - onCompare: 비교함 담기 콜백 (미지정 시 + 버튼 미표시)
import { Fragment } from 'react';
import { MacroRow } from './MacroRow.jsx';
import { IconPlus, IconCheck, IconCompare, IconHeart } from './Icons.jsx';
import { getCategoryMetrics } from '../../data/purposes.jsx';
import { getCategoryCardConfig, computeMetricValues, getHighlightValue } from '../../data/categoryCardMetrics.js';
import { formatProteinSourceLabel, formatSweetenerLabel } from '../../data/listFilters.js';
import { useProteinResolver, useSweetenerResolver } from '../../data/proteinQuality.js';
import {
  getProteinDrinkRecommendScore,
  PROTEIN_SORT_BASES,
  PROTEIN_SORT_MODES,
  PROTEIN_SORT_RECOMMEND,
  splitProteinSortKey,
} from '../../data/listSort.js';
import PurchaseOffers from '../global/PurchaseOffers.jsx';
import { productPath } from '../../data/productUrl.js';

// 제품 상세 경로 — 크롤러가 따라갈 실제 href (슬러그+ID 하이브리드, 사이트맵 없이도 발견 가능)
function productHref(food) {
  return food?.id != null ? productPath(food) : undefined;
}

// 제품명 링크 클릭 — 새 탭(메타/Ctrl/휠클릭)은 기본 동작 유지,
// 일반 클릭은 기본 이동을 막고 부모 onClick(SPA 라우팅) 실행 + 카드 전체 onClick 중복 방지
function handleNameClick(e, onClick) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  e.preventDefault();
  e.stopPropagation();
  onClick?.();
}

// 썸네일 이미지 (URL → img, 빈값 → 회색 placeholder)
// - 원본 DS는 thumb 가 CSS gradient 문자열이라 background 로 적용했지만
//   우리 데이터의 thumb 은 실제 이미지 URL → <img>로 처리
// - object-fit: contain — 제품이 잘리지 않게 전체를 보여줌 (흰 배경 사진 기준)
function ThumbImage({ src, alt }) {
  if (!src) {
    // 빈 URL 폴백: 회색 placeholder
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--gray-100)',
          borderRadius: 'inherit',
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        borderRadius: 'inherit',
        display: 'block',
      }}
    />
  );
}

// 비교함 추가 버튼 (썸네일 우하단)
// - 시각 크기 26x26, 의사요소로 hit-area 44x44 확장
function CompareButton({ food, onCompare, inCompare }) {
  if (!onCompare) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCompare(food);
      }}
      aria-label={inCompare ? `${food.name} 비교함에서 빼기` : `${food.name} 비교함에 담기`}
      title={inCompare ? '비교함에서 빼기' : '비교함에 담기'}
      className={`d-foodcard-compare${inCompare ? ' is-in-compare' : ''}`}
    >
      {inCompare ? <IconCheck size={14} /> : <IconPlus size={14} />}
    </button>
  );
}

// 리스트 카드 비교함 버튼 — 썸네일 아래 라벨 버튼
// - 담김 여부는 아이콘과 컬러로 표시하고, 텍스트는 비교함으로 고정
function ListStoreButton({ food, onCompare, inCompare }) {
  if (!onCompare) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCompare(food);
      }}
      aria-pressed={inCompare}
      aria-label={inCompare ? `${food.name} 비교함에서 빼기` : `${food.name} 비교함에 담기`}
      className={`m-foodcard-store${inCompare ? ' is-in' : ''}`}
    >
      {inCompare ? <IconCheck size={13} stroke={2.2} /> : <IconPlus size={13} stroke={2.2} />}
      <span>비교함</span>
    </button>
  );
}

function formatInlineNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return null;
  return value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
}

function formatAmountLabel(amount, unit) {
  const num = formatInlineNumber(amount);
  if (num === null) return null;
  return `${num}${unit || ''}`;
}

function sizeVariantLabelOf(food) {
  const label = String(food.sizeVariantLabel ?? '').trim();
  return label || null;
}

function ProductNameContent({ food, config }) {
  const variantLabel = config.titleVariant === 'size' ? sizeVariantLabelOf(food) : null;
  return (
    <>
      {food.name}
      {variantLabel && <span className="fc-title-variant">{variantLabel}</span>}
    </>
  );
}

function ServingMeta({ food, showCalories = false, variant }) {
  const parts = [];
  if (variant === 'explicit') {
    const serving = formatAmountLabel(food.servingAmount ?? food.servingSize, food.servingUnit);
    if (serving) parts.push(`1회 제공량 ${serving}`);
  } else if (food.serving) {
    parts.push(food.serving);
  }
  if (showCalories) {
    const calories = formatInlineNumber(food.nutrition?.calories);
    if (calories !== null) parts.push(`${calories}kcal`);
  }
  if (parts.length === 0) return null;
  return <div className="fc-serving-meta">{parts.join(' · ')}</div>;
}

// list 레이아웃: 좌측 88px 컬럼(썸네일 + 담기 버튼) + 텍스트 영역
// - 담긴 제품은 카드 좌측에 그린 강조선 + 버튼 '담김' 상태로 표시
function FoodCardList({ food, onClick, onCompare, inCompare, tabId, subLabel, sortKey }) {
  const config = getCategoryCardConfig(tabId, subLabel);
  return (
    <div
      onClick={onClick}
      className={`m-foodcard-list${inCompare ? ' is-in-store' : ''}`}
      style={{
        display: 'flex',
        gap: 12,
        padding: '14px 12px 14px 0',
        borderBottom: '1px solid var(--border-tertiary)',
        cursor: 'pointer',
      }}
    >
      <div style={{ flexShrink: 0, width: 88, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          <ThumbImage src={food.thumb} alt={food.name} />
        </div>
        <ListStoreButton food={food} onCompare={onCompare} inCompare={inCompare} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{food.brand}</div>
        <a
          href={productHref(food)}
          onClick={(e) => handleNameClick(e, onClick)}
          style={{
            fontSize: 14,
            color: 'var(--text-primary)',
            fontWeight: 500,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textDecoration: 'none',
          }}
        >
          <ProductNameContent food={food} config={config} />
        </a>
        <ServingMeta
          food={food}
          showCalories={Boolean(config.primaryMetrics) || config.showServingCalories === true}
          variant={config.servingMetaVariant}
        />
        {config.showMacroBar !== false && config.macroBarVariant && (
          <MacroRow {...food.macros} variant={config.macroBarVariant} />
        )}
        <CategoryMetricsBlock food={food} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />
        <PurchaseOffers
          offers={food.purchaseLinks}
          compact
          sortBy="unit-first"
          pricePer={config.purchasePricePer ?? 'unit'}
          servingsPerUnit={food.servingsPerUnit}
          className="fc-card-offers"
        />
      </div>
    </div>
  );
}

function CategoryMetricsBlock({ food, tabId, subLabel, sortKey }) {
  const config = getCategoryCardConfig(tabId, subLabel);
  // 우선순위 기반(tiered) 카드 구성이 지정된 카테고리는 전용 렌더링
  if (config.primaryMetrics) {
    return <TieredMetricsBlock food={food} config={config} sortKey={sortKey} />;
  }
  if (config.showProteinSource || config.showSweetenerMeta) {
    return <IngredientMetaBlock food={food} config={config} />;
  }
  const { metrics, showSweeteners } = config;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
      {metrics.map((m) => {
        const result = computeMetricValues(food, m);
        if (!result) return null;
        return (
          <div key={m.key} className="fc-metric-row">
            <span className="fc-metric-label">{m.label}</span>
            <span className="fc-metric-total">
              {result.total}<span className="fc-metric-unit">{result.unit}</span>
            </span>
            {result.ratios.map((r, i) => (
              <span key={i} className="fc-metric-ratio">
                {r.value}<span className="fc-metric-ratio-label">{r.label}</span>
              </span>
            ))}
          </div>
        );
      })}
      {showSweeteners && food.sweeteners && food.sweeteners.length > 0 && (
        <div className="fc-metric-row">
          <span className="fc-metric-label">대체당</span>
          <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>
            {food.sweeteners.join(' · ')}
          </span>
        </div>
      )}
      {showSweeteners && (!food.sweeteners || food.sweeteners.length === 0) && (
        <div className="fc-metric-row">
          <span className="fc-metric-label">대체당</span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>없음</span>
        </div>
      )}
    </div>
  );
}

function IngredientMetaBlock({ food, config }) {
  const sources = config.showProteinSource ? (food.ingredients?.proteinSources ?? []) : [];
  const sweeteners = config.showSweetenerMeta ? (food.ingredients?.sweeteners ?? food.sweeteners ?? []) : [];
  return (
    <div style={{ marginTop: 4 }}>
      <TieredMeta sources={sources} sweeteners={sweeteners} showSweeteners={config.showSweetenerMeta} />
    </div>
  );
}

// 우선순위 기반 카드 메트릭 (단백질 음료 등)
// - 상단: 단백질원, 용량 라인: 용량·열량, 하단: 정렬 기준별 핵심 지표
// - 하단: 핵심 지표(총량 + 칼로리/가격 대비) 열 정렬 표
function TieredMetricsBlock({ food, config, sortKey }) {
  const primary = config.primaryMetrics ?? [];
  const sources = config.showProteinSource ? (food.ingredients?.proteinSources ?? []) : [];
  const sweeteners = config.showSweetenerMeta ? (food.ingredients?.sweeteners ?? food.sweeteners ?? []) : [];
  const isProteinMetricSort = isTieredMetricSort(sortKey, primary);
  const isRecommend = sortKey === PROTEIN_SORT_RECOMMEND;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      {isRecommend ? (
        <RecommendScore food={food} />
      ) : isProteinMetricSort ? (
        <SelectedProteinMetric food={food} metrics={primary} sortKey={sortKey} />
      ) : (
        <TieredPrimaryTable food={food} metrics={primary} sortKey={sortKey} />
      )}

      <TieredMeta sources={sources} sweeteners={sweeteners} showSweeteners={config.showSweetenerMeta} />
    </div>
  );
}

function isTieredMetricSort(sortKey, metrics) {
  if (sortKey === PROTEIN_SORT_RECOMMEND) return false;
  if (typeof sortKey !== 'string' || !sortKey.includes('_')) return false;
  const { base, mode } = splitProteinSortKey(sortKey);
  return metrics.some((m) => m.key === base) && PROTEIN_SORT_MODES.some((m) => m.key === mode);
}

function RecommendScore({ food }) {
  const score = getProteinDrinkRecommendScore(food);
  if (!Number.isFinite(score)) return null;
  const protein = formatInlineNumber(food?.nutrition?.protein);

  return (
    <div className="fc-recommend-summary">
      <div className="fc-recommend-score">
        <span className="fc-meta-label fc-recommend-score-label">추천점수</span>
        <span className="fc-recommend-score-value">
          {Math.round(score)}<span className="fc-recommend-score-unit">점</span>
        </span>
      </div>
      {protein !== null && (
        <div className="fc-recommend-protein">
          <span className="fc-meta-label fc-recommend-score-label">단백질</span>
          <span className="fc-recommend-protein-value">
            {protein}<span className="fc-recommend-score-unit">g</span>
          </span>
        </div>
      )}
    </div>
  );
}

// 표 위 부가정보 — 단백질원/대체당을 간결하게 표시
function TieredMeta({ sources, sweeteners, showSweeteners = false }) {
  const resolveProtein = useProteinResolver(sources);
  const resolveSweetener = useSweetenerResolver(sweeteners);
  const hasSource = sources.length > 0;
  if (!hasSource && !showSweeteners) return null;

  const sourceLabels = sources.map((source) => {
    return formatProteinSourceLabel(source, resolveProtein);
  });
  const sweetenerLabels = sweeteners.map((sweetener) => {
    return formatSweetenerLabel(sweetener, resolveSweetener);
  });

  return (
    <div className="fc-meta">
      {hasSource && (
        <div className="fc-meta-row">
          <span className="fc-meta-label">단백질원</span>
          <span className="fc-meta-value">
            {sourceLabels.join(' · ')}
          </span>
        </div>
      )}
      {showSweeteners && (
        <div className="fc-meta-row">
          <span className="fc-meta-label">대체당</span>
          <span className="fc-meta-value">
            {sweetenerLabels.length > 0 ? sweetenerLabels.join(' · ') : '없음'}
          </span>
        </div>
      )}
    </div>
  );
}

function SelectedProteinMetric({ food, metrics, sortKey }) {
  const { base, mode } = splitProteinSortKey(sortKey);
  const baseDef = PROTEIN_SORT_BASES.find((b) => b.key === base);
  const metric = metrics.find((m) => m.key === base) ?? (
    baseDef ? { key: baseDef.key, label: baseDef.label, unit: baseDef.unit, perKcal: true, perPrice: true, unitInRatio: true } : null
  );
  if (!metric) return null;
  const values = computeMetricValues(food, metric);
  if (!values) return null;

  const modeDef = PROTEIN_SORT_MODES.find((m) => m.key === mode);
  const ratioByLabel = {};
  values.ratios.forEach((r) => { ratioByLabel[r.label] = r; });
  const selected = mode === 'kcal'
    ? ratioByLabel['/100kcal']
    : mode === 'price'
      ? ratioByLabel['/1,000원']
      : null;
  const value = selected
    ? { num: selected.num, unit: selected.unit, label: selected.label }
    : { num: values.total, unit: values.unit, label: '' };

  return (
    <div className="fc-selected-metric">
      <span className="fc-meta-label fc-selected-metric-name">{baseDef?.label ?? metric.label}</span>
      <span className="fc-selected-metric-value">
        {value.num}<span className="fc-selected-metric-unit">{value.unit}</span>
        <span className="fc-selected-metric-basis">{modeDef?.label ?? '1회 제공량 기준'}</span>
      </span>
    </div>
  );
}

// 1순위 핵심 지표 — 총량/100kcal당/1,000원당 열 정렬 표
// - 세 지표를 같은 비중으로 두되 열로 정렬해 가독성 확보
// - 100kcal당/1,000원당 열은 데이터(칼로리·구매가) 있을 때만 노출
// - 리스트 카드 + 상세페이지(핵심 지표 섹션)에서 공용
export function TieredPrimaryTable({ food, metrics, sortKey, priceHelp }) {
  const rows = metrics
    .map((m) => {
      const result = computeMetricValues(food, m);
      if (!result) return null;
      const byLabel = {};
      result.ratios.forEach((r) => { byLabel[r.label] = r; });
      const pick = (r) => (r ? { num: r.num, unit: r.unit } : null);
      return {
        key: m.key,
        label: m.label,
        total: { num: result.total, unit: result.unit },
        perKcal: pick(byLabel['/100kcal']),
        perPrice: pick(byLabel['/1,000원']),
      };
    })
    .filter(Boolean);
  if (rows.length === 0) return null;

  // 값 열은 항상 고정. 행은 숨기더라도 카드 간 열 위치가 흔들리지 않게 한다.
  const cols = [
    { key: 'total', head: '1회 제공량 기준', variant: 'total', pick: (r) => r.total },
    { key: 'kcal', head: '100kcal 기준', variant: 'ratio', pick: (r) => r.perKcal },
    { key: 'price', head: '1,000원 기준', variant: 'ratio', pick: (r) => r.perPrice },
  ];

  // 정렬 조합(기준×성분)이면 sortMode — 해당 '셀'만 강조하고 호버 로직은 비활성
  // 추천순/미지정이면 기존 호버 '열' 강조만 동작
  const hl = typeof sortKey === 'string' && sortKey.includes('_')
    ? splitProteinSortKey(sortKey)
    : null;
  const sortMode = !!hl;

  const cellActive = (rKey, cKey) => sortMode && hl.base === rKey && hl.mode === cKey;
  const headActive = (cKey) => sortMode && hl.mode === cKey;

  return (
    <div
      className={`fc-ptable${sortMode ? ' is-focused' : ''}`}
    >
      {/* 헤더 — 라인 없이 타이포(작고 연함)로 구분 */}
      <span className="fc-ptable-corner" />
      {cols.map((c) => (
        <span
          key={c.key}
          className={`fc-ptable-head${headActive(c.key) ? ' is-active' : ''}`}
        >
          <span className="fc-ptable-head-text">{c.head}</span>
          {c.key === 'price' && priceHelp && (
            <span className="fc-ptable-help" aria-label={priceHelp} tabIndex={0}>
              ?
              <span className="fc-ptable-help-bubble" role="tooltip">{priceHelp}</span>
            </span>
          )}
        </span>
      ))}
      {/* 지표 행 */}
      {rows.map((r) => (
        <Fragment key={r.key}>
          <span className="fc-ptable-label">{r.label}</span>
          {cols.map((c) => (
            <PTableCell
              key={c.key}
              value={c.pick(r)}
              variant={c.variant}
              active={cellActive(r.key, c.key)}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

// 표 셀 — 단위는 작게 연하게 (텍스트 위계로 가독성 확보)
// - variant: 'total' 총량(진한 색) | 'ratio' 대비 수치(연한 색)
// - active: 호버 열 / 정렬 기준 셀 강조 (더 크고 볼드)
function PTableCell({ value, variant, active, ...handlers }) {
  const cls = `fc-ptable-cell fc-ptable-cell--${variant}${active ? ' is-active' : ''}`;
  if (!value) {
    return <span className={`${cls} is-empty`} aria-hidden="true" {...handlers}>-</span>;
  }
  return (
    <span className={cls} {...handlers}>
      {value.num}<span className="fc-ptable-unit">{value.unit}</span>
    </span>
  );
}

// 세부 영양성분 (hero에 이미 표시된 항목 제외)
function SubNutrients({ nutrition, category }) {
  if (!nutrition) return null;
  const heroKeys = new Set(getCategoryMetrics(category).map((m) => m.key));
  const ALL_NUTRIENTS = [
    { key: 'calories', label: '칼로리', unit: 'kcal' },
    { key: 'protein', label: '단백질', unit: 'g' },
    { key: 'carbs', label: '탄수화물', unit: 'g' },
    { key: 'sugar', label: '당류', unit: 'g' },
    { key: 'fat', label: '지방', unit: 'g' },
    { key: 'saturatedFat', label: '포화지방', unit: 'g' },
    { key: 'transFat', label: '트랜스지방', unit: 'g' },
    { key: 'cholesterol', label: '콜레스테롤', unit: 'mg' },
    { key: 'sodium', label: '나트륨', unit: 'mg' },
    { key: 'fiber', label: '식이섬유', unit: 'g' },
  ];
  const remaining = ALL_NUTRIENTS.filter(
    (n) => !heroKeys.has(n.key) && nutrition[n.key] !== undefined
  );
  if (remaining.length === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        fontSize: 11,
        fontFamily: 'var(--font-numeric)',
        color: 'var(--text-tertiary)',
      }}
    >
      {remaining.map((n) => (
        <span key={n.key}>
          {n.label}{' '}
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {nutrition[n.key]}{n.unit}
          </span>
        </span>
      ))}
    </div>
  );
}

// 원재료·성분 상세 (감미료, 단백질원, 알레르기)
// - hide: 숨길 섹션 키 배열 (예: ['sweeteners', 'allergens']) — 카테고리별 카드 구성용
function IngredientDetails({ ingredients, hide = [] }) {
  if (!ingredients) return null;
  const sections = [];
  if (ingredients.sweeteners?.length > 0 && !hide.includes('sweeteners')) {
    sections.push({ label: '감미료', items: ingredients.sweeteners });
  }
  if (ingredients.proteinSources?.length > 0 && !hide.includes('proteinSources')) {
    sections.push({ label: '단백질원', items: ingredients.proteinSources });
  }
  if (ingredients.allergens?.length > 0 && !hide.includes('allergens')) {
    sections.push({ label: '알레르기', items: ingredients.allergens });
  }
  if (sections.length === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
        fontSize: 11,
        color: 'var(--text-tertiary)',
        lineHeight: 1.5,
      }}
    >
      {sections.map((s) => (
        <span key={s.label}>
          <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>{' '}
          {s.items.join(' · ')}
        </span>
      ))}
    </div>
  );
}

// wide 카드 우측 상단 액션 버튼
function WideCompareButton({ food, onCompare, inCompare }) {
  if (!onCompare) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCompare(food);
      }}
      aria-pressed={inCompare}
      aria-label={inCompare ? `${food.name} 비교함에서 빼기` : `${food.name} 비교함에 담기`}
      title={inCompare ? '비교함에서 빼기' : '비교함에 담기'}
      className={`d-foodcard-wide-action d-foodcard-wide-action--compare${inCompare ? ' is-in' : ''}`}
    >
      <IconCompare size={16} stroke={1.8} />
    </button>
  );
}

function WideLikeButton({ food, onWishlist, inWishlist }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onWishlist?.(food);
      }}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? `${food.name} 찜함에서 빼기` : `${food.name} 찜하기`}
      title={inWishlist ? '찜함에서 빼기' : '찜하기'}
      className={`d-foodcard-wide-action d-foodcard-wide-action--like${inWishlist ? ' is-in' : ''}`}
    >
      <IconHeart size={16} stroke={1.8} />
    </button>
  );
}

// wide 레이아웃: 가로형 (데스크톱 리스트 전용)
function FoodCardWide({ food, onClick, onCompare, inCompare, onWishlist, inWishlist, tabId, subLabel, sortKey }) {
  // 카테고리별 카드 구성 (탄단지 비율바·원재료 섹션 노출 여부)
  const config = getCategoryCardConfig(tabId, subLabel);
  return (
    <div
      onClick={onClick}
      className="d-foodcard-wide"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '20px 0',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div className="d-foodcard-wide-actions">
        <WideLikeButton food={food} onWishlist={onWishlist} inWishlist={inWishlist} />
        <WideCompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
      </div>

      <div className="d-foodcard-wide-main">
        {/* 썸네일 */}
        <div className="d-foodcard-wide-media">
          <div className="d-foodcard-wide-thumb">
            <ThumbImage src={food.thumb} alt={food.name} />
          </div>
        </div>

        {/* 상세 정보 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{food.brand}</div>

          {/* 상품명 — 크롤 가능한 상세 링크 */}
          <a
            href={productHref(food)}
            onClick={(e) => handleNameClick(e, onClick)}
            style={{
              fontSize: 18,
              color: 'var(--text-primary)',
              fontWeight: 600,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textDecoration: 'none',
            }}
          >
            <ProductNameContent food={food} config={config} />
          </a>

          <ServingMeta
            food={food}
            showCalories={Boolean(config.primaryMetrics) || config.showServingCalories === true}
            variant={config.servingMetaVariant}
          />

          {/* 셰이크형 미니 탄단지 — 원료 상세보다 먼저 보이도록 배치 */}
          {config.showMacroBar !== false && config.macroBarVariant && (
            <MacroRow {...food.macros} wide ratioOnly variant={config.macroBarVariant} />
          )}

          {/* 카테고리별 강조 지표 — 모바일 리스트 카드와 동일(CategoryMetricsBlock) */}
          <CategoryMetricsBlock food={food} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />

          {/* 탄단지 비율 막대 — 카테고리 설정에서 끌 수 있음(showMacroBar=false) */}
          {config.showMacroBar !== false && !config.macroBarVariant && (
            <MacroRow {...food.macros} wide ratioOnly />
          )}

          {/* 나머지 영양성분 — 카테고리 설정에서 끌 수 있음(showSubNutrients=false) */}
          {config.showSubNutrients !== false && (
            <SubNutrients nutrition={food.nutrition} category={food.category} />
          )}

          {/* 원재료·성분 상세 — 카테고리별로 일부 섹션 숨김 가능(hideIngredients)
              tiered 카드(단백질 음료)는 상단 구조화 블록에서 표시하므로 생략 */}
          {config.showIngredientDetails !== false && (
            <IngredientDetails ingredients={food.ingredients} hide={config.hideIngredients} />
          )}
        </div>
      </div>
      <PurchaseOffers
        offers={food.purchaseLinks}
        compact
        sortBy="unit-first"
        pricePer={config.purchasePricePer ?? 'unit'}
        servingsPerUnit={food.servingsPerUnit}
        className="fc-card-offers"
      />
    </div>
  );
}

// 성분 스탯 그리드 — 라벨 위 + 수치 아래 정렬 컬럼 (카드 간 수치 위치가 맞아 비교 스캔 용이)
// - stats: [{ label, num, unit, primary? }] 1~4개
function StatGrid({ stats }) {
  if (!stats || stats.length === 0) return null;
  return (
    <div
      className="fc-grid-stats"
      style={{ '--fc-stat-count': stats.length }}
    >
      {stats.map((s) => (
        <div key={s.label} className="fc-grid-stat">
          <span className={`fc-grid-stat-label${s.primary ? ' is-primary' : ''}`}>
            {s.label}
          </span>
          <span className={`fc-grid-stat-value${s.primary ? ' is-primary' : ''}`}>
            {s.num}
            <span className="fc-grid-stat-unit">
              {s.unit}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

// 목적별 성분 → 스탯 항목 (값 있는 것만, 1순위는 primary 강조)
function getPurposeStats(food, metrics) {
  const items = metrics
    .map((m) => {
      const v = getHighlightValue(food, m);
      return v ? { label: m.label, num: v.num, unit: v.unit } : null;
    })
    .filter(Boolean);
  if (items.length > 0) items[0].primary = true;
  return items;
}

// 기본 스탯 폴백 — 칼로리 + 탄단지 (목적 metrics 미전달 시)
function getDefaultStats(food) {
  const m = food.macros ?? {};
  return [
    { label: '칼로리', num: m.kcal, unit: 'kcal', primary: true },
    { label: '탄수화물', num: m.carbs, unit: 'g' },
    { label: '단백질', num: m.protein, unit: 'g' },
    { label: '지방', num: m.fat, unit: 'g' },
  ].filter((s) => s.num !== undefined && s.num !== null);
}

// grid 레이아웃: 1:1 썸네일 + 하단 텍스트
// - metrics: 목적별 핵심 성분 정의 (전달 시 해당 성분만 스탯 그리드로 표시,
//   미전달 시 기본 칼로리 + 탄단지)
function FoodCardGrid({ food, onClick, onCompare, inCompare, sortKey, showPurchase, metrics }) {
  const stats = metrics ? getPurposeStats(food, metrics) : getDefaultStats(food);
  return (
    <div
      className="fc-grid-card"
      onClick={onClick}
    >
      <div className="fc-grid-thumb">
        <ThumbImage src={food.thumb} alt={food.name} />
        <CompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
      </div>
      <div className={`fc-grid-body${showPurchase ? ' has-purchase' : ''}`}>
        <div className="fc-grid-brand">{food.brand}</div>
        <a
          className="fc-grid-name"
          href={productHref(food)}
          onClick={(e) => handleNameClick(e, onClick)}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {food.name}
          {/* 용량 — 제품명 옆 인라인 */}
          {food.serving && (
            <span className="fc-grid-serving">
              {' '}{food.serving}
            </span>
          )}
        </a>
        {/* 성분 스탯 — 라벨/수치 정렬 그리드 */}
        <StatGrid stats={stats} />
        {/* 가격링크 — 추천 그리드 등에서만 표시 (개당 최저가 1개) */}
        {showPurchase && (
          <PurchaseOffers
            offers={food.purchaseLinks}
            compact
            maxItems={1}
            pricePer="unit"
            title="개당 최저가"
            className="fc-grid-offers"
            emptyLabel="가격 정보 없음"
          />
        )}
        {/* 후기 N건 — 카드 trust 신호 */}
      </div>
    </div>
  );
}

// 데스크톱 메인 목적별 추천 전용 카드.
// 일반 그리드 카드와 독립적으로 구성해 추천 영역만의 정보 배치 변경이 다른 카드에 번지지 않게 한다.
export function PurposeRecommendCard({ food, onClick, onCompare, inCompare, metrics }) {
  if (!food) return null;
  const stats = metrics ? getPurposeStats(food, metrics) : getDefaultStats(food);

  return (
    <div className="fc-grid-card" onClick={onClick}>
      <div className="fc-grid-thumb">
        <ThumbImage src={food.thumb} alt={food.name} />
        <CompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
      </div>
      <div className="fc-grid-body has-purchase">
        <div className="fc-grid-brand">{food.brand}</div>
        <a
          className="fc-grid-name"
          href={productHref(food)}
          onClick={(e) => handleNameClick(e, onClick)}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {food.name}
          {food.serving && (
            <span className="fc-grid-serving">
              {' '}{food.serving}
            </span>
          )}
        </a>
        <StatGrid stats={stats} />
        <PurchaseOffers
          offers={food.purchaseLinks}
          compact
          maxItems={1}
          pricePer="unit"
          title="개당 최저가"
          className="fc-grid-offers"
          emptyLabel="가격 정보 없음"
          affiliatePlacement="below"
        />
      </div>
    </div>
  );
}

// 카드 하단 trust 신호 — "후기 24건"
// - reviewCount 가 없으면 "후기 수집 중" 라벨
function ReviewMeta({ reviewCount }) {
  const hasReviews = typeof reviewCount === 'number' && reviewCount > 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        fontSize: 'var(--font-size-xxs)',
        color: 'var(--text-secondary)',
        lineHeight: 1.3,
      }}
    >
      <span>{hasReviews ? `후기 ${reviewCount}건` : '후기 수집 중'}</span>
    </div>
  );
}

export function FoodCard({ food, onClick, layout = 'grid', onCompare, inCompare, onWishlist, inWishlist, sortKey, tabId, subLabel, showPurchase = false, metrics }) {
  if (!food) return null;
  if (layout === 'list') {
    return <FoodCardList food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />;
  }
  if (layout === 'wide') {
    return <FoodCardWide food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} onWishlist={onWishlist} inWishlist={inWishlist} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />;
  }
  return <FoodCardGrid food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} sortKey={sortKey} showPurchase={showPurchase} metrics={metrics} />;
}
