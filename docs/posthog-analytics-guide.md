# PostHog 분석 운영 가이드

> 최종 갱신: 2026-07-11
> 대상 프로젝트: 다분해 프런트엔드
> PostHog 리전: US Cloud

## 1. 문서 목적

이 문서는 다분해의 PostHog 연동 구조와 운영 규칙을 한곳에 정리한다.

- 어떤 사용자 행동을 어떤 이벤트로 수집하는지
- 마케팅 링크에 UTM을 어떻게 붙이는지
- 내부 임직원 테스트 트래픽을 어떻게 구분하는지
- PostHog에서 어떤 퍼널과 KPI를 만들어야 하는지
- 배포·검증·변경 시 무엇을 확인해야 하는지

실제 구현의 기준 파일은 다음과 같다.

- `src/lib/analytics.js`: SDK 초기화, 이벤트 전송, 내부 사용자 표시
- `src/components/global/AnalyticsTracker.jsx`: 페이지·라우트 기반 이벤트
- `src/components/global/InternalAnalyticsNotice.jsx`: 내부 기기 등록 결과 안내
- `src/store/WishlistContext.jsx`: 찜 변경 이벤트
- `src/store/CompareContext.jsx`: 비교함 변경 이벤트
- `src/pages/RedirectPage.jsx`: 구매처 이동 이벤트
- `src/pages/PrivacyPage.jsx`: 개인정보 처리방침

## 2. 현재 완료 상태

### 코드에 구현된 항목

- PostHog JavaScript SDK 설치
- US Cloud 연결 설정
- React Router 페이지뷰 수동 수집
- 핵심 행동 이벤트 수집
- UTM 유입 정보 수집
- 구매처 이동 시 제품 ID·판매처 기록
- 내부 테스트 기기 등록·해제
- 모든 전송 이벤트에 내부 사용자 여부 부여
- Vite 개발 모드 이벤트 전송 차단
- 자동 클릭 수집 비활성화
- 세션 리플레이 비활성화
- 개인정보 처리방침에 PostHog 및 미국 이전 내용 반영
- SDK 비동기 로딩

### 배포·운영 단계에서 남은 항목

- Vercel 운영 환경변수 등록
- 현재 변경사항 커밋·푸시·배포
- 배포 후 내부 인원 기기 재등록
- PostHog 운영 대시보드와 퍼널 생성
- 모든 운영 리포트에 내부 트래픽 제외 필터 적용
- 운영 데이터 보존기간 설정 확인

이 문서 작성 시점의 변경사항은 아직 배포되지 않았다. 배포 전에 접속한 `dh_staff` 링크는 내부 기기 등록에 영향을 주지 않았으므로, 배포 후 반드시 다시 등록해야 한다.

## 3. 환경변수

로컬 `.env.local`과 Vercel 운영 환경에 다음 변수를 설정한다.

```env
VITE_POSTHOG_PROJECT_TOKEN=프로젝트_토큰
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

주의사항:

- 실제 토큰은 문서나 Git에 커밋하지 않는다.
- `.env.local`은 Git에서 제외된다.
- `Project token`은 브라우저 SDK용 공개 토큰이다.
- PostHog의 Personal API key나 Secret key를 프런트엔드에 넣지 않는다.
- 저장소에는 값이 비어 있는 `.env.example`만 커밋한다.

## 4. SDK 수집 정책

현재 초기화 정책은 다음과 같다.

| 설정 | 값 | 의미 |
|---|---:|---|
| `api_host` | `https://us.i.posthog.com` | PostHog US 리전 사용 |
| `autocapture` | `false` | 임의의 클릭·입력·폼 이벤트를 자동 수집하지 않음 |
| `capture_pageview` | `false` | React Router에 맞춰 페이지뷰를 직접 수집 |
| `capture_pageleave` | `true` | 페이지 이탈 이벤트 수집 |
| `disable_session_recording` | `true` | 세션 리플레이 비활성화 |
| `person_profiles` | `identified_only` | 로그인 식별 전에는 영구 Person Profile 생성을 최소화 |
| `defaults` | `2026-05-30` | 해당 날짜 기준 PostHog 권장 동작 사용 |

