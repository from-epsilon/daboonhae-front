import { useState, useEffect } from 'react';
import { Star, RefreshCw, ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'dabunhae:reviews:v1';

function loadUserReviews(productId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw);
    return Array.isArray(map?.[productId]) ? map[productId] : [];
  } catch { return []; }
}

function saveUserReviews(productId, reviews) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) ?? {}) : {};
    map[productId] = reviews;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

function StarRating({ value, onChange, label }) {
  return (
    <div className="d-review-field">
      <span className="d-review-field-label">{label}</span>
      <div className="d-review-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`d-review-star${n <= value ? ' is-filled' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`${n}점`}
          >
            <Star size={18} fill={n <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ onSubmit }) {
  const [draft, setDraft] = useState({ taste: 0, fullness: 0, repurchase: null, text: '' });
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = draft.taste > 0 && draft.fullness > 0 && draft.text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(draft);
    setDraft({ taste: 0, fullness: 0, repurchase: null, text: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  if (submitted) {
    return (
      <div className="d-review-form d-review-form--done">
        <span className="d-review-done-icon">✓</span>
        <span className="d-review-done-text">후기가 등록되었습니다</span>
      </div>
    );
  }

  return (
    <div className="d-review-form">
      <div className="d-review-form-row">
        <StarRating label="맛" value={draft.taste} onChange={(v) => setDraft({ ...draft, taste: v })} />
        <StarRating label="포만감" value={draft.fullness} onChange={(v) => setDraft({ ...draft, fullness: v })} />
        <div className="d-review-field">
          <span className="d-review-field-label">재구매</span>
          <div className="d-review-repurchase-btns">
            <button
              type="button"
              className={`d-review-repurchase-btn${draft.repurchase === true ? ' is-active is-yes' : ''}`}
              onClick={() => setDraft({ ...draft, repurchase: true })}
            >
              O
            </button>
            <button
              type="button"
              className={`d-review-repurchase-btn${draft.repurchase === false ? ' is-active is-no' : ''}`}
              onClick={() => setDraft({ ...draft, repurchase: false })}
            >
              X
            </button>
          </div>
        </div>
      </div>
      <div className="d-review-form-bottom">
        <textarea
          className="d-review-textarea"
          rows={2}
          placeholder="실제 먹어본 경험을 짧게 남겨주세요."
          value={draft.text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
        />
        <button
          type="button"
          className="d-review-submit"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          등록
        </button>
      </div>
    </div>
  );
}

function ReviewItem({ review }) {
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : '';
  return (
    <div className="d-review-item">
      <div className="d-review-item-top">
        <div className="d-review-item-ratings">
          <span className="d-review-item-rating">맛 <b>{review.taste}</b></span>
          <span className="d-review-item-rating">포만감 <b>{review.fullness}</b></span>
          {review.repurchase !== null && review.repurchase !== undefined && (
            <span className={`d-review-item-repurchase ${review.repurchase ? 'is-yes' : 'is-no'}`}>
              <RefreshCw size={12} />
              {review.repurchase ? '재구매 의향' : '재구매 없음'}
            </span>
          )}
        </div>
        {date && <span className="d-review-item-date">{date}</span>}
      </div>
      <p className="d-review-item-text">{review.text}</p>
    </div>
  );
}

export function ReviewSection({ productId }) {
  const [userReviews, setUserReviews] = useState(() => loadUserReviews(productId));

  useEffect(() => { setUserReviews(loadUserReviews(productId)); }, [productId]);
  useEffect(() => { saveUserReviews(productId, userReviews); }, [productId, userReviews]);

  const reviews = [...userReviews];

  const handleSubmit = (draft) => {
    setUserReviews((prev) => [
      { id: Date.now(), ...draft, text: draft.text.trim(), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  return (
    <section className="d-detail-card d-review">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">후기</h2>
        {reviews.length > 0 && <span className="d-detail-card-sub">{reviews.length}건</span>}
      </header>

      <ReviewForm onSubmit={handleSubmit} />

      {reviews.length === 0 ? (
        <div className="d-review-empty">
          <p className="d-review-empty-msg">아직 후기가 없어요</p>
          <p className="d-review-empty-sub">첫 후기를 남겨주세요</p>
        </div>
      ) : (
        <div className="d-review-list">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
