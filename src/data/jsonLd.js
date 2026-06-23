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

// 영양성분 → schema.org NutritionInformation
// - 핵심 매크로(칼로리·단백질·탄수·당류·지방)는 항상, 나머지는 값이 있을 때만(허위 0 방지)
// - 화면 영양표와 일치시키는 게 원칙(구조화 데이터는 가시 콘텐츠를 반영해야 함)
function nutritionLd(n, serving) {
  if (!n) return undefined;
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const info = { '@type': 'NutritionInformation' };
  if (typeof serving === 'string' && serving.trim()) info.servingSize = serving.trim();
  if (isNum(n.calories)) info.calories = `${n.calories} kcal`;
  if (isNum(n.protein)) info.proteinContent = `${n.protein} g`;
  if (isNum(n.carbs)) info.carbohydrateContent = `${n.carbs} g`;
  if (isNum(n.sugar)) info.sugarContent = `${n.sugar} g`;
  if (isNum(n.fat)) info.fatContent = `${n.fat} g`;
  if (n.sodium > 0) info.sodiumContent = `${n.sodium} mg`;
  if (n.saturatedFat > 0) info.saturatedFatContent = `${n.saturatedFat} g`;
  if (n.transFat > 0) info.transFatContent = `${n.transFat} g`;
  if (n.cholesterol > 0) info.cholesterolContent = `${n.cholesterol} mg`;
  if (n.fiber > 0) info.fiberContent = `${n.fiber} g`;
  // @type/servingSize 외에 실제 영양값이 하나도 없으면 생략
  const hasValue = Object.keys(info).some((k) => k !== '@type' && k !== 'servingSize');
  return hasValue ? info : undefined;
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
    // base64 데이터URI는 구글이 크롤 못 함 → 유효 이미지 URL일 때만 포함
    image:
      product.thumb && !String(product.thumb).startsWith('data:')
        ? absUrl(product.thumb)
        : undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category || undefined,
    description:
      `${product.name} 영양성분: 칼로리 ${n.calories ?? '-'}kcal, ` +
      `단백질 ${n.protein ?? '-'}g, 당류 ${n.sugar ?? '-'}g.`,
    nutrition: nutritionLd(n, product.serving),
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
