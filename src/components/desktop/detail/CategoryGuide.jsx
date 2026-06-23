import { ChevronDown } from 'lucide-react';
import { getCategoryGuide } from '../../../data/categoryGuides.js';
import { useGuideCollapsed } from '../../../hooks/useGuideCollapsed.js';

function GuideReferenceTooltip({ point }) {
  return (
    <span className="d-detail-guide-ref">
      <button type="button" className="d-detail-guide-ref-trigger">
        {point.trigger}
      </button>
      <span className="d-detail-guide-ref-popover" role="tooltip">
        {point.items.map((item) => (
          <span className="d-detail-guide-ref-row" key={item.label}>
            <span className="d-detail-guide-ref-label">{item.label}</span>
            <span className="d-detail-guide-ref-text">{item.text}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

function GuideRichText({ parts }) {
  return parts.map((part, index) => {
    if (typeof part === 'string') return part;
    if (part?.break) return <br key={index} />;
    if (part?.strong) return <strong key={index}>{part.text}</strong>;
    return part?.text || null;
  });
}

function GuidePoint({ point }) {
  if (typeof point === 'string') return <li>{point}</li>;
  if (point?.type === 'richText') {
    return <li><GuideRichText parts={point.parts} /></li>;
  }
  if (point?.type === 'referenceTooltip') {
    return (
      <li>
        {point.text}{' '}
        <GuideReferenceTooltip point={point} />
        {point.suffix || null}
      </li>
    );
  }
  return null;
}

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
                        <GuidePoint key={j} point={point} />
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
