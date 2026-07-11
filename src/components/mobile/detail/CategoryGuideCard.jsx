// 모바일 디테일 — 카테고리 선택 가이드 (구매 고려사항)
// - categoryGuides.js 데이터 기반 (식품유형 name_ko로 조회)
// - 데이터 없으면 렌더 안 함
// - 데스크톱 CategoryGuide와 동일 내용, 모바일 카드 UI로 조정
import { ChevronDown } from 'lucide-react';
import { getCategoryGuide } from '../../../data/categoryGuides.js';
import { IconInfo } from '../../ds/Icons.jsx';
import { useGuideCollapsed } from '../../../hooks/useGuideCollapsed.js';

function GuideReferenceTooltip({ point }) {
  return (
    <span className="m-detail-guide-ref">
      <button type="button" className="m-detail-guide-ref-trigger">
        {point.trigger}
      </button>
      <span className="m-detail-guide-ref-popover" role="tooltip">
        {point.items.map((item) => (
          <span className="m-detail-guide-ref-row" key={item.label}>
            <span className="m-detail-guide-ref-label">{item.label}</span>
            <span className="m-detail-guide-ref-text">{item.text}</span>
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

export function CategoryGuideCard({ category }) {
  const guide = getCategoryGuide(category);
  const [collapsed, toggle] = useGuideCollapsed();
  if (!guide) return null;

  if (category === '닭가슴살') {
    return (
      <section className="m-detail-guide">
        <header className="m-detail-section-head">
          <h2 className="m-detail-section-title">
            <span className="m-detail-guide-ico"><IconInfo size={15} /></span>
            닭가슴살 선택 가이드
          </h2>
          <span className="m-detail-guide-preparing-badge">준비중</span>
        </header>
        <div className="m-detail-guide-preparing" role="status">
          <p className="m-detail-guide-preparing-title">선택 가이드를 준비하고 있어요</p>
          <p className="m-detail-guide-preparing-text">
            단백질 함량과 나트륨, 원재료 구성을 쉽게 확인할 수 있도록 기준을 정리 중입니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="m-detail-guide">
      <header className="m-detail-section-head">
        <button
          type="button"
          className="m-detail-guide-toggle"
          onClick={toggle}
          aria-expanded={!collapsed}
        >
          <h2 className="m-detail-section-title">
            <span className="m-detail-guide-ico"><IconInfo size={15} /></span>
            {category} 선택 가이드
          </h2>
          <ChevronDown size={18} className={collapsed ? '' : 'is-open'} />
        </button>
      </header>

      {!collapsed && (
        <ul className="m-detail-guide-list">
          {guide.considerations.map((c, i) => (
            <li key={i} className="m-detail-guide-item">
              <span className="m-detail-guide-num">{i + 1}</span>
              <div className="m-detail-guide-body">
                <h3 className="m-detail-guide-item-title">{c.title}</h3>
                {Array.isArray(c.points) && c.points.length > 0 ? (
                  <ul className="m-detail-guide-points">
                    {c.points.map((point, j) => (
                      <GuidePoint key={j} point={point} />
                    ))}
                  </ul>
                ) : (
                  <p className="m-detail-guide-item-text">{c.text}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
