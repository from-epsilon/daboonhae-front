// 모바일 디테일 — 구매 오퍼 바텀시트
// - food_purchase_links(판매처별 구매 링크)를 최저가순으로 노출
// - 각 행: "판매처 · x수량 · 가격원" + 가장 싼 항목에 '최저가' 배지
// - 행 클릭 → 해당 url 새 탭
import { IconClose } from '../../ds/Icons.jsx';

// 가격 포맷 (없으면 '가격 문의')
function formatPrice(price) {
  if (typeof price !== 'number') return '가격 문의';
  return `${price.toLocaleString()}원`;
}

// 단일 오퍼 행
function OfferRow({ offer, isCheapest, onOpen }) {
  return (
    <li>
      <button
        type="button"
        className="m-purchase-row"
        onClick={() => onOpen(offer.url)}
      >
        <span className="m-purchase-row-main">
          <span className="m-purchase-vendor">
            {offer.vendorName || '판매처'}
            {isCheapest && <span className="m-purchase-best">최저가</span>}
          </span>
          <span className="m-purchase-qty">x {offer.quantity}</span>
        </span>
        <span className="m-purchase-price">{formatPrice(offer.price)}</span>
      </button>
    </li>
  );
}

export function PurchaseSheet({ open, offers = [], onClose }) {
  if (!open) return null;

  // 유효 가격 중 최저가 1건만 배지 (이미 가격 오름차순 정렬되어 전달됨)
  const cheapestPrice = offers.find((o) => typeof o.price === 'number')?.price;

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
              isCheapest={typeof offer.price === 'number' && offer.price === cheapestPrice}
              onOpen={handleOpen}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
