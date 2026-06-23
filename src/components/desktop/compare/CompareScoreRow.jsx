// 데스크탑 비교 - 다분해 점수 행
// - 좌측 라벨 + 각 컬럼 점수(텍스트) + 막대 + best 텍스트 강조
// - 헤더 행에 ScoreGauge가 이미 있어서 본문은 숫자+막대로 간소화

// 한 셀 (SRP)
function ScoreCell({ score, isBest }) {
  const cls = isBest
    ? 'd-compare-metric-cell d-compare-metric-cell--best'
    : 'd-compare-metric-cell';
  const safe = typeof score === 'number' ? score : 0;
  const pct = Math.min(100, Math.max(0, (safe / 10) * 100));
  return (
    <div className={cls}>
      <div className="d-compare-metric-value">
        <span className="d-compare-metric-num">{safe.toFixed(1)}</span>
        <span className="d-compare-metric-unit">점</span>
      </div>
      <div className="d-compare-metric-bar" aria-hidden="true">
        <div
          className="d-compare-metric-bar-fill d-compare-metric-bar-fill--score"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CompareScoreRow({ label, products, bestSet, rowStyle, hasAdd }) {
  return (
    <div className="d-compare-row" style={rowStyle}>
      <div className="d-compare-row-label">
        <span className="d-compare-row-label-text">{label}</span>
        <span className="d-compare-row-hint">10점 만점</span>
      </div>
      {products.map((p, idx) => (
        <ScoreCell key={p.id} score={p.score} isBest={bestSet?.has(idx) ?? false} />
      ))}
      {hasAdd && <div className="d-compare-metric-cell d-compare-metric-cell--empty" />}
    </div>
  );
}
