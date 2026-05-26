// 데스크탑 디테일 — 후기 카드 (풀폭)
// - 모바일과 동일 데이터(localStorage productId별 누적) + 동일 SEED 폴백
// - 입력 영역: 맛/포만감 1~5 칩, 재구매 토글, 텍스트 + 제출
// - 빈 상태: "아직 후기가 없어요" + 첫 후기 안내
// - 데스크탑은 폼/리스트를 2단으로 배치해 폭 활용
import { useState, useEffect } from 'react';
import { Chip } from '../../ds/Chip.jsx';
import { Button } from '../../ds/Button.jsx';
import { IconCheck, IconClose } from '../../ds/Icons.jsx';

const STORAGE_KEY = 'dabunhae:reviews:v1';

// productId의 사용자 후기 배열 로드 (안전 fallback)
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

// productId의 사용자 후기 배열 저장
function saveUserReviews(productId, reviews) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) ?? {}) : {};
    map[productId] = reviews;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 저장 실패는 치명적이지 않으므로 무시
  }
}

// 데모용 시드 후기 — 빈 화면 방지
const SEED_REVIEWS = {
  p001: [
    { id: 1, taste: 4, fullness: 5, repurchase: true, text: '간이 강하지 않아 자주 먹기 좋아요.', createdAt: '2026-04-12' },
  ],
};

// 1~5 칩 입력 — 별 대신 숫자 칩 (DS Chip 사용)
function RatingInput({ value, onChange, label }) {
  return (
    <div className="d-detail-review-field">
      <label className="d-detail-review-field-label">{label}</label>
      <div className="d-detail-review-rating" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Chip key={n} active={value === n} onClick={() => onChange(n)}>
            {n}
          </Chip>
        ))}
      </div>
    </div>
  );
}

// 입력 폼 — 좌측 컬럼
function ReviewForm({ draft, setDraft, onSubmit, canSubmit }) {
  return (
    <div className="d-detail-review-form">
      <h3 className="d-detail-review-form-title">후기 남기기</h3>
      <RatingInput
        label="맛"
        value={draft.taste}
        onChange={(v) => setDraft({ ...draft, taste: v })}
      />
      <RatingInput
        label="포만감"
        value={draft.fullness}
        onChange={(v) => setDraft({ ...draft, fullness: v })}
      />
      <div className="d-detail-review-field">
        <label className="d-detail-review-field-label">재구매 의사</label>
        <label className="d-detail-review-bool">
          <input
            type="checkbox"
            checked={draft.repurchase}
            onChange={(e) => setDraft({ ...draft, repurchase: e.target.checked })}
          />
          <span>다시 살 의향 있음</span>
        </label>
      </div>
      <textarea
        className="d-detail-review-textarea"
        rows={4}
        placeholder="실제 먹어본 경험을 짧게 남겨주세요."
        value={draft.text}
        onChange={(e) => setDraft({ ...draft, text: e.target.value })}
      />
      <div className="d-detail-review-submit-row">
        <Button variant="brand" size="md" onClick={onSubmit} disabled={!canSubmit}>
          후기 남기기
        </Button>
      </div>
    </div>
  );
}

// 단일 후기 카드
function ReviewItem({ review }) {
  return (
    <li className="d-detail-review-item">
      <div className="d-detail-review-meta">
        <span>맛 {review.taste}/5</span>
        <span>포만감 {review.fullness}/5</span>
        <span
          className={`d-detail-review-repurchase ${review.repurchase ? 'is-yes' : 'is-no'}`}
        >
          {review.repurchase ? <IconCheck size={12} /> : <IconClose size={12} />}
          재구매 {review.repurchase ? '있음' : '없음'}
        </span>
      </div>
      <p className="d-detail-review-text">{review.text}</p>
    </li>
  );
}

// 후기 목록 — 우측 컬럼
function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="d-detail-review-empty">
        <p className="d-detail-review-empty-msg">아직 후기가 없어요.</p>
        <p className="d-detail-review-empty-sub">첫 후기를 남기고 다른 사람에게 도움을 주세요.</p>
      </div>
    );
  }
  return (
    <ul className="d-detail-review-list">
      {reviews.map((r) => (
        <ReviewItem key={r.id} review={r} />
      ))}
    </ul>
  );
}

export function ReviewSection({ productId }) {
  // 사용자 후기 상태 (localStorage 영속)
  const [userReviews, setUserReviews] = useState(() => loadUserReviews(productId));
  const [draft, setDraft] = useState({ taste: 4, fullness: 4, repurchase: true, text: '' });

  // productId 변경 시 그 제품 후기 다시 로드
  useEffect(() => {
    setUserReviews(loadUserReviews(productId));
  }, [productId]);

  // 후기 변경 시 storage 동기화
  useEffect(() => {
    saveUserReviews(productId, userReviews);
  }, [productId, userReviews]);

  // 화면용 리스트 — 사용자 최신순 → 시드 데모
  const reviews = [...userReviews, ...(SEED_REVIEWS[productId] ?? [])];

  // 제출 — 텍스트 트림 후 비어있지 않은 경우만
  const handleSubmit = () => {
    const text = draft.text.trim();
    if (!text) return;
    setUserReviews((prev) => [
      { id: Date.now(), ...draft, text, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setDraft({ taste: 4, fullness: 4, repurchase: true, text: '' });
  };

  return (
    <section className="d-detail-card d-detail-review">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">후기</h2>
        <span className="d-detail-card-sub">{reviews.length}건</span>
      </header>
      <div className="d-detail-review-grid">
        <ReviewForm
          draft={draft}
          setDraft={setDraft}
          onSubmit={handleSubmit}
          canSubmit={!!draft.text.trim()}
        />
        <ReviewList reviews={reviews} />
      </div>
    </section>
  );
}
