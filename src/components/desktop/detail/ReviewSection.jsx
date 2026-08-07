import { ProductReviewContent } from '../../detail/ProductReviewContent.jsx';

export function ReviewSection({ productProfileId, categoryCode }) {
  return (
    <section className="d-detail-card d-review">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">리뷰</h2>
      </header>
      <ProductReviewContent
        productProfileId={productProfileId}
        categoryCode={categoryCode}
      />
    </section>
  );
}
