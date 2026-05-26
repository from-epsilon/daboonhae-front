import { useState } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconAlert } from '../../ds/Icons.jsx';
import { HelpCircle, ChevronDown } from 'lucide-react';

function ItemWithTooltip({ label, info }) {
  return (
    <span className="d-detail-ingr-item-wrap">
      <Badge variant="outline">
        {label}
        {info ? (
          <span className="d-detail-tooltip-wrap d-detail-tooltip-inline">
            <HelpCircle size={11} className="d-detail-tooltip-icon" />
            <span className="d-detail-tooltip">{info}</span>
          </span>
        ) : (
          <span className="d-detail-tooltip-wrap d-detail-tooltip-inline">
            <HelpCircle size={11} className="d-detail-tooltip-icon" />
            <span className="d-detail-tooltip">추후 정보가 추가될 예정입니다.</span>
          </span>
        )}
      </Badge>
    </span>
  );
}

function IngrSection({ label, items, emptyLabel = '없음' }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="d-detail-ingr-col">
      <div className="d-detail-ingr-col-label">{label}</div>
      <div className="d-detail-ingr-col-values">
        {hasItems ? (
          items.map((it) => (
            <ItemWithTooltip key={typeof it === 'string' ? it : it.label} label={typeof it === 'string' ? it : it.label} info={typeof it === 'string' ? null : it.info} />
          ))
        ) : (
          <span className="d-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

function SweetenerNotice({ sweeteners }) {
  if (!sweeteners || sweeteners.length === 0) return null;
  if (!sweeteners.some((s) => (typeof s === 'string' ? s : s.label) === '말티톨')) return null;
  return (
    <div className="d-detail-ingr-notice">
      <IconAlert size={14} />
      <span>말티톨은 다른 대체당보다 혈당 영향이 큰 편이에요.</span>
    </div>
  );
}

function RawTextToggle({ rawText }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="d-detail-ingr-raw">
      <button
        type="button"
        className="d-detail-ingr-raw-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>원재료명 전체 보기</span>
        <ChevronDown size={14} className={`d-detail-ingr-raw-chevron${open ? ' is-open' : ''}`} />
      </button>
      {open && (
        rawText
          ? <p className="d-detail-ingr-raw-text">{rawText}</p>
          : <p className="d-detail-ingr-raw-text d-detail-ingr-raw-empty">원재료명 정보가 아직 등록되지 않았습니다.</p>
      )}
    </div>
  );
}

export function IngredientList({ ingredients, rawText }) {
  const ing = ingredients ?? {};

  const otherItems = [];
  if (ing.lactoseFree === true) {
    otherItems.push('유당 free');
  } else if (ing.lactoseFree === false) {
    otherItems.push('유당 포함 가능');
  }

  return (
    <section className="d-detail-card d-detail-ingr">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">원재료</h2>
      </header>
      <div className="d-detail-ingr-grid">
        <IngrSection label="단백질 원료" items={ing.proteinSources} />
        <IngrSection label="대체당" items={ing.sweeteners} emptyLabel="사용 안 함" />
        <IngrSection label="알레르기 유발 성분" items={ing.allergens} />
        <IngrSection label="기타" items={otherItems.length > 0 ? otherItems : null} emptyLabel="없음" />
      </div>
      <SweetenerNotice sweeteners={ing.sweeteners} />
      <RawTextToggle rawText={rawText} />
    </section>
  );
}
