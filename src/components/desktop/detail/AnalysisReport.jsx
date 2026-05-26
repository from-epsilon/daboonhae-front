import { Lock } from 'lucide-react';

export function AnalysisReport() {
  return (
    <section className="d-detail-card d-detail-report">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">분석 리포트</h2>
      </header>
      <div className="d-detail-report-locked">
        <div className="d-detail-report-locked-blur" aria-hidden="true">
          <div className="d-detail-report-locked-fake">
            <div className="d-detail-report-locked-bar" style={{ width: '70%' }} />
            <div className="d-detail-report-locked-bar" style={{ width: '50%' }} />
            <div className="d-detail-report-locked-bar" style={{ width: '85%' }} />
            <div className="d-detail-report-locked-bar" style={{ width: '40%' }} />
          </div>
        </div>
        <div className="d-detail-report-locked-overlay">
          <Lock size={24} />
          <span className="d-detail-report-locked-title">준비 중입니다</span>
          <span className="d-detail-report-locked-sub">영양성분 기반 자동 분석 리포트를 준비하고 있어요.</span>
        </div>
      </div>
    </section>
  );
}
