import { IconChevron, IconCompare, IconHeart } from '../ds/Icons.jsx';
import { computeMetricValues, getHighlightValue } from '../../data/categoryCardMetrics.js';
import { productPath } from '../../data/productUrl.js';
import { getProteinDrinkScoreModel } from '../../data/proteinDrinkScore.js';
import {
  formatWon,
  getBestUnitOffer,
  getPurchaseRedirectUrl,
  unitPriceOf,
} from '../../data/purchaseLinks.js';
import { getVendorLogo } from '../../utils/vendorLogo.js';
import ProductNameText from '../global/ProductNameText.jsx';
import './SummaryCard.css';

function productHref(food) {
  return food?.id != null ? productPath(food) : undefined;
}

function handleNameClick(event, onClick) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
  event.preventDefault();
  event.stopPropagation();
  onClick?.();
}

function SummaryThumb({ src, alt }) {
  if (!src) return <div className="summary-card-thumb-placeholder" aria-hidden="true" />;
  return <img className="summary-card-thumb-img" src={src} alt={alt ?? ''} loading="lazy" />;
}

export function SummaryCompareButton({ food, onCompare, inCompare }) {
  if (!onCompare) return null;
  return (
    <button
      type="button"
      className={`d-foodcard-wide-action d-foodcard-wide-action--compare${inCompare ? ' is-in' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onCompare(food);
      }}
      aria-pressed={inCompare}
      aria-label={inCompare ? `${food.name} 비교함에서 빼기` : `${food.name} 비교함에 담기`}
      title={inCompare ? '비교함에서 빼기' : '비교함에 담기'}
    >
      <IconCompare size={16} stroke={1.8} />
    </button>
  );
}

export function SummaryWishlistButton({ food, onWishlist, inWishlist }) {
  if (!onWishlist) return null;
  return (
    <button
      type="button"
      className={`d-foodcard-wide-action d-foodcard-wide-action--like${inWishlist ? ' is-in' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onWishlist(food);
      }}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? `${food.name} 찜함에서 빼기` : `${food.name} 찜하기`}
      title={inWishlist ? '찜함에서 빼기' : '찜하기'}
    >
      <IconHeart size={16} stroke={1.8} fill={inWishlist ? 'currentColor' : 'none'} />
    </button>
  );
}

function getPurposeStats(food, metrics) {
  const items = (metrics ?? [])
    .map((metric) => {
      const value = getHighlightValue(food, metric);
      return value ? { label: metric.label, num: value.num, unit: value.unit } : null;
    })
    .filter(Boolean);
  if (items.length > 0) items[0].primary = true;
  return items;
}

function getDefaultStats(food) {
  const macros = food?.macros ?? {};
  return [
    { label: '칼로리', num: macros.kcal, unit: 'kcal', primary: true },
    { label: '탄수화물', num: macros.carbs, unit: 'g' },
    { label: '단백질', num: macros.protein, unit: 'g' },
    { label: '지방', num: macros.fat, unit: 'g' },
  ].filter((stat) => stat.num !== undefined && stat.num !== null);
}

function getProteinDrinkStats(food) {
  const score = getProteinDrinkScoreModel(food).overall.value;
  const protein = food?.nutrition?.protein;
  return [
    Number.isFinite(score)
      ? { label: '추천점수', num: Math.round(score), unit: '점', primary: true }
      : null,
    Number.isFinite(protein)
      ? { label: '단백질', num: Math.round(protein * 10) / 10, unit: 'g' }
      : null,
  ].filter(Boolean);
}

function summaryStats(food, metrics) {
  if (food?.categoryCode === 'protein_drink') return getProteinDrinkStats(food);
  return metrics ? getPurposeStats(food, metrics) : getDefaultStats(food);
}

function caloriesLabel(food) {
  const calories = food?.nutrition?.calories;
  return Number.isFinite(calories) ? `${Math.round(calories)}kcal` : null;
}

function SummaryInlineMeta({ food }) {
  const parts = [food?.serving, food?.categoryCode === 'protein_drink' ? caloriesLabel(food) : null].filter(Boolean);
  if (parts.length === 0) return null;
  return <span className="summary-card-serving"> {parts.join(' · ')}</span>;
}

