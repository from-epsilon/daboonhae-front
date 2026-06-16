# Phase 4 — 성능 · 이미지 · 시맨틱

> 목표: Core Web Vitals(LCP·CLS·INP) 개선 + 이미지/헤딩 위생. 구글 랭킹 보조 신호.
> 라이브 실측: 단일 JS 번들 623KB + CSS 174KB, 해시 에셋 캐싱 무력화(Phase 3에서 처리), favicon 부재.

---

## 1. 작업 항목

| # | 작업 | 영향 | 난이도 |
|---|---|---|---|
| 4.1 | 라우트 기반 코드 스플리팅 | LCP·TBT·INP | 중 |
| 4.2 | 데스크탑/모바일 셸 동적 분리 | 초기 JS | 중 |
| 4.3 | 이미지 `alt` 전수 점검 | 접근성·이미지 검색 | 낮음 |
| 4.4 | 이미지 `width/height`/`aspect-ratio` | CLS | 낮음 |
| 4.5 | LCP 이미지 우선순위 / lazy 정리 | LCP | 낮음 |
| 4.6 | 헤딩 위계 점검 | 온페이지 | 낮음 |
| 4.7 | 이미지 포맷 최적화(WebP) | LCP·전송량 | 중 |
| 4.8 | favicon / 기본 OG 에셋 | 브랜딩·공유 | 낮음 |

---

## 2. 상세 명세

### 4.1 라우트 기반 코드 스플리팅
`App.jsx`의 페이지 import를 `React.lazy` + `<Suspense>`로 전환. 현재 모든 페이지(데스크탑+모바일)가 한 청크.

```jsx
import { lazy, Suspense } from 'react';
const MainPage = lazy(() => import('./pages/MainPage.jsx'));
const DetailPage = lazy(() => import('./pages/DetailPage.jsx'));
// ... 각 페이지
// <Routes> 바깥을 <Suspense fallback={<라우트 스켈레톤/>}>로 감싸기
```
- fallback은 기존 스켈레톤 톤과 일치시켜 CLS/깜빡임 최소화.
- 효과: 첫 진입 시 해당 라우트 청크만 로드 → 초기 JS 대폭 감소.

### 4.2 데스크탑/모바일 셸 동적 분리
`App.jsx`가 `useIsMobile()`로 `DesktopShell`/`MobileShell` 분기 → 현재 둘 다 번들에 포함. 각 셸을 `lazy`로 분리해 **사용하는 뷰포트의 코드만** 로드.
> 주의: SSR/하이드레이션 없는 CSR이므로 분기 자체는 안전. 단 `useIsMobile` 초기값이 첫 페인트와 맞도록(레이아웃 점프 방지) 처리.

### 4.3 이미지 alt 전수 점검
현재 alt는 일부 컴포넌트(약 13개)만. 점검 대상: `ProductThumb`, `FoodCard`, 카테고리 아이콘/이미지 그리드(`CategoryIconGrid`, `CategoryTabs`), 배너(`HeroBanner`, `PromoBanner`, `MainBanner`), 벤더 로고(`PurchaseOffers`).
- **정보성 이미지**: 의미 있는 alt (예: 제품 썸네일 → `{브랜드} {제품명}`).
- **장식 이미지**: `alt=""`(빈 문자열) + 필요시 `aria-hidden`.
- 벤더 로고: `alt="{vendorName}"`.

### 4.4 CLS — 이미지 치수 고정
모든 `<img>`에 `width`/`height` 속성 또는 CSS `aspect-ratio` 부여. 특히 제품 썸네일·카테고리 카드·배너.
```jsx
<img src={src} alt={alt} width={320} height={320} loading="lazy" />
```
또는 컨테이너에 `aspect-ratio: 1 / 1`.

### 4.5 LCP 우선순위
- 상단(폴드) 핵심 이미지(홈 히어로/배너, 상세 제품 메인 이미지)는 `loading="eager"` + `fetchpriority="high"`.
- 폴드 아래 이미지는 `loading="lazy"`(이미 일부 적용됨, 누락분 보강).
- 상세 메인 이미지(`ProductHero`)는 현재 `loading="lazy"` → **LCP 후보면 eager로** 변경 검토.

### 4.6 헤딩 위계
- 페이지당 `<h1>` 정확히 1개. 상세는 제품명 `h1` OK. 홈/리스트/about 등 `h1` 존재·유일성 점검.
- 섹션 제목은 `h2`/`h3`로 계층. 시각적 크기 때문에 레벨 건너뛰지 않기(CSS로 크기 조정).

### 4.7 WebP 최적화
`public/images/categories/*.jpg`(다수) → WebP 변환 + 적정 해상도(표시 크기의 2x 이내). `<picture>` 또는 빌드 파이프라인.
> 우선순위 중. 카테고리 이미지가 폴드 근처라 LCP 기여.

### 4.8 favicon / OG 에셋
- `public/favicon.ico`(실제 파일, 현재 부재) + `public/apple-touch-icon.png`(180x180).
- `public/og/default.png`(1200x630, Phase 1에서 참조) + `public/og/logo.png`(Organization logo).
- `index.html`/`<Seo>`가 이 경로를 참조(Phase 1).

---

## 3. 완료 기준
- [ ] 빌드 결과 초기 청크가 라우트별로 분할됨(`dist/assets`에 페이지별 청크).
- [ ] 모든 `<img>`에 alt(정보성=의미, 장식=빈값) + width/height 또는 aspect-ratio.
- [ ] 폴드 위 LCP 이미지 eager/high, 나머지 lazy.
- [ ] 페이지당 h1 1개, 헤딩 레벨 비약 없음.
- [ ] 실제 favicon·OG 기본 이미지 존재(curl로 type 확인, HTML 아님).

## 4. 검증
- `npm run build` 후 청크 분할 확인.
- Lighthouse(모바일) LCP/CLS/TBT 측정 — 스플리팅 전/후 비교.
- [PageSpeed Insights](https://pagespeed.web.dev/) 로 배포 URL 필드/랩 데이터 확인.
- `curl -I .../favicon.ico` → `image/x-icon`(HTML 아님).

## 5. 주의
- 코드 스플리팅 fallback이 빈 화면이면 체감 LCP 악화 → 스켈레톤 필수.
- `useIsMobile` 기반 셸 분기는 첫 렌더 깜빡임(데스크탑↔모바일) 주의 — 초기값을 `window.innerWidth`로 동기 산출.
- 이미지 최적화는 표시 크기 기준으로(과대 해상도 금지).