SDK는 동적 import로 불러온다. 앱이 먼저 렌더되고 SDK가 아직 로딩 중이면 이벤트를 임시 큐에 넣었다가 초기화 완료 후 전송한다.

### 개발 환경 차단 범위

`import.meta.env.PROD`가 `false`인 Vite 개발 모드에서는 PostHog를 초기화하지 않는다. 따라서 일반적인 `npm run dev` 접속은 전송되지 않는다.

주의: 프로덕션 모드로 빌드한 로컬 프리뷰는 `PROD=true`이므로 토큰이 있으면 수집될 수 있다. 운영 검증이 아니라면 토큰을 제거하거나 내부 기기로 등록한다.

## 5. 공통 이벤트 속성

`before_send`에서 PostHog로 전송되는 모든 이벤트에 다음 속성을 붙인다.

| 속성 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `app_environment` | string | `production` | 현재 분석 환경 |
PostHog가 기본으로 붙이는 브라우저·기기·URL·Referrer·UTM 속성도 함께 사용할 수 있다.

## 6. 이벤트 사전

### 6.1 PostHog 기본 이벤트

| 표시 이름 | 실제 이벤트 | 발생 조건 | 활용 |
|---|---|---|---|
| Pageview | `$pageview` | 최초 진입 또는 React Router 경로·쿼리 변경 | 방문, 랜딩, 페이지 이동 분석 |
| Pageleave | `$pageleave` | 새로고침, 페이지 이탈, 탭 종료 | 체류시간·이탈 분석 |
| Set person properties | `$set` 계열 | SDK가 유입·익명 사용자 속성을 설정할 때 | UTM·Referrer 등 초기 속성 처리 |

`$pageview`에는 다분해가 추가한 `page_name`, `path`가 포함된다.

| `page_name` | 경로 |
|---|---|
| `home` | `/` |
| `product_list` | `/list` |
| `category_list` | `/category/:categorySlug` |
| `product_detail` | `/product/:id` 또는 슬러그-ID |
| `compare` | `/compare` |
| `wishlist` | `/wishlist` |
| `purchase_redirect` | `/redirect` |
| `other` | 그 외 경로 |

구매 리다이렉트 페이지의 `$current_url`에는 외부 판매처 URL 쿼리를 포함하지 않고 `/redirect` 경로만 보낸다.

### 6.2 다분해 커스텀 이벤트

#### `category_viewed`

카테고리 목록 페이지에 진입했을 때 발생한다.

| 속성 | 설명 |
|---|---|
| `category_slug` | URL의 카테고리 슬러그 |

#### `search_submitted`

`/list` 또는 카테고리 목록에서 검색어가 있는 검색 결과로 진입했을 때 발생한다. 페이지네이션만 변경될 때는 같은 검색을 다시 기록하지 않는다.

| 속성 | 설명 |
|---|---|
| `query` | 사용자가 제출한 검색어 |
| `category_slug` | 카테고리 내 검색이면 해당 슬러그, 전체 검색이면 `null` |

검색어는 이용자가 개인정보를 입력할 가능성이 있으므로 운영 중 비정상 검색어를 점검하고 필요하면 추가 마스킹 정책을 적용한다.

#### `product_viewed`

제품 상세페이지에 진입했을 때 발생한다.

| 속성 | 설명 |
|---|---|
| `product_id` | URL 끝에서 파싱한 제품 ID |

#### `wishlist_changed`

찜 목록에 제품을 추가하거나 삭제하는 데 성공했을 때 발생한다.

| 속성 | 예시 | 설명 |
|---|---|---|
| `action` | `added`, `removed` | 변경 종류 |
| `product_id` | `123` | 대상 제품 ID |
| `item_count` | `4` | 변경 완료 후 찜 개수 |

찜 추가 전환만 볼 때는 `action = added` 필터를 사용한다.

#### `compare_changed`

비교함에 제품을 추가하거나 삭제하는 데 성공했을 때 발생한다. 최대 개수 초과 등으로 실패한 추가는 기록하지 않는다.

| 속성 | 예시 | 설명 |
|---|---|---|
| `action` | `added`, `removed` | 변경 종류 |
| `product_id` | `123` | 대상 제품 ID |
| `item_count` | `3` | 변경 완료 후 비교함 개수 |