function SummaryStats({ stats }) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="summary-card-stats" style={{ '--summary-stat-count': stats.length }}>
      {stats.map((stat) => (
        <div key={stat.label} className="summary-card-stat">
          <span className={`summary-card-stat-label${stat.primary ? ' is-primary' : ''}`}>
            {stat.label}
          </span>
          <span className={`summary-card-stat-value${stat.primary ? ' is-primary' : ''}`}>
            {stat.num}
            <span className="summary-card-stat-unit">{stat.unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function SummaryPurchaseLink({ offer, productId }) {
  const unitPrice = unitPriceOf(offer);
  const href = getPurchaseRedirectUrl(offer, 1.5, productId);
  if (!offer || unitPrice == null || !href) return null;
  const vendorLogo = getVendorLogo(offer.vendorName);

  return (
    <div className="summary-purchase">
      <a
        className="summary-purchase-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="summary-purchase-vendor">
          {vendorLogo ? (
            <img className="summary-purchase-vendor-logo" src={vendorLogo.src} alt={vendorLogo.alt} />
          ) : (
            offer.vendorName || '판매처'
          )}
        </span>
        <span className="summary-purchase-price">
          <small>개당</small>
          <strong>{formatWon(unitPrice)}원</strong>
          <IconChevron size={13} stroke={2} />
        </span>
      </a>
      <span className="summary-purchase-affiliate">
        ※ 다분해는 제휴 링크 구매에 대해 제휴사로부터 제휴수익을 받습니다.
      </span>
    </div>
  );
}

// 메인 페이지 전용 요약카드.
// 목록/찜함 카드와 렌더러·클래스명을 공유하지 않아 이후 구성을 독립적으로 변경할 수 있다.
export function SummaryCard({
  food,
  onClick,
  onCompare,
  inCompare,
  onWishlist,
  inWishlist,
  metrics,
  showPurchase = false,
  variant = 'standard',
}) {
  if (!food) return null;
  const isRecommend = variant === 'recommend';
  const bestOffer = getBestUnitOffer(food.purchaseLinks);
  const displaysPurchase = Boolean((showPurchase || isRecommend) && bestOffer);
  const stats = summaryStats(food, metrics);

  return (
    <article className="summary-card" onClick={onClick}>
      <div className="summary-card-thumb">
        <SummaryThumb src={food.thumb} alt={food.name} />
        {(onWishlist || onCompare) && (
          <div className="summary-card-actions">
            <SummaryWishlistButton food={food} onWishlist={onWishlist} inWishlist={inWishlist} />
            <SummaryCompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
          </div>
        )}
      </div>
      <div className={`summary-card-body${displaysPurchase ? ' has-purchase' : ''}`}>
        <div className="summary-card-brand">{food.brand}</div>
        <a
          className="summary-card-name"
          href={productHref(food)}
          onClick={(event) => handleNameClick(event, onClick)}
        >
          <ProductNameText product={food} />
          <SummaryInlineMeta food={food} />
        </a>
        <SummaryStats stats={stats} />
        {displaysPurchase && <SummaryPurchaseLink offer={bestOffer} productId={food.id} />}
      </div>
    </article>
  );
}

const MOBILE_RECENT_METRICS = [
  { key: 'calories', label: '칼로리', unit: 'kcal', perVol: true },
  { key: 'protein', label: '단백질', unit: 'g', perVol: true },
  { key: 'sugar', label: '당류', unit: 'g', perVol: true },
];

function MobileSummaryMetrics({ food }) {
  if (food?.categoryCode === 'protein_drink') {
    return <SummaryStats stats={getProteinDrinkStats(food)} />;
  }
  return (
    <div className="mobile-summary-metrics">
      {MOBILE_RECENT_METRICS.map((metric) => {
        const result = computeMetricValues(food, metric);
        if (!result) return null;
        return (
          <div key={metric.key} className="mobile-summary-metric-row">
            <span className="mobile-summary-metric-label">{metric.label}</span>
            <span className="mobile-summary-metric-value">
              {result.total}<span>{result.unit}</span>
            </span>
            {result.ratios.map((ratio) => (
              <span key={ratio.label} className="mobile-summary-metric-ratio">
                {ratio.value}<small>{ratio.label}</small>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// 모바일 메인 '최근 추가' 전용 행 카드. 모바일 목록 카드와 구현을 공유하지 않는다.
export function MobileSummaryListCard({ food, onClick, onCompare, inCompare, onWishlist, inWishlist }) {
  if (!food) return null;
  const bestOffer = getBestUnitOffer(food.purchaseLinks);
  return (
    <article className="mobile-summary-list" onClick={onClick}>
      <div className="mobile-summary-media">
        <div className="mobile-summary-thumb">
          <SummaryThumb src={food.thumb} alt={food.name} />
          <div className="summary-card-actions">
            <SummaryWishlistButton food={food} onWishlist={onWishlist} inWishlist={inWishlist} />
            <SummaryCompareButton food={food} onCompare={onCompare} inCompare={inCompare} />
          </div>
        </div>
      </div>
      <div className="mobile-summary-body">
        <div className="mobile-summary-brand">{food.brand}</div>
        <a
          className="mobile-summary-name"
          href={productHref(food)}
          onClick={(event) => handleNameClick(event, onClick)}
        >
          <ProductNameText product={food} />
          {food.categoryCode === 'protein_drink' && <SummaryInlineMeta food={food} />}
        </a>
        {food.categoryCode !== 'protein_drink' && food.serving && (
          <div className="mobile-summary-serving">{food.serving}</div>
        )}
        <MobileSummaryMetrics food={food} />
        <SummaryPurchaseLink offer={bestOffer} productId={food.id} />
      </div>
    </article>
  );
}
