# 다분해 SEO 작업 문서

> 타깃: **구글 검색** (네이버·sitemap·SSR 제외) / 도메인: `https://www.daboonhae.com` / 호스팅: Vercel
> 제약: **CSR + SPA 유지 (불변)**. 구글봇은 JS 렌더하므로 helmet 메타/JSON-LD 유효.

## 문서 구성
- **[전체 계획·진단](../seo-refactoring-plan.md)** — 라이브 실측 결과, 트랙 분리, 우선순위 매트릭스, 한계.
- **[Phase 1 — 메타 인프라 + GSC + 정적 OG](./phase-1-meta-infra.md)**
- **[Phase 2 — 구조화 데이터(JSON-LD)](./phase-2-structured-data.md)**
- **[Phase 3 — 위생(robots/404/리다이렉트/캐싱)](./phase-3-hygiene.md)**
- **[Phase 4 — 성능·이미지·시맨틱](./phase-4-performance-images.md)**

## 권장 진행 순서
1. **Phase 1** — 메타 인프라가 Phase 2(JSON-LD 주입)의 전제. 가장 먼저.
2. **Phase 3** — robots/캐싱/리다이렉트는 코드 의존 없이 독립적이라 병렬 가능(빠른 효과).
3. **Phase 2** — Phase 1 완료 후 JSON-LD 추가.
4. **Phase 4** — 성능/이미지(독립적, 마지막 또는 병렬).

## 핵심 한계 (합의됨)
- 제품별 SNS 공유 미리보기는 SSR 부재로 일반 이미지 처리(구글 검색에는 정상 반영).
- 네이버 본문 색인은 범위 외(트랙 A 필요 시 향후 재검토).
