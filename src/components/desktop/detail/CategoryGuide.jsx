import { ChevronDown } from 'lucide-react';
import { getCategoryGuide } from '../../../data/categoryGuides.js';
import { useGuideCollapsed } from '../../../hooks/useGuideCollapsed.js';

export function CategoryGuide({ category }) {
  const guide = getCategoryGuide(category);
  const [collapsed, toggle] = useGuideCollapsed();
  if (!guide) return null;

  return (
    <section className="d-detail-card d-detail-guide">
      <header className="d-detail-card-head d-detail-guide-head">
        <button
          type="button"
          className="d-detail-guide-toggle"
          onClick={toggle}
          aria-expanded={!collapsed}
        >
          <span className="d-detail-card-title">선택 가이드</span>
          <ChevronDown size={18} className={collapsed ? '' : 'is-open'} />
        </button>
      </header>

      <div className={`d-detail-guide-collapse${collapsed ? '' : ' is-open'}`}>
        <div className="d-detail-guide-collapse-inner">
          <ol className="d-detail-guide-list">
            {guide.considerations.map((c, i) => (
              <li key={i} className="d-detail-guide-item">
                <div className="d-detail-guide-item-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="d-detail-guide-item-body">
                  <h3 className="d-detail-guide-item-title">{c.title}</h3>
                  {Array.isArray(c.points) && c.points.length > 0 ? (
                    <ul className="d-detail-guide-points">
                      {c.points.map((point, j) => (
                        <li key={j}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="d-detail-guide-item-text">{c.text}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
