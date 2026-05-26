// 모바일 디테일 — 후기 입력/조회 섹션 (DS 스타일 재구성)
// - 항목: 맛(1-5), 포만감(1-5), 재구매(toggle), 텍스트
// - 사용자 후기는 localStorage에 productId별로 누적 (기존 키와 동일)
// - DS Chip 컴포넌트로 1-5 평점 입력
import { useState, useEffect } from 'react';
import { Chip } from '../../ds/Chip.jsx';
import { Button } from '../../ds/Button.jsx';
import { Badge } from '../../ds/Badge.jsx';
import { IconCheck, IconClose } from '../../ds/Icons.jsx';

// 기존 데스크탑 리뷰와 동일 localStorage 키 — 호환 유지
const STORAGE_KEY = 'dabunhae:reviews:v1';

// productId 후기 로드 (실패 시 빈 배열)
function loadUserReviews(productId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw);
    const arr = map?.[productId];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// productId 후기 저장 (다른 product 데이터 보존)
function saveUserReviews(productId, reviews) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) ?? {}) : {};
    map[productId] = reviews;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 저장 실패는 치명적이지 않음
  }
}

// 1-5 평점 입력 — Chip을 활용
function RatingChips({ value, onChange }) {
  return (
    <div className="m-detail-review-rating" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <Chip key={n} active={value === n} onClick={() => onChange(n)}>
          {n}
        </Chip>
      ))}
    </div>
  );
}

// 재구매 토글 — Yes/No 두 칩
function RepurchaseToggle({ value, onChange }) {
  return (
    <div className="m-detail-review-rating">
      <Chip active={value === true} onClick={() => onChange(true)}>다시 살래요</Chip>
      <Chip active={value === false} onClick={() => onChange(false)}>안 살래요</Chip>
    </div>
  );
}

// 개별 후기 아이템
function ReviewItem({ review }) {
  return (
    <li className="m-detail-review-item">
      <div className="m-detail-review-meta">
        <Badge variant="outline">맛 {review.taste}/5</Badge>
        <Badge variant="outline">포만감 {review.fullness}/5</Badge>
        <Badge variant={review.repurchase ? 'softGreen' : 'softOrange'}>
          {review.repurchase ? <IconCheck size={10} stroke={2} /> : <IconClose size={10} stroke={2} />}
          재구매 {review.repurchase ? '있음' : '없음'}
        </Badge>
      </div>
      <p className="m-detail-review-text">{review.text}</p>
    </li>
  );
}

export function ReviewSection({ productId }) {
  // 사용자 작성 후기
  const [userReviews, setUserReviews] = useState(() => loadUserReviews(productId));
  // draft 입력 폼 상태
  const [draft, setDraft] = useState({ taste: 4, fullness: 4, repurchase: true, text: '' });

  // productId 변경 시 후기 다시 로드
  useEffect(() => {
    setUserReviews(loadUserReviews(productId));
  }, [productId]);

  // userReviews 변경 시 storage 동기화
  useEffect(() => {
    saveUserReviews(productId, userReviews);
  }, [productId, userReviews]);

  // 후기 제출 — 텍스트 없으면 무시
  const submit = () => {
    const text = draft.text.trim();
    if (!text) return;
    const next = { id: Date.now(), ...draft, text, createdAt: new Date().toISOString() };
    setUserReviews((prev) => [next, ...prev]);
    setDraft({ taste: 4, fullness: 4, repurchase: true, text: '' });
    // 제출 로그 (백엔드 없음)
    console.log('[review submitted]', { productId, review: next });
  };

  return (
    <section className="m-detail-review">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">후기</h2>
        <span className="m-detail-section-sub">{userReviews.length}개</span>
      </header>

      <div className="m-detail-review-form">
        <div className="m-detail-review-field">
          <span className="m-detail-review-field-label">맛</span>
          <RatingChips value={draft.taste} onChange={(v) => setDraft({ ...draft, taste: v })} />
        </div>
        <div className="m-detail-review-field">
          <span className="m-detail-review-field-label">포만감</span>
          <RatingChips value={draft.fullness} onChange={(v) => setDraft({ ...draft, fullness: v })} />
        </div>
        <div className="m-detail-review-field">
          <span className="m-detail-review-field-label">재구매 의사</span>
          <RepurchaseToggle
            value={draft.repurchase}
            onChange={(v) => setDraft({ ...draft, repurchase: v })}
          />
        </div>
        <textarea
          className="m-detail-review-textarea"
          rows={3}
          placeholder="실제 먹어본 경험을 짧게 남겨주세요."
          value={draft.text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
        />
        <Button
          variant="brand"
          full
          disabled={!draft.text.trim()}
          onClick={submit}
        >
          후기 남기기
        </Button>
      </div>

      <ul className="m-detail-review-list">
        {userReviews.length === 0 ? (
          <li className="m-detail-review-empty">아직 후기가 없어요. 첫 후기를 남겨주세요.</li>
        ) : (
          userReviews.map((r) => <ReviewItem key={r.id} review={r} />)
        )}
      </ul>
    </section>
  );
}
