// 다분해 DS FoodCard (제품 카드 — grid/list 두 가지 레이아웃)
// props:
//   - food: adapters.getAdapted(product) 결과 객체
//       { id, brand, name, thumb(URL), score(0~10), macros, tags, trustBadges, ... }
//   - onClick: 카드 전체 클릭 핸들러 (디테일 진입)
//   - layout: 'grid' (홈/리스트 그리드) | 'list' (리스트 페이지)
//   - onCompare: 비교함 담기 콜백 (미지정 시 + 버튼 미표시)
import { MacroRow } from './MacroRow.jsx';
import { IconPlus, IconCheck } from './Icons.jsx';
import { getCategoryMetrics } from '../../data/purposes.jsx';
import { getCategoryCardConfig, computeMetricValues, getHighlightValue } from '../../data/categoryCardMetrics.js';
import PurchaseOffers from '../global/PurchaseOffers.jsx';

// 썸네일 이미지 (URL → img, 빈값 → 회색 placeholder)
// - 원본 DS는 thumb 가 CSS gradient 문자열이라 background 로 적용했지만
//   우리 데이터의 thumb 은 실제 이미지 URL → <img>로 처리 + object-fit cover
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
        objectFit: 'cover',
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

// list 레이아웃: 좌측 88px 컬럼(썸네일 + 담기 버튼) + 텍스트 영역
// - 담긴 제품은 카드 좌측에 그린 강조선 + 버튼 '담김' 상태로 표시
function FoodCardList({ food, onClick, onCompare, inCompare, tabId, subLabel }) {
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
            background: 'var(--gray-100)',
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
        {food.serving && (
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{food.serving}</div>
        )}
        <CategoryMetricsBlock food={food} tabId={tabId} subLabel={subLabel} />
        <PurchaseOffers offers={food.purchaseLinks} compact />
      </div>
    </div>
  );
}

function CategoryMetricsBlock({ food, tabId, subLabel }) {
  const config = getCategoryCardConfig(tabId, subLabel);
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

// 카테고리별 핵심 영양 지표 (hero 숫자)
function KeyMetrics({ nutrition, category }) {
  const metrics = getCategoryMetrics(category);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 16,
        fontFamily: 'var(--font-numeric)',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap',
      }}
    >
      {metrics.map((m, i) => {
        const val = nutrition?.[m.key];
        return (
          <span key={m.key} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 11 }}>{m.label}</span>
            <b style={{ color: 'var(--text-primary)', fontSize: i === 0 ? 16 : 13, fontWeight: 700 }}>
              {val ?? '-'}
            </b>
            <span style={{ fontSize: 10 }}>{m.unit}</span>
          </span>
        );
      })}
    </div>
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

// 원재료·성분 상세 (감미료, 단백질원, 알레르기, 유당)
function IngredientDetails({ ingredients }) {
  if (!ingredients) return null;
  const sections = [];
  if (ingredients.sweeteners?.length > 0) {
    sections.push({ label: '감미료', items: ingredients.sweeteners });
  }
  if (ingredients.proteinSources?.length > 0) {
    sections.push({ label: '단백질원', items: ingredients.proteinSources });
  }
  if (ingredients.allergens?.length > 0) {
    sections.push({ label: '알레르기', items: ingredients.allergens });
  }
  if (sections.length === 0 && !ingredients.lactoseFree) return null;
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
      {ingredients.lactoseFree && (
        <span style={{ color: 'var(--green-700)', fontWeight: 500 }}>유당 Free</span>
      )}
    </div>
  );
}

// wide 레이아웃: 가로형 (데스크톱 리스트 전용)
function FoodCardWide({ food, onClick, onCompare, inCompare }) {
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
      {/* 썸네일 */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 'var(--radius-md)',
          flexShrink: 0,
          overflow: 'hidden',
          background: 'var(--gray-100)',
        }}
      >
        <ThumbImage src={food.thumb} alt={food.name} />
      </div>

      {/* 상세 정보 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        {/* 브랜드 + 비교 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{food.brand}</div>
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

        {/* 용량 */}
        {food.serving && (
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{food.serving}</div>
        )}

        {/* 핵심 영양 지표 (카테고리별) */}
        <div style={{ marginTop: 2 }}>
          <KeyMetrics nutrition={food.nutrition} category={food.category} />
        </div>

        {/* 탄단지 비율 막대 — 그램 수치는 위(히어로)/아래(세부)에서 표시하므로 비율(%)만 */}
        <MacroRow {...food.macros} wide ratioOnly />

        {/* 나머지 영양성분 */}
        <SubNutrients nutrition={food.nutrition} category={food.category} />

        {/* 원재료·성분 상세 */}
        <IngredientDetails ingredients={food.ingredients} />
        <PurchaseOffers offers={food.purchaseLinks} compact />
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
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        gap: 4,
      }}
    >
      {stats.map((s) => (
        <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10,
              color: s.primary ? 'var(--green-700)' : 'var(--text-tertiary)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-numeric)',
              fontSize: s.primary ? 15 : 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            {s.num}
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 1 }}>
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
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          aspectRatio: '1/1',
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--gray-100)',
        }}
      >
        <ThumbImage src={food.thumb} alt={food.name} />
        <CompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
      </div>
      <div style={{ padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 'var(--font-size-xxs)', color: 'var(--text-secondary)' }}>{food.brand}</div>
        <div
          style={{
            fontSize: 'var(--font-size-s)',
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
          {/* 용량 — 제품명 옆 인라인 */}
          {food.serving && (
            <span style={{ fontSize: 'var(--font-size-xxs)', color: 'var(--text-tertiary)', fontWeight: 400 }}>
              {' '}{food.serving}
            </span>
          )}
        </div>
        {/* 성분 스탯 — 라벨/수치 정렬 그리드 */}
        <StatGrid stats={stats} />
        {/* 가격링크 — 추천 그리드 등에서만 표시 (최저가 1개) */}
        {showPurchase && (
          <PurchaseOffers offers={food.purchaseLinks} compact maxItems={1} />
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
    return <FoodCardList food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} tabId={tabId} subLabel={subLabel} />;
  }
  if (layout === 'wide') {
    return <FoodCardWide food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} />;
  }
  return <FoodCardGrid food={food} onClick={onClick} onCompare={onCompare} inCompare={inCompare} sortKey={sortKey} showPurchase={showPurchase} metrics={metrics} />;
}
