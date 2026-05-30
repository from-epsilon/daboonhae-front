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

export default function PurchaseOffers({
  offers,
  title = '가격 비교',
  compact = false,
  maxItems,
  emptyLabel = '가격 정보 준비중',
  className = '',
}) {
  const sorted = normalizeOffers(offers);
  const visible = typeof maxItems === 'number' ? sorted.slice(0, maxItems) : sorted;
  const unitPrices = sorted.map(unitPriceOf).filter((price) => typeof price === 'number');
  const cheapestUnitPrice = unitPrices.length > 0 ? Math.min(...unitPrices) : null;
  const rootClass = [
    'purchase-offers',
    compact ? 'purchase-offers--compact' : '',
    className,
  ].filter(Boolean).join(' ');

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
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
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
    </section>
  );
}
