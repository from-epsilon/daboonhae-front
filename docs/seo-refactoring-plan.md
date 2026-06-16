# 다분해 SEO 리팩토링 계획서

> 작성일: 2026-06-16
> 대상: `low_sugar_skeleton` (Vite + React 18 + React Router 6 SPA, Supabase 백엔드)
> 목표: **구글 검색** 유입 가능한 구조로 전환 + 제품/FAQ 리치 결과 확보 (네이버는 이번 범위에서 제외)
>
> **확정된 결정사항**
> - 운영 도메인: **`https://www.daboonhae.com`** (canonical·sitemap·OG 절대경로 기준)
> - 렌더링 전략: **CSR + SPA 구조 유지 (불변 제약, 변경 안 함)**. SSR·프리렌더·Next.js 이전(트랙 A)은 **이번 범위에서 제외**.
> - 따라서 작업은 **트랙 B(CSR 위에서 가능한 SEO)에 한정**. 산출물은 향후 SSR 도입 시 재사용 가능하도록 설계하되, 트랙 A는 계획하지 않음.
>
> ⚠️ **이 제약의 의미**: 크롤러가 받는 HTML은 빈 셸이지만, **타깃을 구글로 한정하면 큰 문제가 아니다.** 구글봇은 JS를 렌더링하므로 `react-helmet`로 주입하는 메타·JSON-LD를 정상 인식한다. CSR + helmet은 구글 한정 SEO에서 흔히 쓰는 정당한 방식이다.
> 남는 한계는 **JS를 실행하지 않는 SNS 공유 봇(카카오톡/페이스북 등)** 뿐 — 이들은 정적 `index.html`의 OG만 보므로 **per-page 공유 미리보기(제품별)는 SSR 없이는 일반화 이미지로 처리**된다. (홈 등 대표 페이지는 정적 OG로 커버.)

---

## 0. 한 줄 요약

현재는 **콘텐츠가 0인 빈 HTML 셸을 내려주는 순수 CSR SPA**라서, 크롤러 입장에서 사실상 "내용 없는 페이지"다.
개선은 **(A) 크롤러가 콘텐츠를 보게 만드는 렌더링 전략**과 **(B) CSR 안에서도 가능한 메타/구조화 데이터/위생 작업** 두 갈래로 나뉜다.
B는 즉시 착수 가능하고, A는 의사결정이 필요한 가장 큰 구조 변경이다.

---

## 0.5 라이브 도메인 조사 결과 (2026-06-16, `/seo` 스킬 + 실측)

코드 분석을 라이브 HTTP 응답으로 교차검증함. **크롤러가 받는 실제 응답**(JS 미실행):

| 항목 | 실측 결과 | 판정 |
|---|---|---|
| 홈 원본 HTML | `<div id="root"></div>`만, **본문 0 / 본문길이 443바이트** | 🔴 빈 셸 확정 |
| 호스팅 | **Vercel** (`Server: Vercel`, `X-Vercel-Cache: HIT`) | ℹ️ robots/sitemap·SSR 적용에 유리 |
| 봇 프리렌더 | Googlebot UA로 요청해도 동일한 빈 셸 반환 | 🔴 봇 대응 전무 |
| `/robots.txt` | **HTML 셸을 200으로 반환** (실제 robots 없음) | 🔴 미존재 + SPA catch-all이 삼킴 |
| `/sitemap.xml` | **HTML 셸을 200으로 반환** (실제 사이트맵 없음) | 🔴 미존재 |
| `/llms.txt` | HTML 셸 200 | 🟡 AI 크롤러용 미존재 |
| 존재하지 않는 URL | `/this-page-does-not-exist-12345` → **HTTP 200** | 🔴 **소프트 404 (전 경로)** |
| `/product/1`, `/redirect` 등 | 전부 **HTTP 200 + 빈 셸** | 🔴 정상/오류 구분 불가 |
| 메타 | description·OG·canonical·JSON-LD **전부 없음**, title 1종 고정 | 🔴 |

**크롤러 관점 SEO Health Score: 약 10/100** — 콘텐츠가 없는 빈 셸이라 사실상 색인 가치 0.

