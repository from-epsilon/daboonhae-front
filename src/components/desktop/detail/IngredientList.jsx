import { useState } from 'react';
import { Badge } from '../../ds/Badge.jsx';
import { IconAlert } from '../../ds/Icons.jsx';
import { HelpCircle, ChevronDown } from 'lucide-react';

const INGR_INFO = {
  proteinSources: '제품에 사용된 단백질의 원재료. WPI는 유당 제거율이 높고 WPC는 가성비가 좋습니다.',
  sweeteners: '설탕 대신 사용된 감미료. 종류에 따라 혈당 영향과 칼로리가 다릅니다.',
  allergens: '알레르기를 유발할 수 있는 성분. 민감한 경우 반드시 확인하세요.',
  lactose: '유당은 우유에 포함된 당류. 유당불내증이 있다면 유당 free 제품을 선택하세요.',
};

function ChipCol({ label, items, emptyLabel = '없음', info }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="d-detail-ingr-col">
      <div className="d-detail-ingr-col-label">
        {info ? (
          <span className="d-detail-tooltip-wrap">
            <span>{label}</span>
            <HelpCircle size={13} className="d-detail-tooltip-icon" />
            <span className="d-detail-tooltip">{info}</span>
          </span>
        ) : (
          <span>{label}</span>
        )}
      </div>
      <div className="d-detail-ingr-col-values">
        {hasItems ? (
          items.map((it, i) => (
            <Badge key={i} variant="outline">{it}</Badge>
          ))
        ) : (
          <span className="d-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

function LactoseCol({ lactoseFree }) {
  const isFree = lactoseFree === true;
  return (
    <div className="d-detail-ingr-col">
      <div className="d-detail-ingr-col-label">
        <span className="d-detail-tooltip-wrap">
          <span>유당</span>
          <HelpCircle size={13} className="d-detail-tooltip-icon" />
          <span className="d-detail-tooltip">{INGR_INFO.lactose}</span>
        </span>
      </div>
      <div className="d-detail-ingr-col-values">
        {isFree ? (
          <Badge variant="softGreen">유당 free</Badge>
        ) : (
          <Badge variant="outline">유당 포함 가능</Badge>
        )}
      </div>
    </div>
  );
}

function SweetenerNotice({ sweeteners }) {
  if (!sweeteners || sweeteners.length === 0) return null;
  if (!sweeteners.includes('말티톨')) return null;
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

const NUTRI_NOTES = [
  { label: '당알코올', text: '말티톨, 에리스리톨 같은 감미료입니다. 당류는 낮아 보여도 많이 먹으면 배가 불편하거나 설사를 유발할 수 있어요.' },
  { label: '에리스리톨', text: '칼로리가 거의 낮은 당알코올입니다. 비교적 부담은 적지만, 사람에 따라 속이 불편할 수 있어요.' },
  { label: '말티톨', text: '말티톨은 당알코올이지만 혈당과 칼로리 부담이 꽤 있을 수 있어요. \'무설탕\' 제품에서 특히 주의해서 보세요.' },
  { label: 'BCAA', text: '분지쇄아미노산(류신·이소류신·발린). 근합성·회복에 핵심적인 역할을 합니다.' },
];

function NutriNoteList() {
  const [open, setOpen] = useState(false);
  return (
    <div className="d-detail-ingr-notes">
      <button
        type="button"
        className="d-detail-ingr-raw-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>성분 참고 정보</span>
        <ChevronDown size={14} className={`d-detail-ingr-raw-chevron${open ? ' is-open' : ''}`} />
      </button>
      {open && (
        <ul className="d-detail-ingr-notes-list">
          {NUTRI_NOTES.map((n) => (
            <li key={n.label} className="d-detail-ingr-notes-item">
              <span className="d-detail-ingr-notes-label">{n.label}</span>
              <span className="d-detail-ingr-notes-text">{n.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function IngredientList({ ingredients, rawText }) {
  const ing = ingredients ?? {};
  return (
    <section className="d-detail-card d-detail-ingr">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">원재료</h2>
      </header>
      <div className="d-detail-ingr-grid">
        <ChipCol label="단백질 원료" items={ing.proteinSources} info={INGR_INFO.proteinSources} />
        <ChipCol label="대체당" items={ing.sweeteners} emptyLabel="사용 안 함" info={INGR_INFO.sweeteners} />
        <ChipCol label="알레르기 유발 성분" items={ing.allergens} info={INGR_INFO.allergens} />
        <LactoseCol lactoseFree={ing.lactoseFree} />
      </div>
      <SweetenerNotice sweeteners={ing.sweeteners} />
      <NutriNoteList />
      <RawTextToggle rawText={rawText} />
    </section>
  );
}
