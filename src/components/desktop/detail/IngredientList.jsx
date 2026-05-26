// 데스크탑 디테일 — 원료 · 성분 카드 (풀폭, 2~4컬럼 그리드)
// - 단백질 원료 / 대체당 / 알레르겐 / 유당 free 여부
// - 라벨 + Badge·Chip 리스트
// - 말티톨 사용 시 가벼운 안내 (분석 톤과 일치)
import { Badge } from '../../ds/Badge.jsx';
import { IconAlert } from '../../ds/Icons.jsx';

// 라벨 + 칩 리스트 (없으면 안내 문구)
function ChipCol({ label, items, emptyLabel = '없음' }) {
  const hasItems = Array.isArray(items) && items.length > 0;
  return (
    <div className="d-detail-ingr-col">
      <div className="d-detail-ingr-col-label">{label}</div>
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

// 유당 여부 — Yes/No 칩
function LactoseCol({ lactoseFree }) {
  const isFree = lactoseFree === true;
  return (
    <div className="d-detail-ingr-col">
      <div className="d-detail-ingr-col-label">유당</div>
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

// 말티톨 안내 박스
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
        <ChipCol label="단백질 원료" items={ing.proteinSources} />
        <ChipCol label="대체당" items={ing.sweeteners} emptyLabel="사용 안 함" />
        <ChipCol label="알레르겐" items={ing.allergens} />
        <LactoseCol lactoseFree={ing.lactoseFree} />
      </div>
      <SweetenerNotice sweeteners={ing.sweeteners} />
    </section>
  );
}
