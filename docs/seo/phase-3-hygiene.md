# Phase 3 — 사이트 위생 (robots / 404 / 리다이렉트 / 캐싱)

> 목표: 크롤러가 사이트를 깨끗하게 이해하도록 정리. 라이브 실측에서 드러난 문제(robots 부재·소프트 404·307 정규화·캐싱 무력화)를 교정.
> 호스팅: Vercel. `public/` 정적 파일은 SPA rewrite보다 먼저 서빙됨 → robots/favicon 등은 파일만 두면 해결.

---

## 1. 작업 항목

| # | 작업 | 산출물 | 라이브 실측 근거 |
|---|---|---|---|
| 3.1 | robots.txt | `public/robots.txt` | 현재 `/robots.txt`가 HTML 200 반환 |
| 3.2 | 소프트 404 → noindex | 라우팅/NotFound 처리 | 잘못된 URL 전부 HTTP 200 |
| 3.3 | non-www → www 영구 정규화 | Vercel 도메인 설정 / `vercel.json` | 현재 307 Temporary |
| 3.4 | 정적 에셋 immutable 캐싱 | `vercel.json` headers | 해시 에셋이 `max-age=0` |

---

## 2. 상세 명세

### 3.1 `public/robots.txt`
```
User-agent: *
Allow: /
Disallow: /redirect
Disallow: /compare

# (sitemap은 범위 제외 — 추후 도입 시 아래 한 줄 추가)
# Sitemap: https://www.daboonhae.com/sitemap.xml
```
- 배포 후 `curl https://www.daboonhae.com/robots.txt` 가 **이 텍스트**(HTML 아님)를 반환하는지 확인.
- `/redirect`(제휴 이동), `/compare`(휘발성 상태)는 색인 가치 없음 → 차단.

### 3.2 소프트 404 해소
현재 Vercel SPA rewrite가 모든 경로를 `index.html`로 보내 **잘못된 URL도 200**. CSR 유지 제약상 서버 404 상태코드는 어려우므로 **메타 레벨 noindex**로 우선 처리.

- **잘못된 라우트**: `App.jsx`의 `<Route path="*">`가 현재 홈으로 `Navigate` 함. 대신 **NotFound 페이지**를 렌더하고 `<Seo noindex title="페이지를 찾을 수 없습니다" />` 주입.
  - 무한정 홈 리다이렉트는 사용자/크롤러 모두에 모호 → 명시적 404 화면 권장.
- **존재하지 않는 제품**(`/product/:id`가 DB에 없음): `DetailPage`의 `EmptyState`에 `<Seo noindex />` 추가(이미 "존재하지 않는 제품" 분기 있음).
- (선택·여력 시) Vercel `routes`/미들웨어로 알려진 무효 패턴에 실제 404 상태코드 반환 — CSR 범위 밖이라 후순위.

```jsx
// DetailPage.jsx EmptyState
function EmptyState() {
  return (
    <div className="page d-detail-empty">
      <Seo noindex title="존재하지 않는 제품" />
      {/* 기존 내용 */}
    </div>
  );
}
```

### 3.3 non-www → www 영구 정규화
- 우선 **Vercel 대시보드 → 프로젝트 → Domains**: `daboonhae.com`(apex)을 `www.daboonhae.com`으로 **Redirect** 설정. Vercel 도메인 리다이렉트는 308(영구)로 동작해야 함. (현재 307 관찰 → 설정 점검/재지정.)
- 대시보드로 308 강제가 안 되면 `vercel.json`에서 host 조건 리다이렉트:
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "daboonhae.com" }],
      "destination": "https://www.daboonhae.com/$1",
      "permanent": true
    }
  ]
}
```

### 3.4 정적 에셋 immutable 캐싱
해시 파일명(`index-Dnr9H63S.js`)은 내용이 바뀌면 이름이 바뀌므로 영구 캐시 가능. 현재 `max-age=0`이라 재방문마다 ~800KB 재검증.

`vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```
- `index.html`은 `must-revalidate`(현행 유지) — 새 배포 즉시 반영돼야 하므로 캐시 길게 두지 말 것.
- `robots.txt`, `og/*`, `favicon` 등은 중간 캐시(예: `max-age=3600`) 선택 적용.

> 3.3 + 3.4를 하나의 `vercel.json`으로 통합. 프로젝트 루트에 생성.

---

## 3. 완료 기준
- [ ] `curl .../robots.txt` → 텍스트 robots 반환(HTML 아님), `/redirect` Disallow 포함.
- [ ] 잘못된 URL 접근 시 NotFound 화면 + `noindex` 메타.
- [ ] 존재하지 않는 제품 상세에 `noindex`.
- [ ] `curl -I https://daboonhae.com/` → **308**(영구) + Location www.
- [ ] `curl -I .../assets/<hash>.js` → `Cache-Control: ...immutable`.

## 4. 검증
- 배포 후 위 curl들 재실행으로 헤더 확인.
- 구글 서치콘솔 → robots.txt 테스터(있으면) / URL 검사로 차단 경로 확인.

## 5. 주의
- robots `Disallow`는 색인 차단이 아니라 **크롤 차단**. 이미 색인된 `/compare` 등을 빼려면 noindex 메타가 더 확실(단, Disallow하면 noindex를 못 읽으므로 둘 중 하나만 — 신규라면 Disallow로 충분).
- `vercel.json` 생성 시 기존 자동 rewrite(SPA fallback)와 충돌하지 않게 `headers`/`redirects`만 추가(rewrites 미정의 시 Vercel 기본 동작 유지).
