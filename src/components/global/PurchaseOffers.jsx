import { getVendorLogo } from '../../utils/vendorLogo.js';
import { IconRocket } from '../ds/Icons.jsx';

const FREE_SHIPPING_TARGET_TOTAL = 19800;
const UNIT_PRICE_EPSILON = 0.0001;

function formatPurchasePrice(price) {
  if (typeof price !== 'number') return '가격 문의';
  return `${price.toLocaleString()}원`;
}

// 판매처 표시 — 로고가 있으면 이미지, 없으면 텍스트
function VendorLabel({ vendorName }) {
  const logo = getVendorLogo(vendorName);
  if (logo) {
    return <img className="purchase-offer-logo" src={logo.src} alt={logo.alt} />;
  }
  return <>{vendorName || '판매처'}</>;
}

// 유효 오퍼만 추려 총액 오름차순 정렬 (기본 정렬)
function normalizeOffers(offers) {
  return (offers ?? [])
    .filter((offer) => offer && offer.url && offer.is_active !== false)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
}

function totalPriceOf(offer) {
  return typeof offer?.price === 'number' ? offer.price : Infinity;
}

function sameUnitPrice(a, b) {
  return Math.abs(a - b) < UNIT_PRICE_EPSILON;
}

function compareByFreeShippingTotal(a, b) {
  const aTotal = totalPriceOf(a);
  const bTotal = totalPriceOf(b);
  const aMeetsTarget = aTotal >= FREE_SHIPPING_TARGET_TOTAL;
  const bMeetsTarget = bTotal >= FREE_SHIPPING_TARGET_TOTAL;

  if (aMeetsTarget !== bMeetsTarget) return aMeetsTarget ? -1 : 1;
  return aTotal - bTotal;
}

function getBestUnitOffer(offers, priceOf = unitPriceOf) {
  const candidates = (offers ?? [])
    .map((offer) => ({ offer, unitPrice: priceOf(offer) }))
    .filter(({ unitPrice }) => typeof unitPrice === 'number');
  if (candidates.length === 0) return null;

  const cheapestUnitPrice = Math.min(...candidates.map(({ unitPrice }) => unitPrice));
  return candidates
    .filter(({ unitPrice }) => sameUnitPrice(unitPrice, cheapestUnitPrice))
    .map(({ offer }) => offer)
    .sort(compareByFreeShippingTotal)[0] ?? null;
}

// 표시 순서 결정
// - 'total'      : 총액 오름차순
// - 'unit'       : 개당(단가) 오름차순
// - 'unit-first' : 개당 최저가 1개를 맨 앞에 고정 + 나머지는 총액 오름차순
function orderOffers(offers, mode, priceOf = unitPriceOf) {
  const base = normalizeOffers(offers); // 총액 오름차순 + 유효 필터
  if (base.length <= 1) return base;

  if (mode === 'unit') {
    return [...base].sort((a, b) => {
      const aUnit = priceOf(a) ?? Infinity;
      const bUnit = priceOf(b) ?? Infinity;
      if (!sameUnitPrice(aUnit, bUnit)) return aUnit - bUnit;
      return compareByFreeShippingTotal(a, b);
    });
  }

  if (mode === 'unit-first') {
    const best = getBestUnitOffer(base, priceOf);
    if (!best) return base;
    // 개당 최저가 중 무료배송 기준에 가까운 최저 총액을 맨 앞으로, 나머지는 총액순 유지
    return [best, ...base.filter((offer) => offer !== best)];
  }

  return base; // 'total'
}

function unitPriceOf(offer) {
  if (typeof offer?.price !== 'number') return null;
  const quantity = Number(offer.quantity ?? 1);
  if (!Number.isFinite(quantity) || quantity <= 0) return offer.price;
  return offer.price / quantity;
}

function servingPriceOf(offer, servingsPerUnit) {
  const unitPrice = unitPriceOf(offer);
  const servings = Number(servingsPerUnit);
  if (typeof unitPrice !== 'number') return null;
  if (!Number.isFinite(servings) || servings <= 0) return unitPrice;
  return unitPrice / servings;
}

function basisPriceParts(price, pricePer) {
  if (typeof price !== 'number') return null;
  return {
    label: pricePer === 'serving' ? '1회분당' : '개당',
    value: `${Math.round(price).toLocaleString()}원`,
  };
}

function getRedirectUrl(offer, delaySeconds = 1.5) {
  const params = new URLSearchParams({
    url: offer.url,
    vendor: offer.vendorName || '판매처',
    delay: delaySeconds,
  });
  return `/redirect?${params.toString()}`;
}

