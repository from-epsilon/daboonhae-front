# Phase 1 — 메타 인프라 + 구글 서치콘솔 등록 + 정적 OG

> 선행 문서: `../seo-refactoring-plan.md`
> 목표: 라우트별 `<title>/description/canonical/OG`를 주입하는 공통 인프라 구축 + 구글 색인 모니터링 시작
> 전제: CSR 유지, 타깃 = 구글. 구글봇은 JS 렌더 후 helmet 메타를 인식함.

---

## 1. 작업 항목

| # | 작업 | 산출물 |
|---|---|---|
| 1.1 | 사이트 상수 정의 | `src/config/site.js` |
| 1.2 | `react-helmet-async` 도입 + Provider | `package.json`, `src/main.jsx` |
| 1.3 | `<Seo>` 공통 컴포넌트 | `src/components/global/Seo.jsx` |
| 1.4 | 페이지별 메타 적용 | 각 `pages/*.jsx` (+ mobile) |
| 1.5 | `index.html` 정적 head baseline | `index.html` |
| 1.6 | 구글 서치콘솔 등록 (운영) | 인증 메타 or DNS |

---

## 2. 상세 명세

### 1.1 `src/config/site.js`
canonical·OG 절대경로의 단일 출처. 도메인 변경 시 여기만 수정.

```js
// 사이트 전역 SEO 상수 — canonical/OG 절대경로의 단일 출처
export const SITE_URL = 'https://www.daboonhae.com';
export const SITE_NAME = '다분해';
export const SITE_TAGLINE = '다이어트 식품 비교·해석 플랫폼';
export const DEFAULT_DESCRIPTION =
  '다이어트 식품의 영양성분을 분해하고 제품 간 가격·성분을 비교합니다. 식약처 공시 영양정보 기반.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`; // 1200x630, Phase 4에서 에셋 준비
export const OG_LOCALE = 'ko_KR';

// 절대 URL 헬퍼 — 항상 SITE_URL 기준 (쿼리 제거된 정규 경로 권장)
export const absUrl = (path = '/') => new URL(path, SITE_URL).toString();
```

### 1.2 `react-helmet-async` 도입
```bash
npm i react-helmet-async
```
`src/main.jsx` — 최상위에 `HelmetProvider` 추가 (BrowserRouter 바깥/안쪽 무관, Provider들 감싸기):

```jsx
import { HelmetProvider } from 'react-helmet-async';
// ...
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {/* 기존 Provider 트리 그대로 */}
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
```

### 1.3 `<Seo>` 공통 컴포넌트 (`src/components/global/Seo.jsx`)
모든 페이지가 이 한 컴포넌트로 메타를 선언. JSON-LD(Phase 2)도 이 컴포넌트로 주입.

```jsx
import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_TAGLINE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, OG_LOCALE, absUrl } from '../../config/site.js';

// props:
//  title       페이지 제목(브랜드 suffix 자동) | 미지정 시 기본 타이틀
//  description  메타 설명 | 미지정 시 DEFAULT_DESCRIPTION
//  canonicalPath  정규 경로(쿼리 제거) 예: '/product/123'
//  ogImage      절대 URL | 미지정 시 기본 이미지
//  ogType       'website' | 'article' 등
//  noindex      true면 robots noindex,nofollow
//  jsonLd       객체 또는 객체 배열 (Phase 2)
export default function Seo({
  title, description, canonicalPath, ogImage, ogType = 'website', noindex = false, jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const canonical = canonicalPath ? absUrl(canonicalPath) : undefined;
  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={OG_LOCALE} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD (Phase 2) */}
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
}
```

### 1.4 페이지별 메타 적용
각 페이지 최상단에서 `<Seo .../>` 렌더. **데스크탑/모바일 페이지 모두** 적용(둘 다 같은 URL이므로 동일 메타). 동적 페이지는 데이터 로드 후 값 주입, 로딩/없음 상태 분기 주의.

| 라우트 | title | canonicalPath | 비고 |
|---|---|---|---|
| `/` (홈) | 미지정(기본 타이틀) | `/` | ogType website |
| `/list` | `{카테고리/탭} 비교` 또는 `다이어트 식품 목록` | `/list` (쿼리 **제외**) | 필터/정렬 파라미터는 canonical에서 제거 |
| `/product/:id` | `{브랜드} {제품명} 영양성분·가격 비교` | `/product/{id}` | ogImage=제품 썸네일, ogType=article. Phase 2 Product JSON-LD |
| `/about` | `서비스 소개` | `/about` | |
| `/faq` | `자주 묻는 질문` | `/faq` | Phase 2 FAQ JSON-LD |
| `/contact` | `문의하기` | `/contact` | |
| `/compare` | `제품 비교` | — | **noindex**(개인화·휘발 상태) |
| `/redirect` | — | — | **noindex**(제휴 이동) |

제품 상세 예시 (`pages/DetailPage.jsx`, `product` 확정 후):
```jsx
<Seo
  title={`${product.brand} ${product.name} 영양성분·가격 비교`}
  description={`${product.name} 칼로리 ${n.calories}kcal · 단백질 ${n.protein}g · 당류 ${n.sugar}g. 판매처별 최저가 비교.`}
  canonicalPath={`/product/${product.id}`}
  ogImage={product.thumbnail || undefined}
  ogType="article"