비교함 추가 전환만 볼 때는 `action = added` 필터를 사용한다.

#### `compare_viewed`

사용자가 `/compare` 페이지에 진입했을 때 발생한다. 현재 별도 이벤트 속성은 없다.

#### `purchase_link_clicked`

사용자가 다분해 구매 링크를 열어 검증된 `/redirect` 페이지가 정상 로드됐을 때 발생한다. 외부 판매처로 이동하기 전에 즉시 전송한다.

| 속성 | 설명 |
|---|---|
| `product_id` | 링크에 포함된 제품 ID. 이전 형식 링크 등에서는 `null` 가능 |
| `vendor` | 검증된 외부 URL 호스트에서 결정한 판매처명 |
| `source_path` | 동일 출처 Referrer가 있으면 구매 링크를 누른 다분해 경로 |

이벤트 이름은 클릭이지만 실제 수집 지점은 안전한 리다이렉트 페이지 진입이다. 따라서 외부에서 `/redirect` URL을 직접 열어도 유효 링크라면 기록될 수 있다.

## 7. 이벤트 네이밍·변경 규칙

- 커스텀 이벤트는 영문 소문자 `snake_case`를 사용한다.
- 행동 완료를 나타내는 과거형을 우선한다: `product_viewed`, `category_viewed`.
- 추가·삭제처럼 같은 대상의 상태 변경은 이벤트를 분리하지 않고 `action`으로 구분한다.
- 제품명처럼 변경 가능한 문자열보다 안정적인 `product_id`를 기본 식별자로 사용한다.
- URL 전체나 외부 판매처 원본 URL은 이벤트 속성으로 보내지 않는다.
- 새 이벤트를 추가하면 이 문서의 이벤트 사전과 PostHog Event definitions를 함께 갱신한다.
- 이벤트 이름을 바꾸면 기존 리포트가 끊기므로 새 이벤트를 일정 기간 병행하거나 마이그레이션 계획을 세운다.

## 8. 마케팅 UTM 규칙

모든 마케팅 링크에는 아래 네 항목을 필수로 붙인다.

| 파라미터 | 의미 | 예시 |
|---|---|---|
| `utm_source` | 플랫폼·매체 | `instagram`, `naver_blog`, `kakao` |
| `utm_medium` | 마케팅 방식 | `paid_social`, `organic_social`, `influencer`, `community` |
| `utm_campaign` | 캠페인 식별자 | `2026_07_protein_drink` |
| `utm_content` | 소재·배치 식별자 | `reels_price_a`, `banner_top_b` |
| `utm_term` | 검색 키워드, 필요할 때만 | `protein_drink` |

### 작성 원칙

- 영문 소문자, 숫자, `_`만 사용한다.
- 띄어쓰기와 한글 값은 사용하지 않는다.
- `instagram`, `Instagram`, `insta`처럼 같은 채널명을 혼용하지 않는다.
- 소재나 배치가 다르면 `utm_content`를 다르게 쓴다.
- 단축 URL을 사용하면 최종 목적지까지 UTM이 유지되는지 확인한다.
- 기존 쿼리가 없는 URL에는 `?`, 기존 쿼리가 있는 URL에는 `&`로 붙인다.
- 캠페인별 원본 URL은 스프레드시트 등 한곳에서 관리한다.

### 기본 예시

```text
https://서비스도메인/category/카테고리슬러그?utm_source=instagram&utm_medium=paid_social&utm_campaign=2026_07_protein_drink&utm_content=reels_price_a
```

기존 검색 쿼리가 있는 예시:

```text
https://서비스도메인/list?q=단백질음료&utm_source=instagram&utm_medium=paid_social&utm_campaign=2026_07_protein_drink&utm_content=story_a
```

### 채널별 예시

```text
# 인스타그램 유료 릴스
utm_source=instagram
utm_medium=paid_social
utm_campaign=2026_07_protein_drink
utm_content=reels_price_a

# 인스타그램 프로필 링크
utm_source=instagram
utm_medium=organic_social
utm_campaign=profile_link
utm_content=bio

# 네이버 블로그 체험단
utm_source=naver_blog
utm_medium=influencer
utm_campaign=2026_07_protein_drink
utm_content=creator_kim_a

# 커뮤니티 게시글
utm_source=fit_forum
utm_medium=community
utm_campaign=2026_07_protein_drink
utm_content=review_post_a

# 카카오 메시지
utm_source=kakao
utm_medium=message
utm_campaign=2026_07_protein_drink
utm_content=message_a
```

