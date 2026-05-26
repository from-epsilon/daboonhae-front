// 데스크탑 비교 - 하단 자동 요약 카드
// - "Compare, don't rank" 톤: A는 X가 많고, B는 Y가 적어요
// - 1위/2위/랭킹 단어 금지 — 차이만 설명
// - sentences 비면 렌더 안 함
export function CompareSummary({ sentences }) {
  if (!sentences || sentences.length === 0) return null;
  return (
    <section className="d-compare-summary" aria-labelledby="d-compare-summary-title">
      <div className="d-compare-summary-head">
        <span className="d-compare-summary-dot" aria-hidden="true" />
        <h3
          id="d-compare-summary-title"
          className="d-compare-summary-title"
        >
          한눈에 비교
        </h3>
      </div>
      <ul className="d-compare-summary-list">
        {sentences.map((s, i) => (
          <li key={i} className="d-compare-summary-item">
            {s}
          </li>
        ))}
      </ul>
      <p className="d-compare-summary-note">
        같은 카테고리·다른 기준에서는 다른 제품이 우수할 수 있어요.
        순위가 아닌 차이를 보여드려요.
      </p>
    </section>
  );
}
