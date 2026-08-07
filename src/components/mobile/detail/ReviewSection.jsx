import { ProductReviewContent } from '../../detail/ProductReviewContent.jsx';

export function ReviewSection({ productProfileId, categoryCode }) {
  return (
    <section className="m-detail-review">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">리뷰</h2>
      </header>
      <ProductReviewContent
        productProfileId={productProfileId}
        categoryCode={categoryCode}
      />
    </section>
  );
}
