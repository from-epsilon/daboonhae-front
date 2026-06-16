// 제품 상세 브레드크럼 경로 구성 — 데스크탑/모바일 JSON-LD 공통 사용
import { categoryPath } from './categoryTabs.js';

// 식품유형 코드 → 카테고리 경로형 URL (/category/:slug). 매칭 없으면 /list
export function getCategoryListHref(categoryCode, category) {
  return categoryPath(categoryCode);
}

// breadcrumbLd에 넘길 items 배열 구성: 홈 > 제품 목록 > [카테고리] > 제품명
export function buildProductBreadcrumb({ category, categoryCode, productName }) {
  return [
    { name: '홈', path: '/' },
    { name: '제품 목록', path: '/list' },
    ...(category ? [{ name: category, path: getCategoryListHref(categoryCode, category) }] : []),
    { name: productName },
  ];
}
