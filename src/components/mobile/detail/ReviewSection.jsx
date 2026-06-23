export function ReviewSection() {
  return (
    <section className="m-detail-review">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">후기</h2>
        <span className="m-detail-section-sub">준비중</span>
      </header>

      <div className="m-detail-review-disabled" aria-live="polite">
        <div className="m-detail-review-disabled-preview" aria-hidden="true">
          <div className="m-detail-review-disabled-form">
            <div className="m-detail-review-disabled-chips">
              <span />
              <span />
              <span />
            </div>
            <div className="m-detail-review-disabled-input" />
          </div>
          <div className="m-detail-review-disabled-item">
            <span />
            <strong />
            <p />
          </div>
        </div>
        <div className="m-detail-review-disabled-overlay">
          <span className="m-detail-review-disabled-badge">준비중</span>
          <p className="m-detail-review-disabled-title">제품 후기를 준비하고 있어요</p>
          <p className="m-detail-review-disabled-text">
            실제 섭취 경험을 더 믿고 볼 수 있도록 후기 기능을 정리 중입니다.
          </p>
        </div>
      </div>
    </section>
  );
}