### 라이브 조사로 새로 드러난 사실 (코드 분석에 없던 항목)
1. **소프트 404 (전 경로 200)** — Vercel SPA catch-all rewrite가 모든 경로를 `index.html`로 보내 **잘못된 URL도 200을 반환**. 구글이 "soft 404"로 처리해 크롤 예산 낭비·품질 저하. → 진짜 404 전략 필요(존재하지 않는 제품은 404 상태 + noindex).
2. **robots.txt / sitemap.xml이 HTML 200을 반환** — 단순 미존재보다 나쁨. 다만 호스트가 **Vercel**이므로 `public/robots.txt`·`public/sitemap.xml` 정적 파일을 두면 SPA rewrite보다 먼저 서빙되어 해결됨(Phase 3 접근법 유효 확인).
3. **호스트 = Vercel 확정** — 추후 트랙 A로 갈 때 Next.js/프리렌더 적용이 매우 용이. sitemap도 빌드시 생성→`public/`에 출력하면 됨.

> 결론: 라이브 실측이 코드 분석을 **그대로 확증**. 추가로 "소프트 404"와 "robots/sitemap가 HTML 반환" 두 건이 새로 발견됨. 아래 Phase 3에 404·robots·sitemap 항목을 보강함.

---

## 1. 현재 상태 진단

### 1.1 렌더링 / 크롤러빌리티 (최우선 문제)
- `index.html`은 `<div id="root"></div>` + 스크립트 한 줄뿐. **초기 HTML에 본문·제목·메타가 전혀 없음.**
- `src/App.jsx`가 `useIsMobile()`로 클라이언트에서만 데스크탑/모바일 셸을 분기 → 서버 사이드 HTML이 존재할 수 없는 구조.
- 제품 데이터는 `productApi.js` → Supabase에서 **런타임 fetch**. 크롤러가 JS를 실행하지 않으면 제품 정보 0.
- 구글봇은 JS 렌더링을 하므로 렌더 후 메타·콘텐츠를 인식(단 렌더 지연·크롤 예산 제약 존재). **카카오·각종 SNS 공유 봇은 JS 미실행** → 정적 OG만 인식. (네이버는 이번 타깃에서 제외.)

### 1.2 메타데이터
- `index.html` `<title>` 단 하나로 **모든 라우트가 동일한 타이틀**.
- `<meta name="description">` 없음. Open Graph / Twitter Card 없음 → 카톡·SNS 공유 시 미리보기 깨짐.
- `<link rel="canonical">` 없음 → 중복 URL(쿼리스트링 필터/정렬) 정규화 불가.
- favicon, theme-color, apple-touch-icon 없음.

### 1.3 구조화 데이터(JSON-LD) — 전무
- 제품 상세: `Product` + `Offer`(가격/판매처) + `AggregateRating` 미적용. 이 사이트의 핵심 자산인데 리치 결과 기회를 통째로 버리는 중.
- `/faq`: `FAQItems` 데이터가 이미 코드에 구조화돼 있는데 `FAQPage` 스키마 미적용.
- 상세/리스트의 breadcrumb UI는 있으나 `BreadcrumbList` 스키마 없음.
- 사이트 전역 `Organization` / `WebSite`(+ Sitelinks SearchBox) 없음.

### 1.4 사이트 위생
- `public/robots.txt` 없음, `sitemap.xml` 없음.
- `/redirect`(제휴 이동 페이지)와 `/compare`(개인화·쿼리 상태) 가 **인덱싱 차단 없이 노출** → 어필리에이트 리다이렉트가 색인되면 품질 페널티 위험.
- 리스트 페이지의 `?tab=&sub=&q=&sort=` 등 파라미터 조합이 무한 중복 URL 생성 가능 → canonical/robots 정책 필요.

### 1.5 시맨틱 / 접근성 / CWV(코어 웹 바이탈)
- 이미지 `alt`는 약 13개 컴포넌트에만 존재(전체 대비 부분 적용). 카테고리/배너 이미지 다수 누락 추정.
- `<img>`에 `width`/`height` 미지정 → **CLS(레이아웃 시프트)** 유발. `loading="lazy"`도 일부만.
- 페이지별 `<h1>` 유일성·헤딩 위계 점검 필요(상세는 `h1` 제품명 OK, 일부 페이지 미확인).
- 모바일 셸에는 `<Header>`(사이트 네비)가 빠져 있어 내부 링크 구조가 뷰포트별로 달라짐 → 크롤 경로 일관성 확인 필요.

---

## 2. 개선 전략 — 2개 트랙

### 트랙 A. 렌더링 전략 (가장 큰 의사결정)

크롤러에게 **완성된 HTML**을 주는 방법. 아래 중 택1. (현 코드 영향도·SEO 효과 순)

