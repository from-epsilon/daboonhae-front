# TODO

## 보류

### 의견/문의 제출 보안 강화

- 현재 상태: `feedback_submissions` 테이블에 Supabase anon insert를 허용해 MVP 제출 기능을 운영한다.
- 리스크: 공개 anon key와 REST endpoint를 이용한 대량 스팸 제출, DB 용량/quota 소모, 운영 데이터 오염.
- 현재 방어: RLS로 insert만 허용, select/update/delete 미개방, source/category/message 길이 제약.
- 추후 작업:
  - Supabase Edge Function을 통해서만 제출 받도록 변경
  - Cloudflare Turnstile 또는 hCaptcha 검증 추가
  - IP/session 기준 rate limit 추가
  - 필요 시 honeypot 필드 추가
  - 이상 제출 정리/archived 운영 절차 정리
