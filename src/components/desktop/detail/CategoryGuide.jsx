import { getCategoryGuide } from '../../../data/categoryGuides.js';

export function CategoryGuide({ category }) {
  const guide = getCategoryGuide(category);
  if (!guide) return null;

  return (
    <section className="d-detail-card d-detail-guide">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">선택 가이드</h2>
      </header>

      <div className="d-detail-guide-hero">
        <p className="d-detail-guide-headline">
          <strong>{category}</strong> 선택 시 고려해야 할 것은 <strong>{guide.count}가지</strong>입니다.
        </p>
        <p className="d-detail-guide-intro">{guide.intro}</p>
      </div>

      <ol className="d-detail-guide-list">
        {guide.considerations.map((c, i) => (
          <li key={i} className="d-detail-guide-item">
            <div className="d-detail-guide-item-num">{i + 1}</div>
            <div className="d-detail-guide-item-body">
              <h3 className="d-detail-guide-item-title">{c.title}</h3>
              <p className="d-detail-guide-item-text">{c.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="d-detail-guide-summary">
        <p className="d-detail-guide-summary-text">{guide.summary}</p>
      </div>
    </section>
  );
}
