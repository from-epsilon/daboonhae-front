// 비교 분석 요약 (페이지 하단 1~3 문장)
// - "Compare, don't rank" 톤: A는 X가 많고, B는 Y가 적어요
// - 1위/2위/랭킹 단어 금지
// - buildCompareSummary 결과 sentences가 비면 렌더 안 함

export function CompareSummary({ sentences }) {
  if (!sentences || sentences.length === 0) return null;
  return (
    <section className="m-compare-summary">
      <div className="m-compare-summary-head">
        <span className="m-compare-summary-dot" aria-hidden="true" />
        <span className="m-compare-summary-title">한눈에 비교</span>
      </div>
      <ul className="m-compare-summary-list">
        {sentences.map((s, i) => (
          <li key={i} className="m-compare-summary-item">{s}</li>
        ))}
      </ul>
    </section>
  );
}
