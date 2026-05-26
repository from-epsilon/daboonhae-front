import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { analyzeSection } from '../../../data/analyzers.js';

const DEFAULT_SECTIONS = [
  { id: 'basic_info', title: '기본 영양 정보' },
  { id: 'calorie_sugar', title: '칼로리·당류 분석' },
  { id: 'protein_content', title: '단백질 함량 분석' },
];

function SectionCard({ id, title, rawProduct, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const lines = analyzeSection(rawProduct, id);

  return (
    <article className="d-detail-report-card">
      <button
        type="button"
        className="d-detail-report-card-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`d-detail-report-card-chevron${open ? ' is-open' : ''}`}
        />
      </button>
      {open && (
        <div className="d-detail-report-card-body">
          {lines.length === 0 ? (
            <p className="d-detail-report-card-body is-empty">분석 데이터가 부족합니다.</p>
          ) : (
            <ul className="d-detail-report-card-list">
              {lines.map((line, i) => (
                <li key={i} className="d-detail-report-card-line">{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

export function AnalysisReport({ rawProduct }) {
  return (
    <section className="d-detail-card d-detail-report">
      <header className="d-detail-card-head d-detail-report-head">
        <h2 className="d-detail-card-title d-detail-report-title">분석 리포트</h2>
        <p className="d-detail-report-hint">
          영양성분표를 기반으로 자동 분석한 결과입니다.
        </p>
      </header>
      <div className="d-detail-report-grid">
        {DEFAULT_SECTIONS.map(({ id, title }, i) => (
          <SectionCard
            key={id}
            id={id}
            title={title}
            rawProduct={rawProduct}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </section>
  );
}
