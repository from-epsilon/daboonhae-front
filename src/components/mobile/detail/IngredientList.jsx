// 모바일 디테일 — 원료/성분 카드
// - 단백질 원료, 대체당, 알레르겐, 유당 free 여부
// - 각 항목은 Badge 컬럼으로 표시 (없으면 '-' 또는 '없음')
// - 말티톨 사용 시 가벼운 info 박스로 안내 (analyzers의 sugar_warning 로직과 톤 일치)
import { Badge } from '../../ds/Badge.jsx';
import { IconAlert, IconCheck } from '../../ds/Icons.jsx';

// 라벨 + 칩 리스트 (없으면 '없음' 텍스트)
function ChipRow({ label, items, emptyLabel = '없음', variant = 'outline' }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="m-detail-ingr-row">
      <span className="m-detail-ingr-label">{label}</span>
      <div className="m-detail-ingr-values">
        {hasItems ? (
          items.map((it, i) => (
            <Badge key={i} variant={variant}>{it}</Badge>
          ))
        ) : (
          <span className="m-detail-ingr-empty">{emptyLabel}</span>
        )}
      </div>
    </div>
  );
}

// 유당 free 여부 — 라벨 + Yes/No 칩
function LactoseRow({ lactoseFree }) {
  const isFree = lactoseFree === true;
  return (
    <div className="m-detail-ingr-row">
      <span className="m-detail-ingr-label">유당</span>
      <div className="m-detail-ingr-values">
        {isFree ? (
          <Badge variant="softGreen">유당 free</Badge>
        ) : (
          <Badge variant="outline">유당 포함 가능</Badge>
        )}
      </div>
    </div>
  );
}

// 말티톨 사용 시 가벼운 안내 박스
function SweetenerNotice({ sweeteners }) {
  if (!sweeteners || sweeteners.length === 0) return null;
  const hasMaltitol = sweeteners.includes('말티톨');
  if (!hasMaltitol) return null;
  return (
    <div className="m-detail-ingr-notice">
      <IconAlert size={14} />
      <span>말티톨은 다른 대체당보다 혈당 영향이 큰 편이에요.</span>
    </div>
  );
}

export function IngredientList({ ingredients }) {
  const ing = ingredients ?? {};
  return (
    <section className="m-detail-card m-detail-ingr">
      <header className="m-detail-card-head">
        <h2 className="m-detail-card-title">원료 · 성분</h2>
      </header>
      <div className="m-detail-ingr-list">
        <ChipRow
          label="단백질 원료"
          items={ing.proteinSources}
          variant="outline"
        />
        <ChipRow
          label="대체당"
          items={ing.sweeteners}
          emptyLabel="사용 안 함"
          variant="outline"
        />
        <ChipRow
          label="알레르겐"
          items={ing.allergens}
          variant="outline"
        />
        <LactoseRow lactoseFree={ing.lactoseFree} />
      </div>
      <SweetenerNotice sweeteners={ing.sweeteners} />
    </section>
  );
}
