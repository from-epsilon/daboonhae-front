import { Badge } from '../../ds/Badge.jsx';
import { IconAlert } from '../../ds/Icons.jsx';
import { HelpCircle } from 'lucide-react';

const INGR_INFO = {
  proteinSources: '제품에 사용된 단백질의 원재료. WPI는 유당 제거율이 높고 WPC는 가성비가 좋습니다.',
  sweeteners: '설탕 대신 사용된 감미료. 종류에 따라 혈당 영향과 칼로리가 다릅니다.',
  allergens: '알레르기를 유발할 수 있는 성분. 민감한 경우 반드시 확인하세요.',
  lactose: '유당은 우유에 포함된 당류. 유당불내증이 있다면 유당 free 제품을 선택하세요.',
};

function InfoTooltip({ text }) {
  return (
    <span className="d-detail-tooltip-wrap">
      <HelpCircle size={13} className="d-detail-tooltip-icon" />
      <span className="d-detail-tooltip">{text}</span>
    </span>
  );
}

function ChipCol({ label, items, emptyLabel = '없음', info }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="d-detail-ingr-col">
      <div className="d-detail-ingr-col-label">
        {label}
        {info && <InfoTooltip text={info} />}
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
        유당
        <InfoTooltip text={INGR_INFO.lactose} />
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

export function IngredientList({ ingredients }) {
  const ing = ingredients ?? {};
  return (
    <section className="d-detail-card d-detail-ingr">
      <header className="d-detail-card-head">
        <h2 className="d-detail-card-title">원료 · 성분</h2>
      </header>
      <div className="d-detail-ingr-grid">
        <ChipCol label="단백질 원료" items={ing.proteinSources} info={INGR_INFO.proteinSources} />
        <ChipCol label="대체당" items={ing.sweeteners} emptyLabel="사용 안 함" info={INGR_INFO.sweeteners} />
        <ChipCol label="알레르겐" items={ing.allergens} info={INGR_INFO.allergens} />
        <LactoseCol lactoseFree={ing.lactoseFree} />
      </div>
      <SweetenerNotice sweeteners={ing.sweeteners} />
    </section>
  );
}