마케팅 담당자에게 전달할 문구:

> 모든 홍보 링크에 `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`를 필수로 넣어주세요. 값은 영문 소문자 snake_case로 작성하고, 같은 매체와 캠페인의 명칭을 통일해주세요. `utm_content`에는 소재와 배치를 구분할 수 있는 값을 넣어주세요.

## 9. 내부 테스트 트래픽 관리

로그인 계정이 없는 현재 구조에서는 브라우저별 로컬 표시를 사용한다.

### 등록

배포된 운영 사이트에서 내부 인원이 사용하는 브라우저마다 아래 링크에 한 번 접속한다.

```text
https://서비스도메인/?dh_staff=1
```

성공 동작:

1. 브라우저 로컬 스토리지에 내부 사용자 표시 저장
2. 주소에서 `dh_staff` 쿼리 자동 제거
3. 상단에 `이 브라우저를 내부 테스트 기기로 등록했습니다.` 안내를 5초간 표시
4. PostHog Person property `$internal_or_test_user=true` 설정

### 해제

```text
https://서비스도메인/?dh_staff=0
```

상단에 등록 해제 안내가 표시되고 PostHog Person property `$internal_or_test_user`를 제거한다.

### 운영 주의사항

- 기기와 브라우저마다 따로 등록한다.
- 시크릿 모드는 창을 닫으면 표시가 사라진다.
- 쿠키·사이트 데이터를 삭제하면 다시 등록한다.
- 회사 IP 필터는 재택·모바일·VPN을 놓칠 수 있어 주 방식으로 사용하지 않는다.
- `dh_staff` 링크는 인증이나 보안 기능이 아니다. 사내에서만 공유한다.
- 내부 이벤트를 폐기하지 않고 표시만 붙이므로 테스트 행동도 별도로 분석할 수 있다.
- 코드 배포 전 접속한 등록 링크는 아무 효과가 없다. 배포 후 다시 접속한다.

### PostHog 확인 방법

1. 내부 기기 등록 링크에 접속해 성공 안내를 확인한다.
2. 카테고리나 제품 상세페이지로 이동해 새 이벤트를 발생시킨다.
3. PostHog Activity에서 해당 이벤트를 연다.
4. Person properties에서 `$internal_or_test_user = true`를 확인한다.

Product analytics 설정에는 PostHog가 기본 제공한 다음 조건만 유지한다.

```text
User not in Internal/Test users
```

별도의 `is_internal` Event property 필터나 추가 cohort를 만들 필요가 없다. SDK의 `setInternalOrTestUser()`가 표준 Person property `$internal_or_test_user=true`를 설정하면 기본 `Internal/Test users` 분류가 이를 사용한다. 이후 각 Activity·Insight에서 `Filter out internal and test users` 토글을 켜면 해당 사용자가 제외된다.

초기 연동 테스트로 이미 저장된 `localhost`, `127.0.0.1`, `utm_source=codex_test` 이벤트에는 내부 속성이 없을 수 있다. 초기 데이터는 분석 시작일 이후로 기간을 제한하거나 `$host`에서 `localhost`, `127.0.0.1`을 제외한다.

## 10. 권장 KPI와 퍼널

횟수보다 고유 사용자 기준을 우선한다. 새로고침과 반복 클릭으로 전환율이 부풀어 오르는 것을 줄이기 위해서다.

모든 KPI에는 기본적으로 `Filter out internal and test users`를 활성화한다. Product analytics 설정에는 기본 `User not in Internal/Test users` 조건만 유지한다.

### 핵심 퍼널: 구매처 이동

```text
$pageview
→ product_viewed
→ purchase_link_clicked
```

- 상세 조회율 = `product_viewed` 고유 사용자 / 전체 방문 고유 사용자
- 구매처 클릭률 = `purchase_link_clicked` 고유 사용자 / `product_viewed` 고유 사용자

