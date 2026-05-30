// 모바일 디테일 — 카테고리 선택 가이드 (구매 고려사항)
// - categoryGuides.js 데이터 기반 (식품유형 name_ko로 조회)
// - 데이터 없으면 렌더 안 함
// - 데스크톱 CategoryGuide와 동일 내용, 모바일 카드 UI로 조정
import { getCategoryGuide } from '../../../data/categoryGuides.js';
import { IconInfo } from '../../ds/Icons.jsx';

export function CategoryGuideCard({ category }) {
  const guide = getCategoryGuide(category);
  if (!guide) return null;

  return (
    <section className="m-detail-guide">
      <header className="m-detail-section-head">
        <h2 className="m-detail-section-title">
          <span className="m-detail-guide-ico"><IconInfo size={15} /></span>
          {category} 선택 가이드
        </h2>
      </header>

      <p className="m-detail-guide-intro">{guide.intro}</p>

      <ul className="m-detail-guide-list">
        {guide.considerations.map((c, i) => (
          <li key={i} className="m-detail-guide-item">
            <span className="m-detail-guide-num">{i + 1}</span>
            <div className="m-detail-guide-body">
              <h3 className="m-detail-guide-item-title">{c.title}</h3>
              <p className="m-detail-guide-item-text">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="m-detail-guide-summary">
        <strong>요약</strong> {guide.summary}
      </div>
    </section>
  );
}
