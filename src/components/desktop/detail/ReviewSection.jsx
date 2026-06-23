export function ReviewSection() {
  return (
    <section className="d-detail-card d-review">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">후기</h2>
        <span className="d-detail-card-sub">준비중</span>
      </header>

      <div className="d-review-disabled" aria-live="polite">
        <div className="d-review-disabled-preview" aria-hidden="true">
          <div className="d-review-disabled-form">
            <div className="d-review-disabled-stars">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="d-review-disabled-input" />
          </div>
          <div className="d-review-disabled-list">
            <div className="d-review-disabled-item">
              <span />
              <strong />
              <p />
            </div>
            <div className="d-review-disabled-item">
              <span />
              <strong />
              <p />
            </div>
          </div>
        </div>
        <div className="d-review-disabled-overlay">
          <span className="d-review-disabled-badge">준비중</span>
          <p className="d-review-disabled-title">제품 후기를 준비하고 있어요</p>
          <p className="d-review-disabled-text">
            실제 섭취 경험을 더 믿고 볼 수 있도록 후기 기능을 정리 중입니다.
          </p>
        </div>
      </div>
    </section>
  );
}
