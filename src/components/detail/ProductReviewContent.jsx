import { useCallback, useEffect, useMemo, useState } from 'react';
import { LogIn, Star, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  deleteProductProfileReview,
  fetchProductProfileReviewPage,
  fetchProductProfileReviews,
  saveProductProfileReview,
} from '../../data/reviewApi.js';
import { loginPath } from '../../lib/auth.js';
import { useAuth } from '../../store/AuthContext.jsx';
import './ProductReviewContent.css';

const ENABLED_CATEGORY_CODES = new Set(['protein_drink', 'chicken_breast']);
const SCORE_VALUES = [1, 2, 3, 4, 5];

function formatReviewDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
}

function scoreDraft(metrics, review) {
  return Object.fromEntries(
    metrics.map((metric) => [metric.code, Number(review?.scores?.[metric.code]) || null]),
  );
}

function RatingButtons({ metric, value, onChange, disabled }) {
  return (
    <div className="product-review-rating" role="radiogroup" aria-label={`${metric.label} 평가`}>
      {SCORE_VALUES.map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          aria-label={`${metric.label} ${score}점`}
          className={value === score ? 'is-selected' : ''}
          disabled={disabled}
          onClick={() => onChange(score)}
        >
          <Star size={22} strokeWidth={1.8} fill={value >= score ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function reviewAverageScore(review) {
  const values = Object.values(review?.scores ?? {})
    .map(Number)
    .filter((score) => Number.isFinite(score));
  if (values.length === 0) return null;
  return values.reduce((sum, score) => sum + score, 0) / values.length;
}

function AverageStars({ value }) {
  return (
    <div className="product-review-overview-stars" aria-label={`평균 ${value.toFixed(1)}점`}>
      {SCORE_VALUES.map((score) => {
        const fillPercentage = Math.max(0, Math.min(1, value - (score - 1))) * 100;
        return (
          <span className="product-review-overview-star" key={score} aria-hidden>
            <Star className="product-review-overview-star-base" size={18} strokeWidth={1.8} />
            <i style={{ width: `${fillPercentage}%` }}>
              <Star size={18} strokeWidth={1.8} fill="currentColor" />
            </i>
          </span>
        );
      })}
    </div>
  );
}

function ReviewEditor({
  metrics,
  scores,
  content,
  expanded,
  saving,
  deleting,
  requiredComplete,
  error,
  submitLabel,
  allowDelete = false,
  onScoreChange,
  onContentChange,
  onSave,
  onCancel,
  onDelete,
}) {
  return (
    <>
      <div className="product-review-metrics">
        {metrics.map((metric) => (
          <div className="product-review-metric" key={metric.code}>
            <strong>{metric.label}</strong>
            <RatingButtons
              metric={metric}
              value={scores[metric.code]}
              disabled={saving || deleting}
              onChange={(score) => onScoreChange(metric.code, score)}
            />
          </div>
        ))}
      </div>

      {expanded && (
        <>
          <textarea
            value={content}
            maxLength={500}
            rows={2}
            disabled={saving || deleting}
            placeholder="리뷰를 작성해주세요."
            onChange={(event) => onContentChange(event.target.value)}
          />
          <div className="product-review-form-actions">
            <span>{content.length}/500</span>
            {onCancel && (
              <button
                type="button"
                className="product-review-cancel"
                onClick={onCancel}
                disabled={saving || deleting}
              >
                취소
              </button>
            )}
            {allowDelete && (
              <button
                type="button"
                className="product-review-delete"
                onClick={onDelete}
                disabled={saving || deleting}
              >
                <Trash2 size={15} strokeWidth={1.8} aria-hidden />
                {deleting ? '삭제 중…' : '삭제'}
              </button>
            )}
            <button
              type="button"
              className="product-review-save"
              onClick={onSave}
              disabled={!requiredComplete || saving || deleting}
            >
              {saving ? '저장 중…' : submitLabel}
            </button>
          </div>
          {error && <p className="product-review-error" role="alert">{error}</p>}
        </>
      )}
    </>
  );
}

function ReviewSummary({ averageRating, reviewCount, metrics }) {
  const average = Number(averageRating) || 0;
  const hasReviews = reviewCount > 0;
  const [selectedMetricCode, setSelectedMetricCode] = useState('taste');
  const selectedMetric = metrics.find((metric) => metric.code === selectedMetricCode) ?? metrics[0];
  const distribution = selectedMetric?.distribution;
  const ratingCount = Number(selectedMetric?.rating_count) || 0;
  const showMetricSummary = hasReviews && selectedMetric;

  return (
    <div
      className={`product-review-overview${hasReviews ? '' : ' product-review-overview--empty'}${showMetricSummary ? ' product-review-overview--with-metrics' : ''}`}
      aria-label="리뷰 평점 요약"
    >
      <div className="product-review-overview-score">
        {showMetricSummary && <small>종합</small>}
        <strong>{hasReviews ? average.toFixed(1) : '-'}</strong>
        {hasReviews && <AverageStars value={average} />}
        <span>리뷰 {reviewCount}개</span>
      </div>

      {showMetricSummary && (
        <div className="product-review-metric-summary">
          <div className="product-review-metric-tabs" role="tablist" aria-label="평가 항목">
            {metrics.map((metric) => {
              const selected = metric.code === selectedMetric.code;
              return (
                <button
                  key={metric.code}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={selected ? 'is-selected' : ''}
                  onClick={() => setSelectedMetricCode(metric.code)}
                >
                  <span>{metric.label}</span>
                  <strong>{metric.average == null ? '-' : Number(metric.average).toFixed(1)}</strong>
                </button>
              );
            })}
          </div>
          <div className="product-review-distribution" role="tabpanel" aria-label={`${selectedMetric.label} 별점 분포`}>
            {[5, 4, 3, 2, 1].map((score) => {
              const count = Number(distribution?.[score]) || 0;
              const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
              return (
                <div
                  className="product-review-distribution-row"
                  key={score}
                  aria-label={`${score}점 ${count}개`}
                >
                  <span>{score}점</span>
                  <div className="product-review-distribution-track">
                    <i style={{ width: `${percentage}%` }} />
                  </div>
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductReviewContent({
  productProfileId,
  categoryCode,
  onBundleChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scores, setScores] = useState({});
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');
  const [reviewOffset, setReviewOffset] = useState(0);
  const [allReviewsLoaded, setAllReviewsLoaded] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const enabled = ENABLED_CATEGORY_CODES.has(categoryCode) && Number(productProfileId) > 0;
  const myReview = useMemo(
    () => bundle?.reviews?.find((review) => review.is_mine) ?? null,
    [bundle],
  );

  const applyBundle = useCallback((nextBundle) => {
    setBundle(nextBundle);
    onBundleChange?.(nextBundle);
    const ownReview = nextBundle.reviews.find((review) => review.is_mine) ?? null;
    setScores(scoreDraft(nextBundle.metrics, ownReview));
    setContent(ownReview?.content ?? '');
    setReviewOffset(nextBundle.reviews.length);
    setAllReviewsLoaded(nextBundle.reviews.length >= nextBundle.reviewCount);
    setLoadMoreError('');
    setComposerOpen(false);
    setEditingReviewId(null);
  }, [onBundleChange]);

  const loadReviews = useCallback(async () => {
    if (!userId || !enabled) return;
    setLoading(true);
    setError('');
    try {
      applyBundle(await fetchProductProfileReviews(productProfileId));
    } catch (loadError) {
      setError(loadError?.message || '리뷰를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [applyBundle, enabled, productProfileId, userId]);

  useEffect(() => {
    setBundle(null);
    setScores({});
    setContent('');
    setError('');
    setLoadMoreError('');
    setReviewOffset(0);
    setAllReviewsLoaded(false);
    setComposerOpen(false);
    setEditingReviewId(null);
    if (userId && enabled) loadReviews();
  }, [enabled, loadReviews, productProfileId, userId]);

  if (!enabled) {
    return (
      <div className="product-review-state">
        <p>이 카테고리의 평가 항목을 준비하고 있어요.</p>
      </div>
    );
  }

  if (authLoading) {
    return <div className="product-review-state"><p>로그인 정보를 확인하고 있어요…</p></div>;
  }

  if (!user) {
    return (
      <div className="product-review-login">
        <LogIn size={24} strokeWidth={1.7} aria-hidden />
        <strong>리뷰는 로그인 후 볼 수 있어요</strong>
        <button
          type="button"
          onClick={() => navigate(loginPath(`${location.pathname}${location.search}`))}
        >
          로그인하고 리뷰 보기
        </button>
      </div>
    );
  }

  if (loading && !bundle) {
    return <div className="product-review-state"><p>리뷰를 불러오고 있어요…</p></div>;
  }

  if (error && !bundle) {
    return (
      <div className="product-review-state product-review-state--error">
        <p>{error}</p>
        <button type="button" onClick={loadReviews}>다시 시도</button>
      </div>
    );
  }

  const metrics = bundle?.metrics ?? [];
  const reviews = bundle?.reviews ?? [];
  const hasMoreReviews = !allReviewsLoaded && reviews.length < (bundle?.reviewCount ?? 0);
  const requiredComplete = metrics
    .filter((metric) => metric.is_required)
    .every((metric) => Number(scores[metric.code]) >= 1);

  const handleSave = async () => {
    if (!requiredComplete) return;
    setSaving(true);
    setError('');
    try {
      await saveProductProfileReview(productProfileId, scores, content);
    } catch (saveError) {
      setError(saveError?.message || '리뷰를 저장하지 못했습니다.');
      setSaving(false);
      return;
    }

    try {
      applyBundle(await fetchProductProfileReviews(productProfileId));
    } catch {
      setBundle(null);
      setError('리뷰는 저장됐지만 최신 목록을 불러오지 못했습니다. 다시 불러와주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('내 리뷰를 삭제할까요?')) return;
    setDeleting(true);
    setError('');
    try {
      await deleteProductProfileReview(productProfileId);
    } catch (deleteError) {
      setError(deleteError?.message || '리뷰를 삭제하지 못했습니다.');
      setDeleting(false);
      return;
    }

    try {
      applyBundle(await fetchProductProfileReviews(productProfileId));
    } catch {
      setBundle(null);
      setError('리뷰는 삭제됐지만 최신 목록을 불러오지 못했습니다. 다시 불러와주세요.');
    } finally {
      setDeleting(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMoreReviews || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError('');
    try {
      const nextReviews = await fetchProductProfileReviewPage(productProfileId, reviewOffset);
      setReviewOffset((current) => current + nextReviews.length);
      setAllReviewsLoaded(nextReviews.length < 50);
      setBundle((current) => {
        if (!current) return current;
        const existingIds = new Set(current.reviews.map((review) => review.id));
        const appended = nextReviews.filter((review) => !existingIds.has(review.id));
        return { ...current, reviews: [...current.reviews, ...appended] };
      });
    } catch (pageError) {
      setLoadMoreError(pageError?.message || '리뷰를 더 불러오지 못했습니다.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScoreChange = (metricCode, score) => {
    setScores((current) => ({ ...current, [metricCode]: score }));
    if (!myReview) setComposerOpen(true);
  };

  const handleCancelCreate = () => {
    setScores(scoreDraft(metrics, null));
    setContent('');
    setError('');
    setComposerOpen(false);
  };

  const handleEdit = (review) => {
    setScores(scoreDraft(metrics, review));
    setContent(review.content ?? '');
    setError('');
    setEditingReviewId(review.id);
  };

  const handleCancelEdit = () => {
    setScores(scoreDraft(metrics, myReview));
    setContent(myReview?.content ?? '');
    setError('');
    setEditingReviewId(null);
  };

  return (
    <div className="product-review-content">
      <ReviewSummary
        averageRating={bundle?.averageRating}
        reviewCount={bundle?.reviewCount ?? 0}
        metrics={metrics}
      />

      {!myReview && (
        <section
          className={`product-review-form${composerOpen ? '' : ' product-review-form--compact'}`}
          aria-label="리뷰 작성"
        >
          <ReviewEditor
            metrics={metrics}
            scores={scores}
            content={content}
            expanded={composerOpen}
            saving={saving}
            deleting={deleting}
            requiredComplete={requiredComplete}
            error={error}
            submitLabel="리뷰 등록"
            onScoreChange={handleScoreChange}
            onContentChange={setContent}
            onSave={handleSave}
            onCancel={handleCancelCreate}
          />
        </section>
      )}

      <section className="product-review-feed" aria-label="리뷰 목록">
        {reviews.length === 0 ? (
          <div className="product-review-empty">
            <strong>아직 리뷰가 없습니다.</strong>
          </div>
        ) : (
          <ul>
            {reviews.map((review) => editingReviewId === review.id ? (
              <li className="product-review-item--editing" key={review.id}>
                <div className="product-review-form product-review-form--inline" aria-label="내 리뷰 수정">
                  <ReviewEditor
                    metrics={metrics}
                    scores={scores}
                    content={content}
                    expanded
                    saving={saving}
                    deleting={deleting}
                    requiredComplete={requiredComplete}
                    error={error}
                    submitLabel="리뷰 수정"
                    allowDelete
                    onScoreChange={handleScoreChange}
                    onContentChange={setContent}
                    onSave={handleSave}
                    onCancel={handleCancelEdit}
                    onDelete={handleDelete}
                  />
                </div>
              </li>
            ) : (
              <li key={review.id}>
                <div className="product-review-item-head">
                  <div className="product-review-item-author">
                    <strong>{review.author_nickname}{review.is_mine && <em>내 리뷰</em>}</strong>
                    <span className="product-review-item-rating">
                      <Star size={13} strokeWidth={1.8} fill="currentColor" aria-hidden />
                      {reviewAverageScore(review)?.toFixed(1) ?? '-'}
                    </span>
                  </div>
                  <div className="product-review-item-side">
                    <time dateTime={review.updated_at}>{formatReviewDate(review.updated_at)}</time>
                    {review.is_mine && (
                      <button type="button" onClick={() => handleEdit(review)}>수정</button>
                    )}
                  </div>
                </div>
                <div className="product-review-item-scores">
                  {metrics.map((metric) => (
                    <span key={metric.code}>
                      {metric.label} <b>{review.scores?.[metric.code] ?? '-'}</b>
                    </span>
                  ))}
                </div>
                {review.content && <p>{review.content}</p>}
              </li>
            ))}
          </ul>
        )}
        {hasMoreReviews && (
          <button
            type="button"
            className="product-review-load-more"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? '불러오는 중…' : '리뷰 더 보기'}
          </button>
        )}
        {loadMoreError && <p className="product-review-load-more-error" role="alert">{loadMoreError}</p>}
      </section>
    </div>
  );
}