// 오퍼 목록 중 가장 최근 가격 갱신 시각 (YYYY.MM.DD) — 없으면 null
function latestUpdatedLabel(offers) {
  const times = (offers ?? [])
    .map((o) => o.updatedAt)
    .filter(Boolean)
    .map((t) => new Date(t).getTime())
    .filter((t) => Number.isFinite(t));
  if (times.length === 0) return null;
  const d = new Date(Math.max(...times));
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export default function PurchaseOffers({
  offers,
  title = '가격 비교',
  compact = false,
  maxItems,
  emptyLabel = '가격 정보 준비중',
  className = '',
  redirectDelay = 1.5,
  showUpdatedAt = false,
  stacked = false,
  pricePer = 'unit',  // 'unit' 개당가 강조 | 'serving' 1회분당 강조 | 'total' 총액 강조
  sortBy = 'total',   // 'total' 총액순 | 'unit' 개당순 | 'unit-first' 개당 최저가 먼저+나머지 총액순
  servingsPerUnit,
  affiliatePlacement = 'header', // compact 카드에서만 'header' | 'below'
}) {
  const isUnitLike = pricePer === 'unit' || pricePer === 'serving';
  const basisPriceOf = pricePer === 'serving'
    ? (offer) => servingPriceOf(offer, servingsPerUnit)
    : unitPriceOf;
  // 단가 표시 모드는 자연히 단가순 정렬
  const sortMode = isUnitLike ? 'unit' : sortBy;
  const sorted = orderOffers(offers, sortMode, basisPriceOf);
  const visible = typeof maxItems === 'number' ? sorted.slice(0, maxItems) : sorted;
  const bestUnitOffer = getBestUnitOffer(sorted, basisPriceOf);
  const updatedLabel = showUpdatedAt ? latestUpdatedLabel(sorted) : null;
  const rootClass = [
    'purchase-offers',
    compact ? 'purchase-offers--compact' : '',
    stacked ? 'purchase-offers--stacked' : '',
    className,
  ].filter(Boolean).join(' ');

  // 리다이렉트 페이지는 새 탭에서 열리도록 자연스러운 링크로 처리.
  // 부모 카드의 클릭 핸들러만 막고, 기본 동작(새 탭 열기)은 그대로 둔다.
  const handlePurchaseClick = (e) => {
    e.stopPropagation();
  };

  if (sorted.length === 0) {
    return (
      <section className={`${rootClass} purchase-offers--empty`}>
        {!compact && <h2 className="purchase-offers-title">{title}</h2>}
        <p className="purchase-offers-empty">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className={rootClass}>
      {compact ? (
        <div className="purchase-offers-head">
          <div className="purchase-offers-compact-title">{title}</div>
          {affiliatePlacement !== 'below' && (
            <p className="purchase-offers-affiliate">
              ※ 다분해는 제휴 링크 구매에 대해 제휴사로부터 제휴수익을 받습니다. 구매자에게 추가로 발생하는 비용은 없습니다.
            </p>
          )}
        </div>
      ) : (
        <h2 className="purchase-offers-title">{title}</h2>
      )}
      <div className="purchase-offers-list">
        {visible.map((offer, i) => {
          const basisPrice = basisPriceOf(offer);
          const basisParts = basisPriceParts(basisPrice, pricePer);
          const unitPrice = unitPriceOf(offer);
          const isBest = offer === bestUnitOffer;
          return (
            <a
              key={`${offer.vendorName}-${offer.url}-${i}`}
              className={`purchase-offer${isBest ? ' is-best' : ''}`}
              href={getRedirectUrl(offer, redirectDelay)}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              onClick={handlePurchaseClick}
            >
              <span className="purchase-offer-main">
                <span className="purchase-offer-vendor">
                  <VendorLabel vendorName={offer.vendorName} />
                  {offer.isFastDelivery && (
                    <span className="purchase-offer-fast">
                      <IconRocket size={11} stroke={1.8} />
                      빠른배송
                    </span>
                  )}
                </span>
                <span className="purchase-offer-meta">
                  {offer.quantity ?? 1}개입
                  {isUnitLike && typeof offer.price === 'number' && (
                    <span className="purchase-offer-total">
                      · 총 {formatPurchasePrice(offer.price)}
                    </span>
                  )}
                  {!isUnitLike && typeof unitPrice === 'number' && (
                    <span className="purchase-offer-unit">
                      · 개당 {Math.round(unitPrice).toLocaleString()}원
                    </span>
                  )}
                </span>
              </span>
              <span className="purchase-offer-price-block">
                {isUnitLike && basisParts ? (
                  <span className="purchase-offer-price">
                    <span className="purchase-offer-price-label">{basisParts.label}</span>
                    <span className="purchase-offer-price-value">{basisParts.value}</span>
                  </span>
                ) : (
                  <span className="purchase-offer-price">
                    <span className="purchase-offer-price-value">{formatPurchasePrice(offer.price)}</span>
                  </span>
                )}
              </span>
            </a>
          );
        })}
      </div>
      {updatedLabel && (
        <p className="purchase-offers-updated">
          가격 정보 기준 {updatedLabel} · 실제 가격과 다를 수 있습니다
        </p>
      )}
      {(!compact || affiliatePlacement === 'below') && (
        <p className="purchase-offers-affiliate">
          ※ 다분해는 제휴 링크 구매에 대해 제휴사로부터 제휴수익을 받습니다. 구매자에게 추가로 발생하는 비용은 없습니다.
        </p>
      )}
    </section>
  );
}
