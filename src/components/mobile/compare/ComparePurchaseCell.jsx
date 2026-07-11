import {
  formatWon,
  getBestUnitOffer,
  getPurchaseRedirectUrl,
  unitPriceOf,
} from '../../../data/purchaseLinks.js';

export function ComparePurchaseCell({ product, isBest }) {
  const offer = getBestUnitOffer(product?.purchaseLinks);
  const unitPrice = unitPriceOf(offer);
  const redirectUrl = getPurchaseRedirectUrl(offer, 1.5, product?.id);
  const cls = [
    'm-compare-cell',
    'm-compare-purchase-cell',
    isBest ? 'm-compare-purchase-cell--best' : '',
  ].filter(Boolean).join(' ');

  if (!offer || typeof unitPrice !== 'number' || !redirectUrl) {
    return (
      <div className={`${cls} m-compare-purchase-cell--empty`}>
        <span className="m-compare-cell-label">최저가</span>
        <span className="m-compare-purchase-empty">가격 정보 없음</span>
      </div>
    );
  }

  return (
    <div className={cls}>
      <span className="m-compare-cell-label">최저가</span>
      <span className="m-compare-purchase-price">개당 {formatWon(unitPrice)}원</span>
      <span className="m-compare-purchase-meta">
        {offer.quantity ?? 1}개 묶음
        {typeof offer.price === 'number' && ` · 총 ${formatWon(offer.price)}원`}
      </span>
      <a
        className="m-compare-purchase-cta"
        href={redirectUrl}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={(e) => e.stopPropagation()}
      >
        구매
      </a>
    </div>
  );
}
