// 모바일 디테일 — 구매 오퍼 바텀시트
// - food_purchase_links(판매처별 구매 링크)를 최저가순으로 노출
// - 각 행: "판매처 · x수량 · 개당 가격원" + 개당가가 가장 싼 항목에 '최저가' 배지
// - 행 클릭 → 해당 url 새 탭
import { IconClose, IconRocket } from '../../ds/Icons.jsx';
import { getVendorLogo } from '../../../utils/vendorLogo.js';

const FREE_SHIPPING_TARGET_TOTAL = 19800;
const UNIT_PRICE_EPSILON = 0.0001;

// 가격 포맷 (없으면 '가격 문의')
function formatPrice(price) {
  if (typeof price !== 'number') return '가격 문의';
  return `${price.toLocaleString()}원`;
}

function unitPriceOf(offer) {
  if (typeof offer?.price !== 'number') return null;
  const quantity = Number(offer.quantity ?? 1);
  if (!Number.isFinite(quantity) || quantity <= 0) return offer.price;
  return offer.price / quantity;
}

function formatUnitPrice(unitPrice) {
  if (typeof unitPrice !== 'number') return '가격 문의';
  return `개당 ${Math.round(unitPrice).toLocaleString()}원`;
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

function getBestUnitOffer(offers) {
  const candidates = (offers ?? [])
    .map((offer) => ({ offer, unitPrice: unitPriceOf(offer) }))
    .filter(({ unitPrice }) => typeof unitPrice === 'number');
  if (candidates.length === 0) return null;

  const cheapestUnitPrice = Math.min(...candidates.map(({ unitPrice }) => unitPrice));
  return candidates
    .filter(({ unitPrice }) => sameUnitPrice(unitPrice, cheapestUnitPrice))
    .map(({ offer }) => offer)
    .sort(compareByFreeShippingTotal)[0] ?? null;
}

// 판매처 표시 — 로고가 있으면 이미지, 없으면 텍스트
function VendorLabel({ vendorName }) {
  const logo = getVendorLogo(vendorName);
  if (logo) {
    return <img className="m-purchase-logo" src={logo.src} alt={logo.alt} />;
  }
  return <>{vendorName || '판매처'}</>;
}

// 단일 오퍼 행
function OfferRow({ offer, isCheapest, onOpen }) {
  const unitPrice = unitPriceOf(offer);

  return (
    <li>
      <button
        type="button"
        className="m-purchase-row"
        onClick={() => onOpen(offer.url)}
      >
        <span className="m-purchase-row-main">
          <span className="m-purchase-vendor">
            <VendorLabel vendorName={offer.vendorName} />
            {isCheapest && <span className="m-purchase-best">최저가</span>}
            {offer.isFastDelivery && (
              <span className="m-purchase-fast">
                <IconRocket size={11} stroke={1.8} />
                빠른배송
              </span>
            )}
          </span>
          <span className="m-purchase-qty">
            {offer.quantity ?? 1}개입
            {typeof offer.price === 'number' && ` · 총 ${formatPrice(offer.price)}`}
          </span>
        </span>
        <span className="m-purchase-price-block">
          <span className="m-purchase-price">{formatUnitPrice(unitPrice)}</span>
        </span>
      </button>
    </li>
  );
}

export function PurchaseSheet({ open, offers = [], onClose }) {
  if (!open) return null;

  const bestUnitOffer = getBestUnitOffer(offers);

  const handleOpen = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="m-purchase-overlay" role="dialog" aria-label="구매처 선택" onClick={onClose}>
      <div className="m-purchase-sheet" onClick={(e) => e.stopPropagation()}>
        <header className="m-purchase-head">
          <h2 className="m-purchase-title">구매처 선택</h2>
          <button type="button" className="m-purchase-close" onClick={onClose} aria-label="닫기">
            <IconClose size={20} />
          </button>
        </header>
        <ul className="m-purchase-list">
          {offers.map((offer, i) => (
            <OfferRow
              key={`${offer.vendorName}-${i}`}
              offer={offer}
              isCheapest={offer === bestUnitOffer}
              onOpen={handleOpen}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
