// 다분해 DS FoodCard (제품 카드 — grid/list 두 가지 레이아웃)
// props:
//   - food: adapters.getAdapted(product) 결과 객체
//       { id, brand, name, thumb(URL), score(0~10), macros, tags, trustBadges, ... }
//   - onClick: 카드 전체 클릭 핸들러 (디테일 진입)
//   - layout: 'grid' (홈/리스트 그리드) | 'list' (리스트 페이지)
//   - onCompare: 비교함 담기 콜백 (미지정 시 + 버튼 미표시)
import { Fragment } from 'react';
import { MacroRow } from './MacroRow.jsx';
import { useMetricColumn } from './MetricColumnContext.jsx';
import { IconPlus, IconCheck } from './Icons.jsx';
import { getCategoryMetrics } from '../../data/purposes.jsx';
import { getCategoryCardConfig, computeMetricValues, getHighlightValue } from '../../data/categoryCardMetrics.js';
import { formatProteinSourceLabel } from '../../data/listFilters.js';
import { useProteinResolver } from '../../data/proteinQuality.js';
import {
  PROTEIN_SORT_BASES,
  PROTEIN_SORT_MODES,
  PROTEIN_SORT_RECOMMEND,
  splitProteinSortKey,
} from '../../data/listSort.js';
import PurchaseOffers from '../global/PurchaseOffers.jsx';

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

