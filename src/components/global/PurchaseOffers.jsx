import { getVendorLogo } from '../../utils/vendorLogo.js';

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

// 표시 순서 결정
// - 'total'      : 총액 오름차순
// - 'unit'       : 개당(단가) 오름차순
// - 'unit-first' : 개당 최저가 1개를 맨 앞에 고정 + 나머지는 총액 오름차순
function orderOffers(offers, mode) {
  const base = normalizeOffers(offers); // 총액 오름차순 + 유효 필터
  if (base.length <= 1) return base;

  if (mode === 'unit') {
    return [...base].sort(
      (a, b) => (unitPriceOf(a) ?? Infinity) - (unitPriceOf(b) ?? Infinity),
    );
  }

  if (mode === 'unit-first') {
    let bestIdx = -1;
    let bestUnit = Infinity;
    base.forEach((offer, i) => {
      const u = unitPriceOf(offer);
      if (typeof u === 'number' && u < bestUnit) {
        bestUnit = u;
        bestIdx = i;
      }
    });
    if (bestIdx < 0) return base;
    // 개당 최저가를 맨 앞으로, 나머지는 base(총액 오름차순) 순서 유지
    return [base[bestIdx], ...base.filter((_, i) => i !== bestIdx)];
  }

  return base; // 'total'
}

function unitPriceOf(offer) {
  if (typeof offer?.price !== 'number') return null;
  const quantity = Number(offer.quantity ?? 1);
  if (!Number.isFinite(quantity) || quantity <= 0) return offer.price;
  return offer.price / quantity;
}

// 개당 가격 표기 (개당 N원) — 단가 없으면 가격 문의
function formatUnitPrice(unitPrice) {
  if (typeof unitPrice !== 'number') return '가격 문의';
  return `개당 ${Math.round(unitPrice).toLocaleString()}원`;
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
  pricePer = 'total', // 'total' 총액 표시 | 'unit' 개당(단가) 최저가 표시
  sortBy = 'total',   // 'total' 총액순 | 'unit' 개당순 | 'unit-first' 개당 최저가 먼저+나머지 총액순
}) {
  const isUnit = pricePer === 'unit';
  // 개당 표시 모드는 자연히 개당순 정렬
  const sortMode = isUnit ? 'unit' : sortBy;
  const sorted = orderOffers(offers, sortMode);
  const visible = typeof maxItems === 'number' ? sorted.slice(0, maxItems) : sorted;
  const unitPrices = sorted.map(unitPriceOf).filter((price) => typeof price === 'number');
  const cheapestUnitPrice = unitPrices.length > 0 ? Math.min(...unitPrices) : null;
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
              href={getRedirectUrl(offer, redirectDelay)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePurchaseClick}
            >
              <span className="purchase-offer-main">
                <span className="purchase-offer-vendor">
                  <VendorLabel vendorName={offer.vendorName} />
                  {offer.isFastDelivery && <span className="purchase-offer-fast">빠른배송</span>}
                </span>
                <span className="purchase-offer-meta">
                  {offer.quantity ?? 1}개입
                  {/* 개당 모드에선 메인 가격이 이미 개당가라 중복 표기 생략 */}
                  {!isUnit && typeof unitPrice === 'number' && (
                    <span className="purchase-offer-unit">
                      · 개당 {Math.round(unitPrice).toLocaleString()}원
                    </span>
                  )}
                </span>
              </span>
              <span className="purchase-offer-price">
                {isUnit ? formatUnitPrice(unitPrice) : formatPurchasePrice(offer.price)}
              </span>
            </a>
          );
        })}
      </div>
      {updatedLabel && (
        <p className="purchase-offers-updated">
          가격 정보 기준 {updatedLabel} · 실제 가격과 다를 수 있어 구매 전 확인해 주세요
        </p>
      )}
      <p className="purchase-offers-affiliate">
        ※ 다분해는 제휴 링크 구매에 대해 제휴사로부터 제휴수익을 받습니다. 구매자에게 추가로 발생하는 비용은 없습니다.
      </p>
    </section>
  );
}