/>
```
리스트(`pages/ListPage.jsx`) — canonical은 쿼리 제거:
```jsx
<Seo title={categoryLabel ? `${categoryLabel} 비교` : '다이어트 식품 목록'}
     canonicalPath="/list" />
```
> 모바일 페이지(`pages/mobile/*`)는 동일 `<Seo>` 호출을 공유하도록, 가능하면 메타 계산을 작은 헬퍼/훅으로 빼서 데스크탑·모바일이 함께 import.

### 1.5 `index.html` 정적 head baseline
helmet은 JS 렌더 후 동작 → **JS 미실행 SNS 공유 봇은 정적 head만 봄.** 홈/대표 페이지 공유 미리보기 보장을 위해 정적 기본값을 박아둠. (helmet이 런타임에 동일 태그를 덮어씀.)

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="https://www.daboonhae.com/" />
  <title>다분해 — 다이어트 식품 비교·해석 플랫폼</title>
  <meta name="description" content="다이어트 식품의 영양성분을 분해하고 제품 간 가격·성분을 비교합니다. 식약처 공시 영양정보 기반." />
  <meta property="og:site_name" content="다분해" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:title" content="다분해 — 다이어트 식품 비교·해석 플랫폼" />
  <meta property="og:description" content="다이어트 식품의 영양성분을 분해하고 제품 간 가격·성분을 비교합니다." />
  <meta property="og:image" content="https://www.daboonhae.com/og/default.png" />
  <meta property="og:url" content="https://www.daboonhae.com/" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#ffffff" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <!-- 구글 서치콘솔 메타 인증 시 여기 추가 -->
</head>
```

### 1.6 구글 서치콘솔 등록 (운영 작업, 코드 외)
1. https://search.google.com/search-console 에서 도메인(또는 URL 접두어 `https://www.daboonhae.com/`) 속성 추가.
2. 소유확인: **DNS TXT**(권장, Vercel 도메인) 또는 HTML 메타(`google-site-verification`을 `index.html` head에 추가).
3. 등록 후 **URL 검사 도구**로 홈·대표 제품 URL을 "라이브 테스트" → **렌더링된 HTML에 콘텐츠가 보이는지 확인**(CSR 색인 검증의 핵심).
4. 주요 URL "색인 생성 요청".

---

## 3. 완료 기준 (Acceptance)
- [ ] 각 라우트에서 브라우저 탭 제목·`<meta name=description>`·`<link rel=canonical>`이 라우트별로 다르게 렌더됨(DevTools Elements 확인).
- [ ] `/compare`, `/redirect`에 `noindex,nofollow` 메타가 들어감.
- [ ] 리스트 페이지의 canonical이 필터/정렬 쿼리를 포함하지 않음.
- [ ] 정적 `index.html`에 description·OG·canonical 존재(curl로 raw 확인).
- [ ] 구글 서치콘솔 속성 확인 완료 + 홈 URL 라이브 테스트에서 본문 렌더 확인.

## 4. 검증 방법
- `curl -sL https://www.daboonhae.com/ | grep -i 'og:\|description'` → 정적 OG 노출 확인(배포 후).
- 구글 서치콘솔 **URL 검사 → 라이브 테스트 → 렌더링된 HTML** 에서 제품명·영양 텍스트 확인.
- [OG 디버거](https://developers.facebook.com/tools/debug/), 카카오톡 공유 시 미리보기 확인.

## 5. 주의/한계
- 제품별 OG는 helmet(JS) 주입이라 **SNS 공유 봇에는 안 잡힘** → 제품 공유 미리보기는 기본 이미지로 표시됨(수용된 한계). 검색(구글봇 렌더)에는 정상 반영.
- helmet 태그가 정적 index.html 태그와 **중복 출력되지 않도록** 동일 속성만 사용(title/description/og는 helmet이 dedupe).
