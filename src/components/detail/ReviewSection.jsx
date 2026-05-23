import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

// 제품 후기 섹션 (사이트 피드백과는 별개)
// - 다이어트 식품 특화 항목: 맛, 포만감, 재구매 의사
// - 사용자 후기는 localStorage에 productId별로 누적. 새로고침해도 유지
// - SEED 후기는 demo로 항상 표시 (사용자 후기 뒤에 이어 붙임)

const STORAGE_KEY = 'dabunhae:reviews:v1';

// productId의 사용자 후기 배열 로드 (없거나 파싱 실패 시 빈 배열)
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

// productId의 사용자 후기 배열을 저장 (다른 product의 데이터는 보존)
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

export default function ReviewSection({ productId }) {
  // 사용자 작성 후기와 데모 시드 후기를 분리해 관리
  const [userReviews, setUserReviews] = useState(() => loadUserReviews(productId));
  const [draft, setDraft] = useState({ taste: 4, fullness: 4, repurchase: true, text: '' });

  // productId가 바뀌면 그 제품의 사용자 후기 다시 로드
  useEffect(() => {
    setUserReviews(loadUserReviews(productId));
  }, [productId]);

  // 사용자 후기 변경 시 storage 동기화
  useEffect(() => {
    saveUserReviews(productId, userReviews);
  }, [productId, userReviews]);

  // UI에 보일 전체 리스트: 사용자 최신순 → 시드 데모
  const reviews = [...userReviews, ...(SEED_REVIEWS[productId] ?? [])];

  const submit = () => {
    const text = draft.text.trim();
    if (!text) return;
    setUserReviews((prev) => [
      { id: Date.now(), ...draft, text, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setDraft({ taste: 4, fullness: 4, repurchase: true, text: '' });
  };

  return (
    <section className="review-section">
      <h2 className="review-title">후기</h2>

      <div className="review-form">
        <div className="review-field">
          <label>맛</label>
          <RatingInput value={draft.taste} onChange={(v) => setDraft({ ...draft, taste: v })} />
        </div>
        <div className="review-field">
          <label>포만감</label>
          <RatingInput value={draft.fullness} onChange={(v) => setDraft({ ...draft, fullness: v })} />
        </div>
        <div className="review-field">
          <label>재구매 의사</label>
          <label className="review-bool">
            <input
              type="checkbox"
              checked={draft.repurchase}
              onChange={(e) => setDraft({ ...draft, repurchase: e.target.checked })}
            />
            <span>다시 살 의향 있음</span>
          </label>
        </div>
        <textarea
          className="review-textarea"
          rows={3}
          placeholder="실제 먹어본 경험을 짧게 남겨주세요."
          value={draft.text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
        />
        <button className="review-submit" onClick={submit} disabled={!draft.text.trim()}>
          후기 남기기
        </button>
      </div>

      <ul className="review-list">
        {reviews.length === 0 && <li className="review-empty">아직 후기가 없습니다. 첫 후기를 남겨주세요.</li>}
        {reviews.map((r) => (
          <li key={r.id} className="review-item">
            <div className="review-meta">
              <span>맛 {r.taste}/5</span>
              <span>포만감 {r.fullness}/5</span>
              <span className={`review-repurchase ${r.repurchase ? 'is-yes' : 'is-no'}`}>
                {r.repurchase ? <Check size={12} aria-hidden /> : <X size={12} aria-hidden />}
                재구매 {r.repurchase ? '있음' : '없음'}
              </span>
            </div>
            <p className="review-text">{r.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// 5점 평점 입력 (별 대신 숫자 버튼, 추후 별/슬라이더로 교체)
function RatingInput({ value, onChange }) {
  return (
    <div className="rating-input" role="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          className={`rating-btn ${value === n ? 'is-active' : ''}`}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// 더미 시드 후기 (단순히 페이지 빈 화면 방지용)
const SEED_REVIEWS = {
  p001: [
    { id: 1, taste: 4, fullness: 5, repurchase: true, text: '간이 강하지 않아 자주 먹기 좋아요.', createdAt: '2026-04-12' },
  ],
};
