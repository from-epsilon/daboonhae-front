import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

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

function StarRating({ value, onChange }) {
  return (
    <div className="d-review-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`d-review-star${n <= value ? ' is-filled' : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n}점`}
        >
          <Star size={16} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ onSubmit }) {
  const [draft, setDraft] = useState({ rating: 0, text: '' });
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = draft.rating > 0 && draft.text.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(draft);
    setDraft({ rating: 0, text: '' });
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
      <div className="d-review-form-controls">
        <span className="d-review-rating-label">평점</span>
        <StarRating value={draft.rating} onChange={(v) => setDraft({ ...draft, rating: v })} />
      </div>
      <div className="d-review-form-input">
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
        >등록</button>
      </div>
    </div>
  );
}

function ReviewItem({ review }) {
  const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : '';
  const rating = review.rating ?? review.taste ?? 0;
  return (
    <div className="d-review-item">
      <div className="d-review-item-head">
        <div className="d-review-item-meta">
          <span className="d-review-item-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={12} fill={n <= rating ? 'var(--orange-400)' : 'none'} color={n <= rating ? 'var(--orange-400)' : 'var(--gray-300)'} />
            ))}
          </span>
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
      { id: Date.now(), rating: draft.rating, text: draft.text.trim(), createdAt: new Date().toISOString() },
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
