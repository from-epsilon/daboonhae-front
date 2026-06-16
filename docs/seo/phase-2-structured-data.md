# Phase 2 — 구조화 데이터 (JSON-LD)

> 선행: Phase 1(`<Seo>`의 `jsonLd` prop 사용)
> 목표: 제품·FAQ·브레드크럼·사이트 정보를 구글이 이해하는 Schema.org JSON-LD로 노출 → 리치 결과 자격 확보
> 주입 방식: 모든 JSON-LD는 Phase 1의 `<Seo jsonLd={...} />`로 전달(별도 `<script>` 직접 삽입 금지).

---

## 1. 작업 항목

| # | 스키마 | 적용 위치 | 데이터 출처 |
|---|---|---|---|
| 2.1 | `Organization` + `WebSite` | 전역(홈 또는 App 루트 1회) | 상수 |
| 2.2 | `Product` (+ `AggregateOffer`) | `/product/:id` | `productApi` product shape |
| 2.3 | `BreadcrumbList` | `/product/:id` (+ 리스트) | 기존 Breadcrumb 데이터 |
| 2.4 | `FAQPage` | `/faq` | `FaqPage.jsx`의 `FAQ_ITEMS` |

> JSON-LD 빌더는 `src/data/jsonLd.js`에 순수 함수로 모아두고 페이지에서 호출.

---

## 2. 상세 명세

### 2.1 Organization + WebSite (전역)
홈(`MainPage`)에서 1회 주입. `SearchAction`은 사이트 내 검색 URL이 안정적일 때만(`/list?q=`).

```js
// src/data/jsonLd.js
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, absUrl } from '../config/site.js';

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absUrl('/og/logo.png'),
    description: DEFAULT_DESCRIPTION,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/list?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}
```
홈: `<Seo jsonLd={[organizationLd(), websiteLd()]} />`

### 2.2 Product (+ AggregateOffer)
제품 shape(productApi 기준): `id, name, brand, thumbnail, category, nutrition{...}, purchaseLinks[{vendorName,url,price,quantity}]`.

- `offers`: 판매처가 여러 개이므로 **AggregateOffer**(최저/최고가). 가격 있는 링크만 사용. 모두 가격 없으면 offers 생략.
- `image`: 절대 URL이어야 함. thumbnail이 상대경로면 `absUrl()`.
- 후기/별점이 실제 데이터로 있으면 `aggregateRating` 추가(없으면 **넣지 않음** — 가짜 평점 금지).

```js
export function productLd(product) {
  const prices = (product.purchaseLinks ?? [])
    .map((l) => l.price).filter((p) => typeof p === 'number' && p > 0);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.thumbnail ? absUrl(product.thumbnail) : undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category || undefined,
    description:
      `${product.name} 영양성분: 칼로리 ${product.nutrition?.calories ?? '-'}kcal, ` +
      `단백질 ${product.nutrition?.protein ?? '-'}g, 당류 ${product.nutrition?.sugar ?? '-'}g.`,
    url: absUrl(`/product/${product.id}`),
  };

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
  // undefined 필드 제거
  return JSON.parse(JSON.stringify(ld));
}
```
상세: `<Seo ... jsonLd={[productLd(product), breadcrumbLd(...)]} />`

> ⚠️ `nutrition` 정보를 스키마로 넣고 싶으면 `Product`가 아니라 음식이면 추가 속성이 제한적이다. 우선 가격/브랜드 중심 `Product`로 시작하고, 영양은 description 텍스트로 노출.

### 2.3 BreadcrumbList
기존 `DetailPage`의 `Breadcrumb` / `getCategoryListHref` 로직 재사용. 표시 UI와 **동일한 경로**를 ItemList로.

```js
export function breadcrumbLd(items) {
  // items: [{ name, path }]  (마지막은 현재 제품, path 생략 가능)
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
```
상세 호출 예:
```js
breadcrumbLd([
  { name: '홈', path: '/' },
  { name: '제품 목록', path: '/list' },
  ...(raw?.category ? [{ name: raw.category, path: getCategoryListHref(raw.categoryCode, raw.category) }] : []),
  { name: product.name },
])
```

### 2.4 FAQPage
`FaqPage.jsx`의 `FAQ_ITEMS` 그대로 매핑. (FAQ 리치 결과는 2026-05 구글에서 종료됐으나 **AI/LLM 인용·구조 이해에 유효** → Info 수준으로 유지, 제거 불필요.)

```js
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
```
`FaqPage`: `<Seo title="자주 묻는 질문" canonicalPath="/faq" jsonLd={faqLd(FAQ_ITEMS)} />`
> `FAQ_ITEMS`를 `FaqPage.jsx` 내부 상수에서 `src/data/faq.js`로 분리하면 페이지·JSON-LD가 같은 출처를 공유(권장).

---

## 3. 완료 기준
- [ ] 홈에 Organization + WebSite JSON-LD 1세트.
- [ ] 제품 상세에 Product(+가격 있으면 AggregateOffer) + BreadcrumbList.
- [ ] FAQ 페이지에 FAQPage.
- [ ] 가짜 `aggregateRating`/`review` 없음(실데이터 있을 때만).
- [ ] 모든 `image`/`url`/`item`이 절대 URL.

## 4. 검증 방법
- [Rich Results Test](https://search.google.com/test/rich-results) 에 배포 URL 입력 → Product/Breadcrumb/FAQ 감지·오류 0.
- [Schema Markup Validator](https://validator.schema.org/) 로 문법 검증.
- DevTools에서 `script[type="application/ld+json"]` 개수·내용 확인.

## 5. 주의
- JSON-LD는 helmet(JS) 주입 → 구글봇 렌더 후 인식(정상). SNS 봇과 무관.
- 가격이 자주 바뀌면 `priceValidUntil`은 생략(부정확 시 경고). availability는 링크 존재=InStock로 단순화.
- 절대 `HowTo` 스키마 쓰지 말 것(2023 지원 종료).
