// Schema.org JSON-LD 빌더 — 순수 함수 모음
// Phase 1의 <Seo jsonLd={...} />로 주입한다 (페이지에서 직접 <script> 삽입 금지)
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, absUrl } from '../config/site.js';
import { productPath } from './productUrl.js';

// undefined 필드 제거 (JSON-LD에 빈 키 노출 방지)
function clean(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 사이트 운영 주체 — 홈에서 1회
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl('/favicon.svg'), // TODO: 전용 라스터 로고(PNG) 준비되면 교체
    description: DEFAULT_DESCRIPTION,
  };
}

// 사이트 + 내부 검색 — 홈에서 1회 (sitelinks searchbox 후보)
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/list?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// 제품 상세 — adapted product 기준
// (adapted shape: thumb, brand, name, id, category, nutrition{}, purchaseLinks[{price,...}])
export function productLd(product) {
  const n = product?.nutrition ?? {};
  const prices = (product?.purchaseLinks ?? [])
    .map((l) => l.price)
    .filter((p) => typeof p === 'number' && p > 0);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.thumb ? absUrl(product.thumb) : undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category || undefined,
    description:
      `${product.name} 영양성분: 칼로리 ${n.calories ?? '-'}kcal, ` +
      `단백질 ${n.protein ?? '-'}g, 당류 ${n.sugar ?? '-'}g.`,
    url: absUrl(productPath(product)),
  };

  // 가격 있는 판매처가 있을 때만 offers (가짜 가격 금지)
  if (prices.length) {
    ld.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'KRW',
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: 'https://schema.org/InStock',
    };
  }
  return clean(ld);
}

// 브레드크럼 — items: [{ name, path }] (마지막 현재 항목은 path 생략 가능)
export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: absUrl(it.path) } : {}),
    })),
  };
}

// FAQ — items: [{ q, a }]
export function faqLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}
