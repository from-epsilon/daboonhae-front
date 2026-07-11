const FREE_SHIPPING_TARGET_TOTAL = 19800;
const UNIT_PRICE_EPSILON = 0.0001;

export function unitPriceOf(offer) {
  if (typeof offer?.price !== 'number') return null;
  const quantity = Number(offer.quantity ?? 1);
  if (!Number.isFinite(quantity) || quantity <= 0) return offer.price;
  return offer.price / quantity;
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

export function getBestUnitOffer(offers) {
  const candidates = (offers ?? [])
    .filter((offer) => offer && offer.url && offer.is_active !== false)
    .map((offer) => ({ offer, unitPrice: unitPriceOf(offer) }))
    .filter(({ unitPrice }) => typeof unitPrice === 'number');
  if (candidates.length === 0) return null;

  const cheapestUnitPrice = Math.min(...candidates.map(({ unitPrice }) => unitPrice));
  return candidates
    .filter(({ unitPrice }) => sameUnitPrice(unitPrice, cheapestUnitPrice))
    .map(({ offer }) => offer)
    .sort(compareByFreeShippingTotal)[0] ?? null;
}

export function bestUnitPriceOf(product) {
  return unitPriceOf(getBestUnitOffer(product?.purchaseLinks));
}

export function formatWon(value) {
  if (typeof value !== 'number') return null;
  return Math.round(value).toLocaleString();
}

export function getPurchaseRedirectUrl(offer, delaySeconds = 1.5, productId) {
  if (!offer?.url) return null;
  const params = new URLSearchParams({
    url: offer.url,
    vendor: offer.vendorName || '판매처',
    delay: delaySeconds,
  });
  if (productId != null) params.set('product', String(productId));
  return `/redirect?${params.toString()}`;
}
