// 판매처 로고 매핑 — 구매 오퍼에서 판매처명 텍스트 대신 로고 이미지로 표시
// 로고가 없는 판매처는 텍스트로 폴백
const VENDOR_LOGOS = {
  '쿠팡': { src: '/icons/vendor-coupang.png', alt: '쿠팡' },
  '대상웰라이프': { src: '/icons/vendor-daesang.png', alt: '대상웰라이프' },
};

export function getVendorLogo(vendorName) {
  return VENDOR_LOGOS[(vendorName || '').trim()] ?? null;
}