function ServingMeta({ food, showCalories = false }) {
  const parts = [];
  if (food.serving) parts.push(food.serving);
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
        <div
          style={{
            fontSize: 14,
            color: 'var(--text-primary)',
            fontWeight: 500,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {food.name}
        </div>
        <ServingMeta food={food} showCalories={Boolean(config.primaryMetrics)} />
        <CategoryMetricsBlock food={food} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />
        <PurchaseOffers offers={food.purchaseLinks} compact sortBy="unit-first" className="fc-card-offers" />
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

// 우선순위 기반 카드 메트릭 (단백질 음료 등)
// - 상단: 단백질원, 용량 라인: 용량·열량, 하단: 정렬 기준별 핵심 지표
// - 하단: 핵심 지표(총량 + 칼로리/가격 대비) 열 정렬 표
function TieredMetricsBlock({ food, config, sortKey }) {
  const primary = config.primaryMetrics ?? [];
  const sources = config.showProteinSource ? (food.ingredients?.proteinSources ?? []) : [];
  const isRecommend = !sortKey || sortKey === PROTEIN_SORT_RECOMMEND;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      {isRecommend ? (
        <TieredPrimaryTable food={food} metrics={primary} sortKey={sortKey} />
      ) : (
        <SelectedProteinMetric food={food} metrics={primary} sortKey={sortKey} />
      )}

      <TieredMeta sources={sources} />
    </div>
  );
}

// 표 위 부가정보 — 단백질원만 간결하게 표시
function TieredMeta({ sources }) {
  const resolveProtein = useProteinResolver(sources);
  const hasSource = sources.length > 0;
  if (!hasSource) return null;

  const sourceLabels = sources.map((source) => {
    return formatProteinSourceLabel(source, resolveProtein);
  });

  return (
    <div className="fc-meta">
      <div className="fc-meta-row">
        <span className="fc-meta-label">단백질원</span>
        <span className="fc-meta-value">
          {sourceLabels.join(' · ')}
        </span>
      </div>
    </div>
  );
}

function SelectedProteinMetric({ food, metrics, sortKey }) {
  const { base, mode } = splitProteinSortKey(sortKey);
  const metric = metrics.find((m) => m.key === base);
  if (!metric) return null;
  const values = computeMetricValues(food, metric);
  if (!values) return null;

  const modeDef = PROTEIN_SORT_MODES.find((m) => m.key === mode);
  const baseDef = PROTEIN_SORT_BASES.find((b) => b.key === base);
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
      <span className="fc-selected-metric-name">{baseDef?.label ?? metric.label}</span>
      <span className="fc-selected-metric-value">
        {value.num}<span className="fc-selected-metric-unit">{value.unit}</span>
      </span>
      <span className="fc-selected-metric-sep">/</span>
      <span className="fc-selected-metric-basis">{modeDef?.label ?? '총량 기준'}</span>
    </div>
  );
}

// 1순위 핵심 지표 — 총량/100kcal당/1,000원당 열 정렬 표
// - 세 지표를 같은 비중으로 두되 열로 정렬해 가독성 확보
// - 100kcal당/1,000원당 열은 데이터(칼로리·구매가) 있을 때만 노출
// - 리스트 카드 + 상세페이지(핵심 지표 섹션)에서 공용
export function TieredPrimaryTable({ food, metrics, sortKey }) {
  // 강조 열 — 카드 간 공유(컨텍스트). 호버 시 모든 제품 같은 열 강조, 풀려도 유지
  const [hoverCol, setHoverCol] = useMetricColumn();

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
    { key: 'total', head: '총량 기준', variant: 'total', pick: (r) => r.total },
    { key: 'kcal', head: '100kcal 기준', variant: 'ratio', pick: (r) => r.perKcal },
    { key: 'price', head: '1,000원 기준', variant: 'ratio', pick: (r) => r.perPrice },
  ];

  // 정렬 조합(기준×성분)이면 sortMode — 해당 '셀'만 강조하고 호버 로직은 비활성
  // 추천순/미지정이면 기존 호버 '열' 강조만 동작
  const hl = typeof sortKey === 'string' && sortKey.includes('_')
    ? splitProteinSortKey(sortKey)
    : null;
  const sortMode = !!hl;

  const cellActive = (rKey, cKey) =>
    (sortMode ? (hl.base === rKey && hl.mode === cKey) : (hoverCol === cKey));
  const headActive = (cKey) =>
    (sortMode ? (hl.mode === cKey) : (hoverCol === cKey));
  const focused = sortMode || !!hoverCol;

  // 호버 핸들러 — 조합 정렬 중엔 미부착(호버 강조 비활성), 추천순일 때만 동작
  const colHandlers = (key) => (sortMode ? {} : { onMouseEnter: () => setHoverCol(key) });

  return (
    <div
      className={`fc-ptable${focused ? ' is-focused' : ''}`}
    >
      {/* 헤더 — 라인 없이 타이포(작고 연함)로 구분 */}
      <span className="fc-ptable-corner" />
      {cols.map((c) => (
        <span
          key={c.key}
          className={`fc-ptable-head${headActive(c.key) ? ' is-active' : ''}`}
          {...colHandlers(c.key)}
        >
          {c.head}
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
              {...colHandlers(c.key)}
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

// wide 레이아웃: 가로형 (데스크톱 리스트 전용)
function FoodCardWide({ food, onClick, onCompare, inCompare, tabId, subLabel, sortKey }) {
  // 카테고리별 카드 구성 (탄단지 비율바·원재료 섹션 노출 여부)
  const config = getCategoryCardConfig(tabId, subLabel);
  return (
    <div
      onClick={onClick}
      className="d-foodcard-wide"
      style={{
        display: 'flex',
        gap: 20,
        padding: '20px 0',
        cursor: 'pointer',
        alignItems: 'flex-start',
      }}
    >
      {/* 썸네일 + 비교함 */}
      <div className="d-foodcard-wide-media">
        <div className="d-foodcard-wide-thumb">
          <ThumbImage src={food.thumb} alt={food.name} />
        </div>
        {onCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCompare(food);
            }}
            aria-pressed={inCompare}
            aria-label={inCompare ? `${food.name} 비교함에서 빼기` : `${food.name} 비교함에 담기`}
            className={`d-foodcard-wide-compare${inCompare ? ' is-in' : ''}`}
          >
            {inCompare ? <IconCheck size={12} stroke={2} /> : <IconPlus size={12} stroke={2} />}
            <span>비교함</span>
          </button>
        )}
      </div>

      {/* 상세 정보 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{food.brand}</div>

        {/* 상품명 */}
        <div
          style={{
            fontSize: 15,
            color: 'var(--text-primary)',
            fontWeight: 600,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {food.name}
        </div>

        <ServingMeta food={food} showCalories={Boolean(config.primaryMetrics)} />

        {/* 카테고리별 강조 지표 — 모바일 리스트 카드와 동일(CategoryMetricsBlock) */}
        <CategoryMetricsBlock food={food} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />

        {/* 탄단지 비율 막대 — 카테고리 설정에서 끌 수 있음(showMacroBar=false) */}
        {config.showMacroBar !== false && <MacroRow {...food.macros} wide ratioOnly />}

        {/* 나머지 영양성분 — 카테고리 설정에서 끌 수 있음(showSubNutrients=false) */}
        {config.showSubNutrients !== false && (
          <SubNutrients nutrition={food.nutrition} category={food.category} />
        )}

        {/* 원재료·성분 상세 — 카테고리별로 일부 섹션 숨김 가능(hideIngredients)
            tiered 카드(단백질 음료)는 상단 구조화 블록에서 표시하므로 생략 */}
        {config.showIngredientDetails !== false && (
          <IngredientDetails ingredients={food.ingredients} hide={config.hideIngredients} />
        )}
        <PurchaseOffers offers={food.purchaseLinks} compact sortBy="unit-first" className="fc-card-offers" />
      </div>
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
        <div
          className="fc-grid-name"
        >
          {food.name}
          {/* 용량 — 제품명 옆 인라인 */}
          {food.serving && (
            <span className="fc-grid-serving">
              {' '}{food.serving}
            </span>
          )}
        </div>
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

export function FoodCard({ food, onClick, layout = 'grid', onCompare, inCompare, sortKey, tabId, subLabel, showPurchase = false, metrics }) {
  if (!food) return null;
  if (layout === 'list') {
    return <FoodCardList food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />;
  }
  if (layout === 'wide') {
    return <FoodCardWide food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} tabId={tabId} subLabel={subLabel} sortKey={sortKey} />;
  }
  return <FoodCardGrid food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} sortKey={sortKey} showPurchase={showPurchase} metrics={metrics} />;
}