| 옵션 | 방식 | SEO 효과 | 작업량 | 비고 |
|---|---|---|---|---|
| **A1. Next.js 마이그레이션** | App Router + SSR/ISR, 제품은 `generateStaticParams`+ISR | ★★★ (모든 봇 완전 대응) | 大 | 가장 견고. 라우팅/데이터/이미지 전면 이식 |
| **A2. Vike(vite-plugin-ssr) 또는 vite-react-ssg 도입** | 기존 Vite 유지하며 SSR/SSG 레이어 추가 | ★★★ | 中~大 | Vite 생태계 유지하며 점진 이식 가능 |
| **A3. 프리렌더링(react-snap / vite-plugin-prerender / Puppeteer)** | 빌드시 라우트별 정적 HTML 스냅샷 | ★★ (정적 페이지엔 충분, 동적 제품은 빌드시 DB 열거 필요) | 中 | 제품 수가 많고 자주 바뀌면 빌드시간·신선도 한계 |
| **A4. 엣지 미들웨어 메타 주입 + 동적 렌더(prerender.io류)** | 봇 UA 감지 시 렌더링된 HTML 제공 | ★★ | 中 | 호스팅 의존, 운영비. 구글 클로킹 가이드 주의 |

**권고:** 제품 페이지가 검색 유입의 핵심이고 데이터가 Supabase에서 계속 늘어나므로 → **A2(Vike/SSG, 점진 도입) 또는 A1(Next.js, 신규 여력 있으면)**.
당장 인프라 변경이 어렵다면 트랙 B를 먼저 끝내고 → **A3 프리렌더로 정적 페이지(홈/소개/FAQ/카테고리)만 우선 커버** → 이후 제품 페이지를 A1/A2로 승격하는 단계적 경로.

> ⚠️ 이 결정은 도메인/호스팅 환경에 따라 달라지므로 **2-1 절의 입력값**이 필요. 트랙 B는 어떤 선택을 하든 그대로 재사용된다.

### 트랙 B. CSR 위에서도 즉시 가능한 작업 (렌더링 전략과 독립)

`react-helmet-async`(또는 React 19+ 네이티브 `<title>`/`<meta>`)로 라우트별 head를 주입.
**구글봇은 JS 렌더 후 이 메타를 인식**하므로 트랙 A 이전에도 구글 한정 효과 있음. 트랙 A 도입 시 SSR로 그대로 승격됨.

---

## 3. 실행 계획 (Phase별)

> 각 Phase의 **상세 구현 명세**는 별도 문서로 분리: [`docs/seo/`](./seo/README.md)
> — [Phase 1](./seo/phase-1-meta-infra.md) · [Phase 2](./seo/phase-2-structured-data.md) · [Phase 3](./seo/phase-3-hygiene.md) · [Phase 4](./seo/phase-4-performance-images.md)

### Phase 1 — 기반 메타 인프라 (트랙 B, 즉시 착수) ✅ 우선순위 최상
1. **`react-helmet-async` 도입** + `main.jsx`에 `HelmetProvider` 래핑.
2. **`<Seo>` 공통 컴포넌트 신설** (`src/components/global/Seo.jsx`)
   - props: `title`, `description`, `canonical`, `ogImage`, `noindex`, `jsonLd`.
   - 기본 OG(사이트명/기본 이미지/`og:locale=ko_KR`) 포함, 페이지가 override.
3. **페이지별 메타 적용**
   - 홈: 브랜드 + 핵심 키워드("다이어트 식품 영양성분 비교").
   - 리스트: 카테고리/탭별 동적 타이틀(`{카테고리} 비교 | 다분해`) + canonical은 **파라미터 제거된 정규 URL**로.
   - 상세: `{브랜드} {제품명} 영양성분·가격 비교 | 다분해` + 제품 이미지 OG + description은 핵심 지표 요약.
   - about/faq/contact: 정적 메타.
   - **`/redirect`, `/compare`: `noindex, nofollow`**.
4. **`index.html` 기본 head 보강**: 기본 description, OG 기본값, theme-color, favicon, `apple-touch-icon`, `<meta name="robots">` 기본값.

### Phase 2 — 구조화 데이터 (JSON-LD)
5. **제품 상세 `Product` 스키마** — name, brand, image, description, `Offer`(price/priceCurrency=KRW/availability/seller=판매처), 가능 시 `nutrition` 관련 속성. `purchaseLinks` 최저가를 대표 offer로.
6. **`BreadcrumbList`** — 기존 Breadcrumb 컴포넌트 데이터 재사용(홈 > 목록 > 카테고리 > 제품).
7. **`FAQPage`** — `FaqPage.jsx`의 `FAQ_ITEMS` 그대로 매핑.
8. **전역 `Organization` + `WebSite`** — `index.html` 또는 루트 레이아웃에 1회. (검색창 sitelinks 노리면 `SearchAction`).

