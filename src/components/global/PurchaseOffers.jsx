import { useNavigate } from 'react-router-dom';

function formatPurchasePrice(price) {
  if (typeof price !== 'number') return '가격 문의';
  return `${price.toLocaleString()}원`;
}

function normalizeOffers(offers) {
  return (offers ?? [])
    .filter((offer) => offer && offer.url && offer.is_active !== false)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
}

function unitPriceOf(offer) {
  if (typeof offer?.price !== 'number') return null;
  const quantity = Number(offer.quantity ?? 1);
  if (!Number.isFinite(quantity) || quantity <= 0) return offer.price;
  return offer.price / quantity;
}

function getRedirectUrl(offer, delaySeconds = 3) {
  const params = new URLSearchParams({
    url: offer.url,
    vendor: offer.vendorName || '판매처',
    delay: delaySeconds,
  });
  return `/redirect?${params.toString()}`;
}

export default function PurchaseOffers({
  offers,
  title = '가격 비교',
  compact = false,
  maxItems,
  emptyLabel = '가격 정보 준비중',
  className = '',
  redirectDelay = 3,
}) {
  const navigate = useNavigate();
  const sorted = normalizeOffers(offers);
  const visible = typeof maxItems === 'number' ? sorted.slice(0, maxItems) : sorted;
  const unitPrices = sorted.map(unitPriceOf).filter((price) => typeof price === 'number');
  const cheapestUnitPrice = unitPrices.length > 0 ? Math.min(...unitPrices) : null;
  const rootClass = [
    'purchase-offers',
    compact ? 'purchase-offers--compact' : '',
    className,
  ].filter(Boolean).join(' ');

  const handlePurchaseClick = (e, offer) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(getRedirectUrl(offer, redirectDelay));
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
        <div className="purchase-offers-compact-title">{title}</div>
      ) : (
        <h2 className="purchase-offers-title">{title}</h2>
      )}
      <div className="purchase-offers-list">
        {visible.map((offer, i) => {
          const unitPrice = unitPriceOf(offer);
          const isBest = typeof unitPrice === 'number' && unitPrice === cheapestUnitPrice;
          return (
            <a
              key={`${offer.vendorName}-${offer.url}-${i}`}
              className={`purchase-offer${isBest ? ' is-best' : ''}`}
              href="#"
              onClick={(e) => handlePurchaseClick(e, offer)}
            >
              <span className="purchase-offer-main">
                <span className="purchase-offer-vendor">
                  {offer.vendorName || '판매처'}
                </span>
                <span className="purchase-offer-meta">
                  {offer.quantity ?? 1}개입
                  {typeof unitPrice === 'number' && (
                    <span className="purchase-offer-unit">
                      · 개당 {Math.round(unitPrice).toLocaleString()}원
                    </span>
                  )}
                </span>
              </span>
              <span className="purchase-offer-price">{formatPurchasePrice(offer.price)}</span>
            </a>
          );
        })}
      </div>
      <p className="purchase-offers-affiliate">
        ※ 다분해는 제휴 링크 구매에 대해 제휴사로부터 제휴수익을 받습니다. 구매자에게 추가로 발생하는 비용은 없습니다.
      </p>
    </section>
  );
}
