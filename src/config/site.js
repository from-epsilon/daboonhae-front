// 사이트 전역 SEO 상수 — canonical/OG 절대경로의 단일 출처
// 도메인 변경 시 SITE_URL만 수정하면 전 페이지 메타·JSON-LD가 따라감
export const SITE_URL = 'https://www.daboonhae.com';
export const SITE_NAME = '다분해';
export const SITE_TAGLINE = '다이어트 식품 비교·해석 플랫폼';
export const DEFAULT_DESCRIPTION =
  '다이어트 식품의 영양성분을 분해하고 제품 간 가격·성분을 비교합니다. 식약처 공시 영양정보 기반.';
// 1200x630 기본 공유 이미지 (Phase 4에서 에셋 준비)
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;
export const OG_LOCALE = 'ko_KR';

// 절대 URL 헬퍼 — 항상 SITE_URL 기준 (canonical은 쿼리 제거된 정규 경로 권장)
// 이미 절대 URL(http...)이면 그대로 반환
export function absUrl(path = '/') {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, SITE_URL).toString();
}
