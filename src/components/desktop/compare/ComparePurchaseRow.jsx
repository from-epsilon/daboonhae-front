import {
  formatWon,
  getBestUnitOffer,
  getPurchaseRedirectUrl,
  unitPriceOf,
} from '../../../data/purchaseLinks.js';

function PurchaseCell({ product, isBest, motionClass, motionStyle }) {
  const offer = getBestUnitOffer(product?.purchaseLinks);
  const unitPrice = unitPriceOf(offer);
  const redirectUrl = getPurchaseRedirectUrl(offer);
  const cls = [
    'd-compare-purchase-cell',
    isBest ? 'd-compare-purchase-cell--best' : '',
    motionClass,
  ].filter(Boolean).join(' ');

  if (!offer || typeof unitPrice !== 'number' || !redirectUrl) {
    return (
      <div className={`${cls} d-compare-purchase-cell--empty`} style={motionStyle} data-compare-product-id={product.id}>
        <span className="d-compare-purchase-empty">가격 정보 없음</span>
      </div>
    );
  }

  return (
    <div className={cls} style={motionStyle} data-compare-product-id={product.id}>
      <div className="d-compare-purchase-price">
        <span className="d-compare-purchase-price-main">
          <span className="d-compare-purchase-price-prefix">개당</span>{' '}
          {formatWon(unitPrice)}원
        </span>
      </div>
      <div className="d-compare-purchase-meta">
        <span>{offer.quantity ?? 1}개 묶음</span>
        {typeof offer.price === 'number' && <span>총 {formatWon(offer.price)}원</span>}
        {offer.vendorName && <span>{offer.vendorName}</span>}
      </div>
      <a
        className="d-compare-purchase-cta"
        href={redirectUrl}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={(e) => e.stopPropagation()}
      >
        구매하기
      </a>
    </div>
  );
}

export function ComparePurchaseRow({ products, bestSet, rowStyle, hasAdd, dragState }) {
  return (
    <div className="d-compare-row d-compare-row--purchase" style={rowStyle}>
      <div className="d-compare-row-label">
        <span className="d-compare-row-label-text">최저가</span>
        <span className="d-compare-row-hint">개당 기준</span>
      </div>
      {products.map((p, idx) => {
        const isDragging = dragState?.draggedId != null && String(dragState.draggedId) === String(p.id);
        const isDropTarget = dragState?.draggedId != null
          && String(dragState.targetId) === String(p.id)
          && String(dragState.draggedId) !== String(p.id);
        return (
          <PurchaseCell
            key={p.id}
            product={p}
            isBest={bestSet?.has(idx) ?? false}
            motionClass={`${isDragging ? ' is-column-dragging' : ''}${isDropTarget ? ` is-column-drop-${dragState.dropPosition}` : ''}`}
            motionStyle={isDragging ? { transform: `translateX(${dragState.dragOffsetX}px)` } : undefined}
          />
        );
      })}
      {hasAdd && <div className="d-compare-purchase-cell d-compare-purchase-cell--empty" />}
    </div>
  );
}
