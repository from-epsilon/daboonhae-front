// 모바일 디테일 — 룰 기반 분석 리포트 카드 집합
// - 현재 선택된 purpose의 reportSections를 순회하며 카드로 렌더
// - 각 섹션은 analyzeSection(raw, sectionId) 결과 문장 배열을 받음
// - 데이터-우선 톤 (analyzers.js가 이미 numbers-first로 짜여 있음)
import { analyzeSection } from '../../../data/analyzers.js';
import { IconInfo } from '../../ds/Icons.jsx';

// 단일 분석 카드 — 제목 + 문장 리스트
function ReportCard({ title, lines, index }) {
  return (
    <article className="m-detail-card m-detail-report-card">
      <header className="m-detail-report-head">
        <span className="m-detail-report-index">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="m-detail-report-title">{title}</h3>
      </header>
      {lines.length > 0 ? (
        <ul className="m-detail-report-lines">
          {lines.map((line, i) => (
            <li key={i} className="m-detail-report-line">{line}</li>
          ))}
        </ul>
      ) : (
        <p className="m-detail-report-empty">분석할 정보가 부족합니다.</p>
      )}
    </article>
  );
}

// 목적 안내 (purpose === 'all' 일 때만 노출)
function PurposeHint({ purposeId }) {
  if (purposeId !== 'all') return null;
  return (
    <div className="m-detail-report-hint">
      <IconInfo size={14} />
      <span>상단에서 목적(체중감량/근성장 등)을 선택하면 더 자세한 해석이 표시돼요.</span>
    </div>
  );
}

export function AnalysisCard({ rawProduct, purpose, purposeId }) {
  // purpose.reportSections는 항상 배열로 정의됨
  const sections = purpose?.reportSections ?? [];

  return (
    <section className="m-detail-report">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">분석 리포트</h2>
        {purpose?.label && (
          <span className="m-detail-section-sub">{purpose.label} 기준</span>
        )}
      </header>
      <PurposeHint purposeId={purposeId} />
      <div className="m-detail-report-grid">
        {sections.map((sec, idx) => (
          <ReportCard
            key={sec.id}
            index={idx}
            title={sec.title}
            lines={analyzeSection(rawProduct, sec.id)}
          />
        ))}
      </div>
    </section>
  );
}