### Phase 3 — 사이트 위생 (robots / sitemap / canonical 정책)
9. **`public/robots.txt`** — 전체 허용 + `Disallow: /redirect` + (`/compare` 등 비색인 경로 차단). `Googlebot` 명시 허용. **Vercel `public/` 정적 파일이라 SPA rewrite보다 먼저 서빙됨(현재 HTML 200 반환 문제 해소).**
10. ~~`sitemap.xml` 생성~~ — **범위 제외(2026-06-16 결정).** CSR 빈 셸 + 제품 수 적어 우선순위 대비 가치 낮음. 발견 경로는 목록→상세 내부 링크로 확보. 향후 제품 수가 크게 늘면 재검토.
11. **canonical 정책 확정** — 리스트 필터/정렬 파라미터 URL은 정규 URL로 canonical 통일, 또는 색인 가치 있는 카테고리 조합만 선별 노출.
12. **소프트 404 해소 (라이브 신규 발견)** — 현재 모든 잘못된 경로가 200 반환. 존재하지 않는 제품/경로는 (a) 최소한 `noindex` 메타 주입, (b) 가능하면 Vercel rewrite 예외 + 실제 404 상태코드. CSR 한계상 우선 `noindex`부터, 트랙 A 승격 시 정식 404로.

### Phase 4 — 시맨틱 / 접근성 / CWV
12. **모든 `<img>`에 의미 있는 `alt`** (장식 이미지는 `alt=""`), **`width`/`height` 또는 `aspect-ratio`** 부여로 CLS 제거, 폴드 아래 이미지 `loading="lazy"`/상단 LCP 이미지는 `fetchpriority="high"`.
13. **헤딩 위계 점검** — 페이지당 `<h1>` 1개, 섹션은 `<h2>/<h3>`. `<nav>/<main>/<article>/<section>` 시맨틱 태그 확인(상당수 이미 적용됨).
14. **카테고리 이미지 WebP 최적화 / 적정 사이즈** (`public/images/categories/*.jpg` 다수).

### Phase 5 — 렌더링 전략 적용 (트랙 A) — ❌ 범위 제외
CSR/SPA 유지 결정에 따라 **이번 작업 범위에서 제외**. 2절(트랙 A 옵션)은 향후 재검토용 참고 자료로만 남겨둠. Phase 1~2 산출물(`<Seo>`, JSON-LD)은 그때 SSR 출력으로 승격 가능.

---

## 4. 우선순위 / 임팩트 매트릭스

| 작업 | 임팩트 | 난이도 | 순서 |
|---|---|---|---|
| **구글 서치콘솔 등록 + URL 검사/색인 요청** (운영) | ★★★ | 낮음 | 1 |
| **index.html 정적 메타 baking** (SNS 공유 OG 기준선) | ★★ | 낮음 | 1 |
| 라우트별 메타(title/desc/canonical/OG) | ★★★ | 낮음 | 1 |
| `/redirect`·`/compare` noindex | ★★ | 낮음 | 1 |
| non-www 307→301 정규화 (Vercel 설정) | ★★ | 낮음 | 2 |
| 에셋 캐싱 immutable (vercel.json) | ★★ | 낮음 | 3 |
| 번들 코드 스플리팅 (React.lazy) | ★★ | 중 | 3 |
| robots.txt (sitemap 제외) | ★★ | 낮음 | 2 |
| Product / FAQ / Breadcrumb JSON-LD | ★★★ | 중 | 2 |
| img alt/dimensions, CWV/CLS | ★★ | 낮음~중 | 3 |
| **렌더링 전략(SSR/프리렌더)** | — | 높음 | 범위 제외 |

> 구글 한정 타깃에서는 CSR + helmet으로 1~4만으로 충분히 유효하다. SSR(트랙 A)은 범위 제외.

---

## 5. 입력값 상태

| 항목 | 상태 |
|---|---|
| 운영 도메인 | ✅ 확정 — `https://www.daboonhae.com` |
| 렌더링 전략 | ✅ 확정 — 트랙 B만 (CSR 유지), 트랙 A 보류 |
| 호스팅 환경 | ⬜ sitemap 생성 방식(빌드 스크립트 vs 엣지)에 영향 — 빌드 스크립트 방식으로 진행 가능 |
| 제품 OG/대표 공유 이미지·favicon 에셋 | ⬜ 없으면 기본 브랜드 OG 1종 + favicon 임시 생성 |

