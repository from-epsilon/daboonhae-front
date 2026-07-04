// 판매처 로고 매핑 — 구매 오퍼에서 판매처명 텍스트 대신 로고 이미지로 표시
// 로고가 없는 판매처는 텍스트로 폴백
const VENDOR_LOGOS = {
  '쿠팡': { src: '/icons/vendor-coupang-light.png', alt: '쿠팡' },
  '대상웰라이프': { src: '/icons/vendor-daesang.png', alt: '대상웰라이프' },
  '올리브영': { src: '/icons/vendor-oliveyoung.png', alt: '올리브영' },
  'CJ올리브영': { src: '/icons/vendor-oliveyoung.png', alt: '올리브영' },
  'CJ 올리브영': { src: '/icons/vendor-oliveyoung.png', alt: '올리브영' },
  'OLIVE YOUNG': { src: '/icons/vendor-oliveyoung.png', alt: '올리브영' },
  'Olive Young': { src: '/icons/vendor-oliveyoung.png', alt: '올리브영' },
  'CJ더마켓': { src: '/icons/vendor-cjthemarket.png', alt: 'CJ더마켓' },
  'CJ 더마켓': { src: '/icons/vendor-cjthemarket.png', alt: 'CJ더마켓' },
  '더마켓': { src: '/icons/vendor-cjthemarket.png', alt: 'CJ더마켓' },
  'CJ THE MARKET': { src: '/icons/vendor-cjthemarket.png', alt: 'CJ더마켓' },
  'CJ The Market': { src: '/icons/vendor-cjthemarket.png', alt: 'CJ더마켓' },
};

export function getVendorLogo(vendorName) {
  return VENDOR_LOGOS[(vendorName || '').trim()] ?? null;
}