### 비교 기능 퍼널

```text
product_viewed
→ compare_changed (action = added)
→ compare_viewed
→ purchase_link_clicked
```

- 비교함 추가율 = 비교함 추가 사용자 / 상세 조회 사용자
- 비교페이지 도달률 = 비교페이지 사용자 / 비교함 추가 사용자
- 비교 후 구매처 클릭률 = 구매처 클릭 사용자 / 비교페이지 사용자

### 찜 기능 퍼널

```text
product_viewed
→ wishlist_changed (action = added)
→ 재방문 product_viewed 또는 purchase_link_clicked
```

찜은 즉시 구매 전환보다 재방문과 장기 전환을 함께 확인한다.

### 마케팅 채널 성과

UTM 속성을 기준으로 다음을 나눈다.

- Source별 방문자
- Source/Medium별 상세 조회율
- Campaign별 구매처 클릭률
- Content별 상세 조회율과 구매처 클릭률
- 신규 캠페인의 검색·카테고리 탐색 비율

권장 분해 순서:

```text
utm_campaign
→ utm_source / utm_medium
→ utm_content
```

## 11. PostHog 초기 대시보드 구성

### 대시보드 A: Acquisition

- 고유 방문자 추이
- UTM Source별 고유 방문자
- Campaign별 고유 방문자
- 랜딩페이지별 방문자
- 상세 조회율
- 구매처 클릭률

### 대시보드 B: Product engagement

- 제품별 상세 조회 사용자
- 제품별 구매처 클릭 사용자
- 제품별 상세 → 구매처 클릭 전환율
- 카테고리별 방문 사용자
- 검색 사용률
- 비교함 추가율
- 찜 추가율

### 대시보드 C: Conversion funnel

- 방문 → 상세 → 구매처 클릭
- 상세 → 비교 추가 → 비교 조회 → 구매처 클릭
- UTM Campaign별 퍼널 비교
- 기기 유형별 퍼널 비교

## 12. 배포 후 검증 체크리스트

### 환경

- [ ] Vercel Production에 `VITE_POSTHOG_PROJECT_TOKEN` 등록
- [ ] Vercel Production에 `VITE_POSTHOG_HOST=https://us.i.posthog.com` 등록
- [ ] 실제 토큰이 Git 변경사항에 포함되지 않았는지 확인
- [ ] 운영 배포 완료

### 이벤트

- [ ] 운영 도메인 진입 시 `$pageview` 1회 확인
- [ ] 카테고리 진입 시 `category_viewed` 확인
- [ ] 검색 시 `search_submitted`와 `query` 확인
- [ ] 상세 진입 시 `product_viewed`와 `product_id` 확인
- [ ] 찜 추가·삭제 시 `wishlist_changed` 확인
- [ ] 비교함 추가·삭제 시 `compare_changed` 확인
- [ ] 비교페이지 진입 시 `compare_viewed` 확인
- [ ] 구매 링크 클릭 시 `purchase_link_clicked`, `product_id`, `vendor` 확인

### UTM

- [ ] 테스트 캠페인 링크로 운영 도메인 접속
- [ ] 이벤트에서 UTM Source, Medium, Campaign, Content 확인
- [ ] 단축 URL 사용 시 UTM 보존 확인

### 내부 인원

- [ ] 배포 후 각 내부 기기에서 `?dh_staff=1` 재접속
- [ ] 등록 성공 안내 확인
- [ ] Person properties에서 `$internal_or_test_user=true` 확인
- [ ] Product analytics 설정에서 기본 `User not in Internal/Test users` 조건 유지
- [ ] 커스텀 `is_internal` Event property 필터가 없는지 확인
- [ ] 운영 대시보드에서 `Filter out internal and test users` 활성화

## 13. 개인정보·보안 운영 원칙