### CSR 유지 + 구글 한정 타깃에 따른 한계 (명시적 합의)
- **구글봇은 JS를 렌더링**하므로 helmet 메타·JSON-LD·구조화 데이터가 정상 인식됨 → 구글 SEO는 CSR로도 유효.
- 남는 한계는 **JS 미실행 SNS 공유 봇(카카오톡/페이스북)** 한정: 정적 `index.html`의 OG만 인식 → 제품별 공유 미리보기는 SSR 없이는 일반 이미지로 처리(홈 등 대표 페이지는 정적 OG로 커버).
- 네이버는 이번 타깃에서 제외. (추후 필요 시 트랙 A 승격, Phase 1~2 산출물 재사용 가능.)

---

## 5.5 라이브 추가 점검으로 발견된 누락 항목 (2026-06-16)

기존 Phase 1~4에 없던 항목. 실측으로 확인됨.

### A. 구글 서치콘솔 등록 — ❗계획에 통째로 빠져 있던 핵심 (코드 외 운영 작업)
- **구글 서치콘솔 등록 + 사이트 소유확인** — 색인 상태·검색 성능 모니터링, **URL 검사로 "Google이 렌더링한 페이지"가 콘텐츠를 보는지 직접 확인**(CSR라 이 확인이 중요), 색인 요청.
- 소유확인용 `google-site-verification` 메타를 **`index.html` 정적 head에 추가**(또는 DNS/파일 인증).
- → Phase 1과 함께 진행. (네이버 서치어드바이저는 범위 제외.)

### B. `index.html` 정적 메타 baking — SNS 공유 OG 기준선
- JS 미실행 SNS 공유 봇(카카오톡/페이스북)은 **정적 `index.html`의 head만 인식**. helmet(JS 주입)과 **별개로** description·OG·canonical(홈 기준)을 정적 index.html에 박아 **홈/대표 페이지 공유 미리보기**를 확보.
- 동적 라우트(상세/리스트) 메타는 helmet으로 처리(구글봇 렌더 후 인식). 제품별 SNS 공유 미리보기는 SSR 부재로 일반 이미지 처리됨(수용).

### C. 정규화 리다이렉트 — non-www 307 → 301/308
- 실측: `daboonhae.com` → `www`가 **307 Temporary**. 영구 정규화 신호가 아니라 링크 에쿼티 분산. Vercel 도메인 설정에서 **영구 리다이렉트(308)**로 교정.

### D. 정적 에셋 캐싱 정책 (CWV)
- 실측: 해시 파일명 `index-xxx.js`(623KB)·CSS(174KB)가 `Cache-Control: public, max-age=0, must-revalidate`. 해시 에셋은 내용 변경 시 파일명이 바뀌므로 **`immutable, max-age=31536000`**이어야 함. 현재는 재방문마다 ~800KB 재검증 → LCP·반복방문 성능 손해. `vercel.json` 헤더 규칙으로 `/assets/*` 장기 캐시 지정.

### E. 번들 코드 스플리팅 (성능)
- 단일 청크 623KB(데스크탑+모바일 전부 포함). 라우트 기반 `React.lazy`/`Suspense`로 분할, 뷰포트별 셸(데스크탑/모바일)도 동적 임포트로 분리 → 초기 JS·TBT 감소.

### F. 실제 favicon / PWA manifest / llms.txt
- `/favicon.ico` 실파일 없음(catch-all HTML 반환) → 실제 favicon + `apple-touch-icon` 추가.
- (선택) `public/manifest.json`(PWA), `public/llms.txt`(AI 검색/GEO용 사이트 요약) — 우선순위 낮음.

> A는 우선순위 **상**(색인 모니터링의 전제), B는 **중상**(SNS 공유 미리보기), C·D·E는 **중**(성능/정규화), F는 **하**.

---

## 6. 다음 단계 제안 (트랙 B 착수)

도메인이 확정됐으므로 **Phase 1(메타 인프라)부터 바로 구현 착수 가능**.

권장 진행 순서:
1. `SITE_URL = 'https://www.daboonhae.com'` 상수 1곳 정의(`src/config/site.js`) → canonical/OG/sitemap 전부 참조.
2. Phase 1 → Phase 2 → Phase 3 → Phase 4 순서로 진행(임팩트·의존성 기준).
3. 각 Phase 종료 시 빌드 + 구글 리치 결과 테스트(Rich Results Test)·OG 디버거로 검증.
