import { useEffect, useState } from 'react';
import { ChevronRight, Star, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar } from '../components/ds/AppBar.jsx';
import Seo from '../components/global/Seo.jsx';
import ProductThumb from '../components/global/ProductThumb.jsx';
import { deleteProductProfileReview, fetchMyProductProfileReviews } from '../data/reviewApi.js';
import { productPath } from '../data/productUrl.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import { loginPath } from '../lib/auth.js';
import { useAuth } from '../store/AuthContext.jsx';
import './AccountPage.css';

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
}

function reviewProductName(review) {
  const base = review.brand && !review.name?.includes(review.brand)
    ? `${review.brand} ${review.name}`
    : review.name;
  return review.revision_label ? `${base} (${review.revision_label})` : base;
}

function ReviewDetails({ review }) {
  return (
    <div className="d-account-review-main">
      <span>{review.category}</span>
      <strong>{reviewProductName(review)}</strong>
      <div className="d-account-review-scores">
        {Object.entries(review.scores ?? {}).map(([code, score]) => (
          <span key={code}>
            {review.metric_labels?.[code] ?? code} <b>{score}</b>/5
          </span>
        ))}
      </div>
      {review.content && <p>{review.content}</p>}
    </div>
  );
}

function ReviewProduct({ review }) {
  return (
    <div className="d-account-review-product">
      <ProductThumb
        product={{
          id: review.product_key,
          brand: review.brand,
          name: review.name,
          thumbnail: review.thumbnail,
        }}
        size="compact"
        className="d-account-review-thumb"
      />
      <ReviewDetails review={review} />
    </div>
  );
}

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    user,
    profile,
    loading: authLoading,
    profileLoading,
    profileError,
    onboardingComplete,
  } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(loginPath(`${location.pathname}${location.search}`), { replace: true });
      return;
    }
    if (!profileLoading && !profileError && profile && !onboardingComplete) {
      navigate('/join?next=%2Faccount%2Freviews', { replace: true });
    }
  }, [
    authLoading,
    location,
    navigate,
    onboardingComplete,
    profile,
    profileError,
    profileLoading,
    user,
  ]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError('');
    fetchMyProductProfileReviews()
      .then((data) => {
        if (active) setReviews(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError?.message || '내 리뷰를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  const handleDelete = async (review) => {
    if (!window.confirm('판매 종료된 제품의 리뷰를 삭제할까요?')) return;
    setDeletingReviewId(review.review_id);
    setDeleteError('');
    try {
      await deleteProductProfileReview(review.product_profile_id);
      setReviews((current) => current.filter((item) => item.review_id !== review.review_id));
    } catch (deleteReviewError) {
      setDeleteError(deleteReviewError?.message || '리뷰를 삭제하지 못했습니다.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <>
      <Seo title="내 리뷰" noindex />
      {isMobile && <AppBar onBack={() => navigate('/account')} title="내 리뷰" />}
      <div className="page d-account-reviews">
        <header className="d-account-reviews-header">
          <div>
            <h1>내 리뷰</h1>
          </div>
          <strong>{reviews.length}</strong>
        </header>

        {deleteError && <p className="auth-error d-account-review-action-error" role="alert">{deleteError}</p>}

        {loading ? (
          <p className="auth-status">내 리뷰를 불러오고 있어요…</p>
        ) : error ? (
          <p className="auth-error" role="alert">{error}</p>
        ) : reviews.length === 0 ? (
          <div className="d-account-reviews-empty">
            <Star size={28} strokeWidth={1.6} aria-hidden />
            <strong>아직 작성한 리뷰가 없어요</strong>
            <button type="button" onClick={() => navigate('/list')}>제품 둘러보기</button>
          </div>
        ) : (
          <ul className="d-account-review-list">
            {reviews.map((review) => (
              <li
                key={review.review_id}
                className={review.is_product_available === false ? 'is-unavailable' : undefined}
              >
                {review.is_product_available === false ? (
                  <div className="d-account-review-row">
                    <ReviewProduct review={review} />
                    <div className="d-account-review-side d-account-review-side--unavailable">
                      <span className="d-account-review-status">판매 종료</span>
                      <time dateTime={review.updated_at}>{formatDate(review.updated_at)}</time>
                      <button
                        type="button"
                        className="d-account-review-delete-button"
                        onClick={() => handleDelete(review)}
                        disabled={deletingReviewId === review.review_id}
                      >
                        <Trash2 size={14} strokeWidth={1.8} aria-hidden />
                        {deletingReviewId === review.review_id ? '삭제 중…' : '삭제'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="d-account-review-row d-account-review-open"
                    onClick={() => navigate(productPath({
                      id: review.product_key,
                      name: reviewProductName(review),
                      brand: review.brand,
                    }))}
                  >
                    <ReviewProduct review={review} />
                    <div className="d-account-review-side">
                      <time dateTime={review.updated_at}>{formatDate(review.updated_at)}</time>
                      <ChevronRight size={18} strokeWidth={1.8} aria-hidden />
                    </div>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
