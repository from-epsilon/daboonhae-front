import { analyzeSection } from '../../data/analyzers.js';

// 식단 목적에 맞춘 분석 리포트
// - purpose.reportSections의 {id, title}로 분석 함수 호출
// - 데이터가 부족하면 안내 문구로 fallback
export default function AnalysisReport({ product, purpose }) {
  return (
    <section className="analysis-report">
      <div className="analysis-report-header">
        <h2 className="analysis-report-title">
          <purpose.Icon className="analysis-purpose-icon" size={20} aria-hidden />
          {purpose.label} 관점 분석 리포트
        </h2>
        <p className="analysis-report-hint">
          헤더에서 목적을 바꾸면 같은 제품도 다른 기준으로 해석됩니다.
        </p>
      </div>

      <div className="analysis-sections">
        {purpose.reportSections.map(({ id, title }) => {
          const lines = analyzeSection(product, id);
          return (
            <div key={id} className="analysis-section">
              <h3 className="analysis-section-title">{title}</h3>
              {lines.length === 0 ? (
                <p className="analysis-section-body">분석 데이터가 부족합니다.</p>
              ) : (
                lines.map((line, i) => (
                  <p key={i} className="analysis-section-body">{line}</p>
                ))
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