- 자동 클릭 수집과 세션 리플레이는 현재 사용하지 않는다.
- 비밀번호, 결제정보, 건강정보 등 민감정보를 이벤트 속성으로 보내지 않는다.
- 외부 판매처 원본 URL은 PostHog 이벤트 속성으로 보내지 않는다.
- 검색어에 개인정보가 입력될 가능성을 정기적으로 점검한다.
- 개인정보 처리방침의 수탁자, 국외 이전 국가, 수집 항목, 보유기간을 실제 PostHog 설정과 일치시킨다.
- 세션 리플레이를 켜기 전 텍스트·입력값 마스킹, 표본 비율, 고지·동의 필요성을 별도로 검토한다.
- PostHog 데이터 접근 권한은 필요한 내부 인원에게만 부여한다.

## 14. 현재 의도적으로 수집하지 않는 항목

- 모든 버튼·링크의 자동 클릭
- 입력값과 폼 내용의 자동 수집
- 세션 리플레이
- 히트맵
- 필터별 선택 이벤트
- 정렬 선택 이벤트
- 검색 결과 0건 이벤트
- 리뷰 작성 이벤트
- 로그인 사용자 식별
- 구매 완료 이벤트

`purchase_link_clicked`는 외부 판매처 이동까지의 전환이다. 외부 쇼핑몰의 실제 구매 완료 데이터는 현재 확인할 수 없으므로 구매 완료 전환으로 해석하지 않는다.

## 15. 다음 단계 후보

데이터가 쌓인 뒤 실제 의사결정에 필요한 경우만 추가한다.

1. `search_zero_result`: 검색 품질 개선
2. `filter_applied`, `sort_changed`: 탐색 도구 효용 분석
3. 카드 노출 위치 `placement`: 메인·리스트·비슷한 제품 성과 비교
4. `compare_viewed`의 제품 수 속성
5. 제품 이벤트의 카테고리 코드·제품군 속성
6. 제휴사 전환 데이터 연동이 가능할 경우 구매 완료 또는 매출 이벤트
7. 최소 표본 세션 리플레이와 개인정보 마스킹

## 16. 이벤트 추가 방법

1. `src/lib/analytics.js`의 `ANALYTICS_EVENTS`에 이벤트 이름을 추가한다.
2. 실제 행동이 성공한 지점에서 `captureEvent`를 호출한다.
3. 가능한 경우 UI 클릭 시점보다 상태 변경 성공 시점을 사용한다.
4. 안정적인 ID와 필요한 최소 속성만 전송한다.
5. 개발 모드에서 화면 동작과 빌드를 검증한다.
6. 운영 또는 내부 QA 환경에서 이벤트 수신과 속성을 확인한다.
7. 이 문서와 PostHog Event definition을 갱신한다.

예시:

```js
captureEvent(ANALYTICS_EVENTS.EXAMPLE_COMPLETED, {
  product_id: String(productId),
  placement: 'product_detail',
});
```

## 17. 문제 해결

### 이벤트가 전혀 들어오지 않을 때

- 현재 `npm run dev`인지 확인한다. 개발 모드에서는 의도적으로 전송하지 않는다.
- Vercel 환경변수 등록과 재배포 여부를 확인한다.
- 프로젝트 토큰과 US Host가 올바른지 확인한다.
- 광고 차단 확장 프로그램이나 브라우저 추적 방지가 요청을 막는지 확인한다.

### 내부 사용자 속성이 보이지 않을 때

- 최신 코드가 운영에 배포됐는지 확인한다.
- 해당 브라우저에서 배포 후 `?dh_staff=1`을 다시 열었는지 확인한다.
- 성공 안내가 표시됐는지 확인한다.
- 다른 브라우저나 시크릿 모드에서 확인 중인지 점검한다.
- 등록 후 새로 발생한 이벤트를 보고 있는지 확인한다. 기존 이벤트에는 소급 적용되지 않는다.

### 페이지뷰가 많아 보일 때

- 새로고침과 SPA 경로·쿼리 변경도 페이지뷰임을 고려한다.
- 테스트 기간과 초기 로컬 테스트 이벤트를 제외한다.
- 이벤트 횟수 대신 고유 사용자 또는 세션 기준을 우선한다.

### 구매처 클릭에 제품 ID가 없을 때

- 과거 형식으로 생성된 링크인지 확인한다.
- 구매 링크가 `product` 쿼리를 포함하는지 확인한다.
- 제품 컨텍스트를 전달하지 않는 신규 구매 링크 컴포넌트가 추가됐는지 확인한다.
