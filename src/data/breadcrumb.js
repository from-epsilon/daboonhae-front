// 제품 상세 브레드크럼 경로 구성 — 데스크탑/모바일 JSON-LD 공통 사용
import { CATEGORY_TABS } from './categoryTabs.js';

// 식품유형 코드 → 해당 카테고리가 속한 리스트 URL (탭+서브). 없으면 검색 폴백
export function getCategoryListHref(categoryCode, category) {
  const tab = CATEGORY_TABS.find((t) => t.subs.some((s) => s.code === categoryCode));
  const sub = tab?.subs.find((s) => s.code === categoryCode);
  if (tab && sub) return `/list?tab=${tab.id}&sub=${encodeURIComponent(sub.label)}`;
  return category ? `/list?q=${encodeURIComponent(category)}` : '/list';
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
