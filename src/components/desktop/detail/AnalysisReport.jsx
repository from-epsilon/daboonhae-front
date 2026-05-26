// 데스크탑 디테일 — 목적별 분석 리포트 (풀폭 카드, 가로 그리드)
// - purpose.reportSections를 카드 형태로 가로 나열 (2~3개)
// - purpose 'all' 인 경우 basic_info 단일 카드만 노출
// - 데이터 결측 시 안내 문구로 fallback
import { analyzeSection } from '../../../data/analyzers.js';

// 단일 분석 섹션 카드
function SectionCard({ id, title, rawProduct }) {
  const lines = analyzeSection(rawProduct, id);
  return (
    <article className="d-detail-report-card">
      <h3 className="d-detail-report-card-title">{title}</h3>
      {lines.length === 0 ? (
        <p className="d-detail-report-card-body is-empty">분석 데이터가 부족합니다.</p>
      ) : (
        <ul className="d-detail-report-card-list">
          {lines.map((line, i) => (
            <li key={i} className="d-detail-report-card-line">{line}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

// 헤더 — 목적 라벨 + 힌트 (헤더에서 목적 바꾸면 다른 기준 적용)
function ReportHeader({ purpose }) {
  const PurposeIcon = purpose?.Icon;
  return (
    <header className="d-detail-card-head d-detail-report-head">
      <h2 className="d-detail-card-title d-detail-report-title">
        {PurposeIcon && <PurposeIcon size={20} aria-hidden />}
        {purpose?.label} 관점 분석 리포트
      </h2>
      <p className="d-detail-report-hint">
        헤더에서 목적을 바꾸면 같은 제품도 다른 기준으로 해석됩니다.
      </p>
    </header>
  );
}

export function AnalysisReport({ rawProduct, purpose }) {
  // 섹션 개수에 따라 그리드 컬럼이 자연스럽게 늘어남 (2~3개)
  const sections = purpose?.reportSections ?? [];
  return (
    <section className="d-detail-card d-detail-report">
      <ReportHeader purpose={purpose} />
      <div
        className="d-detail-report-grid"
        // 1개일 때는 풀폭, 2개 이상부터 균등 분배
        style={{
          gridTemplateColumns:
            sections.length <= 1
              ? '1fr'
              : `repeat(${sections.length}, minmax(0, 1fr))`,
        }}
      >
        {sections.map(({ id, title }) => (
          <SectionCard
            key={id}
            id={id}
            title={title}
            rawProduct={rawProduct}
          />
        ))}
      </div>
    </section>
  );
}
